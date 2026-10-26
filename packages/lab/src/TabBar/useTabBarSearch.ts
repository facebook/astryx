// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarSearch.ts
 * @input The TabBar's capsule element and its search field's host, whether
 *   its search tab is selected and whether its field is active; lab's
 *   keyboard measurement (../keyboard/useKeyboardHeight.ts), core's
 *   compositor animator
 *   (`@astryxdesign/core/motion`), the UIKit tab-bar table and
 *   tabBarModel.ts
 * @output Exports useTabBarSearch: the search tab's motion (UIKit's
 *   `UISearchTab`), the refs TabBar puts on the search circle, its glyphs and
 *   the search field's glass, and the active field's place above the
 *   keyboard (TabBarSearchContext, which hands the field its
 *   host, is tabBarSearchContext.ts)
 * @position Part of TabBar's touch layer (TabBarTouch.ts)
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
 * over. The search circle, shrunk to the minimized size, is the field's
 * cancel button: its cancel glyph appears at `searchCancelDelay`, moved
 * `searchCancelShift` toward the screen's edge. Pressed (core's press
 * tracker, UIControl's highlight, only while it is the cancel button under a
 * finger), it grows to `searchCancelPressedSize` on `searchCancelPress` and,
 * released, shrinks back with UIKit's wobble on `searchCancelReturn`; under
 * Reduce Motion it does not scale. Field and button sit
 * `searchKeyboardGap` above the software keyboard: lab's measurement reports
 * the keyboard's height (AST-099 FR2, and Chrome's own report, FR8) and each
 * report is committed once, as an offset, with no ride (a Lab surface,
 * INV11). Cancelling keeps that place until the keyboard is reported down
 * (FR5). Deactivating plays the morph back; leaving the search tab fades the
 * field out and the circle back in. These moves run on
 * UIKit's springs, under a finger only: under a mouse the search tab selects
 * in place and the field shows at once (TabBar.tsx).
 *
 * SYNC: When modified, update TabBar.tsx, tabBarModel.ts and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {usePressTracker} from '@astryxdesign/core/gestures/usePressTracker';
import {registerTabBarTable, tabBar} from '@astryxdesign/core/motion/uikit';
import {useAnimator} from '@astryxdesign/core/motion/useAnimator';
import {isRtlElement} from '../utils/isRtlElement';
import {useKeyboardHeight} from '../keyboard/useKeyboardHeight';
import {searchCancelShift, searchFieldBox, searchLift} from './tabBarModel';

/** The field and its button in their places in the bar. */
const REST = {lift: 0, shift: 0};

export interface UseTabBarSearchOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
  /**
   * The element holding the field: focus inside it brings up the software
   * keyboard, which the active field sits above.
   */
  readonly hostRef: RefObject<HTMLElement | null>;
  /** The search tab is selected. */
  readonly isSearching: boolean;
  /** The search field is active (above the keyboard). */
  readonly isActive: boolean;
  /**
   * A finger drives the bar: only then does the field move (on UIKit's
   * springs); under a mouse it shows at once.
   */
  readonly isTouch: boolean;
  /**
   * When the search circle's glass may grow back to its bar size (ms, the
   * document timeline): set as Cancel's release wobble starts, so the
   * wobble plays at the minimized size, as UIKit's does (TabBar passes it to
   * the minimize, which grows the glass).
   */
  readonly glassHoldRef: RefObject<number>;
}

export interface TabBarSearch {
  /**
   * The search circle: hidden while the search tab is selected and its
   * field waits inline; under a finger, the active field's cancel button.
   */
  readonly circle: (element: HTMLElement | null) => void;
  /** The circle's search glyph. */
  readonly searchGlyph: (element: HTMLElement | null) => void;
  /** The circle's cancel glyph, while the field is active under a finger. */
  readonly cancelGlyph: (element: HTMLElement | null) => void;
  /** The Cancel button over the circle: the press's target. */
  readonly cancel: (element: HTMLElement | null) => void;
  /** The field's glass and content: fades in, moves between its places. */
  readonly field: (element: HTMLElement | null) => void;
  /** The field glass's middle: its width. */
  readonly fieldMiddle: (element: HTMLElement | null) => void;
  /** The field glass's trailing cap: its width. */
  readonly fieldEnd: (element: HTMLElement | null) => void;
  /**
   * Under a finger, where the active field and its cancel button sit: their
   * lift above their places in the bar (px, negative is up) and the cancel
   * button's move toward the screen's trailing edge (px). Each keyboard
   * report changes them once.
   */
  readonly place: {readonly lift: number; readonly shift: number};
}

