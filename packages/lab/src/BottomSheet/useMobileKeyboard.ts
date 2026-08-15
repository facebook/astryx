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
 * focused control. Starting sheet travel or closing the sheet blurs the field
 * and dismisses the keyboard.
 */

import {useEffect, type RefObject} from 'react';

const MOBILE_KEYBOARD_INSET_VAR = '--_sheet-keyboard-inset';
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

interface UseMobileKeyboardOptions {
  bodyRef: RefObject<HTMLDivElement | null>;
  bottomClearance: number;
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

function isTextEntryControl(element: Element | null): element is HTMLElement {
  if (element instanceof HTMLTextAreaElement) {
    return !element.disabled && !element.readOnly;
  }
  if (element instanceof HTMLInputElement) {
    return (
      !element.disabled &&
      !element.readOnly &&
      !NON_TEXT_INPUT_TYPES.has(element.type)
    );
  }
  return (
    element instanceof HTMLElement &&
    element.matches('[contenteditable]:not([contenteditable="false"])')
  );
}

function findTextEntryControl(
  target: EventTarget | null,
  body: HTMLElement,
): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const direct = target.closest(
    'input, textarea, [contenteditable]:not([contenteditable="false"])',
  );
  if (body.contains(direct) && isTextEntryControl(direct)) {
    return direct;
  }

  const label = target.closest('label');
  const control = label instanceof HTMLLabelElement ? label.control : null;
  return body.contains(control) && isTextEntryControl(control) ? control : null;
}

export function useMobileKeyboard({
  bodyRef,
  bottomClearance,
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
    if (isOpen) {
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
      activeElement.blur();
    }
  }, [isOpen, sheetRef]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!isOpen || !body) {
      return;
    }

    // Focus text-entry controls before the browser's pointer default runs, so
    // the keyboard can open without the browser independently panning the page
    // or sheet. Do not cancel the event: its default still places the caret at
    // the tapped position and dispatches the control's normal click.
    const preventPointerFocusScroll = (event: PointerEvent) => {
      const control = findTextEntryControl(event.target, body);
      if (control && control !== document.activeElement) {
        control.focus({preventScroll: true});
      }
    };

    // Focus a text-entry related target before the browser completes its own
    // focus transition. Listening to blur on document covers transitions that
    // begin outside the scroll body (including the sheet itself), as well as
    // Tab and mobile keyboard "Next" actions between fields.
    const preventFocusTransitionScroll = (event: FocusEvent) => {
      const control = findTextEntryControl(event.relatedTarget, body);
      if (control && control !== document.activeElement) {
        control.focus({preventScroll: true});
      }
    };

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
      // The extra clearance leaves room for mobile suggestion UI, but only
      // while the visual viewport actually overlaps the sheet. With no
      // obstruction, ordinary desktop and hardware-keyboard focus must not
      // shift an already visible control.
      const clearance = overlap > 0 ? bottomClearance : 0;
      const inset = overlap + clearance;
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, `${inset}px`);

      const focusedRect = activeElement.getBoundingClientRect();
      const safeTop = Math.max(bodyRect.top, viewport.top);
      const safeBottom = Math.min(bodyRect.bottom, viewport.bottom) - clearance;
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
    body.addEventListener('pointerdown', preventPointerFocusScroll, true);
    document.addEventListener('blur', preventFocusTransitionScroll, true);
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
      body.removeEventListener('pointerdown', preventPointerFocusScroll, true);
      document.removeEventListener('blur', preventFocusTransitionScroll, true);
      body.removeEventListener('focusin', scheduleReveal);
      body.removeEventListener('focusout', scheduleReveal);
      viewport?.removeEventListener('resize', scheduleReveal);
      viewport?.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
    };
  }, [bodyRef, bottomClearance, isOpen]);
}
