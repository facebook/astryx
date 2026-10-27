// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listRow.stylex.ts
 * @input Uses StyleX and the insets utils/hitArea.ts writes on a watched row
 *   (`--astryx-hit-inset-{top,right,bottom,left}`, HIT_INSET_PROPERTIES)
 * @output Exports `listRowStyles`: an interactive row's invisible hit layer
 *   under a finger (`component:List` FR10)
 * @position Internal styling utility; ListItem composes
 *   `listRowStyles.touchHitArea` on every interactive, enabled row and keeps
 *   the row's insets live with `watchHitArea`
 *
 * Under a coarse primary pointer, an interactive row's hit target grows toward
 * the touch target where its neighbors leave room, with no visual change and
 * no layout change. The shared utility (utils/hitArea.ts) measures how far:
 * toward the touch target on each side, stopping at half the gap to the
 * nearest neighboring target (another row, or any control), 0 where they
 * touch. This is the layer that reads its insets: the row's `::after`, grown
 * past the row's top and bottom by them (a row is never narrower than the
 * touch target), and 0 until the first measurement, so first paint and server
 * rendering never overlap a neighbor.
 *
 * The layer is clipped to the strips past the row's own box (an even-odd
 * clip path whose hole is the row), so the row's content and its own
 * controls keep their taps, and a tap in a strip resolves to the row itself.
 * It paints nothing and leaves the row's stacking as it was: no stacking
 * context at rest, which the press layer (utils/rowPressLayer.ts) relies on.
 * With a mouse none of it applies.
 *
 * Under a finger the row's `::after` is this layer, so decorate a list row
 * with a child instead. The property names are spelled out because StyleX
 * evaluates them at build time; List.test.tsx checks them against
 * HIT_INSET_PROPERTIES.
 *
 * SYNC: When modified, update utils/hitArea.ts's HIT_INSET_PROPERTIES and
 * List.test.tsx.
 */

import * as stylex from '@stylexjs/stylex';

/**
 * The touch gate (utils/touchPresentation.ts TOUCH_QUERY), spelled exactly as
 * the resolver specifies: a coarse primary pointer, iOS and Android alike
 * (one touch model).
 */
const TOUCH = '@media (pointer: coarse)';

export const listRowStyles = stylex.create({
  touchHitArea: {
    '::after': {
      content: {default: null, [TOUCH]: '""'},
      position: {default: null, [TOUCH]: 'absolute'},
      // A row is never narrower than the touch target, so only its block
      // edges grow; inline, the layer is the row's own width.
      insetInline: {default: null, [TOUCH]: 0},
      top: {
        default: null,
        [TOUCH]: 'calc(var(--astryx-hit-inset-top, 0px) * -1)',
      },
      bottom: {
        default: null,
        [TOUCH]: 'calc(var(--astryx-hit-inset-bottom, 0px) * -1)',
      },
      // Only the strips past the row: the outer rectangle, then the row's own
      // box as a hole (even-odd), so the row's content stays on top for taps.
      clipPath: {
        default: null,
        [TOUCH]:
          'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 0 var(--astryx-hit-inset-top, 0px), 100% var(--astryx-hit-inset-top, 0px), 100% calc(100% - var(--astryx-hit-inset-bottom, 0px)), 0 calc(100% - var(--astryx-hit-inset-bottom, 0px)), 0 var(--astryx-hit-inset-top, 0px))',
      },
    },
  },
});
