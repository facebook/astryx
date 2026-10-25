// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchTarget.stylex.ts
 * @input Uses StyleX and the theme's touch target size
 *   (`--size-touch-target`, theme/tokens.stylex.ts)
 * @output Exports `touchTargetStyles`: a selection control's target under a
 *   coarse primary pointer (a row at least that tall, a native control at
 *   least that square)
 * @position Internal styling utility; CheckboxInput and RadioListItem compose
 *   `touchTargetStyles`
 *
 * On a touch screen (primary pointer coarse) a checkbox or a radio option is
 * as easy to hit as an iOS control: the size is the theme's touch target,
 * whose default is the platform's control size (44 × 44 pt in Apple's Human
 * Interface Guidelines), so a dense theme can tune it. The visible box, circle and label keep their
 * size: only the target grows. Mouse and trackpad layouts are unchanged.
 */

import * as stylex from '@stylexjs/stylex';

import {sizeVars} from '../theme/tokens.stylex';

const TOUCH = '@media (pointer: coarse)';
const TARGET = sizeVars['--size-touch-target'];

export const touchTargetStyles = stylex.create({
  /** A row that is the option's target: at least the touch target tall. */
  row: {
    minHeight: {default: null, [TOUCH]: TARGET},
  },
  /**
   * A native control drawn smaller than its target (a checkbox's input over
   * its 20 or 24 px box): at least the touch target each way, centred on the
   * visual by its own positioning.
   */
  control: {
    minInlineSize: {default: null, [TOUCH]: TARGET},
    minBlockSize: {default: null, [TOUCH]: TARGET},
  },
});
