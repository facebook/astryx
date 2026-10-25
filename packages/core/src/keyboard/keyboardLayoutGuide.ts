// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardLayoutGuide.ts
 * @input The keyboard module's reports (useMobileKeyboard.ts:
 *   subscribeMobileKeyboard), createKeyboardModel, the keyboard's
 *   notification duration (motion/uikit/keyboard.ts)
 * @output Exports getKeyboardLayoutGuide (a window's one guide),
 *   bringsUpKeyboard and the KeyboardLayoutGuide type
 * @position The web's UIKeyboardLayoutGuide: where the software keyboard
 *   covers the layout viewport and how it moves, for the touch presentations
 *   that keep content above it (ChatLayout's composer). Internal to core: not
 *   exported from the package entry point
 *
 * One guide per window, subscribed only while something subscribes to it. It
 * owns no listener and measures nothing: it feeds the model (keyboardModel.ts)
 * the keyboard module's reports, the keyboard height of spec:AST-099 FR2, and
 * the focus changes that start a hide, and hands each transition to the
 * subscribers. What it adds is timing: when a show started, a hide predicted
 * from the blur, and the motion in between. Layout follows the keyboard
 * height itself; the guide's transitions only time the optional ride on top
 * (README.md).
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {keyboard} from '../motion/uikit/keyboard';
import {
  getMobileKeyboardHeight,
  subscribeMobileKeyboard,
  type MobileKeyboardEvent,
} from './useMobileKeyboard';
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

// Extra time after a predicted transition's end before checking it.
const VERIFY_SLACK_MS = 150;
// How long after a focus the guide watches frames for a keyboard to rise.
const FRAME_WATCH_MS = 1000;

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
 *   animator.animate({y: -t.to}, {spring: keyboard.spring}, {at: t.start});
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
  let model: KeyboardModel = createKeyboardModel(getMobileKeyboardHeight(win));
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
    const due = transition.start + keyboard.notificationMs + VERIFY_SLACK_MS;
    verifyTimer = setTimeout(
      () => {
        verifyTimer = null;
        publish(
          model.verify(getMobileKeyboardHeight(win), win.performance.now()),
        );
      },
      Math.max(0, due - win.performance.now()),
    );
  };

  const attach = () => {
    model = createKeyboardModel(getMobileKeyboardHeight(win));
    const onReport = (event: MobileKeyboardEvent) => {
      if (event.type === 'viewport') {
        const transition = model.report(
          event.height,
          event.timeStamp,
          lastFrame,
        );
        if (transition?.kind === 'show') {
          stopWatchingFrames();
        }
        publish(transition);
      } else if (event.type === 'focusin') {
        if (bringsUpKeyboard(event.target)) {
          if (model.inset <= 0) {
            watchFrames();
          }
          publish(model.focused(event.timeStamp));
        }
      } else if (
        bringsUpKeyboard(event.target) &&
        !bringsUpKeyboard(event.relatedTarget)
      ) {
        publish(model.blurred(event.timeStamp));
      }
    };
    const unsubscribe = subscribeMobileKeyboard(win, onReport);
    return () => {
      unsubscribe();
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
