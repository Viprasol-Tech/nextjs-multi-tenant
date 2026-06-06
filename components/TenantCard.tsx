import type { Tenant } from "@/lib/tenants";

export interface TenantCardProps {
  tenant: Tenant;
}

const PLAN_LABEL: Record<Tenant["plan"], string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

/**
 * Presentational card rendering a single tenant's branding and plan.
 * Pure component — easy to unit-test with a render test.
 */
export function TenantCard({ tenant }: TenantCardProps) {
  return (
    <section
      aria-label={`Tenant ${tenant.name}`}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-block h-10 w-10 rounded-full"
          style={{ backgroundColor: tenant.themeColor }}
        />
        <div>
          <h1 className="text-xl font-bold">{tenant.name}</h1>
          <p className="text-sm text-slate-500">
            workspace: <code>{tenant.slug}</code>
          </p>
        </div>
      </div>

      <p className="mt-4 text-slate-700">{tenant.tagline}</p>

      <p className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
        Plan: {PLAN_LABEL[tenant.plan]}
      </p>
    </section>
  );
}

export default TenantCard;
