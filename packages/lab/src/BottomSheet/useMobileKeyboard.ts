// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMobileKeyboard.ts
 * @input Uses React effects and refs supplied by BottomSheet
 * @output Exports internal useMobileKeyboard hook
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Keeps focused controls inside the visual viewport without moving or resizing
 * the sheet itself. When the on-screen keyboard covers the stable layout
 * viewport, it extends the body's internal scroll range and reveals only the
 * focused control. Starting sheet travel focuses the panel, blurring the field
 * and dismissing the keyboard.
 */

import {useEffect, type RefObject} from 'react';

// Chrome Android can keep suggestion UI below the keyboard. Keeping this much
// room after a focused control prevents the browser from panning the dialog.
// SYNC: the matching static styles live in BottomSheet.tsx.
const MOBILE_KEYBOARD_FOCUS_GAP = 48;
const MOBILE_KEYBOARD_INSET_VAR = '--_sheet-keyboard-inset';

interface UseMobileKeyboardOptions {
  bodyRef: RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  isOpen: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
}

function getVisualViewportBounds(): {top: number; bottom: number} {
  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  return {
    top,
    bottom: top + (viewport?.height ?? window.innerHeight),
  };
}

export function useMobileKeyboard({
  bodyRef,
  isDragging,
  isOpen,
  sheetRef,
}: UseMobileKeyboardOptions): void {
  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const sheet = sheetRef.current;
    const activeElement = document.activeElement;
    if (
      sheet &&
      activeElement instanceof HTMLElement &&
      activeElement !== sheet &&
      sheet.contains(activeElement)
    ) {
      sheet.focus({preventScroll: true});
    }
  }, [isDragging, sheetRef]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!isOpen || !body) {
      return;
    }

    const revealFocusedControl = () => {
      const activeElement = document.activeElement;
      if (
        !(activeElement instanceof HTMLElement) ||
        !body.contains(activeElement)
      ) {
        body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
        return;
      }

      const bodyRect = body.getBoundingClientRect();
      const viewport = getVisualViewportBounds();
      const overlap = Math.max(0, bodyRect.bottom - viewport.bottom);
      // The extra gap leaves room for Chrome Android's suggestion row after
      // the final input, not just the keyboard's measured overlap.
      const inset = overlap > 0 ? overlap + MOBILE_KEYBOARD_FOCUS_GAP : 0;
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, `${inset}px`);

      const focusedRect = activeElement.getBoundingClientRect();
      const safeTop = Math.max(bodyRect.top, viewport.top);
      const safeBottom =
        Math.min(bodyRect.bottom, viewport.bottom) - MOBILE_KEYBOARD_FOCUS_GAP;
      if (safeBottom <= safeTop) {
        return;
      }

      if (focusedRect.bottom > safeBottom) {
        body.scrollTop += focusedRect.bottom - safeBottom;
      } else if (focusedRect.top < safeTop) {
        body.scrollTop -= safeTop - focusedRect.top;
      }
    };

    let animationFrame = 0;
    const scheduleReveal = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(revealFocusedControl);
    };

    const viewport = window.visualViewport;
    body.addEventListener('focusin', scheduleReveal);
    body.addEventListener('focusout', scheduleReveal);
    viewport?.addEventListener('resize', scheduleReveal);
    viewport?.addEventListener('scroll', scheduleReveal);
    window.addEventListener('resize', scheduleReveal);
    // The dialog enters the top layer in a later effect. Wait until the next
    // frame so flex geometry is final before measuring the body.
    scheduleReveal();

    return () => {
      cancelAnimationFrame(animationFrame);
      body.removeEventListener('focusin', scheduleReveal);
      body.removeEventListener('focusout', scheduleReveal);
      viewport?.removeEventListener('resize', scheduleReveal);
      viewport?.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
    };
  }, [bodyRef, isOpen]);
}
