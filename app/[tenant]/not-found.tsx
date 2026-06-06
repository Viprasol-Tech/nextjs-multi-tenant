import Link from "next/link";

export default function TenantNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
        Tenant not found
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        No workspace exists for this subdomain.
      </p>
      <Link href="/" className="mt-6 inline-block text-brand underline">
        Back to all tenants
      </Link>
    </main>
  );
}
