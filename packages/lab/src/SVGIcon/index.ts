'use client';

/**
 * @file index.ts
 * @input SVGIcon module
 * @output Re-exports all SVG icon system components, types, utilities, and starter icons
 * @position Entry point for the lab SVG icon system
 */

export {XDSSVGIcon} from './XDSSVGIcon';
export type {
  XDSSVGIconProps,
  SVGIconVariation,
  SVGIconSize,
  SVGIconColor,
  SVGIconDef,
  IconShape,
} from './XDSSVGIcon';

export {variations, opticalSize} from './variations.stylex';
export {iconVars} from './tokens.stylex';

export {convertSVG, iconDefToTSX, iconDefToSVG} from './convertSVG';

export {
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
  starterIcons,
} from './icons';
