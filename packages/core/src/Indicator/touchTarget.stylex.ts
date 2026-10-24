// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchTarget.stylex.ts
 * @input Uses StyleX
 * @output Exports `touchTargetConsts` (the build-time mirror of the control
 *   size in motion/uikit/list.ts, `list.metrics.controlSize`) and
 *   `touchTargetStyles` (a selection control's target under the touch media
 *   query: a row at least that tall, a native control at least that square)
 * @position Internal styling utility; CheckboxInput and RadioListItem compose
 *   `touchTargetStyles`
 *
 * On a touch screen (primary pointer coarse) a checkbox or a radio option is
 * as easy to hit as an iOS control: the Human Interface Guidelines put iOS
 * controls at 44 × 44 pt. StyleX evaluates a style at build time and cannot
 * read the constants table, so this is the table's `list.metrics.controlSize`
 * as a CSS length, and touchTarget.test.tsx fails if they drift. The styles
 * live beside the constant on purpose (as in List/listRow.stylex.ts): StyleX
 * inlines a `defineConsts` value it reads in the same file. Mouse and
 * trackpad layouts are unchanged.
 *
 * SYNC: When modified, update motion/uikit/list.ts and touchTarget.test.tsx.
 */

import * as stylex from '@stylexjs/stylex';

export const touchTargetConsts = stylex.defineConsts({
  /** `list.metrics.controlSize`: the platform's control size. */
  controlSize: '44px',
});

/**
 * The touch presentation's query (utils/touchPresentation.ts TOUCH_QUERY),
 * written out: StyleX needs a literal media key.
 */
const TOUCH = '@media (pointer: coarse)';

export const touchTargetStyles = stylex.create({
  /** A row that is the option's target: at least the control size tall. */
  row: {
    minHeight: {default: null, [TOUCH]: touchTargetConsts.controlSize},
  },
  /**
   * A native control drawn smaller than its target (a checkbox's input over
   * its 20 or 24 px box): at least the control size each way, centred on the
   * visual by its own positioning.
   */
  control: {
    minInlineSize: {default: null, [TOUCH]: touchTargetConsts.controlSize},
    minBlockSize: {default: null, [TOUCH]: touchTargetConsts.controlSize},
  },
});
