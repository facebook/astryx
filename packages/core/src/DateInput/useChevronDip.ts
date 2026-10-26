// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file useChevronDip.ts
 * @input Whether the month/year wheels show, and the Reduced Motion policy
 *   (motion/reducedMotion.ts)
 * @output Exports `useChevronDip`: a callback ref for the title button whose
 *   chevron dips to transparent and back under reduced motion on a touch
 *   screen
 * @position Internal hook of TouchDateField.tsx and TouchDateTimeField.tsx
 *
 * Under reduced motion the title's chevron must not turn
 * (design:reduced-motion DR1). On a touch screen it cross-fades instead
 * (DR2): this dips its opacity for the policy's fade, and its styles apply
 * the turn at once at the dip's middle. With a mouse or a keyboard the turn
 * simply applies at once (DR3), and this does nothing.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/__tests__/MonthYearToggle.interaction.browser.spec.ts
 */

import {useEffect, useRef} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {reducedMotionFade} from '../motion/reducedMotion';
import {reducedMotionFadeConsts} from '../motion/reducedMotion.stylex';

/**
 * A callback ref for the title button: its chevron (the Icon inside it) dips
 * to transparent and back each time `state` changes under reduced motion on a
 * touch screen. The ref sits on the button because a registry Icon does not
 * forward one.
 *
 * @example
 * ```
 * const dipRef = useChevronDip(isWheelOpen);
 * return <button ref={dipRef}><Icon icon="chevronDown" /></button>;
 * ```
 */
export function useChevronDip(
  state: boolean,
): (element: Element | null) => void {
  const elementRef = useRef<Element | null>(null);
  const stateRef = useRef(state);
  const dipRef = useRef<Animation | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (stateRef.current === state) {
      return;
    }
    stateRef.current = state;
    const element = elementRef.current?.querySelector('.astryx-icon') ?? null;
    const fade = reducedMotionFade(element);
    if (
      element == null ||
      fade == null ||
      fade.duration === 0 ||
      typeof element.animate !== 'function'
    ) {
      return;
    }
    // A second change within the dip restarts it from where it is rather
    // than snapping the glyph back to opaque first. The fixed curve keeps the
    // dip's middle on the turn's fixed delay (half the policy's duration) even
    // when a theme retunes `timing.curves.move`.
    dipRef.current?.cancel();
    dipRef.current = element.animate(
      [{opacity: 1}, {opacity: 0}, {opacity: 1}],
      {duration: fade.duration, easing: reducedMotionFadeConsts.easing},
    );
  }, [state]);
  // Synchronizes with the dip's animation: it does not outlive the title.
  useEffect(
    () => () => {
      dipRef.current?.cancel();
    },
    [],
  );
  return element => {
    elementRef.current = element;
  };
}
