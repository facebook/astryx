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
  sheetRef: RefObject<HTMLDivElement | null>;
}

interface FocusScrollSnapshot {
  target: HTMLElement;
  elements: Array<{
    element: HTMLElement;
    scrollLeft: number;
    scrollTop: number;
  }>;
  visualViewportOffsetTop: number;
  windowX: number;
  windowY: number;
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
    visualViewportOffsetTop: window.visualViewport?.offsetTop ?? 0,
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
    let pendingTouchFocusTarget: HTMLElement | null = null;
    let guardedFocusScroll: FocusScrollSnapshot | null = null;
    let focusScrollGuardTimer: ReturnType<typeof setTimeout> | null = null;

    const clearKeyboardLayout = () => {
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
      keyboardGeometry = null;
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };

    const restoreScrollSnapshot = (
      snapshot: FocusScrollSnapshot,
      restoreInsideBody: boolean,
      forceWindowRestore = false,
    ) => {
      for (const {element, scrollLeft, scrollTop} of snapshot.elements) {
        if (
          !restoreInsideBody &&
          (element === body || body.contains(element))
        ) {
          continue;
        }
        if (element.scrollLeft !== scrollLeft) {
          element.scrollLeft = scrollLeft;
        }
        if (element.scrollTop !== scrollTop) {
          element.scrollTop = scrollTop;
        }
      }
      const didVisualViewportMove =
        forceWindowRestore &&
        (window.visualViewport?.offsetTop ?? 0) !==
          snapshot.visualViewportOffsetTop;
      if (
        didVisualViewportMove ||
        window.scrollX !== snapshot.windowX ||
        window.scrollY !== snapshot.windowY
      ) {
        window.scrollTo(snapshot.windowX, snapshot.windowY);
      }
    };

    const guardFocusScroll = (snapshot: FocusScrollSnapshot) => {
      guardedFocusScroll = snapshot;
      if (focusScrollGuardTimer != null) {
        clearTimeout(focusScrollGuardTimer);
      }
      // WebKit can pan the visual viewport after focus while the keyboard is
      // animating. Keep the page pinned through that delayed native work, but
      // release the guard promptly so normal page scrolling remains available.
      focusScrollGuardTimer = setTimeout(() => {
        guardedFocusScroll = null;
        focusScrollGuardTimer = null;
      }, 1000);
    };

    const restoreGuardedPageScroll = (forceWindowRestore = false) => {
      if (guardedFocusScroll) {
        // Do not restore the body or anything inside it here: revealFocusedControl
        // owns that intentional internal scrolling. Only pin outer ancestors
        // and the page against Safari's delayed focus pan.
        restoreScrollSnapshot(guardedFocusScroll, false, forceWindowRestore);
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

    // Let the browser perform touch/pointer focus normally so caret placement,
    // click behavior, and the focus lifecycle stay native. Capture scroll
    // positions before its default focus action so they can be restored below.
    const rememberPointerFocusScroll = (event: Event) => {
      const control = findTextEntryControl(event.target, body);
      pendingPointerFocusScroll =
        control && control !== document.activeElement
          ? captureFocusScroll(control)
          : null;
    };
    const rememberTouchFocusScroll = (event: TouchEvent) => {
      rememberPointerFocusScroll(event);
      pendingTouchFocusTarget = findTextEntryControl(event.target, body);
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
        pendingTouchFocusTarget = null;
        return;
      }

      restoreScrollSnapshot(snapshot, true);
      const viewport = getVisualViewportBounds();
      const isTouchDevice =
        navigator.maxTouchPoints > 0 ||
        window.matchMedia?.('(pointer: coarse)').matches === true;
      if (
        pendingTouchFocusTarget === control ||
        isTouchDevice ||
        viewport.bottom < window.innerHeight - 0.5
      ) {
        guardFocusScroll(snapshot);
      }
      pendingTouchFocusTarget = null;
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
    document.addEventListener('touchstart', rememberTouchFocusScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener('focusout', rememberFocusScroll);
    body.addEventListener('focus', restoreFocusScroll, true);
    body.addEventListener('focusin', handleFocusIn);
    body.addEventListener('focusout', scheduleReveal);
    sheet?.addEventListener('transitionend', handleSheetTransitionEnd);
    const handleViewportResize = () => {
      restoreGuardedPageScroll();
      scheduleReveal();
    };
    const handleViewportScroll = () => {
      // visualViewport scrolling may not update window.scrollY, so force the
      // layout viewport back to the captured coordinates.
      restoreGuardedPageScroll(true);
      scheduleReveal();
    };
    const handleWindowScroll = () => {
      restoreGuardedPageScroll();
    };
    const handleDocumentScroll = (event: Event) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (target === body || body.contains(target))
      ) {
        return;
      }
      restoreGuardedPageScroll();
    };
    viewport?.addEventListener('resize', handleViewportResize);
    viewport?.addEventListener('scroll', handleViewportScroll);
    window.addEventListener('resize', handleViewportResize);
    window.addEventListener('scroll', handleWindowScroll);
    document.addEventListener('scroll', handleDocumentScroll, true);
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
      document.removeEventListener(
        'touchstart',
        rememberTouchFocusScroll,
        true,
      );
      document.removeEventListener('focusout', rememberFocusScroll);
      body.removeEventListener('focus', restoreFocusScroll, true);
      body.removeEventListener('focusin', handleFocusIn);
      body.removeEventListener('focusout', scheduleReveal);
      sheet?.removeEventListener('transitionend', handleSheetTransitionEnd);
      viewport?.removeEventListener('resize', handleViewportResize);
      viewport?.removeEventListener('scroll', handleViewportScroll);
      window.removeEventListener('resize', handleViewportResize);
      window.removeEventListener('scroll', handleWindowScroll);
      document.removeEventListener('scroll', handleDocumentScroll, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (focusScrollGuardTimer != null) {
        clearTimeout(focusScrollGuardTimer);
      }
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };
  }, [bodyRef, bottomClearance, isEnabled, isOpen, sheetRef]);
}
