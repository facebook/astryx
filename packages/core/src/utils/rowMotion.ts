// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file rowMotion.ts
 * @input The motion foundation's animator and the springs of list updates
 *   (motion/uikit/list.ts)
 * @output The moves list rows share: one animator per element for every
 *   lane that moves it (`animatorFor`; `animateRow` starts a recorded
 *   spring, `motionOf` reads the running one and its spring),
 *   `springHome` (spring a property to its resting value after the layout
 *   moved the element, keeping the velocity on screen), `springTo`,
 *   `releaseMotion` (clear the identity inline values once it rests) and
 *   `contentBelow` (the page content layout moves along with a component)
 * @position Internal utility for row motion (TreeList's expansion, List's
 *   update motion),
 *   shared by any code that moves a list row, so two motions never drive one
 *   row through two animators. A shim with the signature of the motion
 *   foundation's coming per-element `animatorFor`: the swap is one import.
 *
 * FLIP, compositor only: when a commit moves an element, its old place is put
 * back with an inverse `translate` in the same frame, and the animator springs
 * it home. A row moved again mid-motion keeps its velocity, so consecutive
 * updates blend instead of restarting.
 *
 * SYNC: When modified, update TreeList/useTreeExpansionMotion.ts and
 * utils/useListUpdateMotion.ts.
 */

import {
  createAnimator,
  type Animator,
  type MotionHandle,
} from '../motion/animator';
import type {SpringDescription} from '../motion/spring';

/**
 * Reduce Motion keeps the motion: UIKit runs the same table and outline
 * update animations with Reduce Motion on, and with Prefer Cross-Fade
 * Transitions too (measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro,
 * CAAnimation dump, Oct 23 2026).
 */
const REDUCED_MOTION = 'keep' as const;

/**
 * The animator of each element that moves, shared by every motion that moves
 * it: two animators on one element would fight over the same channel.
 */
const animators = new WeakMap<HTMLElement, Animator>();
type RowProperty = 'y' | 'rotate' | 'opacity';

/** A motion started through this module: its handle and the spring it runs. */
export interface RowMotion {
  handle: MotionHandle;
  spring: SpringDescription;
}

/** The running motion of each element, per property, until it rests. */
const motions = new WeakMap<HTMLElement, Map<RowProperty, RowMotion>>();

/** The element's shared animator, created on first use. */
export function animatorFor(element: HTMLElement): Animator {
  let animator = animators.get(element);
  if (animator == null) {
    animator = createAnimator(element);
    animators.set(element, animator);
  }
  return animator;
}

/** Whether a motion started here still runs on the element. */
export function isMoving(element: HTMLElement): boolean {
  return (motions.get(element)?.size ?? 0) > 0;
}

/**
 * The motion running on the element's `property`, started here, with the
 * spring it runs on; undefined once it rests.
 */
export function motionOf(
  element: HTMLElement,
  property: RowProperty = 'y',
): RowMotion | undefined {
  return motions.get(element)?.get(property);
}

function track(
  element: HTMLElement,
  properties: ReadonlyArray<RowProperty>,
  handle: MotionHandle,
  spring: SpringDescription,
): MotionHandle {
  let running = motions.get(element);
  if (running == null) {
    running = new Map();
    motions.set(element, running);
  }
  const motion = {handle, spring};
  for (const property of properties) {
    running.set(property, motion);
  }
  const record = running;
  void handle.finished.then(() => {
    for (const property of properties) {
      if (record.get(property) === motion) {
        record.delete(property);
      }
    }
  });
  return handle;
}

/**
 * Starts a spring on the element's shared animator and records it, so a
 * later layout shift keeps its curve (see `springHome`). For any code that
 * moves a list row: a drop, a slide to make room, an exit.
 */
export function animateRow(
  element: HTMLElement,
  to: Partial<Record<RowProperty, number>>,
  spring: SpringDescription,
  options: {at: number; velocity?: Partial<Record<RowProperty, number>>},
): MotionHandle {
  const properties = Object.keys(to) as RowProperty[];
  return track(
    element,
    properties,
    animatorFor(element).animate(
      to,
      {spring, velocity: options.velocity},
      {at: options.at, reducedMotion: REDUCED_MOTION},
    ),
    spring,
  );
}

