// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useChatKeyboard.ts
 * @input React refs, the keyboard module (useKeyboardHeight,
 *   claimTapFocus, refuseFocusReveal), the keyboard layout guide (each
 *   transition's start, resting value and curve), observeKeyboardDismiss, the
 *   animator, the touch query, the layout viewport's height
 *   (utils/layoutViewport.ts)
 * @output Exports useChatKeyboard: the lift ChatLayout lays its dock and
 *   message area out with, and the refs it puts on its dock, message area
 *   and composer region so the composer rides the software keyboard
 * @position ChatLayout's keyboard behavior (Chat/ChatLayout.tsx); internal
 *
 * Messages on iOS keeps its entry field on top of the keyboard: the field
 * rises and falls with the keyboard on the keyboard's own spring, the
 * transcript's scrollable area ends above the field, and a transcript at its
 * newest message stays there. ChatLayout does the same:
 *
 * - Layout follows the keyboard height (spec:AST-099 FR3): the dock rests
 *   `lift` px up from its bottom, the part of the keyboard that covers it,
 *   and the message area's end padding grows by the same height so the
 *   newest message can scroll above the lifted composer, with no element
 *   added for it. ChatLayout applies `lift` through functional styles, so
 *   the layout is right with no animation.
 * - The ride is polish on top, timed by the keyboard layout guide: the dock
 *   moves on the compositor (`translate`) on the curve the guide publishes
 *   (the keyboard's own spring, never a theme's) from the
 *   keyboard's own start, so it is where the keyboard is from its first
 *   frame, and a transcript at its newest message rides with it. The layout
 *   catches up once the ride ends, with the translate handed back in the
 *   same frame. Under Reduce Motion nothing travels (design:reduced-motion):
 *   the animator cross-fades on a touch screen and moves at once otherwise.
 *   A layout that shrinks waits until no finger is scrolling the transcript:
 *   shrinking mid-scroll (a drag that dismissed the keyboard) would put the
 *   end of the messages inside the scrollport until the scroll caught up,
 *   which Safari puts off while the finger is down, and the sticky dock
 *   would leave the bottom to sit at that end.
 * - A finger dragging the transcript down to the composer dismisses the
 *   keyboard when it lifts there or flicks toward it, Messages' `interactive`
 *   mode (keyboard/keyboardDismiss.ts; spec:AST-094 FR36, FR37): the composer
 *   is the bar on the keyboard, so its height is the dismiss padding. It is
 *   part of ChatLayout's touch behavior with no caller control
 *   (ChatLayout.spec.md FR10), registered only under a coarse pointer (FR19),
 *   and the dismissal only blurs the focused field: focus moves nowhere else,
 *   not to the composer region the keyboard's Done parks it on.
 * - A tap on the composer's text while it is not focused focuses it without
 *   Safari's reveal (`preventScroll`), which would otherwise scroll the
 *   whole page up to show a field that the keyboard is about to cover, and
 *   puts the caret where the finger lifted. The tap is the keyboard module's
 *   tap route (claimTapFocus): its end cancels the browser's own focus for
 *   that touch. Taps on anything else in the composer, and taps once the
 *   text has focus, are the browser's.
 * - Every other move into the composer's text (the keyboard's previous and
 *   next buttons, Tab, a script moving focus from another element, a text
 *   control tapped while another element has focus) is delivered the same
 *   way, by the keyboard module's focus takeover (refuseFocusReveal), under a
 *   finger and where the keyboard is measured. The keyboard's Done moves
 *   focus to the composer region ChatLayout names, which is no tab stop. A script's focus() while
 *   nothing has focus raises no event before Safari reveals the field, so
 *   nothing can take that move over: the composer's own focus routes pass
 *   `preventScroll` in this region (keyboardSurface.ts), and the tap route
 *   covers taps on the composer's text.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/ChatLayout.tsx and ChatLayout.doc.mjs
 * - /packages/core/src/keyboard/README.md (consumers)
 */

import {useRef, useState, useSyncExternalStore, type RefObject} from 'react';
import {useAnimator} from '../motion/useAnimator';
import {
  bringsUpKeyboard,
  claimTapFocus,
  findTextEntryControl,
  getKeyboardLayoutGuide,
  getMobileKeyboardHeight,
  isKeyboardMeasurable,
  observeKeyboardDismiss,
  refuseFocusReveal,
  useKeyboardHeight,
  type KeyboardTransition,
} from '../keyboard';
import {layoutViewportHeight} from '../utils/layoutViewport';
import {TOUCH_QUERY, useTouchPresentation} from '../utils/touchPresentation';
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
  /**
   * The part of the keyboard over the dock, CSS px: the dock's offset from
   * its bottom and the room the message area's end padding adds.
   */
  lift: number;
  /** Callback ref for the dock container. */
  dockRef: (element: HTMLElement | null) => void;
  /** Callback ref for the message area. */
  messagesRef: (element: HTMLElement | null) => void;
  /** Ref for the composer region whose text taps are claimed. */
  composerRef: RefObject<HTMLDivElement | null>;
}

