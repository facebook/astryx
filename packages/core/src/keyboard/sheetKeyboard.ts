// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file sheetKeyboard.ts
 * @input The keyboard module's measurements and focus routes
 *   (keyboardHeight.ts), React effects and refs, the touch query, the layout
 *   viewport's height (utils/layoutViewport.ts), the compositor animator, the
 *   keyboard layout guide's transitions and rideKeyboard
 * @output Exports BottomSheet's useSheetKeyboard hook
 * @position BottomSheet's use of the on-screen keyboard module (spec:AST-099
 *   FR3, FR4, FR5, FR8). Apart from keyboardHeight.ts, so code that only
 *   reads the keyboard there never loads the sheet's ride or the animator.
 *   Internal to core
 *
 * BottomSheet's hook (`useSheetKeyboard`) gives a fully expanded, explicitly
 * Tall sheet a keyboard-aware internal scroll range while leaving the sheet
 * itself stationary: it returns the room the keyboard takes at the end of the
 * body, which the sheet lays out through a functional style on its own body,
 * with no CSS custom property of its own (FR3). It takes focus moves over
 * only under a coarse primary pointer: a desktop browser keeps its own focus
 * (spec:AST-017 FR59). Shorter detents and other heights opt out entirely.
 * Starting Tall-sheet travel or closing the sheet blurs the field and
 * dismisses the keyboard (FR5). Where the keyboard layout guide publishes the
 * keyboard's own slide (Gboard's, in Chrome on Android), the sheet rides it
 * (FR8): a reveal scrolls the body at once and its content rides up from
 * where it was on the show's curve, and through a hide the room stays while
 * the content rides down by the scroll the room's drop takes back; at rest
 * the room drops and the translate clears in one commit.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {useMediaQuery} from '../hooks/useMediaQuery';
import {TOUCH_QUERY} from '../utils/touchPresentation';
import {animatorFor, type Animator} from '../motion/animator';
import {layoutViewportHeight} from '../utils/layoutViewport';
import {getKeyboardLayoutGuide, keyboardProfileOf} from './keyboardLayoutGuide';
import {rideKeyboard} from './rideKeyboard';
import type {KeyboardTransition} from './keyboardModel';
import {
  KEYBOARD_EPSILON,
  findTextEntryControl,
  getKeyboardHeight,
  isKeyboardMeasurable,
  isTextEntryControl,
  refuseFocusReveal,
  subscribeKeyboardHeight,
  watchRevealPan,
} from './keyboardHeight';
import {useEffect, useRef, useState, type RefObject} from 'react';
import {flushSync} from 'react-dom';

interface UseSheetKeyboardOptions {
  bodyRef: RefObject<HTMLElement | null>;
  bottomClearance: number;
  isEnabled: boolean;
  isFullyExpanded: boolean;
  isPageScrollLocked: boolean;
  isSheetTraveling: boolean;
  isOpen: boolean;
  isPresented: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
}

interface KeyboardGeometry {
  bodyBottom: number;
}

// Where the keyboard's top is in the layout viewport.
function getObstructionTop(): number {
  return layoutViewportHeight(window) - getKeyboardHeight(window);
}

// Windows whose browser revealed a focused field itself right after the
// keyboard's report, by panning the visual viewport to it (measured in Firefox
// for Android: 34 to 39 ms after the report, whenever the field was still under
// the keyboard). Recorded from the behavior, never from the user agent; a sheet
// there reveals its field at once in the report's own frame from then on.
let revealsAtReport = new WeakSet<Window>();

/** Forgets every window's recorded reveal, for tests. */
export function __resetRevealsAtReportForTest(): void {
  revealsAtReport = new WeakSet<Window>();
}

// How far the body runs under the keyboard's top, CSS px. The keyboard's top
// is measured from `innerHeight`, which is a whole number of CSS px, while
// the visual viewport and element rects are fractional: on the Android
// emulator Chrome's visual viewport is 754.3 px over a 754 px layout
// viewport, so a sheet sized to it ends 0.3 px below `innerHeight` with no
// keyboard up. An overlap under one CSS px is that integer precision of
// `innerHeight` (KEYBOARD_EPSILON), not an obstruction.
function overlapOf(bodyBottom: number, obstructionTop: number): number {
  const overlap = bodyBottom - obstructionTop;
  return overlap > KEYBOARD_EPSILON ? overlap : 0;
}

