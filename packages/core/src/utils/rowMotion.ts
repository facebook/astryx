// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file rowMotion.ts
 * @input The motion foundation's animator and the springs of list updates
 *   (motion/uikit/list.ts)
 * @output The moves list rows share: one animator per element for all the
 *   code that moves it (`animatorFor`; `animateRow` starts a recorded
 *   spring, `playRow` a recorded curve, `motionOf` reads the running one
 *   and its spring),
 *   `springHome` (spring a property to its resting value after the layout
 *   moved the element, keeping the velocity on screen), `springTo`,
 *   `stopRow` (at rest now, for an owner going away mid-motion),
 *   `layoutShifts` (how far a part's presence moves each piece of content),
 *   `releaseMotion` (clear the identity inline values once it rests) and
 *   `contentBelow` (the page content layout moves along with a component)
 * @position Internal utility for row motion (TreeList's expansion, List's
 *   update motion),
 *   shared by any code that moves a list row, so two motions never drive one
 *   row through two animators: every motion goes through the motion
 *   foundation's shared per-element `animatorFor`.
 *
 * FLIP, compositor only: when a commit moves an element, its old place is put
 * back with an inverse `translate` in the same frame, and the animator springs
 * it home. A row moved again mid-motion keeps its velocity, so consecutive
 * updates blend instead of restarting.
 *
 * SYNC: When modified, update TreeList/useTreeExpansionMotion.ts and
 * List/useListUpdateMotion.ts.
 */

import {
  animatorFor,
  type MotionCurve,
  type MotionHandle,
} from '../motion/animator';
import type {SpringDescription} from '../motion/spring';

/**
 * Reduced motion (`design:reduced-motion`): every row motion takes the
 * animator's own Reduced Motion handling, with no way to keep its travel. An
 * element that `crossfadeAs` names arrives or leaves by its fade alone; any
 * other cross-fades where it lands.
 */
export type RowCrossfade = 'entrance' | 'exit';

/**
 * The elements a row motion here has moved. Every motion drives an element
 * through its one shared animator (the motion foundation's `animatorFor`),
 * so two motions never fight over a channel; this set only tells which
 * elements this module has touched without creating an animator for others.
 */
const moved = new WeakSet<HTMLElement>();
type RowProperty = 'x' | 'y' | 'rotate' | 'opacity';

/** A motion started through this module: its handle and the spring it runs. */
export interface RowMotion {
  handle: MotionHandle;
  spring: SpringDescription;
}

/** The running motion of each element, per property, until it rests. */
const motions = new WeakMap<HTMLElement, Map<RowProperty, RowMotion>>();

/** The element's shared animator (one per element, for all its motions). */
export {animatorFor};

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
  options: {
    at?: number;
    velocity?: Partial<Record<RowProperty, number>>;
    crossfadeAs?: RowCrossfade;
  },
): MotionHandle {
  const properties = Object.keys(to) as RowProperty[];
  moved.add(element);
  return track(
    element,
    properties,
    animatorFor(element).animate(
      to,
      {spring, velocity: options.velocity},
      {at: options.at, crossfadeAs: options.crossfadeAs},
    ),
    spring,
  );
}

/**
 * Plays a closed-form curve on one of the element's properties through its
 * shared animator and records it with the spring it keeps pace with, like
 * `animateRow` (a fade timed against the rows sliding around it). With no
 * `at`, a curve from rest starts when the browser commits it, with every
 * other call from rest in the same task (the slides it is timed against).
 */
export function playRow(
  element: HTMLElement,
  property: RowProperty,
  curve: MotionCurve,
  spring: SpringDescription,
  at?: number,
): MotionHandle {
  moved.add(element);
  return track(
    element,
    [property],
    animatorFor(element).play({[property]: curve}, at == null ? {} : {at}),
    spring,
  );
}

/** Where the element's `property` is on screen at `at`, from its curve. */
export function presentation(
  element: HTMLElement,
  property: RowProperty,
  at: number,
): number {
  if (!moved.has(element)) {
    return property === 'opacity' ? 1 : 0;
  }
  return animatorFor(element).get(property, at);
}

/** Below this speed (units per second) a property counts as resting. */
const MOVING_VELOCITY = 0.001;

