// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuTriggerPress.ts
 * @input The menu press model's shared state (useMenuPress.ts), useLongPress,
 *   the native scroll probe, the menu press values, the system's long-press
 *   duration (motion/uikit/longPress.ts) and the coarse-pointer read
 * @output Exports `useMenuTriggerPress`: the trigger half of the menu press
 *   model (a mouse press-down open, a held or pressed finger open, the
 *   scroll-view wait)
 * @position Only a menu with a trigger reaches this module (DropdownMenu,
 *   MoreMenu, the public useMenuPress): a sub-menu, a context menu, a
 *   Selector's list and a sheet's action list never press a trigger, so they
 *   do not bundle the long-press detectors and the scroll probe
 *   (`architecture:component-style-authoring` INV6, the touch-only budget).
 *
 * SYNC: When modified, update useMenuPress.ts and useMenuPress.test.tsx.
 */

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import {currentGesture} from '../Layer/gestureCounter';
import {createNativeScrollProbe} from '../gestures/nativeScroll';
import type {
  MenuPressInput,
  MenuPressPointerType,
  MenuPressState,
} from './menuPressGesture';
import {
  DELAYS_CONTENT_TOUCHES_MS,
  MENU_PRESS_HOLD_OPEN_SLOP_PX,
} from './menuPressValues';
import {useLongPress, type UseLongPressHandlers} from './useLongPress';
import {LONG_PRESS_DURATION_MS} from '../motion/uikit/longPress';
import {isCoarsePointer, watchCoarsePointer} from '../utils/coarsePointer';

/**
 * How long a finger rests on the trigger before the menu opens under it,
 * with the 'pointer' touch model and no `longPressDelayMs`. A tap released
 * sooner opens the menu through the trigger's click.
 */
export const MENU_PRESS_LONG_PRESS_MS = LONG_PRESS_DURATION_MS;

/**
 * How far a finger held on a DropdownMenu trigger may move before the open,
 * in CSS px, where the primary pointer is coarse: `spec:AST-094` FR29's
 * drift allowance (FR2's table: unmeasured, a 12 pt move still opened), the
 * same 13 pt a trigger in a scroll view allows. Where it is fine, and on
 * ContextMenu, the long press's own allowable movement stays.
 */
export const MENU_PRESS_TRIGGER_DRIFT_PX = MENU_PRESS_HOLD_OPEN_SLOP_PX;

const viewOrNull = () => (typeof window === 'undefined' ? null : window);
const subscribeCoarsePointer = (onChange: () => void) =>
  watchCoarsePointer(viewOrNull(), onChange);
const readCoarsePointer = () => isCoarsePointer(viewOrNull());
const readServerCoarsePointer = () => false;

/** What the trigger half reads and drives of the model. @internal */
export interface MenuTriggerContext {
  readonly optionsRef: RefObject<{
    isEnabled?: boolean;
    onTriggerPress?: (pointerType: MenuPressPointerType) => boolean;
    touchModel?: 'pointer' | 'uikit';
  }>;
  readonly gestureRef: RefObject<MenuPressState<HTMLElement>>;
  // The model's own state changes through these calls, never through a
  // write to one of its refs: React Compiler reads a write through a hook
  // argument as mutating it.
  /** Marks the gesture whose long press opened the menu. */
  readonly setTriggerGesture: (gesture: number | null) => void;
  /**
   * This render's two hold detectors, in a scroll view or not; the model
   * keeps the one the live press uses.
   */
  readonly setHoldDetectors: (detectors: {
    plain: UseLongPressHandlers;
    scroller: UseLongPressHandlers;
  }) => void;
  /** Starts the live press's hold, in a scroll view or not, at a point. */
  readonly startHold: (
    kind: 'plain' | 'scroller',
    at: {x: number; y: number},
  ) => void;
  readonly setLastPointerEvent: (event: PointerEvent) => void;
  /** Whether the model ignores this pointer; a match is cleared. */
  readonly takeIgnoredPointer: (pointerId: number) => boolean;
  readonly installTouchMovePreventer: () => void;
  readonly step: (
    event: MenuPressInput<HTMLElement>,
    native?: PointerEvent,
  ) => void;
  readonly attach: (pointerId: number) => void;
}

export interface MenuTriggerHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

function normalizePointerType(type: string): MenuPressPointerType | null {
  return type === 'mouse' || type === 'touch' || type === 'pen' ? type : null;
}

/**
 * Whether a control is inside a scroll view (`spec:AST-094` FR11): it sits in
 * a scrollable container, or in scrolling page content with no fixed
 * ancestor. A control in a fixed bar (a top bar, a tab bar, a toolbar) is
 * not. A sticky ancestor does not make a bar: FR11 names only a fixed one.
 */
function isInScrollView(control: Element): boolean {
  if (!createNativeScrollProbe(control).isInsideScroller) {
    return false;
  }
  const doc = control.ownerDocument;
  const view = doc.defaultView;
  const root = doc.scrollingElement ?? doc.documentElement;
  for (
    let node = control.parentElement;
    node != null && node !== root && node !== doc.body;
    node = node.parentElement
  ) {
    const style = view?.getComputedStyle(node);
    const scrolls =
      style != null &&
      ((/(auto|scroll)/.test(style.overflowY) &&
        node.scrollHeight > node.clientHeight) ||
        (/(auto|scroll)/.test(style.overflowX) &&
          node.scrollWidth > node.clientWidth));
    if (scrolls) {
      return true;
    }
    if (style?.position === 'fixed') {
      return false;
    }
  }
  return true;
}

