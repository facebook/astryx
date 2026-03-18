/**
 * XDS Design Tokens
 *
 * Defines all design tokens using StyleX defineVars.
 * - *Defaults: Plain objects with default values (used by defineVars and themes)
 * - *Vars: CSS custom properties that themes can override via createTheme
 *
 * SYNC: When modified, update /packages/agent-tools/docs/tokens.md
 */

import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Color Tokens
// =============================================================================

export const colorDefaults = {
  // Core semantic
  '--color-accent': 'light-dark(#0064E0, #2694FE)',
  '--color-accent-deemphasized': 'light-dark(#0082FB33, #0082FB3F)',
  '--color-accent-text': 'light-dark(#0143B5, #4BA9FE)',
  '--color-surface': 'light-dark(#FFFFFF, #1F1F22)',
  '--color-wash': 'light-dark(#F1F4F7, #111112)',
  '--color-overlay': 'light-dark(#01122866, #11111299)',
  '--color-hover-overlay': 'light-dark(#0536590C, #FFFFFF0C)',
  '--color-pressed-overlay': 'light-dark(#05365919, #FFFFFF19)',
  '--color-focus-outline': 'light-dark(#0171E3, #2694FE)',
  '--color-focus-outline-error': 'light-dark(#E3193B, #F5394F)',
  '--color-focus-outline-success': 'light-dark(#0D8626, #0D8626)',
  '--color-focus-outline-warning': 'light-dark(#F2C00B, #E9AF08)',
  '--color-deemphasized': 'light-dark(#0536590C, #1111127F)',

  // Text
  '--color-text-primary': 'light-dark(#0A1317, #DFE2E5)',
  '--color-text-secondary': 'light-dark(#4E606F, #AAAFB5)',
  '--color-text-disabled': 'light-dark(#A4B0BC, #6F747C)',
  '--color-text-link': 'light-dark(#0064E0, #3E9EFB)',
  '--color-text-placeholder': 'light-dark(#4E606F, #AAAFB5)',
  '--color-text-on-media': 'light-dark(#FFFFFF, #FFFFFF)',

  // Icon
  '--color-icon-primary': 'light-dark(#0A1317, #DFE2E5)',
  '--color-icon-secondary': 'light-dark(#4E606F, #AAAFB5)',
  '--color-icon-tertiary': 'light-dark(#748695, #8C939B)',
  '--color-icon-disabled': 'light-dark(#A4B0BC, #6F747C)',
  '--color-icon-on-media': 'light-dark(#FFFFFF, #FFFFFF)',

  // Surface variants
  '--color-card': 'light-dark(#FFFFFF, #1F1F22)',
  '--color-popover': 'light-dark(#FFFFFF, #28292C)',

  // Status/Sentiment
  '--color-positive': 'light-dark(#0D8626, #0D8626)',
  '--color-positive-deemphasized': 'light-dark(#0B991F33, #0B991F3F)',
  '--color-negative': 'light-dark(#E3193B, #F5394F)',
  '--color-negative-deemphasized': 'light-dark(#E3193B33, #F5394F3F)',
  '--color-warning': 'light-dark(#E9AF08, #F2C00B)',
  '--color-warning-deemphasized': 'light-dark(#E2A40033, #E2A4003F)',
  '--color-educational': 'light-dark(#5B08D8, #6B1EFD)',
  '--color-educational-deemphasized': 'light-dark(#7952FF33, #5B08D83F)',

  // Divider
  '--color-divider': 'light-dark(#05365919, #F2F4F619)',
  '--color-divider-high-contrast': 'light-dark(#647685, #6F747C)',
  '--color-divider-emphasized': 'light-dark(#CCD3DB, #494D53)',

  // Disabled/Effects
  '--color-disabled-overlay': 'light-dark(#FFFFFF7F, #1F1F227F)',
  '--color-glimmer': 'light-dark(#CCD3DB, #5A5E66)',
  '--color-glimmer-high-contrast': 'light-dark(#A4B0BC, #8C939B)',
  '--color-shadow-elevation':
    'light-dark(rgba(5, 54, 89, 0.1), rgba(0, 0, 0, 0.3))',
  // Hover tint: black in light mode, white in dark mode - used with color-mix for hover states
  '--color-hover-tint': 'light-dark(black, white)',

  // Blue
  '--color-blue-background': 'light-dark(#0171E333, #0171E333)',
  '--color-blue-border': 'light-dark(#0171E3, #4BA9FE)',
  '--color-blue-icon': 'light-dark(#0064E0, #2694FE)',
  '--color-blue-text': 'light-dark(#042F97, #AFD7FF)',

  // Cyan
  '--color-cyan-background': 'light-dark(#00BCD433, #00BCD433)',
  '--color-cyan-border': 'light-dark(#00BCD4, #4DD0E1)',
  '--color-cyan-icon': 'light-dark(#00ACC1, #26C6DA)',
  '--color-cyan-text': 'light-dark(#006064, #B2EBF2)',

  // Gray
  '--color-gray-background': 'light-dark(#0A131733, #666A724C)',
  '--color-gray-border': 'light-dark(#647685, #8C939B)',
  '--color-gray-icon': 'light-dark(#4E606F, #AAAFB5)',
  '--color-gray-text': 'light-dark(#0A1317, #E7EAED)',

  // Green
  '--color-green-background': 'light-dark(#24BB5E33, #24BB5E33)',
  '--color-green-border': 'light-dark(#24BB5E, #4CD964)',
  '--color-green-icon': 'light-dark(#0D8626, #26A756)',
  '--color-green-text': 'light-dark(#09441F, #A5F690)',

  // Orange
  '--color-orange-background': 'light-dark(#F2790233, #F2790233)',
  '--color-orange-border': 'light-dark(#F27902, #FFA040)',
  '--color-orange-icon': 'light-dark(#E9690B, #FB8C00)',
  '--color-orange-text': 'light-dark(#6B2203, #FDB876)',

  // Pink
  '--color-pink-background': 'light-dark(#E91E6333, #E91E6333)',
  '--color-pink-border': 'light-dark(#E91E63, #F48FB1)',
  '--color-pink-icon': 'light-dark(#C2185B, #EC407A)',
  '--color-pink-text': 'light-dark(#880E4F, #F8BBD0)',

  // Purple
  '--color-purple-background': 'light-dark(#7952FF33, #7952FF33)',
  '--color-purple-border': 'light-dark(#7952FF, #9575CD)',
  '--color-purple-icon': 'light-dark(#5B08D8, #7952FF)',
  '--color-purple-text': 'light-dark(#3E0697, #B3B0FE)',

  // Red
  '--color-red-background': 'light-dark(#E3193B33, #E3193B33)',
  '--color-red-border': 'light-dark(#E3193B, #F5394F)',
  '--color-red-icon': 'light-dark(#D31130, #E3193B)',
  '--color-red-text': 'light-dark(#7B0210, #FFB2B8)',

  // Teal
  '--color-teal-background': 'light-dark(#0DB7AF33, #0DB7AF33)',
  '--color-teal-border': 'light-dark(#0DB7AF, #4DB6AC)',
  '--color-teal-icon': 'light-dark(#009688, #26A69A)',
  '--color-teal-text': 'light-dark(#083943, #40DCCD)',

  // Yellow
  '--color-yellow-background': 'light-dark(#FFEB3B33, #FFEB3B33)',
  '--color-yellow-border': 'light-dark(#FFEB3B, #FFF176)',
  '--color-yellow-icon': 'light-dark(#FBC02D, #FFEE58)',
  '--color-yellow-text': 'light-dark(#753F07, #FBCE03)',
} as const;

