import type { Plan } from "@/lib/plans";
import { planLabel } from "@/lib/plans";

export interface PlanBadgeProps {
  plan: Plan;
}

const PLAN_CLASSES: Record<Plan, string> = {
  free: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  pro: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
  enterprise:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100",
};

/** Small coloured pill showing a tenant's plan. */
export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <span
      data-testid="plan-badge"
      data-plan={plan}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${PLAN_CLASSES[plan]}`}
    >
      {planLabel(plan)}
    </span>
  );
}

export default PlanBadge;
