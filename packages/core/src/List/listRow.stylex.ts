// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listRow.stylex.ts
 * @input Uses StyleX
 * @output Exports `listRowConsts` (the build-time mirror of the touch row
 *   heights in motion/uikit/list.ts, `list.metrics`) and `listRowStyles` (a
 *   row's minimum height under the touch media query)
 * @position Internal styling utility; ListItem composes `listRowStyles`
 *
 * StyleX evaluates a style at build time and cannot read the constants
 * table, so these are the table's `list.metrics` values as CSS lengths, and
 * List.test.tsx fails if they drift. They are sizes, not motion: a theme
 * that sets a `min-height` on its `list-item` target replaces them.
 *
 * The styles live beside the constants on purpose: StyleX inlines a
 * `defineConsts` value it reads in the same file, while a value imported
 * into another file compiles to a custom property reference that the
 * production build never defines.
 *
 * SYNC: When modified, update motion/uikit/list.ts and List.test.tsx.
 */

import * as stylex from '@stylexjs/stylex';

export const listRowConsts = stylex.defineConsts({
  /** `list.metrics.rowHeight`: a one-line row on a touch screen. */
  touchRowHeight: '52px',
  /** `list.metrics.subtitleRowHeight`: a row with a description. */
  touchSubtitleRowHeight: '62px',
  /** `list.metrics.controlSize`: the floor of a compact touch row. */
  touchControlSize: '44px',
});

/**
 * The touch presentation's query (utils/touchPresentation.ts TOUCH_QUERY),
 * written out: StyleX needs a literal media key.
 */
const TOUCH = '@media (pointer: coarse)';

/**
 * A row's height on a touch screen (primary pointer coarse): UIKit's table
 * rows, at least that tall, never shorter than the platform's control size.
 * A theme's `min-height` on `list-item` replaces it.
 */
export const listRowStyles = stylex.create({
  touchOneLine: {
    minHeight: {default: null, [TOUCH]: listRowConsts.touchRowHeight},
  },
  touchTwoLine: {
    minHeight: {default: null, [TOUCH]: listRowConsts.touchSubtitleRowHeight},
  },
  touchCompact: {
    minHeight: {default: null, [TOUCH]: listRowConsts.touchControlSize},
  },
});
