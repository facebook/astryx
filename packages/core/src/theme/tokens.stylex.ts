/**
 * XDS Design Tokens
 *
 * Defines all design tokens using StyleX defineConsts.
 * These reference CSS variables that are set by theme files.
 */

import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Color Tokens
// =============================================================================

export const color = stylex.defineConsts({
  // Core semantic
  accent: 'var(--color-accent)',
  accentDeemphasized: 'var(--color-accent-deemphasized)',
  accentText: 'var(--color-accent-text)',
  surface: 'var(--color-surface)',
  wash: 'var(--color-wash)',
  overlay: 'var(--color-overlay)',
  hoverOverlay: 'var(--color-hover-overlay)',
  pressedOverlay: 'var(--color-pressed-overlay)',
  focusOutline: 'var(--color-focus-outline)',
  deemphasized: 'var(--color-deemphasized)',

  // Text
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textDisabled: 'var(--color-text-disabled)',
  textLink: 'var(--color-text-link)',
  textPlaceholder: 'var(--color-text-placeholder)',

  // Icon
  iconPrimary: 'var(--color-icon-primary)',
  iconSecondary: 'var(--color-icon-secondary)',
  iconTertiary: 'var(--color-icon-tertiary)',
  iconDisabled: 'var(--color-icon-disabled)',

  // Surface variants
  card: 'var(--color-card)',
  popover: 'var(--color-popover)',
  navbar: 'var(--color-navbar)',

  // Status/Sentiment
  positive: 'var(--color-positive)',
  positiveDeemphasized: 'var(--color-positive-deemphasized)',
  negative: 'var(--color-negative)',
  negativeDeemphasized: 'var(--color-negative-deemphasized)',
  warning: 'var(--color-warning)',
  warningDeemphasized: 'var(--color-warning-deemphasized)',
  educational: 'var(--color-educational)',
  educationalDeemphasized: 'var(--color-educational-deemphasized)',

  // Divider
  divider: 'var(--color-divider)',
  dividerHighContrast: 'var(--color-divider-high-contrast)',
  dividerEmphasized: 'var(--color-divider-emphasized)',

  // Disabled/Effects
  disabledOverlay: 'var(--color-disabled-overlay)',
  glimmer: 'var(--color-glimmer)',
  glimmerHighContrast: 'var(--color-glimmer-high-contrast)',
  shadowElevation: 'var(--color-shadow-elevation)',

  // Literal color sets - Blue
  blueBackground: 'var(--color-blue-background)',
  blueBorder: 'var(--color-blue-border)',
  blueIcon: 'var(--color-blue-icon)',
  blueText: 'var(--color-blue-text)',

  // Cyan
  cyanBackground: 'var(--color-cyan-background)',
  cyanBorder: 'var(--color-cyan-border)',
  cyanIcon: 'var(--color-cyan-icon)',
  cyanText: 'var(--color-cyan-text)',

  // Gray
  grayBackground: 'var(--color-gray-background)',
  grayBorder: 'var(--color-gray-border)',
  grayIcon: 'var(--color-gray-icon)',
  grayText: 'var(--color-gray-text)',

  // Green
  greenBackground: 'var(--color-green-background)',
  greenBorder: 'var(--color-green-border)',
  greenIcon: 'var(--color-green-icon)',
  greenText: 'var(--color-green-text)',

  // Orange
  orangeBackground: 'var(--color-orange-background)',
  orangeBorder: 'var(--color-orange-border)',
  orangeIcon: 'var(--color-orange-icon)',
  orangeText: 'var(--color-orange-text)',

  // Pink
  pinkBackground: 'var(--color-pink-background)',
  pinkBorder: 'var(--color-pink-border)',
  pinkIcon: 'var(--color-pink-icon)',
  pinkText: 'var(--color-pink-text)',

  // Purple
  purpleBackground: 'var(--color-purple-background)',
  purpleBorder: 'var(--color-purple-border)',
  purpleIcon: 'var(--color-purple-icon)',
  purpleText: 'var(--color-purple-text)',

  // Red
  redBackground: 'var(--color-red-background)',
  redBorder: 'var(--color-red-border)',
  redIcon: 'var(--color-red-icon)',
  redText: 'var(--color-red-text)',

  // Teal
  tealBackground: 'var(--color-teal-background)',
  tealBorder: 'var(--color-teal-border)',
  tealIcon: 'var(--color-teal-icon)',
  tealText: 'var(--color-teal-text)',

  // Yellow
  yellowBackground: 'var(--color-yellow-background)',
  yellowBorder: 'var(--color-yellow-border)',
  yellowIcon: 'var(--color-yellow-icon)',
  yellowText: 'var(--color-yellow-text)',
});

// =============================================================================
// Spacing Tokens
// =============================================================================

export const spacing = stylex.defineConsts({
  space0: 'var(--spacing-0)',
  space0_5: 'var(--spacing-0-5)',
  space1: 'var(--spacing-1)',
  space2: 'var(--spacing-2)',
  space3: 'var(--spacing-3)',
  space4: 'var(--spacing-4)',
  space5: 'var(--spacing-5)',
  space6: 'var(--spacing-6)',
  space7: 'var(--spacing-7)',
});

