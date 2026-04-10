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
  IconShapeRole,
} from './XDSSVGIcon';

export {variations, opticalSize} from './variations.stylex';
export {iconVars} from './tokens.stylex';

export {
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
  menuIcon,
  starterIcons,
} from './icons';
