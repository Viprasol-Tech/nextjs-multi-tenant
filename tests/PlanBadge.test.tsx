import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanBadge } from "@/components/PlanBadge";

describe("<PlanBadge />", () => {
  it("renders the plan label", () => {
    render(<PlanBadge plan="enterprise" />);
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("exposes the plan via a data attribute", () => {
    render(<PlanBadge plan="pro" />);
    const badge = screen.getByTestId("plan-badge");
    expect(badge).toHaveAttribute("data-plan", "pro");
    expect(badge).toHaveTextContent("Pro");
  });

  it("uses distinct styling per plan", () => {
    const { rerender } = render(<PlanBadge plan="free" />);
    const free = screen.getByTestId("plan-badge").className;
    rerender(<PlanBadge plan="enterprise" />);
    const enterprise = screen.getByTestId("plan-badge").className;
    expect(free).not.toBe(enterprise);
  });
});
