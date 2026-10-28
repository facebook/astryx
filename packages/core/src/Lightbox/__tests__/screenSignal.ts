// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file screenSignal.ts
 * @input A screencast's frames (the interaction harness's startScreencast)
 * @output Exports `cadenceOutside`: the pace a recording keeps while the main
 *   thread is free, to judge a blocked main thread against; and
 *   `presentedFramesExpected`: the frames a busy proof's window can show at
 *   no more than 60 a second
 * @position Test helper for Lightbox's busy-main-thread proofs
 *   (__tests__/*.interaction.browser.spec.ts)
 */

/**
 * The recording's own median frame interval outside the block (ms): the
 * pace the screen keeps while the main thread is free. Linux WebKit
 * composites in software on the same CPU the blocked main thread spins on,
 * so on a loaded machine it presents more slowly during a block than
 * outside it; a proof judges the block against this pace.
 */
export function cadenceOutside(
  frames: ReadonlyArray<{t: number}>,
  block: {from: number; to: number},
): number {
  const times = frames
    .map(f => f.t)
    .filter(t => t < block.from || t > block.to)
    .sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < times.length; i += 1) {
    if (!(times[i - 1] < block.from && times[i] > block.to)) {
      gaps.push(times[i] - times[i - 1]);
    }
  }
  gaps.sort((a, b) => a - b);
  return gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 1000 / 60;
}

/**
 * Whole frame intervals in a busy proof's judged part, counted at no less
 * than one 60 Hz frame. WebKit's container screencast can alternate about
 * 11.3 and 17.1 ms intervals, so the median a proof counts in can land on
 * 11.3 ms: it then promises more frames than a 60 Hz display presents and
 * reads every 17 ms interval as a dropped frame, though the animation moved
 * in each frame shown.
 */
export function presentedFramesExpected(proof: {
  readonly judged: {readonly from: number; readonly to: number};
  readonly cadenceMs: number;
  readonly compositorFrameMs: number | null;
}): number {
  const frameMs = Math.max(
    proof.compositorFrameMs ?? proof.cadenceMs,
    1000 / 60,
  );
  return Math.floor((proof.judged.to - proof.judged.from) / frameMs);
}
