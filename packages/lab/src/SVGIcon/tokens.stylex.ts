/**
 * @file tokens.stylex.ts
 * @input XDS design token system
 * @output CSS custom properties for SVG icon rendering
 * @position Token definitions consumed by XDSSVGIcon and variation presets
 *
 * Defines the CSS variable surface that controls all icon rendering parameters.
 * Two-layer system: primary (main shapes) and secondary (detail elements).
 */

import * as stylex from '@stylexjs/stylex';

export const iconVars = stylex.defineVars({
  // Primary layer
  '--icon-layer-primary-fill': 'none',
  '--icon-layer-primary-stroke': 'currentColor',
  '--icon-layer-primary-opacity': '1',

  // Secondary layer
  '--icon-layer-secondary-fill': 'none',
  '--icon-layer-secondary-stroke': 'currentColor',
  '--icon-layer-secondary-opacity': '1',

  // QoL adjustments
  '--icon-size': '24px',
  '--icon-stroke-width': '1.5',
  '--icon-stroke-linecap': 'round',
  '--icon-stroke-linejoin': 'round',
  '--icon-padding': '0px',
  '--icon-inline-offset': '0px',
  '--icon-block-offset': '0px',
});
