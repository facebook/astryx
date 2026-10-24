// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarMinimize.ts
 * @input The TabBar's capsule element, its item count, whether minimizing
 *   applies; core's compositor animator
 *   (`@astryxdesign/core/motion/experimental`) and the UIKit tab-bar table
 * @output Exports useTabBarMinimize: whether the bar is minimized (UIKit's
 *   `tabBarMinimizeBehavior = .onScrollDown`), a way to expand it, and the
 *   refs TabBar puts on the platter's pieces, the items, the badges and the
 *   minimized circle's icon
 * @position Internal to the lab TabBar (TabBar.tsx)
 *
 * WHEN (uikit/tabBar.ts, measured on iOS 26.2)
 *
 * The bar minimizes once the person has scrolled the page down
 * `minimizeDistance` from where the downward scroll started. Scrolling back
 * up does not expand it; reaching the top does, and so does a tap on the
 * circle (`expand`). Only the person's scrolling counts (a finger's drag and
 * the coast after it): a script scrolling the page to the top leaves the bar
 * minimized, as on iOS.
 *
 * HOW IT MORPHS
 *
 * The capsule's glass is drawn in three pieces: a leading cap, a middle and a
 * trailing cap. Collapsing, the middle narrows to nothing from its leading
 * side while the trailing cap slides onto the leading one, so the outline
 * stays a capsule all the way to a circle, and the whole platter shrinks to
 * `minimizedSize` about the leading cap's centre (`collapseSize`). The items
 * and their badges fade out (`minimizeFade`) and the selected icon fades in
 * at the circle's centre; useTabBarLens.ts carries the lens into the circle.
 * Expanding plays the same motion back. Every animation runs on the
 * compositor, transforms and opacity only.
 *
 * SYNC: When modified, update TabBar.tsx, useTabBarLens.ts and
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
import {
  createAnimator,
  uikit,
  useAnimator,
  type Animator,
} from '@astryxdesign/core/motion/experimental';

const {tabBar} = uikit;

const MOTION = {reducedMotion: tabBar.reducedMotion};

/**
 * A scroll event this soon after the previous one of a finger's scroll still
 * belongs to it (the coast after the finger lifts).
 */
const USER_SCROLL_GAP_MS = 150;

export interface UseTabBarMinimizeOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
  readonly count: number;
  /** `minimizeBehavior="onScrollDown"` under a finger. */
  readonly isEnabled: boolean;
}

export interface TabBarMinimize {
  readonly isMinimized: boolean;
  /** Expands a minimized bar (a tap on the circle, focus on a tab). */
  readonly expand: () => void;
  /** The platter: shrinks to the circle about the leading cap's centre. */
  readonly platter: (element: HTMLElement | null) => void;
  /** The platter's middle: narrows to nothing. */
  readonly platterMiddle: (element: HTMLElement | null) => void;
  /** The platter's trailing cap: slides onto the leading one. */
  readonly platterEnd: (element: HTMLElement | null) => void;
  /** One item button, by index: fades. */
  readonly item: (index: number) => (element: HTMLElement | null) => void;
  /** The badges: fade with the items. */
  readonly badges: (element: HTMLElement | null) => void;
  /** The minimized circle's icon: fades in. */
  readonly circleIcon: (element: HTMLElement | null) => void;
}

/** One animator per item, stable across renders. */
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

/**
 * Follows the person's scrolling of the page: minimizes after
 * `minimizeDistance` down, expands at the top.
 */
