// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageControlModel.ts
 * @input The UIKit page-control table (`pageControl`, motion/uikit)
 * @output Pure page-control math: the control's size for a page count, the
 *   window of indicators (which pages show, at what size, and when the
 *   window moves), the step a tap makes, the page a scrubbing finger points
 *   at, and how fast the control steps past the window's edge
 * @position Model of the lab PageControl; no DOM
 *
 * Coordinates are along the row, in px, measured from the centre of the
 * window's first slot; RTL callers mirror them before calling.
 *
 * SYNC: When modified, update pageControlModel.test.ts and PageControl.tsx.
 */

import {pageControl} from '@astryxdesign/core/motion/uikit';

const PC = pageControl;

/**
 * Each indicator is a whole-pixel box scaled to its size (9.67 px, or the
 * window's shrunk edge sizes). Chromium snaps a box's edges to whole CSS
 * pixels when it paints, so a 9.67 px box paints 9 or 10 px wide depending
 * on where it falls: every few indicators an oval. A 10 px box keeps its
 * shape wherever it falls, and `scale` brings it to size around its centre.
 */
export const BOX = Math.ceil(PC.indicatorSize);

/** An opacity transition of `ms` on the curve's control points. */
export const fadeOf = (ms: number, curve: ReadonlyArray<number>): string =>
  `opacity ${ms / 1000}s cubic-bezier(${curve.join(', ')})`;

/** The opacity switch every indicator change makes under a finger. */
export const SWITCH = fadeOf(PC.switchMs, PC.switchCurve);

/** `page` rounded into 0 to `count - 1`. */
export function clampPage(page: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(page)));
}

/** What asked for a page: a tap fades the old indicator faster. */
export type ChangeKind = 'tap' | 'other';

/** The control's state as its gestures and timers read it, after renders. */
export interface Latest {
  current: number;
  pages: number;
  windowStart: number;
  onChange: (page: number) => void;
}

/** Distance between neighbouring indicators' centres, px. */
export const PITCH = PC.indicatorSize + PC.indicatorSpacing;

export interface PageControlLayout {
  /** The control's width, px. */
  width: number;
  /** How many indicator slots show. */
  slots: number;
  /** Width of the row of shown slots, px; may exceed `width`. */
  rowWidth: number;
  /** Whether there are more pages than slots, so the row is a window. */
  isWindowed: boolean;
}

/** The control's size for `count` pages (UIPageControl's, as measured). */
export function pageControlLayout(count: number): PageControlLayout {
  const n = Math.max(0, Math.floor(count));
  const slots = Math.min(n, PC.visibleSlots);
  const rowWidth = slots === 0 ? 0 : slots * PITCH - PC.indicatorSpacing;
  const natural =
    (n === 0 ? 0 : n * PITCH - PC.indicatorSpacing) + 2 * PC.horizontalPadding;
  const hundredths = (value: number) => Math.round(value * 100) / 100;
  return {
    width: hundredths(Math.min(natural, PC.maxWidth)),
    slots,
    rowWidth: hundredths(rowWidth),
    isWindowed: n > PC.visibleSlots,
  };
}

/**
 * Outside iOS the row is every page at full size, cropped by the control
 * when it is wider: how far it shifts toward its start (px) so the current
 * indicator stays in view, centred where it can be, pinned at either end.
 */
export function croppedRowOffset(count: number, current: number): number {
  const n = Math.max(0, Math.floor(count));
  const row = n === 0 ? 0 : n * PITCH - PC.indicatorSpacing;
  const visible = pageControlLayout(n).width - 2 * PC.horizontalPadding;
  if (row <= visible) {
    return 0;
  }
  const center = current * PITCH + PC.indicatorSize / 2;
  return Math.max(0, Math.min(row - visible, center - visible / 2));
}

/**
 * Diameter of page `page`'s indicator while the window starts at
 * `windowStart`: full inside the window, the two edge sizes in its last two
 * slots on a side where pages continue, 0 outside it.
 */
export function indicatorSize(
  count: number,
  windowStart: number,
  page: number,
): number {
  if (count <= PC.visibleSlots) {
    return page >= 0 && page < count ? PC.indicatorSize : 0;
  }
  const slot = page - windowStart;
  if (slot < 0 || slot >= PC.visibleSlots) {
    return 0;
  }
  const [near, far] = PC.edgeIndicatorSizes;
  if (windowStart > 0) {
    if (slot === 0) {
      return far;
    }
    if (slot === 1) {
      return near;
    }
  }
  if (windowStart + PC.visibleSlots < count) {
    if (slot === PC.visibleSlots - 1) {
      return far;
    }
    if (slot === PC.visibleSlots - 2) {
      return near;
    }
  }
  return PC.indicatorSize;
}

/** First and last pages shown at full size. */
export function fullPages(
  count: number,
  windowStart: number,
): [first: number, last: number] {
  if (count <= PC.visibleSlots) {
    return [0, count - 1];
  }
  const first = windowStart + (windowStart > 0 ? 2 : 0);
  const last =
    windowStart +
    PC.visibleSlots -
    1 -
    (windowStart + PC.visibleSlots < count ? 2 : 0);
  return [first, last];
}

/**
 * The window after the current page changes: unchanged while the current
 * page is at full size, otherwise moved the least that makes it so.
 */
export function windowFor(
  count: number,
  windowStart: number,
  current: number,
): number {
  if (count <= PC.visibleSlots) {
    return 0;
  }
  const maxStart = count - PC.visibleSlots;
  let start = Math.max(0, Math.min(maxStart, windowStart));
  for (let guard = 0; guard <= count; guard++) {
    const [first, last] = fullPages(count, start);
    if (current > last && start < maxStart) {
      start += 1;
    } else if (current < first && start > 0) {
      start -= 1;
    } else {
      break;
    }
  }
  return start;
}

/**
 * The page a tap moves to: one page toward the side of the current
 * indicator the tap landed on (trailing = forward), clamped to the pages.
 * `x` and `currentCenter` are in the same horizontal coordinates.
 */
export function tapTarget(
  x: number,
  currentCenter: number,
  current: number,
  count: number,
  isRtl: boolean,
): number {
  const trailing = isRtl ? x < currentCenter : x > currentCenter;
  const next = current + (trailing ? PC.tapStep : -PC.tapStep);
  return Math.max(0, Math.min(count - 1, next));
}

/**
 * The page under a scrubbing finger `x` px along the row from the centre of
 * the window's first slot: it switches at the midpoint between indicators,
 * and stays within the pages shown at full size.
 */
export function scrubTarget(
  x: number,
  count: number,
  windowStart: number,
): number {
  const slot = Math.floor(x / PITCH + PC.scrubSwitchPoint);
  const start = count <= PC.visibleSlots ? 0 : windowStart;
  const [first, last] = fullPages(count, start);
  return Math.max(first, Math.min(last, start + slot));
}

/**
 * Seconds until the next page while a scrubbing finger is `distance` px past
 * the edge of the control's content (Infinity when it is not past it).
 */
export function jogInterval(distance: number): number {
  if (!(distance > 0)) {
    return Infinity;
  }
  return 1 / Math.min(PC.jogMaxRate, PC.jogRatePerPoint * distance);
}
