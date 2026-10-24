// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file uikitExitFrames.ts
 * @input UIKit's context-menu dismissal measured on iOS 26.2 (iPhone 17 Pro
 *   simulator, 60 Hz): a 200 × 120 pt card held at its centre, its 3-action
 *   menu (250 × 146 pt) below, then closed
 * @output UIKIT_EXIT_CASES: the menu's glass and the copy's width per frame
 *   from willEnd, for the card in the middle and at the left edge
 * @position Fixture for the exit's parity tests
 *   (packages/core/src/ContextMenu/contextMenuLiftGeometry.test.ts)
 *
 * Columns: ms after willEnd; the glass's centre x and y and its width and
 * height (pt); the copy's width (pt, null once it is back). `startMs` is
 * when they start moving (least squares).
 */

interface ExitCase {
  readonly press: {readonly x: number; readonly y: number};
  readonly menu: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly startMs: number;
  readonly copyStartMs: number;
  readonly frames: ReadonlyArray<
    readonly [
      ms: number,
      x: number,
      y: number,
      width: number,
      height: number,
      copyWidth: number | null,
    ]
  >;
}

export const UIKIT_EXIT_CASES: Readonly<
  Record<'middle' | 'leftEdge', ExitCase>
> = {
  middle: {
    press: {x: 201, y: 437},
    menu: {x: 76, y: 521, width: 250, height: 146},
    startMs: 9,
    copyStartMs: 8.5,
    frames: [
      [24.6, 201, 587.12, 238.03, 141.82, 224.76],
      [41.3, 201, 569.77, 210.27, 130.61, 221.76],
      [58, 201, 547.44, 178.07, 115.71, 218.04],
      [74.6, 201, 524.37, 147.87, 100.57, 214.24],
      [91.3, 201, 503.04, 122.49, 87, 210.75],
      [108, 201, 484.73, 102.52, 75.72, 207.76],
      [124.6, 201, 469.84, 87.53, 66.83, 205.33],
      [141.3, 201, 458.29, 76.65, 60.12, 203.45],
      [158, 201, 449.73, 69.01, 55.24, 202.06],
      [174.6, 201, 443.66, 63.81, 51.83, 201.07],
      [191.3, 201, 439.58, 60.42, 49.56, 200.4],
      [208, 201, 437, 58.33, 48.12, null],
      [224.6, 201, 435.53, 57.16, 47.3, null],
      [241.3, 201, 434.83, 56.61, 46.9, null],
      [258, 201, 434.63, 56.46, 46.77, null],
      [274.6, 201, 434.73, 56.55, 46.81, null],
      [291.3, 201, 435, 56.77, 46.94, null],
      [308, 201, 435.34, 57.05, 47.11, null],
      [324.6, 201, 435.68, 57.33, 47.29, null],
      [341.3, 201, 436.01, 57.59, 47.46, null],
      [358, 201, 436.28, 57.82, 47.61, null],
      [374.6, 201, 436.5, 58, 47.73, null],
      [391.3, 201, 436.68, 58.14, 47.82, null],
      [408, 201, 436.81, 58.25, 47.89, null],
      [424.6, 201, 436.9, 58.32, 47.94, null],
      [441.3, 201, 436.96, 58.39, 47.99, null],
    ],
  },
  leftEdge: {
    press: {x: 104, y: 437},
    menu: {x: 16, y: 521, width: 250, height: 146},
    startMs: 14.5,
    copyStartMs: 14,
    frames: [
      [24.4, 140.25, 591.07, 244.86, 144.22, 225.47],
      [41, 136.67, 576.81, 221.16, 135.27, 222.96],
      [57.7, 131.61, 555.67, 189.57, 121.19, 219.4],
      [74.4, 126.16, 532.5, 158.18, 105.86, 215.57],
      [91, 121, 510.35, 130.92, 91.6, 211.94],
      [107.7, 116.47, 490.88, 109.04, 79.46, 208.76],
      [124.4, 112.73, 474.76, 92.36, 69.73, 206.13],
      [141, 109.78, 462.05, 80.12, 62.28, 204.06],
      [157.7, 107.56, 452.47, 74.27, 56.79, 202.5],
      [174.4, 105.96, 445.57, 65.43, 52.9, 201.38],
      [191, 104.87, 440.84, 62.74, 50.26, 200.61],
      [207.7, 104.16, 437.77, 58.96, 48.55, 200.11],
      [224.4, 103.74, 435.95, 57.49, 47.54, null],
      [241, 103.52, 435.01, 56.75, 47, null],
      [257.7, 103.44, 434.65, 56.47, 46.79, null],
      [274.4, 103.45, 434.67, 56.49, 46.78, null],
      [291, 103.5, 434.89, 56.68, 46.88, null],
      [307.7, 103.58, 435.21, 56.95, 47.05, null],
      [324.4, 103.66, 435.56, 57.23, 47.23, null],
      [341, 103.74, 435.9, 57.5, 47.4, null],
      [357.7, 103.81, 436.19, 57.74, 47.56, null],
      [374.4, 103.87, 436.43, 57.94, 47.69, null],
      [391, 103.91, 436.62, 58.09, 47.79, null],
      [407.7, 103.95, 436.77, 58.21, 47.87, null],
      [424.4, 103.97, 436.87, 58.3, 47.93, null],
      [441, 103.99, 436.94, 58.35, 47.97, null],
    ],
  },
};
