// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollEdgeEffect.ts
 * @input React, IntersectionObserver, the motion animator, the springs and
 *   their registration from the component that animates with them
 *   (AppShell: the bars domain of the UIKit constants table, registered
 *   here before the first animation), the touch presentation resolver
 *   (utils/touchPresentation) and the shared gesture host's finger-scroll
 *   state (gestures/useFingerScroll)
 * @output Exports `useScrollEdgeEffect`: refs for a bar's scroll edge effect
 *   layer and for the sentinel that tells when content has moved under the
 *   bar, with the effect fading in and out on UIKit's measured springs
 * @position Internal hook (not exported from the package entry point) for the
 *   iOS 26 look of a bar over scrolling content; AppShell's pinned header
 *   uses it under a finger. With a mouse it observes nothing and the layer
 *   stays transparent. It is AppShell's touch layer: its one import site is
 *   AppShell.tsx
 *
 * iOS 26 bars paint no background of their own. Once the content has moved
 * more than `bars.scrollEdgeEffect.switchPt` (10 pt) under the bar, the
 * scroll view's edge effect fades in on `bars.scrollEdgeEffect.appear`, and
 * it fades out on `bars.scrollEdgeEffect.disappear` when the content comes
 * back: a switch on the scroll offset with a timed fade, not a ramp that
 * follows the scroll. Under a finger it is one model on every touch device.
 *
 * The scroll offset is never read per frame. The sentinel is a box exactly
 * `switchPt` tall at the top of the scrolled content, where the content sits
 * at rest. An IntersectionObserver reports when that box leaves its root
 * (the document's viewport for a page that scrolls, or the scroll
 * container): its bottom edge passes the top of the root exactly when the
 * content has moved more than `switchPt` under a bar pinned there. A box
 * whose edge only touches the root still intersects, so 10 pt is off and
 * 10.25 pt is on, as measured. Overscroll above the rest offset moves the
 * box down and keeps the effect off. The fade runs on the compositor
 * through the motion animator, so a busy main thread delays when it starts
 * (UIKit decides on the main thread too), never how it plays.
 *
 * The first report puts the effect in place without a fade, so a page that
 * loads scrolled shows it at once. After that the effect fades only when a
 * finger drives the scroll (a finger is down in the scroller, or its
 * momentum is still running: `useFingerScroll`, over the gesture host,
 * which ends at the scroller's `scrollend`). A scroll the program starts
 * (`scrollTo`, a status-bar tap) switches it at once. That is a WebKit
 * engine workaround: on iOS 26.2 an opacity fade that starts as a
 * programmatic scroll crosses the switch makes WebKit drop the sticky bar's
 * items for one to three frames (minimal repro: a sticky header with a
 * child, scroll the page 120 px and back to 0 with `scrollTo`, and start any
 * opacity animation or transition on the child when the second scroll
 * crosses back; a fade that starts on a finger's scroll, or a switch without
 * a fade, does not). The fade is opacity only; under Reduce Motion the
 * animator plays its own cross-fade (design:reduced-motion DR2). The springs
 * are motion roles (`bars.scrollEdgeEffect.appear` / `.disappear`): the
 * animator plays a theme's values for them.
 *
 * SYNC: When modified, update useScrollEdgeEffect.test.tsx and the AppShell
 * styles that size the sentinel (`switchPt`) and the layer (`softExtentPt`).
 */

import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {useFingerScroll} from '../gestures/useFingerScroll';
import type {SpringDescription} from '../motion/spring';
import {useAnimator} from '../motion/useAnimator';
import {useTouchPresentation} from '../utils/touchPresentation';

/** No scroller: nothing is watched (a mouse, or the effect is off). */
const NO_SCROLLER: RefObject<Element | null> = {current: null};

export interface UseScrollEdgeEffectOptions {
  /**
   * Whether the effect runs. When false, and always with a mouse, the layer
   * stays transparent and nothing is observed.
   */
  readonly enabled: boolean;
  /**
   * The scroll container whose content passes under the bar. Omit for a
   * page that scrolls (the viewport).
   */
  readonly root?: RefObject<Element | null>;
  /**
   * The fades' springs: a bar's are `bars.scrollEdgeEffect.appear` and
   * `.disappear`, motion roles of its component's table. The component that
   * animates with a table imports it (motion/uikit/tableImports.test.ts), so
   * the springs and their registration come from it.
   */
  readonly springs: {
    readonly appear: SpringDescription;
    readonly disappear: SpringDescription;
  };
  /** Registers the springs' motion roles; called before the first fade. */
  readonly registerSprings: () => void;
}

export interface UseScrollEdgeEffectResult {
  /** Callback ref for the effect layer; its opacity is animated. */
  readonly layerRef: (element: HTMLElement | null) => void;
  /**
   * Callback ref for the sentinel: a box `bars.scrollEdgeEffect.switchPt`
   * tall at the top of the scrolled content (where the bar's bottom edge
   * meets the content at rest).
   */
  readonly sentinelRef: (element: HTMLElement | null) => void;
}

/**
 * The iOS 26 scroll edge effect of a bar: fades its layer in once the content
 * has moved more than 10 pt under the bar and out when it comes back.
 *
 * @example
 * ```
 * const {layerRef, sentinelRef} = useScrollEdgeEffect({
 *   enabled: isTouch,
 *   springs: bars.scrollEdgeEffect,
 *   registerSprings: registerBarsTable,
 * });
 * ```
 */
export function useScrollEdgeEffect({
  enabled,
  root,
  springs,
  registerSprings,
}: UseScrollEdgeEffectOptions): UseScrollEdgeEffectResult {
  // Under a finger: the resolver's touch presentation, the same on every
  // touch device.
  const {isTouch} = useTouchPresentation();
  const isOn = enabled && isTouch;
  const {ref: layerRef, animator} = useAnimator({initial: {opacity: 0}});
  // Whether the scroll now moving is a finger's (the shared gesture host,
  // through useFingerScroll): the page's own scroll is the document's, a
  // container scrolls itself. Watched only while the effect runs, so a
  // mouse costs nothing.
  const isFingerScroll = useFingerScroll(
    !isOn
      ? NO_SCROLLER
      : (root ?? (typeof document === 'undefined' ? NO_SCROLLER : document)),
  );
  // The sentinel is owned through its callback ref, never React state
  // (architecture:react-component-runtime INV1): the ref keeps the node and
  // moves the running observer to a replacement node (INV6); the effect
  // creates the observer once the refs are attached.
  const sentinelElementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback((element: HTMLElement | null) => {
    const observer = observerRef.current;
    if (observer != null && sentinelElementRef.current != null) {
      observer.unobserve(sentinelElementRef.current);
    }
    sentinelElementRef.current = element;
    if (observer != null && element != null) {
      observer.observe(element);
    }
  }, []);

  useEffect(() => {
    if (!isOn || typeof IntersectionObserver === 'undefined') {
      return;
    }
    // The springs are motion roles: registered before the first animation.
    registerSprings();
    const sentinel = sentinelElementRef.current;
    const doc = sentinel?.ownerDocument ?? document;
    let isShown: boolean | null = null;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        if (entry == null) {
          return;
        }
        const next = !entry.isIntersecting;
        if (next === isShown) {
          return;
        }
        if (isShown != null && isFingerScroll()) {
          animator.animate(
            {opacity: next ? 1 : 0},
            {spring: next ? springs.appear : springs.disappear},
            // Under Reduce Motion the animator plays its own opacity
            // cross-fade on a coarse pointer (design:reduced-motion DR2).
          );
        } else {
          // The first report, or a scroll the program drives: at once. For
          // the program's scroll this is the WebKit workaround in the file
          // header (a fade starting on its crossing blanks the bar's items).
          animator.set({opacity: next ? 1 : 0});
        }
        isShown = next;
      },
      // The sentinel's own document, not the implicit root: inside a frame
      // the implicit root is the top-level viewport, not the frame's.
      {root: root?.current ?? doc, threshold: 0},
    );
    observerRef.current = observer;
    if (sentinel != null) {
      observer.observe(sentinel);
    }
    return () => {
      observerRef.current = null;
      observer.disconnect();
      animator.set({opacity: 0});
    };
  }, [isOn, root, animator, isFingerScroll, springs, registerSprings]);

  return {layerRef, sentinelRef};
}
