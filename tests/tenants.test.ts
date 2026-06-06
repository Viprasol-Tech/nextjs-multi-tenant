import { describe, it, expect } from "vitest";
import { getTenant, listTenants, tenantExists } from "@/lib/tenants";

describe("tenant store", () => {
  it("looks up a known tenant", () => {
    const tenant = getTenant("acme");
    expect(tenant).not.toBeNull();
    expect(tenant?.name).toBe("Acme Corp");
    expect(tenant?.plan).toBe("enterprise");
  });

  it("is case-insensitive on lookup", () => {
    expect(getTenant("ACME")?.slug).toBe("acme");
  });

  it("returns null for an unknown tenant", () => {
    expect(getTenant("does-not-exist")).toBeNull();
    expect(tenantExists("does-not-exist")).toBe(false);
  });

  it("reports existence for known tenants", () => {
    expect(tenantExists("globex")).toBe(true);
  });

  it("lists tenants sorted by slug", () => {
    const slugs = listTenants().map((t) => t.slug);
    expect(slugs).toEqual([...slugs].sort());
    expect(slugs).toContain("acme");
    expect(slugs.length).toBeGreaterThanOrEqual(3);
  });
});
