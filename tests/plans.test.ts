import { describe, it, expect } from "vitest";
import {
  PLANS,
  PLAN_DEFINITIONS,
  planLabel,
  planRank,
  planAtLeast,
  planHasCapability,
  minimumPlanFor,
  planLimit,
  withinPlanLimit,
  nextPlan,
} from "@/lib/plans";

describe("plan ordering", () => {
  it("lists plans ascending by rank", () => {
    expect(PLANS).toEqual(["free", "pro", "enterprise"]);
    expect(planRank("free")).toBeLessThan(planRank("pro"));
    expect(planRank("pro")).toBeLessThan(planRank("enterprise"));
  });

  it("labels each plan", () => {
    expect(planLabel("free")).toBe("Free");
    expect(planLabel("pro")).toBe("Pro");
    expect(planLabel("enterprise")).toBe("Enterprise");
  });
});

describe("planAtLeast", () => {
  it("is true when plan meets or exceeds the requirement", () => {
    expect(planAtLeast("pro", "free")).toBe(true);
    expect(planAtLeast("pro", "pro")).toBe(true);
    expect(planAtLeast("enterprise", "pro")).toBe(true);
  });

  it("is false when plan is below the requirement", () => {
    expect(planAtLeast("free", "pro")).toBe(false);
    expect(planAtLeast("pro", "enterprise")).toBe(false);
  });
});

describe("planHasCapability", () => {
  it("gates capabilities by plan", () => {
    expect(planHasCapability("free", "customDomain")).toBe(false);
    expect(planHasCapability("pro", "customDomain")).toBe(true);
    expect(planHasCapability("pro", "sso")).toBe(false);
    expect(planHasCapability("enterprise", "sso")).toBe(true);
  });
});

describe("minimumPlanFor", () => {
  it("returns the lowest plan unlocking a capability", () => {
    expect(minimumPlanFor("customDomain")).toBe("pro");
    expect(minimumPlanFor("analytics")).toBe("pro");
    expect(minimumPlanFor("sso")).toBe("enterprise");
    expect(minimumPlanFor("auditLog")).toBe("enterprise");
  });
});

describe("plan limits", () => {
  it("reports finite limits for free / pro", () => {
    expect(planLimit("free", "seats")).toBe(3);
    expect(planLimit("free", "projects")).toBe(1);
    expect(planLimit("pro", "seats")).toBe(25);
  });

  it("reports infinite limits for enterprise", () => {
    expect(planLimit("enterprise", "seats")).toBe(Number.POSITIVE_INFINITY);
    expect(PLAN_DEFINITIONS.enterprise.projects).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it("checks counts against limits", () => {
    expect(withinPlanLimit("free", "seats", 3)).toBe(true);
    expect(withinPlanLimit("free", "seats", 4)).toBe(false);
    expect(withinPlanLimit("enterprise", "seats", 10_000)).toBe(true);
    expect(withinPlanLimit("free", "seats", -1)).toBe(false);
  });
});

describe("nextPlan", () => {
  it("advances to the next plan", () => {
    expect(nextPlan("free")).toBe("pro");
    expect(nextPlan("pro")).toBe("enterprise");
  });

  it("returns null at the top plan", () => {
    expect(nextPlan("enterprise")).toBeNull();
  });
});
