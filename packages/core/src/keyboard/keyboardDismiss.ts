// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardDismiss.ts
 * @input A scroller element, the keyboard module's height
 *   (getKeyboardHeight) and its dismissal blur (blurAsDismissal), the
 *   layout viewport's height (utils/layoutViewport.ts), bringsUpKeyboard
 *   and the shared release velocity (gestures/VelocityTracker)
 * @output Exports observeKeyboardDismiss and KeyboardDismissMode: dismisses
 *   the software keyboard from a drag on a scroller, as UIScrollView's
 *   `keyboardDismissMode`
 * @position Keyboard module (internal to core); ChatLayout opts its
 *   transcript in through Chat/useChatKeyboard.ts
 *
 * UIKit's modes, per scroller, default `none`:
 *
 * - `none`: dragging the scroller leaves the keyboard up.
 * - `interactive`: in UIKit the keyboard follows the finger down once the
 *   finger reaches its top. A page cannot move the system keyboard, so the
 *   drag decides once, when the finger lifts (spec:AST-094 FR36): if it
 *   lifts at or past the keyboard's top edge, less `dismissPadding` for a bar
 *   that sits on the keyboard (UIKeyboardLayoutGuide's
 *   `keyboardDismissPadding`), the keyboard is dismissed; otherwise it stays.
 *   The projection is none: a flick that lifts above that line keeps the
 *   keyboard however fast. A release moving back up cancels, however far the
 *   finger went (FR37); the release velocity is the one every gesture reads
 *   (spec:AST-100, FR40).
 *   measured: UIKit lab (injected host app), iOS 26.2 simulator, a
 *   full-screen UIScrollView with keyboardDismissMode .interactive and a
 *   focused field, with and without a 50 pt input accessory bar: drags
 *   lifting 100, 40 and 10 pt above the input views' top, at it, and 20, 60
 *   and 120 pt into it, at rest, slowly, fast and moving back up, Oct 25
 *   2026. Nothing moved above the top, however fast; at or past it every
 *   release dismissed but one moving up, which restored.
 *
 * UIKit's `onDrag`, which dismisses as a drag begins, is not offered: a drag
 * that dismisses the keyboard decides at its release (FR36).
 *
 * Only a drag that starts above that line, outside the focused field, while
 * a software keyboard is up, is followed: a drag in the bar or in the text
 * (moving the caret, selecting), or with only a hardware keyboard, never
 * dismisses. Every pointer drags (spec:AST-094 FR19, FR43): a finger, and a
 * pen the browser reports as touches, through touch listeners on the
 * scroller; a mouse, and a pen it reports as a pointer only, through a
 * `pointerdown` on the scroller and document listeners that live only while
 * the button is down (FR24). Every listener is passive: dismissal never
 * claims the touch or delays the scroll. It blurs the focused field, and the
 * keyboard layout guide reports the hide from the blur, so content on the
 * keyboard rides it down. Where the keyboard is comes from the keyboard
 * module, core's one source for it (spec:AST-099).
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md and the
 * consumers it lists.
 */

import {VelocityTracker} from '../gestures/VelocityTracker';
import {bringsUpKeyboard} from './keyboardLayoutGuide';
import {blurAsDismissal, getKeyboardHeight} from './keyboardHeight';
import {layoutViewportHeight} from '../utils/layoutViewport';

