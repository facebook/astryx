// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file presentedFrame.test.ts
 * @input vitest and onPresentedFrame, driven by a fake window whose frames
 *   arrive at chosen times
 * @output onPresentedFrame waits for the first frame the page has presented
 *   (the second of two frames at the normal cadence): about two frames when
 *   nothing stalls, the second frame after a stall (Mobile Safari's keyboard
 *   bring-up), never more than MAX_WAIT_MS; cancelling stops it
 * @position Testing; validates presentedFrame.ts
 */

import {describe, expect, it} from 'vitest';
import {MAX_WAIT_MS, onPresentedFrame} from './presentedFrame';

/** A window whose frames the test delivers at the times it names. */
function fakeWindow() {
  let now = 0;
  let next = 1;
  const callbacks = new Map<number, (time: number) => void>();
  const win = {
    performance: {now: () => now},
    requestAnimationFrame: (callback: (time: number) => void) => {
      const id = next++;
      callbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      callbacks.delete(id);
    },
  } as unknown as Window;
  return {
    win,
    /** Delivers one frame at `time` to every waiting callback. */
    frame(time: number) {
      now = time;
      const waiting = [...callbacks.values()];
      callbacks.clear();
      for (const callback of waiting) {
        callback(time);
      }
    },
    get waiting() {
      return callbacks.size;
    },
  };
}

describe('onPresentedFrame', () => {
  it('starts on the second frame when nothing stalls', () => {
    const fake = fakeWindow();
    const starts: number[] = [];
    onPresentedFrame(fake.win, time => starts.push(time));
    fake.frame(16.7);
    expect(starts).toEqual([]);
    fake.frame(33.3);
    expect(starts).toEqual([33.3]);
    expect(fake.waiting).toBe(0);
  });

  it('waits out a stall: the frame before it was never presented', () => {
    // Mobile Safari after a focus: one frame, then none for ~136 ms while
    // the keyboard comes up, then frames at the normal cadence.
    const fake = fakeWindow();
    const starts: number[] = [];
    onPresentedFrame(fake.win, time => starts.push(time));
    fake.frame(15);
    fake.frame(151);
    expect(starts).toEqual([]);
    fake.frame(167);
    expect(starts).toEqual([167]);
  });

  it('never waits longer than MAX_WAIT_MS', () => {
    const fake = fakeWindow();
    const starts: number[] = [];
    onPresentedFrame(fake.win, time => starts.push(time));
    fake.frame(100);
    fake.frame(400);
    fake.frame(800);
    expect(starts).toEqual([]);
    fake.frame(MAX_WAIT_MS + 50);
    expect(starts).toEqual([MAX_WAIT_MS + 50]);
  });

  it('a cancelled start never runs', () => {
    const fake = fakeWindow();
    const starts: number[] = [];
    const cancel = onPresentedFrame(fake.win, time => starts.push(time));
    fake.frame(16.7);
    cancel();
    fake.frame(33.3);
    fake.frame(50);
    expect(starts).toEqual([]);
    expect(fake.waiting).toBe(0);
  });
});
