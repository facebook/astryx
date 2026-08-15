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
const TOUCH_FOCUS_MOVE_THRESHOLD = 10;
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
  sheetRef: RefObject<HTMLDivElement | null>;
}

interface FocusScrollSnapshot {
  target: HTMLElement;
  elements: Array<{
    element: HTMLElement;
    scrollLeft: number;
    scrollTop: number;
  }>;
  windowX: number;
  windowY: number;
}

interface PendingTouchFocus {
  clientX: number;
  clientY: number;
  control: HTMLElement;
  pointerId: number;
}

interface KeyboardGeometry {
  bodyBottom: number;
}

function captureFocusScroll(target: HTMLElement): FocusScrollSnapshot {
  const elements: FocusScrollSnapshot['elements'] = [];
  for (
    let element = target.parentElement;
    element;
    element = element.parentElement
  ) {
    elements.push({
      element,
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
    });
  }
  return {
    target,
    elements,
    windowX: window.scrollX,
    windowY: window.scrollY,
  };
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
  isEnabled,
  isSheetTraveling,
  isOpen,
  sheetRef,
}: UseMobileKeyboardOptions): void {
  const hasKeyboardLayoutRef = useRef(false);
  const retainKeyboardLayoutRef = useRef(false);

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
    if (!isEnabled || isOpen) {
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
  }, [isEnabled, isOpen, sheetRef]);

  useEffect(() => {
    const body = bodyRef.current;
    const sheet = sheetRef.current;
    if (!isEnabled || !isOpen || !body) {
      return;
    }

    let keyboardGeometry: KeyboardGeometry | null = null;
    let pendingFocusScroll: FocusScrollSnapshot | null = null;
    let pendingPointerFocusScroll: FocusScrollSnapshot | null = null;
    let pendingTouchFocus: PendingTouchFocus | null = null;

    const clearKeyboardLayout = () => {
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
      keyboardGeometry = null;
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };

    const restoreScrollSnapshot = (snapshot: FocusScrollSnapshot) => {
      for (const {element, scrollLeft, scrollTop} of snapshot.elements) {
        if (element.scrollLeft !== scrollLeft) {
          element.scrollLeft = scrollLeft;
        }
        if (element.scrollTop !== scrollTop) {
          element.scrollTop = scrollTop;
        }
      }
      if (
        window.scrollX !== snapshot.windowX ||
        window.scrollY !== snapshot.windowY
      ) {
        window.scrollTo(snapshot.windowX, snapshot.windowY);
      }
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

    // Capture before the browser's focus action. For touch taps, wait until
    // pointerup confirms the gesture was not a scroll, then focus with
    // preventScroll before Safari performs its own focus default. The
    // subsequent click remains native and owns caret placement.
    const rememberPointerFocusScroll = (event: PointerEvent) => {
      const control = findTextEntryControl(event.target, body);
      pendingPointerFocusScroll =
        control && control !== document.activeElement
          ? captureFocusScroll(control)
          : null;
      pendingTouchFocus =
        event.pointerType === 'touch' &&
        event.isPrimary !== false &&
        control &&
        control !== document.activeElement
          ? {
              clientX: event.clientX,
              clientY: event.clientY,
              control,
              pointerId: event.pointerId,
            }
          : null;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (
        pendingTouchFocus?.pointerId === event.pointerId &&
        Math.hypot(
          event.clientX - pendingTouchFocus.clientX,
          event.clientY - pendingTouchFocus.clientY,
        ) > TOUCH_FOCUS_MOVE_THRESHOLD
      ) {
        if (pendingPointerFocusScroll?.target === pendingTouchFocus.control) {
          pendingPointerFocusScroll = null;
        }
        pendingTouchFocus = null;
      }
    };
    const handlePointerCancel = (event: PointerEvent) => {
      if (pendingTouchFocus?.pointerId === event.pointerId) {
        if (pendingPointerFocusScroll?.target === pendingTouchFocus.control) {
          pendingPointerFocusScroll = null;
        }
        pendingTouchFocus = null;
      }
    };
    const preventTouchFocusScroll = (event: PointerEvent) => {
      const pending = pendingTouchFocus;
      pendingTouchFocus = null;
      if (
        !pending ||
        pending.pointerId !== event.pointerId ||
        findTextEntryControl(event.target, body) !== pending.control ||
        document.activeElement === pending.control
      ) {
        if (pendingPointerFocusScroll?.target === pending?.control) {
          pendingPointerFocusScroll = null;
        }
        return;
      }

      pending.control.focus({preventScroll: true});
    };

    // Keyboard and programmatic focus transitions cannot pass preventScroll to
    // the browser. After consumer blur handlers run but before the destination
    // scrolls into view, snapshot every scrollable ancestor, then restore those
    // positions during the destination's focus event. This prevents native
    // panning without re-entering the browser's focus lifecycle or duplicating
    // consumer focus/blur callbacks.
    const rememberFocusScroll = (event: FocusEvent) => {
      const control = findTextEntryControl(event.relatedTarget, body);
      if (!control) {
        pendingFocusScroll = null;
        return;
      }
      pendingFocusScroll = captureFocusScroll(control);
    };
    const restoreFocusScroll = (event: FocusEvent) => {
      const control = findTextEntryControl(event.target, body);
      const snapshot =
        pendingFocusScroll?.target === control
          ? pendingFocusScroll
          : pendingPointerFocusScroll?.target === control
            ? pendingPointerFocusScroll
            : null;
      pendingFocusScroll = null;
      pendingPointerFocusScroll = null;
      if (!snapshot || snapshot.target !== control) {
        return;
      }

      restoreScrollSnapshot(snapshot);
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
        body.scrollTop += measuredFocusedRect.bottom - safeBottom;
      } else if (measuredFocusedRect.top < safeTop) {
        body.scrollTop -= safeTop - measuredFocusedRect.top;
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
    const handleSheetTransitionEnd = (event: TransitionEvent) => {
      if (event.target === sheet && event.propertyName === 'transform') {
        scheduleReveal();
      }
    };

    const viewport = window.visualViewport;
    // Capture before consumer handlers so stopPropagation cannot opt the
    // browser back into native focus panning accidentally.
    document.addEventListener('pointerdown', rememberPointerFocusScroll, true);
    document.addEventListener('pointermove', handlePointerMove, true);
    document.addEventListener('pointercancel', handlePointerCancel, true);
    document.addEventListener('pointerup', preventTouchFocusScroll, true);
    document.addEventListener('focusout', rememberFocusScroll);
    body.addEventListener('focus', restoreFocusScroll, true);
    body.addEventListener('focusin', handleFocusIn);
    body.addEventListener('focusout', scheduleReveal);
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
      document.removeEventListener(
        'pointerdown',
        rememberPointerFocusScroll,
        true,
      );
      document.removeEventListener('pointermove', handlePointerMove, true);
      document.removeEventListener('pointercancel', handlePointerCancel, true);
      document.removeEventListener('pointerup', preventTouchFocusScroll, true);
      document.removeEventListener('focusout', rememberFocusScroll);
      body.removeEventListener('focus', restoreFocusScroll, true);
      body.removeEventListener('focusin', handleFocusIn);
      body.removeEventListener('focusout', scheduleReveal);
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
  }, [bodyRef, bottomClearance, isEnabled, isOpen, sheetRef]);
}
