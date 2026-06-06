import { describe, it, expect } from "vitest";
import {
  THEME_VARS,
  themeToCssVars,
  tenantCssVars,
  parseHexColor,
  relativeLuminance,
  readableForeground,
} from "@/lib/theme";
import { getTenant } from "@/lib/tenants";
import type { TenantTheme } from "@/lib/tenants";

const theme: TenantTheme = {
  primary: "#6d28d9",
  accent: "#a78bfa",
  background: "#ffffff",
  backgroundDark: "#000000",
};

describe("themeToCssVars", () => {
  it("emits primary/accent and the light background by default", () => {
    const vars = themeToCssVars(theme);
    expect(vars[THEME_VARS.primary]).toBe("#6d28d9");
    expect(vars[THEME_VARS.accent]).toBe("#a78bfa");
    expect(vars[THEME_VARS.background]).toBe("#ffffff");
  });

  it("uses the dark background for the dark scheme", () => {
    const vars = themeToCssVars(theme, "dark");
    expect(vars[THEME_VARS.background]).toBe("#000000");
  });
});

describe("tenantCssVars", () => {
  it("reads the theme off a tenant", () => {
    const acme = getTenant("acme")!;
    const vars = tenantCssVars(acme);
    expect(vars[THEME_VARS.primary]).toBe(acme.theme.primary);
  });
});

describe("parseHexColor", () => {
  it("parses long form", () => {
    expect(parseHexColor("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHexColor("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parses short form", () => {
    expect(parseHexColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHexColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid input", () => {
    expect(parseHexColor("white")).toBeNull();
    expect(parseHexColor("#xyz")).toBeNull();
    expect(parseHexColor("#1234")).toBeNull();
  });
});

describe("relativeLuminance", () => {
  it("ranks white above black", () => {
    expect(relativeLuminance("#ffffff")).toBeGreaterThan(
      relativeLuminance("#000000")!,
    );
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("returns null for unparseable colours", () => {
    expect(relativeLuminance("nope")).toBeNull();
  });
});

describe("readableForeground", () => {
  it("returns black on light backgrounds and white on dark", () => {
    expect(readableForeground("#ffffff")).toBe("#000000");
    expect(readableForeground("#000000")).toBe("#ffffff");
    expect(readableForeground("#6d28d9")).toBe("#ffffff");
  });

  it("falls back to white when colour is invalid", () => {
    expect(readableForeground("invalid")).toBe("#ffffff");
  });
});
