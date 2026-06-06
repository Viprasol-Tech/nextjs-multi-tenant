import { notFound } from "next/navigation";
import { getTenant, listTenants } from "@/lib/tenants";
import { TenantCard } from "@/components/TenantCard";

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

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <TenantCard tenant={tenant} />
      <p className="mt-8 text-sm text-slate-500">
        Rendered from the shared <code>/[tenant]</code> segment.
      </p>
    </main>
  );
}
