import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenant, listTenants, resolveFeatures } from "@/lib/tenants";
import { FeatureList } from "@/components/FeatureList";
import { PlanBadge } from "@/components/PlanBadge";
import {
  PLAN_DEFINITIONS,
  nextPlan,
  planLimit,
  minimumPlanFor,
  planLabel,
} from "@/lib/plans";

export function generateStaticParams() {
  return listTenants().map((tenant) => ({ tenant: tenant.slug }));
}

export default function TenantAdminPage({
  params,
}: {
  params: { tenant: string };
}) {
  const tenant = getTenant(params.tenant);
  if (!tenant) {
    notFound();
  }

  const features = resolveFeatures(tenant);
  const def = PLAN_DEFINITIONS[tenant.plan];
  const upgrade = nextPlan(tenant.plan);

  const fmtLimit = (n: number) => (Number.isFinite(n) ? String(n) : "Unlimited");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {tenant.name} · Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Workspace settings for <code>{tenant.slug}</code>.
          </p>
        </div>
        <PlanBadge plan={tenant.plan} />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">Plan</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {planLabel(tenant.plan)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">Seats</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {fmtLimit(planLimit(tenant.plan, "seats"))}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Projects
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {fmtLimit(def.projects)}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Features
        </h2>
        <div className="mt-4">
          <FeatureList features={features} />
        </div>
        {!features.customDomain ? (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            Custom domains require the{" "}
            {planLabel(minimumPlanFor("customDomain") ?? "pro")} plan.
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Custom domains
        </h2>
        {tenant.customDomains.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {tenant.customDomains.map((domain) => (
              <li
                key={domain}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
              >
                <code className="text-slate-800 dark:text-slate-100">
                  {domain}
                </code>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-100">
                  verified
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            No custom domains configured.
          </p>
        )}
      </section>

      {upgrade ? (
        <section className="mt-8 rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950">
          <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
            Upgrade to {planLabel(upgrade)}
          </h2>
          <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
            Unlock more seats, projects, and capabilities.
          </p>
        </section>
      ) : null}

      <p className="mt-8 text-sm">
        <Link href={`/${tenant.slug}`} className="text-brand underline">
          ← Back to {tenant.name}
        </Link>
      </p>
    </main>
  );
}
