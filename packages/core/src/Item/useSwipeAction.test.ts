// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSwipeAction.test.ts
 * @input vitest; the pure geometry of useSwipeAction
 * @output The geometry every moving part follows (the window never moves on
 *   screen, the track moves with the row, the entries stay pinned) for both
 *   sides in both directions
 * @position Unit tests of packages/core/src/Item/useSwipeAction.ts; the hook
 *   itself is tested through Item.test.tsx and the interaction spec
 */

import {describe, expect, it} from 'vitest';
import {physicalSign, swipeParts, type SwipeLayout} from './useSwipeAction';

const LAYOUTS: SwipeLayout[] = [
  {inlineSign: 1, openWidth: 144, side: 'leading'},
  {inlineSign: 1, openWidth: 144, side: 'trailing'},
  {inlineSign: -1, openWidth: 144, side: 'leading'},
  {inlineSign: -1, openWidth: 144, side: 'trailing'},
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
    'moves the row toward the side and keeps the window, the track and the entries in step ($side, inline sign $inlineSign)',
    layout => {
      const sign = physicalSign(layout.side, layout.inlineSign);
      const pinned =
        swipeParts(0, layout).track + swipeParts(0, layout).entries;
      for (const travel of [0, 1, 36, 72, 144, 200, 324]) {
        const parts = swipeParts(travel, layout);
        // The row slides away from the side's edge.
        expect(parts.root).toBe(sign * travel);
        // The window stays over the resting box.
        expect(parts.root + parts.panel).toBe(0);
        // The track moves with the row, so its part inside the window is
        // exactly the vacated space.
        expect(parts.track).toBe(parts.root);
        // The entries stay where they were on screen: pinned at the outer
        // edge, whatever the travel.
        expect(parts.track + parts.entries).toBe(pinned);
      }
      // Pinned with the outer edge of the entries at the side's edge: the
      // entries' far edge is the open width in from it.
      expect(pinned).toBe(sign * layout.openWidth);
    },
  );

  it('is linear in the travel, so one spring on every part keeps them in step at every instant', () => {
    const layout = LAYOUTS[0];
    const a = swipeParts(20, layout);
    const b = swipeParts(80, layout);
    const mid = swipeParts(50, layout);
    for (const key of ['root', 'panel', 'track', 'entries'] as const) {
      expect(mid[key]).toBeCloseTo((a[key] + b[key]) / 2, 10);
    }
  });
});
