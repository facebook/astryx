/**
 * Neutral Theme
 *
 * A grayscale theme with neutral colors and modern aesthetics.
 * Uses oklch color space for perceptually uniform colors.
 *
 * Only overrides token groups that differ from the defaults:
 * colors, radius, elevation, and typography.
 * Spacing, size, textSize, lineHeight, fontWeight, and transition
 * use the defineVars defaults automatically.
 */

import * as stylex from '@stylexjs/stylex';
import type {ThemeType as Theme} from '@xds/core/theme';
import {
  colorVars,
  radiusVars,
  elevationVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
  spacingVars,
  colorDefaults,
  radiusDefaults,
  elevationDefaults,
  typographyDefaults,
} from '@xds/core/theme/tokens.stylex';
import {neutralIconRegistry} from './icons';

// =============================================================================
// Theme Overrides — only token groups that differ from defaults
// =============================================================================

const colorOverrides = {
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
  '--color-focus-outline-error': 'light-dark(#E3193B, #F5394F)',
  '--color-focus-outline-success': 'light-dark(#0D8626, #0D8626)',
  '--color-focus-outline-warning': 'light-dark(#F2C00B, #E9AF08)',
  '--color-deemphasized': 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',

  // Text
  '--color-text-primary': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  '--color-text-secondary': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--color-text-disabled': 'light-dark(oklch(0.708 0 0), oklch(0.439 0 0))',
  '--color-text-link': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--color-text-placeholder': 'light-dark(oklch(0.556 0 0), oklch(0.556 0 0))',
  '--color-text-on-media': 'light-dark(oklch(1 0 0), oklch(0.145 0 0))',

  // Icon
  '--color-icon-primary': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  '--color-icon-secondary': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--color-icon-tertiary': 'light-dark(oklch(0.708 0 0), oklch(0.556 0 0))',
  '--color-icon-disabled': 'light-dark(oklch(0.708 0 0), oklch(0.439 0 0))',
  '--color-icon-on-media': 'light-dark(oklch(1 0 0), oklch(0.145 0 0))',

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
  '--color-hover-tint': 'light-dark(black, white)',

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
} as const;

const radiusOverrides = {
  '--radius-rounded': '9999px',
  '--radius-container': '0.75rem',
  '--radius-element': '0.625rem',
  '--radius-content': '0.375rem',
  '--radius-inner': '0.25rem',
} as const;

const elevationOverrides = {
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
  '--elevation-input-hover': 'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.3)',
  '--elevation-input-hover-success':
    'inset 0px 0px 0px 2px rgba(38, 167, 86, 0.3)',
  '--elevation-input-hover-warning':
    'inset 0px 0px 0px 2px rgba(226, 164, 0, 0.3)',
  '--elevation-input-hover-error':
    'inset 0px 0px 0px 2px rgba(227, 25, 59, 0.3)',
} as const;

const typographyOverrides = {
  '--font-body':
    'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-code': '"Geist Mono", "SF Mono", Monaco, Consolas, monospace',
  '--font-heading':
    'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

// =============================================================================
// createTheme calls — only for overridden token groups
// =============================================================================

const colorTheme = stylex.createTheme(
  colorVars,
  colorOverrides as unknown as typeof colorDefaults,
);

const radiusTheme = stylex.createTheme(
  radiusVars,
  radiusOverrides as unknown as typeof radiusDefaults,
);

const elevationTheme = stylex.createTheme(
  elevationVars,
  elevationOverrides as unknown as typeof elevationDefaults,
);

const typographyTheme = stylex.createTheme(
  typographyVars,
  typographyOverrides as unknown as typeof typographyDefaults,
);

// =============================================================================
// Component Style Overrides
// =============================================================================

const buttonVariants = stylex.create({
  primary: {
    color: 'light-dark(white, oklch(0.145 0 0))',
  },
  secondary: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
  },
});

const cardStyles = stylex.create({
  content: {
    '--layout-padding-inner-x': spacingVars['--spacing-3'],
    '--layout-padding-inner-y': spacingVars['--spacing-3'],
    '--layout-padding-outer-x': spacingVars['--spacing-3'],
    '--layout-padding-outer-y': spacingVars['--spacing-3'],
  },
});

const sectionStyles = stylex.create({
  content: {
    '--layout-padding-inner-x': spacingVars['--spacing-3'],
    '--layout-padding-inner-y': spacingVars['--spacing-3'],
    '--layout-padding-outer-x': spacingVars['--spacing-3'],
    '--layout-padding-outer-y': spacingVars['--spacing-3'],
  },
});

const headingStyles = stylex.create({
  h1: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-2xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.2,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h2: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h3: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-lg'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.25,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h4: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h5: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h6: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
});

const headingEditorialStyles = stylex.create({
  h1: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-4xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.5,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h2: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-3xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h3: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-2xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.4,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h4: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-lg'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.5,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h5: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h6: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
});

const textStyles = stylex.create({
  body: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  large: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-lg'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: 1.5,
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  label: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  supporting: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-secondary'],
    margin: 0,
  },
  code: {
    fontFamily: typographyVars['--font-code'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
});

// =============================================================================
// Theme Export
// =============================================================================

export const neutralTheme: Theme = {
  name: 'neutral',
  icons: neutralIconRegistry,
  styles: {
    colors: colorTheme,
    radius: radiusTheme,
    elevation: elevationTheme,
    typography: typographyTheme,
  },
  raw: {
    colors: colorOverrides,
    radius: radiusOverrides,
    elevation: elevationOverrides,
    typography: typographyOverrides,
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
    heading: {
      styles: headingStyles,
      editorialStyles: headingEditorialStyles,
    },
    text: {
      styles: textStyles,
    },
  } as Theme['components'],
};
