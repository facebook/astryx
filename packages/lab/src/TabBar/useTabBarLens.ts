// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarLens.ts
 * @input The TabBar's capsule element, its item count, the selected index,
 *   whether a finger drives the bar, whether the bar is minimized and what
 *   to do on a lift; core's
 *   compositor animator and long-press recognizer
 *   (`@astryxdesign/core/motion`,
 *   `@astryxdesign/core/gestures`), the UIKit tab-bar table and
 *   tabBarModel.ts
 * @output Exports useTabBarLens: the selection lens's touch presentation
 *   (the slide on a selection change and UITabBar's press tracking), the
 *   refs TabBar puts on the capsule and the lens's layers, and whether the
 *   lens's copy of the items is drawn (only while the lens moves)
 * @position Part of TabBar's touch layer (TabBarTouch.ts)
 *
 * WHAT MOVES (uikit/tabBar.ts, all measured on iOS 26.2)
 *
 * The lens is a CSS resting place over the selected item (TabBar.tsx) with
 * a body inside it that this hook moves: `x` is its offset from the resting
 * place, `scaleX` / `scaleY` its lift, and its `::before` the shadow that
 * fades in as it lifts. Inside the body, a clip (its background the opaque
 * fill, its `::before` the glass that fades in as it lifts) holds, while the
 * lens moves, the selected copy of the items; the copy is counter-transformed
 * (tabBarModel's `copyTransform`, played as curves derived from the body's)
 * so the items stay put while the lens moves over them, and each copied item
 * grows by the lift's magnification about its own centre. The copy mounts
 * when a finger lands or a slide starts and goes once everything rests; at
 * rest the selected tab draws its own look (TabBar.tsx).
 *
 * Under a finger, iOS and Android alike (a
 * long press with no delay, so it begins on the touch, as UIKit's selection
 * tracker does):
 * - landing: the lens travels toward the finger (`lensTravel`) and lifts
 *   (`lift`: outset, glass, magnification), and the capsule flexes
 *   (`flexPress`);
 * - dragging (past the long press's allowable movement): the lens chases
 *   the finger (`lensTrack`), rubber-banded past the first and last items;
 * - lifting: the item nearest the finger is chosen, the lens settles onto it
 *   (`lensSettle`), the lift and the flex relax (`lift`, `flexRelease`). A
 *   cancelled touch settles back onto the selected item.
 * The choice reaches the app (`onLift`) from the lift itself, right after
 * the settle has started in the same task (architecture:react-component-
 * runtime INV2): the settle's first frame waits for the browser's commit, so
 * the app rendering the new tab delays its start rather than freezing it
 * midway. The report renders synchronously, and if the app keeps the old
 * selection the lens settles back onto it.
 * The finger is read in the capsule's own coordinates, before its flex
 * scale, as UIKit reads it: under the flex the lens drifts slightly away
 * from the finger toward the ends, as on iOS.
 *
 * A selection change slides the body from where the lens was on screen to
 * its new resting place: on `lensTravel` from rest (a key, the app), or
 * continuing the settle a lift started.
 *
 * Minimizing (useTabBarMinimize.ts) carries the lens into the minimized
 * circle: it travels to the circle's centre (`collapseTravel`) and shrinks to
 * its size while fading (`collapseSize`), and the selected copy fades out
 * with the items (`minimizeFade`); expanding plays it back. A minimized bar
 * takes no press. Every animation runs on the
 * compositor; a finger's moves retarget them, so the lens keeps moving
 * through a busy main thread. Under Reduce Motion the animator cross-fades
 * instead of moving and a press scales nothing (design:reduced-motion).
 * Each spring is handed to the animator as a table entry, so it plays as the
 * theme sets its motion role. Under a mouse this hook writes nothing:
 * TabBar's CSS slides the lens and a click is a plain click.
 *
 * SYNC: When modified, update TabBar.tsx, tabBarModel.ts and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {flushSync} from 'react-dom';
import {
  LongPressGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '@astryxdesign/core/motion/animator';
import {
  registerTabBarTable,
  tabBar,
  UIKIT_GESTURES,
} from '@astryxdesign/core/motion/uikit';
import {useAnimator} from '@astryxdesign/core/motion/useAnimator';
import {isRtlElement} from '@astryxdesign/core/hooks';
import {
  copyTransform,
  itemCenters,
  itemWidth,
  lensTarget,
  liftScale,
  minimizedCenter,
  nearestIndex,
} from './tabBarModel';

/** A finger that has moved this far from where it landed is dragging. */
const DRAG_SLOP = UIKIT_GESTURES.longPress.allowableMovement.value;

/** How long the selected copy's curves run: past any lens spring's settle. */
const COPY_HORIZON_S = 1.5;
/**
 * How long the selected copy stays visible when the bar minimizes: it fades
 * with the items (`minimizeFade`, under 1% after 0.3 s), so its counter-move
 * stops there instead of sampling keyframes nobody sees.
 */
const COPY_FADE_S = 0.3;

/** Seconds between the samples a derived curve's velocity is read from. */
const VELOCITY_STEP_S = 0.001;

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
  /** A tab was selected when the finger landed: the lens follows it. */
  hasLens: boolean;
  /** Landed on a disabled tab: nothing moves until the finger drags. */
  isIgnored: boolean;
}

export interface UseTabBarLensOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
  readonly count: number;
  readonly selectedIndex: number;
  /** A finger drives the bar (the touch presentation: a coarse pointer). */
  readonly isTouch: boolean;
  /** The bar is minimized (useTabBarMinimize.ts): the lens is in the circle. */
  readonly isMinimized: boolean;
  /** A finger lifted over the item at `index`. */
  readonly onLift: (index: number) => void;
  /**
   * Whether the item at `index` is disabled: a finger landing on it is
   * ignored until it drags (UIKit ignores a tap on a disabled tab).
   */
  readonly isDisabled?: (index: number) => boolean;
}

export interface TabBarLensRefs {
  /** The capsule: the flex. */
  readonly capsule: (element: HTMLElement | null) => void;
  /**
   * The lens body: its offset and lift, and its `::before`, the lifted lens's
   * shadow (outside the clip).
   */
  readonly body: (element: HTMLElement | null) => void;
  /** The lens's clip: its `::before` is the lifted lens's glass. */
  readonly clip: (element: HTMLElement | null) => void;
  /** The selected copy of the items. */
  readonly copy: (element: HTMLElement | null) => void;
  /** One copied item, by index: the magnification. */
  readonly copyItem: (index: number) => (element: HTMLElement | null) => void;
  /**
   * The copy is drawn: the lens is lifted, or moving under a finger. At rest
   * the selected tab draws its own look and the copy is not mounted.
   */
  readonly isCopyShown: boolean;
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
  isMinimized,
  onLift,
  isDisabled,
}: UseTabBarLensOptions): TabBarLensRefs {
  // The table's springs become motion roles (a theme may retune them)
  // before this hook's first animation.
  if (isTouch) {
    registerTabBarTable();
  }
  const capsule = useAnimator();
  const body = useAnimator();
  // The lifted look, the body's and the clip's `::before`, starts hidden (an
  // animator's values start at identity).
  const shadow = useAnimator({
    pseudoElement: '::before',
    initial: {opacity: 0},
  });
  const glass = useAnimator({pseudoElement: '::before', initial: {opacity: 0}});
  const bodyRef = useCallback(
    (element: HTMLElement | null) => {
      body.ref(element);
      shadow.ref(element);
    },
    [body, shadow],
  );
  const copy = useAnimator();
  const copyItems = useAnimatorList(count);

  const pressRef = useRef<Press | null>(null);
  // The settle a lift started toward a newly chosen item, until the new
  // selection renders (or the app keeps the old one).
  const settleRef = useRef<number | null>(null);
  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;
  const onLiftRef = useRef(onLift);
  const isDisabledRef = useRef(isDisabled);
  isDisabledRef.current = isDisabled;
  onLiftRef.current = onLift;

  // The copy is drawn from a finger landing, or a slide starting, until
  // everything the lens moves rests. A new selection under a finger is
  // seen during render, so the frame that starts the slide already draws it.
  const [isCopyShown, setIsCopyShown] = useState(false);
  const [seenIndex, setSeenIndex] = useState(selectedIndex);
  if (seenIndex !== selectedIndex) {
    setSeenIndex(selectedIndex);
    if (
      isTouch &&
      seenIndex >= 0 &&
      seenIndex < count &&
      selectedIndex >= 0 &&
      body.animator.reducedMotion({}) === 'off'
    ) {
      setIsCopyShown(true);
    }
  }
  const motionRef = useRef(0);
  /** Drops the copy once this motion, or a later one, rests, with no finger down. */
  const dropCopyAtRest = () => {
    const motion = ++motionRef.current;
    void Promise.all([
      body.animator.atRest(),
      glass.animator.atRest(),
      shadow.animator.atRest(),
      ...copyItems.animators.slice(0, count).map(item => item.atRest()),
    ]).then(() => {
      if (motionRef.current === motion && pressRef.current == null) {
        setIsCopyShown(false);
      }
    });
  };

  /**
   * Plays the selected copy's counter-transform from `at`, derived from the
   * body's curves as they now stand. Called after every change to the body;
   * `fromRest` when the body's call started from rest, so the copy joins its
   * start at the browser's commit.
   */
  const playCopy = (at: number, fromRest = false, horizon = COPY_HORIZON_S) => {
    const sample = (t: number) => {
      const time = at + t * 1000;
      return copyTransform(
        body.animator.get('x', time),
        body.animator.get('scaleX', time),
        body.animator.get('scaleY', time),
      );
    };
    const curve = (key: 'x' | 'scaleX' | 'scaleY'): MotionCurve => ({
      duration: horizon,
      at: t => sample(t)[key],
      velocity: t =>
        (sample(t + VELOCITY_STEP_S)[key] -
          sample(Math.max(0, t - VELOCITY_STEP_S))[key]) /
        (t >= VELOCITY_STEP_S ? 2 * VELOCITY_STEP_S : VELOCITY_STEP_S),
    });
    copy.animator.play(
      {x: curve('x'), scaleX: curve('scaleX'), scaleY: curve('scaleY')},
      fromRest ? {} : {at},
    );
  };

  /**
   * Lifts (true) or lowers (false) a lens `size` px wide and flexes the
   * capsule. Under Reduce Motion a press scales nothing
   * (design:reduced-motion): the glass and its shadow only fade.
   */
  const lift = (
    isLifted: boolean,
    at: number,
    size: number,
    touchRelease = false,
  ) => {
    const options = {at, touchRelease};
    const spring = {spring: tabBar.lift};
    shadow.animator.animate({opacity: isLifted ? 1 : 0}, spring, options);
    glass.animator.animate({opacity: isLifted ? 1 : 0}, spring, options);
    if (body.animator.reducedMotion({touchRelease}) !== 'off') {
      return;
    }
    const lifted = liftScale(size);
    body.animator.animate(
      isLifted ? {scaleX: lifted.x, scaleY: lifted.y} : {scaleX: 1, scaleY: 1},
      spring,
      options,
    );
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

  /**
   * Where the lens heads for a finger at `x`: after the finger, rubber-banded
   * past the ends, but held on the nearest enabled tab while the finger is
   * over a disabled one, which shows no drag affordance (AST-085 FR6).
   */
  const chaseTarget = (x: number, centers: number[]) => {
    const isDisabledAt = isDisabledRef.current;
    if (isDisabledAt?.(nearestIndex(x, centers)) !== true) {
      return lensTarget(x, centers);
    }
    let nearest = -1;
    centers.forEach((center, index) => {
      if (
        isDisabledAt(index) !== true &&
        (nearest < 0 || Math.abs(center - x) < Math.abs(centers[nearest] - x))
      ) {
        nearest = index;
      }
    });
    return nearest < 0
      ? centers[Math.max(selectedRef.current, 0)]
      : centers[nearest];
  };

  const begin = (recognizer: LongPressGestureRecognizer) => {
    const element = capsuleRef.current;
    const selected = selectedRef.current;
    const root = element?.parentElement;
    if (element == null || root == null) {
      return;
    }
    // Read before anything moves: the capsule's layout box (its flex is a
    // transform, which layout ignores) placed by its unscaled parent.
    const rootBox = root.getBoundingClientRect();
    const left = rootBox.left + element.offsetLeft;
    const isRtl = isRtlElement(element);
    const centers = itemCenters(element.offsetWidth, count, isRtl);
    const size = itemWidth(element.offsetWidth, count);
    const x = recognizer.location().x - left;
    // A finger landing on a disabled tab: UIKit ignores the tap, so the lens
    // neither heads for it nor lifts unless the finger then drags.
    const isIgnored =
      isDisabledRef.current?.(nearestIndex(x, centers)) === true;
    pressRef.current = {
      centers,
      size,
      left,
      startX: x,
      lastX: x,
      isDragging: false,
      hasLens: selected >= 0,
      isIgnored,
    };
    // No tab selected (there is no lens to move: the lift chooses the tab
    // nearest the finger), or a finger landing on a disabled tab (UIKit
    // ignores the tap): nothing moves now.
    if (selected < 0 || isIgnored) {
      return;
    }
    // The lifted lens magnifies the selected look: its copy mounts now, in
    // this event (its animators attach to it with their curves running).
    // Under Reduce Motion nothing lifts or travels, so no copy mounts.
    motionRef.current += 1;
    if (body.animator.reducedMotion({}) === 'off') {
      flushSync(() => setIsCopyShown(true));
    }
    const at = performance.now();
    body.animator.animate(
      {x: chaseTarget(x, centers) - centers[selected]},
      {spring: tabBar.lensTravel},
      {at},
    );
    lift(true, at, size);
    playCopy(at);
  };

  const move = (recognizer: LongPressGestureRecognizer) => {
    const press = pressRef.current;
    const selected = selectedRef.current;
    if (press == null) {
      return;
    }
    const x = recognizer.location().x - press.left;
    press.lastX = x;
    press.isDragging ||= Math.abs(x - press.startX) > DRAG_SLOP;
    const at = performance.now();
    if (press.isIgnored) {
      if (!press.isDragging) {
        return;
      }
      // A drag from a disabled tab: the press counts from here (the lens,
      // when there is one, lifts, its copy drawn, and chases).
      press.isIgnored = false;
      if (press.hasLens && selected >= 0) {
        motionRef.current += 1;
        if (body.animator.reducedMotion({}) === 'off') {
          flushSync(() => setIsCopyShown(true));
        }
        lift(true, at, press.size);
      }
    }
    if (!press.hasLens || selected < 0) {
      return;
    }
    body.animator.animate(
      {x: chaseTarget(x, press.centers) - press.centers[selected]},
      {spring: press.isDragging ? tabBar.lensTrack : tabBar.lensTravel},
      {at},
    );
    playCopy(at);
  };

  const end = (isCancelled: boolean) => {
    const press = pressRef.current;
    pressRef.current = null;
    const selected = selectedRef.current;
    // A tap on a disabled tab moved nothing and chooses nothing.
    if (press == null || press.isIgnored) {
      return;
    }
    // The app's answer to this lift, as rendered now: the tab the finger
    // chose is the one under it at the lift, whatever renders after.
    const deliver = onLiftRef.current;
    const nearest = nearestIndex(press.lastX, press.centers);
    // A disabled tab is never chosen: over one, the lift chooses nothing and
    // the lens settles straight back.
    const isChoosable =
      !isCancelled && isDisabledRef.current?.(nearest) !== true;
    if (!press.hasLens || selected < 0) {
      // No lens moved: the nearest tab is chosen at once.
      if (isChoosable) {
        flushSync(() => deliver(nearest));
      }
      return;
    }
    const chosen = isChoosable ? nearest : selected;
    const at = performance.now();
    body.animator.animate(
      {x: press.centers[chosen] - press.centers[selected]},
      {spring: tabBar.lensSettle},
      {at, touchRelease: true},
    );
    lift(false, at, press.size, true);
    playCopy(at);
    dropCopyAtRest();
    if (!isChoosable) {
      return;
    }
    if (chosen !== selected) {
      settleRef.current = chosen;
    }
    // The lift reports its choice from this handler, the settle already
    // started (INV2): its first frame waits for the browser's commit, so the
    // app rendering the chosen tab delays it rather than freezing it midway.
    // Rendered at once, so the selection reads the app's answer right after.
    flushSync(() => deliver(chosen));
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
        {at: now, touchRelease: true},
      );
      playCopy(now);
      dropCopyAtRest();
    }
  };

  useGestureRecognizer(
    capsuleRef,
    () =>
      new LongPressGestureRecognizer({
        name: 'tab-bar-selection',
        minimumPressDuration: 0,
        allowedPointerTypes: ['touch', 'pen'],
        // Only the capsule's own box: the search tab beside it is a button.
        shouldReceiveTouch: (_recognizer, touch) => {
          const box = capsuleRef.current?.getBoundingClientRect();
          return box != null && touch.x >= box.left && touch.x <= box.right;
        },
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
    {
      isEnabled: isTouch && !isMinimized,
      // Under a mouse the host writes no touch styles: desktop selection
      // is unchanged.
      manageStyle: isTouch,
    },
  );

  // The recognizer turned off (another input took over, or the bar
  // minimized): a press it was tracking ends here, as a cancel, since a
  // recognizer turned off reports nothing more. A cancel chooses nothing,
  // so the app hears nothing.
  const endRef = useRef(end);
  endRef.current = end;
  useEffect(() => {
    if ((!isTouch || isMinimized) && pressRef.current != null) {
      endRef.current(true);
    }
  }, [isTouch, isMinimized]);
  /** The body's offset and scale that put the lens in the minimized circle. */
  const collapsed = (element: HTMLElement, selected: number) => {
    const width = element.offsetWidth;
    const isRtl = isRtlElement(element);
    return {
      x:
        minimizedCenter(width, isRtl) -
        itemCenters(width, count, isRtl)[selected],
      scaleX: tabBar.minimizedSize / itemWidth(width, count),
      scaleY: tabBar.minimizedSize / tabBar.itemHeight,
    };
  };

  // Minimizing carries the lens into the circle; expanding brings it back.
  const wasMinimizedRef = useRef(isMinimized);
  useLayoutEffect(() => {
    const was = wasMinimizedRef.current;
    wasMinimizedRef.current = isMinimized;
    const element = capsuleRef.current;
    const selected = selectedRef.current;
    if (was === isMinimized || element == null || selected < 0) {
      return;
    }
    const target = isMinimized
      ? collapsed(element, selected)
      : {x: 0, scaleX: 1, scaleY: 1};
    const now = performance.now();
    // From rest every curve starts when the browser commits the frame, so a
    // busy main thread delays the motion instead of skipping into it; motion
    // already on screen continues from now.
    const isMoving =
      body.animator.getVelocity('x', now) !== 0 ||
      body.animator.getVelocity('scaleX', now) !== 0;
    const options = isMoving ? {at: now} : {};
    // Under a finger: the bar collapses for the minimize and the search tab.
    body.animator.animate(
      {x: target.x},
      {spring: tabBar.collapseTravel},
      options,
    );
    body.animator.animate(
      {
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        opacity: isMinimized ? 0 : 1,
      },
      {spring: tabBar.collapseSize},
      options,
    );
    copy.animator.animate(
      {opacity: isMinimized ? 0 : 1},
      {spring: tabBar.minimizeFade},
      options,
    );
    playCopy(now, !isMoving, isMinimized ? COPY_FADE_S : COPY_HORIZON_S);
  }, [isMinimized, isTouch, capsuleRef, body, copy]);

  // Minimized, the bar's width can still change (a rotation, a split view):
  // the lens stays in the circle.
  useEffect(() => {
    const element = capsuleRef.current;
    if (
      !isMinimized ||
      element == null ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }
    let width = element.offsetWidth;
    const observer = new ResizeObserver(() => {
      const next = element.offsetWidth;
      const selected = selectedRef.current;
      if (next === width || selected < 0) {
        return;
      }
      width = next;
      const isRtl = isRtlElement(element);
      body.animator.set({
        x:
          minimizedCenter(next, isRtl) -
          itemCenters(next, count, isRtl)[selected],
        scaleX: tabBar.minimizedSize / itemWidth(next, count),
        scaleY: tabBar.minimizedSize / tabBar.itemHeight,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isMinimized, capsuleRef, body, count]);

  // A new selection: the resting place jumped to the new item (CSS, this
  // frame); the body starts where the lens was on screen. After a lift it
  // continues the settle the lift started; otherwise it slides from rest.
  // Under a finger only: under a mouse TabBar's CSS slides the lens.
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
    if (wasMinimizedRef.current) {
      // Minimized: the lens stays in the circle, now measured from the new
      // resting place.
      const target = collapsed(element, selectedIndex);
      body.animator.set(target);
      playCopy(performance.now());
      return;
    }
    const isRtl = isRtlElement(element);
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
            chaseTarget(press.lastX, press.centers) -
            press.centers[selectedIndex],
        },
        {
          spring: press.isDragging ? tabBar.lensTrack : tabBar.lensTravel,
          velocity: {x: velocity},
        },
        {at: now},
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
        {at: now, touchRelease: fromLift},
      );
      playCopy(now);
      dropCopyAtRest();
      return;
    }
    // From rest (a key, the app): both curves start when the browser commits
    // the frame, with the lens's jump to its new place.
    copy.animator.set({x: -offset});
    body.animator.animate({x: 0}, {spring: tabBar.lensTravel});
    copy.animator.animate({x: 0}, {spring: tabBar.lensTravel});
    dropCopyAtRest();
  }, [selectedIndex, count, isTouch, capsuleRef, body, copy]);

  return {
    capsule: capsule.ref,
    body: bodyRef,
    clip: glass.ref,
    copy: copy.ref,
    copyItem: index => copyItems.refs[index],
    isCopyShown,
  };
}
