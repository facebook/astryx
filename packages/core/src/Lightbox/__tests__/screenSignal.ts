// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file screenSignal.ts
 * @input A screencast's frames (the interaction harness's startScreencast)
 * @output Exports `cadenceOutside`: the pace a recording keeps while the main
 *   thread is free, to judge a blocked main thread against
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
