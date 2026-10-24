// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarSearch.ts
 * @input The TabBar's capsule element and its search field's host, whether
 *   its search tab is selected and whether its field is active, the touch
 *   presentation; core's compositor animator
 *   (`@astryxdesign/core/motion/experimental`), the keyboard layout guide
 *   (`@astryxdesign/core/keyboard/experimental`), the UIKit tab-bar table
 *   and tabBarModel.ts
 * @output Exports useTabBarSearch: the search tab's motion (UIKit's
 *   `UISearchTab`) and the refs TabBar puts on the search circle and its
 *   glyphs, the search field's host and its glass, plus TabBarSearchContext,
 *   which hands the field's host element to the field inside it
 * @position Internal to the lab TabBar (TabBar.tsx)
 *
 * WHAT MOVES (uikit/tabBar.ts, measured on iOS 26.2)
 *
 * Selecting the search tab collapses the bar to its leading circle (that is
 * useTabBarMinimize.ts's morph) and shows the search field inline in the
 * bar's row (`searchFieldGap` after the circle). The field is always
 * mounted, so a tap can focus it at once. Active, the field's glass moves
 * and widens to span the screen but for the cancel button (`searchActive`,
 * `searchMorph`, squashing as it starts: `searchSquashVelocity`), its box
 * changed in CSS and its start carried over, and the field rises to sit
 * `searchKeyboardGap` above the software keyboard, on `searchRise` from
 * when the keyboard starts to move (the keyboard layout guide dates a late
 * report back). The search circle, shrunk to the minimized size, is the
 * field's cancel button: its cancel glyph appears at `searchCancelDelay`
 * and it rides with the field, `searchCancelShift` toward the screen's
 * edge. Cancelling plays it back: the field falls with the keyboard and the
 * circle becomes the bar's search tab again. Leaving the search tab fades
 * the field out.
 *
 * SYNC: When modified, update TabBar.tsx, tabBarModel.ts and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import {useKeyboardLayoutGuide} from '@astryxdesign/core/keyboard/experimental';
import {uikit, useAnimator} from '@astryxdesign/core/motion/experimental';
import {searchCancelShift, searchFieldBox, searchLift} from './tabBarModel';

const {tabBar} = uikit;

const MOTION = {reducedMotion: tabBar.reducedMotion};

/**
 * How long a ride waits for the keyboard's own transition (Mobile Safari
 * reports a show 20–40 ms after the focus) before it starts regardless.
 */
const KEYBOARD_WAIT_MS = 300;

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
  /** The element holding the field, inline in the bar's row. */
  readonly hostRef: RefObject<HTMLElement | null>;
  /** The search tab is selected. */
  readonly isSearching: boolean;
  /** The search field is active (above the keyboard). */
  readonly isActive: boolean;
  /** The touch presentation: a software keyboard comes with focus. */
  readonly isTouch: boolean;
}

export interface TabBarSearch {
  /**
   * The search circle: hidden while the search tab is selected and its
   * field waits inline; the field's cancel button while it is active,
   * riding with it.
   */
  readonly circle: (element: HTMLElement | null) => void;
  /** The circle's search glyph. */
  readonly searchGlyph: (element: HTMLElement | null) => void;
  /** The circle's cancel glyph, while the field is active. */
  readonly cancelGlyph: (element: HTMLElement | null) => void;
  /** The field's host: rides the keyboard. */
  readonly host: (element: HTMLElement | null) => void;
  /** The field's glass and content: fades in, moves between its places. */
  readonly field: (element: HTMLElement | null) => void;
  /** The field glass's middle: its width. */
  readonly fieldMiddle: (element: HTMLElement | null) => void;
  /** The field glass's trailing cap: its width. */
  readonly fieldEnd: (element: HTMLElement | null) => void;
}

