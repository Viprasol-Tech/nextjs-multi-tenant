/**
 * In-memory tenant store. In a real application this would be backed by a
 * database or an edge config; here it is a deterministic fixture so the
 * resolution and rendering paths can be exercised end-to-end.
 *
 * Each tenant carries:
 *  - a `slug` (its subdomain label),
 *  - an optional list of verified `customDomains`,
 *  - a `plan` driving feature gating (see `lib/plans.ts`),
 *  - a `theme` for per-tenant branding (light + dark),
 *  - explicit per-tenant `features` overrides on top of plan defaults.
 */

import type { Plan, Capability } from "./plans";
import { planHasCapability } from "./plans";

/** A tenant's brand theme. `themeColor` is kept for backwards compatibility. */
export interface TenantTheme {
  /** Primary brand colour (hex). Mirrors the legacy `themeColor` field. */
  primary: string;
  /** Accent colour used for highlights / secondary actions. */
  accent: string;
  /** Background colour for the light scheme. */
  background: string;
  /** Background colour for the dark scheme. */
  backgroundDark: string;
}

/**
 * Feature flags resolved for a tenant. These are the *effective* values after
 * merging plan capabilities with any per-tenant overrides.
 */
export interface TenantFeatures {
  customDomain: boolean;
  analytics: boolean;
  apiAccess: boolean;
  sso: boolean;
  auditLog: boolean;
  prioritySupport: boolean;
}

export interface Tenant {
  slug: string;
  name: string;
  plan: Plan;
  /** @deprecated Use `theme.primary`. Retained for compatibility. */
  themeColor: string;
  theme: TenantTheme;
  tagline: string;
  /** Verified custom domains that also route to this tenant. */
  customDomains: string[];
  /**
   * Explicit feature overrides keyed by capability. A `true`/`false` here wins
   * over the plan default; omit a key to inherit the plan's capability.
   */
  featureOverrides: Partial<Record<Capability, boolean>>;
}

const TENANTS: Record<string, Tenant> = {
  acme: {
    slug: "acme",
    name: "Acme Corp",
    plan: "enterprise",
    themeColor: "#6d28d9",
    theme: {
      primary: "#6d28d9",
      accent: "#a78bfa",
      background: "#f5f3ff",
      backgroundDark: "#1e1b4b",
    },
    tagline: "Anvils, rockets, and questionable physics since 1949.",
    customDomains: ["acme.com", "shop.acme.com"],
    featureOverrides: {},
  },
  globex: {
    slug: "globex",
    name: "Globex Industries",
    plan: "pro",
    themeColor: "#0ea5e9",
    theme: {
      primary: "#0ea5e9",
      accent: "#38bdf8",
      background: "#f0f9ff",
      backgroundDark: "#0c4a6e",
    },
    tagline: "Quietly running the future.",
    customDomains: ["globex.io"],
    // Pro normally lacks SSO; this customer has it bolted on.
    featureOverrides: { sso: true },
  },
  initech: {
    slug: "initech",
    name: "Initech",
    plan: "free",
    themeColor: "#16a34a",
    theme: {
      primary: "#16a34a",
      accent: "#4ade80",
      background: "#f0fdf4",
      backgroundDark: "#14532d",
    },
    tagline: "We put the IT in unIThiable workflows.",
    customDomains: [],
    featureOverrides: {},
  },
};

/** Normalize a domain to a comparable form (lowercase, no trailing dot). */
function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/\.$/, "");
}

/** Look up a tenant by slug. Returns `null` when not found. */
export function getTenant(slug: string): Tenant | null {
  const key = slug.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(TENANTS, key)
    ? TENANTS[key]
    : null;
}

/** Return every known tenant, sorted by slug for stable rendering. */
export function listTenants(): Tenant[] {
  return Object.values(TENANTS).sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Whether a tenant exists for the given slug. */
export function tenantExists(slug: string): boolean {
  return getTenant(slug) !== null;
}

/**
 * Resolve a tenant by one of its verified custom domains. Returns `null` when
 * no tenant claims the domain. Comparison is case-insensitive and
 * trailing-dot-insensitive.
 */
export function getTenantByCustomDomain(domain: string): Tenant | null {
  const target = normalizeDomain(domain);
  if (target.length === 0) return null;
  for (const tenant of Object.values(TENANTS)) {
    if (tenant.customDomains.some((d) => normalizeDomain(d) === target)) {
      return tenant;
    }
  }
  return null;
}

/** A flat map of every custom domain to the slug that owns it. */
export function customDomainMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const tenant of Object.values(TENANTS)) {
    for (const domain of tenant.customDomains) {
      map[normalizeDomain(domain)] = tenant.slug;
    }
  }
  return map;
}

/**
 * Resolve the *effective* feature flags for a tenant: start from the plan's
 * capabilities, then apply per-tenant overrides.
 */
export function resolveFeatures(tenant: Tenant): TenantFeatures {
  const cap = (c: Capability): boolean => {
    const override = tenant.featureOverrides[c];
    return override !== undefined ? override : planHasCapability(tenant.plan, c);
  };
  return {
    customDomain: cap("customDomain"),
    analytics: cap("analytics"),
    apiAccess: cap("apiAccess"),
    sso: cap("sso"),
    auditLog: cap("auditLog"),
    prioritySupport: cap("prioritySupport"),
  };
}

/** Whether a specific feature is enabled for a tenant (plan + overrides). */
export function tenantHasFeature(
  tenant: Tenant,
  feature: keyof TenantFeatures,
): boolean {
  return resolveFeatures(tenant)[feature];
}
