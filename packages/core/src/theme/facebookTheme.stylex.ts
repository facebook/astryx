import * as stylex from '@stylexjs/stylex';
import type {Theme} from './types';
import {
  colorVars,
  spacingVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
} from './tokens.stylex';
import type {
  ColorVarName,
  SpacingVarName,
  RadiusVarName,
  ElevationVarName,
  TransitionVarName,
  TypographyVarName,
  BaseColorRaw,
  BaseSpacingRaw,
  BaseRadiusRaw,
  BaseElevationRaw,
  BaseTransitionRaw,
  BaseTypographyRaw,
} from './tokens.stylex';

const colorRaw = {
  '--color-accent': 'light-dark(#0866FF, #2D88FF)',
  '--color-accent-deemphasized': 'light-dark(#0866FF33, #2D88FF3F)',
  '--color-accent-text': 'light-dark(#0866FF, #4599FF)',
  '--color-surface': 'light-dark(#FFFFFF, #242526)',
  '--color-wash': 'light-dark(#F0F2F5, #18191A)',
  '--color-overlay': 'light-dark(#1C1E2166, #00000099)',
  '--color-hover-overlay': 'light-dark(#0000000A, #FFFFFF0A)',
  '--color-pressed-overlay': 'light-dark(#00000014, #FFFFFF14)',
  '--color-focus-outline': 'light-dark(#0866FF, #2D88FF)',
  '--color-deemphasized': 'light-dark(#0000000A, #FFFFFF0F)',
  '--color-text-primary': 'light-dark(#050505, #E4E6EB)',
  '--color-text-secondary': 'light-dark(#65676B, #B0B3B8)',
  '--color-text-disabled': 'light-dark(#BCC0C4, #606770)',
  '--color-text-link': 'light-dark(#0866FF, #2D88FF)',
  '--color-text-placeholder': 'light-dark(#65676B, #B0B3B8)',
  '--color-icon-primary': 'light-dark(#050505, #E4E6EB)',
  '--color-icon-secondary': 'light-dark(#65676B, #B0B3B8)',
  '--color-icon-tertiary': 'light-dark(#8A8D91, #8A8D91)',
  '--color-icon-disabled': 'light-dark(#BCC0C4, #606770)',
  '--color-card': 'light-dark(#FFFFFF, #242526)',
  '--color-popover': 'light-dark(#FFFFFF, #3A3B3C)',
  '--color-navbar': 'light-dark(#FFFFFF, #242526)',
  '--color-positive': 'light-dark(#31A24C, #31A24C)',
  '--color-positive-deemphasized': 'light-dark(#31A24C33, #31A24C3F)',
  '--color-negative': 'light-dark(#FA383E, #FA383E)',
  '--color-negative-deemphasized': 'light-dark(#FA383E33, #FA383E3F)',
  '--color-warning': 'light-dark(#F7B928, #F7B928)',
  '--color-warning-deemphasized': 'light-dark(#F7B92833, #F7B9283F)',
  '--color-educational': 'light-dark(#8A3AB9, #A855F7)',
  '--color-educational-deemphasized': 'light-dark(#8A3AB933, #A855F73F)',
  '--color-divider': 'light-dark(#CED0D4, #3E4042)',
  '--color-divider-high-contrast': 'light-dark(#8A8D91, #606770)',
  '--color-divider-emphasized': 'light-dark(#767676, #4E4F50)',
  '--color-disabled-overlay': 'light-dark(#FFFFFF7F, #2425267F)',
  '--color-glimmer': 'light-dark(#E4E6EB, #4E4F50)',
  '--color-glimmer-high-contrast': 'light-dark(#BCC0C4, #606770)',
  '--color-shadow-elevation': 'light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5))',
  '--color-blue-background': 'light-dark(#0866FF33, #2D88FF33)',
  '--color-blue-border': 'light-dark(#0866FF, #2D88FF)',
  '--color-blue-icon': 'light-dark(#0866FF, #2D88FF)',
  '--color-blue-text': 'light-dark(#0866FF, #4599FF)',
  '--color-cyan-background': 'light-dark(#00BCD433, #00BCD433)',
  '--color-cyan-border': 'light-dark(#00BCD4, #4DD0E1)',
  '--color-cyan-icon': 'light-dark(#00ACC1, #26C6DA)',
  '--color-cyan-text': 'light-dark(#006064, #B2EBF2)',
  '--color-gray-background': 'light-dark(#E4E6EB, #3A3B3C)',
  '--color-gray-border': 'light-dark(#8A8D91, #606770)',
  '--color-gray-icon': 'light-dark(#65676B, #B0B3B8)',
  '--color-gray-text': 'light-dark(#050505, #E4E6EB)',
  '--color-green-background': 'light-dark(#31A24C33, #31A24C33)',
  '--color-green-border': 'light-dark(#31A24C, #42B72A)',
  '--color-green-icon': 'light-dark(#31A24C, #42B72A)',
  '--color-green-text': 'light-dark(#1D6F2D, #7FD98E)',
  '--color-orange-background': 'light-dark(#F7923333, #F7923333)',
  '--color-orange-border': 'light-dark(#F79233, #FFA040)',
  '--color-orange-icon': 'light-dark(#F79233, #FB8C00)',
  '--color-orange-text': 'light-dark(#9C5700, #FFB74D)',
  '--color-pink-background': 'light-dark(#E91E6333, #E91E6333)',
  '--color-pink-border': 'light-dark(#E91E63, #F48FB1)',
  '--color-pink-icon': 'light-dark(#C2185B, #EC407A)',
  '--color-pink-text': 'light-dark(#880E4F, #F8BBD0)',
  '--color-purple-background': 'light-dark(#8A3AB933, #8A3AB933)',
  '--color-purple-border': 'light-dark(#8A3AB9, #A855F7)',
  '--color-purple-icon': 'light-dark(#8A3AB9, #A855F7)',
  '--color-purple-text': 'light-dark(#5B247A, #C4B5FD)',
  '--color-red-background': 'light-dark(#FA383E33, #FA383E33)',
  '--color-red-border': 'light-dark(#FA383E, #FA383E)',
  '--color-red-icon': 'light-dark(#FA383E, #FA383E)',
  '--color-red-text': 'light-dark(#C4161C, #FF8589)',
  '--color-teal-background': 'light-dark(#0DB7AF33, #0DB7AF33)',
  '--color-teal-border': 'light-dark(#0DB7AF, #4DB6AC)',
  '--color-teal-icon': 'light-dark(#009688, #26A69A)',
  '--color-teal-text': 'light-dark(#083943, #40DCCD)',
  '--color-yellow-background': 'light-dark(#F7B92833, #F7B92833)',
  '--color-yellow-border': 'light-dark(#F7B928, #FFD54F)',
  '--color-yellow-icon': 'light-dark(#F7B928, #FFCA28)',
  '--color-yellow-text': 'light-dark(#996800, #FFF59D)',
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

const radiusRaw = {
  '--radius-rounded': '9999px',
  '--radius-container': '8px',
  '--radius-element': '6px',
  '--radius-content': '4px',
  '--radius-inner': '0px',
} as const satisfies Record<RadiusVarName, string>;

const elevationRaw = {
  '--elevation-base': '0px 0px 1px light-dark(rgba(0, 0, 0, 0.1), #18191A)',
  '--elevation-thumb': '0 1px 3px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))',
  '--elevation-dialog': '0px 2px 4px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 12px 28px light-dark(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.4))',
  '--elevation-hover': '0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 4px 12px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--elevation-menu': '0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 8px 16px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
} as const satisfies Record<ElevationVarName, string>;

const transitionRaw = {
  '--transition-fast': '0.1s ease-out',
  '--transition-normal': '0.2s ease-out',
} as const satisfies Record<TransitionVarName, string>;

const typographyRaw = {
  '--font-body': 'Helvetica, Arial, sans-serif',
  '--font-code': '"SF Mono", Monaco, Consolas, monospace',
  '--font-heading': 'Helvetica, Arial, sans-serif',
} as const satisfies Record<TypographyVarName, string>;

const colorTheme = stylex.createTheme(colorVars, colorRaw as unknown as BaseColorRaw);
const spacingTheme = stylex.createTheme(spacingVars, spacingRaw as unknown as BaseSpacingRaw);
const radiusTheme = stylex.createTheme(radiusVars, radiusRaw as unknown as BaseRadiusRaw);
const elevationTheme = stylex.createTheme(elevationVars, elevationRaw as unknown as BaseElevationRaw);
const transitionTheme = stylex.createTheme(transitionVars, transitionRaw as unknown as BaseTransitionRaw);
const typographyTheme = stylex.createTheme(typographyVars, typographyRaw as unknown as BaseTypographyRaw);

const buttonVariants = stylex.create({
  primary: {fontWeight: 600},
  secondary: {backgroundColor: 'light-dark(#E4E6EB, #3A3B3C)', fontWeight: 600},
  ghost: {fontWeight: 600},
  destructive: {fontWeight: 600},
});

export const facebookTheme: Theme = {
  name: 'facebook',
  styles: {
    colors: colorTheme,
    spacing: spacingTheme,
    radius: radiusTheme,
    elevation: elevationTheme,
    transition: transitionTheme,
    typography: typographyTheme,
  },
  raw: {
    colors: colorRaw,
    spacing: spacingRaw,
    radius: radiusRaw,
    elevation: elevationRaw,
    transition: transitionRaw,
    typography: typographyRaw,
  },
  components: {
    button: {
      variants: buttonVariants,
    },
  },
};
