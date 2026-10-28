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
 *   `stopRow` (at rest now, for an owner going away mid-motion),
 *   `layoutShifts` (how far a part's presence moves each piece of content),
 *   `releaseMotion` (clear the identity inline values once it rests) and
 *   `contentBelow` (the page content layout moves along with a component)
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

/** The elements this module has moved: their animator holds our state. */
const moved = new WeakSet<HTMLElement>();
/** The latest motion started on each element through this module. */
const motions = new WeakMap<HTMLElement, MotionHandle>();

/** The element's shared animator: the motion foundation's, one per element. */
export {animatorFor};

/** Whether this module has moved the element and it has not rested yet. */
export function isMoving(element: HTMLElement): boolean {
  return motions.has(element);
}

/** The latest motion started on the element here, if it has not rested. */
export function motionOf(element: HTMLElement): MotionHandle | undefined {
  return motions.get(element);
}

function track(element: HTMLElement, handle: MotionHandle): MotionHandle {
  moved.add(element);
  motions.set(element, handle);
  void handle.finished.then(() => {
    if (motions.get(element) === handle) {
      motions.delete(element);
    }
  });
  return handle;
}

/** Where the element's `property` is on screen at `at`, from its curve. */
export function presentation(
  element: HTMLElement,
  property: 'y' | 'rotate' | 'opacity',
  at: number,
): number {
  if (!moved.has(element)) {
    return property === 'opacity' ? 1 : 0;
  }
  return animatorFor(element).get(property, at);
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

/** Springs `element`'s `y` to `to` from the value on screen. */
export async function springTo(
  element: HTMLElement,
  to: number,
  spring: SpringDescription,
  at: number,
  crossfadeAs?: RowCrossfade,
): Promise<boolean> {
  return track(
    element,
    animatorFor(element).animate({y: to}, {spring}, {at, crossfadeAs}),
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

/**
 * Puts the element at rest now, with no offset, and clears its inline
 * values: stops whatever motion this module runs on it. For an owner going
 * away mid-motion (an unmount), which must leave nothing moved.
 */
export function stopRow(
  element: HTMLElement,
  ...properties: ReadonlyArray<'translate' | 'rotate' | 'opacity'>
): void {
  if (!moved.has(element)) {
    return;
  }
  animatorFor(element).set({y: 0, rotate: 0, opacity: 1});
  motions.delete(element);
  for (const property of properties) {
    element.style.removeProperty(property);
  }
}

/**
 * How far `content`'s layout moves when `part` is there rather than not:
 * each element's `offsetTop` (which ignores transforms) with `part` laid out
 * and with it out of layout for one read. Content whose layout `part` does
 * not move (a footer pinned at the bottom of its column, a container at the
 * page's top level) is left out, so only what layout moves moves.
 */
export function layoutShifts(
  part: HTMLElement,
  content: ReadonlyArray<HTMLElement>,
): Map<HTMLElement, number> {
  const withPart = content.map(element => element.offsetTop);
  const display = part.style.getPropertyValue('display');
  const priority = part.style.getPropertyPriority('display');
  part.style.setProperty('display', 'none', 'important');
  const withoutPart = content.map(element => element.offsetTop);
  if (display === '') {
    part.style.removeProperty('display');
  } else {
    part.style.setProperty('display', display, priority);
  }
  const shifts = new Map<HTMLElement, number>();
  content.forEach((element, index) => {
    const shift = withPart[index] - withoutPart[index];
    if (Math.abs(shift) >= 0.5) {
      shifts.set(element, shift);
    }
  });
  return shifts;
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
      const ours = moved.has(next);
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
