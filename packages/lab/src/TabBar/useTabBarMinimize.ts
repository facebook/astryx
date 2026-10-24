// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarMinimize.ts
 * @input The TabBar's capsule element, its item count, whether minimizing
 *   applies, whether it has a search tab and whether that is selected; core's
 *   compositor animator (`@astryxdesign/core/motion/experimental`) and the
 *   UIKit tab-bar table
 * @output Exports useTabBarMinimize: whether the bar is minimized (UIKit's
 *   `tabBarMinimizeBehavior = .onScrollDown`) or drawn collapsed, a way to
 *   expand it, and the refs TabBar puts on the platter's pieces, the items,
 *   the badges, the minimized circle's icon, the search tab's glass and the
 *   bottom accessory
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
 * A search tab's circle shrinks to `minimizedSize` about its centre, its
 * glyph unchanged. The bottom accessory moves down inline beside the circle
 * (`accessoryCollapse`), ending before the search tab when there is one: its
 * box changes in CSS and it starts where it was, its glass drawn in the same
 * three pieces so its width changes with transforms too, its content laid
 * out at once for its new place. Expanding plays the same motion back
 * (`accessoryExpand` for the accessory). Choosing the search tab collapses
 * the bar the same way (useTabBarSearch.ts shows its field) and the
 * accessory steps aside. Every animation runs on the compositor, transforms
 * and opacity only.
 *
 * SYNC: When modified, update TabBar.tsx, useTabBarLens.ts,
 * useTabBarSearch.ts and __tests__/TabBar.interaction.browser.spec.ts.
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
import {accessoryBox} from './tabBarModel';

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
  /** A search tab sits at the bar's trailing end. */
  readonly hasSearch: boolean;
  /** The search tab is selected: the bar collapses as it does minimized. */
  readonly isSearching: boolean;
  /** `minimizeBehavior="onScrollDown"` under a finger. */
  readonly isEnabled: boolean;
}

export interface TabBarMinimize {
  /** Minimized by the page's scrolling. */
  readonly isMinimized: boolean;
  /** Drawn collapsed: minimized, or the search tab selected. */
  readonly isCollapsed: boolean;
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
  /** The bottom accessory: moves between its two places. */
  readonly accessory: (element: HTMLElement | null) => void;
  /** The accessory glass's middle: its width. */
  readonly accessoryMiddle: (element: HTMLElement | null) => void;
  /** The accessory glass's trailing cap: its width. */
  readonly accessoryEnd: (element: HTMLElement | null) => void;
  /** The search tab's glass: shrinks to the minimized size about its centre. */
  readonly searchGlass: (element: HTMLElement | null) => void;
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
  hasSearch,
  isSearching,
  isEnabled,
}: UseTabBarMinimizeOptions): TabBarMinimize {
  const {isMinimized, expand} = useScrollMinimize(isEnabled);
  const isCollapsed = isMinimized || isSearching;
  const platter = useAnimator();
  const platterMiddle = useAnimator();
  const platterEnd = useAnimator();
  const badges = useAnimator();
  const circleIcon = useAnimator({initial: {opacity: 0}});
  const items = useAnimatorList(count);
  const accessory = useAnimator();
  const accessoryMiddle = useAnimator();
  const accessoryEnd = useAnimator();
  const searchGlass = useAnimator();

  const previousRef = useRef(isCollapsed);
  useLayoutEffect(() => {
    const was = previousRef.current;
    previousRef.current = isCollapsed;
    const element = capsuleRef.current;
    if (was === isCollapsed || element == null) {
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
      {scaleX: isCollapsed ? 0 : 1},
      size,
      options,
    );
    platterEnd.animator.animate(
      {x: isCollapsed ? (isRtl ? travel : -travel) : 0},
      size,
      options,
    );
    platter.animator.animate(
      {scale: isCollapsed ? tabBar.minimizedSize / tabBar.barHeight : 1},
      size,
      options,
    );
    for (const item of items.animators.slice(0, count)) {
      item.animate({opacity: isCollapsed ? 0 : 1}, fade, options);
    }
    badges.animator.animate({opacity: isCollapsed ? 0 : 1}, fade, options);
    circleIcon.animator.animate(
      {opacity: isCollapsed ? 1 : 0},
      isCollapsed ? size : fade,
      options,
    );
    // The search tab's glass shrinks to the minimized size, its glyph kept.
    searchGlass.animator.animate(
      {scale: isCollapsed ? tabBar.minimizedSize / tabBar.barHeight : 1},
      size,
      options,
    );
    // The accessory's box changed in CSS this frame: it starts where it was
    // on screen (its offset and width carried over) and springs to rest. It
    // spans the whole bar: the capsule and the search tab.
    const width = element.parentElement?.offsetWidth ?? element.offsetWidth;
    const from = accessoryBox(width, was, hasSearch);
    const to = accessoryBox(width, isCollapsed, hasSearch);
    const sign = isRtl ? -1 : 1;
    const cap = tabBar.accessoryHeight;
    const moved = {
      x: accessory.animator.get('x', now) + sign * (from.start - to.start),
      y: accessory.animator.get('y', now) + (from.top - to.top),
    };
    const end =
      accessoryEnd.animator.get('x', now) + sign * (from.width - to.width);
    const middle =
      (accessoryMiddle.animator.get('scaleX', now) * (from.width - cap)) /
      (to.width - cap);
    accessory.animator.set(moved);
    accessoryEnd.animator.set({x: end});
    accessoryMiddle.animator.set({scaleX: middle});
    const move = {
      spring: isCollapsed ? tabBar.accessoryCollapse : tabBar.accessoryExpand,
    };
    accessory.animator.animate({x: 0, y: 0}, move, options);
    accessoryEnd.animator.animate({x: 0}, move, options);
    accessoryMiddle.animator.animate({scaleX: 1}, move, options);
  }, [
    isCollapsed,
    count,
    capsuleRef,
    platter,
    platterMiddle,
    platterEnd,
    badges,
    circleIcon,
    items,
    accessory,
    accessoryMiddle,
    accessoryEnd,
    searchGlass,
    hasSearch,
  ]);

  // While the search tab is selected the accessory steps aside.
  const wasSearchingRef = useRef(isSearching);
  useLayoutEffect(() => {
    if (wasSearchingRef.current === isSearching) {
      return;
    }
    wasSearchingRef.current = isSearching;
    accessory.animator.animate(
      {opacity: isSearching ? 0 : 1},
      {spring: tabBar.minimizeFade},
      MOTION,
    );
  }, [isSearching, accessory]);

  return {
    isMinimized,
    isCollapsed,
    expand,
    platter: platter.ref,
    platterMiddle: platterMiddle.ref,
    platterEnd: platterEnd.ref,
    item: index => items.refs[index],
    badges: badges.ref,
    circleIcon: circleIcon.ref,
    accessory: accessory.ref,
    accessoryMiddle: accessoryMiddle.ref,
    accessoryEnd: accessoryEnd.ref,
    searchGlass: searchGlass.ref,
  };
}
