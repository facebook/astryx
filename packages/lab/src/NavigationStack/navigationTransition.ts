// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigationTransition.ts
 * @input The UIKit navigation constants (`uikit.navigation`) from
 *   `@astryxdesign/core/motion/experimental`
 * @output Pure math for NavigationStack's push/pop transition: the layers'
 *   values at a progress (`layersAt`), their velocities for a progress
 *   velocity (`layerVelocities`), the interactive pop's release rule
 *   (`shouldFinishPop`) and progress from a finger's travel
 *   (`progressFromTravel`)
 * @position Lab NavigationStack internals; no DOM, no React. The component
 *   hands these numbers to the compositor animator.
 *
 * One number describes a transition: progress `p`, the share of the width
 * the top card has uncovered. `p = 0`: the top card covers the screen (a
 * push has landed); `p = 1`: it has left and the card under it is back (a
 * pop has landed). A push runs p 1 → 0, a pop 0 → 1, and an interactive pop
 * scrubs p with the finger (UIKit: `percentComplete` = translation / width).
 *
 * The layers, as UIKit moves them on iOS 26.2 (measured):
 * - top card: x = p · W;
 * - card under it: x = parallax · W · (1 − p), so from −0.3 W to 0;
 * - dimming over the card under it: opacity 1 − p (black at 10 %);
 * - bar contents: the top screen's at 1 − p, the one under it at p.
 *
 * Every layer is linear in p, so one spring run on all of them with
 * velocities scaled the same way keeps them on one trajectory.
 *
 * SYNC: When modified, update navigationTransition.test.ts.
 */

import {uikit} from '@astryxdesign/core/motion/experimental';

const {navigation} = uikit;

export interface TransitionLayers {
  /** The top card's translateX, px. */
  readonly topX: number;
  /** The covered card's translateX, px. */
  readonly underX: number;
  /** The dimming's opacity over the covered card, 0–1. */
  readonly dim: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The layers at progress `p` for a container `width` px wide. `direction`
 * is the writing direction: under RTL cards enter from the left, so every x
 * flips.
 */
export function layersAt(
  p: number,
  width: number,
  direction: 'ltr' | 'rtl' = 'ltr',
): TransitionLayers {
  const sign = direction === 'rtl' ? -1 : 1;
  return {
    topX: sign * p * width,
    underX: sign * navigation.parallax * width * (1 - p),
    dim: 1 - p,
  };
}

/**
 * The layers' velocities (px/s and 1/s) when progress moves at `dp` per
 * second: the same scaling as `layersAt`, so a spring started with these
 * keeps every layer on the progress curve.
 */
export function layerVelocities(
  dp: number,
  width: number,
  direction: 'ltr' | 'rtl' = 'ltr',
): TransitionLayers {
  const sign = direction === 'rtl' ? -1 : 1;
  return {
    topX: sign * dp * width,
    underX: -sign * navigation.parallax * width * dp,
    dim: -dp,
  };
}

/**
 * Progress of the push and pop springs' starting velocity: they do not start
 * from rest (8.773 widths per second on iOS 26.2). Negative for a push
 * (p heads to 0), positive for a pop.
 */
export function programmaticVelocity(kind: 'push' | 'pop'): number {
  return kind === 'push' ? -navigation.pushVelocity : navigation.pushVelocity;
}

/**
 * Progress from a finger's horizontal travel since the pop began, px, added
 * to the progress the cards had when it began (a pop grabbed mid-flight
 * continues from where it is). Clamped to [0, 1]: there is no travel past
 * either end.
 */
export function progressFromTravel(
  startProgress: number,
  travelX: number,
  width: number,
  direction: 'ltr' | 'rtl' = 'ltr',
): number {
  if (width <= 0) {
    return clamp01(startProgress);
  }
  const sign = direction === 'rtl' ? -1 : 1;
  return clamp01(startProgress + (sign * travelX) / width);
}

/**
 * The interactive pop's release rule (iOS 26.2, 58 of 61 releases): finish
 * when progress plus 0.35 s of the release velocity, in widths per second,
 * passes half the width; otherwise cancel. A still finger at 0.475 cancels;
 * at 0.05 a flick needs about 2 widths per second.
 */
export function shouldFinishPop(
  progress: number,
  velocityWidthsPerSecond: number,
): boolean {
  return (
    progress +
      navigation.interactivePopFinishProjection * velocityWidthsPerSecond >
    navigation.interactivePopFinishThreshold
  );
}

/** A finger's horizontal velocity, px/s, in widths per second toward a pop. */
export function popVelocity(
  velocityX: number,
  width: number,
  direction: 'ltr' | 'rtl' = 'ltr',
): number {
  if (width <= 0) {
    return 0;
  }
  return ((direction === 'rtl' ? -1 : 1) * velocityX) / width;
}
