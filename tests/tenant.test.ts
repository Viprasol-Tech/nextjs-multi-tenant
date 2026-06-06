import { describe, it, expect } from "vitest";
import {
  resolveTenant,
  normalizeHost,
  isValidSlug,
} from "@/lib/tenant";

describe("normalizeHost", () => {
  it("strips port and lowercases", () => {
    expect(normalizeHost("Foo.Example.com:3000")).toBe("foo.example.com");
  });

  it("returns null for empty / nullish", () => {
    expect(normalizeHost("")).toBeNull();
    expect(normalizeHost("   ")).toBeNull();
    expect(normalizeHost(null)).toBeNull();
    expect(normalizeHost(undefined)).toBeNull();
  });
});

describe("isValidSlug", () => {
  it("accepts simple labels and hyphenated labels", () => {
    expect(isValidSlug("acme")).toBe(true);
    expect(isValidSlug("acme-corp")).toBe(true);
    expect(isValidSlug("a1b2")).toBe(true);
  });

  it("rejects leading/trailing hyphens and invalid chars", () => {
    expect(isValidSlug("-acme")).toBe(false);
    expect(isValidSlug("acme-")).toBe(false);
    expect(isValidSlug("ac me")).toBe(false);
    expect(isValidSlug("ac.me")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});

describe("resolveTenant", () => {
  it("extracts a single subdomain as the tenant slug", () => {
    expect(resolveTenant("foo.example.com")).toBe("foo");
    expect(resolveTenant("acme-corp.example.com")).toBe("acme-corp");
  });

  it("ignores port and casing", () => {
    expect(resolveTenant("Foo.Example.com:8080")).toBe("foo");
  });

  it("returns null for www and apex", () => {
    expect(resolveTenant("www.example.com")).toBeNull();
    expect(resolveTenant("example.com")).toBeNull();
  });

  it("returns null for other reserved labels", () => {
    expect(resolveTenant("app.example.com")).toBeNull();
    expect(resolveTenant("api.example.com")).toBeNull();
    expect(resolveTenant("admin.example.com")).toBeNull();
  });

  it("returns null for nested subdomains", () => {
    expect(resolveTenant("a.b.example.com")).toBeNull();
  });

  it("returns null for hosts outside the base domain", () => {
    expect(resolveTenant("foo.other.com")).toBeNull();
    expect(resolveTenant("example.org")).toBeNull();
  });

  it("handles localhost variants", () => {
    expect(resolveTenant("localhost")).toBeNull();
    expect(resolveTenant("localhost:3000")).toBeNull();
    expect(resolveTenant("acme.localhost")).toBe("acme");
    expect(resolveTenant("acme.localhost:3000")).toBe("acme");
    expect(resolveTenant("www.localhost")).toBeNull();
  });

  it("returns null for bare IP addresses", () => {
    expect(resolveTenant("127.0.0.1")).toBeNull();
    expect(resolveTenant("192.168.0.10:3000")).toBeNull();
  });

  it("returns null for null/empty host", () => {
    expect(resolveTenant(null)).toBeNull();
    expect(resolveTenant("")).toBeNull();
  });

  it("respects a custom base domain", () => {
    expect(resolveTenant("foo.acme.io", { baseDomain: "acme.io" })).toBe("foo");
    expect(resolveTenant("foo.example.com", { baseDomain: "acme.io" })).toBeNull();
  });

  it("respects a custom reserved list", () => {
    expect(
      resolveTenant("docs.example.com", { reserved: ["docs"] }),
    ).toBeNull();
    // default-reserved label is no longer reserved with a custom list
    expect(resolveTenant("www.example.com", { reserved: ["docs"] })).toBe("www");
  });
});
