// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listRow.stylex.ts
 * @input Uses StyleX
 * @output Exports `listRowConsts` (the build-time mirror of the touch row
 *   heights in motion/uikit/list.ts, `list.metrics`), `listRowStyles` (a
 *   row's minimum height under a finger) and `listRowTargetStyles` (a
 *   CheckboxList row that toggles: that height, or the theme's touch target
 *   when it is taller)
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
import {sizeVars} from '../theme/tokens.stylex';

export const listRowConsts = stylex.defineConsts({
  /** `list.metrics.rowHeight`: a one-line row on iOS under a finger. */
  touchRowHeight: '52px',
  /** `list.metrics.subtitleRowHeight`: a row with a description. */
  touchSubtitleRowHeight: '62px',
});

/**
 * The touch gate (utils/touchPresentation.ts TOUCH_QUERY), spelled exactly as
 * the resolver specifies: a coarse primary pointer, iOS and Android alike
 * (one touch model).
 */
const TOUCH = '@media (pointer: coarse)';

/**
 * A row's height under a finger: UIKit's table rows, at least that tall, the
 * same on every touch platform. A compact list keeps its density, and with a
 * mouse the row keeps today's height. A theme's `min-height` on `list-item`
 * replaces it.
 */
export const listRowStyles = stylex.create({
  touchOneLine: {
    minHeight: {
      default: null,
      [TOUCH]: listRowConsts.touchRowHeight,
    },
  },
  touchTwoLine: {
    minHeight: {
      default: null,
      [TOUCH]: listRowConsts.touchSubtitleRowHeight,
    },
  },
});

/**
 * A CheckboxList row that toggles, at balanced or spacious density, under a
 * finger: the row height above, or the theme's touch target
 * (`--size-touch-target`, Indicator/touchTarget.stylex.ts) when that is
 * taller, so a theme that raises the target raises these rows too.
 * CheckboxListItem composes it after ListItem's `listRowStyles`, which it
 * replaces.
 */
export const listRowTargetStyles = stylex.create({
  touchOneLine: {
    minHeight: {
      default: null,
      [TOUCH]: `max(${sizeVars['--size-touch-target']}, ${listRowConsts.touchRowHeight})`,
    },
  },
  touchTwoLine: {
    minHeight: {
      default: null,
      [TOUCH]: `max(${sizeVars['--size-touch-target']}, ${listRowConsts.touchSubtitleRowHeight})`,
    },
  },
});
