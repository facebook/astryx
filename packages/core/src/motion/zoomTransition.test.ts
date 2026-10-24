// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomTransition.test.ts
 * @input vitest, the zoom transition geometry and UIKit's zoom transition
 *   constants
 * @output Checks the transition against UIKit's own (iOS 26.2, a 118 pt
 *   cell opening a full-screen detail with `.zoom`): the portals' shared
 *   frame and their aspects, the opening's widths frame by frame, the fades,
 *   the closing's undershoot into the cell, and the element curves' ends
 * @position Testing; zoomTransition.ts without a browser
 */

import {describe, expect, it} from 'vitest';
import {
  NO_SOURCE_SCALE,
  zoomCloseProgress,
  zoomDragFrame,
  zoomElementCurves,
  zoomFramesAt,
  zoomOpenProgress,
  zoomReleaseVelocity,
  zoomShouldDismiss,
  zoomStartRect,
  type ZoomGeometry,
} from './zoomTransition';

// The lab: a 118 pt cell at (16, 160) opening a full-screen detail on the
// 402 × 874 screen; portals top-aligned, as UIKit's are for a full-screen
// detail.
const CELL = {x: 16, y: 160, width: 118, height: 118};
const LAB: ZoomGeometry = {
  source: CELL,
  detail: {x: 0, y: 0, width: 402, height: 874},
  align: 'top',
};

// The detail portal's width per 16.7 ms frame from the first frame of the
// opening, and the portals' effective opacities (F4 batch 28b).
const WIDTHS = [
  118, 143.0, 176.7, 210.8, 242.6, 271.0, 295.6, 316.3, 333.5, 347.6, 359.1,
  368.3, 375.6, 381.4, 386.0, 389.6, 392.4, 394.6, 396.3, 397.6, 398.7, 399.4,
  400.0, 400.5,
];
const DETAIL_OPACITY = [0, 0.135, 0.318, 0.503, 0.675, 0.829, 0.962, 1, 1];
const SOURCE_OPACITY = [
  1, 1, 1, 1, 0.863, 0.71, 0.577, 0.464, 0.371, 0.295, 0.233, 0.183, 0.143,
  0.111, 0.087, 0.067,
];
/** The motion starts this long before the first logged frame (s). */
const LEAD = 0.013;
const frameTime = (i: number) => (i * 1000) / 60 / 1000 + LEAD;

