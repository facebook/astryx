// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input SVGIcon module
 * @output Re-exports all SVG icon system components, types, utilities, and starter icons
 * @position Entry point for the lab SVG icon system
 */

export {SVGIcon} from './SVGIcon';
export type {
  SVGIconProps,
  SVGIconVariation,
  SVGIconSize,
  SVGIconColor,
  SVGIconDef,
  IconShape,
  IconShapeRole,
} from './SVGIcon';

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
  heartIcon,
  eyeIcon,
  starIcon,
  folderIcon,
  shieldIcon,
  searchIcon,
  mailIcon,
  lockIcon,
  starterIcons,
} from './icons';

// XIF spec types
export type {
  XIFIcon,
  XIFPath,
  XIFPersonality,
  XIFAnimate,
  XIFSlot,
} from './xif-types';

// XIF example icons
export {
  xifCheck,
  xifHome,
  xifFile,
  xifShield,
  xifBell,
  xifStar,
  xifBellOverride,
  xifExamples,
} from './xif-examples';

// Path transforms
export {
  roundCorners,
  addCurvature,
  adjustTension,
  applyPersonality,
  type PathPersonality,
} from './pathTransforms';
