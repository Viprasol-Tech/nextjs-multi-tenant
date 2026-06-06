/**
 * Tenant resolution from an incoming request host.
 *
 * Strategy: a tenant is encoded as the left-most subdomain label of the host,
 * e.g. `acme.example.com` -> tenant slug `acme`. The apex domain
 * (`example.com`), reserved labels (`www`, `app`, ...), and unrelated hosts
 * resolve to `null` so they can fall through to the marketing / root app.
 */

export interface ResolveTenantOptions {
  /**
   * The root domain the app is served from, without protocol or port,
   * e.g. `example.com`. Sub-labels of this domain become tenant slugs.
   */
  baseDomain?: string;
  /**
   * Labels that are never treated as a tenant even when present as a
   * subdomain (marketing site, dashboards, asset hosts, etc.).
   */
  reserved?: string[];
}

export const DEFAULT_BASE_DOMAIN = "example.com";

export const DEFAULT_RESERVED = [
  "www",
  "app",
  "api",
  "admin",
  "static",
  "assets",
  "cdn",
] as const;

/**
 * Strip the port and lower-case a raw `Host` header value.
 * Returns `null` for empty / whitespace-only input.
 */
export function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  // Drop any port suffix (`example.com:3000`) and surrounding whitespace.
  const trimmed = host.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  const withoutPort = trimmed.split(":")[0];
  return withoutPort.length > 0 ? withoutPort : null;
}

/**
 * A slug must be a single DNS label: lowercase alphanumerics and hyphens,
 * not starting or ending with a hyphen.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug);
}

/**
 * Resolve the tenant slug for a given host.
 *
 * Rules:
 *  - `localhost` and bare IP / single-label hosts -> `null`.
 *  - The apex base domain (`example.com`) -> `null`.
 *  - A reserved label (`www.example.com`) -> `null`.
 *  - Exactly one sub-label of the base domain (`acme.example.com`) -> `acme`.
 *  - Deeper hosts (`a.b.example.com`) -> `null` (no nested tenants).
 *  - `<slug>.localhost` is supported for local development.
 *  - Hosts not under the base domain -> `null`.
 */
export function resolveTenant(
  host: string | null | undefined,
  options: ResolveTenantOptions = {},
): string | null {
  const baseDomain = (options.baseDomain ?? DEFAULT_BASE_DOMAIN).toLowerCase();
  const reserved = new Set(
    (options.reserved ?? [...DEFAULT_RESERVED]).map((r) => r.toLowerCase()),
  );

  const normalized = normalizeHost(host);
  if (!normalized) return null;

  // Local development: `acme.localhost` -> `acme`, bare `localhost` -> null.
  if (normalized === "localhost") return null;
  if (normalized.endsWith(".localhost")) {
    const label = normalized.slice(0, -".localhost".length);
    return extractSingleLabel(label, reserved);
  }

  // Bare IPv4 addresses are never tenants.
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) return null;

  // Must be under the configured base domain.
  const suffix = `.${baseDomain}`;
  if (normalized === baseDomain) return null;
  if (!normalized.endsWith(suffix)) return null;

  const prefix = normalized.slice(0, -suffix.length);
  return extractSingleLabel(prefix, reserved);
}

/**
 * Given the portion of the host left of the base domain, return a tenant slug
 * only when it is a single, valid, non-reserved label.
 */
function extractSingleLabel(
  prefix: string,
  reserved: Set<string>,
): string | null {
  if (prefix.length === 0) return null;
  // Reject nested subdomains like `a.b`.
  if (prefix.includes(".")) return null;
  if (!isValidSlug(prefix)) return null;
  if (reserved.has(prefix)) return null;
  return prefix;
}

/** How a tenant was matched against a request host. */
export type TenantSource = "subdomain" | "custom-domain" | "none";

export interface ResolvedTenant {
  /** The tenant slug, or `null` when the host maps to the root app. */
  slug: string | null;
  /** Whether the match came from a subdomain, a custom domain, or nothing. */
  source: TenantSource;
  /** The normalized host the decision was made from (port/case stripped). */
  host: string | null;
}

export interface ResolveTenantRequestOptions extends ResolveTenantOptions {
  /**
   * Map of fully-qualified custom domains (e.g. `acme.com`) to the tenant slug
   * that owns them. Checked before subdomain resolution so a vanity domain
   * wins even if it happens to be a subdomain of the base domain.
   */
  customDomains?: Record<string, string>;
}

/**
 * Resolve a tenant from a host, considering custom (vanity) domains first and
 * falling back to subdomain extraction. Unlike {@link resolveTenant}, this
 * reports *how* the tenant was matched, which the middleware uses for logging
 * and headers.
 *
 * Resolution order:
 *  1. Exact match against a configured custom domain -> `custom-domain`.
 *  2. Subdomain of the base domain -> `subdomain`.
 *  3. Otherwise -> `none` (root / marketing app).
 */
export function resolveTenantRequest(
  host: string | null | undefined,
  options: ResolveTenantRequestOptions = {},
): ResolvedTenant {
  const normalized = normalizeHost(host);
  if (!normalized) return { slug: null, source: "none", host: null };

  const customDomains = options.customDomains ?? {};
  const customSlug = customDomains[normalized];
  if (customSlug && isValidSlug(customSlug)) {
    return { slug: customSlug, source: "custom-domain", host: normalized };
  }

  const subdomainSlug = resolveTenant(normalized, options);
  if (subdomainSlug) {
    return { slug: subdomainSlug, source: "subdomain", host: normalized };
  }

  return { slug: null, source: "none", host: normalized };
}