/** UIScrollView's `keyboardDismissMode`, the modes that decide at a release. */
export type KeyboardDismissMode = 'none' | 'interactive';

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
  // The keyboard's height over the layout viewport: 0 with no software
  // keyboard up (a hardware keyboard), or where nothing is measured.
  const keyboardHeight = () => getKeyboardHeight(win);
  // The touch being followed: only one, the first finger down while a field
  // that brings up the keyboard has focus; null between touches.
  let touchId: number | null = null;
  let padding = 0;
  const tracker = new VelocityTracker();

  // Where an interactive dismissal commits, in the layout viewport's
  // coordinates (clientY and the keyboard height share them), read in layout
  // px under a pinch zoom too (utils/layoutViewport.ts).
  const triggerLine = () =>
    layoutViewportHeight(win) - keyboardHeight() - padding;

  // Whether a drag starting at `clientY` on `target` is one to follow: a
  // field that brings up the keyboard has focus, a software keyboard is up
  // (none with a hardware keyboard on a touch screen, whatever the mode), and
  // the drag starts outside the field, above the line.
  const startsDismissDrag = (target: EventTarget | null, clientY: number) => {
    const editable = focusedEditable(doc);
    if (editable == null || keyboardHeight() <= 0) {
      return false;
    }
    if (target instanceof win.Node && editable.contains(target)) {
      return false;
    }
    padding = Math.max(0, dismissPadding?.() ?? 0);
    return clientY < triggerLine();
  };

  // The one decision, at the release (FR36, FR37).
  const decide = (clientY: number, timeStamp: number) => {
    // px per second, 0 after a still pause before the lift (spec:AST-100).
    const velocity = tracker.velocity(timeStamp).y;
    if (velocity < 0 || keyboardHeight() <= 0) {
      return;
    }
    // Where it lifts decides, with no projection (see the header).
    if (clientY < triggerLine()) {
      return;
    }
    // The keyboard module's dismissal: no surface parks the focus it leaves.
    const editable = focusedEditable(doc);
    if (editable != null) {
      blurAsDismissal(editable);
    }
  };

  // A mouse or a pen reported as a pointer only, followed while its button
  // is down; null between drags.
  let pointerId: number | null = null;

  const onTouchStart = (event: TouchEvent) => {
    // A pen the browser also reports as touches is followed as one.
    stopPointer();
    if (touchId != null || event.touches.length !== 1) {
      // A second finger: not a scroll drag to follow.
      touchId = null;
      return;
    }
    const touch = event.changedTouches[0];
    if (touch == null || !startsDismissDrag(event.target, touch.clientY)) {
      return;
    }
    touchId = touch.identifier;
    tracker.reset();
    tracker.add(touch.clientX, touch.clientY, event.timeStamp);
  };

  const followed = (event: TouchEvent): Touch | null => {
    if (touchId == null) {
      return null;
    }
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier === touchId) {
        return touch;
      }
    }
    return null;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = followed(event);
    if (touch != null) {
      tracker.add(touch.clientX, touch.clientY, event.timeStamp);
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    const touch = followed(event);
    if (touch == null) {
      return;
    }
    touchId = null;
    tracker.add(touch.clientX, touch.clientY, event.timeStamp);
    decide(touch.clientY, event.timeStamp);
  };

  // The browser cancelled the touch: no release, no decision.
  const onTouchCancel = (event: TouchEvent) => {
    if (followed(event) != null) {
      touchId = null;
    }
  };

  const passive = {passive: true} as const;
  const capture = {capture: true, passive: true} as const;

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId === pointerId) {
      tracker.add(event.clientX, event.clientY, event.timeStamp);
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }
    stopPointer();
    tracker.add(event.clientX, event.clientY, event.timeStamp);
    decide(event.clientY, event.timeStamp);
  };
  // The browser took the pointer (a pen's scroll): no release, no decision.
  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === pointerId) {
      stopPointer();
    }
  };
  function stopPointer() {
    if (pointerId == null) {
      return;
    }
    pointerId = null;
    doc.removeEventListener('pointermove', onPointerMove, true);
    doc.removeEventListener('pointerup', onPointerUp, true);
    doc.removeEventListener('pointercancel', onPointerCancel, true);
  }
  const onPointerDown = (event: PointerEvent) => {
    // A finger takes the touch listeners; only the primary button drags.
    if (
      event.pointerType === 'touch' ||
      !event.isPrimary ||
      event.button !== 0 ||
      touchId != null ||
      pointerId != null ||
      !startsDismissDrag(event.target, event.clientY)
    ) {
      return;
    }
    pointerId = event.pointerId;
    tracker.reset();
    tracker.add(event.clientX, event.clientY, event.timeStamp);
    // On the document while the button is down, so a release past the
    // scroller (on the composer) is heard; removed at the release (FR24).
    doc.addEventListener('pointermove', onPointerMove, capture);
    doc.addEventListener('pointerup', onPointerUp, capture);
    doc.addEventListener('pointercancel', onPointerCancel, capture);
  };

  scroller.addEventListener('touchstart', onTouchStart, passive);
  scroller.addEventListener('touchmove', onTouchMove, passive);
  scroller.addEventListener('touchend', onTouchEnd, passive);
  scroller.addEventListener('touchcancel', onTouchCancel, passive);
  scroller.addEventListener('pointerdown', onPointerDown, passive);
  return () => {
    stopPointer();
    scroller.removeEventListener('touchstart', onTouchStart);
    scroller.removeEventListener('touchmove', onTouchMove);
    scroller.removeEventListener('touchend', onTouchEnd);
    scroller.removeEventListener('touchcancel', onTouchCancel);
    scroller.removeEventListener('pointerdown', onPointerDown);
  };
}
