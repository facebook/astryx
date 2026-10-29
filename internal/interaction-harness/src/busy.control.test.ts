// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file busy.control.test.ts
 * @input Synthetic tracked frames (no browser)
 * @output The busy-main-thread verdict against a control: a component that
 *   moves on the control's frames passes through a stall the compositor itself
 *   makes, and a frozen one, or one the control outpaces by a single frame,
 *   still fails.
 * @position Unit test of ./busy's control judgment; the frames are
 *   busy.test.ts's fixtures, and the browser proof with a real compositor
 *   control is in harness.interaction.browser.spec.ts.
 */

import {describe, expect, it} from 'vitest';
import {busyWindowProof} from './busy';
import type {TrackedFrame} from './frames';

const FRAME = 1000 / 60;
const BLOCK = {from: 1000, to: 1700};

/** A marker moving 3 px per frame from t = 800 to 1900, minus `dropped` frame indices. */
function moving(dropped: readonly number[] = []): TrackedFrame[] {
  const frames: TrackedFrame[] = [];
  for (let i = 0; 800 + i * FRAME <= 1900; i += 1) {
    if (dropped.includes(i)) {
      continue;
    }
    frames.push({
      t: 800 + i * FRAME,
      box: {x: 0, y: 3 * i, width: 10, height: 10},
    } as TrackedFrame);
  }
  return frames;
}

/** Index of the first frame at or after `t`. */
const at = (t: number) => Math.ceil((t - 800) / FRAME);

/** `moving()` with each frame in `repeats` presenting the previous frame's position. */
function repeating(repeats: readonly number[]): TrackedFrame[] {
  return moving().map((f, i) =>
    repeats.includes(i)
      ? ({...f, box: {...f.box!, y: 3 * (i - 1)}} as TrackedFrame)
      : f,
  );
}

/** `frames` as the control's: the same frames and times, moving along x. */
function asControl(frames: readonly TrackedFrame[]): TrackedFrame[] {
  return frames.map(
    f =>
      ({
        ...f,
        box: f.box == null ? null : {x: f.box.y, y: 0, width: 12, height: 12},
      }) as TrackedFrame,
  );
}

describe('busyWindowProof against a control', () => {
  it('passes a component that moves on every frame the control does, through a stall the compositor makes for both, which fails without the control', () => {
    // Three frames in a row presented nothing, for the control too: the
    // compositor shared the core the block spins on (a two-core runner).
    const gap = [at(1300), at(1300) + 1, at(1300) + 2];
    const component = moving(gap);
    const control = asControl(moving(gap));
    const alone = busyWindowProof(component, BLOCK);
    expect(alone.verdict.failures.join('\n')).toMatch(/longest stall/);
    const against = busyWindowProof(component, BLOCK, {control});
    expect(against.verdict.failures, against.summary).toEqual([]);
    expect(against.control).toMatchObject({moved: against.control?.movedWith});
    expect(against.summary).toMatch(
      /against the control: moved on \d+ of its \d+ frames/,
    );
  });

  it('still fails a frozen component while the control moves', () => {
    const frozen = moving().map(
      f =>
        ({
          ...f,
          box: {
            ...f.box!,
            y: f.t >= BLOCK.from ? 3 * at(BLOCK.from) : f.box!.y,
          },
        }) as TrackedFrame,
    );
    const proof = busyWindowProof(frozen, BLOCK, {
      control: asControl(moving()),
    });
    expect(proof.verdict.pass).toBe(false);
    expect(proof.verdict.failures.join('\n')).toMatch(
      /moved on 0 of the \d+ frames the control moved/,
    );
    expect(proof.verdict.failures.join('\n')).toMatch(
      /longer than the control's/,
    );
  });

  it('fails a component the control outpaces: it repeats positions on frames the control moves', () => {
    const repeats = [0, 1, 2, 3].map(k => at(1100) + 6 * k);
    const proof = busyWindowProof(repeating(repeats), BLOCK, {
      control: asControl(moving()),
    });
    expect(proof.verdict.failures.join('\n')).toMatch(
      /moved on \d+ of the \d+ frames the control moved/,
    );
  });

  it('fails a component that misses a single frame the control moved', () => {
    // One repeated position: a frame the control moved on and the component
    // did not, which a compositor animation never shows, since both are read
    // from the same screencast frames.
    const proof = busyWindowProof(repeating([at(1300)]), BLOCK, {
      control: asControl(moving()),
    });
    expect(proof.verdict.failures.join('\n')).toMatch(
      /moved on \d+ of the \d+ frames the control moved/,
    );
    expect(proof.control!.moved - proof.control!.movedWith).toBe(1);
  });

  it('fails a window in which the control itself presented too little to judge', () => {
    const still = asControl(
      moving().map(f => ({...f, box: {...f.box!, y: 0}}) as TrackedFrame),
    );
    const proof = busyWindowProof(moving(), BLOCK, {control: still});
    expect(proof.verdict.failures.join('\n')).toMatch(
      /the control moved on 0 frames in the judged part/,
    );
  });
});