/** @deprecated Use colorDefaults */
export const colorRaw = colorDefaults;

export const colorVars = stylex.defineVars(colorDefaults);

// =============================================================================
// Spacing Tokens
// =============================================================================

export const spacingDefaults = {
  '--spacing-0': '0px',
  '--spacing-0-5': '2px',
  '--spacing-1': '4px',
  '--spacing-1-5': '6px',
  '--spacing-2': '8px',
  '--spacing-3': '12px',
  '--spacing-4': '16px',
  '--spacing-5': '20px',
  '--spacing-6': '24px',
  '--spacing-7': '28px',
  '--spacing-8': '32px',
  '--spacing-9': '36px',
  '--spacing-10': '40px',
  '--spacing-11': '44px',
  '--spacing-12': '48px',
} as const;

/** @deprecated Use spacingDefaults */
export const spacingRaw = spacingDefaults;

export const spacingVars = stylex.defineVars(spacingDefaults);

// =============================================================================
// Size Tokens
// =============================================================================

export const sizeDefaults = {
  '--size-sm': '28px',
  '--size-md': '32px',
  '--size-lg': '36px',
} as const;

/** @deprecated Use sizeDefaults */
export const sizeRaw = sizeDefaults;

export const sizeVars = stylex.defineVars(sizeDefaults);