/**
 * Springs `element`'s `property` to its resting value (0, or 1 for opacity)
 * after moving it by `shift` (the layout just moved it the other way). A
 * layout shift never changes a running motion's curve: a moving property is
 * rebased (`animator.rebase`: same spring, velocity and target), and
 * `spring` applies only to an element at rest. Resolves true when a motion
 * started here arrives.
 */
export async function springHome(
  element: HTMLElement,
  property: RowProperty,
  shift: number,
  spring: SpringDescription,
  at: number,
  crossfadeAs?: RowCrossfade,
): Promise<boolean> {
  const animator = animatorFor(element);
  const running = motionOf(element, property);
  const moving =
    running != null ||
    Math.abs(animator.getVelocity(property, at)) > MOVING_VELOCITY;
  if (shift !== 0) {
    // A layout shift never changes a running motion's curve: a moving
    // property restarts from its value + shift with the same spring,
    // velocity and target; a resting one just takes the offset.
    animator.rebase({[property]: shift}, {at});
  }
  if (moving) {
    // Another component's motion (a drop, a swipe) settles on its own; only
    // ours reports its arrival to the caller.
    return running == null
      ? animator.atRest([property]).then(() => false)
      : running.handle.finished;
  }
  // From rest, the browser's commit sets the start, so a busy first frame
  // cannot skip the curve.
  return animateRow(
    element,
    {[property]: property === 'opacity' ? 1 : 0},
    spring,
    {crossfadeAs},
  ).finished;
}

/**
 * Moves `element`'s `property` by `shift` (the layout just moved it the
 * other way) and springs it to rest from the frame on screen. Unlike
 * `springHome`, a running motion is retargeted to rest too, keeping its
 * velocity: a change that the layout reverses mid-motion (edit mode
 * toggled back) turns it around with no jump. A resting property starts
 * when the browser commits the call. Resolves true when a motion started
 * here arrives.
 */
export async function springBack(
  element: HTMLElement,
  property: RowProperty,
  shift: number,
  spring: SpringDescription,
  at: number,
  crossfadeAs?: RowCrossfade,
): Promise<boolean> {
  const running = motionOf(element, property);
  if (shift !== 0) {
    animatorFor(element).rebase({[property]: shift}, {at});
  }
  return animateRow(
    element,
    {[property]: property === 'opacity' ? 1 : 0},
    spring,
    {at: running == null ? undefined : at, crossfadeAs},
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
  const running = motionOf(element, 'y');
  return animateRow(element, {y: to}, spring, {
    at: running == null ? undefined : at,
    crossfadeAs,
  }).finished;
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
  if (isMoving(element)) {
    return;
  }
  for (const property of properties) {
    if (isIdentity(property, element.style.getPropertyValue(property))) {
      element.style.removeProperty(property);
    }
  }
}

/**
 * Whether an inline value is the property's resting value: other code may
 * hold the same channel off rest (a swipe's x on `translate`), and only
 * identity values are ours to clear.
 */
function isIdentity(property: string, value: string): boolean {
  if (value === '' || value === 'none') {
    return true;
  }
  if (property === 'opacity') {
    return Number(value) === 1;
  }
  return value.split(/\s+/).every(part => Number.parseFloat(part) === 0);
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
  animatorFor(element).set({x: 0, y: 0, rotate: 0, opacity: 1});
  motions.delete(element);
  releaseMotion(element, ...properties);
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

/**
 * Whether an animation running on an element drives its `translate`, the
 * one channel this module writes (`transform`, `scale` and `rotate`
 * compose with it).
 */
function translatesElement(animation: Animation): boolean {
  if (
    typeof CSSTransition !== 'undefined' &&
    animation instanceof CSSTransition
  ) {
    return animation.transitionProperty === 'translate';
  }
  const effect = animation.effect;
  if (
    typeof KeyframeEffect === 'undefined' ||
    !(effect instanceof KeyframeEffect)
  ) {
    return false;
  }
  return effect.getKeyframes().some(frame => 'translate' in frame);
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
      // Ours from a motion still running, or not translated by anyone: an
      // element another owner translates has an owner our translate would
      // fight. Other animations compose with it on their own channels (a
      // tapped button's press feedback scales it through `transform`), so
      // they are no reason to leave it behind.
      const ours = moved.has(next);
      if (
        !ours &&
        ((style.translate !== '' && style.translate !== 'none') ||
          (typeof next.getAnimations === 'function' &&
            next.getAnimations().some(translatesElement)))
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
