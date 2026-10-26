// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardLayoutGuide.ts
 * @input The keyboard module's reports (useMobileKeyboard.ts:
 *   subscribeMobileKeyboard), createKeyboardModel, the keyboard
 *   notifications' duration (`keyboardNotification`, motion/uikit/timing.ts)
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
 * Two browsers report the keyboard on different schedules, so the model reads
 * them through two measured profiles (keyboardModel.ts): Mobile Safari
 * reports a show after the keyboard starts to move and a hide only once it is
 * down; Chrome reports each slide just after it starts (spec:AST-099 FR8).
 * The profile is a capability: a browser with the VirtualKeyboard API reports
 * the keyboard itself (Chrome); every other one reads Safari's profile. When
 * focus moves from one field to another through something that brings up no
 * keyboard (a popover's container), Chrome reports the keyboard gone for a
 * moment and then back; a hide reported while a field that just got focus
 * still has it waits until the move settles.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {keyboardNotification} from '../motion/uikit/timing';
import {
  getMobileKeyboardHeight,
  subscribeMobileKeyboard,
  type MobileKeyboardEvent,
} from './useMobileKeyboard';
import {
  createKeyboardModel,
  type KeyboardModel,
  type KeyboardProfile,
  type KeyboardTransition,
} from './keyboardModel';

/**
 * Whose keyboard schedule the guide reads: `chromium` in a browser that has
 * the VirtualKeyboard API (Chrome, which reports the keyboard as each slide
 * starts), `webkit` (Mobile Safari's) everywhere else. A capability, never
 * the user agent (spec:AST-013 FR6); the timing difference is measured in
 * motion/uikit/keyboard.ts and motion/android/keyboard.ts.
 */
export function keyboardProfileOf(win: Window): KeyboardProfile {
  return 'virtualKeyboard' in win.navigator ? 'chromium' : 'webkit';
}

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
  /** Whose keyboard schedule the guide reads (keyboardProfileOf). */
  readonly profile: KeyboardProfile;
}

// Extra time after a predicted transition's end before checking it.
const VERIFY_SLACK_MS = 150;
// How long after a focus the guide watches frames for a keyboard to rise.
const FRAME_WATCH_MS = 1000;
// How long after a field gains focus Chrome may still report the keyboard
// gone for a moment (measured: back within 50 ms of the move).
const FOCUS_HANDOFF_MS = 150;

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
  let profile = keyboardProfileOf(win);
  let model: KeyboardModel = createKeyboardModel(getMobileKeyboardHeight(win), {
    profile,
  });
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
      transition.start + keyboardNotification.durationMs + VERIFY_SLACK_MS;
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
    profile = keyboardProfileOf(win);
    model = createKeyboardModel(getMobileKeyboardHeight(win), {profile});
    // When a field that brings up a keyboard last gained focus.
    let keyboardFocusAt = -Infinity;
    let handoffTimer: ReturnType<typeof setTimeout> | null = null;
    const report = (
      height: number,
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
        height < 0.5 &&
        model.inset >= 0.5 &&
        time < settled &&
        bringsUpKeyboard(win.document.activeElement)
      ) {
        // Focus just moved to another field: Chrome reports the keyboard
        // gone before it reports it back. Hold the hide until the move
        // settles, then believe whatever the keyboard is doing.
        handoffTimer = setTimeout(() => {
          handoffTimer = null;
          publish(model.report(getMobileKeyboardHeight(win), settled));
        }, settled - time);
        return null;
      }
      return model.report(height, time, frameBefore);
    };
    const onReport = (event: MobileKeyboardEvent) => {
      if (event.type === 'viewport') {
        const transition = report(event.height, event.timeStamp, lastFrame);
        if (transition?.kind === 'show') {
          stopWatchingFrames();
        }
        publish(transition);
      } else if (event.type === 'focusin') {
        if (bringsUpKeyboard(event.target)) {
          keyboardFocusAt = event.timeStamp;
          // Safari holds a show's report back behind a busy main thread;
          // Chrome's arrives as the slide starts.
          if (profile === 'webkit' && model.inset <= 0) {
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

  return {
    get profile() {
      return profile;
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
