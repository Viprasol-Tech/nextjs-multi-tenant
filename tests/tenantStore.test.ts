import { describe, it, expect } from "vitest";
import {
  getTenant,
  getTenantByCustomDomain,
  customDomainMap,
  resolveFeatures,
  tenantHasFeature,
  listTenants,
} from "@/lib/tenants";

describe("custom-domain lookup", () => {
  it("resolves a tenant by an exact custom domain", () => {
    expect(getTenantByCustomDomain("acme.com")?.slug).toBe("acme");
    expect(getTenantByCustomDomain("globex.io")?.slug).toBe("globex");
  });

  it("is case- and trailing-dot-insensitive", () => {
    expect(getTenantByCustomDomain("ACME.com.")?.slug).toBe("acme");
    expect(getTenantByCustomDomain("  Globex.IO ")?.slug).toBe("globex");
  });

  it("returns null for unknown or empty domains", () => {
    expect(getTenantByCustomDomain("unknown.example")).toBeNull();
    expect(getTenantByCustomDomain("")).toBeNull();
  });

  it("builds a flat domain -> slug map", () => {
    const map = customDomainMap();
    expect(map["acme.com"]).toBe("acme");
    expect(map["shop.acme.com"]).toBe("acme");
    expect(map["globex.io"]).toBe("globex");
    // initech has no custom domains
    expect(Object.values(map)).not.toContain("initech");
  });
});

describe("resolveFeatures", () => {
  it("derives features from the plan for a free tenant", () => {
    const initech = getTenant("initech")!;
    const features = resolveFeatures(initech);
    expect(features.customDomain).toBe(false);
    expect(features.analytics).toBe(false);
    expect(features.sso).toBe(false);
  });

  it("derives features from the plan for an enterprise tenant", () => {
    const acme = getTenant("acme")!;
    const features = resolveFeatures(acme);
    expect(features.customDomain).toBe(true);
    expect(features.sso).toBe(true);
    expect(features.auditLog).toBe(true);
    expect(features.prioritySupport).toBe(true);
  });

  it("applies per-tenant overrides on top of the plan", () => {
    // globex is Pro (no SSO by default) but has an SSO override.
    const globex = getTenant("globex")!;
    const features = resolveFeatures(globex);
    expect(features.customDomain).toBe(true); // from Pro plan
    expect(features.sso).toBe(true); // from override
    expect(features.auditLog).toBe(false); // not in Pro, not overridden
  });
});

describe("tenantHasFeature", () => {
  it("returns the effective flag for a single feature", () => {
    expect(tenantHasFeature(getTenant("acme")!, "sso")).toBe(true);
    expect(tenantHasFeature(getTenant("initech")!, "apiAccess")).toBe(false);
    expect(tenantHasFeature(getTenant("globex")!, "sso")).toBe(true);
  });
});

describe("tenant shape", () => {
  it("every tenant carries a theme and customDomains array", () => {
    for (const tenant of listTenants()) {
      expect(tenant.theme.primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(Array.isArray(tenant.customDomains)).toBe(true);
    }
  });

  it("trims whitespace on slug lookup", () => {
    expect(getTenant("  acme  ")?.slug).toBe("acme");
  });
});
