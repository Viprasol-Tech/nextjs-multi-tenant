/**
 * Plan definitions and plan-based gating.
 *
 * Plans are ordered (`free` < `pro` < `enterprise`). Each plan carries a set of
 * capabilities and hard limits. The helpers here let the UI and middleware gate
 * features by plan in a single, well-tested place rather than scattering
 * `if (plan === "enterprise")` checks across the codebase.
 */

export type Plan = "free" | "pro" | "enterprise";

/** Every plan in ascending order of capability. */
export const PLANS: readonly Plan[] = ["free", "pro", "enterprise"] as const;

/** A capability that a plan may or may not unlock. */
export type Capability =
  | "customDomain"
  | "analytics"
  | "apiAccess"
  | "sso"
  | "auditLog"
  | "prioritySupport";

export interface PlanDefinition {
  plan: Plan;
  label: string;
  /** Ascending rank; higher means more capable. */
  rank: number;
  /** Maximum number of seats (team members) allowed. */
  seats: number;
  /** Maximum number of projects/workspaces allowed. */
  projects: number;
  /** Capabilities unlocked at this plan. */
  capabilities: readonly Capability[];
}

export const PLAN_DEFINITIONS: Record<Plan, PlanDefinition> = {
  free: {
    plan: "free",
    label: "Free",
    rank: 0,
    seats: 3,
    projects: 1,
    capabilities: [],
  },
  pro: {
    plan: "pro",
    label: "Pro",
    rank: 1,
    seats: 25,
    projects: 10,
    capabilities: ["customDomain", "analytics", "apiAccess"],
  },
  enterprise: {
    plan: "enterprise",
    label: "Enterprise",
    rank: 2,
    seats: Number.POSITIVE_INFINITY,
    projects: Number.POSITIVE_INFINITY,
    capabilities: [
      "customDomain",
      "analytics",
      "apiAccess",
      "sso",
      "auditLog",
      "prioritySupport",
    ],
  },
};

/** Human-readable label for a plan. */
export function planLabel(plan: Plan): string {
  return PLAN_DEFINITIONS[plan].label;
}

/** Numeric rank for ordering / comparison. */
export function planRank(plan: Plan): number {
  return PLAN_DEFINITIONS[plan].rank;
}

/**
 * Whether `plan` is at least as capable as `required`.
 * `planAtLeast("pro", "free")` -> true; `planAtLeast("free", "pro")` -> false.
 */
export function planAtLeast(plan: Plan, required: Plan): boolean {
  return planRank(plan) >= planRank(required);
}

/** Whether a plan unlocks a given capability. */
export function planHasCapability(plan: Plan, capability: Capability): boolean {
  return PLAN_DEFINITIONS[plan].capabilities.includes(capability);
}

/**
 * The lowest plan that unlocks a capability, or `null` if no plan does.
 * Useful for upgrade prompts ("Custom domains require the Pro plan").
 */
export function minimumPlanFor(capability: Capability): Plan | null {
  for (const plan of PLANS) {
    if (planHasCapability(plan, capability)) return plan;
  }
  return null;
}

/** The numeric limit for a counted resource on a plan. */
export function planLimit(plan: Plan, resource: "seats" | "projects"): number {
  return PLAN_DEFINITIONS[plan][resource];
}

/**
 * Whether `count` of a resource is within the plan's limit (inclusive).
 * Infinite limits always pass.
 */
export function withinPlanLimit(
  plan: Plan,
  resource: "seats" | "projects",
  count: number,
): boolean {
  if (count < 0) return false;
  return count <= planLimit(plan, resource);
}

/** The next plan up, or `null` when already on the top plan. */
export function nextPlan(plan: Plan): Plan | null {
  const idx = PLANS.indexOf(plan);
  return idx >= 0 && idx < PLANS.length - 1 ? PLANS[idx + 1] : null;
}
