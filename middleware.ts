import { NextResponse, type NextRequest } from "next/server";
import { resolveTenant } from "@/lib/tenant";

/**
 * Rewrites requests for `<tenant>.<baseDomain>` to the internal
 * `/[tenant]` route segment, so a single deployment serves every tenant
 * from its own subdomain while sharing one codebase.
 *
 * Requests on the apex / reserved subdomains are left untouched and render
 * the root marketing app.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;

  const slug = resolveTenant(host, baseDomain ? { baseDomain } : undefined);
  if (!slug) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // Avoid double-rewriting if the path already targets this tenant.
  if (url.pathname === `/${slug}` || url.pathname.startsWith(`/${slug}/`)) {
    return NextResponse.next();
  }

  url.pathname = `/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and static assets.
  matcher: ["/((?!_next/|api/|favicon.ico|logo.png|.*\\..*).*)"],
};
