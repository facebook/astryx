// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch.pacing.test.ts
 * @input Touch scripts from ./scripts and synthetic page timestamps (no
 *   browser)
 * @output The driver's pacing: after a stalled dispatch the events behind it
 *   keep their scripted gaps rather than leaving together; a gesture the page
 *   received off its pacing fails `checkTouchPacing` with its gaps named; and
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
  const scripted = [0, 8, 16, 24, 32, 40, 48, 56];

  it('passes a gesture whose gaps reach the page within the tolerance', () => {
    const received = scripted.map(
      (t, i) => 1000 + t + (i % 2 === 0 ? 0 : TOUCH_PACING_TOLERANCE_MS / 2),
    );
    expect(() => checkTouchPacing(scripted, received)).not.toThrow();
  });

  it('fails a stalled dispatch and the events queued behind it, naming both gap lists', () => {
    // The shape a loaded runner showed: a 29 ms stall, then moves 1 to 2 ms
    // apart.
    const received = [1000, 1008, 1016, 1024, 1053, 1055, 1056, 1058];
    expect(() => checkTouchPacing(scripted, received)).toThrow(
      TouchPacingError,
    );
    try {
      checkTouchPacing(scripted, received);
    } catch (error) {
      const pacing = error as TouchPacingError;
      expect(pacing.message).toMatch(/gap 4 is 21\.0 ms off/);
      expect(pacing.receivedGaps).toEqual([8, 8, 8, 29, 2, 1, 2]);
      expect(pacing.scriptedGaps).toEqual([8, 8, 8, 8, 8, 8, 8]);
    }
  });

  it('fails a gesture with an event missing, unless the touched element left the document', () => {
    const received = [1000, 1008, 1016, 1024, 1032];
    expect(() => checkTouchPacing(scripted, received)).toThrow(
      /5 touch events arrived for 8 dispatched/,
    );
    expect(() =>
      checkTouchPacing(scripted, received, {partial: true}),
    ).not.toThrow();
    // What did arrive is still checked.
    expect(() =>
      checkTouchPacing(scripted, [1000, 1008, 1030], {partial: true}),
    ).toThrow(TouchPacingError);
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
