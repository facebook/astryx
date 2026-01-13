/**
 * Neutral Theme
 *
 * A grayscale theme with neutral colors and modern aesthetics.
 * Uses oklch color space for perceptually uniform colors.
 *
 * Inspired by shadcn/ui's default color scheme.
 *
 * To create a custom theme:
 * 1. Copy this file
 * 2. Rename it (e.g., myBrandTheme.stylex.ts)
 * 3. Update the color values with your brand colors
 * 4. Export from index.ts
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  elevationTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
} from './tokens.stylex';
import type { Theme } from './types';

// =============================================================================
// Color Theme
// =============================================================================
// Neutral grayscale palette using oklch color space.
// Format: 'light-dark(lightValue, darkValue)'

const colorTheme = stylex.createTheme(colorTokens, {
  // Core semantic - neutral grayscale palette
  accent: 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  accentDeemphasized: 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',
  accentText: 'light-dark(oklch(0.205 0 0), oklch(0.985 0 0))',
  surface: 'light-dark(oklch(1 0 0), oklch(0.145 0 0))',
  wash: 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',
  overlay: 'light-dark(oklch(0 0 0 / 50%), oklch(0 0 0 / 80%))',
  hoverOverlay: 'light-dark(oklch(0 0 0 / 5%), oklch(1 0 0 / 5%))',
  pressedOverlay: 'light-dark(oklch(0 0 0 / 10%), oklch(1 0 0 / 10%))',
  focusOutline: 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  deemphasized: 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',

  // Text
  textPrimary: 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  textSecondary: 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  textDisabled: 'light-dark(oklch(0.708 0 0), oklch(0.439 0 0))',
  textLink: 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  textPlaceholder: 'light-dark(oklch(0.556 0 0), oklch(0.556 0 0))',

  // Icon
  iconPrimary: 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  iconSecondary: 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  iconTertiary: 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  iconDisabled: 'light-dark(oklch(0.708 0 0), oklch(0.439 0 0))',

  // Surface variants
  card: 'light-dark(oklch(1 0 0), oklch(0.205 0 0))',
  popover: 'light-dark(oklch(1 0 0), oklch(0.269 0 0))',
  navbar: 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',

  // Status/Sentiment
  positive: 'light-dark(oklch(0.6 0.15 145), oklch(0.7 0.15 145))',
  positiveDeemphasized:
    'light-dark(oklch(0.6 0.15 145 / 20%), oklch(0.7 0.15 145 / 20%))',
  negative: 'light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))',
  negativeDeemphasized:
    'light-dark(oklch(0.577 0.245 27.325 / 20%), oklch(0.704 0.191 22.216 / 20%))',
  warning: 'light-dark(oklch(0.828 0.189 84.429), oklch(0.769 0.188 70.08))',
  warningDeemphasized:
    'light-dark(oklch(0.828 0.189 84.429 / 20%), oklch(0.769 0.188 70.08 / 20%))',
  educational:
    'light-dark(oklch(0.488 0.243 264.376), oklch(0.627 0.265 303.9))',
  educationalDeemphasized:
    'light-dark(oklch(0.488 0.243 264.376 / 20%), oklch(0.627 0.265 303.9 / 20%))',

  // Divider
  divider: 'light-dark(oklch(0.922 0 0), oklch(1 0 0 / 10%))',
  dividerHighContrast: 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  dividerEmphasized: 'light-dark(oklch(0.85 0 0), oklch(0.371 0 0))',

  // Disabled/Effects
  disabledOverlay: 'light-dark(oklch(1 0 0 / 50%), oklch(0.145 0 0 / 50%))',
  glimmer: 'light-dark(oklch(0.922 0 0), oklch(0.371 0 0))',
  glimmerHighContrast: 'light-dark(oklch(0.85 0 0), oklch(0.439 0 0))',
  shadowElevation: 'light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 30%))',

  // Literal color sets - Blue
  blueBackground:
    'light-dark(oklch(0.488 0.243 264.376 / 20%), oklch(0.488 0.243 264.376 / 20%))',
  blueBorder: 'light-dark(oklch(0.488 0.243 264.376), oklch(0.488 0.243 264.376))',
  blueIcon: 'light-dark(oklch(0.488 0.243 264.376), oklch(0.488 0.243 264.376))',
  blueText: 'light-dark(oklch(0.398 0.2 264), oklch(0.7 0.2 264))',

  // Cyan
  cyanBackground:
    'light-dark(oklch(0.6 0.118 184.704 / 20%), oklch(0.696 0.17 162.48 / 20%))',
  cyanBorder: 'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  cyanIcon: 'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  cyanText: 'light-dark(oklch(0.398 0.07 184), oklch(0.8 0.1 162))',

  // Gray
  grayBackground: 'light-dark(oklch(0.922 0 0 / 50%), oklch(0.371 0 0 / 50%))',
  grayBorder: 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  grayIcon: 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  grayText: 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',

  // Green
  greenBackground:
    'light-dark(oklch(0.6 0.118 184.704 / 20%), oklch(0.696 0.17 162.48 / 20%))',
  greenBorder: 'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  greenIcon: 'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  greenText: 'light-dark(oklch(0.398 0.07 184), oklch(0.8 0.1 162))',

  // Orange
  orangeBackground:
    'light-dark(oklch(0.646 0.222 41.116 / 20%), oklch(0.645 0.246 16.439 / 20%))',
  orangeBorder:
    'light-dark(oklch(0.646 0.222 41.116), oklch(0.645 0.246 16.439))',
  orangeIcon:
    'light-dark(oklch(0.646 0.222 41.116), oklch(0.645 0.246 16.439))',
  orangeText: 'light-dark(oklch(0.5 0.18 41), oklch(0.8 0.2 16))',

  // Pink
  pinkBackground:
    'light-dark(oklch(0.627 0.265 303.9 / 20%), oklch(0.627 0.265 303.9 / 20%))',
  pinkBorder: 'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  pinkIcon: 'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  pinkText: 'light-dark(oklch(0.5 0.2 303), oklch(0.8 0.2 303))',

  // Purple
  purpleBackground:
    'light-dark(oklch(0.627 0.265 303.9 / 20%), oklch(0.627 0.265 303.9 / 20%))',
  purpleBorder: 'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  purpleIcon: 'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  purpleText: 'light-dark(oklch(0.5 0.2 303), oklch(0.8 0.2 303))',

  // Red
  redBackground:
    'light-dark(oklch(0.577 0.245 27.325 / 20%), oklch(0.704 0.191 22.216 / 20%))',
  redBorder:
    'light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))',
  redIcon: 'light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))',
  redText: 'light-dark(oklch(0.45 0.2 27), oklch(0.85 0.15 22))',

  // Teal
  tealBackground:
    'light-dark(oklch(0.6 0.118 184.704 / 20%), oklch(0.696 0.17 162.48 / 20%))',
  tealBorder: 'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  tealIcon: 'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  tealText: 'light-dark(oklch(0.398 0.07 184), oklch(0.8 0.1 162))',

  // Yellow
  yellowBackground:
    'light-dark(oklch(0.828 0.189 84.429 / 20%), oklch(0.769 0.188 70.08 / 20%))',
  yellowBorder:
    'light-dark(oklch(0.828 0.189 84.429), oklch(0.769 0.188 70.08))',
  yellowIcon: 'light-dark(oklch(0.828 0.189 84.429), oklch(0.769 0.188 70.08))',
  yellowText: 'light-dark(oklch(0.6 0.15 84), oklch(0.9 0.15 70))',
});

// =============================================================================
// Elevation Theme
// =============================================================================

const elevationTheme = stylex.createTheme(elevationTokens, {
  base: 'light-dark(0 1px 2px oklch(0 0 0 / 5%), 0 1px 2px oklch(0 0 0 / 20%))',
  thumb:
    'light-dark(0 1px 3px oklch(0 0 0 / 10%), 0 1px 3px oklch(0 0 0 / 30%))',
  dialog:
    'light-dark(0 4px 6px oklch(0 0 0 / 10%) 0 12px 24px oklch(0 0 0 / 15%), 0 4px 6px oklch(0 0 0 / 25%) 0 12px 24px oklch(0 0 0 / 35%))',
  hover:
    'light-dark(0 2px 4px oklch(0 0 0 / 5%) 0 4px 12px oklch(0 0 0 / 10%), 0 2px 4px oklch(0 0 0 / 15%) 0 4px 12px oklch(0 0 0 / 20%))',
  menu: 'light-dark(0 2px 4px oklch(0 0 0 / 5%) 0 4px 8px oklch(0 0 0 / 10%), 0 2px 4px oklch(0 0 0 / 15%) 0 4px 8px oklch(0 0 0 / 20%))',
});

// =============================================================================
// Spacing Theme
// =============================================================================

const spacingTheme = stylex.createTheme(spacingTokens, {
  space0: '0px',
  space0_5: '2px',
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space7: '32px',
});

// =============================================================================
// Radius Theme
// =============================================================================

const radiusTheme = stylex.createTheme(radiusTokens, {
  rounded: '9999px',
  container: '0.75rem',
  element: '0.625rem',
  content: '0.375rem',
});

// =============================================================================
// Transition Theme
// =============================================================================

const transitionTheme = stylex.createTheme(transitionTokens, {
  fast: '0.15s ease',
  normal: '0.2s ease',
});

// =============================================================================
// Typography Theme
// =============================================================================

const typographyTheme = stylex.createTheme(typographyTokens, {
  fontFamilyBody: 'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyCode: '"Geist Mono", "SF Mono", Monaco, Consolas, monospace',
  fontFamilyHeading: 'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

// =============================================================================
// Component Style Overrides
// =============================================================================
// Theme-specific component customizations using stylex.create()
// These styles are applied on top of default component variants

const buttonVariants = stylex.create({
  // Primary button text needs to contrast with accent color
  // In dark mode, accent is light so text should be dark
  primary: {
    color: 'light-dark(white, oklch(0.145 0 0))',
  },
  // Add border to secondary button for shadcn-style appearance
  secondary: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorTokens.divider,
  },
});

// =============================================================================
// Theme Export
// =============================================================================

export const neutralTheme: Theme = {
  name: 'neutral',
  colorTheme,
  elevationTheme,
  spacingTheme,
  radiusTheme,
  transitionTheme,
  typographyTheme,
  components: {
    button: {
      variants: buttonVariants,
    },
  },
};
