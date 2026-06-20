// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.stylex.ts
 * @input XDS design token system
 * @output CSS custom properties for SVG icon rendering
 * @position Token definitions consumed by SVGIcon and variation presets
 *
 * Two-layer system (primary/secondary) with per-role rendering (fill vs stroke).
 * Bold mode uses mask-based gap subtraction controlled by --icon-gap tokens.
 */

import * as stylex from '@stylexjs/stylex';

export const iconVars = stylex.defineVars({
  // Primary layer — fill-role elements
  '--icon-layer-primary-fill': 'none',
  '--icon-layer-primary-stroke': 'currentColor',
  '--icon-layer-primary-opacity': '1',

  // Primary layer — stroke-role elements (lines that never become fills)
  '--icon-layer-primary-stroke-role-fill': 'none',
  '--icon-layer-primary-stroke-role-stroke': 'currentColor',
  '--icon-layer-primary-stroke-role-opacity': '1',
  '--icon-layer-primary-stroke-role-width': '1.5',

  // Secondary layer — fill-role elements
  '--icon-layer-secondary-fill': 'none',
  '--icon-layer-secondary-stroke': 'currentColor',
  '--icon-layer-secondary-opacity': '1',

  // Secondary layer — stroke-role elements
  '--icon-layer-secondary-stroke-role-fill': 'none',
  '--icon-layer-secondary-stroke-role-stroke': 'currentColor',
  '--icon-layer-secondary-stroke-role-opacity': '1',
  '--icon-layer-secondary-stroke-role-width': '1.5',

  // QoL adjustments
  '--icon-size': '24px',
  '--icon-stroke-width': '1.5',
  '--icon-stroke-linecap': 'round',
  '--icon-stroke-linejoin': 'round',
  '--icon-padding': '0px',
  '--icon-inline-offset': '0px',
  '--icon-block-offset': '0px',

  // Bold mode adjustments
  '--icon-bold-stroke-boost': '0.5',

  // Bold mode mask gaps
  '--icon-gap': '0.75',
  '--icon-gap-linejoin': 'round',
});
