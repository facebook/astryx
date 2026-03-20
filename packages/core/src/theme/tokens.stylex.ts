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
  '--color-accent-muted': 'light-dark(#0082FB33, #0082FB3F)',
  '--color-secondary':
    'light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))',
  '--color-surface': 'light-dark(#FFFFFF, #1F1F22)',
  '--color-wash': 'light-dark(#F1F4F7, #111112)',
  '--color-overlay': 'light-dark(#01122866, #11111299)',
  '--color-overlay-hover': 'light-dark(#0536590C, #FFFFFF0C)',
  '--color-overlay-pressed': 'light-dark(#05365919, #FFFFFF19)',
  '--color-ring-focus': 'light-dark(#0171E3, #2694FE)',
  '--color-ring-focus-error': 'light-dark(#E3193B, #F5394F)',
  '--color-ring-focus-success': 'light-dark(#0D8626, #0D8626)',
  '--color-ring-focus-warning': 'light-dark(#F2C00B, #E9AF08)',
  '--color-muted': 'light-dark(#0536590C, #1111127F)',

  // Text
  '--color-text-primary': 'light-dark(#0A1317, #DFE2E5)',
  '--color-text-secondary': 'light-dark(#4E606F, #AAAFB5)',
  '--color-text-disabled': 'light-dark(#A4B0BC, #6F747C)',
  '--color-text-link': 'light-dark(#0064E0, #3E9EFB)',
  '--color-text-on-dark-media': 'light-dark(#FFFFFF, #FFFFFF)',

  // Icon
  '--color-icon-primary': 'light-dark(#0A1317, #DFE2E5)',
  '--color-icon-secondary': 'light-dark(#4E606F, #AAAFB5)',
  '--color-icon-disabled': 'light-dark(#A4B0BC, #6F747C)',
  '--color-icon-on-dark-media': 'light-dark(#FFFFFF, #FFFFFF)',

  // Surface variants
  '--color-card': 'light-dark(#FFFFFF, #1F1F22)',
  '--color-popover': 'light-dark(#FFFFFF, #28292C)',

  // Status/Sentiment
  '--color-success': 'light-dark(#0D8626, #0D8626)',
  '--color-success-muted': 'light-dark(#0B991F33, #0B991F3F)',
  '--color-error': 'light-dark(#E3193B, #F5394F)',
  '--color-error-muted': 'light-dark(#E3193B33, #F5394F3F)',
  '--color-warning': 'light-dark(#E9AF08, #F2C00B)',
  '--color-warning-muted': 'light-dark(#E2A40033, #E2A4003F)',
  '--color-info': 'light-dark(#5B08D8, #6B1EFD)',
  '--color-info-muted': 'light-dark(#7952FF33, #5B08D83F)',

  // Border
  '--color-border': 'light-dark(#05365919, #F2F4F619)',
  '--color-border-strong': 'light-dark(#647685, #6F747C)',
  '--color-border-emphasized': 'light-dark(#CCD3DB, #494D53)',

  // Effects
  '--color-skeleton': 'light-dark(#CCD3DB, #5A5E66)',
  '--color-shadow': 'light-dark(rgba(5, 54, 89, 0.1), rgba(0, 0, 0, 0.3))',
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

  // Syntax highlighting
  '--color-syntax-keyword': 'light-dark(#a626a4, #c678dd)',
  '--color-syntax-string': 'light-dark(#50a14f, #98c379)',
  '--color-syntax-comment': 'light-dark(#a0a1a7, #5c6370)',
  '--color-syntax-number': 'light-dark(#986801, #d19a66)',
  '--color-syntax-function': 'light-dark(#4078f2, #61afef)',
  '--color-syntax-type': 'light-dark(#a626a4, #e5c07b)',
  '--color-syntax-variable': 'light-dark(#0A1317, #DFE2E5)',
  '--color-syntax-operator': 'light-dark(#4E606F, #AAAFB5)',
  '--color-syntax-constant': 'light-dark(#986801, #d19a66)',
  '--color-syntax-tag': 'light-dark(#e45649, #e06c75)',
  '--color-syntax-attribute': 'light-dark(#986801, #d19a66)',
  '--color-syntax-property': 'light-dark(#4078f2, #61afef)',
  '--color-syntax-punctuation': 'light-dark(#A4B0BC, #6F747C)',
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
  '--radius-0': '0px',
  '--radius-1': '4px',
  '--radius-2': '8px',
  '--radius-3': '12px',
  '--radius-4': '16px',
  '--radius-rounded': '9999px',
} as const;

