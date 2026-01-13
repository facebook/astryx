/**
 * XDS Pre-defined Themes
 *
 * Uses CSS light-dark() function for automatic light/dark mode switching.
 * The browser picks the appropriate value based on the color-scheme property.
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  elevationTokens,
} from './tokens.stylex';

/**
 * Color theme with light-dark() values
 * Automatically adapts based on color-scheme CSS property
 */
export const colorTheme = stylex.createTheme(colorTokens, {
  // Core semantic
  accent: 'light-dark(#0064E0, #2694FE)',
  accentDeemphasized: 'light-dark(#0082FB33, #0082FB3F)',
  accentText: 'light-dark(#0143B5, #4BA9FE)',
  surface: 'light-dark(#FFFFFF, #1F1F22)',
  wash: 'light-dark(#F1F4F7, #111112)',
  overlay: 'light-dark(#01122866, #11111299)',
  hoverOverlay: 'light-dark(#0536590C, #FFFFFF0C)',
  pressedOverlay: 'light-dark(#05365919, #FFFFFF19)',
  focusOutline: 'light-dark(#042F97, #AFD7FF)',
  deemphasized: 'light-dark(#0536590C, #1111127F)',

  // Text
  textPrimary: 'light-dark(#0A1317, #DFE2E5)',
  textSecondary: 'light-dark(#4E606F, #AAAFB5)',
  textDisabled: 'light-dark(#A4B0BC, #6F747C)',
  textLink: 'light-dark(#0064E0, #3E9EFB)',
  textPlaceholder: 'light-dark(#4E606F, #AAAFB5)',

  // Icon
  iconPrimary: 'light-dark(#0A1317, #DFE2E5)',
  iconSecondary: 'light-dark(#4E606F, #AAAFB5)',
  iconTertiary: 'light-dark(#748695, #8C939B)',
  iconDisabled: 'light-dark(#A4B0BC, #6F747C)',

  // Surface variants
  card: 'light-dark(#FFFFFF, #1F1F22)',
  popover: 'light-dark(#FFFFFF, #28292C)',
  navbar: 'light-dark(#FFFFFF, #1F1F22)',

  // Status/Sentiment
  positive: 'light-dark(#0D8626, #0D8626)',
  positiveDeemphasized: 'light-dark(#0B991F33, #0B991F3F)',
  negative: 'light-dark(#E3193B, #F5394F)',
  negativeDeemphasized: 'light-dark(#E3193B33, #F5394F3F)',
  warning: 'light-dark(#E9AF08, #F2C00B)',
  warningDeemphasized: 'light-dark(#E2A40033, #E2A4003F)',
  educational: 'light-dark(#5B08D8, #6B1EFD)',
  educationalDeemphasized: 'light-dark(#7952FF33, #5B08D83F)',

  // Divider
  divider: 'light-dark(#05365919, #F2F4F619)',
  dividerHighContrast: 'light-dark(#647685, #6F747C)',
  dividerEmphasized: 'light-dark(#CCD3DB, #494D53)',

  // Disabled/Effects
  disabledOverlay: 'light-dark(#FFFFFF7F, #1F1F227F)',
  glimmer: 'light-dark(#CCD3DB, #5A5E66)',
  glimmerHighContrast: 'light-dark(#A4B0BC, #8C939B)',
  shadowElevation: 'light-dark(rgba(5, 54, 89, 0.1), rgba(0, 0, 0, 0.3))',

  // Literal color sets - Blue
  blueBackground: 'light-dark(#0171E333, #0171E333)',
  blueBorder: 'light-dark(#0171E3, #4BA9FE)',
  blueIcon: 'light-dark(#0064E0, #2694FE)',
  blueText: 'light-dark(#042F97, #AFD7FF)',

  // Cyan
  cyanBackground: 'light-dark(#00BCD433, #00BCD433)',
  cyanBorder: 'light-dark(#00BCD4, #4DD0E1)',
  cyanIcon: 'light-dark(#00ACC1, #26C6DA)',
  cyanText: 'light-dark(#006064, #B2EBF2)',

  // Gray
  grayBackground: 'light-dark(#0A131733, #666A724C)',
  grayBorder: 'light-dark(#647685, #8C939B)',
  grayIcon: 'light-dark(#4E606F, #AAAFB5)',
  grayText: 'light-dark(#0A1317, #E7EAED)',

  // Green
  greenBackground: 'light-dark(#24BB5E33, #24BB5E33)',
  greenBorder: 'light-dark(#24BB5E, #4CD964)',
  greenIcon: 'light-dark(#0D8626, #26A756)',
  greenText: 'light-dark(#09441F, #A5F690)',

  // Orange
  orangeBackground: 'light-dark(#F2790233, #F2790233)',
  orangeBorder: 'light-dark(#F27902, #FFA040)',
  orangeIcon: 'light-dark(#E9690B, #FB8C00)',
  orangeText: 'light-dark(#6B2203, #FDB876)',

  // Pink
  pinkBackground: 'light-dark(#E91E6333, #E91E6333)',
  pinkBorder: 'light-dark(#E91E63, #F48FB1)',
  pinkIcon: 'light-dark(#C2185B, #EC407A)',
  pinkText: 'light-dark(#880E4F, #F8BBD0)',

  // Purple
  purpleBackground: 'light-dark(#7952FF33, #7952FF33)',
  purpleBorder: 'light-dark(#7952FF, #9575CD)',
  purpleIcon: 'light-dark(#5B08D8, #7952FF)',
  purpleText: 'light-dark(#3E0697, #B3B0FE)',

  // Red
  redBackground: 'light-dark(#E3193B33, #E3193B33)',
  redBorder: 'light-dark(#E3193B, #F5394F)',
  redIcon: 'light-dark(#D31130, #E3193B)',
  redText: 'light-dark(#7B0210, #FFB2B8)',

  // Teal
  tealBackground: 'light-dark(#0DB7AF33, #0DB7AF33)',
  tealBorder: 'light-dark(#0DB7AF, #4DB6AC)',
  tealIcon: 'light-dark(#009688, #26A69A)',
  tealText: 'light-dark(#083943, #40DCCD)',

  // Yellow
  yellowBackground: 'light-dark(#FFEB3B33, #FFEB3B33)',
  yellowBorder: 'light-dark(#FFEB3B, #FFF176)',
  yellowIcon: 'light-dark(#FBC02D, #FFEE58)',
  yellowText: 'light-dark(#F57F17, #FFF9C4)',
});

/**
 * Elevation theme with light-dark() values
 */
export const elevationTheme = stylex.createTheme(elevationTokens, {
  base: 'light-dark(0px 0px 1px rgba(0, 0, 0, 0.1), 0px 0px 1px #111112)',
  thumb: 'light-dark(0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.4))',
  dialog: 'light-dark(0px 2px 2px rgba(0, 0, 0, 0.1) 0px 8px 24px rgba(0, 0, 0, 0.1), 0px 2px 2px rgba(0, 0, 0, 0.2) 0px 8px 24px rgba(0, 0, 0, 0.3))',
  hover: 'light-dark(0px 1px 2px rgba(0, 0, 0, 0.1) 0px 2px 12px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.2) 0px 2px 12px rgba(0, 0, 0, 0.2))',
  menu: 'light-dark(0px 1px 1px rgba(0, 0, 0, 0.1) 0px 2px 8px rgba(0, 0, 0, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.2) 0px 2px 8px rgba(0, 0, 0, 0.2))',
});

// Legacy exports for backwards compatibility
export const lightTheme = colorTheme;
export const darkTheme = colorTheme;
export const lightElevationTheme = elevationTheme;
export const darkElevationTheme = elevationTheme;
