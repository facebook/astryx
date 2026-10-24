// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useChatKeyboard.ts
 * @input React refs, the keyboard layout guide, the animator, the gesture
 *   system's tap recognizer, `springs.keyboard`
 * @output Exports useChatKeyboard: the refs ChatLayout puts on its dock,
 *   message area, keyboard spacer and composer region so the composer rides
 *   the software keyboard
 * @position ChatLayout's keyboard behavior (Chat/ChatLayout.tsx); internal
 *
 * Messages on iOS keeps its entry field on top of the keyboard: the field
 * rises and falls with the keyboard on the keyboard's own spring, the
 * transcript's scrollable area ends above the field, and a transcript at its
 * newest message stays there. ChatLayout does the same:
 *
 * - The dock (blur layer, scroll button, composer) moves by the part of the
 *   keyboard that covers it, on the compositor (`translate`), on
 *   `springs.keyboard` from the start time the keyboard layout guide gives,
 *   so it is where the keyboard is from its first frame. Reduce Motion
 *   leaves the keyboard's motion as it is, so the dock keeps its motion too.
 * - A spacer after the messages takes the same height, once per keyboard
 *   change, so the newest message can scroll above the lifted composer. A
 *   transcript at its newest message is scrolled to the new end in the same
 *   task and its content rides the keyboard's spring back from where it was
 *   (a FLIP on `translate`), so it moves with the composer instead of
 *   jumping.
 * - A tap on the composer's text while it is not focused focuses it without
 *   Safari's reveal (`preventScroll`), which would otherwise scroll the
 *   whole page up to show a field that the keyboard is about to cover, and
 *   puts the caret where the finger lifted. The tap is the gesture system's:
 *   recognizing it cancels the browser's own focus for that touch. Taps on
 *   anything else in the composer, and taps once the text has focus, are
 *   the browser's.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/ChatLayout.tsx and ChatLayout.doc.mjs
 * - /packages/core/src/keyboard/README.md (consumers)
 */

import {useRef, type RefObject} from 'react';
import {useAnimator} from '../motion/useAnimator';
import {springs} from '../motion/uikit';
import {TapGestureRecognizer, useGestureRecognizer} from '../gestures';
import {
  bringsUpKeyboard,
  getKeyboardLayoutGuide,
  type KeyboardTransition,
} from '../keyboard';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

export interface UseChatKeyboardOptions {
  /** ChatLayout's root. */
  rootRef: RefObject<HTMLElement | null>;
  /** The element that scrolls the transcript (the root, or an outer one). */
  scrollRef: RefObject<HTMLElement | null>;
  /**
   * Whether the root scrolls itself (a sticky dock at its bottom) rather
   * than an outer scroller (a fixed dock at the layout viewport's bottom).
   */
  isSelfScrolling: boolean;
}

export interface UseChatKeyboardResult {
  /** Callback ref for the dock container. */
  dockRef: (element: HTMLElement | null) => void;
  /** Callback ref for the message area. */
  messagesRef: (element: HTMLElement | null) => void;
  /** Ref for the spacer after the message area. */
  spacerRef: RefObject<HTMLDivElement | null>;
  /** Ref for the composer region whose text taps are claimed. */
  composerRef: RefObject<HTMLDivElement | null>;
}

// A transcript within this many px of its end counts as at its newest message.
const AT_END_SLOP = 2;

/**
 * The editable a touch landed in, when tapping it would bring up the
 * keyboard and it does not have focus yet.
 */
function editableToClaim(target: unknown): HTMLElement | null {
  let node = target as Node | null;
  if (node != null && node.nodeType !== 1) {
    node = node.parentNode;
  }
  const element = node as HTMLElement | null;
  if (element == null || typeof element.closest !== 'function') {
    return null;
  }
  const editable = element.closest<HTMLElement>(
    '[contenteditable]:not([contenteditable="false"]), textarea, input',
  );
  if (editable == null || !bringsUpKeyboard(editable)) {
    return null;
  }
  const active = editable.ownerDocument.activeElement;
  return active === editable || editable.contains(active) ? null : editable;
}

