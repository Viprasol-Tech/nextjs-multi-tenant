import Link from "next/link";
import { listTenants } from "@/lib/tenants";

export default function HomePage() {
  const tenants = listTenants();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        Next.js Multi-Tenant Starter
      </h1>
      <p className="mt-3 text-slate-600">
        Each tenant is served from its own subdomain (e.g.{" "}
        <code className="rounded bg-slate-100 px-1">acme.example.com</code>) and
        rewritten by middleware to the shared{" "}
        <code className="rounded bg-slate-100 px-1">/[tenant]</code> route.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Demo tenants</h2>
      <ul className="mt-4 grid gap-3">
        {tenants.map((tenant) => (
          <li key={tenant.slug}>
            <Link
              href={`/${tenant.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand hover:shadow-sm"
            >
              <span className="font-medium">{tenant.name}</span>
              <span className="ml-2 text-sm text-slate-500">
                /{tenant.slug} · {tenant.plan}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
