import type { Tenant } from "@/lib/tenants";
import { tenantCssVars } from "@/lib/theme";
import { PlanBadge } from "./PlanBadge";

export interface TenantCardProps {
  tenant: Tenant;
}

/**
 * Presentational card rendering a single tenant's branding and plan.
 * Applies the tenant's theme via CSS custom properties so the accent colour is
 * driven by data, not a rebuild. Pure component — easy to unit-test.
 */
export function TenantCard({ tenant }: TenantCardProps) {
  return (
    <section
      aria-label={`Tenant ${tenant.name}`}
      style={tenantCssVars(tenant)}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-block h-10 w-10 rounded-full"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {tenant.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            workspace: <code>{tenant.slug}</code>
          </p>
        </div>
      </div>

      <p className="mt-4 text-slate-700 dark:text-slate-200">{tenant.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PlanBadge plan={tenant.plan} />
        {tenant.customDomains.length > 0 ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {tenant.customDomains.length} custom domain
            {tenant.customDomains.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    </section>
  );
}

export default TenantCard;
