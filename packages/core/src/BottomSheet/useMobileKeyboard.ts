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

// Where the keyboard starts, in client coordinates. The keyboard covers the
// bottom of the LAYOUT viewport, so its top edge sits at `visualViewport.height`
// — and stays there when the browser pans the page to reveal a field, because a
// pan slides the window over the page without moving the keyboard.
//
// Reading `offsetTop + height` instead makes the obstruction appear to shrink as
// the pan grows. A fully expanded Tall sheet — the only shape this hook runs in
// — is pinned to the layout viewport bottom, so at full pan the obstruction
// reads as zero: the sheet concludes the keyboard is gone, drops the scroll
// range it added, and disarms the defenses that would have caught the next pan.
// One pan then latches the sheet into the unprotected behavior for good.
function getUnobstructedBounds(): {top: number; bottom: number} {
  return {
    top: 0,
    bottom: window.visualViewport?.height ?? window.innerHeight,
  };
}

// The keyboard is gone once the visible band reaches the layout viewport bottom.
function isVisualViewportRecovered(): boolean {
  return getUnobstructedBounds().bottom >= window.innerHeight - 0.5;
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
    let documentScrollAtKeyboard: {x: number; y: number} | null = null;
    let pendingFocusScroll: FocusScrollSnapshot | null = null;
    let pendingPointerFocusScroll: FocusScrollSnapshot | null = null;
    let pendingTouchFocus: PendingTouchFocus | null = null;
    const preventFocusScroll = isIOSWebKit();

    const clearKeyboardLayout = () => {
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
      keyboardGeometry = null;
      documentScrollAtKeyboard = null;
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
        // Not 'auto': that defers to the element's computed `scroll-behavior`,
        // so a consumer's `scroll-behavior: smooth` would animate a scroll this
        // hook needs to land in the same frame.
        behavior: smoothly && !reduceMotion ? 'smooth' : 'instant',
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
      const viewport = getUnobstructedBounds();
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
      const viewport = getUnobstructedBounds();
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
      // Only the primary contact can arm below, but a secondary one — a
      // resting thumb, a palm, a second finger anywhere on the page — would
      // still fall through and null out the arming of the finger already
      // mid-tap on a field. Its pointerup would then find nothing pending and
      // hand the focus back to the browser, whose reveal pans the page.
      if (event.isPrimary === false) {
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
      // A lift by some other contact — the resting thumb, the palm — is not
      // this tap ending. Leave the arming alone: consuming it here is the same
      // disarm the pointerdown guard above prevents, at the other end of the
      // gesture.
      if (pending != null && pending.pointerId !== event.pointerId) {
        return;
      }
      pendingTouchFocus = null;
      if (
        !pending ||
        !isFullyExpandedRef.current ||
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
      // A snapshot restores what a scroll container scrolled, which is not what
      // this transition costs: WebKit reveals a destination behind the keyboard
      // by scrolling the page under a fixed sheet. Reach the destination first —
      // in the same frame, so the reveal finds nothing left to do.
      //
      // The tap path is excluded: preventTouchFocusScroll has already focused
      // with preventScroll there, so a head start would only replace that
      // path's gentle post-focus glide with a snap.
      if (
        hasKeyboardLayoutRef.current &&
        pendingPointerFocusScroll?.target !== control
      ) {
        scrollControlIntoSafeArea(control, false);
      }
      // Snapshot after that scroll: the restore below undoes the browser's
      // reveal, not our own head start.
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
      const viewport = getUnobstructedBounds();
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
      // Where the document sits with the keyboard up and nothing yet shifted:
      // the position handleDocumentScroll returns to. Captured on the
      // transition only — a reveal that runs after the browser has already
      // scrolled would otherwise record the shifted position as correct.
      if (overlap > 0 && !hasKeyboardLayoutRef.current) {
        documentScrollAtKeyboard = {x: window.scrollX, y: window.scrollY};
      }
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

    // useScrollLock pins the body, which stops the user scrolling the page but
    // not the browser: to reveal a focused control the browser scrolls the
    // DOCUMENT, and every fixed-position element travels with it — the sheet,
    // its scrim, the page behind. That is the whole-page shift, and because it
    // is a real document scroll it can simply be put back, on the event that
    // reports it, before the frame is painted. Then bring the control into
    // view with the sheet's own scroller, which moves nothing outside the
    // sheet. This catches every route in — tap, keyboard Next, programmatic
    // focus, and the reveal the browser performs when the app is resumed with
    // a field still focused — because it corrects the outcome rather than
    // racing the cause.
    const handleDocumentScroll = () => {
      const expected = documentScrollAtKeyboard;
      if (
        expected == null ||
        (window.scrollX === expected.x && window.scrollY === expected.y)
      ) {
        return;
      }
      window.scrollTo(expected.x, expected.y);
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        body.contains(activeElement) &&
        isTextEntryControl(activeElement)
      ) {
        scrollControlIntoSafeArea(activeElement, false);
      }
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
    window.addEventListener('scroll', handleDocumentScroll);
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
      window.removeEventListener('scroll', handleDocumentScroll);
      window.removeEventListener('resize', scheduleReveal);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      body.style.removeProperty(MOBILE_KEYBOARD_INSET_VAR);
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };
  }, [bodyRef, bottomClearance, isEnabled, isPresented, sheetRef]);
}
