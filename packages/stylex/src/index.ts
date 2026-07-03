import * as stylex from '@stylexjs/stylex';
import { tokenToCssVar } from '@jedi/tokens';

export { stylex };

/**
 * Bind a JEDI token path to a StyleX custom property reference.
 */
export function tokenVar(tokenPath: string): string {
  return `var(${tokenToCssVar(tokenPath)})`;
}

/**
 * Create a StyleX var definition from a JEDI token path.
 */
export function defineTokenVar(tokenPath: string) {
  return stylex.defineVars({
    value: tokenVar(tokenPath),
  });
}

export const media = {
  sm: '@media (min-width: 640px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  xl: '@media (min-width: 1280px)',
} as const;

export const spacing = {
  0: tokenVar('spacing.0'),
  1: tokenVar('spacing.1'),
  2: tokenVar('spacing.2'),
  3: tokenVar('spacing.3'),
  4: tokenVar('spacing.4'),
  6: tokenVar('spacing.6'),
  8: tokenVar('spacing.8'),
} as const;

export const colors = {
  surfacePrimary: tokenVar('semantic.surface.primary'),
  surfaceSecondary: tokenVar('semantic.surface.secondary'),
  textPrimary: tokenVar('semantic.text.primary'),
  textSecondary: tokenVar('semantic.text.secondary'),
  borderSubtle: tokenVar('semantic.border.subtle'),
  focusRing: tokenVar('semantic.focus.ring'),
} as const;

export const radii = {
  sm: tokenVar('radius.sm'),
  md: tokenVar('radius.md'),
  lg: tokenVar('radius.lg'),
} as const;

export const typography = {
  fontSans: tokenVar('font.family.sans'),
  size200: tokenVar('font.size.200'),
  size300: tokenVar('font.size.300'),
  weightMedium: tokenVar('font.weight.medium'),
} as const;

export const shadows = {
  md: tokenVar('elevation.shadow.md'),
} as const;

export const jediTokens = {
  spacing,
  colors,
  radii,
  typography,
  shadows,
} as const;

export const STYLING_ENGINE = 'stylex' as const;
export const STYLING_ENGINE_VERSION = '0.10.x' as const;
