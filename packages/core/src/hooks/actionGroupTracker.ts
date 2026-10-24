// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file actionGroupTracker.ts
 * @input The elements whose actions are tracked, the actions' selector and
 *   hit expansion, and the press paint and fade clocks
 * @output Exports createActionGroupTracker, ActionGroupTracker and
 *   ActionGroupTrackerOptions: UIKit's action-group tracking as a plain
 *   object any gesture recognizer can drive
 * @position Internal core of useActionGroupTracking (which binds it to one
 *   long press on the group element); also driven by recognizers that live
 *   elsewhere, such as a menu trigger whose held finger slides into the menu
 *   it opened
 *
 * UIKit tracks a group of actions (an alert's, an action sheet's, a menu's)
 * as one control, not as separate buttons (measured on iOS 26.2):
 *
 * - the action under the finger highlights; sliding off it cuts its highlight
 *   and sliding onto another highlights that one; between or outside the
 *   actions nothing is highlighted;
 * - lifting runs the action under the finger, and nothing when there is none;
 *   the lifted action's highlight fades (PRESS_FADE_MS);
 * - a press the owner calls inert (an alert during its transitions) is taken
 *   but paints and runs nothing.
 *
 * Nothing reads layout after a press begins: the actions' rects are read once
 * in `begin`, then hit-tested; `offsetBy` shifts them when the content moves
 * under a still finger (autoscroll). A move costs at most two attribute writes
 * and never a render. The action runs through its own `click()` inside `end`,
 * so the recognizer must call `end` from the lift's event (its touchend): that
 * keeps the user activation and every click handler.
 *
 * SYNC: When modified, update actionGroupTracker.test.ts and
 * useActionGroupTracking.ts
 */

import {PRESSED_ATTRIBUTE} from '../utils/pressFeedback';
import {PRESS_FADE_MS} from '../utils/pressGesture';

/** An action that is not enabled takes no highlight and does not run. */
const DISABLED = ':disabled, [aria-disabled="true"]';

export interface ActionGroupTrackerOptions {
  /** The elements whose actions are tracked, read when a press begins. */
  roots: () => Iterable<Element | null | undefined>;
  /** Selects the actions inside the roots. */
  itemSelector: string;
  /** How far outside an action the finger keeps it highlighted, px. */
  highlightExpansion: number;
  /**
   * Paint the highlighted action with the press attribute (`on`, then
   * `fading` at the lift). @default true
   */
  paintsHighlight?: boolean;
  /** Called whenever the highlighted action changes (null: none). */
  onHighlightChange?: (item: HTMLElement | null) => void;
  /** Runs the action under the finger at the lift. @default its own click */
  onActivate?: (item: HTMLElement) => void;
}

export interface ActionGroupTracker {
  /**
   * A press began at viewport (x, y): read the actions' rects once and
   * highlight the one under it. An inert press is taken but tracks nothing.
   */
  begin(x: number, y: number, options?: {inert?: boolean}): void;
  /** The finger moved to viewport (x, y). */
  move(x: number, y: number): void;
  /**
   * The lift: the highlighted action's paint fades and the action runs.
   * Call it from the lift's event. Returns the action that ran, if any. The
   * highlight is left to the activation (no onHighlightChange): an owner
   * that shows it as focus keeps focus on the action it runs.
   */
  end(): HTMLElement | null;
  /** The press was taken away (a cancel): the highlight is cut, nothing runs. */
  cancel(): void;
  /**
   * The tracked content moved by (dx, dy) under the finger (an autoscroll):
   * shift the cached rects without reading layout.
   */
  offsetBy(dx: number, dy: number): void;
  /** The action highlighted now. */
  readonly highlighted: HTMLElement | null;
  /** Whether a press is being tracked (between begin and end or cancel). */
  readonly isTracking: boolean;
  /**
   * Finish every pending release fade now (its paint comes off) and forget
   * the press: for the owner's unmount.
   */
  dispose(): void;
}

interface TrackedAction {
  readonly element: HTMLElement;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Create a tracker. `getOptions` is read on every call, so a hook can pass
 * the latest props without recreating it.
 */
export function createActionGroupTracker(
  getOptions: () => ActionGroupTrackerOptions,
): ActionGroupTracker {
  let actions: TrackedAction[] = [];
  let highlighted: HTMLElement | null = null;
  let isTracking = false;
  const fades = new Map<Element, ReturnType<typeof setTimeout>>();

  const paints = () => getOptions().paintsHighlight !== false;

  const clearFade = (element: Element) => {
    const fade = fades.get(element);
    if (fade != null) {
      clearTimeout(fade);
      fades.delete(element);
    }
  };
  const paint = (element: HTMLElement) => {
    if (!paints()) {
      return;
    }
    clearFade(element);
    element.setAttribute(PRESSED_ATTRIBUTE, 'on');
  };
  const cut = (element: HTMLElement) => {
    if (!paints()) {
      return;
    }
    clearFade(element);
    element.removeAttribute(PRESSED_ATTRIBUTE);
  };
  const release = (element: HTMLElement) => {
    if (!paints()) {
      return;
    }
    clearFade(element);
    element.setAttribute(PRESSED_ATTRIBUTE, 'fading');
    fades.set(
      element,
      setTimeout(() => {
        fades.delete(element);
        if (element.getAttribute(PRESSED_ATTRIBUTE) === 'fading') {
          element.removeAttribute(PRESSED_ATTRIBUTE);
        }
      }, PRESS_FADE_MS),
    );
  };

  const highlight = (next: HTMLElement | null) => {
    if (next === highlighted) {
      return;
    }
    if (highlighted != null) {
      cut(highlighted);
    }
    highlighted = next;
    if (next != null) {
      paint(next);
    }
    getOptions().onHighlightChange?.(next);
  };

  const actionAt = (x: number, y: number): HTMLElement | null => {
    const margin = getOptions().highlightExpansion;
    for (const action of actions) {
      if (
        x >= action.left - margin &&
        x <= action.right + margin &&
        y >= action.top - margin &&
        y <= action.bottom + margin
      ) {
        return action.element;
      }
    }
    return null;
  };

  const reset = () => {
    actions = [];
    highlighted = null;
    isTracking = false;
  };

  return {
    begin(x, y, {inert = false} = {}) {
      // A press can begin while another is tracked, when a second recognizer
      // takes over the finger (a trigger's held press, then the menu's): the
      // action the first one lit loses its paint.
      const previous = highlighted;
      if (previous != null) {
        cut(previous);
      }
      const {roots, itemSelector} = getOptions();
      const next: TrackedAction[] = [];
      // An inert press tracks no action: nothing to paint, nothing to run.
      if (!inert) {
        for (const root of roots()) {
          if (root == null) {
            continue;
          }
          for (const element of root.querySelectorAll<HTMLElement>(
            itemSelector,
          )) {
            if (element.matches(DISABLED)) {
              continue;
            }
            const rect = element.getBoundingClientRect();
            next.push({
              element,
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
            });
          }
        }
      }
      actions = next;
      highlighted = null;
      isTracking = true;
      const target = actionAt(x, y);
      if (target != null) {
        highlighted = target;
        paint(target);
      }
      if (target !== previous) {
        getOptions().onHighlightChange?.(target);
      }
    },
    move(x, y) {
      if (!isTracking) {
        return;
      }
      highlight(actionAt(x, y));
    },
    end() {
      const lifted = highlighted;
      const wasTracking = isTracking;
      reset();
      if (!wasTracking || lifted == null) {
        return null;
      }
      release(lifted);
      if (lifted.matches(DISABLED)) {
        return null;
      }
      const activate = getOptions().onActivate;
      if (activate != null) {
        activate(lifted);
      } else {
        lifted.click();
      }
      return lifted;
    },
    cancel() {
      const current = highlighted;
      const wasTracking = isTracking;
      reset();
      if (current != null) {
        cut(current);
        if (wasTracking) {
          getOptions().onHighlightChange?.(null);
        }
      }
    },
    offsetBy(dx, dy) {
      for (const action of actions) {
        action.left += dx;
        action.right += dx;
        action.top += dy;
        action.bottom += dy;
      }
    },
    get highlighted() {
      return highlighted;
    },
    get isTracking() {
      return isTracking;
    },
    dispose() {
      for (const [element, fade] of fades) {
        clearTimeout(fade);
        if (element.getAttribute(PRESSED_ATTRIBUTE) === 'fading') {
          element.removeAttribute(PRESSED_ATTRIBUTE);
        }
      }
      fades.clear();
      reset();
    },
  };
}
