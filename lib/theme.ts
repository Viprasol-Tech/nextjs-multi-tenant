/**
 * Per-tenant theming helpers. A tenant's `TenantTheme` is turned into a set of
 * CSS custom properties that components and the `<body>` can consume, so a
 * single deployment renders every tenant in its own colours without a rebuild.
 */

import type { Tenant, TenantTheme } from "./tenants";

export type ColorScheme = "light" | "dark";

/** The CSS custom-property names this module emits. */
export const THEME_VARS = {
  primary: "--tenant-primary",
  accent: "--tenant-accent",
  background: "--tenant-bg",
} as const;

/**
 * Build the CSS custom properties for a theme in a given colour scheme.
 * Returned as a `Record` suitable for a React `style` prop.
 */
export function themeToCssVars(
  theme: TenantTheme,
  scheme: ColorScheme = "light",
): Record<string, string> {
  return {
    [THEME_VARS.primary]: theme.primary,
    [THEME_VARS.accent]: theme.accent,
    [THEME_VARS.background]:
      scheme === "dark" ? theme.backgroundDark : theme.background,
  };
}

/** Convenience wrapper that reads the theme off a tenant. */
export function tenantCssVars(
  tenant: Tenant,
  scheme: ColorScheme = "light",
): Record<string, string> {
  return themeToCssVars(tenant.theme, scheme);
}

/**
 * Parse a `#rgb` or `#rrggbb` hex string into 8-bit channels.
 * Returns `null` for anything that is not a valid hex colour.
 */
export function parseHexColor(
  hex: string,
): { r: number; g: number; b: number } | null {
  const value = hex.trim().toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value);
  if (short) {
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    };
  }
  const long = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(value);
  if (long) {
    return {
      r: parseInt(long[1], 16),
      g: parseInt(long[2], 16),
      b: parseInt(long[3], 16),
    };
  }
  return null;
}

/**
 * Relative luminance per WCAG 2.x. Returns a value in `[0, 1]`, or `null` if
 * the colour cannot be parsed.
 */
export function relativeLuminance(hex: string): number | null {
  const rgb = parseHexColor(hex);
  if (!rgb) return null;
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

/**
 * Pick a readable foreground (black or white) for a given background colour.
 * Falls back to white when the colour cannot be parsed.
 */
export function readableForeground(backgroundHex: string): "#000000" | "#ffffff" {
  const lum = relativeLuminance(backgroundHex);
  if (lum === null) return "#ffffff";
  return lum > 0.5 ? "#000000" : "#ffffff";
}
