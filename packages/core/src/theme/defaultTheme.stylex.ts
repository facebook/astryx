/**
 * XDS Default Theme
 *
 * A complete theme template that can be copied and customized.
 * Uses CSS light-dark() for automatic light/dark mode switching.
 *
 * To create a custom theme:
 * 1. Copy this file
 * 2. Rename it (e.g., myBrandTheme.stylex.ts)
 * 3. Update the values with your brand colors/spacing
 * 4. Export from index.ts
 */

import * as stylex from '@stylexjs/stylex';
import type {Theme} from './types';
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
} from './tokens.stylex';
import type {
  ColorVarName,
  SpacingVarName,
  SizeVarName,
  RadiusVarName,
  ElevationVarName,
  TransitionVarName,
  TypographyVarName,
  TextSizeVarName,
  LineHeightVarName,
  FontWeightVarName,
  BaseColorRaw,
  BaseSpacingRaw,
  BaseSizeRaw,
  BaseRadiusRaw,
  BaseElevationRaw,
  BaseTransitionRaw,
  BaseTypographyRaw,
  BaseTextSizeRaw,
  BaseLineHeightRaw,
  BaseFontWeightRaw,
} from './tokens.stylex';

// =============================================================================
// Raw Theme Values
// =============================================================================
// Define raw values as plain objects first, then use in createTheme
// This allows programmatic access to values (e.g., parsing light-dark())

const colorRaw = {
  // Core semantic
  '--color-accent': 'light-dark(#0064E0, #2694FE)',
  '--color-accent-deemphasized': 'light-dark(#0082FB33, #0082FB3F)',
  '--color-accent-text': 'light-dark(#0143B5, #4BA9FE)',
  '--color-surface': 'light-dark(#FFFFFF, #1F1F22)',
  '--color-wash': 'light-dark(#F1F4F7, #111112)',
  '--color-overlay': 'light-dark(#01122866, #11111299)',
  '--color-hover-overlay': 'light-dark(#0536590C, #FFFFFF0C)',
  '--color-pressed-overlay': 'light-dark(#05365919, #FFFFFF19)',
  '--color-focus-outline': 'light-dark(#042F97, #AFD7FF)',
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
  '--color-navbar': 'light-dark(#FFFFFF, #1F1F22)',

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

  // Literal color sets - Blue
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

const sizeRaw = {
  '--size-sm': '28px',
  '--size-md': '32px',
  '--size-lg': '36px',
} as const satisfies Record<SizeVarName, string>;

const radiusRaw = {
  '--radius-rounded': '9999px',
  '--radius-container': '12px',
  '--radius-element': '8px',
  '--radius-content': '4px',
  '--radius-inner': '0px',
} as const satisfies Record<RadiusVarName, string>;

const elevationRaw = {
  '--elevation-base': '0px 0px 1px light-dark(rgba(0, 0, 0, 0.1), #111112)',
  '--elevation-thumb':
    '0 1px 3px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))',
  '--elevation-dialog':
    '0px 2px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 8px 24px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
  '--elevation-hover':
    '0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 12px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--elevation-menu':
    '0px 1px 1px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 8px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
} as const satisfies Record<ElevationVarName, string>;

const transitionRaw = {
  '--transition-fast': '0.15s ease',
  '--transition-normal': '0.2s ease',
} as const satisfies Record<TransitionVarName, string>;

const typographyRaw = {
  '--font-body':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-code': '"SF Mono", Monaco, Consolas, monospace',
  '--font-heading':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const satisfies Record<TypographyVarName, string>;

const textSizeRaw = {
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
} as const satisfies Record<TextSizeVarName, string>;

const lineHeightRaw = {
  '--leading-tight': '1.25', // Display text, headings
  '--leading-snug': '1.375', // Compact body text, headings
  '--leading-base': '1.4285714285714286', // Body text with --text-base (20px line / 14px font)
  '--leading-normal': '1.5', // Body text, large body
  '--leading-relaxed': '1.625', // Editorial body, reading text
} as const satisfies Record<LineHeightVarName, string>;

const fontWeightRaw = {
  '--font-weight-normal': '400', // body, captions, code
  '--font-weight-medium': '500', // subheadlines, data viz
  '--font-weight-semibold': '600', // emphasized body, titles
  '--font-weight-bold': '700', // strong emphasis, headings
} as const satisfies Record<FontWeightVarName, string>;

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

const sizeTheme = stylex.createTheme(
  sizeVars,
  sizeRaw as unknown as BaseSizeRaw,
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

const textSizeTheme = stylex.createTheme(
  textSizeVars,
  textSizeRaw as unknown as BaseTextSizeRaw,
);

const lineHeightTheme = stylex.createTheme(
  lineHeightVars,
  lineHeightRaw as unknown as BaseLineHeightRaw,
);

const fontWeightTheme = stylex.createTheme(
  fontWeightVars,
  fontWeightRaw as unknown as BaseFontWeightRaw,
);

// =============================================================================
// Component Style Overrides
// =============================================================================

const buttonVariants = stylex.create({
  secondary: {
    backgroundColor:
      'light-dark(rgba(5 ,54 ,89 ,0.1), rgba(223, 226, 229, 0.2))',
  },
});

/**
 * Semantic heading styles (h1-h6) - default variant
 * Uses XDS dense scale for internal tools
 */
const headingStyles = stylex.create({
  // Default variant (dense scale for internal tools)
  h1: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-2xl'], // 20px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.2, // 24px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h2: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xl'], // 18px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333, // 24px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h3: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-lg'], // 16px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.25, // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h4: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-base'], // 14px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h5: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-base'], // 14px (same as h4)
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h6: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xsm'], // 12px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333, // 16px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
});

/**
 * Editorial heading styles (h1-h4) - larger scale for content-heavy pages
 */
const headingEditorialStyles = stylex.create({
  h1: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-4xl'], // 32px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.5, // 48px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h2: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-3xl'], // 24px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333, // 32px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h3: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-2xl'], // 20px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.4, // 28px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h4: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-lg'], // 16px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.5, // 24px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  // h5 and h6 fall back to default variant
  h5: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-base'], // 14px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  h6: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xsm'], // 12px
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1.3333333333333333, // 16px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
});

