// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useDisabledFocusRecovery.ts
 * @input A navigation button's committed disabled state, ref and local receiver
 * @output Focus/blur handlers that retain focus ownership across disablement
 * @position Private Core hook; shared by bounded navigation controls
 */

import {useRef, type FocusEvent, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';
import {
  getInteractionModality,
  useInteractionModalityTracking,
} from '../utils/interactionModality';

/** Recover only the focus lost by a newly disabled, still-owned button. */
export function useDisabledFocusRecovery(
  isDisabled: boolean,
  buttonRef: RefObject<HTMLButtonElement | null>,
  getReceiver: () => HTMLElement | null,
) {
  useInteractionModalityTracking();
  const wasDisabledRef = useRef(isDisabled);
  const focusedButtonRef = useRef<HTMLButtonElement | null>(null);

  // Synchronize native browser focus with committed availability. A navigation
  // request cannot predict this transition: controlled owners may ignore/defer
  // it, and cursor results or bounds can change independently of a press. After
  // commit the opposite control is also enabled, even in a two-item range.
  useIsomorphicLayoutEffect(() => {
    const wasDisabled = wasDisabledRef.current;
    wasDisabledRef.current = isDisabled;
    if (wasDisabled || !isDisabled) {
      return;
    }

    const button = focusedButtonRef.current;
    // Consume once, before focus dispatches another event or React replays work.
    focusedButtonRef.current = null;
    if (
      button == null ||
      (buttonRef.current != null && button !== buttonRef.current)
    ) {
      return;
    }
    const {activeElement, body} = button.ownerDocument;
    if (activeElement !== button && activeElement !== body) {
      return;
    }
    // This repairs keyboard navigation. Pointer presses keep the browser's
    // existing focus behavior, including browsers that do not focus buttons
    // on click; moving their focus here can inherit an old keyboard ring.
    if (getInteractionModality() !== 'keyboard') {
      return;
    }
    const receiver = getReceiver();
    if (receiver?.isConnected) {
      receiver.focus({preventScroll: true});
    }
  }, [isDisabled, buttonRef, getReceiver]);

  return {
    onFocus: (event: FocusEvent<HTMLButtonElement>) => {
      focusedButtonRef.current = event.currentTarget;
    },
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      // Native disablement blurs to body during the commit. Explicit blur/Tab
      // while enabled, or a move to another target, relinquishes ownership.
      if (!event.currentTarget.disabled || event.relatedTarget != null) {
        focusedButtonRef.current = null;
      }
    },
  };
}