function useScrollMinimize(isEnabled: boolean) {
  const [isMinimized, setIsMinimized] = useState(false);
  useEffect(() => {
    if (!isEnabled) {
      setIsMinimized(false);
      return;
    }
    let lastY = window.scrollY;
    // Where the current downward scroll started.
    let downFrom: number | null = null;
    let isTouching = false;
    let hasMoved = false;
    let lastUserScroll = -Infinity;
    const onTouchStart = () => {
      isTouching = true;
      hasMoved = false;
    };
    const onTouchMove = () => {
      hasMoved ||= isTouching;
    };
    const onTouchEnd = () => {
      if (hasMoved) {
        // The coast that follows belongs to this scroll.
        lastUserScroll = performance.now();
      }
      isTouching = false;
      hasMoved = false;
    };
    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const isUser = hasMoved || now - lastUserScroll < USER_SCROLL_GAP_MS;
      if (!isUser) {
        downFrom = null;
        lastY = y;
        return;
      }
      lastUserScroll = now;
      if (y > lastY) {
        downFrom ??= lastY;
        if (y - downFrom >= tabBar.minimizeDistance) {
          setIsMinimized(true);
        }
      } else if (y < lastY) {
        downFrom = null;
        if (y <= 0) {
          setIsMinimized(false);
        }
      }
      lastY = y;
    };
    const passive = {passive: true} as const;
    window.addEventListener('touchstart', onTouchStart, passive);
    window.addEventListener('touchmove', onTouchMove, passive);
    window.addEventListener('touchend', onTouchEnd, passive);
    window.addEventListener('touchcancel', onTouchEnd, passive);
    window.addEventListener('scroll', onScroll, passive);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isEnabled]);
  const expand = useCallback(() => setIsMinimized(false), []);
  return {isMinimized: isEnabled && isMinimized, expand};
}

export function useTabBarMinimize({
  capsuleRef,
  count,
  isEnabled,
}: UseTabBarMinimizeOptions): TabBarMinimize {
  const {isMinimized, expand} = useScrollMinimize(isEnabled);
  const platter = useAnimator();
  const platterMiddle = useAnimator();
  const platterEnd = useAnimator();
  const badges = useAnimator();
  const circleIcon = useAnimator({initial: {opacity: 0}});
  const items = useAnimatorList(count);

  const previousRef = useRef(isMinimized);
  useLayoutEffect(() => {
    const was = previousRef.current;
    previousRef.current = isMinimized;
    const element = capsuleRef.current;
    if (was === isMinimized || element == null) {
      return;
    }
    const isRtl = getComputedStyle(element).direction === 'rtl';
    // The trailing cap's travel onto the leading one.
    const travel = element.offsetWidth - tabBar.barHeight;
    // From rest every curve starts when the browser commits the frame, with
    // the lens's (useTabBarLens.ts), so a busy main thread delays the morph
    // instead of skipping into it; a morph already on screen continues.
    const now = performance.now();
    const options =
      platterMiddle.animator.getVelocity('scaleX', now) !== 0
        ? {at: now, ...MOTION}
        : MOTION;
    const size = {spring: tabBar.collapseSize};
    const fade = {spring: tabBar.minimizeFade};
    platterMiddle.animator.animate(
      {scaleX: isMinimized ? 0 : 1},
      size,
      options,
    );
    platterEnd.animator.animate(
      {x: isMinimized ? (isRtl ? travel : -travel) : 0},
      size,
      options,
    );
    platter.animator.animate(
      {scale: isMinimized ? tabBar.minimizedSize / tabBar.barHeight : 1},
      size,
      options,
    );
    for (const item of items.animators.slice(0, count)) {
      item.animate({opacity: isMinimized ? 0 : 1}, fade, options);
    }
    badges.animator.animate({opacity: isMinimized ? 0 : 1}, fade, options);
    circleIcon.animator.animate(
      {opacity: isMinimized ? 1 : 0},
      isMinimized ? size : fade,
      options,
    );
  }, [
    isMinimized,
    count,
    capsuleRef,
    platter,
    platterMiddle,
    platterEnd,
    badges,
    circleIcon,
    items,
  ]);

  return {
    isMinimized,
    expand,
    platter: platter.ref,
    platterMiddle: platterMiddle.ref,
    platterEnd: platterEnd.ref,
    item: index => items.refs[index],
    badges: badges.ref,
    circleIcon: circleIcon.ref,
  };
}
