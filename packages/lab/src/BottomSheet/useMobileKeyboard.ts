// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMobileKeyboard.ts
 * @input Uses React effects and refs supplied by BottomSheet
 * @output Exports internal useMobileKeyboard hook
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Keeps focused controls inside the visual viewport without resizing the
 * sheet. When the on-screen keyboard covers the stable layout viewport, it
 * extends the body's internal scroll range and reveals only the focused
 * control. A short sheet lifts just enough to expose a usable focus area while
 * retaining its measured height. Starting sheet travel or closing the sheet
 * blurs the field and dismisses the keyboard.
 */

import {useEffect, type RefObject} from 'react';

const MOBILE_KEYBOARD_INSET_VAR = '--_sheet-keyboard-inset';
const MOBILE_KEYBOARD_LIFT_VAR = '--_sheet-keyboard-lift';
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
  isSheetTraveling: boolean;
  isOpen: boolean;
  positionerRef: RefObject<HTMLDivElement | null>;
  preserveSheetHeight: boolean;
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
  isSheetTraveling,
  isOpen,
  positionerRef,
  preserveSheetHeight,
  sheetRef,
}: UseMobileKeyboardOptions): void {
  useEffect(() => {
    if (!isSheetTraveling) {
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
  }, [isSheetTraveling, sheetRef]);

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
    const positioner = positionerRef.current;
    const sheet = sheetRef.current;
    if (!isOpen || !body || !positioner) {
      return;
    }

    let isSheetHeightFrozen = false;
    let keyboardLift = 0;
    let pendingFocusScroll: FocusScrollSnapshot | null = null;
    let pendingPointerFocusScroll: FocusScrollSnapshot | null = null;

    const setKeyboardLift = (nextLift: number) => {
      if (nextLift === keyboardLift) {
        return;
      }
      keyboardLift = nextLift;
      positioner.style.setProperty(MOBILE_KEYBOARD_LIFT_VAR, `${nextLift}px`);
    };

    const clearKeyboardLayout = () => {
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
      setKeyboardLift(0);
      if (isSheetHeightFrozen && sheet) {
        sheet.style.removeProperty('height');
        isSheetHeightFrozen = false;
      }
    };

    // Let the browser perform pointer focus normally so caret placement, click
    // behavior, and the focus lifecycle stay native. Capture scroll positions
    // before its default focus action so they can be restored below.
    const rememberPointerFocusScroll = (event: PointerEvent) => {
      const control = findTextEntryControl(event.target, body);
      pendingPointerFocusScroll =
        control && control !== document.activeElement
          ? captureFocusScroll(control)
          : null;
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

    const revealFocusedControl = () => {
      const activeElement = document.activeElement;
      if (
        !(activeElement instanceof HTMLElement) ||
        !body.contains(activeElement) ||
        !isTextEntryControl(activeElement)
      ) {
        clearKeyboardLayout();
        return;
      }

      const measuredBodyRect = body.getBoundingClientRect();
      const measuredFocusedRect = activeElement.getBoundingClientRect();
      const viewport = getVisualViewportBounds();
      // The positioner's transform is included in client rects. Add the
      // current lift back before calculating the next one so repeated
      // viewport/layout observations converge instead of alternating between
      // lifted and unlifted values.
      const unliftedBodyTop = measuredBodyRect.top + keyboardLift;
      const unliftedBodyBottom = measuredBodyRect.bottom + keyboardLift;
      const unliftedFocusedTop = measuredFocusedRect.top + keyboardLift;
      const unliftedFocusedBottom = measuredFocusedRect.bottom + keyboardLift;
      const overlap = Math.max(0, unliftedBodyBottom - viewport.bottom);
      // The extra clearance leaves room for mobile suggestion UI, but only
      // while the visual viewport actually overlaps the sheet. With no
      // obstruction, ordinary desktop and hardware-keyboard focus must not
      // shift an already visible control.
      const clearance = overlap > 0 ? bottomClearance : 0;
      if (overlap > 0 && preserveSheetHeight && sheet && !isSheetHeightFrozen) {
        // A normal-flow spacer would otherwise increase a hug sheet's
        // intrinsic height. Lock its current geometry before growing the
        // internal scroll range, then release it when the obstruction clears.
        sheet.style.height = `${sheet.getBoundingClientRect().height}px`;
        isSheetHeightFrozen = true;
      }

      let nextLift = 0;
      if (overlap > 0) {
        const focusedHeight = measuredFocusedRect.height;
        const targetBodyTop = Math.max(
          viewport.top,
          viewport.bottom - clearance - focusedHeight,
        );
        const neededLift = Math.max(0, unliftedBodyTop - targetBodyTop);
        const measuredSheetTop = sheet?.getBoundingClientRect().top;
        const maxLift =
          measuredSheetTop == null
            ? neededLift
            : Math.max(0, measuredSheetTop + keyboardLift - viewport.top);
        nextLift = Math.min(neededLift, maxLift);
      }
      setKeyboardLift(nextLift);

      const bodyTop = unliftedBodyTop - nextLift;
      const bodyBottom = unliftedBodyBottom - nextLift;
      const focusedTop = unliftedFocusedTop - nextLift;
      const focusedBottom = unliftedFocusedBottom - nextLift;
      const inset =
        overlap > 0
          ? Math.max(0, bodyBottom - (viewport.bottom - clearance))
          : 0;
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, `${inset}px`);
      if (overlap === 0 && isSheetHeightFrozen && sheet) {
        sheet.style.removeProperty('height');
        isSheetHeightFrozen = false;
      }

      const safeTop = Math.max(bodyTop, viewport.top);
      const safeBottom = Math.min(bodyBottom, viewport.bottom - clearance);
      if (safeBottom <= safeTop) {
        return;
      }

      if (focusedBottom > safeBottom) {
        body.scrollTop += focusedBottom - safeBottom;
      } else if (focusedTop < safeTop) {
        body.scrollTop -= safeTop - focusedTop;
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
    const keyboardSpacer = body.lastElementChild;
    const refreshObservedLayout = () => {
      if (!resizeObserver) {
        return;
      }
      resizeObserver.disconnect();

      const targets = new Set<Element>();
      for (const child of body.children) {
        if (child !== keyboardSpacer) {
          targets.add(child);
        }
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

    const viewport = window.visualViewport;
    document.addEventListener('pointerdown', rememberPointerFocusScroll);
    document.addEventListener('focusout', rememberFocusScroll);
    body.addEventListener('focus', restoreFocusScroll, true);
    body.addEventListener('focusin', handleFocusIn);
    body.addEventListener('focusout', scheduleReveal);
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
      document.removeEventListener('pointerdown', rememberPointerFocusScroll);
      document.removeEventListener('focusout', rememberFocusScroll);
      body.removeEventListener('focus', restoreFocusScroll, true);
      body.removeEventListener('focusin', handleFocusIn);
      body.removeEventListener('focusout', scheduleReveal);
      viewport?.removeEventListener('resize', scheduleReveal);
      viewport?.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
      positioner.style.removeProperty(MOBILE_KEYBOARD_LIFT_VAR);
      if (isSheetHeightFrozen && sheet) {
        sheet.style.removeProperty('height');
      }
    };
  }, [
    bodyRef,
    bottomClearance,
    isOpen,
    positionerRef,
    preserveSheetHeight,
    sheetRef,
  ]);
}
