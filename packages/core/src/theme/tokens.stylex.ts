/**
 * XDS Design Tokens
 *
 * Defines all design tokens using StyleX defineVars.
 * - *Raw: Plain objects with default values (can be reused by themes)
 * - *Vars: CSS custom properties that themes can override via createTheme
 */

import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Color Tokens
// =============================================================================

export const colorRaw = {
  // Core semantic
  '--color-accent': '#0064E0',
  '--color-accent-deemphasized': '#0082FB33',
  '--color-accent-text': '#0143B5',
  '--color-surface': '#FFFFFF',
  '--color-wash': '#F1F4F7',
  '--color-overlay': '#01122866',
  '--color-hover-overlay': '#0536590C',
  '--color-pressed-overlay': '#05365919',
  '--color-focus-outline': '#042F97',
  '--color-deemphasized': '#0536590C',

  // Text
  '--color-text-primary': '#0A1317',
  '--color-text-secondary': '#4E606F',
  '--color-text-disabled': '#A4B0BC',
  '--color-text-link': '#0064E0',
  '--color-text-placeholder': '#4E606F',
  '--color-text-on-media': '#FFFFFF',

  // Icon
  '--color-icon-primary': '#0A1317',
  '--color-icon-secondary': '#4E606F',
  '--color-icon-tertiary': '#748695',
  '--color-icon-disabled': '#A4B0BC',
  '--color-icon-on-media': '#FFFFFF',

  // Surface variants
  '--color-card': '#FFFFFF',
  '--color-popover': '#FFFFFF',
  '--color-navbar': '#FFFFFF',

  // Status/Sentiment
  '--color-positive': '#0D8626',
  '--color-positive-deemphasized': '#0B991F33',
  '--color-negative': '#E3193B',
  '--color-negative-deemphasized': '#E3193B33',
  '--color-warning': '#E9AF08',
  '--color-warning-deemphasized': '#E2A40033',
  '--color-educational': '#5B08D8',
  '--color-educational-deemphasized': '#7952FF33',

  // Divider
  '--color-divider': '#05365919',
  '--color-divider-high-contrast': '#647685',
  '--color-divider-emphasized': '#CCD3DB',

  // Disabled/Effects
  '--color-disabled-overlay': '#FFFFFF7F',
  '--color-glimmer': '#CCD3DB',
  '--color-glimmer-high-contrast': '#A4B0BC',
  '--color-shadow-elevation': 'rgba(5, 54, 89, 0.1)',

  // Blue
  '--color-blue-background': '#0171E333',
  '--color-blue-border': '#0171E3',
  '--color-blue-icon': '#0064E0',
  '--color-blue-text': '#042F97',

  // Cyan
  '--color-cyan-background': '#00BCD433',
  '--color-cyan-border': '#00BCD4',
  '--color-cyan-icon': '#00ACC1',
  '--color-cyan-text': '#006064',

  // Gray
  '--color-gray-background': '#0A131733',
  '--color-gray-border': '#647685',
  '--color-gray-icon': '#4E606F',
  '--color-gray-text': '#0A1317',

  // Green
  '--color-green-background': '#24BB5E33',
  '--color-green-border': '#24BB5E',
  '--color-green-icon': '#0D8626',
  '--color-green-text': '#09441F',

  // Orange
  '--color-orange-background': '#F2790233',
  '--color-orange-border': '#F27902',
  '--color-orange-icon': '#E9690B',
  '--color-orange-text': '#6B2203',

  // Pink
  '--color-pink-background': '#E91E6333',
  '--color-pink-border': '#E91E63',
  '--color-pink-icon': '#C2185B',
  '--color-pink-text': '#880E4F',

  // Purple
  '--color-purple-background': '#7952FF33',
  '--color-purple-border': '#7952FF',
  '--color-purple-icon': '#5B08D8',
  '--color-purple-text': '#3E0697',

  // Red
  '--color-red-background': '#E3193B33',
  '--color-red-border': '#E3193B',
  '--color-red-icon': '#D31130',
  '--color-red-text': '#7B0210',

  // Teal
  '--color-teal-background': '#0DB7AF33',
  '--color-teal-border': '#0DB7AF',
  '--color-teal-icon': '#009688',
  '--color-teal-text': '#083943',

  // Yellow
  '--color-yellow-background': '#FFEB3B33',
  '--color-yellow-border': '#FFEB3B',
  '--color-yellow-icon': '#FBC02D',
  '--color-yellow-text': '#F57F17',
} as const;

export const colorVars = stylex.defineVars(colorRaw);

// =============================================================================
// Spacing Tokens
// =============================================================================

export const spacingRaw = {
  '--spacing-0': '0px',
  '--spacing-0-5': '2px',
  '--spacing-1': '4px',
  '--spacing-2': '8px',
  '--spacing-3': '12px',
  '--spacing-4': '16px',
  '--spacing-5': '20px',
  '--spacing-6': '24px',
  '--spacing-7': '32px',
} as const;

