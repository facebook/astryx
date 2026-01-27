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
import type {Theme} from './types';
import {
  colorVars,
  spacingVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
} from './tokens.stylex';
import type {
  ColorVarName,
  SpacingVarName,
  RadiusVarName,
  ElevationVarName,
  TransitionVarName,
  TypographyVarName,
  BaseColorRaw,
  BaseSpacingRaw,
  BaseRadiusRaw,
  BaseElevationRaw,
  BaseTransitionRaw,
  BaseTypographyRaw,
} from './tokens.stylex';

// =============================================================================
// Raw Theme Values
// =============================================================================
// Define raw values as plain objects first, then use in createTheme
// This allows programmatic access to values (e.g., parsing light-dark())

const colorRaw = {
  // Core semantic - neutral grayscale palette
  '--color-accent': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--color-accent-deemphasized':
    'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',
  '--color-accent-text': 'light-dark(oklch(0.205 0 0), oklch(0.985 0 0))',
  '--color-surface': 'light-dark(oklch(1 0 0), oklch(0.145 0 0))',
  '--color-wash': 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',
  '--color-overlay': 'light-dark(oklch(0 0 0 / 50%), oklch(0 0 0 / 80%))',
  '--color-hover-overlay': 'light-dark(oklch(0 0 0 / 5%), oklch(1 0 0 / 5%))',
  '--color-pressed-overlay':
    'light-dark(oklch(0 0 0 / 10%), oklch(1 0 0 / 10%))',
  '--color-focus-outline': 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  '--color-deemphasized': 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',

  // Text
  '--color-text-primary': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  '--color-text-secondary': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--color-text-disabled': 'light-dark(oklch(0.708 0 0), oklch(0.439 0 0))',
  '--color-text-link': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--color-text-placeholder': 'light-dark(oklch(0.556 0 0), oklch(0.556 0 0))',

  // Icon
  '--color-icon-primary': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  '--color-icon-secondary': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--color-icon-tertiary': 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  '--color-icon-disabled': 'light-dark(oklch(0.708 0 0), oklch(0.439 0 0))',

  // Surface variants
  '--color-card': 'light-dark(oklch(1 0 0), oklch(0.205 0 0))',
  '--color-popover': 'light-dark(oklch(1 0 0), oklch(0.269 0 0))',
  '--color-navbar': 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',

  // Status/Sentiment
  '--color-positive': 'light-dark(oklch(0.6 0.15 145), oklch(0.7 0.15 145))',
  '--color-positive-deemphasized':
    'light-dark(oklch(0.6 0.15 145 / 20%), oklch(0.7 0.15 145 / 20%))',
  '--color-negative':
    'light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))',
  '--color-negative-deemphasized':
    'light-dark(oklch(0.577 0.245 27.325 / 20%), oklch(0.704 0.191 22.216 / 20%))',
  '--color-warning':
    'light-dark(oklch(0.828 0.189 84.429), oklch(0.769 0.188 70.08))',
  '--color-warning-deemphasized':
    'light-dark(oklch(0.828 0.189 84.429 / 20%), oklch(0.769 0.188 70.08 / 20%))',
  '--color-educational':
    'light-dark(oklch(0.488 0.243 264.376), oklch(0.627 0.265 303.9))',
  '--color-educational-deemphasized':
    'light-dark(oklch(0.488 0.243 264.376 / 20%), oklch(0.627 0.265 303.9 / 20%))',

  // Divider
  '--color-divider': 'light-dark(oklch(0.922 0 0), oklch(1 0 0 / 10%))',
  '--color-divider-high-contrast':
    'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  '--color-divider-emphasized': 'light-dark(oklch(0.85 0 0), oklch(0.371 0 0))',

  // Disabled/Effects
  '--color-disabled-overlay':
    'light-dark(oklch(1 0 0 / 50%), oklch(0.145 0 0 / 50%))',
  '--color-glimmer': 'light-dark(oklch(0.922 0 0), oklch(0.371 0 0))',
  '--color-glimmer-high-contrast':
    'light-dark(oklch(0.85 0 0), oklch(0.439 0 0))',
  '--color-shadow-elevation':
    'light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 30%))',

  // Literal color sets - Blue
  '--color-blue-background':
    'light-dark(oklch(0.488 0.243 264.376 / 20%), oklch(0.488 0.243 264.376 / 20%))',
  '--color-blue-border':
    'light-dark(oklch(0.488 0.243 264.376), oklch(0.488 0.243 264.376))',
  '--color-blue-icon':
    'light-dark(oklch(0.488 0.243 264.376), oklch(0.488 0.243 264.376))',
  '--color-blue-text': 'light-dark(oklch(0.398 0.2 264), oklch(0.7 0.2 264))',

  // Cyan
  '--color-cyan-background':
    'light-dark(oklch(0.6 0.118 184.704 / 20%), oklch(0.696 0.17 162.48 / 20%))',
  '--color-cyan-border':
    'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  '--color-cyan-icon':
    'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  '--color-cyan-text': 'light-dark(oklch(0.398 0.07 184), oklch(0.8 0.1 162))',

  // Gray
  '--color-gray-background':
    'light-dark(oklch(0.922 0 0 / 50%), oklch(0.371 0 0 / 50%))',
  '--color-gray-border': 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  '--color-gray-icon': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--color-gray-text': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',

  // Green
  '--color-green-background':
    'light-dark(oklch(0.6 0.118 184.704 / 20%), oklch(0.696 0.17 162.48 / 20%))',
  '--color-green-border':
    'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  '--color-green-icon':
    'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  '--color-green-text': 'light-dark(oklch(0.398 0.07 184), oklch(0.8 0.1 162))',

  // Orange
  '--color-orange-background':
    'light-dark(oklch(0.646 0.222 41.116 / 20%), oklch(0.645 0.246 16.439 / 20%))',
  '--color-orange-border':
    'light-dark(oklch(0.646 0.222 41.116), oklch(0.645 0.246 16.439))',
  '--color-orange-icon':
    'light-dark(oklch(0.646 0.222 41.116), oklch(0.645 0.246 16.439))',
  '--color-orange-text': 'light-dark(oklch(0.5 0.18 41), oklch(0.8 0.2 16))',

  // Pink
  '--color-pink-background':
    'light-dark(oklch(0.627 0.265 303.9 / 20%), oklch(0.627 0.265 303.9 / 20%))',
  '--color-pink-border':
    'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  '--color-pink-icon':
    'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  '--color-pink-text': 'light-dark(oklch(0.5 0.2 303), oklch(0.8 0.2 303))',

  // Purple
  '--color-purple-background':
    'light-dark(oklch(0.627 0.265 303.9 / 20%), oklch(0.627 0.265 303.9 / 20%))',
  '--color-purple-border':
    'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  '--color-purple-icon':
    'light-dark(oklch(0.627 0.265 303.9), oklch(0.627 0.265 303.9))',
  '--color-purple-text': 'light-dark(oklch(0.5 0.2 303), oklch(0.8 0.2 303))',

  // Red
  '--color-red-background':
    'light-dark(oklch(0.577 0.245 27.325 / 20%), oklch(0.704 0.191 22.216 / 20%))',
  '--color-red-border':
    'light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))',
  '--color-red-icon':
    'light-dark(oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))',
  '--color-red-text': 'light-dark(oklch(0.45 0.2 27), oklch(0.85 0.15 22))',

  // Teal
  '--color-teal-background':
    'light-dark(oklch(0.6 0.118 184.704 / 20%), oklch(0.696 0.17 162.48 / 20%))',
  '--color-teal-border':
    'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  '--color-teal-icon':
    'light-dark(oklch(0.6 0.118 184.704), oklch(0.696 0.17 162.48))',
  '--color-teal-text': 'light-dark(oklch(0.398 0.07 184), oklch(0.8 0.1 162))',

  // Yellow
  '--color-yellow-background':
    'light-dark(oklch(0.828 0.189 84.429 / 20%), oklch(0.769 0.188 70.08 / 20%))',
  '--color-yellow-border':
    'light-dark(oklch(0.828 0.189 84.429), oklch(0.769 0.188 70.08))',
  '--color-yellow-icon':
    'light-dark(oklch(0.828 0.189 84.429), oklch(0.769 0.188 70.08))',
  '--color-yellow-text': 'light-dark(oklch(0.6 0.15 84), oklch(0.9 0.15 70))',
} as const satisfies Record<ColorVarName, string>;