// =============================================================================
// Radius Tokens
// =============================================================================

export const radiusDefaults = {
  '--radius-rounded': '9999px',
  '--radius-container': '12px',
  '--radius-element': '8px',
  '--radius-content': '4px',
  '--radius-inner': '0px',
  '--radius-page': '20px',
} as const;

/** @deprecated Use radiusDefaults */
export const radiusRaw = radiusDefaults;

export const radiusVars = stylex.defineVars(radiusDefaults);

// =============================================================================
// Elevation Tokens
// =============================================================================

export const elevationDefaults = {
  '--elevation-base': '0px 0px 1px light-dark(rgba(0, 0, 0, 0.1), #111112)',
  '--elevation-thumb':
    '0 1px 3px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))',
  '--elevation-dialog':
    '0px 2px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 8px 24px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
  '--elevation-hover':
    '0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 12px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--elevation-menu':
    '0px 1px 1px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 8px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--elevation-input-hover': 'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.3)',
  '--elevation-input-hover-success':
    'inset 0px 0px 0px 2px rgba(38, 167, 86, 0.3)',
  '--elevation-input-hover-warning':
    'inset 0px 0px 0px 2px rgba(226, 164, 0, 0.3)',
  '--elevation-input-hover-error':
    'inset 0px 0px 0px 2px rgba(227, 25, 59, 0.3)',
} as const;

/** @deprecated Use elevationDefaults */
export const elevationRaw = elevationDefaults;

export const elevationVars = stylex.defineVars(elevationDefaults);

// =============================================================================
// Transition Tokens
// =============================================================================

export const transitionDefaults = {
  '--transition-fast': '0.15s ease',
  '--transition-normal': '0.2s ease',
} as const;

/** @deprecated Use transitionDefaults */
export const transitionRaw = transitionDefaults;

export const transitionVars = stylex.defineVars(transitionDefaults);

// =============================================================================
// Typography Tokens - Font Families
// =============================================================================

