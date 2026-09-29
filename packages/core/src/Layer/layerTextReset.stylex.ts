// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerTextReset.stylex.ts
 * @input Uses StyleX, the active theme's body typography tokens, and the
 *   Stepper connector-gap default
 * @output Shared text and scoped-presentation baseline for Core layer roots
 * @position Private Core styling; AST-038 owns the accepted contract
 */

import * as stylex from '@stylexjs/stylex';
import {typeScaleVars, typographyVars} from '../theme/tokens.stylex';

/**
 * Apply before component and consumer styles on the layer's content boundary.
 * Top-layer promotion does not stop DOM inheritance. Reset the documented text
 * baseline and known scoped presentation channels, not writing context, theme
 * variables, surface colors, geometry, or interaction.
 */
export const layerTextReset = stylex.create({
  reset: {
    // A Stepper may intentionally inherit this public variable in normal DOM
    // composition. A Core layer is a new presentation surface, so it supplies
    // the documented default; an explicit inner Stepper style or theme target
    // remains stronger.
    '--step-connector-gap': '0px',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: typeScaleVars['--text-body-weight'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontStyle: 'normal',
    textAlign: 'start',
    textAlignLast: 'auto',
    textIndent: 0,
    textTransform: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'normal',
    hyphens: 'manual',
  },
});
