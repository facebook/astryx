/**
 * XDS Default Theme
 *
 * The reference theme — provides all 10 token groups explicitly.
 * Uses CSS light-dark() for automatic light/dark mode switching.
 *
 * To create a custom theme:
 * 1. Copy this file
 * 2. Rename it (e.g., myBrandTheme.stylex.ts)
 * 3. Update only the values you want to change
 * 4. Remove token groups you don't override (they'll use defineVars defaults)
 * 5. Export from index.ts
 */

import * as stylex from '@stylexjs/stylex';
import type {ThemeType as Theme} from '@xds/core/theme';
import {
  colorDefaults,
  spacingDefaults,
  sizeDefaults,
  radiusDefaults,
  elevationDefaults,
  transitionDefaults,
  typographyDefaults,
  textSizeDefaults,
  lineHeightDefaults,
  fontWeightDefaults,
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
} from '@xds/core/theme/tokens.stylex';
import {defaultIconRegistry} from './icons';

// =============================================================================
// Theme Overrides using createTheme
// =============================================================================
// The default theme's values are identical to the defineVars defaults.
// We still create explicit themes so the default is a complete reference.

const colorTheme = stylex.createTheme(colorVars, colorDefaults);

const spacingTheme = stylex.createTheme(spacingVars, spacingDefaults);

const sizeTheme = stylex.createTheme(sizeVars, sizeDefaults);

const radiusTheme = stylex.createTheme(radiusVars, radiusDefaults);

const elevationTheme = stylex.createTheme(elevationVars, elevationDefaults);

const transitionTheme = stylex.createTheme(transitionVars, transitionDefaults);

const typographyTheme = stylex.createTheme(typographyVars, typographyDefaults);

const textSizeTheme = stylex.createTheme(textSizeVars, textSizeDefaults);

const lineHeightTheme = stylex.createTheme(lineHeightVars, lineHeightDefaults);

const fontWeightTheme = stylex.createTheme(fontWeightVars, fontWeightDefaults);

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
  icons: defaultIconRegistry,
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
    colors: colorDefaults,
    spacing: spacingDefaults,
    size: sizeDefaults,
    radius: radiusDefaults,
    elevation: elevationDefaults,
    transition: transitionDefaults,
    typography: typographyDefaults,
    textSize: textSizeDefaults,
    lineHeight: lineHeightDefaults,
    fontWeight: fontWeightDefaults,
  },
  // Component style overrides — typed loosely here because ComponentStyles
  // is augmented by individual components via `declare module`. The theme
  // package doesn't import those components, so the augmentations aren't
  // visible at compile time. The types are enforced at the consumer site.
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
  } as Theme['components'],
};
