// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarLens.ts
 * @input The TabBar's capsule element, its item count, the selected index,
 *   whether the touch presentation applies and what to do on a lift; core's
 *   compositor animator and long-press recognizer
 *   (`@astryxdesign/core/motion/experimental`,
 *   `@astryxdesign/core/gestures/experimental`), the UIKit tab-bar table and
 *   tabBarModel.ts
 * @output Exports useTabBarLens: the selection lens's touch presentation
 *   (the slide on a selection change and UITabBar's press tracking) and the
 *   refs TabBar puts on the capsule and the lens's layers
 * @position Internal to the lab TabBar (TabBar.tsx)
 *
 * WHAT MOVES (uikit/tabBar.ts, all measured on iOS 26.2)
 *
 * The lens is a CSS resting place over the selected item (TabBar.tsx) with
 * a body inside it that this hook moves: `x` is its offset from the resting
 * place, `scaleX` / `scaleY` its lift. Inside the body, a clip holds the
 * opaque resting fill, the glass that fades in as it lifts and the selected
 * copy of the items; the copy is counter-transformed (tabBarModel's
 * `copyTransform`, played as curves derived from the body's) so the items
 * stay put while the lens moves over them, and each copied item grows by
 * the lift's magnification about its own centre.
 *
 * Under a finger (a long press with no delay, so it begins on the touch, as
 * UIKit's selection tracker does):
 * - landing: the lens travels toward the finger (`lensTravel`) and lifts
 *   (`lift`: outset, glass, magnification), and the capsule flexes
 *   (`flexPress`);
 * - dragging (past the long press's allowable movement): the lens chases
 *   the finger (`lensTrack`), rubber-banded past the first and last items;
 * - lifting: the item nearest the finger is chosen, the lens settles onto it
 *   (`lensSettle`), the lift and the flex relax (`lift`, `flexRelease`). A
 *   cancelled touch settles back onto the selected item.
 * The choice reaches the app (`onLift`) three frames after the lift, once
 * Mobile Safari has handed the settle to its compositor: the app's own work
 * on the new tab can then no longer freeze it (UIKit swaps the content about
 * a frame after the lift). A finger landing before then reports it at once,
 * so every press starts from the app's current selection; the report renders
 * synchronously, and if the app keeps the old selection the lens settles
 * back onto it.
 * The finger is read in the capsule's own coordinates, before its flex
 * scale, as UIKit reads it: under the flex the lens drifts slightly away
 * from the finger toward the ends, as on iOS.
 *
 * A selection change slides the body from where the lens was on screen to
 * its new resting place: on `lensTravel` from rest (a key, the app), or
 * continuing the settle a lift started. Every animation runs on the
 * compositor; a finger's moves retarget them, so the lens keeps moving
 * through a busy main thread. Reduce Motion changes nothing, as on iOS.
 *
 * SYNC: When modified, update TabBar.tsx, tabBarModel.ts and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {useLayoutEffect, useRef, type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {
  createAnimator,
  uikit,
  useAnimator,
  type Animator,
  type MotionCurve,
} from '@astryxdesign/core/motion/experimental';
import {
  LongPressGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures/experimental';
import {
  copyTransform,
  itemCenters,
  itemWidth,
  lensTarget,
  liftScale,
  nearestIndex,
} from './tabBarModel';

const {tabBar, UIKIT_GESTURES} = uikit;

const MOTION = {reducedMotion: tabBar.reducedMotion};

/** A finger that has moved this far from where it landed is dragging. */
const DRAG_SLOP = UIKIT_GESTURES.longPress.allowableMovement.value;

/** How long the selected copy's curves run: past any lens spring's settle. */
const COPY_HORIZON_S = 1.5;

/** Seconds between the samples a derived curve's velocity is read from. */
const VELOCITY_STEP_S = 0.001;

/**
 * Rendering updates Mobile Safari needs before an animation runs on its
 * compositor (iOS 26.2 simulator: a 600 ms block 15 ms after the lift froze
 * the settle; one 120 ms after it did not, layer or no layer).
 */
const HAND_OFF_FRAMES = 3;

/** Runs `callback` once the animations started now have been handed off. */
function afterHandOff(callback: () => void): void {
  let frames = 0;
  const step = () => {
    frames += 1;
    if (frames < HAND_OFF_FRAMES) {
      requestAnimationFrame(step);
    } else {
      // After this frame's rendering update, not inside it.
      setTimeout(callback, 0);
    }
  };
  requestAnimationFrame(step);
}

interface Press {
  /** The items' centres in the capsule, physical px, before the flex. */
  readonly centers: number[];
  /** The items' (and the resting lens's) width, px. */
  readonly size: number;
  /** The capsule's left edge in client px, before the flex. */
  readonly left: number;
  readonly startX: number;
  lastX: number;
  isDragging: boolean;
}

export interface UseTabBarLensOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
  readonly count: number;
  readonly selectedIndex: number;
  readonly isTouch: boolean;
  /** A finger lifted over the item at `index`. */
  readonly onLift: (index: number) => void;
}

export interface TabBarLensRefs {
  /** The capsule: the flex. */
  readonly capsule: (element: HTMLElement | null) => void;
  /** The lens body: its offset and lift. */
  readonly body: (element: HTMLElement | null) => void;
  /** The lifted lens's shadow (outside the clip). */
  readonly shadow: (element: HTMLElement | null) => void;
  /** The lifted lens's glass. */
  readonly glass: (element: HTMLElement | null) => void;
  /** The selected copy of the items. */
  readonly copy: (element: HTMLElement | null) => void;
  /** One copied item, by index: the magnification. */
  readonly copyItem: (index: number) => (element: HTMLElement | null) => void;
}

/** One animator per copied item, stable across renders. */
function useAnimatorList(count: number) {
  const listRef = useRef<{
    animators: Animator[];
    refs: Array<(element: HTMLElement | null) => void>;
  }>({animators: [], refs: []});
  const list = listRef.current;
  while (list.animators.length < count) {
    const animator = createAnimator(null);
    list.animators.push(animator);
    list.refs.push(element => animator.attach(element));
  }
  return list;
}

export function useTabBarLens({
  capsuleRef,
  count,
  selectedIndex,
  isTouch,
  onLift,
}: UseTabBarLensOptions): TabBarLensRefs {
  const capsule = useAnimator();
  const body = useAnimator();
  // The lifted look starts hidden (an animator's values start at identity).
  const shadow = useAnimator({initial: {opacity: 0}});
  const glass = useAnimator({initial: {opacity: 0}});
  const copy = useAnimator();
  const copyItems = useAnimatorList(count);

  const pressRef = useRef<Press | null>(null);
  // The settle a lift started toward a newly chosen item, until the new
  // selection renders (or the app keeps the old one).
  const settleRef = useRef<number | null>(null);
  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;
  const onLiftRef = useRef(onLift);
  onLiftRef.current = onLift;
  // A lift's choice waiting for its hand-off before it reaches the app.
  const pendingReportRef = useRef<(() => void) | null>(null);

  /**
   * Plays the selected copy's counter-transform from `at`, derived from the
   * body's curves as they now stand. Called after every change to the body.
   */
  const playCopy = (at: number) => {
    const sample = (t: number) => {
      const time = at + t * 1000;
      return copyTransform(
        body.animator.get('x', time),
        body.animator.get('scaleX', time),
        body.animator.get('scaleY', time),
      );
    };
    const curve = (key: 'x' | 'scaleX' | 'scaleY'): MotionCurve => ({
      duration: COPY_HORIZON_S,
      at: t => sample(t)[key],
      velocity: t =>
        (sample(t + VELOCITY_STEP_S)[key] -
          sample(Math.max(0, t - VELOCITY_STEP_S))[key]) /
        (t >= VELOCITY_STEP_S ? 2 * VELOCITY_STEP_S : VELOCITY_STEP_S),
    });
    copy.animator.play(
      {x: curve('x'), scaleX: curve('scaleX'), scaleY: curve('scaleY')},
      {at, ...MOTION},
    );
  };

  /**
   * Lifts (true) or lowers (false) a lens `size` px wide and flexes the
   * capsule.
   */
  const lift = (isLifted: boolean, at: number, size: number) => {
    const options = {at, ...MOTION};
    const spring = {spring: tabBar.lift};
    const lifted = liftScale(size);
    body.animator.animate(
      isLifted ? {scaleX: lifted.x, scaleY: lifted.y} : {scaleX: 1, scaleY: 1},
      spring,
      options,
    );
    shadow.animator.animate({opacity: isLifted ? 1 : 0}, spring, options);
    glass.animator.animate({opacity: isLifted ? 1 : 0}, spring, options);
    for (const item of copyItems.animators.slice(0, count)) {
      item.animate(
        {scale: isLifted ? tabBar.liftMagnification : 1},
        spring,
        options,
      );
    }
    capsule.animator.animate(
      {scale: isLifted ? tabBar.flexScale : 1},
      {spring: isLifted ? tabBar.flexPress : tabBar.flexRelease},
      options,
    );
  };

  const begin = (recognizer: LongPressGestureRecognizer) => {
    // A finger landing before the last lift's choice reached the app: report
    // it now, so the selection this press starts from is that choice.
    pendingReportRef.current?.();
    const element = capsuleRef.current;
    const selected = selectedRef.current;
    const root = element?.parentElement;
    if (element == null || root == null || selected < 0) {
      return;
    }
    // Read before anything moves: the capsule's layout box (its flex is a
    // transform, which layout ignores) placed by its unscaled parent.
    const rootBox = root.getBoundingClientRect();
    const left = rootBox.left + element.offsetLeft;
    const isRtl = getComputedStyle(element).direction === 'rtl';
    const centers = itemCenters(element.offsetWidth, count, isRtl);
    const size = itemWidth(element.offsetWidth, count);
    const x = recognizer.location().x - left;
    pressRef.current = {
      centers,
      size,
      left,
      startX: x,
      lastX: x,
      isDragging: false,
    };
    const at = performance.now();
    body.animator.animate(
      {x: lensTarget(x, centers) - centers[selected]},
      {spring: tabBar.lensTravel},
      {at, ...MOTION},
    );
    lift(true, at, size);
    playCopy(at);
  };

  const move = (recognizer: LongPressGestureRecognizer) => {
    const press = pressRef.current;
    const selected = selectedRef.current;
    if (press == null || selected < 0) {
      return;
    }
    const x = recognizer.location().x - press.left;
    press.lastX = x;
    press.isDragging ||= Math.abs(x - press.startX) > DRAG_SLOP;
    const at = performance.now();
    body.animator.animate(
      {x: lensTarget(x, press.centers) - press.centers[selected]},
      {spring: press.isDragging ? tabBar.lensTrack : tabBar.lensTravel},
      {at, ...MOTION},
    );
    playCopy(at);
  };

  const end = (isCancelled: boolean) => {
    const press = pressRef.current;
    pressRef.current = null;
    const selected = selectedRef.current;
    if (press == null || selected < 0) {
      return;
    }
    const chosen = isCancelled
      ? selected
      : nearestIndex(press.lastX, press.centers);
    const at = performance.now();
    body.animator.animate(
      {x: press.centers[chosen] - press.centers[selected]},
      {spring: tabBar.lensSettle},
      {at, ...MOTION},
    );
    lift(false, at, press.size);
    playCopy(at);
    if (isCancelled) {
      return;
    }
    if (chosen !== selected) {
      settleRef.current = chosen;
    }
    // Report the lift once the settle is on the compositor: Mobile Safari
    // hands a new animation over only after a few rendering updates, and a
    // main thread busy before then (the app rendering the chosen tab) would
    // freeze it until the work ends.
    const report = () => {
      if (pendingReportRef.current !== report) {
        return;
      }
      pendingReportRef.current = null;
      // Rendered at once (React schedules an update made outside an event),
      // so the selection reads the app's answer right after.
      flushSync(() => onLiftRef.current(chosen));
      if (
        chosen !== selected &&
        settleRef.current === chosen &&
        selectedRef.current === selected
      ) {
        // The app kept the old selection: the lens settles back.
        settleRef.current = null;
        const now = performance.now();
        body.animator.animate(
          {x: 0},
          {spring: tabBar.lensSettle},
          {at: now, ...MOTION},
        );
        playCopy(now);
      }
    };
    pendingReportRef.current = report;
    afterHandOff(report);
  };

  useGestureRecognizer(
    capsuleRef,
    () =>
      new LongPressGestureRecognizer({
        name: 'tab-bar-selection',
        minimumPressDuration: 0,
        allowedPointerTypes: ['touch', 'pen'],
      }),
    recognizer => {
      switch (recognizer.state) {
        case 'began':
          begin(recognizer);
          break;
        case 'changed':
          move(recognizer);
          break;
        case 'ended':
          end(false);
          break;
        case 'cancelled':
        case 'failed':
          end(true);
          break;
      }
    },
    {isEnabled: isTouch},
  );

  // A new selection: the resting place jumped to the new item (CSS, this
  // frame); the body starts where the lens was on screen. After a lift it
  // continues the settle the lift started; otherwise it slides from rest.
  const previousIndexRef = useRef(selectedIndex);
  useLayoutEffect(() => {
    const from = previousIndexRef.current;
    previousIndexRef.current = selectedIndex;
    const element = capsuleRef.current;
    const fromLift = settleRef.current === selectedIndex;
    settleRef.current = null;
    if (
      !isTouch ||
      element == null ||
      from === selectedIndex ||
      from < 0 ||
      selectedIndex < 0 ||
      from >= count
    ) {
      return;
    }
    const isRtl = getComputedStyle(element).direction === 'rtl';
    const centers = itemCenters(element.offsetWidth, count, isRtl);
    const now = performance.now();
    const shift = centers[from] - centers[selectedIndex];
    const offset = body.animator.get('x', now) + shift;
    const velocity = body.animator.getVelocity('x', now);
    body.animator.set({x: offset});
    const press = pressRef.current;
    if (press != null) {
      // A finger is down (the selection changed under it): the lens keeps
      // heading for the finger, now measured from its new resting place.
      body.animator.animate(
        {
          x:
            lensTarget(press.lastX, press.centers) -
            press.centers[selectedIndex],
        },
        {
          spring: press.isDragging ? tabBar.lensTrack : tabBar.lensTravel,
          velocity: {x: velocity},
        },
        {at: now, ...MOTION},
      );
      playCopy(now);
      return;
    }
    if (fromLift || velocity !== 0) {
      // Motion on screen: continue it from now, the copy derived from it.
      body.animator.animate(
        {x: 0},
        {
          spring: fromLift ? tabBar.lensSettle : tabBar.lensTravel,
          velocity: {x: velocity},
        },
        {at: now, ...MOTION},
      );
      playCopy(now);
      return;
    }
    // From rest (a key, the app): both curves start when the browser commits
    // the frame, with the lens's jump to its new place.
    copy.animator.set({x: -offset});
    body.animator.animate({x: 0}, {spring: tabBar.lensTravel}, MOTION);
    copy.animator.animate({x: 0}, {spring: tabBar.lensTravel}, MOTION);
  }, [selectedIndex, count, isTouch, capsuleRef, body, copy]);

  return {
    capsule: capsule.ref,
    body: body.ref,
    shadow: shadow.ref,
    glass: glass.ref,
    copy: copy.ref,
    copyItem: index => copyItems.refs[index],
  };
}
