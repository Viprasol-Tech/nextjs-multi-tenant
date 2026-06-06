<div align="center">
  <img src="docs/assets/logo.png" alt="Viprasol Tech" width="120" />

  <h1>nextjs-multi-tenant</h1>

  <p><strong>Production-shaped multi-tenant SaaS starter for the Next.js App Router — subdomains, custom domains, per-tenant theming, feature flags, and plan-based gating.</strong></p>

  <p><em>Built and maintained by Viprasol Tech</em></p>

  <p>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green.svg" /></a>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js" /></a>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg?logo=typescript" /></a>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant"><img alt="Tests" src="https://img.shields.io/badge/tests-70%20passing-brightgreen.svg" /></a>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant"><img alt="Version" src="https://img.shields.io/badge/version-0.2.0-blue.svg" /></a>
  </p>
</div>

---

A minimal-but-real starting point for building a multi-tenant SaaS on the
Next.js App Router. Every tenant gets its own subdomain (`acme.example.com`)
**or** a verified custom domain (`acme.com`), and a single Edge middleware
rewrites the request onto a shared `/[tenant]` route segment — no duplicated
pages, one deployment. Tenants carry their own theme, plan, and feature flags,
all resolved through small, fully-tested library functions.

## ✨ Features

- 🌐 **Subdomain + custom-domain resolution** — `resolveTenantRequest(host)`
  matches verified vanity domains first, then falls back to subdomain
  extraction, and tells you *how* it matched (`custom-domain` / `subdomain` /
  `none`). Apex, reserved labels, IPs, and `*.localhost` are all handled.
- 🧭 **Richer Edge middleware** — transparently maps tenant hosts to
  `/[tenant]/...` and stamps `x-tenant` / `x-tenant-source` headers for
  downstream handlers.
- 🎨 **Per-tenant theming** — each tenant defines light/dark brand colours that
  flow into the UI via CSS custom properties (`lib/theme.ts`), plus WCAG
  luminance helpers for readable foregrounds.
- 🚩 **Feature flags** — effective flags are resolved from the plan's
  capabilities *plus* per-tenant overrides (`resolveFeatures`).
- 💳 **Plan-based gating** — ordered plans (`free` < `pro` < `enterprise`) with
  seat/project limits and helpers (`planAtLeast`, `planHasCapability`,
  `minimumPlanFor`, `withinPlanLimit`).
- 🛠️ **Tenant admin page** — plan, limits, effective features, custom domains,
  and an upgrade prompt at `/[tenant]/admin`.
- 🌙 **Dark mode** — class-based Tailwind dark mode with a persisted
  `ThemeToggle`.
- ✅ **Typed and tested** — strict TypeScript and **70** vitest + Testing
  Library tests across resolution, plans, theming, the store, and components.

## 🚀 Quickstart

```bash
npm install
npm run dev
```

Then visit:

- `http://localhost:3000` — the root app listing the demo tenants.
- `http://acme.localhost:3000` — the Acme tenant workspace (subdomain rewrite).
- `http://acme.localhost:3000/admin` — the tenant admin panel.

> Tip: most browsers resolve `*.localhost` to `127.0.0.1` automatically. If
> yours does not, add entries to your hosts file. Custom (vanity) domains are
> configured per-tenant in `lib/tenants.ts`.

### Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Next.js dev server.        |
| `npm run build`     | Production build.                    |
| `npm start`         | Run the production server.           |
| `npm run typecheck` | `tsc --noEmit` strict type check.    |
| `npm test`          | Run the vitest suite.                |

## 📦 What's included

