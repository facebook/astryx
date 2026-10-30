// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch.pacing.test.ts
 * @input Touch scripts from ./scripts and synthetic page timestamps (no
 *   browser)
 * @output The driver's pacing: after a stalled dispatch the events behind it
 *   keep their scripted gaps rather than leaving together; a gesture the page
 *   received off its pacing where a release reads it (its last two move
 *   intervals, its lift) fails `checkTouchPacing` with its gaps named; and
 *   `retakeOnTouchPacing` re-takes only such a gesture, once, listing it.
 * @position Unit test of ./touch's pacing; the browser proof of the same
 *   behavior through WebKit's real input is in
 *   harness.interaction.browser.spec.ts.
 */

import {describe, expect, it} from 'vitest';
import {drag} from './scripts';
import {
  checkTouchPacing,
  playSteps,
  retakeOnTouchPacing,
  TOUCH_LIFT_STILLNESS_MS,
  TOUCH_PACING_TOLERANCE_MS,
  TouchPacingError,
} from './touch';

describe('playSteps', () => {
  it('keeps the scripted gaps after a stalled dispatch instead of sending the events behind it together', async () => {
    // A drag of six moves 12 ms apart; the third dispatch stalls 40 ms.
    const script = drag(
      {x: 0, y: 0},
      {x: 0, y: 60},
      {durationMs: 72, hz: 1000 / 12},
    );
    const sentAt: number[] = [];
    let index = 0;
    const played = await playSteps(
      script,
      {},
      async () => {
        sentAt.push(performance.now());
        if (index === 2) {
          await new Promise(resolve => setTimeout(resolve, 40));
        }
        index += 1;
      },
      t => t,
    );
    const scriptedGaps = played.slice(1).map((p, i) => p.t - played[i].t);
    const sentGaps = sentAt.slice(1).map((t, i) => t - sentAt[i]);
    // The stalled event's own gap stretches; every later one is at least
    // its scripted gap (less a millisecond of timer slack), never a burst.
    for (let i = 3; i < sentGaps.length; i += 1) {
      expect(sentGaps[i], `gap ${i + 1}`).toBeGreaterThanOrEqual(
        scriptedGaps[i] - 1,
      );
    }
    expect(sentGaps[2]).toBeGreaterThanOrEqual(40);
  });
});

describe('checkTouchPacing', () => {
  // A flick as the driver plays it: a touch-down, ten moves 8 ms apart, and
  // the lift 2.1 ms after the last move.
  const steps = [
    {t: 0, type: 'touchStart'},
    ...Array.from({length: 10}, (_, i) => ({
      t: 8 * (i + 1),
      type: 'touchMove',
    })),
    {t: 82.1, type: 'touchEnd'},
  ];
  /** Page timestamps from the gaps between them. */
  const at = (gaps: readonly number[]) =>
    gaps.reduce<number[]>(
      (times, gap) => [...times, times[times.length - 1] + gap],
      [1000],
    );

  it("passes the page's own handling in a gesture's first moves and its lift: a burst after the touch-down, a lift a frame late", () => {
    // What WebKit delivered for a BottomSheet flick on an idle worker.
    expect(() =>
      checkTouchPacing(steps, at([4, 11, 3, 8, 8, 8, 8, 8, 8, 8, 9])),
    ).not.toThrow();
  });

  it('fails a stall and the burst behind it in the move intervals a release velocity reads, naming both gap lists', () => {
    const received = at([8, 8, 8, 8, 8, 8, 8, 29, 2, 1, 2]);
    expect(() => checkTouchPacing(steps, received)).toThrow(TouchPacingError);
    try {
      checkTouchPacing(steps, received);
    } catch (error) {
      const pacing = error as TouchPacingError;
      expect(pacing.message).toMatch(
        /the move interval ending at event 10, which a release velocity reads, is 6\.0 ms off/,
      );
      expect(pacing.receivedGaps).toEqual([8, 8, 8, 8, 8, 8, 8, 29, 2, 1, 2]);
      expect(pacing.scriptedGaps.slice(0, 10)).toEqual(Array(10).fill(8));
    }
    // The same stall earlier, with the last two intervals on pace: the
    // release reads the script's velocity.
    expect(() =>
      checkTouchPacing(steps, at([8, 8, 29, 2, 1, 2, 8, 8, 8, 8, 2])),
    ).not.toThrow();
  });

  it(`fails a lift that reaches the page ${TOUCH_LIFT_STILLNESS_MS} ms or more after the last move, where a release reads as still`, () => {
    expect(() =>
      checkTouchPacing(steps, at([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 45])),
    ).toThrow(/the lift came 45\.0 ms after the last move/);
  });

  it('fails a gesture with an event missing, unless the touched element left the document', () => {
    const received = at([8, 8, 8, 8]);
    expect(() => checkTouchPacing(steps, received)).toThrow(
      /5 touch events arrived for 12 dispatched/,
    );
    expect(() =>
      checkTouchPacing(steps, received, {partial: true}),
    ).not.toThrow();
  });

  it('holds the tolerance it states', () => {
    expect(TOUCH_PACING_TOLERANCE_MS).toBe(4);
  });
});

describe('retakeOnTouchPacing', () => {
  const offPace = () => new TouchPacingError('gap 4 is 21.0 ms off', [8], [29]);

  it('re-takes a gesture received off pace once, and fails red when the second attempt is off pace too', async () => {
    const info = {annotations: [] as {type: string; description?: string}[]};
    const attempts: number[] = [];
    await expect(
      retakeOnTouchPacing(info, async n => {
        attempts.push(n);
        throw offPace();
      }),
    ).rejects.toThrow(TouchPacingError);
    expect(attempts).toEqual([1, 2]);
    expect(info.annotations.map(a => a.type)).toEqual(['touch-retake']);
  });

  it('never re-takes a product failure after input that arrived on pace', async () => {
    const info = {annotations: [] as {type: string; description?: string}[]};
    const attempts: number[] = [];
    await expect(
      retakeOnTouchPacing(info, async n => {
        attempts.push(n);
        throw new Error('the sheet rested on full, expected half');
      }),
    ).rejects.toThrow('the sheet rested on full, expected half');
    expect(attempts).toEqual([1]);
    expect(info.annotations).toEqual([]);
  });

  it('passes on a good second attempt after a bad first one, and lists the re-take', async () => {
    const info = {annotations: [] as {type: string; description?: string}[]};
    const value = await retakeOnTouchPacing(info, async n => {
      if (n === 1) {
        throw offPace();
      }
      return 'rested on half';
    });
    expect(value).toBe('rested on half');
    expect(info.annotations).toHaveLength(1);
    expect(info.annotations[0]).toMatchObject({
      type: 'touch-retake',
      description: expect.stringMatching(/off its scripted pacing/),
    });
  });
});
