/**
 * Brutalist Theme
 *
 * Techno-brutalist aesthetic: monospace everything, neon accents on dark
 * surfaces, zero border-radius, hard shadows, high contrast.
 *
 * Overrides: colors, typography, radius, elevation.
 * Inherits defaults: spacing, size, textSize, lineHeight, fontWeight, transition.
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
import {brutalistIconRegistry} from './icons';

// =============================================================================
// Color Overrides — neon on dark, inverted for light
// =============================================================================

const colorOverrides = {
  // Core semantic — neon green accent
  '--color-accent': 'light-dark(#0A0A0A, #39FF14)',
  '--color-accent-deemphasized': 'light-dark(#0A0A0A1A, #39FF1426)',
  '--color-accent-text': 'light-dark(#0A0A0A, #39FF14)',
  '--color-surface': 'light-dark(#F5F5F5, #0A0A0A)',
  '--color-wash': 'light-dark(#E8E8E8, #000000)',
  '--color-overlay': 'light-dark(#00000080, #000000CC)',
  '--color-hover-overlay': 'light-dark(#0000000D, #FFFFFF0D)',
  '--color-pressed-overlay': 'light-dark(#00000019, #FFFFFF19)',
  '--color-focus-outline': 'light-dark(#0A0A0A, #39FF14)',
  '--color-focus-outline-error': 'light-dark(#FF003C, #FF003C)',
  '--color-focus-outline-success': 'light-dark(#39FF14, #39FF14)',
  '--color-focus-outline-warning': 'light-dark(#FFE600, #FFE600)',
  '--color-deemphasized': 'light-dark(#0000000D, #FFFFFF0D)',

  // Text — high contrast
  '--color-text-primary': 'light-dark(#0A0A0A, #F0F0F0)',
  '--color-text-secondary': 'light-dark(#555555, #999999)',
  '--color-text-disabled': 'light-dark(#999999, #444444)',
  '--color-text-link': 'light-dark(#0A0A0A, #39FF14)',
  '--color-text-placeholder': 'light-dark(#777777, #555555)',
  '--color-text-on-media': 'light-dark(#FFFFFF, #0A0A0A)',

  // Icon
  '--color-icon-primary': 'light-dark(#0A0A0A, #F0F0F0)',
  '--color-icon-secondary': 'light-dark(#555555, #999999)',
  '--color-icon-tertiary': 'light-dark(#777777, #666666)',
  '--color-icon-disabled': 'light-dark(#999999, #444444)',
  '--color-icon-on-media': 'light-dark(#FFFFFF, #0A0A0A)',

  // Surface variants — dark cards with subtle neon borders
  '--color-card': 'light-dark(#FFFFFF, #111111)',
  '--color-popover': 'light-dark(#FFFFFF, #151515)',
  '--color-navbar': 'light-dark(#F5F5F5, #0A0A0A)',

  // Status — vivid neon tones
  '--color-positive': 'light-dark(#00CC66, #39FF14)',
  '--color-positive-deemphasized': 'light-dark(#00CC6626, #39FF1426)',
  '--color-negative': 'light-dark(#FF003C, #FF003C)',
  '--color-negative-deemphasized': 'light-dark(#FF003C26, #FF003C26)',
  '--color-warning': 'light-dark(#FFE600, #FFE600)',
  '--color-warning-deemphasized': 'light-dark(#FFE60026, #FFE60026)',
  '--color-educational': 'light-dark(#BF00FF, #E040FB)',
  '--color-educational-deemphasized': 'light-dark(#BF00FF26, #E040FB26)',

  // Divider — neon-tinted borders
  '--color-divider': 'light-dark(#0A0A0A1A, #39FF1426)',
  '--color-divider-high-contrast': 'light-dark(#0A0A0A, #39FF14)',
  '--color-divider-emphasized': 'light-dark(#0A0A0A33, #39FF1433)',

  // Disabled/Effects
  '--color-disabled-overlay': 'light-dark(#F5F5F580, #0A0A0A80)',
  '--color-glimmer': 'light-dark(#CCCCCC, #333333)',
  '--color-glimmer-high-contrast': 'light-dark(#999999, #555555)',
  '--color-shadow-elevation':
    'light-dark(rgba(0, 0, 0, 0.2), rgba(57, 255, 20, 0.15))',
  '--color-hover-tint': 'light-dark(black, white)',

  // Literal colors — neon palette
  '--color-blue-background': 'light-dark(#00D4FF26, #00D4FF26)',
  '--color-blue-border': 'light-dark(#00D4FF, #00D4FF)',
  '--color-blue-icon': 'light-dark(#00AACC, #00D4FF)',
  '--color-blue-text': 'light-dark(#005566, #66EEFF)',

  '--color-cyan-background': 'light-dark(#00FFFF26, #00FFFF26)',
  '--color-cyan-border': 'light-dark(#00CCCC, #00FFFF)',
  '--color-cyan-icon': 'light-dark(#009999, #00FFFF)',
  '--color-cyan-text': 'light-dark(#006666, #66FFFF)',

  '--color-gray-background': 'light-dark(#0A0A0A1A, #FFFFFF1A)',
  '--color-gray-border': 'light-dark(#555555, #666666)',
  '--color-gray-icon': 'light-dark(#555555, #999999)',
  '--color-gray-text': 'light-dark(#0A0A0A, #F0F0F0)',

  '--color-green-background': 'light-dark(#39FF1426, #39FF1426)',
  '--color-green-border': 'light-dark(#00CC66, #39FF14)',
  '--color-green-icon': 'light-dark(#00AA44, #39FF14)',
  '--color-green-text': 'light-dark(#005522, #88FF66)',

  '--color-orange-background': 'light-dark(#FF660026, #FF660026)',
  '--color-orange-border': 'light-dark(#FF6600, #FF8800)',
  '--color-orange-icon': 'light-dark(#CC5500, #FF8800)',
  '--color-orange-text': 'light-dark(#663300, #FFAA44)',

  '--color-pink-background': 'light-dark(#FF00FF26, #FF00FF26)',
  '--color-pink-border': 'light-dark(#FF00FF, #FF44FF)',
  '--color-pink-icon': 'light-dark(#CC00CC, #FF44FF)',
  '--color-pink-text': 'light-dark(#660066, #FF88FF)',

  '--color-purple-background': 'light-dark(#BF00FF26, #E040FB26)',
  '--color-purple-border': 'light-dark(#BF00FF, #E040FB)',
  '--color-purple-icon': 'light-dark(#9900CC, #E040FB)',
  '--color-purple-text': 'light-dark(#4D0066, #EE88FF)',

  '--color-red-background': 'light-dark(#FF003C26, #FF003C26)',
  '--color-red-border': 'light-dark(#FF003C, #FF003C)',
  '--color-red-icon': 'light-dark(#CC0030, #FF003C)',
  '--color-red-text': 'light-dark(#660018, #FF6688)',

  '--color-teal-background': 'light-dark(#00FFCC26, #00FFCC26)',
  '--color-teal-border': 'light-dark(#00CCAA, #00FFCC)',
  '--color-teal-icon': 'light-dark(#009977, #00FFCC)',
  '--color-teal-text': 'light-dark(#004D3D, #66FFE0)',

  '--color-yellow-background': 'light-dark(#FFE60026, #FFE60026)',
  '--color-yellow-border': 'light-dark(#FFE600, #FFE600)',
  '--color-yellow-icon': 'light-dark(#CCBB00, #FFE600)',
  '--color-yellow-text': 'light-dark(#665C00, #FFF066)',
} as const;

// =============================================================================
// Typography — monospace everything
// =============================================================================

const typographyOverrides = {
  '--font-body':
    '"SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace',
  '--font-code':
    '"SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace',
  '--font-heading':
    '"SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace',
} as const;

// =============================================================================
// Radius — zero. No rounded corners.
// =============================================================================

const radiusOverrides = {
  '--radius-rounded': '0px',
  '--radius-container': '0px',
  '--radius-element': '0px',
  '--radius-content': '0px',
  '--radius-inner': '0px',
} as const;

// =============================================================================
// Elevation — hard shadows, neon glow in dark mode
// =============================================================================

const elevationOverrides = {
  '--elevation-base':
    'light-dark(2px 2px 0px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(57, 255, 20, 0.2))',
  '--elevation-thumb':
    'light-dark(2px 2px 0px rgba(0, 0, 0, 0.25), 0 0 4px rgba(57, 255, 20, 0.3))',
  '--elevation-dialog':
    'light-dark(4px 4px 0px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(57, 255, 20, 0.3))',
  '--elevation-hover':
    'light-dark(3px 3px 0px rgba(0, 0, 0, 0.15), 0 0 8px rgba(57, 255, 20, 0.2))',
  '--elevation-menu':
    'light-dark(3px 3px 0px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(57, 255, 20, 0.25))',
  '--elevation-input-hover':
    'light-dark(inset 0 0 0 2px rgba(10, 10, 10, 0.3), inset 0 0 0 2px rgba(57, 255, 20, 0.4))',
  '--elevation-input-hover-success':
    'light-dark(inset 0 0 0 2px rgba(0, 204, 102, 0.4), inset 0 0 0 2px rgba(57, 255, 20, 0.5))',
  '--elevation-input-hover-warning':
    'light-dark(inset 0 0 0 2px rgba(255, 230, 0, 0.4), inset 0 0 0 2px rgba(255, 230, 0, 0.5))',
  '--elevation-input-hover-error':
    'light-dark(inset 0 0 0 2px rgba(255, 0, 60, 0.4), inset 0 0 0 2px rgba(255, 0, 60, 0.5))',
} as const;

// =============================================================================
// createTheme calls
// =============================================================================

const colorTheme = stylex.createTheme(
  colorVars,
  colorOverrides as unknown as typeof colorDefaults,
);

const typographyTheme = stylex.createTheme(
  typographyVars,
  typographyOverrides as unknown as typeof typographyDefaults,
);

const radiusTheme = stylex.createTheme(
  radiusVars,
  radiusOverrides as unknown as typeof radiusDefaults,
);

const elevationTheme = stylex.createTheme(
  elevationVars,
  elevationOverrides as unknown as typeof elevationDefaults,
);

// =============================================================================
// Component Style Overrides — neon borders, hard edges
// =============================================================================

const buttonVariants = stylex.create({
  // Primary: neon accent bg, dark text
  primary: {
    color: 'light-dark(#FFFFFF, #0A0A0A)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  // Secondary: bordered with neon accent
  secondary: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-high-contrast'],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
});

// Card: neon border glow
const cardStyles = stylex.create({
  container: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
  },
});

// Text input: neon border
const textInputStyles = stylex.create({
  wrapper: {
    borderColor: colorVars['--color-divider-emphasized'],
  },
});

/**
 * Heading styles — monospace, uppercase for h1-h3
 */