/**
 * Semantic text styles for body content
 */
const textStyles = stylex.create({
  /** Body text (14px, regular) - The bulk of content */
  body: {
    fontFamily: typographyVars['--font-heading'], // Optimistic
    fontSize: textSizeVars['--text-base'], // 14px
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  /** Large body text (16px, regular) - Emphasized content, quotes */
  large: {
    fontFamily: typographyVars['--font-heading'], // Optimistic
    fontSize: textSizeVars['--text-lg'], // 16px
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: 1.5, // 24px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  /** Emphasized text (14px, medium) - Labels for form/chart/table columns */
  label: {
    fontFamily: typographyVars['--font-heading'], // Optimistic
    fontSize: textSizeVars['--text-base'], // 14px
    fontWeight: fontWeightVars['--font-weight-medium'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  /** Supporting/helper text (12px, regular) - Supplemental info */
  supporting: {
    fontFamily: typographyVars['--font-heading'], // Optimistic
    fontSize: textSizeVars['--text-xsm'], // 12px
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: 1.3333333333333333, // 16px
    color: colorVars['--color-text-secondary'],
    margin: 0,
  },
  /** Code/monospace text (14px, regular) */
  code: {
    fontFamily: typographyVars['--font-code'], // Menlo
    fontSize: textSizeVars['--text-base'], // 14px
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
});

/**
 * Prose base styles for XDSFontWrapper
 */
const proseBaseStyles = stylex.create({
  base: {
    fontSize: textSizeVars['--text-base'], // 14px
    fontFamily: typographyVars['--font-body'],
    lineHeight: lineHeightVars['--leading-base'], // 20px
    color: colorVars['--color-text-primary'],
  },
});

/**
 * Prose element styles for XDSFontWrapper
 */
const proseElementStyles = stylex.create({
  p: {
    marginTop: 0,
    marginBottom: spacingVars['--spacing-3'], // 12px
  },
  ul: {
    marginTop: 0,
    marginBottom: spacingVars['--spacing-3'], // 12px
    paddingInlineStart: spacingVars['--spacing-5'], // 20px
  },
  ol: {
    marginTop: 0,
    marginBottom: spacingVars['--spacing-3'], // 12px
    paddingInlineStart: spacingVars['--spacing-5'], // 20px
  },
  li: {
    marginBottom: spacingVars['--spacing-1'], // 4px
  },
  liLast: {
    marginBottom: 0,
  },
  blockquote: {
    marginTop: 0,
    marginBottom: spacingVars['--spacing-3'], // 12px
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: spacingVars['--spacing-4'], // 16px
    borderInlineStartWidth: '3px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-divider-emphasized'],
    color: colorVars['--color-text-secondary'],
    fontStyle: 'italic',
  },
  code: {
    fontFamily: typographyVars['--font-code'],
    fontSize: '0.9em',
    backgroundColor: colorVars['--color-wash'],
    paddingBlock: spacingVars['--spacing-0-5'], // 2px
    paddingInline: spacingVars['--spacing-1'], // 4px
    borderRadius: radiusVars['--radius-content'], // 4px
  },
  pre: {
    fontFamily: typographyVars['--font-code'],
    fontSize: textSizeVars['--text-sm'], // 13px
    lineHeight: 1.5,
    marginTop: 0,
    marginBottom: spacingVars['--spacing-3'], // 12px
    padding: spacingVars['--spacing-3'], // 12px
    backgroundColor: colorVars['--color-wash'],
    borderRadius: radiusVars['--radius-element'], // 8px
    overflow: 'auto',
    whiteSpace: 'pre',
  },
  preCode: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    fontSize: 'inherit',
  },
  hr: {
    marginBlock: spacingVars['--spacing-4'], // 16px
    border: 'none',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-divider'],
  },
  strong: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  em: {
    fontStyle: 'italic',
  },
  a: {
    color: colorVars['--color-text-link'],
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  aHover: {
    textDecorationThickness: '2px',
  },
  firstChild: {
    marginTop: 0,
  },
  lastChild: {
    marginBottom: 0,
  },
});

// =============================================================================
// Theme Export
// =============================================================================

export const defaultTheme: Theme = {
  name: 'default',
  styles: {
    colors: colorTheme,
    spacing: spacingTheme,
    size: sizeTheme,
    radius: radiusTheme,
    elevation: elevationTheme,
    transition: transitionTheme,
    typography: typographyTheme,
    textSize: textSizeTheme,
    lineHeight: lineHeightTheme,
    fontWeight: fontWeightTheme,
  },
  raw: {
    colors: colorRaw,
    spacing: spacingRaw,
    size: sizeRaw,
    radius: radiusRaw,
    elevation: elevationRaw,
    transition: transitionRaw,
    typography: typographyRaw,
    textSize: textSizeRaw,
    lineHeight: lineHeightRaw,
    fontWeight: fontWeightRaw,
  },
  components: {
    button: {
      variants: buttonVariants,
    },
    heading: {
      styles: headingStyles,
      editorialStyles: headingEditorialStyles,
    },
    text: {
      styles: textStyles,
    },
    prose: {
      base: proseBaseStyles.base,
      styles: proseElementStyles,
    },
  },
};
