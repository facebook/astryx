// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file rowMotion.ts
 * @input The motion foundation's animator and the springs of list updates
 *   (motion/uikit/list.ts)
 * @output The moves list rows share: one animator per element for every
 *   lane that moves it (`animatorFor`, `motionOf` for its latest motion),
 *   `springHome` (spring a property to its resting value after the layout
 *   moved the element, keeping the velocity on screen), `springTo`,
 *   `releaseMotion` (clear the identity inline values once it rests) and
 *   `motionNow` (the motion clock)
 * @position Internal utility for row motion (TreeList's expansion today),
 *   shared by any code that moves a list row, so two motions never drive one
 *   row through two animators: every spring plays on the motion foundation's
 *   shared per-element `animatorFor`, never a local animator.
 *
 * FLIP, compositor only: when a commit moves an element, its old place is put
 * back with an inverse `translate` in the same frame, and the animator springs
 * it home. A row moved again mid-motion keeps its velocity, so consecutive
 * updates blend instead of restarting.
 *
 * SYNC: When modified, update TreeList/useTreeExpansionMotion.ts.
 */

import {animatorFor, type MotionHandle} from '../motion/animator';
import type {SpringDescription} from '../motion/spring';

/**
 * Reduced motion (`design:reduced-motion`): every row motion takes the
 * animator's own Reduced Motion handling, with no way to keep its travel. An
 * element that `crossfadeAs` names arrives or leaves by its fade alone; any
 * other cross-fades where it lands.
 */
export type RowCrossfade = 'entrance' | 'exit';

/** Below this speed (units per second) a property counts as resting. */
const MOVING_VELOCITY = 0.001;

/** The latest motion started on each element through this module. */
const motions = new WeakMap<HTMLElement, MotionHandle>();

/** The element's shared animator: the motion foundation's, one per element. */
export {animatorFor};

/** Whether this module has moved the element and it has not rested yet. */
function isMoving(element: HTMLElement): boolean {
  return motions.has(element);
}

/** The latest motion started on the element here, if it has not rested. */
export function motionOf(element: HTMLElement): MotionHandle | undefined {
  return motions.get(element);
}

function track(element: HTMLElement, handle: MotionHandle): MotionHandle {
  motions.set(element, handle);
  void handle.finished.then(() => {
    if (motions.get(element) === handle) {
      motions.delete(element);
    }
  });
  return handle;
}

/**
 * Springs `element`'s `property` to its resting value (0, or 1 for opacity)
 * after moving it by `shift` (the layout just moved it the other way),
 * keeping the velocity it has on screen. From rest it starts when the
 * browser commits it, so a busy first frame cannot skip into the curve; a
 * motion already running keeps its clock. Resolves true when it arrives.
 */
export async function springHome(
  element: HTMLElement,
  property: 'y' | 'rotate' | 'opacity',
  shift: number,
  spring: SpringDescription,
  at: number,
  crossfadeAs?: RowCrossfade,
): Promise<boolean> {
  const animator = animatorFor(element);
  const value = animator.get(property, at);
  const velocity = animator.getVelocity(property, at);
  const moving = isMoving(element) || Math.abs(velocity) > MOVING_VELOCITY;
  if (shift !== 0) {
    animator.set({[property]: value + shift});
  }
  return track(
    element,
    animator.animate(
      {[property]: property === 'opacity' ? 1 : 0},
      {spring, velocity: {[property]: velocity}},
      // From rest, the browser's commit sets the start, so a busy first
      // frame cannot skip the curve; a motion already running keeps its
      // clock (`at`) along with the velocity on screen.
      moving ? {at, crossfadeAs} : {crossfadeAs},
    ),
  ).finished;
}

/**
 * Springs `element`'s `y` to `to` from the value on screen. From rest it
 * starts when the browser commits it, as `springHome` does, so the motions
 * a toggle starts together share one clock (`spec:AST-108` FR4a) and a busy
 * first frame cannot skip into the curve; a motion already running keeps
 * its clock (`at`) along with the velocity on screen.
 */
export async function springTo(
  element: HTMLElement,
  to: number,
  spring: SpringDescription,
  at: number,
  crossfadeAs?: RowCrossfade,
): Promise<boolean> {
  const animator = animatorFor(element);
  const moving =
    isMoving(element) ||
    Math.abs(animator.getVelocity('y', at)) > MOVING_VELOCITY;
  return track(
    element,
    animator.animate(
      {y: to},
      {spring},
      moving ? {at, crossfadeAs} : {crossfadeAs},
    ),
  ).finished;
}

/**
 * Clears the element's identity inline values once it rests, so a resting
 * row carries no `translate` (a transform makes it a containing block for
 * fixed descendants). The animator stays: other code may hold it, and its
 * state still reads the resting value. Nothing is cleared while a newer
 * motion runs on the element.
 */
export function releaseMotion(
  element: HTMLElement,
  ...properties: ReadonlyArray<'translate' | 'rotate' | 'opacity'>
): void {
  if (motions.has(element)) {
    return;
  }
  for (const property of properties) {
    element.style.removeProperty(property);
  }
}

/** The time the motion clock reads (`performance.now()`'s time base). */
export function motionNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}
