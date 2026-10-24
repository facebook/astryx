// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contextMenuLiftGeometry.test.ts
 * @input vitest, the context-menu constants, and the settled frames of
 *   UIKit's lifted previews measured on iOS 26.2 (iPhone 17 Pro, 402 × 874)
 * @output The lift geometry against UIKit: an icon, a card and a full-width
 *   row lift to UIKit's sizes about the same center, held inside the
 *   screen's insets; the menu's side and alignment; and the lift's springs
 *   against UIKit's measured frames
 * @position Unit tests of packages/core/src/ContextMenu/contextMenuLiftGeometry.ts
 */

import {describe, expect, it} from 'vitest';
import {solveSpring, toSpring} from '../motion/spring';
import {contextMenu, springs} from '../motion/uikit';
import {liftedBox, liftScale, menuPlacement} from './contextMenuLiftGeometry';
import {
  UIKIT_LIFT_FRAMES,
  UIKIT_LIFT_PREVIEW_FROM,
  UIKIT_LIFT_STARTS,
} from './__tests__/uikitLiftFrames';

const phone = {width: 402, height: 874};
/** UIKit rounds the lifted size to device pixels (3× here): half of one. */
const HALF_PIXEL = 1 / 6;

describe('liftScale', () => {
  it('lifts a 60 pt icon to 69 pt (capped at 1.15)', () => {
    expect(60 * liftScale(60, 60, phone)).toBeCloseTo(69, 5);
  });

  it('lifts a 200 × 120 card to 226 × 135.67 (26 pt on its larger side)', () => {
    const scale = liftScale(200, 120, phone);
    expect(200 * scale).toBeCloseTo(226, 5);
    expect(Math.abs(120 * scale - 135.67)).toBeLessThan(HALF_PIXEL);
  });

  it('shrinks a full-width 402 × 60 row to 370 × 55.33 (the screen less 16 pt each side)', () => {
    const scale = liftScale(402, 60, phone);
    expect(402 * scale).toBeCloseTo(370, 5);
    expect(Math.abs(60 * scale - 55.33)).toBeLessThan(HALF_PIXEL);
  });
});

describe('liftedBox', () => {
  it('grows a card about its center, as UIKit’s platter does', () => {
    const box = liftedBox({x: 101, y: 377, width: 200, height: 120}, phone);
    expect(box.x).toBeCloseTo(88, 5);
    expect(box.width).toBeCloseTo(226, 5);
    expect(box.y + box.height / 2).toBeCloseTo(437, 5);
  });

  it('centers a full-width row inside the 16 pt side insets', () => {
    const box = liftedBox({x: 0, y: 300, width: 402, height: 60}, phone);
    expect(box.x).toBeCloseTo(16, 5);
    expect(box.x + box.width).toBeCloseTo(386, 5);
  });

  it('holds a card at the left edge at x 16, and one at the right edge at a right edge of 386', () => {
    expect(
      liftedBox({x: 4, y: 377, width: 200, height: 120}, phone).x,
    ).toBeCloseTo(16, 5);
    const right = liftedBox({x: 198, y: 377, width: 200, height: 120}, phone);
    expect(right.x + right.width).toBeCloseTo(386, 5);
  });

  it('holds a card at the top at y 82 and one at the bottom at a bottom of 820 (the safe area less 20)', () => {
    const safe = {...phone, safeTop: 62, safeBottom: 34};
    expect(
      liftedBox({x: 101, y: 70, width: 200, height: 120}, safe).y,
    ).toBeCloseTo(82, 5);
    const bottom = liftedBox({x: 101, y: 700, width: 200, height: 120}, safe);
    expect(bottom.y + bottom.height).toBeCloseTo(820, 5);
  });
});

describe('menuPlacement', () => {
  const safe = {...phone, safeTop: 62, safeBottom: 34};

  it('puts the 3-action menu below the middle card, centered, as UIKit did', () => {
    const box = liftedBox({x: 101, y: 377, width: 200, height: 120}, safe);
    expect(menuPlacement(box, 146, safe)).toEqual({
      side: 'below',
      alignment: 'center',
    });
  });

  it('puts the menu above the bottom card, where it does not fit below', () => {
    const box = liftedBox({x: 101, y: 700, width: 200, height: 120}, safe);
    expect(menuPlacement(box, 146, safe).side).toBe('above');
  });

  it('aligns the menu with the edge a preview is held against', () => {
    const left = liftedBox({x: 4, y: 377, width: 200, height: 120}, safe);
    expect(menuPlacement(left, 146, safe).alignment).toBe('start');
    const right = liftedBox({x: 198, y: 377, width: 200, height: 120}, safe);
    expect(menuPlacement(right, 146, safe).alignment).toBe('end');
  });
});

describe('the lift’s springs against UIKit’s measured frames (iOS 26.2, 200 × 120 card)', () => {
  const at = (
    description: Parameters<typeof toSpring>[0],
    from: number,
    to: number,
    startMs: number,
    ms: number,
  ) =>
    ms <= startMs
      ? from
      : solveSpring(toSpring(description), {from, to}).value(
          (ms - startMs) / 1000,
        );
  const errors = (
    pick: (row: (typeof UIKIT_LIFT_FRAMES)[number]) => number | null,
    model: (ms: number) => number,
  ) =>
    UIKIT_LIFT_FRAMES.flatMap(row => {
      const uikit = pick(row);
      return uikit == null ? [] : [Math.abs(model(row[0]) - uikit)];
    });
  const rms = (e: number[]) =>
    Math.sqrt(e.reduce((sum, x) => sum + x * x, 0) / e.length);

  it('the backdrop fades on springs.contextMenuLift (alpha rms < 0.001)', () => {
    const e = errors(
      row => row[1],
      ms => at(springs.contextMenuLift, 0, 1, UIKIT_LIFT_STARTS.backdrop, ms),
    );
    expect(rms(e)).toBeLessThan(0.001);
    expect(Math.max(...e)).toBeLessThan(0.003);
  });

  it('the preview grows on from the press on springs.contextMenuLift (rms < 0.15 pt)', () => {
    const e = errors(
      row => row[2],
      ms =>
        at(
          springs.contextMenuLift,
          UIKIT_LIFT_PREVIEW_FROM,
          226,
          UIKIT_LIFT_STARTS.previewWidth,
          ms,
        ),
    );
    expect(rms(e)).toBeLessThan(0.15);
    expect(Math.max(...e)).toBeLessThan(0.4);
  });

  it('the menu content fades in and unblurs on morphSpring (opacity rms < 0.01, blur < 0.03 pt)', () => {
    const {morphSpring, menuEntranceBlur} = contextMenu.lift;
    const opacity = errors(
      row => row[3],
      ms => at(morphSpring, 0, 1, UIKIT_LIFT_STARTS.menuOpacity, ms),
    );
    const blur = errors(
      row => row[4],
      ms =>
        at(morphSpring, menuEntranceBlur, 0, UIKIT_LIFT_STARTS.menuBlur, ms),
    );
    expect(rms(opacity)).toBeLessThan(0.01);
    expect(Math.max(...opacity)).toBeLessThan(0.03);
    expect(rms(blur)).toBeLessThan(0.03);
    expect(Math.max(...blur)).toBeLessThan(0.12);
  });
});
