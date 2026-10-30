// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file keyboardHeight.ts
 * @input The window's visual viewport, focus events, React's external store,
 *   the layout viewport's height (utils/layoutViewport.ts)
 * @output Exports the on-screen keyboard module: measureKeyboardHeight,
 *   isKeyboardMeasurable, subscribeKeyboardHeight, getKeyboardHeight,
 *   useKeyboardHeight, isTextEntryControl, findTextEntryControl,
 *   refuseFocusReveal, claimTapFocus, watchRevealPan, and the epsilon under
 *   which a shortfall is rounding (KEYBOARD_EPSILON)
 * @position Core's one source for the on-screen keyboard (spec:AST-099,
 *   architecture:react-component-runtime INV11). Internal to core: nothing
 *   here is exported from the package. BottomSheet (sheetKeyboard.ts),
 *   ChatLayout and the keyboard layout guide read the keyboard here and
 *   nowhere else
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
 * BottomSheet's hook lives apart, in sheetKeyboard.ts, with the sheet's ride
 * and the compositor animator: code that only reads the keyboard here (the
 * keyboard layout guide, a layer that caps itself at the keyboard) loads
 * neither.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {useCallback, useSyncExternalStore} from 'react';
import {layoutViewportHeight} from '../utils/layoutViewport';

/** A shortfall smaller than this is rounding, not a keyboard, CSS px. */
export const KEYBOARD_EPSILON = 1;
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
// One capture-phase `blur` listener per document, shared by every caller of
// refuseFocusReveal in it (spec:AST-094 FR24: document listeners do not grow
// with the number of instances), added with the first caller and removed
// with the last.
const focusTakeovers = new WeakMap<
  Document,
  {
    listener: (event: FocusEvent) => void;
    callers: Set<(event: FocusEvent) => void>;
  }
>();

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
  let shared = focusTakeovers.get(doc);
  if (shared == null) {
    const callers = new Set<(event: FocusEvent) => void>();
    // Callers hear each blur in the order they came, as separate listeners
    // would; one that stopped during this blur no longer hears it.
    const listener = (event: FocusEvent) => {
      for (const caller of [...callers]) {
        if (callers.has(caller)) {
          caller(event);
        }
      }
    };
    // `blur` does not bubble: only the capture phase hears every one, and it
    // runs before the browser's own focus step.
    doc.addEventListener('blur', listener, true);
    shared = {listener, callers};
    focusTakeovers.set(doc, shared);
  }
  shared.callers.add(onBlur);
  return () => {
    const current = focusTakeovers.get(doc);
    if (current == null || !current.callers.delete(onBlur)) {
      return;
    }
    if (current.callers.size === 0) {
      doc.removeEventListener('blur', current.listener, true);
      focusTakeovers.delete(doc);
    }
  };
}

/**
 * Test-only: how many callers refuse the focus reveal in `doc`, through its
 * one shared listener. Not part of the runtime API.
 *
 * @internal
 */
export function __focusTakeoverCallersForTest(doc: Document): number {
  return focusTakeovers.get(doc)?.callers.size ?? 0;
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
  /** Ends the watch; the document's touch listener goes with its last watch. */
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
// One capture-phase touch listener per document, shared by every reveal-pan
// watch in it (spec:AST-094 FR24: no per-instance document listener), added
// with the first watch and removed with the last.
const touchStartWatches = new WeakMap<
  Document,
  {listener: () => void; watches: Set<() => void>}
>();

function watchTouchStarts(doc: Document, onTouchStart: () => void): () => void {
  let shared = touchStartWatches.get(doc);
  if (shared == null) {
    const watches = new Set<() => void>();
    const listener = () => {
      for (const watch of [...watches]) {
        watch();
      }
    };
    doc.addEventListener('touchstart', listener, {
      capture: true,
      passive: true,
    });
    shared = {listener, watches};
    touchStartWatches.set(doc, shared);
  }
  shared.watches.add(onTouchStart);
  return () => {
    const current = touchStartWatches.get(doc);
    if (current == null || !current.watches.delete(onTouchStart)) {
      return;
    }
    if (current.watches.size === 0) {
      doc.removeEventListener('touchstart', current.listener, true);
      touchStartWatches.delete(doc);
    }
  };
}

export function watchRevealPan(
  win: Window,
  {owns, onTouch}: WatchRevealPanOptions,
): RevealPanWatch {
  const doc = win.document;
  let atReport: {x: number; y: number; top: number; scale: number} | null =
    null;
  let touchedSinceReport = false;
  const stopTouchStarts = watchTouchStarts(doc, () => {
    touchedSinceReport = true;
    onTouch?.();
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
    stop: stopTouchStarts,
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
