// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file keyboardHeight.ts
 * @input The window's visual viewport, focus events, React effects and refs,
 *   the Reduce Motion media query, the touch query, the layout viewport's
 *   height (utils/layoutViewport.ts), and for BottomSheet's ride the
 *   compositor animator, the keyboard layout guide's transitions and
 *   rideKeyboard
 * @output Exports the on-screen keyboard module: measureKeyboardHeight,
 *   isKeyboardMeasurable, subscribeKeyboardHeight, getKeyboardHeight,
 *   useKeyboardHeight, isTextEntryControl, findTextEntryControl,
 *   refuseFocusReveal, blurAsDismissal, claimTapFocus, watchRevealPan, and
 *   BottomSheet's useSheetKeyboard hook
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
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';
import {rideKeyboard} from './rideKeyboard';
import type {KeyboardTransition} from './keyboardModel';
import {
  useCallback,
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
export type KeyboardHeightEvent =
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
  listeners: Set<(event: KeyboardHeightEvent) => void>;
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
  const emit = (event: KeyboardHeightEvent) => {
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
 * const stop = subscribeKeyboardHeight(window, event => {
 *   if (event.type === 'viewport') layout(event.height);
 * });
 * ```
 */
export function subscribeKeyboardHeight(
  win: Window,
  listener: (event: KeyboardHeightEvent) => void,
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
 * measured at the last report: every reader of a keyboard change (each
 * component's hook) shares that one layout read (architecture:react-component-runtime INV11).
 * Every change of the visual viewport or the window is a report, so a reader
 * between two reports sees the current height. With nothing listening yet,
 * the height is measured now.
 */
export function getKeyboardHeight(win: Window): number {
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
  // One subscription for the component's life (per window): a subscribe
  // function made anew each render would make React unsubscribe and
  // resubscribe on every render, and a lone reader would detach the module's
  // listeners and measure again (architecture:react-component-runtime INV11).
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (target == null) {
        return () => {};
      }
      let last = getKeyboardHeight(target);
      return subscribeKeyboardHeight(target, event => {
        if (event.type === 'viewport' && event.height !== last) {
          last = event.height;
          onChange();
        }
      });
    },
    [target],
  );
  const getSnapshot = useCallback(
    () => (target == null ? 0 : getKeyboardHeight(target)),
    [target],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The keyboard height during server render and hydration. */
function getServerSnapshot(): number {
  return 0;
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

// Documents whose keyboard the keyboard module is dismissing just now (a drag
// that dismisses it, keyboardDismiss.ts). The blur that dismissal makes is not
// the keyboard's Done: focus it leaves for nothing is not parked, so a
// dismissal moves focus nowhere (spec:AST-099 FR4 parks after Done).
const dismissing = new WeakSet<Document>();

/**
 * Blurs `element` as the keyboard module's dismissal: the keyboard goes down,
 * and no surface's focus takeover parks the focus it leaves.
 */
export function blurAsDismissal(element: HTMLElement): void {
  const doc = element.ownerDocument;
  dismissing.add(doc);
  try {
    element.blur();
  } finally {
    dismissing.delete(doc);
  }
}

/** The caller's rules for refuseFocusReveal. */
export interface RefuseFocusRevealOptions {
  /** Whether to claim at all just now, checked on every blur. */
  isActive?: () => boolean;
  /** The control a focus move is heading to, when this caller claims it. */
  claim: (destination: EventTarget | null) => HTMLElement | null;
  /**
   * Focus left `origin` for nothing (the keyboard's Done): park it, if at
   * all. Never called for the module's own dismissal (blurAsDismissal).
   */
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
    if (event.relatedTarget == null && !dismissing.has(doc)) {
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

/** The caller's rules for watchRevealPan. */
export interface WatchRevealPanOptions {
  /** Whether the focused field is the caller's to keep in view. */
  owns: (focused: HTMLElement) => boolean;
  /** Called on every touch start, which ends the watch for the report. */
  onTouch?: () => void;
}

/** A watch for the browser's own reveal pan (see watchRevealPan). */
export interface RevealPanWatch {
  /** A report changed the keyboard's height: remember where everything sat. */
  report: () => void;
  /** Whether the visual viewport has since moved down as a reveal pan. */
  isRevealPan: (height: number) => boolean;
  /**
   * Pans the visual viewport back to where it sat at the report without
   * scrolling the document: scrolls `anchor`, an element fixed at the layout
   * viewport's top, into view, or a probe fixed where the visual viewport sat.
   */
  putBack: (anchor?: Element | null) => void;
  /** Removes the watch's listener. */
  stop: () => void;
}

/**
 * FR4's last route: a browser that reveals a focused field itself pans the
 * visual viewport to it after the keyboard's report while the keyboard still
 * covers the field. Measured in Firefox for Android (34 to 39 ms after the
 * report) and in Chrome 124 on Android (an animated pan of the keyboard's
 * whole height, starting about 150 ms after the report, while a composer is
 * still riding up). Such a pan: the visual viewport moved down within the
 * layout viewport since the report, with no touch since, no document scroll
 * and no zoom, while a text field the caller owns has focus. Recorded from
 * the behavior, never from the user agent. The caller lands its field itself
 * and puts the pan back. One building block for every keyboard-aware surface
 * (BottomSheet, ChatLayout).
 *
 * @example
 * ```
 * const watch = watchRevealPan(window, {owns: field => region.contains(field)});
 * // On a report that changes the height: watch.report();
 * // On any later report: if (watch.isRevealPan(height)) watch.putBack();
 * ```
 */
export function watchRevealPan(
  win: Window,
  {owns, onTouch}: WatchRevealPanOptions,
): RevealPanWatch {
  const doc = win.document;
  let atReport: {x: number; y: number; top: number; scale: number} | null =
    null;
  let touchedSinceReport = false;
  const handleTouchStart = () => {
    touchedSinceReport = true;
    onTouch?.();
  };
  doc.addEventListener('touchstart', handleTouchStart, {
    capture: true,
    passive: true,
  });
  return {
    report: () => {
      const viewport = win.visualViewport;
      atReport =
        viewport == null
          ? null
          : {
              x: win.scrollX,
              y: win.scrollY,
              top: viewport.offsetTop,
              scale: viewport.scale,
            };
      touchedSinceReport = false;
    },
    isRevealPan: height => {
      const viewport = win.visualViewport;
      const focused = doc.activeElement;
      return (
        viewport != null &&
        atReport != null &&
        !touchedSinceReport &&
        height > 0 &&
        viewport.offsetTop > atReport.top &&
        viewport.scale === atReport.scale &&
        win.scrollX === atReport.x &&
        win.scrollY === atReport.y &&
        focused instanceof HTMLElement &&
        isTextEntryControl(focused) &&
        owns(focused)
      );
    },
    putBack: anchor => {
      const options: ScrollIntoViewOptions = {
        block: 'start',
        inline: 'nearest',
        behavior: 'instant',
      };
      if (anchor != null) {
        anchor.scrollIntoView(options);
        return;
      }
      // A fixed element sits in the layout viewport, which the pan does not
      // move: scrolling its top into view pans the visual viewport back.
      const probe = doc.createElement('div');
      probe.style.position = 'fixed';
      probe.style.left = '0';
      probe.style.top = `${atReport?.top ?? 0}px`;
      probe.style.width = '1px';
      probe.style.height = '1px';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      (doc.body ?? doc.documentElement).append(probe);
      probe.scrollIntoView(options);
      probe.remove();
    },
    stop: () => {
      doc.removeEventListener('touchstart', handleTouchStart, true);
    },
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
  // The ride attaches only under a coarse primary pointer (the touch query).
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
    // under a coarse primary pointer: under a fine one nothing of the ride
    // attaches, and the room follows the reports. The guide is subscribed
    // before the keyboard module below, so a report's transition is
    // published before the reveal reads it.
    const guide = isTouch ? getKeyboardLayoutGuide(window) : null;
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
    const revealPan = watchRevealPan(window, {
      owns: focused => hasKeyboardLayoutRef.current && body.contains(focused),
      // The reader's own scroll may stop a smooth reveal short: forget where
      // it was going.
      onTouch: () => {
        smoothTarget = null;
      },
    });
    // Every keyboard report reaches the reveal through the keyboard module's
    // one set of listeners.
    const unsubscribe = subscribeKeyboardHeight(window, event => {
      if (event.type !== 'viewport') {
        return;
      }
      if (event.height !== lastHeight) {
        lastHeight = event.height;
        revealPan.report();
        cancelAnimationFrame(animationFrame);
        revealFocusedControl();
        return;
      }
      if (revealPan.isRevealPan(event.height)) {
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
          revealPan.putBack(dialog);
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
      revealPan.stop();
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
