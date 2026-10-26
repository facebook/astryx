// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuTriggerPress.ts
 * @input The menu press model's shared state (useMenuPress.ts), useLongPress,
 *   the native scroll probe and the menu press values
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

import {useCallback, useMemo, useRef, type RefObject} from 'react';
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

/**
 * How long a finger rests on the trigger before the menu opens under it,
 * with the 'pointer' touch model and no `longPressDelayMs`. A tap released
 * sooner opens the menu through the trigger's click.
 */
export const MENU_PRESS_LONG_PRESS_MS = 500;

/** What the trigger half reads and drives of the model. @internal */
export interface MenuTriggerContext {
  readonly optionsRef: RefObject<{
    isEnabled?: boolean;
    onTriggerPress?: (pointerType: MenuPressPointerType) => boolean;
    touchModel?: 'pointer' | 'uikit';
  }>;
  readonly gestureRef: RefObject<MenuPressState<HTMLElement>>;
  readonly triggerGestureRef: RefObject<number | null>;
  readonly longPressApiRef: RefObject<UseLongPressHandlers | null>;
  readonly holdKindRef: RefObject<'plain' | 'scroller'>;
  readonly lastPointerEventRef: RefObject<PointerEvent | null>;
  readonly ignoredPointerIdRef: RefObject<number | null>;
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
    ctx.triggerGestureRef.current = currentGesture();
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
  // opens as the finger presses, so its detector never runs.
  const isUikit = options.touchModel === 'uikit';
  const pointerHoldMs = options.longPressDelayMs ?? MENU_PRESS_LONG_PRESS_MS;
  const plainHold = useLongPress({
    onLongPress: fireLongPress,
    delayMs: pointerHoldMs,
  });
  const scrollerHold = useLongPress({
    onLongPress: fireLongPress,
    delayMs: isUikit ? DELAYS_CONTENT_TOUCHES_MS : pointerHoldMs,
    ...(isUikit ? {moveCancelPx: MENU_PRESS_HOLD_OPEN_SLOP_PX} : {}),
  });
  const holdDetectorsRef = useRef({plain: plainHold, scroller: scrollerHold});
  holdDetectorsRef.current = {plain: plainHold, scroller: scrollerHold};
  ctx.longPressApiRef.current =
    ctx.holdKindRef.current === 'scroller' ? scrollerHold : plainHold;

  const handleTriggerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const {isEnabled = true} = ctx.optionsRef.current;
      if (event.pointerId === ctx.ignoredPointerIdRef.current) {
        ctx.ignoredPointerIdRef.current = null;
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
        ctx.lastPointerEventRef.current = native;
        ctx.step(down, native);
        fireLongPress();
        return;
      }
      ctx.attach(native.pointerId);
      ctx.lastPointerEventRef.current = native;
      if (pointerType !== 'mouse') {
        ctx.holdKindRef.current = inScrollView ? 'scroller' : 'plain';
        ctx.longPressApiRef.current =
          ctx.holdKindRef.current === 'scroller'
            ? holdDetectorsRef.current.scroller
            : holdDetectorsRef.current.plain;
        ctx.longPressApiRef.current.start({
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
