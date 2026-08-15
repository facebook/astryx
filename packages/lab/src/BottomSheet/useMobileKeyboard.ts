// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMobileKeyboard.ts
 * @input Uses React effects and refs supplied by BottomSheet
 * @output Exports internal useMobileKeyboard hook
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Gives an explicitly Tall sheet a keyboard-aware internal scroll range while
 * leaving the sheet itself stationary. Shorter and custom-height sheets opt out
 * entirely. Starting Tall-sheet travel or closing the sheet blurs the field and
 * dismisses the keyboard.
 */

import {useEffect, useRef, type RefObject} from 'react';

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
  isEnabled: boolean;
  isSheetTraveling: boolean;
  isOpen: boolean;
  isPresented: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
}

interface KeyboardGeometry {
  bodyBottom: number;
}

function getVisualViewportBounds(): {top: number; bottom: number} {
  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  return {
    top,
    bottom: top + (viewport?.height ?? window.innerHeight),
  };
}

function isIOSWebKit(): boolean {
  const userAgent = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1)
  );
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
  isEnabled,
  isSheetTraveling,
  isOpen,
  isPresented,
  sheetRef,
}: UseMobileKeyboardOptions): void {
  const hasKeyboardLayoutRef = useRef(false);
  const retainKeyboardLayoutRef = useRef(false);
  const isActiveRef = useRef(isOpen);
  isActiveRef.current = isOpen;

  useEffect(() => {
    if (!isEnabled || !isSheetTraveling) {
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
      // Keep the current keyboard scroll range while focusing the sheet
      // dismisses the keyboard. Viewport resize events unwind that layout as
      // the visual viewport recovers, avoiding a content jump on the first
      // drag frame.
      retainKeyboardLayoutRef.current = hasKeyboardLayoutRef.current;
      sheet.focus({preventScroll: true});
    }
  }, [isEnabled, isSheetTraveling, sheetRef]);

  useEffect(() => {
    if (!isEnabled || !isPresented || isOpen) {
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
      retainKeyboardLayoutRef.current = hasKeyboardLayoutRef.current;
      activeElement.blur();
    }
  }, [isEnabled, isOpen, isPresented, sheetRef]);

  useEffect(() => {
    const body = bodyRef.current;
    const sheet = sheetRef.current;
    if (!isEnabled || !isPresented || !body) {
      return;
    }

    let keyboardGeometry: KeyboardGeometry | null = null;
    let isPreventingFocusScroll = false;
    const preventFocusScroll = isIOSWebKit();

    const clearKeyboardLayout = () => {
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
      keyboardGeometry = null;
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };

    const scrollBodyBy = (distance: number, smoothly: boolean) => {
      if (typeof body.scrollBy !== 'function') {
        body.scrollTop += distance;
        return;
      }
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      body.scrollBy({
        top: distance,
        behavior: smoothly && !reduceMotion ? 'smooth' : 'auto',
      });
    };

    const applyKeyboardGeometry = (geometry: KeyboardGeometry) => {
      const viewport = getVisualViewportBounds();
      // A collapsed detent can extend the body below the layout viewport even
      // after the keyboard closes, so body overlap alone cannot identify
      // recovery. Once the visual viewport reaches the layout viewport bottom,
      // release the retained keyboard layout unconditionally.
      if (viewport.bottom >= window.innerHeight - 0.5) {
        clearKeyboardLayout();
        return;
      }
      const overlap = Math.max(0, geometry.bodyBottom - viewport.bottom);
      if (overlap === 0) {
        clearKeyboardLayout();
        return;
      }

      const inset = Math.max(
        0,
        geometry.bodyBottom - (viewport.bottom - bottomClearance),
      );
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, `${inset}px`);
    };

    // Give an initial touch a focused, stationary source so the subsequent
    // native focus transition has an outgoing blur where preventScroll can be
    // applied. The touch remains uncancelled for native click and caret work.
    const primeTouchFocus = (event: TouchEvent) => {
      if (!isActiveRef.current || !sheet) {
        return;
      }
      const control = findTextEntryControl(event.target, body);
      const activeElement = document.activeElement;
      if (
        !control ||
        (activeElement instanceof Element &&
          body.contains(activeElement) &&
          isTextEntryControl(activeElement))
      ) {
        return;
      }
      sheet.focus({preventScroll: true});
    };

    // Apply preventScroll while the browser is still processing the outgoing
    // focus transition. The original trusted activation continues afterward.
    const preventNativeFocusScroll = (event: FocusEvent) => {
      if (!isActiveRef.current || isPreventingFocusScroll) {
        return;
      }
      const control = findTextEntryControl(event.relatedTarget, body);
      if (!control) {
        return;
      }

      isPreventingFocusScroll = true;
      try {
        control.focus({preventScroll: true});
      } finally {
        isPreventingFocusScroll = false;
      }
    };

    const revealFocusedControl = () => {
      const activeElement = document.activeElement;
      if (
        !(activeElement instanceof HTMLElement) ||
        !body.contains(activeElement) ||
        !isTextEntryControl(activeElement)
      ) {
        if (retainKeyboardLayoutRef.current && keyboardGeometry) {
          applyKeyboardGeometry(keyboardGeometry);
          return;
        }
        clearKeyboardLayout();
        return;
      }

      retainKeyboardLayoutRef.current = false;

      const measuredBodyRect = body.getBoundingClientRect();
      const measuredFocusedRect = activeElement.getBoundingClientRect();
      const viewport = getVisualViewportBounds();
      const overlap = Math.max(0, measuredBodyRect.bottom - viewport.bottom);
      // The extra clearance leaves room for mobile suggestion UI, but only
      // while the visual viewport actually overlaps the sheet. With no
      // obstruction, ordinary desktop and hardware-keyboard focus must not
      // shift an already visible control.
      const clearance = overlap > 0 ? bottomClearance : 0;
      keyboardGeometry =
        overlap > 0
          ? {
              bodyBottom: measuredBodyRect.bottom,
            }
          : null;
      hasKeyboardLayoutRef.current = overlap > 0;

      const inset =
        overlap > 0
          ? Math.max(0, measuredBodyRect.bottom - (viewport.bottom - clearance))
          : 0;
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, `${inset}px`);

      const safeTop = Math.max(measuredBodyRect.top, viewport.top);
      const safeBottom = Math.min(
        measuredBodyRect.bottom,
        viewport.bottom - clearance,
      );
      if (safeBottom <= safeTop) {
        return;
      }

      if (measuredFocusedRect.bottom > safeBottom) {
        scrollBodyBy(measuredFocusedRect.bottom - safeBottom, overlap > 0);
      } else if (measuredFocusedRect.top < safeTop) {
        scrollBodyBy(measuredFocusedRect.top - safeTop, overlap > 0);
      }
    };

    let animationFrame = 0;
    const scheduleReveal = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(revealFocusedControl);
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleReveal);
    const refreshObservedLayout = () => {
      if (!resizeObserver) {
        return;
      }
      resizeObserver.disconnect();

      // Body/sheet box changes include public height and xstyle updates. The
      // generated inset pseudo-element changes only scroll overflow, so these
      // observations do not feed the keyboard inset back into sheet geometry.
      const targets = new Set<Element>([body]);
      if (sheet) {
        targets.add(sheet);
      }
      for (const child of body.children) {
        targets.add(child);
      }
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        body.contains(activeElement)
      ) {
        for (
          let element: HTMLElement | null = activeElement;
          element && element !== body;
          element = element.parentElement
        ) {
          targets.add(element);
        }
      }
      for (const target of targets) {
        resizeObserver.observe(target);
      }
    };
    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(records => {
            // Ignore the internal inset written on the body. Consumer DOM,
            // text, class, style, or visibility changes can all move the
            // focused control without a viewport event.
            if (
              records.every(
                record =>
                  record.type === 'attributes' && record.target === body,
              )
            ) {
              return;
            }
            refreshObservedLayout();
            scheduleReveal();
          });
    const handleFocusIn = () => {
      refreshObservedLayout();
      scheduleReveal();
    };
    const handleFocusOut = () => {
      // Keep the added scroll range while the keyboard animates away. A focus
      // transition to another text-entry control cancels this in focusin.
      retainKeyboardLayoutRef.current = hasKeyboardLayoutRef.current;
      scheduleReveal();
    };
    const handleSheetTransitionEnd = (event: TransitionEvent) => {
      if (event.target === sheet && event.propertyName === 'transform') {
        scheduleReveal();
      }
    };

    const viewport = window.visualViewport;
    if (preventFocusScroll) {
      document.addEventListener('touchstart', primeTouchFocus, {
        capture: true,
        passive: true,
      });
      document.addEventListener('blur', preventNativeFocusScroll, true);
    }
    body.addEventListener('focusin', handleFocusIn);
    body.addEventListener('focusout', handleFocusOut);
    sheet?.addEventListener('transitionend', handleSheetTransitionEnd);
    viewport?.addEventListener('resize', scheduleReveal);
    viewport?.addEventListener('scroll', scheduleReveal);
    window.addEventListener('resize', scheduleReveal);
    mutationObserver?.observe(body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    refreshObservedLayout();
    // The dialog enters the top layer in a later effect. Wait until the next
    // frame so flex geometry is final before measuring the body.
    scheduleReveal();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (preventFocusScroll) {
        document.removeEventListener('touchstart', primeTouchFocus, true);
        document.removeEventListener('blur', preventNativeFocusScroll, true);
      }
      body.removeEventListener('focusin', handleFocusIn);
      body.removeEventListener('focusout', handleFocusOut);
      sheet?.removeEventListener('transitionend', handleSheetTransitionEnd);
      viewport?.removeEventListener('resize', scheduleReveal);
      viewport?.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };
  }, [bodyRef, bottomClearance, isEnabled, isPresented, sheetRef]);
}
