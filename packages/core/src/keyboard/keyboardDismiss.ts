// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardDismiss.ts
 * @input A scroller element, the keyboard layout guide, bringsUpKeyboard
 * @output Exports observeKeyboardDismiss and KeyboardDismissMode: dismisses
 *   the software keyboard from a drag on a scroller, as UIScrollView's
 *   `keyboardDismissMode`
 * @position Keyboard module (internal to core); ChatLayout opts its
 *   transcript in through Chat/useChatKeyboard.ts
 *
 * UIKit's three modes, each per scroller, default `none`:
 *
 * - `none`: dragging the scroller leaves the keyboard up.
 * - `onDrag`: the keyboard is dismissed when a drag begins. On the web that
 *   is the moment the browser claims the touch to scroll, which it announces
 *   with `pointercancel` for the touch's pointer. (A `scroll` while the
 *   finger is down is no signal: the page may scroll itself then.)
 * - `interactive`: in UIKit the keyboard follows the finger down. A page
 *   cannot move the system keyboard, so the keyboard is dismissed when the
 *   finger reaches it: its top edge, less `dismissPadding` for a bar that
 *   sits on the keyboard (UIKeyboardLayoutGuide's `keyboardDismissPadding`).
 *   Pulling back up cannot cancel it.
 *
 * Only a touch that starts above that line, outside the focused editable,
 * is followed: a drag in the bar or in the text (moving the caret, selecting)
 * never dismisses. Every listener is passive: dismissal never claims the
 * touch or delays the scroll. It blurs the focused editable, and the keyboard layout guide
 * reports the hide from the blur, so content on the keyboard rides it down.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md and the
 * consumers it lists.
 */

import {bringsUpKeyboard, getKeyboardLayoutGuide} from './keyboardLayoutGuide';

/** UIScrollView's `keyboardDismissMode`. */
export type KeyboardDismissMode = 'none' | 'onDrag' | 'interactive';

export interface KeyboardDismissOptions {
  readonly mode: KeyboardDismissMode;
  /**
   * For `interactive`: px above the keyboard's top edge where dismissal
   * begins, read when each touch starts (a bar on the keyboard passes its
   * height). Default 0.
   */
  readonly dismissPadding?: () => number;
}

/** The focused element, when it is one that brings up the keyboard. */
function focusedEditable(doc: Document): HTMLElement | null {
  let active = doc.activeElement as HTMLElement | null;
  // Focus inside a shadow root shows as its host.
  while (active?.shadowRoot?.activeElement != null) {
    active = active.shadowRoot.activeElement as HTMLElement;
  }
  return active != null && bringsUpKeyboard(active) ? active : null;
}

/**
 * Dismisses the software keyboard from drags that start on `scroller`.
 * Returns a cleanup.
 *
 * @example
 * ```
 * const stop = observeKeyboardDismiss(transcript, {
 *   mode: 'interactive',
 *   dismissPadding: () => composer.offsetHeight,
 * });
 * ```
 */
export function observeKeyboardDismiss(
  scroller: HTMLElement,
  {mode, dismissPadding}: KeyboardDismissOptions,
): () => void {
  if (mode === 'none') {
    return () => {};
  }
  const doc = scroller.ownerDocument;
  const win = doc.defaultView;
  if (win == null) {
    return () => {};
  }
  const guide = getKeyboardLayoutGuide(win);
  // The touch being followed: only one, the first finger down while an
  // editable has focus; null between touches and after a dismissal.
  let touchId: number | null = null;
  // The touch's pointer. Pointer events come before touch events, so the
  // latest touch pointer down is remembered and adopted by the touch start.
  let pointerId: number | null = null;
  let downPointerId: number | null = null;
  let padding = 0;

  // Where an interactive dismissal begins, in the layout viewport's
  // coordinates (clientY and the guide's inset share them).
  const triggerLine = () => win.innerHeight - guide.inset - padding;

  const dismiss = () => {
    touchId = null;
    pointerId = null;
    focusedEditable(doc)?.blur();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (touchId != null || event.touches.length !== 1) {
      // A second finger: not a scroll drag to follow.
      touchId = null;
      return;
    }
    const editable = focusedEditable(doc);
    const touch = event.changedTouches[0];
    if (editable == null || touch == null) {
      return;
    }
    if (event.target instanceof win.Node && editable.contains(event.target)) {
      return;
    }
    padding = Math.max(0, dismissPadding?.() ?? 0);
    if (touch.clientY >= triggerLine()) {
      return;
    }
    touchId = touch.identifier;
    pointerId = downPointerId;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (touchId == null || mode !== 'interactive' || guide.inset <= 0) {
      return;
    }
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier !== touchId) {
        continue;
      }
      if (touch.clientY >= triggerLine()) {
        dismiss();
      }
      return;
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier === touchId) {
        touchId = null;
        pointerId = null;
      }
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.isPrimary) {
      downPointerId = event.pointerId;
    }
  };

  // The browser took the touch to scroll: a drag began.
  const onPointerCancel = (event: PointerEvent) => {
    if (touchId != null && event.pointerId === pointerId) {
      dismiss();
    }
  };

  const passive = {passive: true} as const;
  scroller.addEventListener('touchstart', onTouchStart, passive);
  scroller.addEventListener('touchmove', onTouchMove, passive);
  scroller.addEventListener('touchend', onTouchEnd, passive);
  scroller.addEventListener('touchcancel', onTouchEnd, passive);
  if (mode === 'onDrag') {
    scroller.addEventListener('pointerdown', onPointerDown, passive);
    scroller.addEventListener('pointercancel', onPointerCancel, passive);
  }
  return () => {
    scroller.removeEventListener('touchstart', onTouchStart);
    scroller.removeEventListener('touchmove', onTouchMove);
    scroller.removeEventListener('touchend', onTouchEnd);
    scroller.removeEventListener('touchcancel', onTouchEnd);
    scroller.removeEventListener('pointerdown', onPointerDown);
    scroller.removeEventListener('pointercancel', onPointerCancel);
  };
}