/** Focuses without Safari's reveal and puts the caret under the finger. */
function focusAtPoint(editable: HTMLElement, x: number, y: number) {
  editable.focus({preventScroll: true});
  const doc = editable.ownerDocument;
  const range = doc.caretRangeFromPoint?.(x, y);
  if (
    range != null &&
    editable.isContentEditable &&
    editable.contains(range.startContainer)
  ) {
    const selection = doc.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}

/**
 * Keeps ChatLayout's composer on top of the software keyboard.
 *
 * @example
 * ```
 * const keyboard = useChatKeyboard({rootRef, scrollRef, isSelfScrolling});
 * <div ref={keyboard.messagesRef}>…</div>
 * <div ref={keyboard.spacerRef} aria-hidden />
 * <div ref={keyboard.dockRef}><div ref={keyboard.composerRef}>…</div></div>
 * ```
 */
export function useChatKeyboard({
  rootRef,
  scrollRef,
  isSelfScrolling,
}: UseChatKeyboardOptions): UseChatKeyboardResult {
  const dock = useAnimator();
  const messages = useAnimator();
  const spacerRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  // The spacer's height: the part of the keyboard that covers the dock.
  const liftRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const win = root?.ownerDocument.defaultView;
    if (root == null || win == null) {
      return undefined;
    }
    const follow = (transition: KeyboardTransition) => {
      // A sticky dock rests at the root's bottom edge, which may sit above
      // or below the layout viewport's; a fixed dock rests at the
      // viewport's. While a keyboard is up the dock rises until it clears
      // the keyboard's cover; without one it rests where the layout puts it.
      const bottom = isSelfScrolling
        ? root.getBoundingClientRect().bottom
        : win.innerHeight;
      const lift =
        transition.to > 0
          ? Math.max(0, bottom - (win.innerHeight - transition.to))
          : 0;
      const timing = {at: transition.start, reducedMotion: 'keep'} as const;
      if (transition.animated) {
        dock.animator.animate({y: -lift}, {spring: springs.keyboard}, timing);
      } else {
        dock.animator.set({y: -lift});
      }

      const spacer = spacerRef.current;
      const scroller = scrollRef.current;
      if (
        spacer == null ||
        scroller == null ||
        Math.abs(lift - liftRef.current) < 0.5
      ) {
        return;
      }
      const atEnd =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <
        AT_END_SLOP;
      const before = scroller.scrollTop;
      spacer.style.height = `${lift}px`;
      liftRef.current = lift;
      if (atEnd) {
        // eslint-disable-next-line react-compiler/react-compiler -- imperative DOM: keeping the newest message in view
        scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;
      }
      // A clamp onto a smaller end moves the content as well.
      const moved = scroller.scrollTop - before;
      if (Math.abs(moved) < 0.5) {
        return;
      }
      // The content just moved by `moved`; hold it where it was and let it
      // follow the keyboard's spring from there.
      messages.animator.set({y: messages.animator.get('y') + moved});
      if (transition.animated) {
        messages.animator.animate({y: 0}, {spring: springs.keyboard}, timing);
      } else {
        messages.animator.set({y: 0});
      }
    };
    const guide = getKeyboardLayoutGuide(win);
    const unsubscribe = guide.subscribe(follow);
    if (guide.inset > 0) {
      // Mounted under a keyboard that is already up: take its place at once.
      follow({
        ...guide.transition,
        kind: 'change',
        from: guide.inset,
        start: win.performance.now(),
        animated: false,
      });
    }
    return unsubscribe;
  }, [rootRef, scrollRef, isSelfScrolling, dock.animator, messages.animator]);

  useGestureRecognizer(
    composerRef,
    () =>
      new TapGestureRecognizer({
        name: 'chat-composer-focus',
        allowedPointerTypes: ['touch'],
        shouldReceiveTouch: (_recognizer, touch) =>
          editableToClaim(touch.target) != null,
      }),
    tap => {
      if (tap.state !== 'ended') {
        return;
      }
      const {x, y} = tap.location();
      const target = composerRef.current?.ownerDocument.elementFromPoint(x, y);
      const editable = editableToClaim(target);
      if (editable != null) {
        focusAtPoint(editable, x, y);
      }
    },
  );

  return {
    dockRef: dock.ref,
    messagesRef: messages.ref,
    spacerRef,
    composerRef,
  };
}
