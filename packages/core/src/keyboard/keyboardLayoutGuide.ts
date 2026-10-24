// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardLayoutGuide.ts
 * @input The window's visual viewport, window resizes and document focus
 *   events; createKeyboardModel
 * @output Exports getKeyboardLayoutGuide (a window's one guide),
 *   measureKeyboardInset, bringsUpKeyboard and the KeyboardLayoutGuide type
 * @position The web's UIKeyboardLayoutGuide: where the software keyboard
 *   covers the layout viewport and how it moves, for the touch presentations
 *   that keep content above it (ChatLayout's composer). Internal to core: not
 *   exported from the package entry point
 *
 * One guide per window, listening only while something subscribes. It feeds
 * the model (keyboardModel.ts) the visual viewport's reports and the focus
 * changes that start a hide, and hands each transition to the subscribers,
 * which move their own elements on the compositor (README.md).
 *
 * The inset is the distance from the bottom of the layout viewport, where
 * `position: fixed; bottom: 0` content sits, to the top of what covers it:
 * the keyboard, its accessory bar and Safari's toolbar above them. When
 * Safari pans the page to reveal a field, the visual viewport moves down the
 * layout viewport and the inset shrinks by as much. Pinch-zoomed, it is
 * unknown and the guide holds.
 *
 * Chrome (any browser but iOS's) reports the keyboard at the start of its
 * slide, and the model plays Android's curve from there. A field that
 * follows the keyboard itself registers with `overlayWhileFocused`: while it
 * has focus, the guide sets `navigator.virtualKeyboard.overlaysContent`, so
 * Chrome neither resizes nor pans the page for the keyboard, and reads the
 * keyboard's height from `geometrychange` (one event at the start of the
 * slide). It sets the flag only if the page had not, and restores only what
 * it set, when focus leaves every registered field. While the page overlays
 * the keyboard, visual viewport resizes say nothing about it and are ignored.
 * When focus moves from one field to another through something that brings
 * up no keyboard (a popover's container), Chrome reports the keyboard gone
 * for a moment and then back; a hide reported while a field that just got
 * focus still has it waits until the move settles.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {timing} from '../motion/uikit';
import {
  createKeyboardModel,
  type KeyboardModel,
  type KeyboardProfile,
  type KeyboardTransition,
} from './keyboardModel';

/** The VirtualKeyboard API, where the browser has it (Chromium). */
interface VirtualKeyboardLike extends EventTarget {
  overlaysContent: boolean;
  readonly boundingRect: DOMRectReadOnly;
}

function virtualKeyboardOf(win: Window): VirtualKeyboardLike | null {
  return (
    (win.navigator as Navigator & {virtualKeyboard?: VirtualKeyboardLike})
      .virtualKeyboard ?? null
  );
}

/** Mobile Safari's reports (iOS) or Chrome's (everything else). */
export function keyboardProfileOf(win: Window): KeyboardProfile {
  const css = (
    win as Window & {CSS?: {supports?: (p: string, v: string) => boolean}}
  ).CSS;
  return css?.supports?.('-webkit-touch-callout', 'none') === true
    ? 'webkit'
    : 'chromium';
}

/**
 * A window's keyboard layout guide.
 * @experimental
 */
export interface KeyboardLayoutGuide {
  /** The inset the keyboard rests at (or is heading to), CSS px. */
  readonly inset: number;
  /** The latest transition. */
  readonly transition: KeyboardTransition;
  /** The inset presented at `time` (default now), CSS px. */
  presentation(time?: number): number;
  /**
   * Calls `listener` with every transition, inside the event that revealed
   * it, until the returned function is called.
   */
  subscribe(listener: (transition: KeyboardTransition) => void): () => void;
  /** Whose keyboard reports the guide reads: `webkit` (iOS) or `chromium`. */
  readonly profile: KeyboardProfile;
  /**
   * While focus is in `element` (a field that keeps itself above the
   * keyboard), the page overlays the keyboard instead of Chrome resizing and
   * panning it (`navigator.virtualKeyboard.overlaysContent`). Does nothing
   * without the VirtualKeyboard API (Safari). Returns the unregister.
   */
  overlayWhileFocused(element: Element): () => void;
}

// A pinch zoom further than this from 1 makes the inset unknown.
const ZOOM_TOLERANCE = 0.01;
// Extra time after a predicted transition's end before checking it.
const VERIFY_SLACK_MS = 150;
// How long after a focus the guide watches frames for a keyboard to rise.
const FRAME_WATCH_MS = 1000;
// How long a touch that set the overlay waits for its tap to focus the field.
const OVERLAY_TAP_FOCUS_MS = 400;
// How long after a field gains focus Chrome may still report the keyboard
// gone for a moment (measured: back within 50 ms of the move).
const FOCUS_HANDOFF_MS = 150;

/**
 * The keyboard's inset over the layout viewport, CSS px: 0 without a visual
 * viewport, null while pinch-zoomed.
 */
export function measureKeyboardInset(win: Window): number | null {
  const viewport = win.visualViewport;
  if (viewport == null) {
    return 0;
  }
  if (Math.abs(viewport.scale - 1) > ZOOM_TOLERANCE) {
    return null;
  }
  const inset = win.innerHeight - (viewport.offsetTop + viewport.height);
  return inset > 0 ? Math.round(inset * 100) / 100 : 0;
}

// Input types that never bring up a keyboard.
const KEYLESS_INPUT_TYPES = new Set([
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
 * Whether focusing `target` brings up a software keyboard (or another input
 * view in its place, as a select's picker does).
 */
export function bringsUpKeyboard(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (element == null || element.nodeType !== 1) {
    return false;
  }
  if (element.getAttribute('inputmode') === 'none') {
    return false;
  }
  if (element.isContentEditable) {
    return true;
  }
  switch (element.tagName) {
    case 'TEXTAREA': {
      const area = element as HTMLTextAreaElement;
      return !area.readOnly && !area.disabled;
    }
    case 'INPUT': {
      const input = element as HTMLInputElement;
      return (
        !KEYLESS_INPUT_TYPES.has(input.type) &&
        !input.readOnly &&
        !input.disabled
      );
    }
    case 'SELECT':
      return !(element as HTMLSelectElement).disabled;
    default:
      return false;
  }
}

const guides = new WeakMap<Window, KeyboardLayoutGuide>();

/**
 * The window's keyboard layout guide, created on first use. It listens only
 * while something subscribes.
 *
 * @example
 * ```
 * const guide = getKeyboardLayoutGuide(window);
 * const unsubscribe = guide.subscribe(t => {
 *   animator.animate({y: -t.to}, {spring: springs.keyboard}, {at: t.start, reducedMotion: 'keep'});
 * });
 * ```
 * @experimental
 */
export function getKeyboardLayoutGuide(win: Window): KeyboardLayoutGuide {
  let guide = guides.get(win);
  if (guide == null) {
    guide = createGuide(win);
    guides.set(win, guide);
  }
  return guide;
}

/** The editable a pointer or focus event is about, if it brings up a keyboard. */
function editableAt(target: EventTarget | null): Element | null {
  const element = target as Element | null;
  if (element == null || typeof element.closest !== 'function') {
    const parent = (target as Node | null)?.parentElement ?? null;
    return parent == null ? null : editableAt(parent);
  }
  const editable = element.closest(
    '[contenteditable]:not([contenteditable="false"]), textarea, input, select',
  );
  return editable != null && bringsUpKeyboard(editable) ? editable : null;
}

function createGuide(win: Window): KeyboardLayoutGuide {
  const listeners = new Set<(transition: KeyboardTransition) => void>();
  // Read again whenever the guide starts listening.
  let profile = keyboardProfileOf(win);
  // Read when used: the API object is the window's for good, but a test
  // stands one in for each case.
  const overlaying = () => virtualKeyboardOf(win)?.overlaysContent === true;
  // The keyboard's inset now: the VirtualKeyboard's height while the page
  // overlays the keyboard (its y is unreliable), else the visual viewport's.
  const measure = (): number | null => {
    const virtualKeyboard = virtualKeyboardOf(win);
    return virtualKeyboard?.overlaysContent === true
      ? Math.round(virtualKeyboard.boundingRect.height * 100) / 100
      : measureKeyboardInset(win);
  };
  let model: KeyboardModel = createKeyboardModel(measure() ?? 0, {profile});
  let verifyTimer: ReturnType<typeof setTimeout> | null = null;
  let detach: (() => void) | null = null;
  // While a keyboard may be about to rise (a control that brings one up has
  // focus and none is up), the last animation frame the page rendered: a
  // busy main thread holds the viewport's report back, and the keyboard
  // then started at about that frame.
  let lastFrame: number | undefined;
  let frameRequest: number | null = null;
  let watchUntil = 0;
  const watchFrames = () => {
    watchUntil = win.performance.now() + FRAME_WATCH_MS;
    if (frameRequest != null) {
      return;
    }
    const onFrame = (time: number) => {
      lastFrame = time;
      frameRequest =
        time < watchUntil ? win.requestAnimationFrame(onFrame) : null;
    };
    frameRequest = win.requestAnimationFrame(onFrame);
  };
  const stopWatchingFrames = () => {
    if (frameRequest != null) {
      win.cancelAnimationFrame(frameRequest);
      frameRequest = null;
    }
    lastFrame = undefined;
  };

  const publish = (transition: KeyboardTransition | null) => {
    if (transition == null) {
      return;
    }
    if (transition.predicted) {
      scheduleVerify(transition);
    }
    for (const listener of [...listeners]) {
      listener(transition);
    }
  };
  const scheduleVerify = (transition: KeyboardTransition) => {
    if (verifyTimer != null) {
      clearTimeout(verifyTimer);
    }
    const due =
      transition.start + timing.keyboardNotificationMs + VERIFY_SLACK_MS;
    verifyTimer = setTimeout(
      () => {
        verifyTimer = null;
        publish(model.verify(measureKeyboardInset(win), win.performance.now()));
      },
      Math.max(0, due - win.performance.now()),
    );
  };

  const attach = () => {
    const viewport = win.visualViewport;
    const doc = win.document;
    profile = keyboardProfileOf(win);
    model = createKeyboardModel(measure() ?? 0, {profile});
    // When a field that brings up a keyboard last gained focus.
    let keyboardFocusAt = -Infinity;
    let handoffTimer: ReturnType<typeof setTimeout> | null = null;
    const report = (
      inset: number | null,
      time: number,
      frameBefore?: number,
    ): KeyboardTransition | null => {
      if (handoffTimer != null) {
        clearTimeout(handoffTimer);
        handoffTimer = null;
      }
      const settled = keyboardFocusAt + FOCUS_HANDOFF_MS;
      if (
        profile === 'chromium' &&
        inset != null &&
        inset < 0.5 &&
        model.inset >= 0.5 &&
        time < settled &&
        bringsUpKeyboard(doc.activeElement)
      ) {
        // Focus just moved to another field: Chrome reports the keyboard
        // gone before it reports it back. Hold the hide until the move
        // settles, then believe whatever the keyboard is doing.
        handoffTimer = setTimeout(() => {
          handoffTimer = null;
          publish(model.report(measure(), settled));
        }, settled - time);
        return null;
      }
      return model.report(inset, time, frameBefore);
    };
    const onViewport = (event: Event) => {
      if (overlaying()) {
        // The page overlays the keyboard: Chrome's viewport resizes then are
        // transient and say nothing about it.
        return;
      }
      const transition = report(
        measureKeyboardInset(win),
        event.timeStamp,
        lastFrame,
      );
      if (transition?.kind === 'show') {
        stopWatchingFrames();
      }
      publish(transition);
    };
    const onGeometry = (event: Event) => {
      if (overlaying()) {
        publish(report(measure(), event.timeStamp));
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (bringsUpKeyboard(event.target)) {
        keyboardFocusAt = event.timeStamp;
        if (profile === 'webkit' && model.inset <= 0) {
          watchFrames();
        }
        publish(model.focused(event.timeStamp));
      }
    };
    const onFocusOut = (event: FocusEvent) => {
      if (
        bringsUpKeyboard(event.target) &&
        !bringsUpKeyboard(event.relatedTarget)
      ) {
        publish(model.blurred(event.timeStamp));
      }
    };
    viewport?.addEventListener('resize', onViewport);
    viewport?.addEventListener('scroll', onViewport);
    win.addEventListener('resize', onViewport);
    doc.addEventListener('focusin', onFocusIn, true);
    doc.addEventListener('focusout', onFocusOut, true);
    const virtualKeyboard = virtualKeyboardOf(win);
    virtualKeyboard?.addEventListener('geometrychange', onGeometry);
    return () => {
      virtualKeyboard?.removeEventListener('geometrychange', onGeometry);
      viewport?.removeEventListener('resize', onViewport);
      viewport?.removeEventListener('scroll', onViewport);
      win.removeEventListener('resize', onViewport);
      doc.removeEventListener('focusin', onFocusIn, true);
      doc.removeEventListener('focusout', onFocusOut, true);
      stopWatchingFrames();
      if (handoffTimer != null) {
        clearTimeout(handoffTimer);
        handoffTimer = null;
      }
      if (verifyTimer != null) {
        clearTimeout(verifyTimer);
        verifyTimer = null;
      }
    };
  };

  // Fields registered with overlayWhileFocused, and the overlay they hold.
  const overlayFields = new Set<Element>();
  let overlayClaimed = false;
  let overlaySetByGuide = false;
  let releaseTimer: ReturnType<typeof setTimeout> | null = null;
  const inOverlayField = (node: unknown): boolean => {
    const candidate = node as Node | null;
    return (
      candidate != null &&
      typeof candidate.nodeType === 'number' &&
      [...overlayFields].some(field => field.contains(candidate))
    );
  };
  const claim = () => {
    if (releaseTimer != null) {
      clearTimeout(releaseTimer);
      releaseTimer = null;
    }
    const virtualKeyboard = virtualKeyboardOf(win);
    if (virtualKeyboard == null || overlayClaimed) {
      return;
    }
    overlayClaimed = true;
    // A page that overlays the keyboard itself keeps its own setting.
    if (!virtualKeyboard.overlaysContent) {
      virtualKeyboard.overlaysContent = true;
      overlaySetByGuide = true;
    }
  };
  const release = () => {
    if (releaseTimer != null) {
      clearTimeout(releaseTimer);
      releaseTimer = null;
    }
    if (!overlayClaimed) {
      return;
    }
    overlayClaimed = false;
    const virtualKeyboard = virtualKeyboardOf(win);
    // Restore only what the guide set, and only if nobody changed it since.
    if (
      overlaySetByGuide &&
      virtualKeyboard != null &&
      virtualKeyboard.overlaysContent
    ) {
      virtualKeyboard.overlaysContent = false;
    }
    overlaySetByGuide = false;
  };
  const releaseUnlessFocused = () => {
    if (!inOverlayField(win.document.activeElement)) {
      release();
    }
  };
  // Set before Chrome shows the keyboard: at the touch on the field, or the
  // focus a key or a script gives it.
  const onOverlayPointerDown = (event: PointerEvent) => {
    if (inOverlayField(event.target) && editableAt(event.target) != null) {
      claim();
    }
  };
  // A touch that claimed but focused nothing (a scroll took it) lets go.
  const onOverlayPointerEnd = () => {
    if (!overlayClaimed || releaseTimer != null) {
      return;
    }
    releaseTimer = setTimeout(() => {
      releaseTimer = null;
      releaseUnlessFocused();
    }, OVERLAY_TAP_FOCUS_MS);
  };
  const onOverlayFocusIn = (event: FocusEvent) => {
    if (inOverlayField(event.target) && bringsUpKeyboard(event.target)) {
      claim();
    }
  };
  const onOverlayFocusOut = (event: FocusEvent) => {
    if (!inOverlayField(event.relatedTarget)) {
      release();
    }
  };
  const overlayEvents: [string, (event: never) => void][] = [
    ['pointerdown', onOverlayPointerDown],
    ['pointerup', onOverlayPointerEnd],
    ['pointercancel', onOverlayPointerEnd],
    ['focusin', onOverlayFocusIn],
    ['focusout', onOverlayFocusOut],
  ];
  const toggleOverlayListeners = (on: boolean) => {
    const doc = win.document;
    for (const [type, handler] of overlayEvents) {
      if (on) {
        doc.addEventListener(type, handler as EventListener, true);
      } else {
        doc.removeEventListener(type, handler as EventListener, true);
      }
    }
    if (on) {
      win.addEventListener('pagehide', release);
    } else {
      win.removeEventListener('pagehide', release);
    }
  };

  return {
    get profile() {
      return profile;
    },
    overlayWhileFocused(element) {
      if (virtualKeyboardOf(win) == null) {
        return () => {};
      }
      if (overlayFields.size === 0) {
        toggleOverlayListeners(true);
      }
      overlayFields.add(element);
      if (inOverlayField(win.document.activeElement)) {
        claim();
      }
      return () => {
        if (!overlayFields.delete(element)) {
          return;
        }
        releaseUnlessFocused();
        if (overlayFields.size === 0) {
          release();
          toggleOverlayListeners(false);
        }
      };
    },
    get inset() {
      return model.inset;
    },
    get transition() {
      return model.transition;
    },
    presentation(time = win.performance.now()) {
      return model.presentation(time);
    },
    subscribe(listener) {
      listeners.add(listener);
      if (detach == null) {
        detach = attach();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && detach != null) {
          detach();
          detach = null;
        }
      };
    },
  };
}
