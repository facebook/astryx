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
 * (`scrollTo`, a status-bar tap) switches it at once, with no compositing
 * layer. That is a WebKit engine workaround: on iOS 26.2, while a composited
 * layer sits under a sticky header (a running animation, `will-change`, a
 * fixed element), a programmatic scroll back to the top makes WebKit drop
 * the header's items for about two frames (plain-HTML repro: a sticky
 * header over a child layer, `scrollTo` 120 px and back to 0; no layer, no
 * blank frame in 5 takes; `will-change: opacity` on the child, a blank in
 * 5 of 5, with no opacity change at all; the layer dropped in the same task
 * as the scroll, none in 6). A finger's scroll never blanks them. So
 * the layer is composited only while a finger works the page: from the
 * finger's landing, so a fade that starts mid-drag finds its layer (on a
 * software rasterizer, creating it as the fade starts costs that frame),
 * until the finger's scroll has ended; the program's switch is written
 * without promotion. The fade is opacity only; under Reduce Motion the
 * animator plays its own cross-fade (design:reduced-motion DR2). The springs
 * are motion roles (`bars.scrollEdgeEffect.appear` / `.disappear`): the
 * animator plays a theme's values for them.
 *
 * SYNC: When modified, update useScrollEdgeEffect.test.tsx and the AppShell
 * styles that size the sentinel (`switchPt`) and the layer (`softExtentPt`).
 */

import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {useFingerScroll} from '../gestures/useFingerScroll';
import type {SpringDescription} from '../motion/spring';
import {useAnimator} from '../motion/useAnimator';
import {useTouchPresentation} from '../utils/touchPresentation';

/** No scroller: nothing is watched (a mouse, or the effect is off). */
const NO_SCROLLER: RefObject<Element | null> = {current: null};

/**
 * The custom property the layer's `will-change` reads: `opacity` while a
 * finger works the page (see the file header), unset otherwise.
 */
export const SCROLL_EDGE_LAYER_PROMOTION = '--astryx-scroll-edge-will-change';

const PASSIVE_CAPTURE = {capture: true, passive: true} as const;

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
          // The first report, or a scroll the program drives: at once, and
          // with no compositing layer. For the program's scroll this is the
          // WebKit workaround in the file header (a layer under the sticky
          // bar as the program scrolls back to the top blanks its items).
          animator.set({opacity: next ? 1 : 0}, {promote: false});
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
    // The layer is composited only while a finger works the page (the file
    // header): from its landing until its scroll, momentum included, ends.
    const scroller: Node = root?.current ?? doc;
    const host = getGestureHost(doc);
    const releaseHost = host.retain();
    let isPromoted = false;
    const updatePromotion = () => {
      const layer = animator.element;
      const next = host.isFingerDownIn(scroller) || isFingerScroll();
      if (layer == null || next === isPromoted) {
        return;
      }
      isPromoted = next;
      if (next) {
        layer.style.setProperty(SCROLL_EDGE_LAYER_PROMOTION, 'opacity');
      } else {
        layer.style.removeProperty(SCROLL_EDGE_LAYER_PROMOTION);
      }
    };
    const unsubscribeFingers = host.onFingersChange(updatePromotion);
    // After the finger-scroll watch has heard the same `scrollend`.
    const onScrollEnd = () => queueMicrotask(updatePromotion);
    doc.addEventListener('scrollend', onScrollEnd, PASSIVE_CAPTURE);
    return () => {
      observerRef.current = null;
      observer.disconnect();
      unsubscribeFingers();
      doc.removeEventListener('scrollend', onScrollEnd, PASSIVE_CAPTURE);
      releaseHost();
      animator.element?.style.removeProperty(SCROLL_EDGE_LAYER_PROMOTION);
      animator.set({opacity: 0}, {promote: false});
    };
  }, [isOn, root, animator, isFingerScroll, springs, registerSprings]);

  return {layerRef, sentinelRef};
}
