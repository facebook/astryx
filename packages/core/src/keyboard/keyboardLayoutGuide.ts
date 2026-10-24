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
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {timing} from '../motion/uikit';
import {
  createKeyboardModel,
  type KeyboardModel,
  type KeyboardTransition,
} from './keyboardModel';

/** A window's keyboard layout guide. */
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
}

// A pinch zoom further than this from 1 makes the inset unknown.
const ZOOM_TOLERANCE = 0.01;
// Extra time after a predicted transition's end before checking it.
const VERIFY_SLACK_MS = 150;
// How long after a focus the guide watches frames for a keyboard to rise.
const FRAME_WATCH_MS = 1000;

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
 * The window's keyboard layout guide, created on first use.
 *
 * @example
 * ```
 * const guide = getKeyboardLayoutGuide(window);
 * const unsubscribe = guide.subscribe(t => {
 *   animator.animate({y: -t.to}, {spring: springs.keyboard}, {at: t.start, reducedMotion: 'keep'});
 * });
 * ```
 */
export function getKeyboardLayoutGuide(win: Window): KeyboardLayoutGuide {
  let guide = guides.get(win);
  if (guide == null) {
    guide = createGuide(win);
    guides.set(win, guide);
  }
  return guide;
}

function createGuide(win: Window): KeyboardLayoutGuide {
  const listeners = new Set<(transition: KeyboardTransition) => void>();
  let model: KeyboardModel = createKeyboardModel(
    measureKeyboardInset(win) ?? 0,
  );
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
    model = createKeyboardModel(measureKeyboardInset(win) ?? 0);
    const onViewport = (event: Event) => {
      const transition = model.report(
        measureKeyboardInset(win),
        event.timeStamp,
        lastFrame,
      );
      if (transition?.kind === 'show') {
        stopWatchingFrames();
      }
      publish(transition);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (bringsUpKeyboard(event.target)) {
        if (model.inset <= 0) {
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
    return () => {
      viewport?.removeEventListener('resize', onViewport);
      viewport?.removeEventListener('scroll', onViewport);
      win.removeEventListener('resize', onViewport);
      doc.removeEventListener('focusin', onFocusIn, true);
      doc.removeEventListener('focusout', onFocusOut, true);
      stopWatchingFrames();
      if (verifyTimer != null) {
        clearTimeout(verifyTimer);
        verifyTimer = null;
      }
    };
  };

  return {
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