/** @deprecated Use radiusDefaults */
export const radiusRaw = radiusDefaults;

export const radiusVars = stylex.defineVars(radiusDefaults);

// =============================================================================
// Shadow Tokens
// =============================================================================
// Outer shadows: shadow-base (subtle) → shadow-dialog (strongest).
// Names encode use-case categories for LLM-friendly reasoning.
// Inset shadows: inset-shadow-border-* for input state rings.

export const shadowDefaults = {
  // Outer elevation shadows (ascending intensity: base < menu < hover < dialog)
  '--shadow-base': '0px 0px 1px light-dark(rgba(0, 0, 0, 0.1), #111112)',
  '--shadow-menu':
    '0px 1px 1px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 8px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--shadow-hover':
    '0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 12px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--shadow-dialog':
    '0px 2px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 8px 24px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
  // Inset shadows for input border rings (interaction + validation states)
  '--inset-shadow-border-hover': 'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.3)',
  '--inset-shadow-border-accent':
    'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.5)',
  '--inset-shadow-border-positive':
    'inset 0px 0px 0px 2px rgba(38, 167, 86, 0.3)',
  '--inset-shadow-border-warning':
    'inset 0px 0px 0px 2px rgba(226, 164, 0, 0.3)',
  '--inset-shadow-border-negative':
    'inset 0px 0px 0px 2px rgba(227, 25, 59, 0.3)',
} as const;

/** @deprecated Use shadowDefaults */
export const shadowRaw = shadowDefaults;

export const shadowVars = stylex.defineVars(shadowDefaults);

// =============================================================================
// Motion Tokens — Duration
// =============================================================================
// Duration primitives: pick a duration that matches the visual weight.
// min/max variants derive from base × ratio (default ratio ≈ 0.75).
// See motionScale in defineTheme for computed generation.

export const durationDefaults = {
  '--duration-fast-min': '130ms',
  '--duration-fast': '175ms',
  '--duration-fast-max': '230ms',
  '--duration-medium-min': '310ms',
  '--duration-medium': '410ms',
  '--duration-medium-max': '550ms',
} as const;

export const durationVars = stylex.defineVars(durationDefaults);

export type DurationVarName = keyof typeof durationDefaults;

// =============================================================================
// Motion Tokens — Easing
// =============================================================================

export const easeDefaults = {
  '--ease-standard': 'cubic-bezier(0.24, 1, 0.4, 1)',
} as const;

export const easeVars = stylex.defineVars(easeDefaults);

export type EaseVarName = keyof typeof easeDefaults;

// =============================================================================
// Motion Tokens — Deprecated (transition shorthand)
// =============================================================================

/** @deprecated Use durationVars + easeVars instead */
export const transitionDefaults = {
  '--transition-fast': '0.15s ease',
  '--transition-normal': '0.2s ease',
} as const;

/** @deprecated Use durationVars + easeVars instead */
export const transitionRaw = transitionDefaults;

