// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarSearch.ts
 * @input The TabBar's capsule element, whether its search tab is selected
 *   and whether its field is active; core's compositor animator
 *   (`@astryxdesign/core/motion/experimental`), the UIKit tab-bar table and
 *   tabBarModel.ts
 * @output Exports useTabBarSearch: the search tab's motion (UIKit's
 *   `UISearchTab`) and the refs TabBar puts on the search circle and the
 *   search field's glass, plus TabBarSearchContext, which hands the field's
 *   host element to the field inside it
 * @position Internal to the lab TabBar (TabBar.tsx)
 *
 * WHAT MOVES (uikit/tabBar.ts, measured on iOS 26.2)
 *
 * Selecting the search tab collapses the bar to its leading circle (that is
 * useTabBarMinimize.ts's morph) and shows the search field inline in the
 * bar's row (`searchFieldGap` after the circle); the search circle fades.
 * The field is always mounted, so a tap can focus it at once. Active, the
 * field's glass moves and widens to span the screen but for the cancel
 * button (`searchActive`, `searchMorph`, squashing as it starts:
 * `searchSquashVelocity`), its box changed in CSS and its start carried
 * over; how high it sits is the keyboard's (the field inside rides it on
 * the host this context hands it). Deactivating plays it back; leaving the
 * search tab fades the field out and the circle back in.
 *
 * SYNC: When modified, update TabBar.tsx, tabBarModel.ts and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {createContext, useLayoutEffect, useRef, type RefObject} from 'react';
import {uikit, useAnimator} from '@astryxdesign/core/motion/experimental';
import {searchFieldBox} from './tabBarModel';

const {tabBar} = uikit;

const MOTION = {reducedMotion: tabBar.reducedMotion};

/**
 * What a TabBar's search tab gives the field inside it: the element that
 * holds the field (the field moves it with the keyboard), where it is, and
 * whether it is active.
 */
export interface TabBarSearchContextValue {
  readonly host: RefObject<HTMLElement | null>;
  readonly placement: 'tab';
  readonly isActive: boolean;
}

export const TabBarSearchContext =
  createContext<TabBarSearchContextValue | null>(null);

export interface UseTabBarSearchOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
  /** The search tab is selected. */
  readonly isSearching: boolean;
  /** The search field is active (above the keyboard). */
  readonly isActive: boolean;
}

export interface TabBarSearch {
  /** The search circle: fades while the search tab is selected. */
  readonly circle: (element: HTMLElement | null) => void;
  /** The field's glass and content: fades in, moves between its places. */
  readonly field: (element: HTMLElement | null) => void;
  /** The field glass's middle: its width. */
  readonly fieldMiddle: (element: HTMLElement | null) => void;
  /** The field glass's trailing cap: its width. */
  readonly fieldEnd: (element: HTMLElement | null) => void;
}

export function useTabBarSearch({
  capsuleRef,
  isSearching,
  isActive,
}: UseTabBarSearchOptions): TabBarSearch {
  const circle = useAnimator();
  const field = useAnimator({initial: {opacity: 0}});
  const fieldMiddle = useAnimator();
  const fieldEnd = useAnimator();

  // Selecting the search tab (or leaving it): the field and the circle trade
  // places.
  const wasSearchingRef = useRef(isSearching);
  useLayoutEffect(() => {
    const was = wasSearchingRef.current;
    wasSearchingRef.current = isSearching;
    if (was === isSearching) {
      return;
    }
    const fade = {spring: tabBar.minimizeFade};
    circle.animator.animate({opacity: isSearching ? 0 : 1}, fade, MOTION);
    // Leaving, the field stays visible while it settles back into the bar.
    field.animator.animate(
      {opacity: isSearching ? 1 : 0},
      isSearching ? fade : {spring: tabBar.collapseSize},
      MOTION,
    );
  }, [isSearching, circle, field]);

  // Activating (or not): the field's box changed in CSS this frame; its
  // glass starts where it was and springs to rest, squashing as it starts.
  const wasActiveRef = useRef(isActive);
  useLayoutEffect(() => {
    const was = wasActiveRef.current;
    wasActiveRef.current = isActive;
    const element = capsuleRef.current;
    if (was === isActive || element == null) {
      return;
    }
    const bar = element.parentElement ?? element;
    const isRtl = getComputedStyle(element).direction === 'rtl';
    const sign = isRtl ? -1 : 1;
    const from = searchFieldBox(bar.offsetWidth, was);
    const to = searchFieldBox(bar.offsetWidth, isActive);
    const now = performance.now();
    const cap = tabBar.accessoryHeight;
    field.animator.set({
      x: field.animator.get('x', now) + sign * (from.start - to.start),
    });
    fieldEnd.animator.set({
      x: fieldEnd.animator.get('x', now) + sign * (from.width - to.width),
    });
    fieldMiddle.animator.set({
      scaleX:
        (fieldMiddle.animator.get('scaleX', now) * (from.width - cap)) /
        (to.width - cap),
    });
    const morph = {spring: tabBar.searchMorph};
    field.animator.animate({x: 0}, morph, MOTION);
    // The width's squash: its trailing cap and middle start moving inward.
    const squash = isActive ? tabBar.searchSquashVelocity : 0;
    fieldEnd.animator.animate(
      {x: 0},
      {...morph, velocity: {x: sign * squash}},
      MOTION,
    );
    fieldMiddle.animator.animate(
      {scaleX: 1},
      {...morph, velocity: {scaleX: squash / (to.width - cap)}},
      MOTION,
    );
  }, [isActive, capsuleRef, field, fieldEnd, fieldMiddle]);

  return {
    circle: circle.ref,
    field: field.ref,
    fieldMiddle: fieldMiddle.ref,
    fieldEnd: fieldEnd.ref,
  };
}
