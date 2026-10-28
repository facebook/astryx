// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionMotion.stylex.ts
 * @input Uses StyleX
 * @output Exports `selectionMotionConsts`: the build-time mirror of
 *   `selection.mark` in motion/uikit/selection.ts
 * @position Internal styling constants; CheckboxIndicator and RadioIndicator
 *   read them for their touch presentation
 *
 * Under a finger (a coarse primary pointer, on every touch device) a
 * checkbox or radio mark changes the way UIKit's selection marks do: in the
 * frame the selection lands, with no animation of its own.
 * StyleX evaluates a style at build time and cannot read the constants table,
 * so this mirrors the table's value; selectionMotion.test.ts fails if they
 * drift. With a mouse the marks keep the theme's duration and easing
 * tokens.
 *
 * SYNC: When modified, update /packages/core/src/motion/uikit/selection.ts
 * and selectionMotion.test.ts.
 */

import * as stylex from '@stylexjs/stylex';

export const selectionMotionConsts = stylex.defineConsts({
  /** `selection.mark.changeMs`, in ms. */
  markChangeMs: 0,
});
