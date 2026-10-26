// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelMotion.test.ts
 * @input Uses Vitest with a fake clock, plain elements for the rows and the
 *   strip, and a curve from wheelPhysics.ts
 * @output Proves what the player leaves on the rows when it lets a motion go,
 *   and its cross-fade for reduced motion: opacity only, the rows landing at
 *   the midpoint (baked into their own animations where Web Animations run,
 *   so a late timer moves nothing), timed from when it starts on screen,
 *   stoppable before it
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
    const rows = Array.from({length: LAYOUT.rowCount}, () =>
      document.createElement('div'),
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
      `translateY(${stripTranslation(shown, LAYOUT)}px)`,
    );
  });

  it('cross-fades onto an offset: opacity only, the rows landing at the midpoint', () => {
    const rows = Array.from({length: LAYOUT.rowCount}, () =>
      document.createElement('div'),
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
    expect(strip.style.transform).toBe(
      `translateY(${stripTranslation(0, LAYOUT)}px)`,
    );
    vi.advanceTimersByTime(100);
    // ...land at the midpoint...
    expect(onMidpoint).toHaveBeenCalledTimes(1);
    expect(motion.offset()).toBe(640);
    expect(strip.style.transform).toBe(
      `translateY(${stripTranslation(640, LAYOUT)}px)`,
    );
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    // ...and arrive when the fade is back in.
    expect(onEnd).toHaveBeenCalledWith('arrived', 640);
    expect(motion.isMoving()).toBe(false);
    expect(cancel).toHaveBeenCalled();
  });

  it('bakes the landing into animations of the rows and the strip, so a late timer moves nothing', () => {
    const rows = Array.from({length: LAYOUT.rowCount}, () =>
      document.createElement('div'),
    );
    const strip = document.createElement('div');
    const drawing = document.createElement('div');
    const played = new Map<
      HTMLElement,
      {keyframes: Keyframe[]; duration: number}
    >();
    for (const element of [...rows, strip, drawing]) {
      element.animate = (
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) => {
        played.set(element, {keyframes, duration: Number(options.duration)});
        return {cancel: vi.fn()} as unknown as Animation;
      };
    }
    const motion = new WheelMotion(LAYOUT);
    motion.attach(rows, strip);
    motion.setOffset(0);
    const stripOrigin = strip.style.transform;
    const rowOrigin = rows[0].style.transform;
    motion.crossFade(20 * 32, {durationMs: 200, fade: [drawing]});

    // No timer has run (a busy main thread): the destination is inline
    // already...
    const destination = `translateY(${stripTranslation(640, LAYOUT)}px)`;
    expect(strip.style.transform).toBe(destination);
    expect(rows[0].style.transform).not.toBe(rowOrigin);
    // ...and the strip's own animation holds its origin to the midpoint,
    // then steps onto it, as a moved row's does.
    for (const [element, origin] of [
      [strip, stripOrigin],
      [rows[0], rowOrigin],
    ] as const) {
      const {keyframes, duration} = played.get(element) ?? {
        keyframes: [],
        duration: 0,
      };
      expect(keyframes.map(frame => frame.transform)).toEqual([
        origin,
        origin,
        element.style.transform,
        element.style.transform,
      ]);
      expect(keyframes[1].offset).toBe(keyframes[2].offset);
      expect(Number(keyframes[1].offset) * duration).toBeCloseTo(100, 6);
      expect(keyframes[3].offset).toBe(1);
    }
    // The drawing still only fades.
    expect(played.get(drawing)?.keyframes.map(frame => frame.opacity)).toEqual([
      1, 0, 1,
    ]);
  });

  it('times the midpoint and the end from when its animations start, not from the call', async () => {
    const rows = Array.from({length: LAYOUT.rowCount}, () =>
      document.createElement('div'),
    );
    const strip = document.createElement('div');
    const drawing = document.createElement('div');
    // Every animation the fade creates waits for the frame that starts them.
    let commit = () => {};
    const ready = new Promise<void>(resolve => {
      commit = resolve;
    });
    const created: {
      startTime: number | null;
      pending: boolean;
      cancel: () => void;
    }[] = [];
    for (const element of [...rows, strip, drawing]) {
      element.animate = () => {
        const animation = {
          startTime: null,
          pending: true,
          ready,
          cancel: vi.fn(),
        };
        created.push(animation);
        return animation as unknown as Animation;
      };
    }
    const motion = new WheelMotion(LAYOUT);
    motion.attach(rows, strip);
    motion.setOffset(0);
    const onMidpoint = vi.fn();
    const onEnd = vi.fn();
    motion.crossFade(20 * 32, {
      durationMs: 200,
      fade: [drawing],
      onMidpoint,
      onEnd,
    });

    // A busy main thread holds that frame past the fade's whole length:
    // nothing lands, ends or is cancelled before the fade starts.
    vi.advanceTimersByTime(250);
    expect(onMidpoint).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
    for (const animation of created) {
      expect(animation.cancel).not.toHaveBeenCalled();
    }

    // The frame commits: the fade starts now, and is timed from here.
    const startTime = performance.now();
    for (const animation of created) {
      animation.startTime = startTime;
      animation.pending = false;
    }
    commit();
    await Promise.resolve();
    await Promise.resolve();
    expect(motion.offset()).toBe(0);
    vi.advanceTimersByTime(99);
    expect(onMidpoint).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(onMidpoint).toHaveBeenCalledTimes(1);
    expect(motion.offset()).toBe(640);
    vi.advanceTimersByTime(98);
    expect(onEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(onEnd).toHaveBeenCalledWith('arrived', 640);
    expect(onMidpoint).toHaveBeenCalledTimes(1);
  });

  it('is stopped by a finger before its midpoint with the rows unmoved', () => {
    const rows = Array.from({length: LAYOUT.rowCount}, () =>
      document.createElement('div'),
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
    expect(strip.style.transform).toBe(
      `translateY(${stripTranslation(64, LAYOUT)}px)`,
    );
    vi.advanceTimersByTime(500);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
