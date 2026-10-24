// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file presentedFrame.ts
 * @input A window and the motion to start
 * @output onPresentedFrame: runs a callback on the first frame the page has
 *   presented since the call (with that frame's time), so motion created
 *   there starts fresh; returns a cancel function
 * @position Lab-internal motion helper. SearchField's activation and
 *   NavigationStack's search bar both start their rise through it, so they
 *   start on the same frame
 *
 * Mobile Safari brings the software keyboard up after a focus with no
 * main-thread frame for about 150 ms. An animation created at the focus, or
 * in the one frame that still runs before the stall, has its start resolved
 * before the stall and jumps about a third of the way when frames resume. A
 * frame counts as presented once the next frame follows it at the normal
 * cadence (less than STEADY_GAP_MS later), so the callback runs on the second
 * of two such frames: about 32 ms after a change that stalls nothing, and on
 * the second frame after a stall. MAX_WAIT_MS bounds the wait.
 *
 * To be replaced by the animator's "begin when first presented" option once
 * it lands.
 */

/** Two frames this close together mean the page is presenting frames, ms. */
export const STEADY_GAP_MS = 40;

/** The longest the start waits for a steady pair of frames, ms. */
export const MAX_WAIT_MS = 1000;

/**
 * Runs `start(time)` on the first frame the page has presented since this
 * call. Returns a function that cancels a start still waiting.
 */
export function onPresentedFrame(
  win: Window,
  start: (time: number) => void,
): () => void {
  const begin = win.performance.now();
  let previous: number | null = null;
  let id = 0;
  let done = false;
  const step = (time: number) => {
    const steady = previous != null && time - previous < STEADY_GAP_MS;
    if (steady || time - begin > MAX_WAIT_MS) {
      done = true;
      start(time);
      return;
    }
    previous = time;
    id = win.requestAnimationFrame(step);
  };
  id = win.requestAnimationFrame(step);
  return () => {
    if (!done) {
      done = true;
      win.cancelAnimationFrame(id);
    }
  };
}