const spacingRaw = {
  '--spacing-0': '0px',
  '--spacing-0-5': '2px',
  '--spacing-1': '4px',
  '--spacing-2': '8px',
  '--spacing-3': '12px',
  '--spacing-4': '16px',
  '--spacing-5': '20px',
  '--spacing-6': '24px',
  '--spacing-7': '32px',
} as const satisfies Record<SpacingVarName, string>;

const radiusRaw = {
  '--radius-rounded': '9999px',
  '--radius-container': '0.75rem',
  '--radius-element': '0.625rem',
  '--radius-content': '0.375rem',
  '--radius-inner': '0.25rem',
} as const satisfies Record<RadiusVarName, string>;

const elevationRaw = {
  '--elevation-base':
    '0 1px 2px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 20%))',
  '--elevation-thumb':
    '0 1px 3px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 30%))',
  '--elevation-dialog':
    '0 4px 6px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 25%)), 0 12px 24px light-dark(oklch(0 0 0 / 15%), oklch(0 0 0 / 35%))',
  '--elevation-hover':
    '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 15%)), 0 4px 12px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 20%))',
  '--elevation-menu':
    '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 15%)), 0 4px 8px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 20%))',
} as const satisfies Record<ElevationVarName, string>;

const transitionRaw = {
  '--transition-fast': '0.15s ease',
  '--transition-normal': '0.2s ease',
} as const satisfies Record<TransitionVarName, string>;