// The keyboard is gone once its height is back to 0.
function isVisualViewportRecovered(): boolean {
  return getKeyboardHeight(window) <= 0.5;
}

/**
 * BottomSheet's use of the keyboard: a Tall sheet's scroll range, its focus
 * moves and its dismissal (see the file header). Returns the room the
 * keyboard takes at the end of the body, CSS px (0 without a keyboard).
 */
export function useSheetKeyboard({
  bodyRef,
  bottomClearance,
  isEnabled,
  isFullyExpanded,
  isPageScrollLocked,
  isSheetTraveling,
  isOpen,
  isPresented,
  sheetRef,
}: UseSheetKeyboardOptions): number {
  // The room the keyboard takes at the end of the body, CSS px: the sheet lays
  // it out through a functional style on its own body (spec:AST-099 FR3).
  const [keyboardInset, setKeyboardInset] = useState(0);
  const hasKeyboardLayoutRef = useRef(false);
  const retainKeyboardLayoutRef = useRef(false);
  const isFullyExpandedRef = useRef(isFullyExpanded);
  const isOpenRef = useRef(isOpen);
  isFullyExpandedRef.current = isFullyExpanded;
  isOpenRef.current = isOpen;
  // Touch-only work (the ride, the reveal-pan watch) attaches only under a
  // coarse primary pointer (the touch query): under a fine one no touch
  // listener is registered (architecture INV13, spec:AST-094 FR24).
  const isTouch = useMediaQuery(TOUCH_QUERY, false);

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
    // Where a smooth reveal under way is taking the body's scrollTop.
    let smoothTarget: number | null = null;
    // The room laid out at the end of the body, and the scroll range it
    // adds to the body (what its drop takes back), CSS px. The two can
    // differ: Chrome 124 added 344 px of range for a 360 px room.
    let room = 0;
    let roomRange = 0;
    // FR8: where the keyboard layout guide publishes the keyboard's own slide
    // (Gboard's, in Chrome on Android), the sheet's content rides it. Only
    // under a coarse primary pointer and on Chrome's schedule: under a fine
    // pointer nothing of the ride attaches, and on Safari's (iOS Safari,
    // Firefox for Android) the keyboard moves on UIKit's spring, which the
    // sheet does not ride, so the guide and its frame watch never start; the
    // room follows the reports. The guide is subscribed before the keyboard
    // module below, so a report's transition is published before the reveal
    // reads it.
    const guide =
      isTouch && keyboardProfileOf(window) === 'chromium'
        ? getKeyboardLayoutGuide(window)
        : null;
    const contentAnimator = (): Animator | null => {
      const content = body.firstElementChild;
      return guide != null && content instanceof HTMLElement
        ? animatorFor(content)
        : null;
    };
    // How far a ride has the content from where its layout puts it, as the
    // page draws it now: the same frame a control's rect is read in.
    const rideOffset = () => {
      const content = body.firstElementChild;
      if (!(content instanceof HTMLElement)) {
        return 0;
      }
      const translate = getComputedStyle(content).translate;
      return parseFloat(translate.split(' ')[1] ?? '') || 0;
    };
    // The keyboard's show the guide plays on its slide right now, if any.
    const showOnSlide = (): KeyboardTransition | null => {
      const transition = guide?.transition;
      return transition != null &&
        transition.kind === 'show' &&
        transition.animated &&
        transition.curve != null &&
        performance.now() < transition.start + transition.curve.durationMs
        ? transition
        : null;
    };
    // A hide the room is held through (see holdRoomThrough).
    let heldHide: {readonly release: () => void} | null = null;
    let documentScrollAtKeyboard: {x: number; y: number} | null = null;
    // FR6: where this window measures the keyboard, never by user agent, and
    // only under a coarse primary pointer: under a fine one no touch-only
    // listener is registered (architecture INV13, spec:AST-094 FR24).
    const ownsFocusTransitions = isTouch && isKeyboardMeasurable(window);
    // Desktop Safari and Firefox measure too, but show no on-screen keyboard
    // and keep the browser's own focus (spec:AST-017 FR59, DEC-25): a window
    // switch must not park focus on the sheet. Read on every blur, so a
    // tablet that docks a mouse follows its primary pointer.
    const isTouchScreen = () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia(TOUCH_QUERY).matches;

    // Lays the inset out before anything measures or scrolls the body: the
    // reveal scrolls into the room it adds in the same frame.
    const writeInset = (inset: number) => {
      const changes = inset !== room;
      const rangeBefore = changes ? body.scrollHeight : 0;
      room = inset;
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the reveal scrolls into this room in the same frame, so it must be laid out before the reveal measures
      flushSync(() => setKeyboardInset(inset));
      if (changes) {
        roomRange =
          inset === 0
            ? 0
            : Math.max(0, roomRange + body.scrollHeight - rangeBefore);
      }
    };

    const clearKeyboardLayout = () => {
      writeInset(0);
      keyboardGeometry = null;
      documentScrollAtKeyboard = null;
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };

    const scrollBodyBy = (
      distance: number,
      smoothly: boolean,
      ride: KeyboardTransition | null = null,
    ) => {
      smoothTarget = null;
      const animator = ride == null ? null : contentAnimator();
      if (ride != null && animator != null) {
        // FR8: the body lands at once, and its content rides the keyboard's
        // slide up from where it was, from the slide's start: content that
        // joins the slide late is where the keyboard is (rideKeyboard). A
        // further scroll during the slide adds to the same ride.
        const before = body.scrollTop;
        body.scrollTop = before + distance;
        const moved = body.scrollTop - before;
        // Only what the body actually scrolled rides: a remainder under the
        // scroll position's precision moves nothing, so the ride under way
        // is left on its curve.
        if (moved !== 0) {
          animator.set({y: animator.get('y', ride.start) + moved});
          rideKeyboard(animator, {y: 0}, ride);
        }
        return;
      }
      if (typeof body.scrollBy !== 'function') {
        body.scrollTop += distance;
        return;
      }
      // Reduce Motion, on any pointer (design:reduced-motion).
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = smoothly && !reduceMotion ? 'smooth' : 'instant';
      if (behavior === 'smooth') {
        smoothTarget = body.scrollTop + distance;
      }
      body.scrollBy({
        top: distance,
        // Not 'auto': that defers to the element's computed `scroll-behavior`,
        // so a consumer's `scroll-behavior: smooth` would animate a scroll this
        // hook needs to land in the same frame.
        behavior,
      });
    };

    // The distance a smooth reveal under way has still to scroll, as far as
    // the body can scroll; 0 once it has landed, or with none under way.
    const smoothDistanceLeft = () => {
      if (smoothTarget == null) {
        return 0;
      }
      const maxScroll = Math.max(
        body.scrollTop,
        body.scrollHeight - body.clientHeight,
      );
      const target = Math.min(smoothTarget, maxScroll);
      const left = target - body.scrollTop;
      return Math.abs(left) < 1 ? 0 : left;
    };

    // Scroll `control` into the part of the body the keyboard leaves visible,
    // reading live geometry each time.
    const scrollControlIntoSafeArea = (
      control: HTMLElement,
      smoothly: boolean,
      ride: KeyboardTransition | null = null,
    ) => {
      const measuredBodyRect = body.getBoundingClientRect();
      const measuredControlRect = control.getBoundingClientRect();
      const obstructionTop = getObstructionTop();
      // Under a pixel of overhang is `innerHeight`'s precision, not a
      // keyboard: no suggestion clearance then (overlapOf).
      const overlap = overlapOf(measuredBodyRect.bottom, obstructionTop);
      const clearance = overlap > 0 ? bottomClearance : 0;
      const safeTop = measuredBodyRect.top;
      const safeBottom = Math.min(
        measuredBodyRect.bottom,
        obstructionTop - clearance,
      );
      if (safeBottom <= safeTop) {
        return;
      }

      // Where the control will be once a smooth reveal under way lands: if
      // it lands the control, scrolling again would overshoot in Firefox,
      // which keeps adding a smooth scrollBy's distance after another scroll.
      // A ride's translate is not where the layout puts the control either.
      const pending = smoothDistanceLeft() + rideOffset();
      const controlBottom = measuredControlRect.bottom - pending;
      const controlTop = measuredControlRect.top - pending;
      if (controlBottom > safeBottom) {
        scrollBodyBy(controlBottom - safeBottom, smoothly, ride);
      } else if (controlTop < safeTop) {
        scrollBodyBy(controlTop - safeTop, smoothly, ride);
      }
    };

    const applyKeyboardGeometry = (geometry: KeyboardGeometry) => {
      const obstructionTop = getObstructionTop();
      // A collapsed detent can extend the body below the layout viewport even
      // after the keyboard closes, so body overlap alone cannot identify
      // recovery. Once the visual viewport is full height again, release the
      // retained keyboard layout unconditionally.
      if (isVisualViewportRecovered()) {
        clearKeyboardLayout();
        return;
      }
      const overlap = overlapOf(geometry.bodyBottom, obstructionTop);
      if (overlap === 0) {
        clearKeyboardLayout();
        return;
      }

      const inset = Math.max(
        0,
        geometry.bodyBottom - (obstructionTop - bottomClearance),
      );
      writeInset(inset);
    };

    // Take every focus move into a field over before the browser performs it
    // (refuseFocusReveal). Revealing the field is not that handler's job:
    // focusing it raises focusin, and the viewport report that follows the
    // keyboard raises another; both schedule the reveal below, which knows
    // the safe area and scrolls only the sheet's own body.
    //
    // Focus that leaves for nothing (the keyboard's Done button parks it on
    // the body) is parked on the sheet instead, so re-tapping the same field
    // is still a transition it sees. Left on the body, the field is already
    // `document.activeElement` on the next tap, no blur fires, and the browser
    // reveals it its own way. Only while the sheet is open: closing blurs the
    // field too, and there is no next tap to keep claimable; the host
    // restores focus to whatever opened the sheet.
    const claimFocusTransitions = () =>
      refuseFocusReveal(document, {
        isActive: () => isFullyExpandedRef.current && isTouchScreen(),
        claim: destination => findTextEntryControl(destination, body),
        park: origin => {
          if (isOpenRef.current && findTextEntryControl(origin, body)) {
            sheet?.focus({preventScroll: true});
          }
        },
      });

    const revealFocusedControl = () => {
      // Through a hide the sheet rides, its layout holds until the end.
      if (heldHide != null) {
        return;
      }
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
      const obstructionTop = getObstructionTop();
      const overlap = overlapOf(measuredBodyRect.bottom, obstructionTop);
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
      if (isPageScrollLocked && overlap > 0 && !hasKeyboardLayoutRef.current) {
        documentScrollAtKeyboard = {x: window.scrollX, y: window.scrollY};
      }
      hasKeyboardLayoutRef.current = overlap > 0;

      const inset =
        overlap > 0
          ? Math.max(0, measuredBodyRect.bottom - (obstructionTop - clearance))
          : 0;
      writeInset(inset);

      scrollControlIntoSafeArea(
        activeElement,
        overlap > 0 && !revealsAtReport.has(window),
        overlap > 0 ? showOnSlide() : null,
      );
    };

    // FR8: through a hide on the keyboard's slide the room stays, so nothing
    // drops while the keyboard still covers the sheet's bottom: the content
    // rides down on the hide's curve by the scroll the room's drop takes back
    // (how far the body is scrolled into the room), and at rest the room
    // drops and the translate clears in one commit.
    const holdRoomThrough = (transition: KeyboardTransition) => {
      heldHide?.release();
      const animator = contentAnimator();
      const scrolledIntoRoom = Math.max(
        0,
        body.scrollTop - (body.scrollHeight - roomRange - body.clientHeight),
      );
      const handle =
        animator != null && scrolledIntoRoom > 0
          ? rideKeyboard(animator, {y: scrolledIntoRoom}, transition)
          : null;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const hold = {
        release: () => {
          clearTimeout(timer);
          if (heldHide === hold) {
            heldHide = null;
          }
        },
      };
      heldHide = hold;
      const commit = () => {
        if (heldHide !== hold) {
          return;
        }
        heldHide = null;
        if (isVisualViewportRecovered()) {
          clearKeyboardLayout();
        } else {
          revealFocusedControl();
        }
        animator?.set({y: 0});
      };
      if (handle == null) {
        const end = transition.start + (transition.curve?.durationMs ?? 0);
        timer = setTimeout(commit, Math.max(0, end - performance.now()));
      } else {
        void handle.finished.then(commit);
      }
    };
    const unsubscribeGuide = guide?.subscribe(transition => {
      // Safari's keyboard keeps the reveal below: only a slide rides.
      if (transition.curve == null) {
        return;
      }
      if (transition.kind === 'hide') {
        if (hasKeyboardLayoutRef.current && transition.animated) {
          holdRoomThrough(transition);
        }
        return;
      }
      if (heldHide != null) {
        // The keyboard comes back before it is down (focus returns): the
        // room never left, so the content rides back to its place with it.
        heldHide.release();
        const animator = contentAnimator();
        if (animator != null) {
          rideKeyboard(animator, {y: 0}, transition);
        }
      }
    });

    let animationFrame = 0;
    const scheduleReveal = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(revealFocusedControl);
    };

    // Resuming the app re-reveals the focused field with no focus event to
    // claim, so the reveal above never runs and the document scrolls — taking
    // the fixed sheet with it. Put that scroll back on the event that reports
    // it and re-reveal inside the sheet.
    //
    // Only while the page is locked, which is the only state in which a
    // document scroll cannot be the user's own: behind a non-modal sheet the
    // page stays scrollable, and reverting there would fight them.
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
      // inset pseudo-element is the content box's last box: where the content
      // grows with it, the observation re-runs the reveal, which computes the
      // same inset from the body's unchanged box, so nothing feeds back into
      // sheet geometry.
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
            // Ignore the inset the sheet lays out on the body. Consumer DOM,
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

    const stopClaiming = ownsFocusTransitions ? claimFocusTransitions() : null;
    // A keyboard report is revealed in its own frame, not the next: a browser
    // that reveals a focused field itself pans the visual viewport to it a few
    // frames after the report if the keyboard still covers it (spec:AST-099
    // FR4). Such a pan (the visual viewport moved down within the layout
    // viewport after the report, with no touch since, no document scroll and
    // no zoom) is put back by scrolling the full-viewport dialog's top into
    // view once the sheet lands the field itself, and the field lands at once
    // on every later report.
    let lastHeight = getKeyboardHeight(window);
    // Under a coarse primary pointer only: the watch reads touches, and an
    // on-screen keyboard's pan comes with a touch screen.
    const revealPan = isTouch
      ? watchRevealPan(window, {
          owns: focused =>
            hasKeyboardLayoutRef.current && body.contains(focused),
          // The reader's own scroll may stop a smooth reveal short: forget
          // where it was going.
          onTouch: () => {
            smoothTarget = null;
          },
        })
      : null;
    // Every keyboard report reaches the reveal through the keyboard module's
    // one set of listeners.
    const unsubscribe = subscribeKeyboardHeight(window, event => {
      if (event.type !== 'viewport') {
        return;
      }
      if (event.height !== lastHeight) {
        lastHeight = event.height;
        revealPan?.report();
        cancelAnimationFrame(animationFrame);
        revealFocusedControl();
        return;
      }
      if (revealPan?.isRevealPan(event.height) === true) {
        revealsAtReport.add(window);
        cancelAnimationFrame(animationFrame);
        // A smooth reveal still under way lands the field where it is going.
        // Another scroll on top of it would overshoot in Firefox, which keeps
        // adding a smooth scrollBy's distance after an instant scroll (the
        // field ended 244 px too high); with none under way the field lands at
        // once.
        const distanceLeft = smoothDistanceLeft();
        if (distanceLeft === 0) {
          revealFocusedControl();
        }
        // The pan is put back only if the sheet holds the field above the
        // keyboard with its own scroller (rects are layout-viewport
        // coordinates, which the pan does not move); a field the sheet cannot
        // bring up keeps the browser's reveal.
        const activeElement = document.activeElement;
        const dialog = sheet?.closest('dialog');
        if (
          dialog != null &&
          activeElement instanceof HTMLElement &&
          activeElement.getBoundingClientRect().bottom - distanceLeft <=
            getObstructionTop()
        ) {
          // The full-viewport dialog is fixed at the layout viewport's top.
          revealPan?.putBack(dialog);
        }
        return;
      }
      scheduleReveal();
    });
    body.addEventListener('focusin', handleFocusIn);
    body.addEventListener('focusout', handleFocusOut);
    sheet?.addEventListener('transitionend', handleSheetTransitionEnd);
    window.addEventListener('scroll', handleDocumentScroll);
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
      stopClaiming?.();
      unsubscribe();
      unsubscribeGuide?.();
      heldHide?.release();
      contentAnimator()?.set({y: 0});
      revealPan?.stop();
      body.removeEventListener('focusin', handleFocusIn);
      body.removeEventListener('focusout', handleFocusOut);
      sheet?.removeEventListener('transitionend', handleSheetTransitionEnd);
      window.removeEventListener('scroll', handleDocumentScroll);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      setKeyboardInset(0);
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };
  }, [
    bodyRef,
    bottomClearance,
    isEnabled,
    isPageScrollLocked,
    isPresented,
    isTouch,
    sheetRef,
  ]);
  return keyboardInset;
}
