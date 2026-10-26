// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelMotion.test.ts
 * @input Uses Vitest with a fake clock, plain elements for the rows and the
 *   strip, and a curve from wheelPhysics.ts
 * @output Proves what the player leaves on the rows when it lets a motion go,
 *   and its cross-fade for reduced motion: opacity only, the rows landing at
 *   the midpoint, stoppable before it
 * @position Unit coverage for wheelMotion.ts; jsdom runs no Web Animations,
 *   so the player writes each motion's end state inline and keeps time with
 *   its timers. The wheels' tests and the browser specs cover it on screen.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {stripTranslation} from './wheelDrum';
import {WheelMotion} from './wheelMotion';
import {spinCurve, type WheelLayout} from './wheelPhysics';

const LAYOUT: WheelLayout = {rowHeight: 32, rowCount: 60};

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'performance',
      'Date',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('WheelMotion', () => {
  it('leaves the rows where they are shown when it is disposed mid-motion', () => {
    const rows = new Map(
      Array.from({length: LAYOUT.rowCount}, (_, index) => [
        index,
        document.createElement('div'),
      ]),
    );
    const strip = document.createElement('div');
    const motion = new WheelMotion(LAYOUT);
    motion.attach(rows, strip);
    motion.setOffset(0);
    // A linear turn of 20 rows over a second, 400 ms in.
    motion.play(spinCurve(0, 20 * 32, 1, [0, 0, 1, 1]));
    vi.advanceTimersByTime(400);
    const shown = motion.offset();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(20 * 32);

    motion.dispose();

    // Not the motion's end state: the offset it had reached.
    expect(motion.offset()).toBeCloseTo(shown, 6);
    expect(strip.style.transform).toBe(
      `translateY(${stripTranslation(shown)}px)`,
    );
  });

  it('cross-fades onto an offset: opacity only, the rows landing at the midpoint', () => {
    const rows = new Map(
      Array.from({length: LAYOUT.rowCount}, (_, index) => [
        index,
        document.createElement('div'),
      ]),
    );
    const strip = document.createElement('div');
    const drawing = document.createElement('div');
    const cancel = vi.fn();
    const animate = vi.fn(() => ({cancel}) as unknown as Animation);
    drawing.animate = animate;
    const motion = new WheelMotion(LAYOUT);
    motion.attach(rows, strip);
    motion.setOffset(0);
    const onMidpoint = vi.fn();
    const onEnd = vi.fn();
    motion.crossFade(20 * 32, {
      durationMs: 200,
      easing: 'ease-in-out',
      fade: [drawing],
      onMidpoint,
      onEnd,
    });
    expect(animate).toHaveBeenCalledWith(
      [
        {opacity: 1, easing: 'ease-in-out'},
        {opacity: 0, easing: 'ease-in-out'},
        {opacity: 1},
      ],
      {duration: 200, easing: 'linear'},
    );
    // Nothing travels: the rows stay put while they fade out...
    expect(motion.isMoving()).toBe(true);
    expect(motion.target()).toBe(640);
    expect(strip.style.transform).toBe(`translateY(${stripTranslation(0)}px)`);
    vi.advanceTimersByTime(100);
    // ...land at the midpoint...
    expect(onMidpoint).toHaveBeenCalledTimes(1);
    expect(motion.offset()).toBe(640);
    expect(strip.style.transform).toBe(
      `translateY(${stripTranslation(640)}px)`,
    );
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    // ...and arrive when the fade is back in.
    expect(onEnd).toHaveBeenCalledWith('arrived', 640);
    expect(motion.isMoving()).toBe(false);
    expect(cancel).toHaveBeenCalled();
  });

  it('is stopped by a finger before its midpoint with the rows unmoved', () => {
    const rows = new Map(
      Array.from({length: LAYOUT.rowCount}, (_, index) => [
        index,
        document.createElement('div'),
      ]),
    );
    const strip = document.createElement('div');
    const motion = new WheelMotion(LAYOUT);
    motion.attach(rows, strip);
    motion.setOffset(64);
    const onEnd = vi.fn();
    motion.crossFade(20 * 32, {durationMs: 200, fade: [], onEnd});
    vi.advanceTimersByTime(50);
    expect(motion.stop()).toBe(64);
    expect(onEnd).toHaveBeenCalledWith('stopped', 64);
    expect(strip.style.transform).toBe(`translateY(${stripTranslation(64)}px)`);
    vi.advanceTimersByTime(500);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
