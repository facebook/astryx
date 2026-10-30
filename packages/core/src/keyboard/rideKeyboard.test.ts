// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rideKeyboard.test.ts
 * @input vitest, rideKeyboard, a stand-in animator
 * @output Tests that a ride plays the curve the transition publishes
 *   (architecture:react-component-runtime INV11): its spring where it has no
 *   eased slide, Gboard's slide where it has one, from the transition's start,
 *   and a jump at once
 * @position Unit tests for keyboard/rideKeyboard.ts
 */

import {describe, expect, it, vi} from 'vitest';
import type {Animator} from '../motion/animator';
import {keyboard as androidKeyboard} from '../motion/android';
import {keyboard} from '../motion/uikit';
import type {KeyboardTransition} from './keyboardModel';
import {rideKeyboard} from './rideKeyboard';

function standInAnimator() {
  const handle = {finished: Promise.resolve(true)};
  return {
    animate: vi.fn(() => handle),
    play: vi.fn(() => handle),
    set: vi.fn(),
    get: vi.fn(() => 0),
  };
}

const transition = (
  overrides: Partial<KeyboardTransition>,
): KeyboardTransition => ({
  kind: 'show',
  from: 0,
  to: 300,
  start: 1000,
  velocity: 0,
  animated: true,
  predicted: false,
  curve: null,
  spring: keyboard.spring,
  ...overrides,
});

describe('rideKeyboard', () => {
  it('plays the spring the transition publishes, from its start', () => {
    const animator = standInAnimator();
    const spring = {mass: 1, stiffness: 300, damping: 30};

    rideKeyboard(
      animator as unknown as Animator,
      {y: -300},
      transition({spring}),
    );

    expect(animator.animate).toHaveBeenCalledWith(
      {y: -300},
      {spring},
      {at: 1000},
    );
  });

  it('plays the eased slide the transition publishes where it has one', () => {
    const animator = standInAnimator();

    rideKeyboard(
      animator as unknown as Animator,
      {y: -300},
      transition({
        curve: {
          durationMs: androidKeyboard.showMs,
          points: androidKeyboard.showCurve,
        },
      }),
    );

    expect(animator.animate).not.toHaveBeenCalled();
    expect(animator.play).toHaveBeenCalledTimes(1);
    const [curves, options] = animator.play.mock.calls[0] as unknown as [
      Record<string, {duration: number; at: (t: number) => number}>,
      {at: number},
    ];
    expect(options).toEqual({at: 1000});
    expect(curves.y.duration).toBeCloseTo(androidKeyboard.showMs / 1000, 9);
    expect(curves.y.at(curves.y.duration)).toBe(-300);
  });

  it('lands at once when the keyboard jumps', () => {
    const animator = standInAnimator();

    expect(
      rideKeyboard(
        animator as unknown as Animator,
        {y: -300},
        transition({animated: false}),
      ),
    ).toBeNull();
    expect(animator.set).toHaveBeenCalledWith({y: -300});
    expect(animator.animate).not.toHaveBeenCalled();
  });
});
