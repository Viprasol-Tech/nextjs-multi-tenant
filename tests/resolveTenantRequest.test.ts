import { describe, it, expect } from "vitest";
import { resolveTenantRequest } from "@/lib/tenant";

const customDomains = {
  "acme.com": "acme",
  "shop.acme.com": "acme",
  "globex.io": "globex",
};

describe("resolveTenantRequest", () => {
  it("matches a custom domain first and reports the source", () => {
    expect(resolveTenantRequest("acme.com", { customDomains })).toEqual({
      slug: "acme",
      source: "custom-domain",
      host: "acme.com",
    });
  });

  it("matches a multi-label custom domain", () => {
    const r = resolveTenantRequest("shop.acme.com", { customDomains });
    expect(r.slug).toBe("acme");
    expect(r.source).toBe("custom-domain");
  });

  it("falls back to subdomain resolution", () => {
    const r = resolveTenantRequest("foo.example.com", { customDomains });
    expect(r.slug).toBe("foo");
    expect(r.source).toBe("subdomain");
  });

  it("strips port and lowercases before matching custom domains", () => {
    const r = resolveTenantRequest("ACME.com:443", { customDomains });
    expect(r.slug).toBe("acme");
    expect(r.source).toBe("custom-domain");
    expect(r.host).toBe("acme.com");
  });

  it("returns none for the apex base domain", () => {
    expect(resolveTenantRequest("example.com", { customDomains })).toEqual({
      slug: null,
      source: "none",
      host: "example.com",
    });
  });

  it("returns none for reserved subdomains", () => {
    const r = resolveTenantRequest("www.example.com", { customDomains });
    expect(r.slug).toBeNull();
    expect(r.source).toBe("none");
  });

  it("returns none for an unrelated host with no custom-domain match", () => {
    const r = resolveTenantRequest("random.other.net", { customDomains });
    expect(r.slug).toBeNull();
    expect(r.source).toBe("none");
  });

  it("handles nullish / empty hosts", () => {
    expect(resolveTenantRequest(null, { customDomains })).toEqual({
      slug: null,
      source: "none",
      host: null,
    });
    expect(resolveTenantRequest("", { customDomains }).source).toBe("none");
  });

  it("works without any custom domains configured", () => {
    const r = resolveTenantRequest("acme.example.com");
    expect(r.slug).toBe("acme");
    expect(r.source).toBe("subdomain");
  });

  it("ignores a custom-domain entry with an invalid slug", () => {
    const r = resolveTenantRequest("bad.com", {
      customDomains: { "bad.com": "not a slug" },
    });
    expect(r.slug).toBeNull();
    expect(r.source).toBe("none");
  });

  it("honours a custom base domain in fallback", () => {
    const r = resolveTenantRequest("foo.acme.io", { baseDomain: "acme.io" });
    expect(r.slug).toBe("foo");
    expect(r.source).toBe("subdomain");
  });
});
