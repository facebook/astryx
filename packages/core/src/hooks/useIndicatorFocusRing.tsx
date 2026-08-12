// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIndicatorFocusRing.tsx
 * @input A ref to the element wrapping only the indicator
 * @output Focus handlers that draw the standard ring on the indicator itself
 * @position Used by controls whose focusable input is visually hidden
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (exports)
 *
 * A checkbox or radio focuses a native `<input>` that is `opacity: 0`, so the
 * visible focus indicator has to appear on the picture beside it — and that
 * picture is a themeable indicator, which is what makes "who draws the ring"
 * awkward:
 *
 * - Only the indicator's own element can shape the ring: `outline` follows
 *   that element's `border-radius`. Draw it on a wrapper and the owner has to
 *   hardcode a guess about whatever indicator it hosts (RadioListItem used to
 *   carry `border-radius: 50%` for a circle it did not own).
 * - But an indicator supplied by a theme is third-party code. If drawing the
 *   ring is its job, a replacement that simply doesn't ships a control with no
 *   visible focus (WCAG 2.4.7) — and that is the DEFAULT outcome: the sample
 *   replacement in our own Storybook destructures `{state, size, isDisabled}`
 *   and drops the rest, which is what a theme author plausibly writes. Nothing
 *   can enforce otherwise; a component ignoring every prop is still assignable
 *   to `IndicatorComponent`, and branding the return type does not work either
 *   (JSX types every expression as `JSX.Element`).
 *
 * So the owner draws it, on the indicator's own element, imperatively at focus
 * time. No cooperation is required and none can be forgotten.
 *
 * Two details that are load-bearing, both measured rather than assumed:
 *
 * 1. **Inline style, not a class.** React replaces `className` wholesale on
 *    re-render, so an injected class disappears the moment the control changes
 *    state — pressing Space on a focused checkbox lost the ring. React
 *    reconciles `style` per property, so an `outline` set here survives.
 * 2. **`:focus-visible`, not `:focus`.** The CSS this replaces got
 *    keyboard-vs-pointer for free; an event handler has to ask. Checking the
 *    element keeps the browser's heuristic, including `focus({focusVisible:
 *    true})`, which a hand-rolled modality guess would miss.
 *
 * Imperative styling on an interaction event follows `useTableSelection`,
 * which sets row-selection styles the same way.
 */

import {useCallback, useMemo} from 'react';
import type {FocusEvent, RefObject} from 'react';
import {
  FOCUS_OUTLINE_PARTS,
  FOCUS_OUTLINE_PARTS_NONE,
} from '../utils/focusOutline.stylex';

export interface UseIndicatorFocusRingReturn {
  /** Spread onto the element that owns the focusable input. */
  focusProps: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
  };
}

/**
 * Draw the standard focus ring on the indicator inside `containerRef`, shaped
 * by whatever that indicator actually is.
 *
 * @param containerRef - Wraps ONLY the indicator, so its single element child
 *   is unambiguously the thing to ring, whatever a theme renders there.
 * @param isDisabled - Skip the ring; a disabled control is not focusable.
 *
 * @example
 * ```
 * const indicatorRef = useRef<HTMLSpanElement>(null);
 * const {focusProps} = useIndicatorFocusRing(indicatorRef, isDisabled);
 * <div {...focusProps}>
 *   <input type="checkbox" />
 *   <span ref={indicatorRef}><Indicator state="checked" /></span>
 * </div>
 * ```
 */
export function useIndicatorFocusRing(
  containerRef: RefObject<HTMLElement | null>,
  isDisabled = false,
): UseIndicatorFocusRingReturn {
  const paint = useCallback(
    (on: boolean) => {
      // `firstElementChild`, not a search: the container holds the indicator
      // and nothing else, so there is no ambiguity — and no way for a later
      // sibling to quietly become the target.
      const indicator = containerRef.current?.firstElementChild;
      if (indicator instanceof HTMLElement) {
        Object.assign(
          indicator.style,
          on ? FOCUS_OUTLINE_PARTS : FOCUS_OUTLINE_PARTS_NONE,
        );
      }
    },
    [containerRef],
  );

  const onFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (isDisabled) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && !target.matches(':focus-visible')) {
        return;
      }
      paint(true);
    },
    [isDisabled, paint],
  );

  const onBlur = useCallback(() => paint(false), [paint]);

  return useMemo(() => ({focusProps: {onFocus, onBlur}}), [onFocus, onBlur]);
}