const typographyRaw = {
  '--font-body':
    'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-code': '"Geist Mono", "SF Mono", Monaco, Consolas, monospace',
  '--font-heading':
    'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const satisfies Record<TypographyVarName, string>;

// =============================================================================
// Theme Overrides using createTheme
// =============================================================================

const colorTheme = stylex.createTheme(
  colorVars,
  colorRaw as unknown as BaseColorRaw,
);

const spacingTheme = stylex.createTheme(
  spacingVars,
  spacingRaw as unknown as BaseSpacingRaw,
);

const radiusTheme = stylex.createTheme(
  radiusVars,
  radiusRaw as unknown as BaseRadiusRaw,
);

const elevationTheme = stylex.createTheme(
  elevationVars,
  elevationRaw as unknown as BaseElevationRaw,
);

const transitionTheme = stylex.createTheme(
  transitionVars,
  transitionRaw as unknown as BaseTransitionRaw,
);

const typographyTheme = stylex.createTheme(
  typographyVars,
  typographyRaw as unknown as BaseTypographyRaw,
);

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
    borderColor: colorVars['--color-divider'],
  },
});

const cardStyles = stylex.create({
  // Override card default padding to 12px for tighter layout
  content: {
    '--layout-padding-inner-x': spacingVars['--spacing-3'],
    '--layout-padding-inner-y': spacingVars['--spacing-3'],
    '--layout-padding-outer-x': spacingVars['--spacing-3'],
    '--layout-padding-outer-y': spacingVars['--spacing-3'],
  },
});

const sectionStyles = stylex.create({
  // Override section default padding to 12px for tighter layout
  content: {
    '--layout-padding-inner-x': spacingVars['--spacing-3'],
    '--layout-padding-inner-y': spacingVars['--spacing-3'],
    '--layout-padding-outer-x': spacingVars['--spacing-3'],
    '--layout-padding-outer-y': spacingVars['--spacing-3'],
  },
});

// =============================================================================
// Theme Export
// =============================================================================

export const neutralTheme: Theme = {
  name: 'neutral',
  styles: {
    colors: colorTheme,
    spacing: spacingTheme,
    radius: radiusTheme,
    elevation: elevationTheme,
    transition: transitionTheme,
    typography: typographyTheme,
  },
  raw: {
    colors: colorRaw,
    spacing: spacingRaw,
    radius: radiusRaw,
    elevation: elevationRaw,
    transition: transitionRaw,
    typography: typographyRaw,
  },
  components: {
    button: {
      variants: buttonVariants,
    },
    card: {
      content: cardStyles.content,
    },
    section: {
      content: sectionStyles.content,
    },
  },
};
