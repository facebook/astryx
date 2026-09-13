// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetFocusableContent.ts
 * @input Sheet body ref and interactive state; shared focusable selector
 * @output Whether the sheet content supplies a visible sequential focus target
 * @position Private keyboard-owner selection; scroll measurement remains in useScrollableArea
 */

import {useLayoutEffect, useState, type RefObject} from 'react';
import {FOCUSABLE_SELECTOR} from '../hooks/focusableSelector';
import {observeResize} from '../utils/sharedResizeObserver';

/** Prefer an existing keyboard path; never focus a child just to test it. */
export function useSheetFocusableContent(
  bodyRef: RefObject<HTMLElement | null>,
  isInteractive: boolean,
): boolean {
  const [hasFocusableContent, setHasFocusableContent] = useState(false);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (body == null || !isInteractive) {
      return;
    }

    let frame: number | null = null;
    const check = () => {
      frame = null;
      const next = Array.from(
        body.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).some(element => {
        if (
          element.tabIndex < 0 ||
          element.matches(':disabled') ||
          element.closest('[inert], [hidden], [aria-hidden="true"]') != null ||
          element.getClientRects().length === 0
        ) {
          return false;
        }
        const visibility = getComputedStyle(element).visibility;
        return visibility !== 'hidden' && visibility !== 'collapse';
      });
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- observed DOM focus eligibility selects the existing keyboard owner
      setHasFocusableContent(current => (current === next ? current : next));
    };
    const scheduleCheck = () => {
      if (frame == null) {
        frame = requestAnimationFrame(check);
      }
    };

    check();
    // Descendants can update without rerendering their BottomSheet parent.
    // Observe focus eligibility, not geometry or effective scroll ownership.
    const observer = new MutationObserver(scheduleCheck);
    observer.observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    // Any attribute can select CSS that changes focus eligibility, including
    // consumer data-* state on a descendant or an ancestor of the sheet.
    let ancestor = body.parentElement;
    while (ancestor != null) {
      observer.observe(ancestor, {
        attributes: true,
      });
      ancestor = ancestor.parentElement;
    }
    window.addEventListener('resize', scheduleCheck);
    const stopObservingResize = observeResize(body, scheduleCheck);
    body.addEventListener('transitionend', scheduleCheck);
    body.addEventListener('animationend', scheduleCheck);

    return () => {
      observer.disconnect();
      stopObservingResize();
      window.removeEventListener('resize', scheduleCheck);
      body.removeEventListener('transitionend', scheduleCheck);
      body.removeEventListener('animationend', scheduleCheck);
      if (frame != null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [bodyRef, isInteractive]);

  return hasFocusableContent;
}