// A transcript within this many px of its end counts as at its newest message.
const AT_END_SLOP = 2;
// How long the transcript must stay still after the finger lifts before a
// layout that waited for the scroll to end shrinks.
const SCROLL_SETTLE_MS = 150;

// The lift the layout shows: a store the ride's end and keyboard reports
// write, and render reads.
function createLiftStore() {
  let value = 0;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: number) => {
      if (next !== value) {
        value = next;
        for (const listener of listeners) {
          listener();
        }
      }
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

// Controls inside the composer's text (a token's button or link, an island
// that is not editable) keep their own taps, as ChatComposer's click-to-focus
// leaves them.
const OWN_TAPS =
  '[contenteditable="false"], button, a, [role="button"], [data-astryx-token]';

/**
 * The contenteditable text a touch landed in, when tapping it would bring up
 * the keyboard and it does not have focus yet. A text control (`<textarea>`,
 * `<input>`) is never claimed: the browser puts its caret under the finger.
 * Exported for its tests.
 */
export function editableToClaim(target: unknown): HTMLElement | null {
  let node = target as Node | null;
  if (node != null && node.nodeType !== 1) {
    node = node.parentNode;
  }
  const element = node as HTMLElement | null;
  if (element == null || typeof element.closest !== 'function') {
    return null;
  }
  const editable = element.closest<HTMLElement>(
    '[contenteditable]:not([contenteditable="false"])',
  );
  if (editable == null || !bringsUpKeyboard(editable)) {
    return null;
  }
  const own = element.closest(OWN_TAPS);
  if (own != null && editable.contains(own)) {
    return null;
  }
  const active = editable.ownerDocument.activeElement;
  return active === editable || editable.contains(active) ? null : editable;
}

/**
 * The collapsed caret at (x, y): the standard `caretPositionFromPoint`
 * (Firefox has only this one), or WebKit's `caretRangeFromPoint`.
 */
function caretRangeAt(doc: Document, x: number, y: number): Range | null {
  const position = doc.caretPositionFromPoint?.(x, y);
  if (position != null) {
    const range = doc.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  }
  return doc.caretRangeFromPoint?.(x, y) ?? null;
}

/**
 * Focuses without Safari's reveal and puts the caret under the finger.
 * Exported for its tests.
 */
export function focusAtPoint(editable: HTMLElement, x: number, y: number) {
  editable.focus({preventScroll: true});
  const doc = editable.ownerDocument;
  const range = caretRangeAt(doc, x, y);
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
 * <div ref={keyboard.messagesRef} {...stylex.props(styles.messages(keyboard.lift))}>…</div>
 * <div ref={keyboard.dockRef} {...stylex.props(styles.dock(keyboard.lift))}>
 *   <div ref={keyboard.composerRef}>…</div>
 * </div>
 * ```
 */
export function useChatKeyboard({
  rootRef,
  scrollRef,
  isSelfScrolling,
}: UseChatKeyboardOptions): UseChatKeyboardResult {
  const dock = useAnimator();
  const messages = useAnimator();
  const composerRef = useRef<HTMLDivElement>(null);
  const keyboardHeight = useKeyboardHeight(
    rootRef.current?.ownerDocument.defaultView,
  );
  // The lift the layout shows (read in render, so styles carry it) and its
  // mirror for the handlers below.
  const [liftStore] = useState(createLiftStore);
  const lift = useSyncExternalStore(
    liftStore.subscribe,
    liftStore.get,
    liftStore.get,
  );
  const liftRef = useRef(0);
  // Set while the guide's ride is under way: the layout waits for it. Each
  // ride's number, so only the latest one hands its translate back.
  const ridingRef = useRef(false);
  const rideRef = useRef(0);
  // Where the last ride took the dock's and the transcript's translates
  // (null: the transcript did not ride), until the layout takes them over.
  const dockTargetRef = useRef<number | null>(null);
  const messagesTargetRef = useRef<number | null>(null);
  // Whether the transcript was at its newest message, and where it was
  // scrolled, just before the layout's last change.
  const atEndRef = useRef(false);
  const scrollBeforeRef = useRef(0);
  const commitRef = useRef<() => void>(() => {});
  // Touch listeners only where the primary pointer is coarse (spec:AST-094
  // FR19): under a mouse the transcript registers none.
  const {isTouch} = useTouchPresentation();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const win = root?.ownerDocument.defaultView;
    if (root == null || win == null) {
      return undefined;
    }
    // A sticky dock rests at the root's bottom edge, which may sit above or
    // below the layout viewport's; a fixed dock rests at the viewport's.
    // While a keyboard is up the dock rises until it clears the keyboard's
    // cover; without one it rests where the layout puts it.
    const liftFor = (inset: number) => {
      if (inset <= 0) {
        return 0;
      }
      // In layout px, as the root's rect is, under a pinch zoom too.
      const viewportBottom = layoutViewportHeight(win);
      const bottom = isSelfScrolling
        ? root.getBoundingClientRect().bottom
        : viewportBottom;
      return Math.max(0, bottom - (viewportBottom - inset));
    };
    const isAtEnd = () => {
      const scroller = scrollRef.current;
      return (
        scroller != null &&
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <
          AT_END_SLOP
      );
    };
    // Fingers on the transcript, and a scroll that has not settled since the
    // last one lifted: a shrinking layout waits for both.
    let touches = 0;
    let settled = true;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const settle = () => {
      settled = false;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        settled = true;
        commit();
      }, SCROLL_SETTLE_MS);
    };
    const onTouches = (event: TouchEvent) => {
      touches = event.touches.length;
      if (touches === 0) {
        settle();
      }
    };
    const onScroll = () => {
      if (touches === 0 && !settled) {
        settle();
      }
    };

    // The layout takes the keyboard height's lift once no ride is under way.
    const commit = () => {
      if (ridingRef.current) {
        return;
      }
      const next = liftFor(getMobileKeyboardHeight(win));
      if (Math.abs(next - liftRef.current) < 0.5) {
        return;
      }
      if (next < liftRef.current && (touches > 0 || !settled)) {
        return;
      }
      atEndRef.current = isAtEnd();
      scrollBeforeRef.current = scrollRef.current?.scrollTop ?? 0;
      liftStore.set(next);
    };
    commitRef.current = commit;

    // The ride plays the curve the guide publishes with each transition
    // (INV11): the keyboard's own spring, a value and not a theme role, since
    // the system moves the keyboard on it whatever the theme says.
    const follow = (transition: KeyboardTransition) => {
      // The ride: the dock goes where the guide says the keyboard will be,
      // from the keyboard's start, relative to the layout it rests in now.
      const target = liftRef.current - liftFor(transition.to);
      const atEnd = isAtEnd();
      dockTargetRef.current = target;
      messagesTargetRef.current = atEnd ? target : null;
      if (!transition.animated) {
        rideRef.current += 1;
        ridingRef.current = false;
        dock.animator.set({y: target});
        if (atEnd) {
          messages.animator.set({y: target});
        }
        commit();
        return;
      }
      // Under Reduce Motion the animator's default applies: no travel, a
      // cross-fade on a touch screen (design:reduced-motion DR1, DR2).
      const timing = {at: transition.start};
      const shown = {y: target};
      ridingRef.current = true;
      rideRef.current += 1;
      const ride = rideRef.current;
      const rides = [
        dock.animator.animate(shown, {spring: transition.spring}, timing)
          .finished,
      ];
      if (atEnd) {
        rides.push(
          messages.animator.animate(shown, {spring: transition.spring}, timing)
            .finished,
        );
      }
      void Promise.all(rides)
        .then(async done => {
          // A newer ride took over: it commits when it ends.
          if (!done.every(Boolean) || ride !== rideRef.current) {
            return;
          }
          // Hand back only once the presented animations are over too, so a
          // paused animation (an inspector, a test holding the clock) is
          // never left on top of the new layout.
          const element = dock.animator.element;
          await Promise.all(
            (element?.getAnimations?.() ?? []).map(async animation =>
              animation.finished.catch(() => undefined),
            ),
          );
          if (ride === rideRef.current) {
            ridingRef.current = false;
            commit();
          }
        })
        .catch(() => undefined);
    };
    const passive = {passive: true} as const;
    // Fingers count, and a finger's scroll is waited out, only where they
    // can hold the layout: no touch-only listener under a fine pointer
    // (spec:AST-094 FR19, FR24).
    const followsFingers = isTouch && isKeyboardMeasurable(win);
    const scrollTarget: EventTarget | null = !followsFingers
      ? null
      : isSelfScrolling
        ? root
        : scrollRef.current === root.ownerDocument.documentElement
          ? win
          : scrollRef.current;
    if (followsFingers) {
      root.addEventListener('touchstart', onTouches, passive);
      root.addEventListener('touchend', onTouches, passive);
      root.addEventListener('touchcancel', onTouches, passive);
    }
    scrollTarget?.addEventListener('scroll', onScroll, passive);
    const guide = getKeyboardLayoutGuide(win);
    const unsubscribe = guide.subscribe(follow);
    // Mounted under a keyboard that is already up: take its place at once.
    commit();
    return () => {
      unsubscribe();
      ridingRef.current = false;
      clearTimeout(settleTimer);
      root.removeEventListener('touchstart', onTouches);
      root.removeEventListener('touchend', onTouches);
      root.removeEventListener('touchcancel', onTouches);
      scrollTarget?.removeEventListener('scroll', onScroll);
    };
  }, [
    rootRef,
    scrollRef,
    isSelfScrolling,
    dock.animator,
    messages.animator,
    liftStore,
    isTouch,
  ]);

  // A keyboard height the guide had no ride for (a resize, a rotation)
  // reaches the layout directly.
  useIsomorphicLayoutEffect(() => {
    commitRef.current();
  }, [keyboardHeight]);

  // The layout just moved by the lift's change: hand the dock's (and a
  // transcript at its end's) translate the difference, so nothing moves on
  // screen, and keep the newest message in view.
  useIsomorphicLayoutEffect(() => {
    const moved = lift - liftRef.current;
    if (Math.abs(moved) < 0.5) {
      return;
    }
    liftRef.current = lift;
    const dockTarget = dockTargetRef.current;
    const messagesTarget = messagesTargetRef.current;
    dockTargetRef.current = null;
    messagesTargetRef.current = null;
    // A ride that ended hands its translate (its target) to the layout; a
    // change no ride covered (a resize) is the layout's alone.
    if (dockTarget != null) {
      dock.animator.set({y: dockTarget + moved});
    }
    const scroller = scrollRef.current;
    if (scroller == null) {
      return;
    }
    // A translated transcript extends the scroller's range (WebKit counts it),
    // so its ride translate goes before the scroll is set, or the scroll can
    // stop past the content's end and the sticky dock rises to meet it.
    if (messagesTarget != null) {
      messages.animator.set({y: 0});
    }
    if (atEndRef.current) {
      // eslint-disable-next-line react-compiler/react-compiler -- imperative DOM: keeping the newest message in view
      scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;
    }
    // The padding's change may have clamped the scroll already: measure from
    // where it was before the layout changed.
    const shifted = scroller.scrollTop - scrollBeforeRef.current;
    if (messagesTarget != null && Math.abs(messagesTarget + shifted) >= 0.5) {
      messages.animator.set({y: messagesTarget + shifted});
    }
  }, [lift, scrollRef, dock.animator, messages.animator]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const win = root?.ownerDocument.defaultView;
    // Under a coarse pointer, with a keyboard to measure, only (FR19).
    if (root == null || win == null || !isTouch || !isKeyboardMeasurable(win)) {
      return undefined;
    }
    return observeKeyboardDismiss(root, {
      mode: 'interactive',
      // From the keyboard's top edge up to the composer's.
      dismissPadding: () => {
        const composer = composerRef.current;
        return composer == null
          ? 0
          : layoutViewportHeight(win) -
              getMobileKeyboardHeight(win) -
              composer.getBoundingClientRect().top;
      },
    });
  }, [rootRef, isTouch]);

  // A tap on the composer's text that would bring up the keyboard is the
  // keyboard module's tap route (spec:AST-099 FR4): focused here without
  // Safari's reveal, with the caret where the finger lifted. Only where the
  // keyboard is measured: inside an iframe nothing changes (FR7).
  useIsomorphicLayoutEffect(() => {
    const composer = composerRef.current;
    const win = composer?.ownerDocument.defaultView;
    if (composer == null || win == null || !isKeyboardMeasurable(win)) {
      return undefined;
    }
    return claimTapFocus(composer, {
      claim: editableToClaim,
      deliver: focusAtPoint,
    });
  }, []);

  // Every other move into the composer's text is the keyboard module's focus
  // takeover (spec:AST-099 FR4), where the keyboard is measured (FR6). A
  // desktop browser keeps its own focus (spec:AST-017 FR59): the pointer is
  // read on every blur, so a tablet that docks a mouse follows it. When the
  // keyboard's Done ends entry, focus leaves the composer's text for nothing
  // and moves to the composer region (FR4), a named group that is no tab
  // stop, so the next tap or Tab starts from the composer.
  useIsomorphicLayoutEffect(() => {
    const composer = composerRef.current;
    const win = composer?.ownerDocument.defaultView;
    if (composer == null || win == null || !isKeyboardMeasurable(win)) {
      return undefined;
    }
    return refuseFocusReveal(composer.ownerDocument, {
      isActive: () =>
        typeof win.matchMedia === 'function' &&
        win.matchMedia(TOUCH_QUERY).matches,
      claim: destination => findTextEntryControl(destination, composer),
      park: origin => {
        if (findTextEntryControl(origin, composer) != null) {
          composer.focus({preventScroll: true});
        }
      },
    });
  }, []);

  return {
    lift,
    dockRef: dock.ref,
    messagesRef: messages.ref,
    composerRef,
  };
}
