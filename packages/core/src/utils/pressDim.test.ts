// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressDim.test.ts
 * @input pressDim.ts with a stubbed Web Animations API and Reduce Motion fade
 * @output Proof that a press dim fades from the opacity on screen on its
 *   clock, takes the Reduce Motion fade when motion is reduced, replaces a
 *   running dim, and hands the element back to its own style at 1
 * @position Unit test beside utils/pressDim.ts (the browser proof is
 *   SegmentedControl's interaction spec, which plays this dim)
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fadePressDim, stopPressDim} from './pressDim';

const {fade} = vi.hoisted(() => ({
  fade: vi.fn<() => {duration: number; easing: string} | null>(() => null),
}));
vi.mock('../motion/reducedMotion', () => ({reducedMotionFade: fade}));

interface FakeAnimation {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  cancel: ReturnType<typeof vi.fn>;
  finish: () => void;
  finished: Promise<unknown>;
}

let element: HTMLElement;
let played: FakeAnimation[];

beforeEach(() => {
  played = [];
  element = document.createElement('div');
  document.body.append(element);
  element.animate = ((
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    let finish = () => {};
    const finished = new Promise(resolve => {
      finish = () => resolve(undefined);
    });
    const animation: FakeAnimation = {
      keyframes,
      options,
      cancel: vi.fn(),
      finish,
      finished,
    };
    played.push(animation);
    return animation as unknown as Animation;
  });
});

afterEach(() => {
  fade.mockReset();
  fade.mockImplementation(() => null);
  document.body.innerHTML = '';
});

const CLOCK = {durationMs: 100, curve: [0.25, 0.1, 0.25, 1]};

describe('fadePressDim', () => {
  it('fades from the opacity on screen to the target on its clock', () => {
    element.style.opacity = '0.6';
    fadePressDim(element, 0.2, CLOCK);
    expect(played).toHaveLength(1);
    expect(played[0].keyframes).toEqual([{opacity: 0.6}, {opacity: 0.2}]);
    expect(played[0].options).toMatchObject({
      duration: 100,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      fill: 'forwards',
    });
  });

  it('takes the Reduce Motion fade when motion is reduced, passing the touch release', () => {
    fade.mockImplementation(() => ({duration: 200, easing: 'ease-in-out'}));
    fadePressDim(element, 0.2, CLOCK, {touchRelease: true});
    expect(fade).toHaveBeenCalledWith(element, {touchRelease: true});
    expect(played[0].options).toMatchObject({
      duration: 200,
      easing: 'ease-in-out',
    });
  });

  it('replaces a running dim, and stopPressDim drops it', () => {
    fadePressDim(element, 0.2, CLOCK);
    fadePressDim(element, 1, CLOCK);
    expect(played[0].cancel).toHaveBeenCalledTimes(1);
    stopPressDim(element);
    expect(played[1].cancel).toHaveBeenCalledTimes(1);
  });

  it('hands the element back to its own style once a fade to 1 finishes', async () => {
    fadePressDim(element, 1, CLOCK);
    played[0].finish();
    await played[0].finished;
    await Promise.resolve();
    expect(played[0].cancel).toHaveBeenCalledTimes(1);
  });

  it('keeps a dim held (no hand-back below 1)', async () => {
    fadePressDim(element, 0.2, CLOCK);
    played[0].finish();
    await played[0].finished;
    await Promise.resolve();
    expect(played[0].cancel).not.toHaveBeenCalled();
  });
});
