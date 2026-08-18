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
 * it for us. On iOS that reveal scrolls the DOCUMENT, and a fixed sheet travels
 * with it, so the whole page lurches. The reveal is attached to the focus
 * operation, which is where it can be refused: take the focus transition over
 * on the capture-phase blur, deliver it with preventScroll, and bring the
 * control into view with the sheet's own scroller afterwards. Every route in —
 * a tap, the keyboard's Next, Tab, a programmatic focus() — passes through that
 * one transition.
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
    const ownsFocusTransitions = isIOSWebKit();

    const clearKeyboardLayout = () => {
      body.style.setProperty(MOBILE_KEYBOARD_INSET_VAR, '0px');
      keyboardGeometry = null;
      documentScrollAtKeyboard = null;
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

    // Take the focus transition over before the browser performs it.
    //
    // `blur` is dispatched in the capture phase ahead of the browser's own
    // focus step, and it names the destination in `relatedTarget`. Focusing it
    // here with preventScroll settles the transition: the browser's step finds
    // the element already active, so it dispatches nothing further and there is
    // no reveal to race. Then bring the control into view with the sheet's own
    // scroller, which never moves anything outside the sheet.
    let isClaimingFocus = false;
    const claimFocusTransition = (event: FocusEvent) => {
      // Delivering the focus below makes the browser run its own transition,
      // whose blur re-enters here naming the same destination. Claiming that
      // one too would deliver the focus a second time.
      if (!isFullyExpandedRef.current || isClaimingFocus) {
        return;
      }
      const destination = findTextEntryControl(event.relatedTarget, body);
      if (destination) {
        if (destination !== document.activeElement) {
          // Revealing the field is not this handler's job: focusing it raises
          // focusin, and the viewport resize that follows the keyboard raises
          // another — both already schedule the reveal below, which knows the
          // safe area and scrolls only the sheet's own body.
          isClaimingFocus = true;
          try {
            destination.focus({preventScroll: true});
          } finally {
            isClaimingFocus = false;
          }
        }
        return;
      }

      // Focus left for nothing — the keyboard's Done button parks it on the
      // body. Park it on the sheet instead, so re-tapping the same field is
      // still a transition this handler sees. Left on the body, the field is
      // already `document.activeElement` on the next tap, no blur fires, and
      // the browser reveals it its own way.
      const origin = findTextEntryControl(event.target, body);
      if (origin && !event.relatedTarget) {
        sheet?.focus({preventScroll: true});
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
    let containmentStyle: HTMLStyleElement | null = null;
    if (ownsFocusTransitions) {
      // Capture phase, and `blur` rather than `focusout`: both are dispatched
      // before the browser's own focus step, which is the only window in which
      // the transition can still be claimed.
      document.addEventListener('blur', claimFocusTransition, true);

      // A scroll that reaches the end of any nested scroller chains to the
      // document, which moves the fixed sheet with it. Current iOS latches
      // this at touchstart, too late for a listener to add — so it ships as a
      // stylesheet, in its own layer so a consumer's own rules still win.
      containmentStyle = document.createElement('style');
      containmentStyle.textContent = '@layer {*{overscroll-behavior:contain}}';
      document.head.prepend(containmentStyle);
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
      if (ownsFocusTransitions) {
        document.removeEventListener('blur', claimFocusTransition, true);
        containmentStyle?.remove();
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