```
app/
  layout.tsx            Root layout + global styles
  page.tsx              Root marketing page (tenant list + theme toggle)
  [tenant]/
    page.tsx            Shared per-tenant page (card + features)
    not-found.tsx       Unknown-tenant state
    admin/page.tsx      Tenant admin: plan, limits, features, domains
components/
  TenantCard.tsx        Themed tenant card (render-tested)
  PlanBadge.tsx         Plan pill (render-tested)
  FeatureList.tsx       Effective feature flags (render-tested)
  ThemeToggle.tsx       Persisted light/dark toggle
lib/
  tenant.ts             resolveTenant() + resolveTenantRequest() + host helpers
  tenants.ts            Tenant store: theme, custom domains, feature overrides
  plans.ts              Plans, capabilities, limits, gating helpers
  theme.ts              CSS-var theming + WCAG colour helpers
middleware.ts           Subdomain/custom-domain -> /[tenant] rewrite + headers
tests/                  vitest unit + component tests (70)
```

### How resolution works

```ts
import { resolveTenantRequest } from "@/lib/tenant";

const customDomains = { "acme.com": "acme", "globex.io": "globex" };

resolveTenantRequest("acme.com", { customDomains });
// { slug: "acme", source: "custom-domain", host: "acme.com" }

resolveTenantRequest("foo.example.com", { customDomains });
// { slug: "foo", source: "subdomain", host: "foo.example.com" }

resolveTenantRequest("www.example.com", { customDomains });
// { slug: null, source: "none", host: "www.example.com" }
```

### How gating works

```ts
import { planHasCapability, withinPlanLimit } from "@/lib/plans";
import { resolveFeatures, getTenant } from "@/lib/tenants";

planHasCapability("pro", "customDomain"); // true
planHasCapability("free", "sso");         // false
withinPlanLimit("free", "seats", 4);      // false (free caps at 3)

const features = resolveFeatures(getTenant("globex")!);
features.sso; // true — Pro plan + a per-tenant override
```

Swap `lib/tenants.ts` for a database, KV, or edge-config lookup to make it
real — the resolution, plan, and theming layers stay the same.

## 🖼️ Screenshots

The root page lists every tenant with a plan badge and a light/dark toggle;
each tenant route renders its themed card and effective feature flags, with an
admin panel at `/[tenant]/admin`. Run `npm run dev` to explore locally.

## 🗺️ Roadmap

- [x] Subdomain tenant resolution
- [x] Custom-domain resolution alongside subdomains
- [x] Per-tenant theming (light + dark)
- [x] Feature flags with per-tenant overrides
- [x] Plan-based gating with limits
- [x] Tenant admin page
- [ ] Database-backed tenant store adapter
- [ ] Tenant onboarding / self-serve domain verification flow
- [ ] Per-tenant auth + session isolation

## ❓ FAQ

**Does a custom domain or a subdomain win?**
Custom domains are checked first. If a host exactly matches a verified custom
domain it resolves there; otherwise subdomain extraction runs.

**How do I add a tenant?**
Add an entry to `TENANTS` in `lib/tenants.ts` with its slug, plan, theme,
`customDomains`, and any `featureOverrides`. Everything else (routing, admin,
gating) picks it up automatically.

**Can a Pro tenant get an Enterprise-only feature?**
Yes — set a `featureOverrides` entry on that tenant. Overrides win over the
plan default (see the `globex` SSO example).

**Why don't reserved subdomains (www, app, api) resolve to a tenant?**
They are intentionally excluded so the apex/marketing app and infrastructure
hosts are never mistaken for a tenant. The list is configurable.

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss substantial changes
first, then submit a pull request. Run `npm run typecheck` and `npm test`
before pushing.

## Contact — Viprasol Tech Private Limited

- Website: [viprasol.com](https://viprasol.com)
- Email: [support@viprasol.com](mailto:support@viprasol.com)
- Telegram: [t.me/viprasol_help](https://t.me/viprasol_help) | WhatsApp: +91 96336 52112
- GitHub: [@Viprasol-Tech](https://github.com/Viprasol-Tech) | [LinkedIn](https://www.linkedin.com/in/viprasol/) | X [@viprasol](https://twitter.com/viprasol)

## License

[MIT](LICENSE) (c) 2025 Viprasol Tech Private Limited
