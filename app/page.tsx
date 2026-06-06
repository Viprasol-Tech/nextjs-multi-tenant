import Link from "next/link";
import { listTenants } from "@/lib/tenants";
import { PlanBadge } from "@/components/PlanBadge";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  const tenants = listTenants();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Next.js Multi-Tenant Starter
        </h1>
        <ThemeToggle />
      </div>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Each tenant is served from its own subdomain (e.g.{" "}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
          acme.example.com
        </code>
        ) or a verified custom domain, and rewritten by middleware to the shared{" "}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
          /[tenant]
        </code>{" "}
        route.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-slate-900 dark:text-slate-50">
        Demo tenants
      </h2>
      <ul className="mt-4 grid gap-3">
        {tenants.map((tenant) => (
          <li key={tenant.slug}>
            <Link
              href={`/${tenant.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand"
            >
              <span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {tenant.name}
                </span>
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                  /{tenant.slug}
                </span>
              </span>
              <PlanBadge plan={tenant.plan} />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
