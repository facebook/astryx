// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMobileKeyboard.ts
 * @input The window's visual viewport, focus events, React effects and refs,
 *   the motion module's Reduce Motion queries, the touch query, the layout
 *   viewport's height (utils/layoutViewport.ts)
 * @output Exports the on-screen keyboard module: measureKeyboardHeight,
 *   isKeyboardMeasurable, subscribeMobileKeyboard, getMobileKeyboardHeight,
 *   useKeyboardHeight, isTextEntryControl, findTextEntryControl,
 *   refuseFocusReveal, claimTapFocus, and BottomSheet's useMobileKeyboard
 *   hook
 * @position Core's one source for the on-screen keyboard (spec:AST-099,
 *   architecture:react-component-runtime INV11). Internal to core: nothing
 *   here is exported from the package. BottomSheet, ChatLayout and the
 *   keyboard layout guide read the keyboard here and nowhere else
 *
 * The keyboard height (AST-099 FR2) is the layout viewport's height minus the
 * visual viewport's height times its scale, in CSS px: a page pan is not a
 * smaller keyboard, and a pinch zoom is not a keyboard. The layout viewport's
 * height is read in layout px in every engine (utils/layoutViewport.ts):
 * WebKit reports `innerHeight` in the zoomed visual viewport's px. A browser
 * with its own keyboard geometry API (`navigator.virtualKeyboard`, Chrome on
 * Android) is measured the same way (FR6, DEC-4). It is 0 without a visual
 * viewport, and inside an iframe, whose visual viewport never shrinks for the
 * keyboard (FR7). One set of
 * listeners per window reads it (the visual viewport's resize and scroll, the
 * window's resize, and focus moves), however many components subscribe.
 *
 * Every route into a field has to reach it without the browser revealing it
 * (FR4). On iOS that reveal scrolls the DOCUMENT, and fixed content travels
 * with it, so the whole page lurches. The reveal is attached to the focus
 * operation, which is where it can be refused (`refuseFocusReveal`): take the
 * focus transition over on the capture-phase blur, deliver it with
 * preventScroll, and bring the control into view with the surface's own
 * scroller afterwards. Every route in (a tap, the keyboard's Next, Tab, a
 * programmatic focus()) passes through that one transition. A tap on a field
 * when nothing has focus raises no blur; `claimTapFocus` takes that route.
 *
 * BottomSheet's hook (`useMobileKeyboard`) gives a fully expanded, explicitly
 * Tall sheet a keyboard-aware internal scroll range while leaving the sheet
 * itself stationary: it returns the room the keyboard takes at the end of the
 * body, which the sheet lays out through a functional style on its own body,
 * with no CSS custom property of its own (FR3). It takes focus moves over
 * only under a coarse primary pointer: a desktop browser keeps its own focus
 * (spec:AST-017 FR59). Shorter detents and other heights opt out entirely.
 * Starting Tall-sheet travel or closing the sheet blurs the field and
 * dismisses the keyboard (FR5).
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {
  REDUCED_MOTION_FADE_QUERY,
  REDUCED_MOTION_INSTANT_QUERY,
} from '../motion/reducedMotion';
import {TOUCH_QUERY} from '../utils/touchPresentation';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import {flushSync} from 'react-dom';
import {layoutViewportHeight} from '../utils/layoutViewport';

// A shortfall smaller than this is rounding, not a keyboard.
const KEYBOARD_EPSILON = 1;
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

/**
 * Whether this window measures the keyboard: a top-level document (FR7) with
 * a visual viewport (FR6). Decided from capabilities, never from the user
 * agent or the pointer. A browser with its own keyboard geometry API (the
 * VirtualKeyboard API, Chrome on Android) is measured the same way: its
 * visual viewport shrinks for the keyboard while the layout viewport keeps its
 * height, as everywhere else (`spec:AST-099` DEC-4). A desktop browser's
 * visual viewport never shrinks for a keyboard, so it reads 0; where the app
 * sets `interactive-widget=resizes-content`, Chrome shrinks the layout
 * viewport with the keyboard, so the height is 0 there too and nothing rides:
 * the browser has made the room itself (FR8).
 */
export function isKeyboardMeasurable(win: Window): boolean {
  return win.visualViewport != null && win.self === win.top;
}

/**
 * The on-screen keyboard's height over the layout viewport, CSS px (FR2): 0
 * when none is shown, while pinch-zoomed included, and wherever
 * `isKeyboardMeasurable` is false.
 */
export function measureKeyboardHeight(win: Window): number {
  const viewport = win.visualViewport;
  if (viewport == null || !isKeyboardMeasurable(win)) {
    return 0;
  }
  const height =
    layoutViewportHeight(win) - viewport.height * (viewport.scale ?? 1);
  return height > KEYBOARD_EPSILON ? Math.round(height * 100) / 100 : 0;
}

/** A report from the keyboard module, in the order the window raised them. */
export type MobileKeyboardEvent =
  | {
      /** The visual viewport or the window changed size or position. */
      type: 'viewport';
      /** The keyboard height after this report. */
      height: number;
      /** The report's event time (the document timeline). */
      timeStamp: number;
    }
  | {
      /** Focus moved into (`focusin`) or out of (`focusout`) `target`. */
      type: 'focusin' | 'focusout';
      height: number;
      timeStamp: number;
      target: EventTarget | null;
      relatedTarget: EventTarget | null;
    };

interface KeyboardStore {
  height: number;
  listeners: Set<(event: MobileKeyboardEvent) => void>;
  detach: (() => void) | null;
}

const stores = new WeakMap<Window, KeyboardStore>();

function storeOf(win: Window): KeyboardStore {
  let store = stores.get(win);
  if (store == null) {
    store = {height: 0, listeners: new Set(), detach: null};
    stores.set(win, store);
  }
  return store;
}

function attach(win: Window, store: KeyboardStore): () => void {
  const viewport = win.visualViewport;
  const doc = win.document;
  store.height = measureKeyboardHeight(win);
  const emit = (event: MobileKeyboardEvent) => {
    for (const listener of [...store.listeners]) {
      listener(event);
    }
  };
  const onViewport = (event: Event) => {
    store.height = measureKeyboardHeight(win);
    emit({type: 'viewport', height: store.height, timeStamp: event.timeStamp});
  };
  const onFocus = (event: FocusEvent) => {
    emit({
      type: event.type === 'focusin' ? 'focusin' : 'focusout',
      height: store.height,
      timeStamp: event.timeStamp,
      target: event.target,
      relatedTarget: event.relatedTarget,
    });
  };
  viewport?.addEventListener('resize', onViewport);
  viewport?.addEventListener('scroll', onViewport);
  win.addEventListener('resize', onViewport);
  doc.addEventListener('focusin', onFocus, true);
  doc.addEventListener('focusout', onFocus, true);
  return () => {
    viewport?.removeEventListener('resize', onViewport);
    viewport?.removeEventListener('scroll', onViewport);
    win.removeEventListener('resize', onViewport);
    doc.removeEventListener('focusin', onFocus, true);
    doc.removeEventListener('focusout', onFocus, true);
  };
}

/**
 * Calls `listener` with every report of `win`'s keyboard until the returned
 * function is called. All subscribers of a window share one set of listeners.
 *
 * @example
 * ```
 * const stop = subscribeMobileKeyboard(window, event => {
 *   if (event.type === 'viewport') layout(event.height);
 * });
 * ```
 */
export function subscribeMobileKeyboard(
  win: Window,
  listener: (event: MobileKeyboardEvent) => void,
): () => void {
  const store = storeOf(win);
  store.listeners.add(listener);
  if (store.detach == null) {
    store.detach = attach(win, store);
  }
  return () => {
    store.listeners.delete(listener);
    if (store.listeners.size === 0 && store.detach != null) {
      store.detach();
      store.detach = null;
    }
  };
}

/**
 * `win`'s keyboard height. While the module listens, it is the height
 * measured at the last report: every reader of a keyboard change (the
 * layout guide, each component's hook, a rider committing its layout)
 * shares that one layout read (architecture:react-component-runtime INV11).
 * Every change of the visual viewport or the window is a report, so a reader
 * between two reports sees the current height. With nothing listening yet,
 * the height is measured now.
 */
export function getMobileKeyboardHeight(win: Window): number {
  const store = stores.get(win);
  return store?.detach != null ? store.height : measureKeyboardHeight(win);
}

/**
 * The keyboard height for a component, CSS px, re-rendering when it changes.
 * 0 during server render and before hydration reads a viewport.
 *
 * @example
 * ```
 * const keyboardHeight = useKeyboardHeight();
 * <div {...stylex.props(styles.bottom(keyboardHeight))} />
 * ```
 */
export function useKeyboardHeight(win?: Window | null): number {
  const target = win ?? (typeof window === 'undefined' ? null : window);
  return useSyncExternalStore(
    onChange => {
      if (target == null) {
        return () => {};
      }
      let last = getMobileKeyboardHeight(target);
      return subscribeMobileKeyboard(target, event => {
        if (event.type === 'viewport' && event.height !== last) {
          last = event.height;
          onChange();
        }
      });
    },
    () => (target == null ? 0 : getMobileKeyboardHeight(target)),
    () => 0,
  );
}

/** Whether focusing `element` brings up a keyboard for typing text. */
export function isTextEntryControl(
  element: Element | null,
): element is HTMLElement {
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

/** The text-entry control inside `container` that `target` is or labels. */
export function findTextEntryControl(
  target: EventTarget | null,
  container: HTMLElement,
): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const direct = target.closest(
    'input, textarea, [contenteditable]:not([contenteditable="false"])',
  );
  if (container.contains(direct) && isTextEntryControl(direct)) {
    return direct;
  }

  const label = target.closest('label');
  const control = label instanceof HTMLLabelElement ? label.control : null;
  return container.contains(control) && isTextEntryControl(control)
    ? control
    : null;
}

/** The caller's rules for refuseFocusReveal. */
export interface RefuseFocusRevealOptions {
  /** Whether to claim at all just now, checked on every blur. */
  isActive?: () => boolean;
  /** The control a focus move is heading to, when this caller claims it. */
  claim: (destination: EventTarget | null) => HTMLElement | null;
  /** Focus left `origin` for nothing (the keyboard's Done): park it, if at all. */
  park?: (origin: EventTarget | null) => void;
}

/**
 * Delivers the focus moves `claim` accepts with `preventScroll`, so the
 * browser never reveals their destination itself (FR4), until the returned
 * function is called.
 *
 * `blur` is dispatched in the capture phase ahead of the browser's own focus
 * step, and it names the destination in `relatedTarget`. Focusing it there
 * with preventScroll settles the transition: the browser's step finds the
 * element already active, so it dispatches nothing further and has nothing
 * to reveal.
 *
 * @example
 * ```
 * const stop = refuseFocusReveal(document, {
 *   claim: target => findTextEntryControl(target, body),
 *   park: () => sheet.focus({preventScroll: true}),
 * });
 * ```
 */
export function refuseFocusReveal(
  doc: Document,
  {isActive, claim, park}: RefuseFocusRevealOptions,
): () => void {
  const onBlur = (event: FocusEvent) => {
    if (isActive != null && !isActive()) {
      return;
    }
    const destination = claim(event.relatedTarget);
    if (destination != null) {
      if (destination !== doc.activeElement) {
        destination.focus({preventScroll: true});
      }
      return;
    }
    if (event.relatedTarget == null) {
      park?.(event.target);
    }
  };
  // `blur` does not bubble: only the capture phase hears every one, and it
  // runs before the browser's own focus step.
  doc.addEventListener('blur', onBlur, true);
  return () => {
    doc.removeEventListener('blur', onBlur, true);
  };
}

// A touch that moves this far is the browser's to scroll (Safari claims a
// touch for scrolling past 10 px), not a tap on a field.
const TAP_SLOP_PX = 10;

/** The caller's rules for claimTapFocus. */
export interface ClaimTapFocusOptions {
  /** The control a touch on `target` would focus, when this caller claims it. */
  claim: (target: EventTarget | null) => HTMLElement | null;
  /** Focuses the claimed control for a tap that ended at (x, y). */
  deliver: (control: HTMLElement, x: number, y: number) => void;
}

/**
 * FR4's tap route: a one-finger tap on `region` that `claim` accepts (a
 * field without focus) is delivered by `deliver` instead of by the browser,
 * whose own focus would reveal the field by scrolling the document. The tap's
 * default is prevented at its end, and the mouse events Safari may still send
 * for it are swallowed for a moment; a touch that moves past the scroll slop,
 * or a second finger, is left to the browser. Returns a cleanup.
 *
 * @example
 * ```
 * const stop = claimTapFocus(composer, {
 *   claim: target => editableWithoutFocus(target),
 *   deliver: (field, x, y) => focusAtPoint(field, x, y),
 * });
 * ```
 */
export function claimTapFocus(
  region: HTMLElement,
  {claim, deliver}: ClaimTapFocusOptions,
): () => void {
  // The touch being followed, and the listeners that follow it: on the
  // region only, and only while that touch is down.
  let start: {x: number; y: number; control: HTMLElement} | null = null;
  // After a delivered tap, the mouse events Safari may still send for it are
  // swallowed. On the iOS simulator, a tap held about 250 ms still gets its
  // mousedown and click a few ms after its touchend, though that touchend was
  // cancelable and cancelled (a quick tap's gets none, and a non-passive
  // listener present from the touch's start changes nothing). They are aimed
  // at whatever is under the finger by then: the transcript, once the
  // composer has started down with the keyboard, where the mousedown takes
  // the focus the tap delivered. So the document listens, from the tap's end
  // until its click, or until the next touch, pointer press or key starts a
  // new interaction. A click a key makes (detail 0) is never the tap's.
  let disarmGhost: (() => void) | null = null;
  const swallowGhost = () => {
    disarmGhost?.();
    const doc = region.ownerDocument;
    const swallow = (event: MouseEvent) => {
      if (event.detail === 0) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const onClick = (event: MouseEvent) => {
      swallow(event);
      disarm();
    };
    const disarm = () => {
      doc.removeEventListener('mousedown', swallow, true);
      doc.removeEventListener('mouseup', swallow, true);
      doc.removeEventListener('click', onClick, true);
      doc.removeEventListener('touchstart', disarm, true);
      doc.removeEventListener('pointerdown', disarm, true);
      doc.removeEventListener('keydown', disarm, true);
      disarmGhost = null;
    };
    doc.addEventListener('mousedown', swallow, true);
    doc.addEventListener('mouseup', swallow, true);
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('touchstart', disarm, {capture: true, passive: true});
    doc.addEventListener('pointerdown', disarm, {capture: true, passive: true});
    doc.addEventListener('keydown', disarm, {capture: true, passive: true});
    disarmGhost = disarm;
  };
  const stopFollowing = () => {
    start = null;
    region.removeEventListener('touchmove', onMove);
    region.removeEventListener('touchend', onEnd);
    region.removeEventListener('touchcancel', stopFollowing);
  };
  function onMove(event: TouchEvent) {
    const touch = event.touches[0];
    if (
      start == null ||
      event.touches.length !== 1 ||
      touch == null ||
      Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > TAP_SLOP_PX
    ) {
      stopFollowing();
    }
  }
  function onEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const tap = start;
    stopFollowing();
    // Still the same field, still without focus.
    if (
      tap == null ||
      touch == null ||
      !event.cancelable ||
      claim(tap.control) !== tap.control
    ) {
      return;
    }
    event.preventDefault();
    deliver(tap.control, touch.clientX, touch.clientY);
    swallowGhost();
  }
  const onStart = (event: TouchEvent) => {
    if (start != null) {
      // Another finger joined the one being followed: not a tap.
      stopFollowing();
      return;
    }
    const touch = event.touches[0];
    const control =
      event.touches.length === 1 && touch != null ? claim(event.target) : null;
    if (control == null || touch == null) {
      return;
    }
    start = {x: touch.clientX, y: touch.clientY, control};
    region.addEventListener('touchmove', onMove, {passive: true});
    // Not passive: only the end of the touch can still cancel the browser's
    // focus and its reveal.
    region.addEventListener('touchend', onEnd);
    region.addEventListener('touchcancel', stopFollowing);
  };
  region.addEventListener('touchstart', onStart, {passive: true});
  return () => {
    stopFollowing();
    disarmGhost?.();
    region.removeEventListener('touchstart', onStart);
  };
}

interface UseMobileKeyboardOptions {
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
  return layoutViewportHeight(window) - getMobileKeyboardHeight(window);
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
  return getMobileKeyboardHeight(window) <= 0.5;
}

/**
 * BottomSheet's use of the keyboard: a Tall sheet's scroll range, its focus
 * moves and its dismissal (see the file header). Returns the room the
 * keyboard takes at the end of the body, CSS px (0 without a keyboard).
 */
export function useMobileKeyboard({
  bodyRef,
  bottomClearance,
  isEnabled,
  isFullyExpanded,
  isPageScrollLocked,
  isSheetTraveling,
  isOpen,
  isPresented,
  sheetRef,
}: UseMobileKeyboardOptions): number {
  // The room the keyboard takes at the end of the body, CSS px: the sheet lays
  // it out through a functional style on its own body (spec:AST-099 FR3).
  const [keyboardInset, setKeyboardInset] = useState(0);
  const hasKeyboardLayoutRef = useRef(false);
  const retainKeyboardLayoutRef = useRef(false);
  const isFullyExpandedRef = useRef(isFullyExpanded);
  const isOpenRef = useRef(isOpen);
  isFullyExpandedRef.current = isFullyExpanded;
  isOpenRef.current = isOpen;

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
    let documentScrollAtKeyboard: {x: number; y: number} | null = null;
    // FR6: where this window measures the keyboard, never by user agent.
    const ownsFocusTransitions = isKeyboardMeasurable(window);
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
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the reveal scrolls into this room in the same frame, so it must be laid out before the reveal measures
      flushSync(() => setKeyboardInset(inset));
    };

    const clearKeyboardLayout = () => {
      writeInset(0);
      keyboardGeometry = null;
      documentScrollAtKeyboard = null;
      hasKeyboardLayoutRef.current = false;
      retainKeyboardLayoutRef.current = false;
    };

    const scrollBodyBy = (distance: number, smoothly: boolean) => {
      smoothTarget = null;
      if (typeof body.scrollBy !== 'function') {
        body.scrollTop += distance;
        return;
      }
      // Reduce Motion, on any pointer (design:reduced-motion): the motion
      // module's own queries, never a local spelling.
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        [REDUCED_MOTION_FADE_QUERY, REDUCED_MOTION_INSTANT_QUERY].some(
          query => window.matchMedia(query).matches,
        );
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
      const pending = smoothDistanceLeft();
      const controlBottom = measuredControlRect.bottom - pending;
      const controlTop = measuredControlRect.top - pending;
      if (controlBottom > safeBottom) {
        scrollBodyBy(controlBottom - safeBottom, smoothly);
      } else if (controlTop < safeTop) {
        scrollBodyBy(controlTop - safeTop, smoothly);
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
      );
    };

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
    let lastHeight = getMobileKeyboardHeight(window);
    let atReport: {x: number; y: number; top: number; scale: number} | null =
      null;
    let touchedSinceReport = false;
    const handleTouchStart = () => {
      touchedSinceReport = true;
      // The reader's own scroll may stop a smooth reveal short: forget where
      // it was going.
      smoothTarget = null;
    };
    const isBrowserReveal = (height: number) => {
      const viewport = window.visualViewport;
      const activeElement = document.activeElement;
      return (
        viewport != null &&
        atReport != null &&
        !touchedSinceReport &&
        height > 0 &&
        hasKeyboardLayoutRef.current &&
        viewport.offsetTop > atReport.top &&
        viewport.scale === atReport.scale &&
        window.scrollX === atReport.x &&
        window.scrollY === atReport.y &&
        activeElement instanceof HTMLElement &&
        body.contains(activeElement) &&
        isTextEntryControl(activeElement)
      );
    };
    // Every keyboard report reaches the reveal through the keyboard module's
    // one set of listeners.
    const unsubscribe = subscribeMobileKeyboard(window, event => {
      if (event.type !== 'viewport') {
        return;
      }
      if (event.height !== lastHeight) {
        lastHeight = event.height;
        const viewport = window.visualViewport;
        atReport =
          viewport == null
            ? null
            : {
                x: window.scrollX,
                y: window.scrollY,
                top: viewport.offsetTop,
                scale: viewport.scale,
              };
        touchedSinceReport = false;
        cancelAnimationFrame(animationFrame);
        revealFocusedControl();
        return;
      }
      if (isBrowserReveal(event.height)) {
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
        if (
          activeElement instanceof HTMLElement &&
          activeElement.getBoundingClientRect().bottom - distanceLeft <=
            getObstructionTop()
        ) {
          sheet?.closest('dialog')?.scrollIntoView({
            block: 'start',
            inline: 'nearest',
            behavior: 'instant',
          });
        }
        return;
      }
      scheduleReveal();
    });
    document.addEventListener('touchstart', handleTouchStart, {
      capture: true,
      passive: true,
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
      document.removeEventListener('touchstart', handleTouchStart, true);
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
    sheetRef,
  ]);
  return keyboardInset;
}
