import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TenantCard } from "@/components/TenantCard";
import { getTenant } from "@/lib/tenants";

describe("<TenantCard />", () => {
  it("renders the tenant name, tagline and plan", () => {
    const tenant = getTenant("globex");
    expect(tenant).not.toBeNull();

    render(<TenantCard tenant={tenant!} />);

    expect(
      screen.getByRole("heading", { name: "Globex Industries" }),
    ).toBeInTheDocument();
    expect(screen.getByText(tenant!.tagline)).toBeInTheDocument();
    expect(screen.getByText(/Plan: Pro/)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Tenant Globex Industries" }),
    ).toBeInTheDocument();
  });
});
