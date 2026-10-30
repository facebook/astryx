// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSwipeAction.test.ts
 * @input vitest; the pure geometry of useSwipeAction and the UIKit constants
 * @output The geometry every moving part follows (the window never moves on
 *   screen, the track moves with the row, the entries stay pinned until the
 *   open width and ride the row past it, the full swipe's look) for both
 *   sides in both directions. The moving parts' curves come from the
 *   interactive-transition driver, which keeps every part a function of the
 *   root's at every instant (motion/interactive.test.ts)
 * @position Unit tests of packages/core/src/Item/useSwipeAction.ts; the hook
 *   itself is tested through Item.test.tsx and the interaction spec
 */

import {describe, expect, it} from 'vitest';
import {physicalSign, swipeParts, type SwipeLayout} from './useSwipeAction';

const LAYOUTS: SwipeLayout[] = [
  {inlineSign: 1, openWidth: 144, outerWidth: 72, side: 'leading'},
  {inlineSign: 1, openWidth: 144, outerWidth: 72, side: 'trailing'},
  {inlineSign: -1, openWidth: 144, outerWidth: 72, side: 'leading'},
  {inlineSign: -1, openWidth: 144, outerWidth: 72, side: 'trailing'},
];

describe('swipeParts', () => {
  it('puts a side on the physical edge its direction names', () => {
    // Leading sits at the inline start: the left in LTR, the right in RTL.
    expect(physicalSign('leading', 1)).toBe(1);
    expect(physicalSign('trailing', 1)).toBe(-1);
    expect(physicalSign('leading', -1)).toBe(-1);
    expect(physicalSign('trailing', -1)).toBe(1);
  });

  it.each(LAYOUTS)(
    'moves the row toward the side, keeps the window over the resting box and the track with the row, pins the entries until the open width and lets them ride the row past it ($side, inline sign $inlineSign)',
    layout => {
      const sign = physicalSign(layout.side, layout.inlineSign);
      // Pinned with the outer edge of the entries at the side's edge: the
      // entries' far edge is the open width in from it.
      const pinned = sign * layout.openWidth;
      for (const travel of [0, 1, 36, 72, 144, 200, 324]) {
        const parts = swipeParts(travel, layout);
        // The row slides away from the side's edge.
        expect(parts.root).toBe(sign * travel);
        // The window stays over the resting box.
        expect(parts.root + parts.panel).toBe(0);
        // The track moves with the row, so its part inside the window is
        // exactly the vacated space.
        expect(parts.track).toBe(parts.root);
        if (travel <= layout.openWidth) {
          // The entries stay where they were on screen.
          expect(parts.track + parts.entries).toBe(pinned);
        } else {
          // Past the open width they ride the row, beside it.
          expect(parts.entries).toBeCloseTo(0, 10);
        }
        // Not confirmed: the outermost entry is in its place, the others
        // show.
        expect(parts.outer).toBeCloseTo(0, 10);
        expect(parts.fade).toBe(1);
      }
    },
  );

  it.each(LAYOUTS)(
    'on a confirmed full swipe slides the outermost entry to the row and fades the others ($side, inline sign $inlineSign)',
    layout => {
      const sign = physicalSign(layout.side, layout.inlineSign);
      const parts = swipeParts(300, layout, 1);
      // From the outer end of the entries to their row end: past the others.
      expect(parts.outer).toBe(sign * (layout.openWidth - layout.outerWidth));
      expect(parts.fade).toBe(0);
    },
  );
});
