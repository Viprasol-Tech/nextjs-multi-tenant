import type { TenantFeatures } from "@/lib/tenants";

export interface FeatureListProps {
  features: TenantFeatures;
}

const FEATURE_LABELS: Record<keyof TenantFeatures, string> = {
  customDomain: "Custom domain",
  analytics: "Analytics",
  apiAccess: "API access",
  sso: "Single sign-on",
  auditLog: "Audit log",
  prioritySupport: "Priority support",
};

const FEATURE_ORDER: readonly (keyof TenantFeatures)[] = [
  "customDomain",
  "analytics",
  "apiAccess",
  "sso",
  "auditLog",
  "prioritySupport",
];

/**
 * Renders the effective feature flags for a tenant, each marked enabled or
 * disabled. Pure and render-testable.
 */
export function FeatureList({ features }: FeatureListProps) {
  return (
    <ul aria-label="Tenant features" className="grid gap-2 sm:grid-cols-2">
      {FEATURE_ORDER.map((key) => {
        const enabled = features[key];
        return (
          <li
            key={key}
            data-feature={key}
            data-enabled={enabled}
            className="flex items-center gap-2 text-sm"
          >
            <span aria-hidden="true">{enabled ? "✅" : "⬜"}</span>
            <span
              className={
                enabled
                  ? "text-slate-800 dark:text-slate-100"
                  : "text-slate-400 line-through dark:text-slate-500"
              }
            >
              {FEATURE_LABELS[key]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default FeatureList;
