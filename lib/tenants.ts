/**
 * In-memory tenant store. In a real application this would be backed by a
 * database or an edge config; here it is a deterministic fixture so the
 * resolution and rendering paths can be exercised end-to-end.
 */

export interface Tenant {
  slug: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  themeColor: string;
  tagline: string;
}

const TENANTS: Record<string, Tenant> = {
  acme: {
    slug: "acme",
    name: "Acme Corp",
    plan: "enterprise",
    themeColor: "#6d28d9",
    tagline: "Anvils, rockets, and questionable physics since 1949.",
  },
  globex: {
    slug: "globex",
    name: "Globex Industries",
    plan: "pro",
    themeColor: "#0ea5e9",
    tagline: "Quietly running the future.",
  },
  initech: {
    slug: "initech",
    name: "Initech",
    plan: "free",
    themeColor: "#16a34a",
    tagline: "We put the IT in unIThiable workflows.",
  },
};

/** Look up a tenant by slug. Returns `null` when not found. */
export function getTenant(slug: string): Tenant | null {
  const key = slug.toLowerCase();
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
