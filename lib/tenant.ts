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
