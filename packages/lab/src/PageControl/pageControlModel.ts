// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageControlModel.ts
 * @input The UIKit page-control table (`uikit.pageControl`)
 * @output Pure page-control math: the control's size for a page count, the
 *   offset that keeps the current indicator in view when the indicators
 *   outgrow the width cap, and the step a tap makes
 * @position Model of the lab PageControl; no DOM
 *
 * SYNC: When modified, update pageControlModel.test.ts and PageControl.tsx.
 */

import {uikit} from '@astryxdesign/core/motion/experimental';

const PC = uikit.pageControl;

export interface PageControlLayout {
  /** The control's width, px. */
  width: number;
  /** The width of the full row of indicators, px. */
  stripWidth: number;
  /** Whether the row is wider than the control shows. */
  isWindowed: boolean;
}

/** The control's size for `count` pages (UIPageControl's, as measured). */
export function pageControlLayout(count: number): PageControlLayout {
  const n = Math.max(0, Math.floor(count));
  const stripWidth =
    n === 0 ? 0 : n * PC.indicatorSize + (n - 1) * PC.indicatorSpacing;
  const natural = stripWidth + 2 * PC.horizontalPadding;
  return {
    width: Math.min(natural, PC.maxWidth),
    stripWidth,
    isWindowed: natural > PC.maxWidth,
  };
}

/**
 * How far the row of indicators shifts toward the start (px) so the current
 * one stays inside a windowed control: centred where it can be, pinned at
 * either end.
 */
export function windowOffset(count: number, current: number): number {
  const {width, stripWidth, isWindowed} = pageControlLayout(count);
  if (!isWindowed) {
    return 0;
  }
  const visible = width - 2 * PC.horizontalPadding;
  const step = PC.indicatorSize + PC.indicatorSpacing;
  const center = current * step + PC.indicatorSize / 2;
  return Math.max(0, Math.min(stripWidth - visible, center - visible / 2));
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
