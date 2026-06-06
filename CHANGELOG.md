# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [SemVer](https://semver.org/).

## [0.2.0] - 2025

### Added
- **Custom-domain resolution** — `resolveTenantRequest()` matches verified vanity
  domains (`acme.com`) before falling back to subdomain extraction, and reports
  how the tenant was matched (`custom-domain` | `subdomain` | `none`).
- **Plan model & gating** (`lib/plans.ts`) — ordered plans with capabilities,
  seat/project limits, and helpers: `planAtLeast`, `planHasCapability`,
  `minimumPlanFor`, `withinPlanLimit`, `nextPlan`.
- **Richer tenant store** — per-tenant `theme` (light + dark), `customDomains`,
  and `featureOverrides`. New helpers `getTenantByCustomDomain`,
  `customDomainMap`, `resolveFeatures`, and `tenantHasFeature`.
- **Theming utilities** (`lib/theme.ts`) — `themeToCssVars`, `tenantCssVars`,
  hex parsing, WCAG `relativeLuminance`, and `readableForeground`.
- **Tenant admin page** (`app/[tenant]/admin`) — plan, limits, effective
  features, custom domains, and an upgrade prompt.
- **Components** — `PlanBadge`, `FeatureList`, and a `ThemeToggle` (persisted
  light/dark) with dark-mode styling across all pages.
- **Richer middleware** — custom-domain-aware rewrites that set `x-tenant` and
  `x-tenant-source` headers.

### Changed
- `TenantCard` now renders the tenant theme via CSS variables, a `PlanBadge`,
  and a custom-domain count, with full dark-mode support.
- Tailwind `darkMode: "class"` enabled.

### Tests
- Roughly doubled the suite (33 -> 70): added unit tests for plans, theming,
  custom-domain resolution, and the enhanced tenant store, plus render tests for
  `PlanBadge` and `FeatureList`.

## [0.1.0] - 2025

### Added
- Initial release of nextjs-multi-tenant: Next.js multi-tenant starter — subdomain/path tenant resolution with middleware.