export const spacingVars = stylex.defineVars(spacingRaw);

// =============================================================================
// Radius Tokens
// =============================================================================

export const radiusRaw = {
  '--radius-rounded': '9999px',
  '--radius-container': '12px',
  '--radius-element': '8px',
  '--radius-content': '4px',
  '--radius-inner': '0px',
} as const;

export const radiusVars = stylex.defineVars(radiusRaw);

// =============================================================================
// Elevation Tokens
// =============================================================================

export const elevationRaw = {
  '--elevation-base': '0px 0px 1px rgba(0, 0, 0, 0.1)',
  '--elevation-thumb': '0 1px 3px rgba(0, 0, 0, 0.2)',
  '--elevation-dialog':
    '0px 2px 2px rgba(0, 0, 0, 0.1), 0px 8px 24px rgba(0, 0, 0, 0.1)',
  '--elevation-hover':
    '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 2px 12px rgba(0, 0, 0, 0.1)',
  '--elevation-menu':
    '0px 1px 1px rgba(0, 0, 0, 0.1), 0px 2px 8px rgba(0, 0, 0, 0.1)',
} as const;

export const elevationVars = stylex.defineVars(elevationRaw);

// =============================================================================
// Transition Tokens
// =============================================================================

export const transitionRaw = {
  '--transition-fast': '0.15s ease',
  '--transition-normal': '0.2s ease',
} as const;

export const transitionVars = stylex.defineVars(transitionRaw);

// =============================================================================
// Typography Tokens - Font Families
// =============================================================================

export const typographyRaw = {
  '--font-body':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-code': '"SF Mono", Monaco, Consolas, monospace',
  '--font-heading':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

export const typographyVars = stylex.defineVars(typographyRaw);

// =============================================================================
// Typography Tokens - Text Sizes
// =============================================================================

export const textSizeRaw = {
  '--text-4xs': '0.5rem', // 8px - citation
  '--text-3xs': '0.625rem', // 10px - micro
  '--text-2xs': '0.6875rem', // 11px - small micro
  '--text-xsm': '0.75rem', // 12px - supporting, badge
  '--text-sm': '0.8125rem', // 13px - secondary text
  '--text-base': '0.875rem', // 14px - body text (XDS default)
  '--text-lg': '1rem', // 16px - large body
  '--text-xl': '1.125rem', // 18px - h2
  '--text-2xl': '1.25rem', // 20px - h1
  '--text-3xl': '1.5rem', // 24px - editorial h2
  '--text-4xl': '2rem', // 32px - editorial h1, data viz
} as const;

export const textSizeVars = stylex.defineVars(textSizeRaw);

// =============================================================================
// Typography Tokens - Line Heights
// =============================================================================

export const lineHeightRaw = {
  '--leading-tight': '1.25', // Display text, headings
  '--leading-snug': '1.375', // Compact body text, headings
  '--leading-normal': '1.5', // Body text, large body
  '--leading-relaxed': '1.625', // Editorial body, reading text
} as const;

export const lineHeightVars = stylex.defineVars(lineHeightRaw);

// =============================================================================
// Typography Tokens - Font Weights
// =============================================================================

export const fontWeightRaw = {
  '--font-weight-normal': '400', // body, captions, code
  '--font-weight-medium': '500', // subheadlines, data viz
  '--font-weight-semibold': '600', // emphasized body, titles
  '--font-weight-bold': '700', // strong emphasis, headings
} as const;

export const fontWeightVars = stylex.defineVars(fontWeightRaw);

// =============================================================================
// Token Types
// =============================================================================

export type ColorVarName = keyof typeof colorRaw;
export type SpacingVarName = keyof typeof spacingRaw;
export type RadiusVarName = keyof typeof radiusRaw;
export type ElevationVarName = keyof typeof elevationRaw;
export type TransitionVarName = keyof typeof transitionRaw;
export type TypographyVarName = keyof typeof typographyRaw;
export type TextSizeVarName = keyof typeof textSizeRaw;
export type LineHeightVarName = keyof typeof lineHeightRaw;
export type FontWeightVarName = keyof typeof fontWeightRaw;

// Base raw types for createTheme casting
// StyleX's createTheme requires exact literal types from defineVars.
// Theme overrides have different values, so we cast through these types.
// Type safety is maintained via `as const satisfies Record<*VarName, string>`.
export type BaseColorRaw = typeof colorRaw;
export type BaseSpacingRaw = typeof spacingRaw;
export type BaseRadiusRaw = typeof radiusRaw;
export type BaseElevationRaw = typeof elevationRaw;
export type BaseTransitionRaw = typeof transitionRaw;
export type BaseTypographyRaw = typeof typographyRaw;
export type BaseTextSizeRaw = typeof textSizeRaw;
export type BaseLineHeightRaw = typeof lineHeightRaw;
export type BaseFontWeightRaw = typeof fontWeightRaw;
