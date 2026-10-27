// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetSelfHold.ts
 * @input React (useEffect) and the DOM's pointer, touch, mouse and click
 *   events
 * @output Exports useSheetSelfHold, the entrance hold of a non-modal sheet
 * @position Internal to BottomSheet. Under a finger a presentation takes no
 *   input while it enters (`spec:AST-094` FR35); around a non-modal sheet only
 *   a tap or a drag on the sheet is held, and the page stays live
 *   (`component:BottomSheet` FR11). A modal sheet holds the viewport through
 *   the layer runtime's input hold instead (Layer/inputHold).
 */

import {useEffect, type RefObject} from 'react';

interface SelfHold {
  holders: number;
  pointers: Set<number>;
  touches: Set<number>;
  // Clicks still to come from held presses that lifted, each with its expiry.
  clicks: number[];
  detach: () => void;
}

const holds = new WeakMap<Element, SelfHold>();

// A click follows its lift within a frame or two; one that has not come by
// then never will.
const CLICK_WINDOW_MS = 1000;

function attach(element: Element): SelfHold {
  const swallow = (event: Event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
  };
  const maybeDetach = () => {
    const hold = holds.get(element);
    if (
      hold != null &&
      hold.holders === 0 &&
      hold.pointers.size === 0 &&
      hold.touches.size === 0 &&
      hold.clicks.length === 0
    ) {
      hold.detach();
      holds.delete(element);
    }
  };
  const expireClicks = (hold: SelfHold) => {
    const now = performance.now();
    hold.clicks = hold.clicks.filter(expiry => expiry > now);
  };
  const lifted = (hold: SelfHold) => {
    hold.clicks.push(performance.now() + CLICK_WINDOW_MS);
    setTimeout(() => {
      expireClicks(hold);
      maybeDetach();
    }, CLICK_WINDOW_MS + 50);
  };
  const onPointerDown = (event: Event) => {
    const hold = holds.get(element);
    if (hold == null || hold.holders === 0) {
      return;
    }
    hold.pointers.add((event as PointerEvent).pointerId);
    // No focus move, no compatibility mouse events, no activation.
    swallow(event);
  };
  const onPointer = (event: Event) => {
    const hold = holds.get(element);
    const id = (event as PointerEvent).pointerId;
    if (hold == null || !hold.pointers.has(id)) {
      return;
    }
    event.stopPropagation();
    if (event.type === 'pointerup' || event.type === 'pointercancel') {
      hold.pointers.delete(id);
      if (event.type === 'pointerup') {
        lifted(hold);
      }
      maybeDetach();
    }
  };
  const onTouchStart = (event: Event) => {
    const hold = holds.get(element);
    if (hold == null || hold.holders === 0) {
      return;
    }
    for (const touch of Array.from((event as TouchEvent).changedTouches)) {
      hold.touches.add(touch.identifier);
    }
    // Not cancelled: a pinch still zooms the page (spec:AST-094 FR10).
    event.stopPropagation();
  };
  const onTouchMove = (event: Event) => {
    const hold = holds.get(element);
    const touchEvent = event as TouchEvent;
    if (
      hold == null ||
      !Array.from(touchEvent.changedTouches).some(touch =>
        hold.touches.has(touch.identifier),
      )
    ) {
      return;
    }
    event.stopPropagation();
    // One finger: no scroll. Two: the page's pinch.
    if (touchEvent.touches.length === 1 && event.cancelable) {
      event.preventDefault();
    }
  };
  const onTouchEnd = (event: Event) => {
    const hold = holds.get(element);
    if (hold == null) {
      return;
    }
    let wasHeld = false;
    for (const touch of Array.from((event as TouchEvent).changedTouches)) {
      if (hold.touches.delete(touch.identifier)) {
        wasHeld = true;
      }
    }
    if (wasHeld) {
      event.stopPropagation();
      maybeDetach();
    }
  };
  const onMouse = (event: Event) => {
    const hold = holds.get(element);
    if (hold == null) {
      return;
    }
    expireClicks(hold);
    if (hold.holders > 0 || hold.clicks.length > 0) {
      swallow(event);
    }
  };
  const onClick = (event: Event) => {
    const hold = holds.get(element);
    if (hold == null) {
      return;
    }
    expireClicks(hold);
    if (hold.holders > 0 || hold.clicks.length > 0) {
      hold.clicks.shift();
      swallow(event);
      maybeDetach();
    }
  };
  const listeners: [string, (event: Event) => void][] = [
    ['pointerdown', onPointerDown],
    ['pointermove', onPointer],
    ['pointerup', onPointer],
    ['pointercancel', onPointer],
    ['touchstart', onTouchStart],
    ['touchmove', onTouchMove],
    ['touchend', onTouchEnd],
    ['touchcancel', onTouchEnd],
    ['mousedown', onMouse],
    ['mouseup', onMouse],
    ['click', onClick],
  ];
  for (const [type, listener] of listeners) {
    element.addEventListener(type, listener, {capture: true, passive: false});
  }
  return {
    holders: 0,
    pointers: new Set(),
    touches: new Set(),
    clicks: [],
    detach: () => {
      for (const [type, listener] of listeners) {
        element.removeEventListener(type, listener, {capture: true});
      }
    },
  };
}

/**
 * While `isHeld`, a press, touch or click that begins on `ref`'s element is
 * held for its whole life, as UIKit drops a touch that begins during a
 * presentation: it activates nothing, moves no focus, starts no drag, and
 * its one-finger moves scroll nothing. Input anywhere else is untouched, and
 * keys and assistive technology stay live.
 */
export function useSheetSelfHold(
  ref: RefObject<Element | null>,
  isHeld: boolean,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!isHeld || element == null) {
      return;
    }
    let hold = holds.get(element);
    if (hold == null) {
      hold = attach(element);
      holds.set(element, hold);
    }
    hold.holders += 1;
    const current = hold;
    return () => {
      current.holders -= 1;
      if (
        current.holders === 0 &&
        current.pointers.size === 0 &&
        current.touches.size === 0 &&
        current.clicks.length === 0
      ) {
        current.detach();
        holds.delete(element);
      }
    };
  }, [ref, isHeld]);
}