export function useTabBarSearch({
  capsuleRef,
  hostRef,
  isSearching,
  isActive,
  isTouch,
  glassHoldRef,
}: UseTabBarSearchOptions): TabBarSearch {
  // The table's springs become motion roles (a theme may retune them)
  // before this hook's first animation.
  if (isTouch) {
    registerTabBarTable();
  }
  const circle = useAnimator();
  const searchGlyph = useAnimator();
  const cancelGlyph = useAnimator({initial: {opacity: 0}});
  const field = useAnimator({initial: {opacity: 0}});
  const fieldMiddle = useAnimator();
  const fieldEnd = useAnimator();

  // The circle shows unless the search tab waits inline (selected, its field
  // not active); active, it is the field's cancel button, which appears at
  // UIKit's delay. Selecting the search tab (or leaving it) fades the field
  // in (or out).
  const isCancel = isSearching && isActive;
  const isCircleShown = !isSearching || isCancel;
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
        isCancel
          ? {at: performance.now() + tabBar.searchCancelDelay * 1000}
          : undefined,
      );
    }
    if (wasSearching !== isSearching) {
      // Leaving, the field stays visible while it settles back into the bar.
      field.animator.animate(
        {opacity: isSearching ? 1 : 0},
        isSearching ? fade : {spring: tabBar.collapseSize},
      );
    }
  }, [isCircleShown, isCancel, isSearching, circle, field]);

  // The circle's glyph: the cancel glyph from UIKit's delay while it is the
  // cancel button, the search glyph otherwise.
  const wasCancelRef = useRef(isCancel);
  useLayoutEffect(() => {
    if (wasCancelRef.current === isCancel) {
      return;
    }
    wasCancelRef.current = isCancel;
    const swap = {spring: tabBar.minimizeFade};
    const options = isCancel
      ? {at: performance.now() + tabBar.searchCancelDelay * 1000}
      : undefined;
    cancelGlyph.animator.animate({opacity: isCancel ? 1 : 0}, swap, options);
    searchGlyph.animator.animate({opacity: isCancel ? 0 : 1}, swap, options);
  }, [isCancel, cancelGlyph, searchGlyph]);

  // The Cancel button's press: UIControl's highlight from core's press
  // tracker on the button, attached only while it shows. The circle under it
  // draws the press: pressed, it grows to `searchCancelPressedSize`;
  // released, it shrinks back with UIKit's wobble, at the minimized size
  // (the glass grows back to its bar size only once the wobble rests). Under
  // Reduce Motion a press scales nothing.
  const cancelElementRef = useRef<HTMLElement | null>(null);
  const cancelRef = useCallback((element: HTMLElement | null) => {
    cancelElementRef.current = element;
  }, []);
  const pressTargetRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    pressTargetRef.current = isCancel ? cancelElementRef.current : null;
  });
  usePressTracker(pressTargetRef, {
    onHighlightChange: isPressed => {
      const options = {touchRelease: !isPressed};
      if (circle.animator.reducedMotion(options) !== 'off') {
        return;
      }
      const now = performance.now();
      const velocity = circle.animator.getVelocity('scale', now);
      const handle = circle.animator.animate(
        {
          scale: isPressed
            ? tabBar.searchCancelPressedSize / tabBar.minimizedSize
            : 1,
        },
        {
          spring: isPressed
            ? tabBar.searchCancelPress
            : tabBar.searchCancelReturn,
          velocity: {scale: velocity},
        },
        options,
      );
      if (!isPressed) {
        const wobble = handle.curve('scale');
        glassHoldRef.current = now + (wobble?.duration ?? 0) * 1000;
      }
    },
  });

  // Where the active field and its cancel button sit: above the keyboard as
  // of its last report, read once per report and committed as an offset (no
  // ride). After a cancel the place holds until the keyboard is reported
  // down, so nothing jumps while it goes (AST-099 FR5).
  // Measured only from the field's activation until the keyboard is
  // reported down after it (one listener, while needed).
  const [isHeld, setIsHeld] = useState(false);
  const keyboardHeight = useKeyboardHeight(
    isSearching && (isActive || isHeld),
    hostRef,
  );
  useLayoutEffect(() => {
    if (isSearching && isActive) {
      setIsHeld(true);
    } else if (keyboardHeight <= 0 || !isSearching) {
      setIsHeld(false);
    }
  }, [isSearching, isActive, keyboardHeight]);
  const [place, setPlace] = useState(REST);
  const placeRef = useRef(place);
  placeRef.current = place;
  useLayoutEffect(() => {
    const host = hostRef.current;
    const capsule = capsuleRef.current;
    const isRaised = isSearching && (isActive || keyboardHeight > 0);
    if (!isRaised || host == null || capsule == null) {
      setPlace(REST);
      return;
    }
    const win = host.ownerDocument.defaultView;
    if (win == null) {
      return;
    }
    // Where layout puts the field without its lift.
    const bottom = host.getBoundingClientRect().bottom - placeRef.current.lift;
    const lift = searchLift(win.innerHeight, keyboardHeight, bottom);
    const shift = isActive
      ? (isRtlElement(capsule) ? -1 : 1) * searchCancelShift()
      : 0;
    setPlace(previous =>
      previous.lift === lift && previous.shift === shift
        ? previous
        : {lift, shift},
    );
  }, [isSearching, isActive, keyboardHeight, hostRef, capsuleRef]);

  // Activating (or not): the field's box changed in CSS this frame; its
  // glass starts where it was and springs to rest, squashing as it starts.
  const wasActiveRef = useRef(isActive);
  useLayoutEffect(() => {
    const was = wasActiveRef.current;
    wasActiveRef.current = isActive;
    const element = capsuleRef.current;
    if (!isTouch || was === isActive || element == null) {
      return;
    }
    const bar = element.parentElement ?? element;
    const isRtl = isRtlElement(element);
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
    field.animator.animate({x: 0}, morph);
    // The width's squash: its trailing cap and middle start moving inward.
    const squash = isActive ? tabBar.searchSquashVelocity : 0;
    fieldEnd.animator.animate({x: 0}, {...morph, velocity: {x: sign * squash}});
    fieldMiddle.animator.animate(
      {scaleX: 1},
      {...morph, velocity: {scaleX: squash / (to.width - cap)}},
    );
  }, [isActive, isTouch, capsuleRef, field, fieldEnd, fieldMiddle]);

  return {
    circle: circle.ref,
    searchGlyph: searchGlyph.ref,
    cancelGlyph: cancelGlyph.ref,
    cancel: cancelRef,
    field: field.ref,
    fieldMiddle: fieldMiddle.ref,
    fieldEnd: fieldEnd.ref,
    place,
  };
}
