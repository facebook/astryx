// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMobileKeyboard.ts
 * @input Uses React effects and refs supplied by BottomSheet
 * @output Exports internal useMobileKeyboard hook
 * @position Internal to BottomSheet; not exported from the core entry point
 *
 * Gives a fully expanded, explicitly Tall sheet a keyboard-aware internal
 * scroll range while leaving the sheet itself stationary. Shorter detents and
 * other heights opt out entirely. Starting Tall-sheet travel or closing the
 * sheet blurs the field and dismisses the keyboard.
 *
 * Every route into a field also has to reach it without the browser revealing
 * it for us: on iOS that reveal pans the visual viewport, which shifts the
 * whole page out from under a stationary sheet. A tap is pre-empted by focusing
 * with preventScroll; a transition the browser drives itself cannot be, so the
 * destination is scrolled into the safe area before focus lands instead.
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
  bodyRef: RefObject<HTMLElement | null>;
  bottomClearance: number;
  isEnabled: boolean;
  isFullyExpanded: boolean;
  isSheetTraveling: boolean;
  isOpen: boolean;
  isPresented: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
}

interface KeyboardGeometry {
  bodyBottom: number;
}

interface FocusScrollSnapshot {
  target: HTMLElement;
  elements: {
    element: HTMLElement;
    scrollLeft: number;
    scrollTop: number;
  }[];
  windowX: number;
  windowY: number;
}