/**
 * The trigger half of the menu press model. `ctx` is stable for the model's
 * lifetime.
 *
 * @internal
 */
export function useMenuTriggerPress(
  ctx: MenuTriggerContext,
  options: {touchModel?: 'pointer' | 'uikit'; longPressDelayMs?: number},
): MenuTriggerHandlers {
  const fireLongPress = useCallback(() => {
    const gesture = ctx.gestureRef.current;
    if (gesture.phase !== 'triggerPress') {
      return;
    }
    ctx.setTriggerGesture(currentGesture());
    const didOpen =
      ctx.optionsRef.current.onTriggerPress?.(gesture.pointerType) ?? false;
    if (!didOpen) {
      ctx.step({type: 'cancel'});
      return;
    }
    ctx.installTouchMovePreventer();
    ctx.step({type: 'opened', time: Date.now()});
  }, [ctx]);

  // The long-press detector of the system: the same hook ContextMenu spreads
  // onto its trigger, driven here from the pointer stream this model already
  // observes. Its touch handlers go unused; the hold duration, the movement
  // tolerance and the timer are what matter, and they have one home. Inside
  // a scrolling region UIKit first holds the touch for the scroll view's
  // content-touch delay (`scroll.delaysContentTouchesMs`), so a held finger
  // opens the menu that much later; the press picks its detector when it
  // lands.
  // With `touchModel: 'uikit'` only a trigger inside a scroll view waits
  // (the content-touch delay, within the drift allowance); one in a fixed bar
  // opens as the finger presses, so its detector never runs. A held finger
  // keeps FR29's drift allowance where the primary pointer is coarse; where
  // it is fine, the shared tolerance stays (useMenuPress FR9).
  const isUikit = options.touchModel === 'uikit';
  const isPrimaryPointerCoarse = useSyncExternalStore(
    subscribeCoarsePointer,
    readCoarsePointer,
    readServerCoarsePointer,
  );
  const pointerHoldMs = options.longPressDelayMs ?? MENU_PRESS_LONG_PRESS_MS;
  const pointerHoldDriftPx = isPrimaryPointerCoarse
    ? MENU_PRESS_TRIGGER_DRIFT_PX
    : undefined;
  const plainHold = useLongPress({
    onLongPress: fireLongPress,
    delayMs: pointerHoldMs,
    moveCancelPx: pointerHoldDriftPx,
  });
  const scrollerHold = useLongPress({
    onLongPress: fireLongPress,
    delayMs: isUikit ? DELAYS_CONTENT_TOUCHES_MS : pointerHoldMs,
    moveCancelPx: isUikit ? MENU_PRESS_HOLD_OPEN_SLOP_PX : pointerHoldDriftPx,
  });
  ctx.setHoldDetectors({plain: plainHold, scroller: scrollerHold});

  const handleTriggerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const {isEnabled = true} = ctx.optionsRef.current;
      if (ctx.takeIgnoredPointer(event.pointerId)) {
        return;
      }
      if (!isEnabled || ctx.gestureRef.current.phase !== 'idle') {
        return;
      }
      const pointerType = normalizePointerType(event.pointerType);
      if (pointerType == null || event.button !== 0) {
        return;
      }
      if (pointerType === 'mouse' && event.ctrlKey) {
        // Control-click is the context menu's on macOS.
        return;
      }
      const native = event.nativeEvent;
      const down = {
        type: 'down',
        target: 'trigger',
        pointerType,
        row: null,
        time: Date.now(),
      } as const;
      const isUikitFinger =
        pointerType !== 'mouse' &&
        ctx.optionsRef.current.touchModel === 'uikit';
      const inScrollView =
        pointerType !== 'mouse' && isInScrollView(event.currentTarget);
      if (isUikitFinger && !inScrollView) {
        // spec:AST-094 FR29: a trigger in a fixed bar opens as the finger
        // presses, and the page holds still under it as a bar's does in
        // UIKit. The finger's compatibility mouse events must not follow it
        // onto the trigger: their mousedown would take focus back from the
        // menu.
        event.preventDefault();
        ctx.attach(native.pointerId);
        ctx.setLastPointerEvent(native);
        ctx.step(down, native);
        fireLongPress();
        return;
      }
      ctx.attach(native.pointerId);
      ctx.setLastPointerEvent(native);
      if (pointerType !== 'mouse') {
        ctx.startHold(inScrollView ? 'scroller' : 'plain', {
          x: native.clientX,
          y: native.clientY,
        });
      }
      ctx.step(down, native);
    },
    [ctx, fireLongPress],
  );

  const handleTriggerContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      // A finger held on the trigger is opening the menu, not asking for the
      // browser's own context menu.
      const gesture = ctx.gestureRef.current;
      if (gesture.phase !== 'idle' && gesture.pointerType !== 'mouse') {
        event.preventDefault();
      }
    },
    [ctx],
  );

  return useMemo(
    () => ({
      onPointerDown: handleTriggerPointerDown,
      onContextMenu: handleTriggerContextMenu,
    }),
    [handleTriggerPointerDown, handleTriggerContextMenu],
  );
}
