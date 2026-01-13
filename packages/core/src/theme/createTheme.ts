/**
 * createTheme - Create an XDS theme with color pair support
 *
 * Public API accepts [light, dark] tuples for LLM-friendliness.
 * Internally converted to CSS light-dark() function.
 *
 * Usage:
 * ```ts
 * const theme = createTheme({
 *   name: 'my-theme',
 *   tokens: {
 *     color: {
 *       accent: ['#0066cc', '#66b3ff'],  // [light, dark]
 *       textPrimary: '#333333',           // same for both modes
 *     },
 *   },
 * });
 * ```
 */

import type { Theme, ThemeConfig, ThemeTokenOverrides, ColorValue } from './types';
import { colorTheme, elevationTheme } from './themes.stylex';
import { colorTokens, elevationTokens, spacingTokens, radiusTokens, transitionTokens, typographyTokens } from './tokens.stylex';

let themeCounter = 0;

/**
 * Extract CSS variable name from a StyleX token value
 * StyleX tokens look like "var(--xabc123)" - we need the "--xabc123" part
 */
function extractVarName(tokenValue: string): string | null {
  const match = tokenValue.match(/var\((--[^,)]+)/);
  return match ? match[1] : null;
}

/**
 * Build a map of token names to CSS variable names
 */
function buildTokenVarMap(tokens: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    const varName = extractVarName(value);
    if (varName) {
      map[name] = varName;
    }
  }
  return map;
}

// Pre-build the variable maps
const colorVarMap = buildTokenVarMap(colorTokens as unknown as Record<string, string>);
const elevationVarMap = buildTokenVarMap(elevationTokens as unknown as Record<string, string>);
const spacingVarMap = buildTokenVarMap(spacingTokens as unknown as Record<string, string>);
const radiusVarMap = buildTokenVarMap(radiusTokens as unknown as Record<string, string>);
const transitionVarMap = buildTokenVarMap(transitionTokens as unknown as Record<string, string>);
const typographyVarMap = buildTokenVarMap(typographyTokens as unknown as Record<string, string>);

/**
 * Check if a value is a color pair [light, dark]
 */
function isColorPair(value: ColorValue): value is [string, string] {
  return Array.isArray(value) && value.length === 2;
}

/**
 * Convert a ColorValue to a CSS string
 * - [light, dark] becomes 'light-dark(light, dark)'
 * - Single string stays as-is
 */
function colorValueToString(value: ColorValue): string {
  if (isColorPair(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

/**
 * Process token overrides and build runtime CSS variable map
 */
function processOverrides(tokens: ThemeTokenOverrides | undefined): Record<string, string> {
  const overrides: Record<string, string> = {};

  if (!tokens) {
    return overrides;
  }

  // Process color tokens
  if (tokens.color) {
    for (const [name, value] of Object.entries(tokens.color)) {
      const varName = colorVarMap[name];
      if (varName && value !== undefined) {
        overrides[varName] = colorValueToString(value);
      }
    }
  }

  // Process elevation tokens
  if (tokens.elevation) {
    for (const [name, value] of Object.entries(tokens.elevation)) {
      const varName = elevationVarMap[name];
      if (varName && value !== undefined) {
        overrides[varName] = colorValueToString(value);
      }
    }
  }

  // Process spacing tokens
  if (tokens.spacing) {
    for (const [name, value] of Object.entries(tokens.spacing)) {
      const varName = spacingVarMap[name];
      if (varName && value !== undefined) {
        overrides[varName] = value;
      }
    }
  }

  // Process radius tokens
  if (tokens.radius) {
    for (const [name, value] of Object.entries(tokens.radius)) {
      const varName = radiusVarMap[name];
      if (varName && value !== undefined) {
        overrides[varName] = value;
      }
    }
  }

  // Process transition tokens
  if (tokens.transition) {
    for (const [name, value] of Object.entries(tokens.transition)) {
      const varName = transitionVarMap[name];
      if (varName && value !== undefined) {
        overrides[varName] = value;
      }
    }
  }

  // Process typography tokens
  if (tokens.typography) {
    for (const [name, value] of Object.entries(tokens.typography)) {
      const varName = typographyVarMap[name];
      if (varName && value !== undefined) {
        overrides[varName] = value;
      }
    }
  }

  return overrides;
}

/**
 * Create a theme from token definitions
 *
 * Token values can be:
 * - Single strings: `accent: '#0066cc'` (same for light and dark)
 * - Color pairs: `accent: ['#0066cc', '#66b3ff']` ([light, dark])
 *
 * Color pairs are converted to CSS light-dark() internally.
 */
export function createTheme(config: ThemeConfig = {}): Theme {
  const name = config.name ?? `xds-theme-${++themeCounter}`;
  const overrides = processOverrides(config.tokens);

  return {
    name,
    // Use pre-compiled StyleX themes with light-dark() values
    colorTheme,
    elevationTheme,
    // Runtime CSS variable overrides for custom values
    overrides,
  };
}