export const typographyDefaults = {
  '--font-body':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-code': '"SF Mono", Monaco, Consolas, monospace',
  '--font-heading':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

/** @deprecated Use typographyDefaults */
export const typographyRaw = typographyDefaults;

export const typographyVars = stylex.defineVars(typographyDefaults);

// =============================================================================
// Typography Tokens - Text Sizes
// =============================================================================

export const textSizeDefaults = {
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

/** @deprecated Use textSizeDefaults */
export const textSizeRaw = textSizeDefaults;

export const textSizeVars = stylex.defineVars(textSizeDefaults);

// =============================================================================
// Typography Tokens - Line Heights
// =============================================================================

export const lineHeightDefaults = {
  '--leading-tight': '1.25', // Display text, headings
  '--leading-snug': '1.375', // Compact body text, headings
  '--leading-base': '1.4285714285714286', // Body text with --text-base (20px line / 14px font)
  '--leading-normal': '1.5', // Body text, large body
  '--leading-relaxed': '1.625', // Editorial body, reading text
} as const;

/** @deprecated Use lineHeightDefaults */
export const lineHeightRaw = lineHeightDefaults;

export const lineHeightVars = stylex.defineVars(lineHeightDefaults);

// =============================================================================
// Typography Tokens - Font Weights
// =============================================================================

export const fontWeightDefaults = {
  '--font-weight-normal': '400', // body, captions, code
  '--font-weight-medium': '500', // subheadlines, data viz
  '--font-weight-semibold': '600', // emphasized body, titles
  '--font-weight-bold': '700', // strong emphasis, headings
} as const;

/** @deprecated Use fontWeightDefaults */
export const fontWeightRaw = fontWeightDefaults;

export const fontWeightVars = stylex.defineVars(fontWeightDefaults);

// =============================================================================
// Token Types
// =============================================================================

export type ColorVarName = keyof typeof colorDefaults;
export type SpacingVarName = keyof typeof spacingDefaults;
export type SizeVarName = keyof typeof sizeDefaults;
export type RadiusVarName = keyof typeof radiusDefaults;
export type ElevationVarName = keyof typeof elevationDefaults;
export type TransitionVarName = keyof typeof transitionDefaults;
export type TypographyVarName = keyof typeof typographyDefaults;
export type TextSizeVarName = keyof typeof textSizeDefaults;
export type LineHeightVarName = keyof typeof lineHeightDefaults;
export type FontWeightVarName = keyof typeof fontWeightDefaults;

// =============================================================================
// Typography Tokens - Type Scale (computed from base=14, ratio=1.2)
// =============================================================================
// These tokens are the source of truth for heading and text sizing.
// Components reference these tokens so that themes
// can override them via typeScale in defineTheme.
//
// Default scale: base=14px, ratio=1.2, h4 anchored to base.
// Suggested starting points:
//   Dense/functional: { base: 12, ratio: 1.125 }
//   Default:          { base: 14, ratio: 1.2 }
//   Airy/editorial:   { base: 16, ratio: 1.25 }

export const typeScaleDefaults = {
  // Heading tokens — h4 is the anchor at base (14px)
  // Sizes reference --text-* vars where possible so base values compose.
  // When typeScale is used in defineTheme, these are overridden with computed px values.
  // Line heights are unitless ratios (snapped to 4px grid at computed size).
  '--heading-1-size': 'var(--text-3xl)', // 24px (14 × 1.2³)
  '--heading-1-weight': 'var(--font-weight-semibold)',
  '--heading-1-leading': '1.3333',
  '--heading-2-size': 'var(--text-2xl)', // 20px (14 × 1.2²)
  '--heading-2-weight': 'var(--font-weight-semibold)',
  '--heading-2-leading': '1.4',
  '--heading-3-size': '17px', // 14 × 1.2¹ (no matching --text-* token)
  '--heading-3-weight': 'var(--font-weight-semibold)',
  '--heading-3-leading': '1.4118',
  '--heading-4-size': 'var(--text-base)', // 14px — base anchor
  '--heading-4-weight': 'var(--font-weight-semibold)',
  '--heading-4-leading': '1.4286',
  '--heading-5-size': 'var(--text-xsm)', // 12px (14 × 1.2⁻¹)
  '--heading-5-weight': 'var(--font-weight-semibold)',
  '--heading-5-leading': '1.3333',
  '--heading-6-size': 'var(--text-3xs)', // 10px (14 × 1.2⁻²)
  '--heading-6-weight': 'var(--font-weight-semibold)',
  '--heading-6-leading': '1.6',

  // Text tokens — body/label/code at base, large one step up, supporting one step down
  '--text-body-size': 'var(--text-base)', // 14px
  '--text-body-weight': 'var(--font-weight-normal)',
  '--text-body-leading': '1.4286',
  '--text-large-size': '17px', // 14 × 1.2¹ (no matching --text-* token)
  '--text-large-weight': 'var(--font-weight-semibold)',
  '--text-large-leading': '1.4118',
  '--text-label-size': 'var(--text-base)', // 14px
  '--text-label-weight': 'var(--font-weight-medium)',
  '--text-label-leading': '1.4286',
  '--text-code-size': 'var(--text-base)', // 14px
  '--text-code-weight': 'var(--font-weight-normal)',
  '--text-code-leading': '1.4286',
  '--text-supporting-size': 'var(--text-xsm)', // 12px
  '--text-supporting-weight': 'var(--font-weight-normal)',
  '--text-supporting-leading': '1.6667',
} as const;

export const typeScaleVars = stylex.defineVars(typeScaleDefaults);

export type TypeScaleVarName = keyof typeof typeScaleDefaults;
