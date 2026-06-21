// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file variations.stylex.ts
 * @input Icon token vars
 * @output StyleX styles for each icon variation preset
 * @position Consumed by SVGIcon to apply variation-specific token overrides
 *
 * Each variation sets tokens for both fill-role and stroke-role elements
 * per the path role system. Stroke-role elements (lines, detail strokes)
 * never become fills — they stay as strokes across all variations.
 */

import * as stylex from '@stylexjs/stylex';
import {iconVars} from './tokens.stylex';

export const variations = stylex.create({
  linear: {
    // Fill-role: stroked outlines
    [iconVars['--icon-layer-primary-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-primary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke-role-opacity']]: '1',
    // Secondary
    [iconVars['--icon-layer-secondary-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke-role-opacity']]: '1',
  },
  bold: {
    // Fill-role: solid filled (mask handles overlaps)
    [iconVars['--icon-layer-primary-fill']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke']]: 'none',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    // Stroke-role: stays stroked, thicker for visual weight
    [iconVars['--icon-layer-primary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke-role-opacity']]: '1',
    [iconVars['--icon-layer-primary-stroke-role-width']]: '2',
    // Secondary
    [iconVars['--icon-layer-secondary-fill']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke']]: 'none',
    [iconVars['--icon-layer-secondary-opacity']]: '1',
    [iconVars['--icon-layer-secondary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke-role-opacity']]: '1',
    [iconVars['--icon-layer-secondary-stroke-role-width']]: '2.5',
  },
  twotone: {
    // Fill-role: stroked, full opacity
    [iconVars['--icon-layer-primary-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    // Stroke-role: stroked, reduced opacity
    [iconVars['--icon-layer-primary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke-role-opacity']]: '0.4',
    // Secondary: reduced opacity
    [iconVars['--icon-layer-secondary-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-opacity']]: '0.4',
    [iconVars['--icon-layer-secondary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke-role-opacity']]: '0.4',
  },
  bulk: {
    // Fill-role: solid filled
    [iconVars['--icon-layer-primary-fill']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke']]: 'none',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    // Stroke-role: reduced opacity
    [iconVars['--icon-layer-primary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke-role-opacity']]: '0.4',
    // Secondary: filled at reduced opacity
    [iconVars['--icon-layer-secondary-fill']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke']]: 'none',
    [iconVars['--icon-layer-secondary-opacity']]: '0.4',
    [iconVars['--icon-layer-secondary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke-role-opacity']]: '0.4',
  },
  broken: {
    [iconVars['--icon-layer-primary-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-opacity']]: '1',
    [iconVars['--icon-layer-primary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-primary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-primary-stroke-role-opacity']]: '1',
    // Secondary hidden
    [iconVars['--icon-layer-secondary-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-opacity']]: '0',
    [iconVars['--icon-layer-secondary-stroke-role-fill']]: 'none',
    [iconVars['--icon-layer-secondary-stroke-role-stroke']]: 'currentColor',
    [iconVars['--icon-layer-secondary-stroke-role-opacity']]: '0',
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
