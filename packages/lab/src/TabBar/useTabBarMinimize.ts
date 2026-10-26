// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarMinimize.ts
 * @input The TabBar's capsule element, whether minimizing applies,
 *   whether it has a search tab and whether that is selected; core's
 *   compositor animator (`@astryxdesign/core/motion`) and the
 *   UIKit tab-bar table
 * @output Exports useTabBarMinimize: whether the bar is minimized (UIKit's
 *   `tabBarMinimizeBehavior = .onScrollDown`) or drawn collapsed, a way to
 *   expand it, and the refs TabBar puts on the platter's pieces, the items'
 *   layer, the badges, the minimized circle's icon, the search tab's glass and the
 *   bottom accessory
 * @position Part of TabBar's touch layer (TabBarTouch.ts)
 *
 * WHEN (uikit/tabBar.ts, measured on iOS 26.2)
 *
 * The bar minimizes once the person has scrolled the page down
 * `minimizeDistance` from where the downward scroll started. Scrolling back
 * up does not expand it; reaching the top does, and so does a tap on the
 * circle (`expand`). Only the person's scrolling counts (a finger's drag and
 * the coast after it), read through the gesture host as a pan on the page
 * that never claims its touch: a script scrolling the page to the top leaves
 * the bar minimized, as on iOS.
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
 * The collapse runs on UIKit's springs, under a finger only: the bar
 * minimizes there and the search tab collapses it there (under a mouse the
 * search tab selects in place).
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
  PanGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures';
import {useFingerScroll} from '@astryxdesign/core/gestures/useFingerScroll';
import {registerTabBarTable, tabBar} from '@astryxdesign/core/motion/uikit';
import {useAnimator} from '@astryxdesign/core/motion/useAnimator';
import {isRtlElement} from '../utils/isRtlElement';
import {accessoryBox} from './tabBarModel';

export interface UseTabBarMinimizeOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
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
  /** The items' layer (every tab button): fades as one. */
  readonly items: (element: HTMLElement | null) => void;
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

/** No scroller to watch: the server, or minimizing is off. */
const NO_SCROLLER = {current: null};

/**
 * Follows the person's scrolling of the page: minimizes after
 * `minimizeDistance` down, expands at the top. The person's scrolling starts
 * as a vertical pan on the page that never claims its touch (`claimsTouches:
 * false`): the gesture host gives it only passive listeners, so the page
 * scrolls exactly as it would without it. From the pan's start until the
 * person's scroll ends (the gesture host's finger-scroll reader, which counts
 * the coast after the lift as theirs), and only then, a passive scroll
 * listener follows the offset.
 */
function useScrollMinimize(isEnabled: boolean) {
  const [isMinimized, setIsMinimized] = useState(false);
  // Whose scroll the page's is, from the gesture host: watched only while
  // minimizing is on.
  const isFingerScroll = useFingerScroll(
    isEnabled && typeof document !== 'undefined' ? document : NO_SCROLLER,
  );
  const watchRef = useRef<{lift: () => void; stop: () => void} | null>(null);
  // The downward run, across the person's scrolls: where it started and
  // where the page was last seen.
  const runRef = useRef<ScrollRun>({lastY: Number.NaN, downFrom: null});
  const [rootRef] = useState(() => ({
    current: typeof document === 'undefined' ? null : document.documentElement,
  }));
  useGestureRecognizer(
    rootRef,
    () =>
      new PanGestureRecognizer({
        name: 'tab-bar-page-scroll',
        direction: 'vertical',
        claimsTouches: false,
        allowedPointerTypes: ['touch'],
      }),
    pan => {
      if (pan.state === 'began') {
        watchRef.current?.stop();
        watchRef.current = watchScroll(
          runRef.current,
          // The finger's travel since it landed (up scrolls the page down).
          -pan.totalTranslation().y,
          setIsMinimized,
          isFingerScroll,
          () => {
            watchRef.current = null;
          },
        );
      } else if (pan.state === 'ended' || pan.state === 'cancelled') {
        watchRef.current?.lift();
      }
    },
    {isEnabled},
  );
  // Minimizing turned off: the bar is expanded again, read during render
  // (architecture:react-component-runtime INV1/INV3), so a later turn on
  // starts expanded.
  const [wasEnabled, setWasEnabled] = useState(isEnabled);
  if (wasEnabled !== isEnabled) {
    setWasEnabled(isEnabled);
    if (!isEnabled) {
      setIsMinimized(false);
    }
  }
  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    // The run starts where the page is when the watching starts.
    runRef.current = {lastY: window.scrollY, downFrom: null};
    return () => watchRef.current?.stop();
  }, [isEnabled]);
  const expand = useCallback(() => setIsMinimized(false), []);
  return {isMinimized: isEnabled && isMinimized, expand};
}

