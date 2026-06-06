<div align="center">
  <img src="docs/assets/logo.png" alt="Viprasol Tech" width="120" />

  <h1>nextjs-multi-tenant</h1>

  <p><strong>Next.js multi-tenant starter — subdomain/path tenant resolution with middleware.</strong></p>

  <p><em>Built and maintained by Viprasol Tech</em></p>

  <p>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green.svg" /></a>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js" /></a>
    <a href="https://github.com/Viprasol-Tech/nextjs-multi-tenant"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg?logo=typescript" /></a>
  </p>
</div>

---

A minimal, production-shaped starting point for building a multi-tenant SaaS on
the Next.js App Router. Each tenant gets its own subdomain
(`acme.example.com`), and a single Edge middleware rewrites the request onto a
shared `/[tenant]` route segment — no duplicated pages, one deployment.

## Features

- **Subdomain tenant resolution** — `resolveTenant(host)` extracts the tenant
  slug from the request host, with apex, reserved-label, IP, and `*.localhost`
  handling baked in.
- **Edge middleware rewrites** — `middleware.ts` transparently maps
  `tenant.example.com/...` to `/[tenant]/...` while leaving the apex /
  marketing site untouched.
- **Shared tenant route** — `app/[tenant]/page.tsx` renders per-tenant
  branding from a pluggable tenant store, with a proper not-found state.
- **Configurable** — point it at any root domain via `NEXT_PUBLIC_BASE_DOMAIN`;
  override the reserved-label list per call.
- **Typed and tested** — strict TypeScript, unit tests for the resolution and
  store logic, and a component render test (vitest + Testing Library).
- **Tailwind CSS** — preconfigured for styling out of the box.

## Quickstart

```bash
npm install
npm run dev
```

Then visit:

- `http://localhost:3000` — the root app listing the demo tenants.
- `http://acme.localhost:3000` — the Acme tenant workspace (subdomain rewrite).

> Tip: most browsers resolve `*.localhost` to `127.0.0.1` automatically. If
> yours does not, add entries to your hosts file.

### Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Next.js dev server.        |
| `npm run build`     | Production build.                    |
| `npm start`         | Run the production server.           |
| `npm run typecheck` | `tsc --noEmit` strict type check.    |
| `npm test`          | Run the vitest suite.                |

## What's included

```
app/
  layout.tsx          Root layout + global styles
  page.tsx            Root marketing page listing tenants
  [tenant]/
    page.tsx          Shared per-tenant page
    not-found.tsx     Unknown-tenant state
components/
  TenantCard.tsx      Presentational tenant card (render-tested)
lib/
  tenant.ts           resolveTenant() + host normalization helpers
  tenants.ts          In-memory tenant store (getTenant / listTenants)
middleware.ts         Subdomain -> /[tenant] rewrite
tests/                vitest unit + component tests
```

### How resolution works

```ts
resolveTenant("acme.example.com"); // "acme"
resolveTenant("www.example.com");  // null  (reserved)
resolveTenant("example.com");      // null  (apex)
resolveTenant("acme.localhost");   // "acme" (local dev)
resolveTenant("a.b.example.com");  // null  (no nested tenants)
```

Swap `lib/tenants.ts` for a database, KV, or edge-config lookup to make it
real — the resolution layer and middleware stay the same.

## Contributing

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
