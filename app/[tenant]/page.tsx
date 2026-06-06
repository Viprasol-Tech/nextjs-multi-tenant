import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenant, listTenants, resolveFeatures } from "@/lib/tenants";
import { TenantCard } from "@/components/TenantCard";
import { FeatureList } from "@/components/FeatureList";

export function generateStaticParams() {
  return listTenants().map((tenant) => ({ tenant: tenant.slug }));
}

export default function TenantPage({
  params,
}: {
  params: { tenant: string };
}) {
  const tenant = getTenant(params.tenant);
  if (!tenant) {
    notFound();
  }

  const features = resolveFeatures(tenant);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <TenantCard tenant={tenant} />

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Enabled features
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Resolved from the <code>{tenant.plan}</code> plan plus per-tenant
          overrides.
        </p>
        <div className="mt-4">
          <FeatureList features={features} />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <p>
          Rendered from the shared <code>/[tenant]</code> segment.
        </p>
        <Link
          href={`/${tenant.slug}/admin`}
          className="font-medium text-brand underline"
        >
          Admin →
        </Link>
      </div>
    </main>
  );
}
