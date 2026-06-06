import { NextResponse, type NextRequest } from "next/server";
import { resolveTenantRequest } from "@/lib/tenant";
import { customDomainMap } from "@/lib/tenants";

/**
 * Rewrites tenant requests onto the shared `/[tenant]` route segment so a
 * single deployment serves every tenant from its own subdomain *or* verified
 * custom domain, while sharing one codebase.
 *
 * Resolution order (see `resolveTenantRequest`):
 *  1. Custom/vanity domains (`acme.com`) -> their owning tenant.
 *  2. Subdomains of the base domain (`acme.example.com`) -> `acme`.
 *  3. Apex / reserved / unknown hosts -> untouched (root marketing app).
 *
 * Matched requests get an `x-tenant` / `x-tenant-source` header so downstream
 * route handlers and Server Components can read the decision without re-parsing
 * the host.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;

  const resolved = resolveTenantRequest(host, {
    ...(baseDomain ? { baseDomain } : {}),
    customDomains: customDomainMap(),
  });

  if (!resolved.slug) {
    return NextResponse.next();
  }

  const slug = resolved.slug;
  const url = request.nextUrl.clone();

  // Avoid double-rewriting if the path already targets this tenant.
  if (url.pathname === `/${slug}` || url.pathname.startsWith(`/${slug}/`)) {
    const passthrough = NextResponse.next();
    passthrough.headers.set("x-tenant", slug);
    passthrough.headers.set("x-tenant-source", resolved.source);
    return passthrough;
  }

  url.pathname = `/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-tenant", slug);
  response.headers.set("x-tenant-source", resolved.source);
  return response;
}

export const config = {
  // Skip Next internals and static assets.
  matcher: ["/((?!_next/|api/|favicon.ico|logo.png|.*\\..*).*)"],
};
