import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureList } from "@/components/FeatureList";
import { resolveFeatures, getTenant } from "@/lib/tenants";

describe("<FeatureList />", () => {
  it("renders every feature with an enabled/disabled state", () => {
    const features = resolveFeatures(getTenant("acme")!);
    render(<FeatureList features={features} />);

    const list = screen.getByRole("list", { name: "Tenant features" });
    expect(list).toBeInTheDocument();
    // Six known capabilities.
    expect(list.querySelectorAll("li")).toHaveLength(6);
  });

  it("marks enabled features as enabled and disabled ones as disabled", () => {
    const features = resolveFeatures(getTenant("initech")!); // free plan
    render(<FeatureList features={features} />);

    const customDomain = document.querySelector(
      '[data-feature="customDomain"]',
    );
    expect(customDomain).toHaveAttribute("data-enabled", "false");
  });

  it("reflects per-tenant overrides", () => {
    const features = resolveFeatures(getTenant("globex")!); // Pro + SSO override
    render(<FeatureList features={features} />);
    const sso = document.querySelector('[data-feature="sso"]');
    expect(sso).toHaveAttribute("data-enabled", "true");
  });
});
