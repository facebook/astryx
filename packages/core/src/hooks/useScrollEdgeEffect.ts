// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollEdgeEffect.ts
 * @input React, IntersectionObserver, the motion animator and the bars
 *   domain of the UIKit constants table
 * @output Exports `useScrollEdgeEffect`: refs for a bar's scroll edge effect
 *   layer and for the sentinel that tells when content has moved under the
 *   bar, with the effect fading in and out on UIKit's measured springs
 * @position Internal hook (not exported from the package entry point) for the
 *   iOS 26 look of a bar over scrolling content; AppShell's pinned header on
 *   a touch screen uses it
 *
 * iOS 26 bars paint no background of their own. Once the content has moved
 * more than `bars.scrollEdgeEffect.switchPt` (10 pt) under the bar, the
 * scroll view's edge effect fades in on `bars.scrollEdgeEffect.appear`, and
 * it fades out on `bars.scrollEdgeEffect.disappear` when the content comes
 * back: a switch on the scroll offset with a timed fade, not a ramp that
 * follows the scroll.
 *
 * The scroll offset is never read per frame. The sentinel is a box exactly
 * `switchPt` tall at the top of the scrolled content, where the content sits
 * at rest. An IntersectionObserver reports when that box leaves its root
 * (the document's viewport for a page that scrolls, or the scroll
 * container): its
 * bottom edge passes the top of the root exactly when the content has moved
 * more than `switchPt` under a bar pinned there. A box whose edge only
 * touches the root still intersects, so 10 pt is off and 10.25 pt is on, as
 * measured. Overscroll above the rest offset moves the box down and keeps the
 * effect off. The fade runs on the compositor through the motion animator,
 * so a busy main thread delays when it starts (UIKit decides on the main
 * thread too), never how it plays.
 *
 * The first report puts the effect in place without a fade, so a page that
 * loads scrolled shows it at once. The fade is opacity only, so Reduced
 * Motion keeps it.
 *
 * SYNC: When modified, update useScrollEdgeEffect.test.tsx and the AppShell
 * styles that size the sentinel (`switchPt`) and the layer (`softExtentPt`).
 */

import {useCallback, useEffect, useState, type RefObject} from 'react';
import {useAnimator} from '../motion/useAnimator';
import {bars} from '../motion/uikit/bars';

export interface UseScrollEdgeEffectOptions {
  /**
   * Whether the effect runs. When false the layer stays transparent and
   * nothing is observed.
   */
  readonly enabled: boolean;
  /**
   * The scroll container whose content passes under the bar. Omit for a
   * page that scrolls (the viewport).
   */
  readonly root?: RefObject<Element | null>;
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
 * const {layerRef, sentinelRef} = useScrollEdgeEffect({enabled: isTouch});
 * ```
 */
export function useScrollEdgeEffect({
  enabled,
  root,
}: UseScrollEdgeEffectOptions): UseScrollEdgeEffectResult {
  const {ref: layerRef, animator} = useAnimator({initial: {opacity: 0}});
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const sentinelRef = useCallback(
    (element: HTMLElement | null) => setSentinel(element),
    [],
  );

  useEffect(() => {
    if (
      !enabled ||
      sentinel == null ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }
    let isOn: boolean | null = null;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        if (entry == null) {
          return;
        }
        const next = !entry.isIntersecting;
        if (next === isOn) {
          return;
        }
        if (isOn == null) {
          animator.set({opacity: next ? 1 : 0});
        } else {
          animator.animate(
            {opacity: next ? 1 : 0},
            {
              spring: next
                ? bars.scrollEdgeEffect.appear
                : bars.scrollEdgeEffect.disappear,
            },
          );
        }
        isOn = next;
      },
      // The sentinel's own document, not the implicit root: inside a frame
      // the implicit root is the top-level viewport, not the frame's.
      {root: root?.current ?? sentinel.ownerDocument, threshold: 0},
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      animator.set({opacity: 0});
    };
  }, [enabled, sentinel, root, animator]);

  return {layerRef, sentinelRef};
}
