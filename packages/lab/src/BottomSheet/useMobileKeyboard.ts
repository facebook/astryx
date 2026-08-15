// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMobileKeyboard.ts
 * @input Uses React effects and refs supplied by BottomSheet
 * @output Exports internal useMobileKeyboard hook
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Keeps focused controls inside the visual viewport without resizing the
 * sheet. When the on-screen keyboard covers the stable layout viewport, Tall
 * sheets stay anchored and gain internal scroll range. Shorter sheets keep
 * their measured height and lift by the covered distance, stopping at the
 * visible viewport top. Starting sheet travel or closing the sheet blurs the
 * field and dismisses the keyboard.
 */

import {useEffect, useRef, type RefObject} from 'react';

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
  isPresented: boolean;
  positionerRef: RefObject<HTMLDivElement | null>;
  sheetRef: RefObject<HTMLDivElement | null>;
  tallHeightRatio: number;
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

interface KeyboardGeometry {
  bodyBottom: number;
  hostHeight: number;
  isTall: boolean;
  sheetHeight: number;
  sheetTop: number;
  viewportBottom: number;
  viewportTop: number;
}

interface InlineStyleSnapshot {
  priority: string;
  value: string;
}

interface HeightLock {
  count: number;
  snapshot: InlineStyleSnapshot;
}

const GEOMETRY_TOLERANCE_PX = 1;
const HEIGHT_LOCKS = new WeakMap<HTMLElement, HeightLock>();

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

function restoreCapturedScroll(snapshot: FocusScrollSnapshot): void {
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
}

function captureInlineStyle(
  element: HTMLElement,
  property: string,
): InlineStyleSnapshot {
  return {
    priority: element.style.getPropertyPriority(property),
    value: element.style.getPropertyValue(property),
  };
}

function restoreInlineStyle(
  element: HTMLElement,
  property: string,
  snapshot: InlineStyleSnapshot,
): void {
  if (snapshot.value === '') {
    element.style.removeProperty(property);
  } else {
    element.style.setProperty(property, snapshot.value, snapshot.priority);
  }
}

function lockHeight(element: HTMLElement, height: number): void {
  const currentLock = HEIGHT_LOCKS.get(element);
  if (currentLock) {
    currentLock.count += 1;
  } else {
    HEIGHT_LOCKS.set(element, {
      count: 1,
      snapshot: captureInlineStyle(element, 'height'),
    });
  }
  element.style.height = `${height}px`;
}