/** Where the element's `property` is on screen at `at`, from its curve. */
export function presentation(
  element: HTMLElement,
  property: RowProperty,
  at: number,
): number {
  const animator = animators.get(element);
  if (animator == null) {
    return property === 'opacity' ? 1 : 0;
  }
  return animator.get(property, at);
}

/**
 * Springs `element`'s `property` to its resting value (0, or 1 for opacity)
 * after moving it by `shift` (the layout just moved it the other way),
 * keeping the velocity it has on screen. A layout shift never changes a
 * running motion's curve: if a motion started here still runs on the
 * property, its spring continues (springs are memoryless, so the curve goes
 * on exactly); `spring` applies to an element at rest. Resolves true when it
 * arrives.
 */
export async function springHome(
  element: HTMLElement,
  property: RowProperty,
  shift: number,
  spring: SpringDescription,
  at: number,
): Promise<boolean> {
  const animator = animatorFor(element);
  const value = animator.get(property, at);
  const velocity = animator.getVelocity(property, at);
  const curve = motionOf(element, property)?.spring ?? spring;
  if (shift !== 0) {
    animator.set({[property]: value + shift});
  }
  return animateRow(
    element,
    {[property]: property === 'opacity' ? 1 : 0},
    curve,
    {at, velocity: {[property]: velocity}},
  ).finished;
}

/** Springs `element`'s `y` to `to` from the value on screen. */
export async function springTo(
  element: HTMLElement,
  to: number,
  spring: SpringDescription,
  at: number,
): Promise<boolean> {
  return animateRow(element, {y: to}, spring, {at}).finished;
}

/**
 * Clears the element's identity inline values once it rests, so a resting
 * row carries no `translate` (a transform makes it a containing block for
 * fixed descendants). The animator stays: another lane may hold it, and its
 * state still reads the resting value. Nothing is cleared while a newer
 * motion runs on the element.
 */
export function releaseMotion(
  element: HTMLElement,
  ...properties: ReadonlyArray<'translate' | 'rotate' | 'opacity'>
): void {
  if (isMoving(element)) {
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

function isScrollContainer(element: HTMLElement): boolean {
  const {overflowY} = getComputedStyle(element);
  return overflowY === 'auto' || overflowY === 'scroll';
}

/**
 * The page content that layout moves along with `component` when it grows or
 * shrinks: the in-flow siblings after it, at each level up to its nearest
 * scroll container (or the document), that sit below it. Skipped, and left to
 * layout: positioned and sticky elements, and any element that already
 * carries a `translate` or a running animation another owner put there.
 */
export function contentBelow(component: HTMLElement): HTMLElement[] {
  const below: HTMLElement[] = [];
  const bottom = component.getBoundingClientRect().bottom;
  const body = component.ownerDocument.body;
  let node: HTMLElement = component;
  while (node !== body && node.parentElement != null) {
    const parent = node.parentElement;
    for (
      let next = node.nextElementSibling;
      next != null;
      next = next.nextElementSibling
    ) {
      if (!(next instanceof HTMLElement)) {
        continue;
      }
      const style = getComputedStyle(next);
      if (
        style.position === 'absolute' ||
        style.position === 'fixed' ||
        style.position === 'sticky' ||
        style.display === 'none'
      ) {
        continue;
      }
      // Ours from a motion still running, or untouched: anything else has
      // an owner that a translate of ours would fight.
      const ours = animators.has(next);
      if (
        !ours &&
        ((style.translate !== '' && style.translate !== 'none') ||
          (typeof next.getAnimations === 'function' &&
            next.getAnimations().length > 0))
      ) {
        continue;
      }
      // Below, not beside: a flex or grid neighbour does not move when the
      // component changes height.
      const top =
        next.getBoundingClientRect().top - presentation(next, 'y', motionNow());
      if (top < bottom - 1) {
        continue;
      }
      below.push(next);
    }
    if (isScrollContainer(parent)) {
      break;
    }
    node = parent;
  }
  return below;
}
