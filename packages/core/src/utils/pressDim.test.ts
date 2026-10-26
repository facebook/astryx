// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressDim.test.ts
 * @input pressDim.ts with the element's animator stubbed
 * @output Proof that a press dim plays one opacity curve through the
 *   element's animator, from the opacity on screen to the target on its clock
 *   and curve, passes the touch release (the animator's Reduce Motion policy
 *   decides the rest), and that stopPressDim hands the element back at once
 * @position Unit test beside utils/pressDim.ts (the animator's own tests
 *   cover play and Reduce Motion; SegmentedControl's interaction spec plays
 *   this dim in a browser)
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {MotionCurve} from '../motion/animator';
import {cubicBezier} from '../motion/bezier';
import {fadePressDim, isPressDimReleased, stopPressDim} from './pressDim';

const {animator} = vi.hoisted(() => ({
  animator: {
    opacity: 1,
    get: vi.fn(() => animator.opacity),
    play: vi.fn(),
    set: vi.fn(),
  },
}));
vi.mock('../motion/animator', () => ({animatorFor: () => animator}));

const CLOCK = {durationMs: 100, curve: [0.25, 0.1, 0.25, 1]} as const;

beforeEach(() => {
  animator.opacity = 1;
  animator.play.mockClear();
  animator.set.mockClear();
});

function played(): {curve: MotionCurve; options: {touchRelease: boolean}} {
  const [curves, options] = animator.play.mock.calls.at(-1) as [
    {opacity: MotionCurve},
    {touchRelease: boolean},
  ];
  return {curve: curves.opacity, options};
}

describe('fadePressDim', () => {
  it('plays one opacity curve from the opacity on screen to the target, on the clock and curve', () => {
    animator.opacity = 0.6;
    const element = document.createElement('div');
    fadePressDim(element, 0.2, CLOCK);
    const {curve, options} = played();
    expect(curve.duration).toBe(0.1);
    expect(curve.at(0)).toBeCloseTo(0.6, 6);
    expect(curve.at(0.1)).toBeCloseTo(0.2, 6);
    const ease = cubicBezier(CLOCK.curve);
    expect(curve.at(0.05)).toBeCloseTo(0.6 + (0.2 - 0.6) * ease(0.5), 6);
    expect(curve.velocity(0.05)).toBeLessThan(0);
    expect(options).toEqual({touchRelease: false});
  });

  it('passes the touch release to the animator, whose Reduce Motion policy applies', () => {
    fadePressDim(document.createElement('div'), 1, CLOCK, {
      touchRelease: true,
    });
    expect(played().options).toEqual({touchRelease: true});
  });

  it('stopPressDim hands the element back to its own style at once', () => {
    stopPressDim(document.createElement('div'));
    expect(animator.set).toHaveBeenCalledWith({opacity: 1}, {promote: false});
  });

  it('isPressDimReleased waits until the animator shows 1 and holds no inline opacity', () => {
    const element = document.createElement('div');
    animator.opacity = 0.6;
    expect(isPressDimReleased(element)).toBe(false);
    animator.opacity = 1;
    // A finished return still holds its inline value until it retires.
    element.style.opacity = '1';
    expect(isPressDimReleased(element)).toBe(false);
    element.style.removeProperty('opacity');
    expect(isPressDimReleased(element)).toBe(true);
  });
});