/** @deprecated Use durationVars + easeVars instead */
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
  // Full geometric scale: round(14 × 1.2^step) / 16, default base=14, ratio=1.2
  '--text-4xs': '0.375rem', // step -5: 6px (14 × 1.2⁻⁵ ≈ 5.63 → 6)
  '--text-3xs': '0.4375rem', // step -4: 7px (14 × 1.2⁻⁴ ≈ 6.75 → 7)
  '--text-2xs': '0.5rem', // step -3: 8px (14 × 1.2⁻³ ≈ 8.10 → 8)
  '--text-xsm': '0.625rem', // step -2: 10px (14 × 1.2⁻² ≈ 9.72 → 10)
  '--text-sm': '0.75rem', // step -1: 12px (14 × 1.2⁻¹ ≈ 11.67 → 12)
  '--text-base': '0.875rem', // step  0: 14px — base anchor
  '--text-lg': '1.0625rem', // step +1: 17px (14 × 1.2¹ ≈ 16.8 → 17)
  '--text-xl': '1.25rem', // step +2: 20px (14 × 1.2² ≈ 20.16 → 20)
  '--text-2xl': '1.5rem', // step +3: 24px (14 × 1.2³ ≈ 24.19 → 24)
  '--text-3xl': '1.8125rem', // step +4: 29px (14 × 1.2⁴ ≈ 29.03 → 29)
  '--text-4xl': '2.1875rem', // step +5: 35px (14 × 1.2⁵ ≈ 34.84 → 35)
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
export type ShadowVarName = keyof typeof shadowDefaults;
/** @deprecated Use DurationVarName | EaseVarName instead */
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
  // Sizes are var() references to raw size tokens.
  // Line heights are hardcoded computed values (4px grid snapped, tiered target).
  // When typeScale is used in defineTheme, both raw tokens AND these semantic
  // tokens are overridden together.
  //
  // Step mapping: h6=-2, h5=-1, h4=0(base), h3=+1, h2=+2, h1=+3
  //
  // Heading tokens
  '--heading-1-size': 'var(--text-2xl)', // step +3: 24px
  '--heading-1-weight': 'var(--font-weight-semibold)',
  '--heading-1-leading': '1.3333', // 24px → 32px (target 1.4, 4px snap)
  '--heading-2-size': 'var(--text-xl)', // step +2: 20px
  '--heading-2-weight': 'var(--font-weight-semibold)',
  '--heading-2-leading': '1.4', // 20px → 28px (target 1.4, 4px snap)
  '--heading-3-size': 'var(--text-lg)', // step +1: 17px
  '--heading-3-weight': 'var(--font-weight-semibold)',
  '--heading-3-leading': '1.4118', // 17px → 24px (target 1.5, 4px snap)
  '--heading-4-size': 'var(--text-base)', // step  0: 14px — base anchor
  '--heading-4-weight': 'var(--font-weight-semibold)',
  '--heading-4-leading': '1.4286', // 14px → 20px (target 1.5, 4px snap)
  '--heading-5-size': 'var(--text-sm)', // step -1: 12px
  '--heading-5-weight': 'var(--font-weight-semibold)',
  '--heading-5-leading': '1.6667', // 12px → 20px (target 1.5, 4px snap)
  '--heading-6-size': 'var(--text-xsm)', // step -2: 10px
  '--heading-6-weight': 'var(--font-weight-semibold)',
  '--heading-6-leading': '1.6', // 10px → 16px (target 1.5, min dominated)

  // Text tokens — body/label/code at base(0), large at +1, supporting at -1
  '--text-body-size': 'var(--text-base)', // 14px
  '--text-body-weight': 'var(--font-weight-normal)',
  '--text-body-leading': '1.4286', // 14px → 20px
  '--text-large-size': 'var(--text-lg)', // 17px
  '--text-large-weight': 'var(--font-weight-semibold)',
  '--text-large-leading': '1.4118', // 17px → 24px
  '--text-label-size': 'var(--text-base)', // 14px
  '--text-label-weight': 'var(--font-weight-medium)',
  '--text-label-leading': '1.4286', // 14px → 20px
  '--text-code-size': 'var(--text-base)', // 14px
  '--text-code-weight': 'var(--font-weight-normal)',
  '--text-code-leading': '1.4286', // 14px → 20px
  '--text-supporting-size': 'var(--text-sm)', // 12px
  '--text-supporting-weight': 'var(--font-weight-normal)',
  '--text-supporting-leading': '1.6667', // 12px → 20px
} as const;

export const typeScaleVars = stylex.defineVars(typeScaleDefaults);

export type TypeScaleVarName = keyof typeof typeScaleDefaults;