interface PendingTouchFocus {
  clientX: number;
  clientY: number;
  control: HTMLElement;
  pointerDown: PointerEvent;
  pointerId: number;
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

// The keyboard is gone once the visual viewport is as tall as the layout
// viewport again. Height is the only pan-invariant signal for that: while iOS
// holds the viewport panned up to reveal a field, the viewport's *bottom*
// already sits at the layout viewport bottom with the keyboard still on
// screen, so reading the bottom mistakes a pan for a dismissal.
function isVisualViewportRecovered(): boolean {
  const height = window.visualViewport?.height ?? window.innerHeight;
  return height >= window.innerHeight - 0.5;
}

function isIOSWebKit(): boolean {
  const userAgent = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (userAgent.includes('Macintosh') && window.navigator.maxTouchPoints > 1)
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
      !NON_TEXT_INPUT_TYPES.has(
        (element.getAttribute('type') ?? 'text').toLowerCase(),
      )
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
  isFullyExpanded,
  isSheetTraveling,
  isOpen,
  isPresented,
  sheetRef,
}: UseMobileKeyboardOptions): void {
  const hasKeyboardLayoutRef = useRef(false);
  const retainKeyboardLayoutRef = useRef(false);
  const isActiveRef = useRef(isOpen);
  const isFullyExpandedRef = useRef(isFullyExpanded);
  isActiveRef.current = isOpen;
  isFullyExpandedRef.current = isFullyExpanded;

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
    let pendingFocusScroll: FocusScrollSnapshot | null = null;
    let pendingPointerFocusScroll: FocusScrollSnapshot | null = null;
    let pendingTouchFocus: PendingTouchFocus | null = null;
    const preventFocusScroll = isIOSWebKit();

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

    // Scroll `control` into the part of the body the keyboard leaves visible.
    // Reads live geometry every time, so it serves both the reveal after focus
    // lands and the head start taken before a transition the browser drives.
    const scrollControlIntoSafeArea = (
      control: HTMLElement,
      smoothly: boolean,
    ) => {
      const measuredBodyRect = body.getBoundingClientRect();
      const measuredControlRect = control.getBoundingClientRect();
      const viewport = getVisualViewportBounds();
      const overlap = Math.max(0, measuredBodyRect.bottom - viewport.bottom);
      const clearance = overlap > 0 ? bottomClearance : 0;
      const safeTop = Math.max(measuredBodyRect.top, viewport.top);
      const safeBottom = Math.min(
        measuredBodyRect.bottom,
        viewport.bottom - clearance,
      );
      if (safeBottom <= safeTop) {
        return;
      }

      if (measuredControlRect.bottom > safeBottom) {
        scrollBodyBy(measuredControlRect.bottom - safeBottom, smoothly);
      } else if (measuredControlRect.top < safeTop) {
        scrollBodyBy(measuredControlRect.top - safeTop, smoothly);
      }
    };

    const applyKeyboardGeometry = (geometry: KeyboardGeometry) => {
      const viewport = getVisualViewportBounds();
      // A collapsed detent can extend the body below the layout viewport even
      // after the keyboard closes, so body overlap alone cannot identify
      // recovery. Once the visual viewport is full height again, release the
      // retained keyboard layout unconditionally.
      if (isVisualViewportRecovered()) {
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

    // Wait until pointerup confirms a touch was a tap, then focus before the
    // native click so preventScroll suppresses page panning while the click
    // still owns caret placement. Holding the original pointerdown event lets
    // consumer preventDefault calls remain authoritative after capture.
    const rememberPointerFocusScroll = (event: PointerEvent) => {
      // A second contact — a resting thumb, a palm, a finger anywhere else on
      // the page — must not disarm the one already mid-tap on a field. Without
      // this, that tap's pointerup finds nothing pending, falls through to the
      // browser's own focus, and the reveal pans the page.
      if (
        pendingTouchFocus != null &&
        event.pointerId !== pendingTouchFocus.pointerId
      ) {
        return;
      }
      const control = findTextEntryControl(event.target, body);
      pendingPointerFocusScroll =
        isFullyExpandedRef.current &&
        control &&
        control !== document.activeElement
          ? captureFocusScroll(control)
          : null;
      pendingTouchFocus =
        isActiveRef.current &&
        isFullyExpandedRef.current &&
        event.pointerType === 'touch' &&
        event.isPrimary !== false &&
        control &&
        control !== document.activeElement
          ? {
              clientX: event.clientX,
              clientY: event.clientY,
              control,
              pointerDown: event,
              pointerId: event.pointerId,
            }
          : null;
    };
    const clearPendingTouchFocus = () => {
      if (pendingPointerFocusScroll?.target === pendingTouchFocus?.control) {
        pendingPointerFocusScroll = null;
      }
      pendingTouchFocus = null;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (
        pendingTouchFocus?.pointerId === event.pointerId &&
        Math.hypot(
          event.clientX - pendingTouchFocus.clientX,
          event.clientY - pendingTouchFocus.clientY,
        ) > TOUCH_FOCUS_MOVE_THRESHOLD
      ) {
        clearPendingTouchFocus();
      }
    };
    const handlePointerCancel = (event: PointerEvent) => {
      if (pendingTouchFocus?.pointerId === event.pointerId) {
        clearPendingTouchFocus();
      }
    };
    const preventTouchFocusScroll = (event: PointerEvent) => {
      const pending = pendingTouchFocus;
      pendingTouchFocus = null;
      if (
        !pending ||
        !isFullyExpandedRef.current ||
        pending.pointerId !== event.pointerId ||
        pending.pointerDown.defaultPrevented ||
        event.defaultPrevented ||
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

    // Keyboard and programmatic focus transitions cannot supply preventScroll.
    // Restore their pre-focus scroll positions without re-entering the focus
    // lifecycle, so consumer focus and blur callbacks remain single events.
    const rememberFocusScroll = (event: FocusEvent) => {
      const control = findTextEntryControl(event.relatedTarget, body);
      if (!isFullyExpandedRef.current || !control) {
        pendingFocusScroll = null;
        return;
      }
      // Snapshots restore what a scroll container scrolled, and that is not
      // what a browser-driven transition costs us here. When WebKit reveals a
      // destination sitting behind the keyboard it pans the visual viewport,
      // and nothing can put that back: offsetTop is read-only, the dialog is
      // fixed, and the page beneath it is scroll-locked. So reach the
      // destination first and leave the reveal with nothing to do. It has to
      // be instant to win that race, and it only runs while a keyboard is
      // actually measured, so unobstructed desktop and hardware-keyboard focus
      // keeps behaving exactly as before.
      if (hasKeyboardLayoutRef.current) {
        scrollControlIntoSafeArea(control, false);
      }
      // Snapshot after that scroll, never before: the restore below is meant to
      // undo the browser's reveal, not our own head start.
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
      if (snapshot?.target === control) {
        restoreScrollSnapshot(snapshot);
      }
    };

    const revealFocusedControl = () => {
      const activeElement = document.activeElement;
      if (
        !isFullyExpandedRef.current ||
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

      scrollControlIntoSafeArea(activeElement, overlap > 0);
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
      document.addEventListener(
        'pointerdown',
        rememberPointerFocusScroll,
        true,
      );
      document.addEventListener('pointermove', handlePointerMove, true);
      document.addEventListener('pointercancel', handlePointerCancel, true);
      document.addEventListener('pointerup', preventTouchFocusScroll);
      document.addEventListener('focusout', rememberFocusScroll);
      body.addEventListener('focus', restoreFocusScroll, true);
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
        document.removeEventListener(
          'pointerdown',
          rememberPointerFocusScroll,
          true,
        );
        document.removeEventListener('pointermove', handlePointerMove, true);
        document.removeEventListener(
          'pointercancel',
          handlePointerCancel,
          true,
        );
        document.removeEventListener('pointerup', preventTouchFocusScroll);
        document.removeEventListener('focusout', rememberFocusScroll);
        body.removeEventListener('focus', restoreFocusScroll, true);
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