// =============================================================================
// Radius Tokens
// =============================================================================

export const radius = stylex.defineConsts({
  rounded: 'var(--radius-rounded)',
  container: 'var(--radius-container)',
  element: 'var(--radius-element)',
  content: 'var(--radius-content)',
  inner: 'var(--radius-inner)',
});

// =============================================================================
// Elevation Tokens
// =============================================================================

export const elevation = stylex.defineConsts({
  base: 'var(--elevation-base)',
  thumb: 'var(--elevation-thumb)',
  dialog: 'var(--elevation-dialog)',
  hover: 'var(--elevation-hover)',
  menu: 'var(--elevation-menu)',
});

// =============================================================================
// Transition Tokens
// =============================================================================

export const transition = stylex.defineConsts({
  fast: 'var(--transition-fast)',
  normal: 'var(--transition-normal)',
});

// =============================================================================
// Typography Tokens
// =============================================================================

export const typography = stylex.defineConsts({
  fontFamilyBody: 'var(--font-body)',
  fontFamilyCode: 'var(--font-code)',
  fontFamilyHeading: 'var(--font-heading)',
});

// =============================================================================
// Token Key Types - For theme authoring
// =============================================================================

export type ColorTokenKey = keyof typeof color;
export type SpacingTokenKey = keyof typeof spacing;
export type RadiusTokenKey = keyof typeof radius;
export type ElevationTokenKey = keyof typeof elevation;
export type TransitionTokenKey = keyof typeof transition;
export type TypographyTokenKey = keyof typeof typography;

// =============================================================================
// CSS Variable Name Types - For strict theme validation
// =============================================================================
// These types ensure theme files define exactly the required CSS variables.
// If you add/remove a token above, update the corresponding VarName type.

export type ColorVarName =
  | '--color-accent'
  | '--color-accent-deemphasized'
  | '--color-accent-text'
  | '--color-surface'
  | '--color-wash'
  | '--color-overlay'
  | '--color-hover-overlay'
  | '--color-pressed-overlay'
  | '--color-focus-outline'
  | '--color-deemphasized'
  | '--color-text-primary'
  | '--color-text-secondary'
  | '--color-text-disabled'
  | '--color-text-link'
  | '--color-text-placeholder'
  | '--color-icon-primary'
  | '--color-icon-secondary'
  | '--color-icon-tertiary'
  | '--color-icon-disabled'
  | '--color-card'
  | '--color-popover'
  | '--color-navbar'
  | '--color-positive'
  | '--color-positive-deemphasized'
  | '--color-negative'
  | '--color-negative-deemphasized'
  | '--color-warning'
  | '--color-warning-deemphasized'
  | '--color-educational'
  | '--color-educational-deemphasized'
  | '--color-divider'
  | '--color-divider-high-contrast'
  | '--color-divider-emphasized'
  | '--color-disabled-overlay'
  | '--color-glimmer'
  | '--color-glimmer-high-contrast'
  | '--color-shadow-elevation'
  | '--color-blue-background'
  | '--color-blue-border'
  | '--color-blue-icon'
  | '--color-blue-text'
  | '--color-cyan-background'
  | '--color-cyan-border'
  | '--color-cyan-icon'
  | '--color-cyan-text'
  | '--color-gray-background'
  | '--color-gray-border'
  | '--color-gray-icon'
  | '--color-gray-text'
  | '--color-green-background'
  | '--color-green-border'
  | '--color-green-icon'
  | '--color-green-text'
  | '--color-orange-background'
  | '--color-orange-border'
  | '--color-orange-icon'
  | '--color-orange-text'
  | '--color-pink-background'
  | '--color-pink-border'
  | '--color-pink-icon'
  | '--color-pink-text'
  | '--color-purple-background'
  | '--color-purple-border'
  | '--color-purple-icon'
  | '--color-purple-text'
  | '--color-red-background'
  | '--color-red-border'
  | '--color-red-icon'
  | '--color-red-text'
  | '--color-teal-background'
  | '--color-teal-border'
  | '--color-teal-icon'
  | '--color-teal-text'
  | '--color-yellow-background'
  | '--color-yellow-border'
  | '--color-yellow-icon'
  | '--color-yellow-text';

export type SpacingVarName =
  | '--spacing-0'
  | '--spacing-0-5'
  | '--spacing-1'
  | '--spacing-2'
  | '--spacing-3'
  | '--spacing-4'
  | '--spacing-5'
  | '--spacing-6'
  | '--spacing-7';

export type RadiusVarName =
  | '--radius-rounded'
  | '--radius-container'
  | '--radius-element'
  | '--radius-content'
  | '--radius-inner';

export type ElevationVarName =
  | '--elevation-base'
  | '--elevation-thumb'
  | '--elevation-dialog'
  | '--elevation-hover'
  | '--elevation-menu';

export type TransitionVarName =
  | '--transition-fast'
  | '--transition-normal';

export type TypographyVarName =
  | '--font-body'
  | '--font-code'
  | '--font-heading';
