/**
 * @file variations.stylex.ts
 * @input Icon token vars
 * @output StyleX styles for each icon variation preset (linear, bold, twotone, bulk, broken)
 * @position Consumed by XDSSVGIcon to apply variation-specific token overrides
 */

import * as stylex from '@stylexjs/stylex';
import {iconVars} from './tokens.stylex';

/**
 * Variation presets that map to Iconsax-equivalent styles.
 * Each preset overrides the layer tokens to produce a distinct visual treatment
 * from the same SVG paths.
 */
export const variations = stylex.create({
  linear: {
    [iconVars['--icon-layer-primary-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-opacity']]: '1',
  },
  bold: {
    [iconVars['--icon-layer-primary-fill']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke']]: 'none',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-fill']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke']]: 'none',
    [iconVars['--icon-layer-secondary-opacity']]: '1',
  },
  twotone: {
    [iconVars['--icon-layer-primary-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-opacity']]: '0.4',
  },
  bulk: {
    [iconVars['--icon-layer-primary-fill']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke']]: 'none',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-fill']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke']]: 'none',
    [iconVars['--icon-layer-secondary-opacity']]: '0.4',
  },
  broken: {
    [iconVars['--icon-layer-primary-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-opacity']]: '0',
  },
});

/** Optical size compensation — thicker strokes at smaller sizes */
export const opticalSize = stylex.create({
  xsm: {
    [iconVars['--icon-stroke-width']]: '2',
    [iconVars['--icon-size']]: '12px',
  },
  sm: {
    [iconVars['--icon-stroke-width']]: '1.75',
    [iconVars['--icon-size']]: '16px',
  },
  md: {
    [iconVars['--icon-stroke-width']]: '1.5',
    [iconVars['--icon-size']]: '20px',
  },
  lg: {
    [iconVars['--icon-stroke-width']]: '1.5',
    [iconVars['--icon-size']]: '24px',
  },
});
