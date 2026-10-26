// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tabBarModel.ts
 * @input The UIKit tab-bar table (`tabBar` from
 *   `@astryxdesign/core/motion`)
 * @output Exports the TabBar's pure geometry: the items' shared width and
 *   their centres in the capsule, and the capsule's natural width
 * @position Math of the lab TabBar (TabBar.tsx); no DOM, no React
 *
 * Coordinates are the capsule's own, in px: x from the capsule's left edge
 * (physical, in both writing directions), items in logical order. TabBar.tsx
 * lays the same geometry out in CSS (`itemWidthCss` is the same formula);
 * these numbers start the lens's slide from where it was.
 *
 * SYNC: When modified, update tabBarModel.test.ts, TabBar.tsx (its CSS
 * spelling of the same geometry) and /packages/core/src/motion/uikit/tabBar.ts
 * (the values' sources).
 */

import {tabBar} from '@astryxdesign/core/motion/uikit';

/** The widest a capsule of `count` tabs gets without a search tab, px. */
export function naturalWidth(count: number): number {
  return tabBar.naturalWidth.base + tabBar.naturalWidth.perTab * count;
}

/**
 * The width every item (and the resting lens) has in a capsule `width` px
 * wide, never wider than the capsule's inside.
 */
export function itemWidth(width: number, count: number): number {
  const {perSlot, perBar, offset} = tabBar.itemWidth;
  return Math.min(
    (perSlot * width) / Math.max(count, 1) + perBar * width + offset,
    width - 2 * tabBar.itemInset,
  );
}

/**
 * The same width as a CSS expression of the capsule's width, `100cqw` (the
 * capsule is the size container), for use inside `calc()`.
 */
export function itemWidthCss(count: number): string {
  const {perSlot, perBar, offset} = tabBar.itemWidth;
  const sign = offset < 0 ? '-' : '+';
  const inside = `100cqw - ${2 * tabBar.itemInset}px`;
  return `min(${perSlot} * 100cqw / ${Math.max(count, 1)} + ${perBar} * 100cqw ${sign} ${Math.abs(offset)}px, ${inside})`;
}

/**
 * The centres of `count` items in a capsule `width` px wide, in logical
 * order: the first and last items sit `itemInset` from the edges and the
 * others are spread evenly between them. In a right-to-left capsule the
 * first item is on the right.
 */
export function itemCenters(
  width: number,
  count: number,
  isRtl = false,
): number[] {
  if (count <= 0) {
    return [];
  }
  const size = itemWidth(width, count);
  const first = tabBar.itemInset + size / 2;
  const centers =
    count === 1
      ? [width / 2]
      : Array.from(
          {length: count},
          (_, i) => first + ((width - 2 * first) * i) / (count - 1),
        );
  return isRtl ? centers.map(center => width - center) : centers;
}