export function useTabBarSearch({
  capsuleRef,
  hostRef,
  isSearching,
  isActive,
  isTouch,
}: UseTabBarSearchOptions): TabBarSearch {
  const circle = useAnimator();
  const searchGlyph = useAnimator();
  const cancelGlyph = useAnimator({initial: {opacity: 0}});
  const host = useAnimator();
  const field = useAnimator({initial: {opacity: 0}});
  const fieldMiddle = useAnimator();
  const fieldEnd = useAnimator();

  // The circle shows unless the search tab waits inline (selected, its field
  // not active); active, it is the cancel button, whose glyph appears at
  // UIKit's delay.
  const isCircleShown = !isSearching || isActive;
  const wasShownRef = useRef(isCircleShown);
  const wasSearchingRef = useRef(isSearching);
  useLayoutEffect(() => {
    const wasShown = wasShownRef.current;
    const wasSearching = wasSearchingRef.current;
    wasShownRef.current = isCircleShown;
    wasSearchingRef.current = isSearching;
    const fade = {spring: tabBar.minimizeFade};
    if (wasShown !== isCircleShown) {
      circle.animator.animate(
        {opacity: isCircleShown ? 1 : 0},
        fade,
        isCircleShown && isActive
          ? {at: performance.now() + tabBar.searchCancelDelay * 1000, ...MOTION}
          : MOTION,
      );
    }
    if (wasSearching !== isSearching) {
      // Leaving, the field stays visible while it settles back into the bar.
      field.animator.animate(
        {opacity: isSearching ? 1 : 0},
        isSearching ? fade : {spring: tabBar.collapseSize},
        MOTION,
      );
    }
  }, [isCircleShown, isSearching, isActive, circle, field]);

  // The circle's glyph: the cancel glyph from UIKit's delay while the field
  // is active, the search glyph otherwise.
  const wasCancelRef = useRef(isActive);
  useLayoutEffect(() => {
    if (wasCancelRef.current === isActive) {
      return;
    }
    wasCancelRef.current = isActive;
    const swap = {spring: tabBar.minimizeFade};
    const options = isActive
      ? {at: performance.now() + tabBar.searchCancelDelay * 1000, ...MOTION}
      : MOTION;
    cancelGlyph.animator.animate({opacity: isActive ? 1 : 0}, swap, options);
    searchGlyph.animator.animate({opacity: isActive ? 0 : 1}, swap, options);
  }, [isActive, cancelGlyph, searchGlyph]);

  // The ride: active, the field (and the cancel button with it) rises to sit
  // `searchKeyboardGap` above the keyboard, from when the keyboard starts to
  // move; inactive, both come back down into the bar. One spring for both,
  // so they move as one.
  const activeRef = useRef(isActive);
  const ride = (inset: number, start: number) => {
    const element = hostRef.current;
    const capsule = capsuleRef.current;
    if (element == null || capsule == null) {
      return;
    }
    const now = performance.now();
    const current = host.animator.get('y', now);
    const bottom = element.getBoundingClientRect().bottom - current;
    const lift = activeRef.current
      ? searchLift(window.innerHeight, inset, bottom)
      : 0;
    const isRtl = getComputedStyle(capsule).direction === 'rtl';
    const shift = activeRef.current
      ? (isRtl ? -1 : 1) * searchCancelShift()
      : 0;
    const velocity = host.animator.getVelocity('y', now);
    const spring = {spring: tabBar.searchRise};
    // Motion on screen continues from now; from rest the ride is dated back
    // to the keyboard's start.
    const options =
      velocity !== 0
        ? {at: now, ...MOTION}
        : {at: Math.min(start, now), ...MOTION};
    host.animator.animate(
      {y: lift},
      {...spring, velocity: {y: velocity}},
      options,
    );
    circle.animator.animate(
      {x: shift, y: lift},
      {
        ...spring,
        velocity: {
          x: circle.animator.getVelocity('x', now),
          y: circle.animator.getVelocity('y', now),
        },
      },
      options,
    );
  };
  const rideRef = useRef(ride);
  rideRef.current = ride;
  // A ride waiting for the keyboard: its transition starts the ride, or this
  // timer does when none comes (a hardware keyboard, focus kept elsewhere).
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settlePending = useCallback(() => {
    if (pendingRef.current != null) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
    }
  }, []);
  const guide = useKeyboardLayoutGuide(transition => {
    settlePending();
    rideRef.current(transition.to, transition.start);
  });
  useLayoutEffect(() => {
    if (activeRef.current === isActive) {
      return;
    }
    activeRef.current = isActive;
    settlePending();
    const inset = guide?.inset ?? 0;
    // Under a finger the keyboard rises (or falls) with the change: its own
    // transition starts the ride. Otherwise, or with the keyboard already
    // where it will stay, ride at once.
    const awaitsKeyboard = isTouch && (isActive ? inset === 0 : inset > 0);
    if (!awaitsKeyboard) {
      rideRef.current(inset, performance.now());
      return;
    }
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null;
      rideRef.current(guide?.presentation() ?? 0, performance.now());
    }, KEYBOARD_WAIT_MS);
  }, [isActive, isTouch, guide, settlePending]);
  useEffect(() => settlePending, [settlePending]);

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
    searchGlyph: searchGlyph.ref,
    cancelGlyph: cancelGlyph.ref,
    host: host.ref,
    field: field.ref,
    fieldMiddle: fieldMiddle.ref,
    fieldEnd: fieldEnd.ref,
  };
}