function releaseHeight(element: HTMLElement): void {
  const currentLock = HEIGHT_LOCKS.get(element);
  if (!currentLock) {
    return;
  }
  currentLock.count -= 1;
  if (currentLock.count > 0) {
    return;
  }
  restoreInlineStyle(element, 'height', currentLock.snapshot);
  HEIGHT_LOCKS.delete(element);
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
  isPresented,
  positionerRef,
  sheetRef,
  tallHeightRatio,
}: UseMobileKeyboardOptions): void {
  const hasKeyboardLayoutRef = useRef(false);
  const retainKeyboardLayoutRef = useRef(false);

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
      // Keep the current keyboard geometry while focusing the sheet dismisses
      // the keyboard. Viewport resize events unwind that layout as the visual
      // viewport recovers, so the sheet does not jump on the first drag frame.
      retainKeyboardLayoutRef.current = hasKeyboardLayoutRef.current;
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
      retainKeyboardLayoutRef.current = hasKeyboardLayoutRef.current;
      activeElement.blur();
    }
  }, [isOpen, sheetRef]);

  useEffect(() => {
    const body = bodyRef.current;
    const positioner = positionerRef.current;
    const sheet = sheetRef.current;
    if (!isPresented || !body || !positioner || !sheet) {
      return;
    }

    const host = positioner.closest('dialog');
    let isSheetHeightFrozen = false;
    let isHostHeightFrozen = false;
    let keyboardLift = 0;
    let keyboardGeometry: KeyboardGeometry | null = null;
    let pendingFocusScroll: FocusScrollSnapshot | null = null;
    let pendingPointerFocusScroll: FocusScrollSnapshot | null = null;

    const setKeyboardLift = (nextLift: number) => {
      if (nextLift === keyboardLift) {
        return;
      }
      keyboardLift = nextLift;
      if (nextLift <= GEOMETRY_TOLERANCE_PX) {
        positioner.style.removeProperty(MOBILE_KEYBOARD_LIFT_VAR);
      } else {
        positioner.style.setProperty(MOBILE_KEYBOARD_LIFT_VAR, `${nextLift}px`);
      }
    };

    const freezeStableGeometry = (geometry: KeyboardGeometry) => {
      if (!isSheetHeightFrozen && geometry.sheetHeight > 0) {
        lockHeight(sheet, geometry.sheetHeight);
        isSheetHeightFrozen = true;
      }
      if (!isHostHeightFrozen && host && geometry.hostHeight > 0) {
        lockHeight(host, geometry.hostHeight);
        isHostHeightFrozen = true;
      }
    };

    const releaseStableGeometry = () => {
      if (isSheetHeightFrozen) {
        releaseHeight(sheet);
      }
      if (isHostHeightFrozen && host) {
        releaseHeight(host);
      }
      isSheetHeightFrozen = false;
      isHostHeightFrozen = false;
    };

    const clearKeyboardLayout = (resetGeometry = true) => {
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
      setKeyboardLift(0);
      releaseStableGeometry();
      if (resetGeometry) {
        keyboardGeometry = null;
      }
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };

    const captureKeyboardGeometry = (
      referenceViewport = getVisualViewportBounds(),
    ): KeyboardGeometry => {
      const sheetRect = sheet.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      // Positioner lift participates in client rects. Add it back so snapshots
      // always describe the sheet's unadjusted rendered geometry.
      const sheetTop = sheetRect.top + keyboardLift;
      const sheetBottom = sheetRect.bottom + keyboardLift;
      const visibleSheetHeight = Math.max(
        0,
        Math.min(sheetBottom, referenceViewport.bottom) -
          Math.max(sheetTop, referenceViewport.top),
      );
      const viewportHeight = referenceViewport.bottom - referenceViewport.top;
      return {
        bodyBottom: bodyRect.bottom + keyboardLift,
        hostHeight: host?.getBoundingClientRect().height ?? 0,
        isTall:
          visibleSheetHeight >=
          viewportHeight * tallHeightRatio - GEOMETRY_TOLERANCE_PX,
        sheetHeight: sheetRect.height,
        sheetTop,
        viewportBottom: referenceViewport.bottom,
        viewportTop: referenceViewport.top,
      };
    };

    const rememberKeyboardGeometry = () => {
      if (!keyboardGeometry) {
        keyboardGeometry = captureKeyboardGeometry();
      }
    };

    const applyKeyboardGeometry = (
      geometry: KeyboardGeometry,
    ): {bottom: number; top: number} | null => {
      const viewport = getVisualViewportBounds();
      // Compare against the viewport captured before keyboard presentation,
      // not window.innerHeight. Browser chrome can make those differ even when
      // the device has no on-screen keyboard obstruction.
      if (viewport.bottom >= geometry.viewportBottom - GEOMETRY_TOLERANCE_PX) {
        // On the focus frame the viewport has not shrunk yet. Preserve that
        // pre-keyboard snapshot so the following resize can compare against
        // it. Once an applied keyboard layout recovers, end the session.
        clearKeyboardLayout(hasKeyboardLayoutRef.current);
        return null;
      }
      const overlap = Math.max(0, geometry.bodyBottom - viewport.bottom);
      if (overlap <= GEOMETRY_TOLERANCE_PX) {
        clearKeyboardLayout();
        return null;
      }

      freezeStableGeometry(geometry);
      // Shorter sheets move by the covered distance so their bottom edge
      // clears the keyboard whenever space allows. Tall sheets never move.
      // Both cases stop at the visible viewport top and use internal scrolling
      // for any remaining overlap.
      const maxLift = Math.max(0, geometry.sheetTop - viewport.top);
      const nextLift = geometry.isTall ? 0 : Math.min(overlap, maxLift);
      setKeyboardLift(nextLift);

      const bodyRect = body.getBoundingClientRect();
      const inset = Math.max(
        0,
        bodyRect.bottom - (viewport.bottom - bottomClearance),
      );
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, `${inset}px`);
      hasKeyboardLayoutRef.current = true;
      return viewport;
    };

    // Focus during the trusted pointer gesture with preventScroll so mobile
    // browsers present the keyboard without first panning the page or dialog.
    // The pointer event remains untouched, preserving native click and caret
    // behavior against the now-focused control.
    const preventPointerFocusScroll = (event: PointerEvent) => {
      const control = findTextEntryControl(event.target, body);
      if (!control || control === document.activeElement) {
        pendingPointerFocusScroll = null;
        return;
      }
      pendingPointerFocusScroll = captureFocusScroll(control);
      rememberKeyboardGeometry();
      control.focus({preventScroll: true});
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
        pendingPointerFocusScroll?.target === control
          ? pendingPointerFocusScroll
          : pendingFocusScroll?.target === control
            ? pendingFocusScroll
            : null;
      pendingFocusScroll = null;
      pendingPointerFocusScroll = null;
      if (!snapshot || snapshot.target !== control) {
        return;
      }
      restoreCapturedScroll(snapshot);
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
      rememberKeyboardGeometry();
      const viewport = keyboardGeometry
        ? applyKeyboardGeometry(keyboardGeometry)
        : null;
      if (!viewport) {
        return;
      }

      const measuredBodyRect = body.getBoundingClientRect();
      const measuredFocusedRect = activeElement.getBoundingClientRect();
      const safeTop = Math.max(measuredBodyRect.top, viewport.top);
      const safeBottom = Math.min(
        measuredBodyRect.bottom,
        viewport.bottom - bottomClearance,
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
    const handleFocusIn = (event: FocusEvent) => {
      if (findTextEntryControl(event.target, body)) {
        rememberKeyboardGeometry();
      }
      refreshObservedLayout();
      scheduleReveal();
    };
    const handleSheetTransitionEnd = (event: TransitionEvent) => {
      if (event.target === sheet && event.propertyName === 'transform') {
        const activeElement = document.activeElement;
        if (
          keyboardGeometry &&
          activeElement instanceof HTMLElement &&
          body.contains(activeElement) &&
          isTextEntryControl(activeElement)
        ) {
          const referenceViewport = {
            bottom: keyboardGeometry.viewportBottom,
            top: keyboardGeometry.viewportTop,
          };
          keyboardGeometry = captureKeyboardGeometry(referenceViewport);
        }
        scheduleReveal();
      }
    };

    const viewport = window.visualViewport;
    // Capture before consumer handlers so stopPropagation cannot opt the
    // browser back into native focus panning accidentally.
    document.addEventListener('pointerdown', preventPointerFocusScroll, true);
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
        preventPointerFocusScroll,
        true,
      );
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
      positioner.style.removeProperty(MOBILE_KEYBOARD_LIFT_VAR);
      releaseStableGeometry();
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };
  }, [
    bodyRef,
    bottomClearance,
    isPresented,
    positionerRef,
    sheetRef,
    tallHeightRatio,
  ]);
}