const headingStyles = stylex.create({
  h1: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-2xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.2,
    color: colorVars['--color-text-primary'],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  h2: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-primary'],
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  h3: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-lg'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.25,
    color: colorVars['--color-text-primary'],
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
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
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: 0,
  },
});

const headingEditorialStyles = stylex.create({
  h1: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-4xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.2,
    color: colorVars['--color-text-primary'],
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: 0,
  },
  h2: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-3xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.3333333333333333,
    color: colorVars['--color-text-primary'],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  h3: {
    fontFamily: typographyVars['--font-heading'],
    fontSize: textSizeVars['--text-2xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.4,
    color: colorVars['--color-text-primary'],
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
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
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
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
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
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

export const brutalistTheme: Theme = {
  name: 'brutalist',
  icons: brutalistIconRegistry,
  styles: {
    colors: colorTheme,
    typography: typographyTheme,
    radius: radiusTheme,
    elevation: elevationTheme,
  },
  raw: {
    colors: colorOverrides,
    typography: typographyOverrides,
    radius: radiusOverrides,
    elevation: elevationOverrides,
  },
  components: {
    button: {
      variants: buttonVariants,
    },
    card: {
      container: cardStyles.container,
    },
    textInput: {
      wrapper: textInputStyles.wrapper,
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