interface ScrollRun {
  lastY: number;
  /** Where the current downward run started. */
  downFrom: number | null;
}

/**
 * Follows one scroll of the page by the person, from the finger's pan to the
 * page's rest: `lift` when the finger lifts; the listeners go at the
 * `scrollend` that follows, or at once if the person's scroll has already
 * ended (`isFingerScroll`, the gesture host's reader).
 */
function watchScroll(
  run: ScrollRun,
  fingerTravel: number,
  setIsMinimized: (isMinimized: boolean) => void,
  isFingerScroll: () => boolean,
  onStop: () => void,
) {
  const moved = window.scrollY - run.lastY;
  // Since the person last scrolled, the page moved on its own (a script, the
  // keys), unless this finger's travel since it landed covers the move: the
  // browser may start scrolling before the pan begins. On its own, the
  // downward run starts over.
  const isThisFinger =
    Math.sign(moved) === Math.sign(fingerTravel) &&
    Math.abs(moved) <= Math.abs(fingerTravel);
  if (!Number.isFinite(moved) || (moved !== 0 && !isThisFinger)) {
    run.lastY = window.scrollY;
    run.downFrom = null;
  }
  let isLifted = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > run.lastY) {
      run.downFrom ??= run.lastY;
      if (y - run.downFrom >= tabBar.minimizeDistance) {
        setIsMinimized(true);
      }
    } else if (y < run.lastY) {
      run.downFrom = null;
      if (y <= 0) {
        setIsMinimized(false);
      }
    }
    run.lastY = y;
  };
  const onScrollEnd = () => {
    if (isLifted) {
      finish();
    }
  };
  const stop = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('scrollend', onScrollEnd);
    onStop();
  };
  // Where the page is when the person's scroll ends is theirs: the browser
  // sends at most one scroll event a frame, so the last moves may not have
  // arrived yet.
  const finish = () => {
    onScroll();
    stop();
  };
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('scrollend', onScrollEnd, {passive: true});
  return {
    lift: () => {
      isLifted = true;
      if (!isFingerScroll()) {
        finish();
      }
    },
    stop,
  };
}

export function useTabBarMinimize({
  capsuleRef,
  hasSearch,
  isSearching,
  isEnabled,
}: UseTabBarMinimizeOptions): TabBarMinimize {
  // The table's springs become motion roles (a theme may retune them)
  // before this hook's first animation.
  if (isEnabled || isSearching) {
    registerTabBarTable();
  }
  const {isMinimized, expand} = useScrollMinimize(isEnabled);
  const isCollapsed = isMinimized || isSearching;
  const platter = useAnimator();
  const platterMiddle = useAnimator();
  const platterEnd = useAnimator();
  const badges = useAnimator();
  const circleIcon = useAnimator({initial: {opacity: 0}});
  const items = useAnimator();
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
    const isRtl = isRtlElement(element);
    // The trailing cap's travel onto the leading one.
    const travel = element.offsetWidth - tabBar.barHeight;
    // From rest every curve starts when the browser commits the frame, with
    // the lens's (useTabBarLens.ts), so a busy main thread delays the morph
    // instead of skipping into it; a morph already on screen continues.
    const now = performance.now();
    const options =
      platterMiddle.animator.getVelocity('scaleX', now) !== 0 ? {at: now} : {};
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
    // The tabs fade as one layer: one animation, not one per tab.
    items.animator.animate({opacity: isCollapsed ? 0 : 1}, fade, options);
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

  // Minimized, the bar's width can still change (a rotation, a split view):
  // the trailing cap stays closed on the circle.
  useEffect(() => {
    const element = capsuleRef.current;
    if (
      !isCollapsed ||
      element == null ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }
    let width = element.offsetWidth;
    const observer = new ResizeObserver(() => {
      const next = element.offsetWidth;
      if (next === width) {
        return;
      }
      width = next;
      const travel = next - tabBar.barHeight;
      const isRtl = isRtlElement(element);
      platterEnd.animator.set({x: isRtl ? travel : -travel});
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isCollapsed, capsuleRef, platterEnd]);
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
    );
  }, [isSearching, capsuleRef, accessory]);

  return {
    isMinimized,
    isCollapsed,
    expand,
    platter: platter.ref,
    platterMiddle: platterMiddle.ref,
    platterEnd: platterEnd.ref,
    items: items.ref,
    badges: badges.ref,
    circleIcon: circleIcon.ref,
    accessory: accessory.ref,
    accessoryMiddle: accessoryMiddle.ref,
    accessoryEnd: accessoryEnd.ref,
    searchGlass: searchGlass.ref,
  };
}
