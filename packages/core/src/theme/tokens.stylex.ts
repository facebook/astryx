/**
 * XDS Design Tokens
 *
 * Defines all CSS variables using StyleX defineVars.
 * These are the base tokens that themes can override.
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Color tokens - using light mode defaults
 * Themes override these with light-dark() values
 */
export const colorTokens = stylex.defineVars({
  // Core semantic
  accent: '#0064E0',
  accentDeemphasized: '#0082FB33',
  accentText: '#0143B5',
  surface: '#FFFFFF',
  wash: '#F1F4F7',
  overlay: '#01122866',
  hoverOverlay: '#0536590C',
  pressedOverlay: '#05365919',
  focusOutline: '#042F97',
  deemphasized: '#0536590C',

  // Text
  textPrimary: '#0A1317',
  textSecondary: '#4E606F',
  textDisabled: '#A4B0BC',
  textLink: '#0064E0',
  textPlaceholder: '#4E606F',

  // Icon
  iconPrimary: '#0A1317',
  iconSecondary: '#4E606F',
  iconTertiary: '#748695',
  iconDisabled: '#A4B0BC',

  // Surface variants
  card: '#FFFFFF',
  popover: '#FFFFFF',
  navbar: '#FFFFFF',

  // Status/Sentiment
  positive: '#0D8626',
  positiveDeemphasized: '#0B991F33',
  negative: '#E3193B',
  negativeDeemphasized: '#E3193B33',
  warning: '#E9AF08',
  warningDeemphasized: '#E2A40033',
  educational: '#5B08D8',
  educationalDeemphasized: '#7952FF33',

  // Divider
  divider: '#05365919',
  dividerHighContrast: '#647685',
  dividerEmphasized: '#CCD3DB',

  // Disabled/Effects
  disabledOverlay: '#FFFFFF7F',
  glimmer: '#CCD3DB',
  glimmerHighContrast: '#A4B0BC',
  shadowElevation: 'rgba(5, 54, 89, 0.1)',

  // Literal color sets - Blue
  blueBackground: '#0171E333',
  blueBorder: '#0171E3',
  blueIcon: '#0064E0',
  blueText: '#042F97',

  // Cyan
  cyanBackground: '#00BCD433',
  cyanBorder: '#00BCD4',
  cyanIcon: '#00ACC1',
  cyanText: '#006064',

  // Gray
  grayBackground: '#0A131733',
  grayBorder: '#647685',
  grayIcon: '#4E606F',
  grayText: '#0A1317',

  // Green
  greenBackground: '#24BB5E33',
  greenBorder: '#24BB5E',
  greenIcon: '#0D8626',
  greenText: '#09441F',

  // Orange
  orangeBackground: '#F2790233',
  orangeBorder: '#F27902',
  orangeIcon: '#E9690B',
  orangeText: '#6B2203',

  // Pink
  pinkBackground: '#E91E6333',
  pinkBorder: '#E91E63',
  pinkIcon: '#C2185B',
  pinkText: '#880E4F',

  // Purple
  purpleBackground: '#7952FF33',
  purpleBorder: '#7952FF',
  purpleIcon: '#5B08D8',
  purpleText: '#3E0697',

  // Red
  redBackground: '#E3193B33',
  redBorder: '#E3193B',
  redIcon: '#D31130',
  redText: '#7B0210',

  // Teal
  tealBackground: '#0DB7AF33',
  tealBorder: '#0DB7AF',
  tealIcon: '#009688',
  tealText: '#083943',

  // Yellow
  yellowBackground: '#FFEB3B33',
  yellowBorder: '#FFEB3B',
  yellowIcon: '#FBC02D',
  yellowText: '#F57F17',
});

/**
 * Spacing tokens
 */
export const spacingTokens = stylex.defineVars({
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

/**
 * Radius tokens
 */
export const radiusTokens = stylex.defineVars({
  rounded: '9999px',
  container: '16px',
  element: '12px',
  content: '8px',
});

/**
 * Elevation tokens
 */
export const elevationTokens = stylex.defineVars({
  base: '0px 0px 1px rgba(0, 0, 0, 0.1)',
  thumb: '0 1px 3px rgba(0, 0, 0, 0.2)',
  dialog: '0px 2px 2px rgba(0, 0, 0, 0.1), 0px 8px 24px rgba(0, 0, 0, 0.1)',
  hover: '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 2px 12px rgba(0, 0, 0, 0.1)',
  menu: '0px 1px 1px rgba(0, 0, 0, 0.1), 0px 2px 8px rgba(0, 0, 0, 0.1)',
});

/**
 * Transition tokens
 */
export const transitionTokens = stylex.defineVars({
  fast: '0.15s ease',
  normal: '0.2s ease',
});

/**
 * Typography tokens
 */
export const typographyTokens = stylex.defineVars({
  fontFamilyBody:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyCode: '"SF Mono", Monaco, Consolas, monospace',
  fontFamilyHeading:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});
