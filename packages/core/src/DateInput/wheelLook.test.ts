// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelLook.test.ts
 * @input wheelLook.ts
 * @output Unit tests for today's look on the touch wheel: each row's frame,
 *   and a row's keyframes along a baked curve
 * @position Colocated test; pure math, no DOM
 */

import {describe, expect, it} from 'vitest';
import {sampleCurve} from './wheelDrum';
import {WHEEL_ROW_PITCH, lookKeyframes, todayLook} from './wheelLook';
import type {WheelCurve, WheelLayout} from './wheelPhysics';

/** Today's column: six 44 px day rows. */
const COLUMN = 264;
/** The cover range: a row's top at the bottom edge to its bottom at the top. */
const SPAN = COLUMN + WHEEL_ROW_PITCH;

describe('todayLook', () => {
  const look = todayLook(COLUMN);

  it('draws the row on the band upright, at full opacity', () => {
    expect(look.rowFrame(0)).toEqual({
      transform: 'rotateX(0deg) scale(1)',
      opacity: 1,
      visible: true,
    });
  });

  it('tips and fades a row toward the edges as today’s falloff keyframes do', () => {
    // A quarter of the cover range below the band: halfway to the edge.
    const frame = look.rowFrame(SPAN / 4);
    expect(frame.visible).toBe(true);
    expect(frame.opacity).toBeCloseTo(0.3 + 0.7 / 2, 3);
    expect(frame.transform).toBe('rotateX(26deg) scale(0.93)');
    // Above the band, the other way.
    expect(look.rowFrame(-SPAN / 4).transform).toBe(
      'rotateX(-26deg) scale(0.93)',
    );
  });

  it('leaves a row wholly past an edge upright and transparent', () => {
    const hidden = {
      transform: 'rotateX(0deg) scale(1)',
      opacity: 0,
      visible: false,
    };
    expect(look.rowFrame(SPAN / 2)).toEqual(hidden);
    expect(look.rowFrame(-SPAN)).toEqual(hidden);
  });

  it('keeps only the fade under reduced motion', () => {
    const flat = todayLook(COLUMN, {reducedMotion: true});
    expect(flat.rowFrame(SPAN / 4)).toEqual({
      transform: 'rotateX(0deg) scale(1)',
      opacity: 0.65,
      visible: true,
    });
  });
});

describe('lookKeyframes', () => {
  const layout: WheelLayout = {rowHeight: WHEEL_ROW_PITCH, rowCount: 60};
  /** A constant-velocity move from `from` to `to` over `duration` s. */
  const linear = (from: number, to: number, duration: number): WheelCurve => ({
    duration,
    to,
    value: t => from + ((to - from) * t) / duration,
    velocity: () => (to - from) / duration,
  });

  it('bakes a row that crosses the band into transform and opacity frames', () => {
    const curve = linear(0, 10 * WHEEL_ROW_PITCH, 0.5);
    const frames = lookKeyframes(
      5,
      sampleCurve(curve),
      curve.duration,
      layout,
      todayLook(COLUMN),
    );
    expect(frames).not.toBeNull();
    expect(frames![0].offset).toBe(0);
    expect(frames![frames!.length - 1].offset).toBe(1);
    // It passes the band upright, at full opacity, half way.
    expect(
      frames!.some(
        frame => frame.transform === 'translateY(0px) rotateX(0deg) scale(1)',
      ),
    ).toBe(true);
    expect(Math.max(...frames!.map(frame => frame.opacity))).toBeCloseTo(1, 2);
  });

  it('names the same functions in every frame, so the compositor can run it', () => {
    // WebKit interpolates on the main thread when two frames' function
    // lists differ, which stalls the coast through a busy main thread.
    const curve = linear(0, 10 * WHEEL_ROW_PITCH, 0.5);
    for (const look of [
      todayLook(COLUMN),
      todayLook(COLUMN, {reducedMotion: true}),
    ]) {
      for (let position = 0; position < 15; position++) {
        const frames =
          lookKeyframes(
            position,
            sampleCurve(curve),
            curve.duration,
            layout,
            look,
          ) ?? [];
        for (const frame of frames) {
          expect(frame.transform).toMatch(
            /^translateY\(-?[\d.]+px\) rotateX\(-?[\d.]+deg\) scale\([\d.]+\)$/,
          );
        }
      }
    }
  });

  it('animates nothing for a row the motion never shows', () => {
    const curve = linear(0, 2 * WHEEL_ROW_PITCH, 0.3);
    expect(
      lookKeyframes(
        40,
        sampleCurve(curve),
        curve.duration,
        layout,
        todayLook(COLUMN),
      ),
    ).toBeNull();
  });

  it('moves a looping row a whole cycle at the strip’s fold, as a step', () => {
    const looping: WheelLayout = {
      rowHeight: WHEEL_ROW_PITCH,
      rowCount: 24,
      looping: true,
    };
    const cycle = 24 * WHEEL_ROW_PITCH;
    // Thirteen rows on: row 0 leaves past the top, and the fold moves it to
    // the other side of the strip on the way.
    const curve = linear(0, 13 * WHEEL_ROW_PITCH, 0.6);
    const frames = lookKeyframes(
      0,
      sampleCurve(curve),
      curve.duration,
      looping,
      todayLook(COLUMN),
    )!;
    const shifts = new Set(
      frames.map(frame =>
        Number(/translateY\((-?[\d.]+)px\)/.exec(frame.transform)?.[1] ?? 0),
      ),
    );
    expect([...shifts].every(shift => shift % cycle === 0)).toBe(true);
    expect(shifts.size).toBeGreaterThan(1);
    // Each change of cycle is a step: two frames at the same progress.
    for (let index = 1; index < frames.length; index++) {
      const shift = (frame: {transform: string}) =>
        /translateY\((-?[\d.]+)px\)/.exec(frame.transform)?.[1] ?? '0';
      if (shift(frames[index]) !== shift(frames[index - 1])) {
        expect(frames[index].offset).toBe(frames[index - 1].offset);
      }
    }
  });
});
