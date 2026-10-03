// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuPressGesture.ts
 * @input A menu press gesture and one pointer event, both as plain data
 * @output Exports the pure `menuPressStep` state machine, its state, event and
 *   effect types, and the settle constant
 * @position Pure module under `useMenuPress`; no DOM, no React, so every
 *   transition is unit-testable without a browser
 *
 * The press model shared by every Astryx menu and picker: the row under the
 * pointer when it is RELEASED is the row that acts, and the highlight follows
 * the pointer while it is held. It is the model of macOS and iOS menus.
 *
 * States:
 * - `idle` — no gesture is live.
 * - `tracking` — a pointer is held inside the menu and the highlight follows
 *   it.
 *
 * Rows are opaque (`T`): the machine never touches the DOM. The hook resolves
 * the enabled row under the pointer and feeds it in; `null` means the pointer
 * is over a divider, a heading, a disabled row, or outside the menu.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/menuPressGesture.test.ts
 * - /packages/core/src/hooks/useMenuPress.ts
 */

export type MenuPressPointerType = 'mouse' | 'touch' | 'pen';

export type MenuPressGesture<T> =
  | {phase: 'idle'}
  | {
      phase: 'tracking';
      pointerType: MenuPressPointerType;
      /** The enabled row currently under the pointer, if any. */
      row: T | null;
    };

export type MenuPressEvent<T> =
  | {
      type: 'down';
      pointerType: MenuPressPointerType;
      /** The enabled row under the press, if any. */
      row: T | null;
      time: number;
    }
  | {type: 'move'; row: T | null; isInMenu: boolean; time: number}
  | {
      type: 'up';
      row: T | null;
      isInMenu: boolean;
      isOnTrigger: boolean;
      time: number;
    }
  /** The browser took the gesture: pointercancel, a second pointer, a scroll. */
  | {type: 'cancel'};

export type MenuPressEffect<T> =
  | {type: 'none'}
  | {type: 'highlight'; row: T}
  | {type: 'clear'}
  | {type: 'act'; row: T}
  /**
   * The gesture ended without a row acting. `stray` says whether the browser
   * will still report a `click` for this gesture that must not act; `dismiss`
   * says the menu should close (a mouse released outside it).
   */
  | {type: 'settle'; stray: boolean; dismiss: boolean};

export interface MenuPressStep<T> {
  gesture: MenuPressGesture<T>;
  effect: MenuPressEffect<T>;
}

export const IDLE_MENU_PRESS: MenuPressGesture<never> = {phase: 'idle'};

const NONE: MenuPressEffect<never> = {type: 'none'};

function idle<T>(effect: MenuPressEffect<T>): MenuPressStep<T> {
  return {gesture: {phase: 'idle'}, effect};
}

function highlightEffect<T>(row: T | null): MenuPressEffect<T> {
  return row == null ? {type: 'clear'} : {type: 'highlight', row};
}

/**
 * Resolve a release while the highlight is tracking the pointer: over an
 * enabled row it acts, over the menu's chrome it acts on nothing, outside the
 * menu it acts on nothing and — under a mouse — dismisses the menu (a
 * finger leaves it open). A release back on the trigger never dismisses.
 */
function release<T>(
  pointerType: MenuPressPointerType,
  event: Extract<MenuPressEvent<T>, {type: 'up'}>,
): MenuPressStep<T> {
  if (event.row != null) {
    return idle({type: 'act', row: event.row});
  }
  if (event.isInMenu || event.isOnTrigger) {
    return idle({type: 'settle', stray: true, dismiss: false});
  }
  return idle({type: 'settle', stray: true, dismiss: pointerType === 'mouse'});
}

/**
 * Advance the gesture by one event. Pure: same inputs, same output.
 */
export function menuPressStep<T>(
  gesture: MenuPressGesture<T>,
  event: MenuPressEvent<T>,
): MenuPressStep<T> {
  switch (gesture.phase) {
    case 'idle':
      return stepIdle(gesture, event);
    case 'tracking':
      return stepTracking(gesture, event);
  }
}

function stepIdle<T>(
  gesture: Extract<MenuPressGesture<T>, {phase: 'idle'}>,
  event: MenuPressEvent<T>,
): MenuPressStep<T> {
  if (event.type !== 'down') {
    return {gesture, effect: NONE};
  }
  return {
    gesture: {
      phase: 'tracking',
      pointerType: event.pointerType,
      row: event.row,
    },
    effect: highlightEffect(event.row),
  };
}

function stepTracking<T>(
  gesture: Extract<MenuPressGesture<T>, {phase: 'tracking'}>,
  event: MenuPressEvent<T>,
): MenuPressStep<T> {
  switch (event.type) {
    case 'move': {
      if (event.row === gesture.row) {
        return {gesture, effect: NONE};
      }
      return {
        gesture: {...gesture, row: event.row},
        effect: highlightEffect(event.row),
      };
    }
    case 'up':
      return release(gesture.pointerType, event);
    case 'cancel':
      // The browser took the gesture (a scroll, a second finger): nothing
      // acts, the menu stays, and no click follows a cancelled pointer.
      return idle({type: 'settle', stray: false, dismiss: false});
    case 'down':
      return {gesture, effect: NONE};
  }
}