describe("UIKit's zoom transition (iOS 26.2)", () => {
  it('starts the detail at the source width with its own aspect', () => {
    expect(zoomStartRect(CELL, 874 / 402, 'top')).toEqual({
      x: 16,
      y: 160,
      width: 118,
      height: (118 * 874) / 402,
    });
    // A photo starts centred on its thumbnail.
    const centred = zoomStartRect(CELL, 268 / 402, 'center');
    expect(centred.y + centred.height / 2).toBeCloseTo(160 + 59, 9);
  });

  it('keeps both portals on one frame, each with its own aspect', () => {
    for (const p of [0, 0.3, 0.7, 1]) {
      const frames = zoomFramesAt(p, LAB);
      expect(frames.source.x).toBeCloseTo(frames.detail.x, 9);
      expect(frames.source.y).toBeCloseTo(frames.detail.y, 9);
      expect(frames.source.width).toBeCloseTo(frames.detail.width, 9);
      expect(frames.source.height).toBeCloseTo(frames.source.width, 9);
      expect(frames.detail.height).toBeCloseTo(
        (frames.detail.width * 874) / 402,
        9,
      );
    }
    expect(zoomFramesAt(1, LAB).detail).toEqual(LAB.detail);
  });

  it('opens on a critically damped spring of response 0.34, frame by frame', () => {
    const progress = zoomOpenProgress();
    let squared = 0;
    for (let i = 1; i < WIDTHS.length; i++) {
      const width = zoomFramesAt(progress.at(frameTime(i)), LAB).detail.width;
      expect(Math.abs(width - WIDTHS[i])).toBeLessThan(5);
      squared += (width - WIDTHS[i]) ** 2;
    }
    expect(Math.sqrt(squared / (WIDTHS.length - 1))).toBeLessThan(2);
  });

  it('fades the detail in and the source out as gains on the progress', () => {
    const progress = zoomOpenProgress();
    for (let i = 2; i < DETAIL_OPACITY.length; i++) {
      const frames = zoomFramesAt(progress.at(frameTime(i)), LAB);
      expect(Math.abs(frames.detailOpacity - DETAIL_OPACITY[i])).toBeLessThan(
        0.04,
      );
    }
    for (let i = 4; i < SOURCE_OPACITY.length; i++) {
      const frames = zoomFramesAt(progress.at(frameTime(i)), LAB);
      expect(Math.abs(frames.sourceOpacity - SOURCE_OPACITY[i])).toBeLessThan(
        0.04,
      );
    }
  });

  it('closes into the cell with a small undershoot (117.8 pt, then 118)', () => {
    const {frame, fade} = zoomCloseProgress();
    let smallest = Infinity;
    for (let t = 0; t <= frame.duration; t += 0.001) {
      smallest = Math.min(
        smallest,
        zoomFramesAt(frame.at(t), LAB).detail.width,
      );
    }
    expect(smallest).toBeGreaterThan(117.7);
    expect(smallest).toBeLessThan(117.95);
    expect(zoomFramesAt(frame.at(frame.duration), LAB).detail.width).toBe(118);
    // The fades are critically damped: no undershoot.
    for (let t = 0; t <= fade.duration; t += 0.005) {
      expect(fade.at(t)).toBeGreaterThanOrEqual(0);
    }
  });

  it('continues an interrupted transition from where it shows', () => {
    const open = zoomOpenProgress();
    const p = open.at(0.1);
    const v = open.velocity(0.1);
    const {frame} = zoomCloseProgress({from: p, velocity: v});
    expect(frame.at(0)).toBeCloseTo(p, 9);
    expect(frame.velocity(0)).toBeCloseTo(v, 6);
  });

  it('gives an element at rest in its box curves from the source to rest', () => {
    const box = {x: 0, y: 303, width: 402, height: 268};
    const geometry: ZoomGeometry = {source: CELL, detail: box};
    const curves = zoomElementCurves(
      geometry,
      box,
      'detail',
      zoomOpenProgress(),
    );
    const start = zoomStartRect(CELL, 268 / 402);
    expect(curves.scale.at(0)).toBeCloseTo(118 / 402, 9);
    expect(curves.x.at(0)).toBeCloseTo(start.x - box.x, 9);
    expect(curves.y.at(0)).toBeCloseTo(start.y - box.y, 9);
    expect(curves.opacity.at(0)).toBe(0);
    const end = curves.scale.duration;
    expect(curves.scale.at(end)).toBe(1);
    expect(curves.x.at(end)).toBe(0);
    expect(curves.y.at(end)).toBe(0);
    expect(curves.opacity.at(end)).toBe(1);
    // Velocities by the chain rule agree with the curve's own slope.
    const t = 0.05;
    const slope =
      (curves.scale.at(t + 1e-5) - curves.scale.at(t - 1e-5)) / 2e-5;
    expect(curves.scale.velocity(t)).toBeCloseTo(slope, 2);
  });

  it('shrinks a dragged screen about its centre by its travel', () => {
    // b28b: the detail portal's centre travel → scale during a drag down.
    const measured = [
      {travel: 33.3, scale: 0.9745},
      {travel: 84.2, scale: 0.9345},
      {travel: 142.2, scale: 0.8871},
      {travel: 207.8, scale: 0.8304},
    ];
    const screen = LAB.detail;
    for (const row of measured) {
      const frame = zoomDragFrame({x: 0, y: row.travel}, screen);
      expect(Math.abs(frame.detail.width / 402 - row.scale)).toBeLessThan(
        0.005,
      );
      // Its centre is where the finger took it.
      expect(frame.detail.y + frame.detail.height / 2).toBeCloseTo(
        437 + row.travel,
        9,
      );
      expect(frame.detail.x + frame.detail.width / 2).toBeCloseTo(201, 9);
    }
  });

  it('with no source, shrinks toward the centre and fades out', () => {
    const geometry: ZoomGeometry = {source: null, detail: LAB.detail};
    const start = zoomFramesAt(0, geometry);
    expect(start.detail.width).toBeCloseTo(402 * NO_SOURCE_SCALE, 9);
    expect(start.detail.x + start.detail.width / 2).toBeCloseTo(201, 9);
    expect(start.detail.y + start.detail.height / 2).toBeCloseTo(437, 9);
    expect(start.detailOpacity).toBe(0);
    expect(start.sourceOpacity).toBe(0);
    expect(zoomFramesAt(1, geometry).detailOpacity).toBe(1);
  });

  it('turns a release into the closing progress', () => {
    const released = zoomDragFrame({x: 0, y: 200}, LAB.detail).detail;
    // Moving toward the cell (up) speeds the progress toward 0.
    expect(zoomReleaseVelocity({x: 0, y: -800}, released, CELL)).toBeLessThan(
      0,
    );
    expect(zoomReleaseVelocity({x: 0, y: 800}, released, CELL)).toBeGreaterThan(
      0,
    );
    expect(zoomReleaseVelocity({x: 0, y: 800}, released, null)).toBe(0);
    expect(zoomShouldDismiss({x: 0, y: 200}, {x: 0, y: 300})).toBe(true);
    expect(zoomShouldDismiss({x: 0, y: 200}, {x: 0, y: -300})).toBe(false);
    expect(zoomShouldDismiss({x: 0, y: 4}, {x: 0, y: 0})).toBe(false);
  });
});
