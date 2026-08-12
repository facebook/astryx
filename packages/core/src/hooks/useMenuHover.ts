// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMenuHover.ts
 * @input Uses React hooks, useListFocus, useMediaQuery
 * @output Exports useMenuHover hook
 * @position Internal hook; used by nav heading components, TopNavMenu,
 *           TopNavMegaMenu and DropdownMenuSubMenu
 *
 * Hover as a progressive enhancement on top of standard popover behavior:
 *
 * 1. Default popover: click toggles, Escape closes, outside-click closes,
 *    arrow keys navigate menu items.
 *
 * 2. Hover add-on:
 *    - mouseenter activates "hover mode" and opens after delay
 *    - While in hover mode, mouseleave closes after delay
 *    - Any close (click, Escape, outside-click) resets hover mode
 *    - A close briefly suppresses reopening on hover — see REOPEN_SUPPRESS_MS
 *
 * Only uses mouseenter/mouseleave (not mouseover).
 *
 * ## Hover → click guard (issue #3121)
 *
 * A menu that opens on hover is, by the time the pointer arrives, already open
 * under the cursor — so the click the user naturally makes next would toggle it
 * straight back shut. Within `clickGuardMs` of a hover-open, a click therefore
 * *confirms* the menu instead of closing it: the menu pins (mouseleave no
 * longer closes it) and behaves exactly like a click-open from then on. A
 * deliberate click outside that window still closes.
 *
 * ## Focus
 *
 * Opening a menu moves focus into it — except on hover, where the pointer, not
 * the keyboard, is driving and stealing focus would be hostile. So:
 *
 * - hover-open  → `show({skipAutoFocus: true})`, focus stays on the trigger
 * - click-open  → focus moves to the first item
 * - click-confirm (the guard above) → focus moves to the first item, so a
 *   confirmed menu is indistinguishable from a click-opened one
 * - click-close → focus returns to the trigger
 *
 * Focus is moved *synchronously* inside the event handler. `useLayer.show()`
 * calls `showPopover()` synchronously and the layer's children are always
 * mounted (the element is a `[popover]`, hidden rather than unmounted), so the
 * items are focusable the moment `show()` returns. Do NOT reintroduce a
 * `requestAnimationFrame` here: a deferred focus lands after paint, is visible
 * to the user as a jump, and races anything else that moves focus in between.
 *
 * The hook always calls `show({skipAutoFocus: true})` and owns focus itself,
 * because the popover's own auto-focus targets the first *tabbable* node in the
 * focus trap, while a menu wants its first item — and menu items carry
 * `tabindex="-1"` under roving tabindex, so the two disagree. Letting both run
 * means two different elements get focused a frame apart.
 *
 * ## Native light dismiss
 *
 * When the popup is a native `popover="auto"` (the `hasLightDismiss` default of
 * `usePopover`/`useLayer`) the browser light-dismisses it on any pointer
 * interaction outside the panel — and a trigger that sits outside the panel
 * counts as outside. The dismissal is dispatched before React's click handler
 * runs, so a hover-opened menu can close from under the click before the guard
 * above ever sees it.
 *
 * Pass `popoverId` to fix that: the hook stamps `popoverTarget` on the trigger,
 * which makes it the panel's native *invoker* and exempts it from light
 * dismiss, and cancels the invoker's default toggle with `preventDefault()` so
 * this hook stays the single source of truth for what a click means. Consumers
 * whose trigger lives outside the panel and who keep light dismiss on should
 * pass it. (jsdom implements neither light dismiss nor invokers, so this wiring
 * can only be verified in a real browser.)
 */

import {useCallback, useEffect, useRef} from 'react';
import {useListFocus} from './useListFocus';
import {useMediaQuery} from './useMediaQuery';

/**
 * How long after a hover-open a click still counts as confirming the menu
 * rather than dismissing it.
 */
const DEFAULT_CLICK_GUARD_MS = 500;

/**
 * How long after a close a mouseenter on the trigger is ignored.
 *
 * A menu panel is often positioned over its own trigger (the nav headings do
 * this). Closing it puts the trigger back under a pointer that never moved, and
 * the browser fires a fresh mouseenter for that — which, with a short show
 * delay, reopens the menu the user just dismissed. Escape and the in-panel
 * close affordance both looked inert because of it.
 *
 * Time-bounded rather than a one-shot flag: the enter caused by the panel
 * vanishing arrives within a frame or two, while a deliberate re-hover seconds
 * later is a real intent to reopen and must still work.
 */
const REOPEN_SUPPRESS_MS = 300;

export interface UseMenuHoverOptions {
  show: (options?: {skipAutoFocus?: boolean}) => void;
  hide: () => void;
  isOpen: boolean;
  isEnabled: boolean;
  /** Delay before a hover opens the menu (ms). @default 150 */
  showDelay?: number;
  /** Delay before leaving the trigger or menu closes it (ms). @default 200 */
  hideDelay?: number;
  /**
   * Window after a hover-open in which a click confirms the menu instead of
   * closing it. Set to 0 to opt out and have every click toggle. @default 500
   */
  clickGuardMs?: number;
  /**
   * Selector for the menu's focusable items, forwarded to `useListFocus`.
   * Menus of `role="menuitem"` rows need no override; a panel of links (a mega
   * menu) does. @default '[role="menuitem"]'
   */
  itemSelector?: string;
  /**
   * The popup's DOM id (`usePopover().id` / `useLayer().id`). Supply it when
   * the popup is a native `popover="auto"` and the trigger sits outside it —
   * see "Native light dismiss" above. Omit it for `popover="manual"` popups and
   * for triggers rendered inside the panel.
   */
  popoverId?: string;
}

export interface UseMenuHoverReturn<T extends HTMLElement = HTMLElement> {
  triggerProps: {
    onClick: (event?: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    /** Present only when `popoverId` is supplied. */
    popoverTarget?: string;
  };
  contentProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  menuRef: React.RefObject<T | null>;
  /** Focus the first enabled item. Returns false when there was none. */
  focusFirst: () => boolean;
  /**
   * Focus the first enabled item, falling back to the menu container when the
   * menu is empty or still loading.
   */
  focusMenu: () => void;
  /**
   * For consumers that own their own click handler (a menu whose trigger is a
   * row in a parent menu, say, with its own focus and keyboard model): call
   * this at the top of the open branch of that handler. When the click is the
   * one that naturally follows a hover-open, it pins the menu and returns
   * `true` — meaning the click has been consumed and must NOT close the menu.
   * Returns `false` for an ordinary click, which the consumer handles as usual.
   *
   * This keeps the guard policy — the window, and what pinning means — in one
   * place instead of copied into each caller.
   */
  confirmHoverOpen: () => boolean;
  /**
   * Close the menu and return focus to the trigger when the menu was holding
   * it. For dismiss affordances rendered *inside* the popup (e.g. the heading
   * replica in the nav headings): those are close buttons, not the trigger, so
   * routing them through `triggerProps.onClick` would give them toggle — and
   * keyboard-activation — semantics they should not have.
   */
  close: () => void;
  setTriggerEl: (el: HTMLElement | null) => void;
}

export function useMenuHover<T extends HTMLElement = HTMLElement>(
  options: UseMenuHoverOptions,
): UseMenuHoverReturn<T> {
  const {
    show,
    hide,
    isOpen,
    isEnabled,
    showDelay = 150,
    hideDelay = 200,
    clickGuardMs = DEFAULT_CLICK_GUARD_MS,
    itemSelector,
    popoverId,
  } = options;

  const hasHover = useMediaQuery('(hover: hover)');

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);
  // Whether the menu was opened/interacted via hover (enables mouseleave-to-close)
  const hoverModeRef = useRef(false);
  // When the menu last closed, for suppressing the reopen described above.
  const closedAtRef = useRef(0);
  // When the current open began as a hover-open; 0 once confirmed or closed.
  const hoverOpenedAtRef = useRef(0);
  const prevIsOpenRef = useRef(isOpen);

  // When the menu closes for ANY reason — click, Escape, the in-panel close
  // affordance, native light dismiss, an item being chosen — reset hover mode
  // and start the reopen-suppression window.
  if (prevIsOpenRef.current && !isOpen) {
    hoverModeRef.current = false;
    hoverOpenedAtRef.current = 0;
    closedAtRef.current = Date.now();
  }
  prevIsOpenRef.current = isOpen;

  const clearTimeouts = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Escape is handled by useListFocus, which is declared below but needs the
  // hide-and-restore behavior defined after it (it reads the list ref). The
  // indirection keeps both honest without a use-before-declare.
  const escapeHandlerRef = useRef<() => void>(() => {});

  const {
    listRef: menuRef,
    handleKeyDown: handleListKeyDown,
    focusFirst,
  } = useListFocus<T>({
    itemSelector,
    onEscape: () => escapeHandlerRef.current(),
  });

  // Hide, and keep focus with the trigger instead of letting it drop to
  // <body> when the element holding focus is the menu being hidden. Read the
  // active element *before* hiding: closing the layer moves focus itself.
  const hideAndRestoreFocus = useCallback(() => {
    const menuHadFocus =
      menuRef.current?.contains(document.activeElement) ?? false;
    hide();
    if (menuHadFocus) {
      triggerElRef.current?.focus();
    }
  }, [hide, menuRef]);

  useEffect(() => {
    escapeHandlerRef.current = () => {
      clearTimeouts();
      hideAndRestoreFocus();
    };
  }, [clearTimeouts, hideAndRestoreFocus]);

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  // Open by pointer/keyboard activation: the layer is visible synchronously, so
  // focus moves in the same tick. See the "Focus" note in the file header.
  const focusMenu = useCallback(() => {
    // An empty or still-loading menu (e.g. a submenu showing only a disabled
    // "Loading…" row) has no focusable item. Fall back to the menu container
    // so keyboard ownership still transfers off the trigger's list — otherwise
    // arrow keys keep roving the parent while this menu sits open.
    if (!focusFirst()) {
      menuRef.current?.focus();
    }
  }, [focusFirst, menuRef]);

  const openAndFocus = useCallback(() => {
    show({skipAutoFocus: true});
    focusMenu();
  }, [show, focusMenu]);

  // Is a click landing right now the one that naturally follows a hover-open?
  // If so, consume it: pin the menu (mouseleave no longer closes it) and report
  // that the caller must not treat this click as a dismissal.
  const confirmHoverOpen = useCallback((): boolean => {
    const isConfirming =
      clickGuardMs > 0 &&
      hoverOpenedAtRef.current > 0 &&
      Date.now() - hoverOpenedAtRef.current < clickGuardMs;
    if (!isConfirming) {
      return false;
    }
    hoverModeRef.current = false;
    hoverOpenedAtRef.current = 0;
    return true;
  }, [clickGuardMs]);

  // Click: toggles, except that a click confirming a fresh hover-open pins the
  // menu instead of dismissing it.
  const handleClick = useCallback(
    (event?: React.MouseEvent) => {
      // Cancel the native invoker's default toggle so this handler remains the
      // single source of truth; popoverTarget still exempts the trigger from
      // native light dismiss.
      if (popoverId) {
        event?.preventDefault();
      }
      clearTimeouts();

      // Keyboard activation (Enter/Space arrive as a click with detail 0)
      // always OPENS and moves focus into the menu — it never toggles the menu
      // shut. A keyboard user can only reach the trigger while the menu is open
      // because a hover-open deliberately left focus behind; closing on Enter
      // would make the menu unreachable by keyboard from that state.
      const isKeyboardActivation = event != null && event.detail === 0;
      if (isKeyboardActivation) {
        closedAtRef.current = 0;
        hoverModeRef.current = false;
        hoverOpenedAtRef.current = 0;
        if (isOpen) {
          focusMenu();
        } else {
          openAndFocus();
        }
        return;
      }

      if (!isOpen) {
        closedAtRef.current = 0;
        hoverModeRef.current = false;
        hoverOpenedAtRef.current = 0;
        openAndFocus();
        return;
      }

      if (confirmHoverOpen()) {
        // Pinned: from here it behaves like any click-open, including
        // surviving mouseleave and owning focus.
        focusMenu();
        return;
      }

      hideAndRestoreFocus();
    },
    [
      popoverId,
      clearTimeouts,
      isOpen,
      confirmHoverOpen,
      openAndFocus,
      focusMenu,
      hideAndRestoreFocus,
    ],
  );

  // Hover: mouseenter activates hover mode and opens
  const handleMouseEnter = useCallback(() => {
    if (!hasHover) {
      return;
    }
    // See REOPEN_SUPPRESS_MS: ignore the mouseenter that the panel's own
    // disappearance produces, so closing the menu actually closes it.
    if (
      closedAtRef.current > 0 &&
      Date.now() - closedAtRef.current < REOPEN_SUPPRESS_MS
    ) {
      return;
    }
    // Only an enter that *opens* the menu arms hover mode. Re-entering the
    // trigger of a menu that is already open must not convert a pinned menu
    // (click-opened, or a confirmed hover-open) back into one that closes on
    // mouseleave — nor re-arm the click guard, which would turn the user's next
    // deliberate click into another "confirm" and make the menu undismissable.
    if (isOpen) {
      clearTimeouts();
      return;
    }
    hoverModeRef.current = true;
    clearTimeouts();
    const openByHover = () => {
      hoverOpenedAtRef.current = Date.now();
      show({skipAutoFocus: true});
    };
    if (showDelay > 0) {
      showTimerRef.current = setTimeout(openByHover, showDelay);
    } else {
      openByHover();
    }
  }, [hasHover, isOpen, clearTimeouts, show, showDelay]);

  // Hover: mouseleave only closes if in hover mode
  const handleMouseLeave = useCallback(() => {
    if (!hoverModeRef.current) {
      return;
    }
    clearTimeouts();
    hideTimerRef.current = setTimeout(() => {
      hide();
    }, hideDelay);
  }, [clearTimeouts, hide, hideDelay]);

  // Content: mouseenter cancels pending hide
  const handleContentMouseEnter = useCallback(() => {
    clearTimeouts();
  }, [clearTimeouts]);

  const setTriggerRef = useCallback((el: HTMLElement | null) => {
    triggerElRef.current = el;
  }, []);

  const noop = useCallback(() => {}, []);
  const noopRef = useCallback((_el: HTMLElement | null) => {}, []);
  const noopKeyDown = useCallback((_e: React.KeyboardEvent) => {}, []);

  if (!isEnabled) {
    return {
      triggerProps: {onClick: noop, onMouseEnter: noop, onMouseLeave: noop},
      contentProps: {
        onMouseEnter: noop,
        onMouseLeave: noop,
        onKeyDown: noopKeyDown,
      },
      menuRef,
      focusFirst,
      focusMenu,
      confirmHoverOpen,
      close: hideAndRestoreFocus,
      setTriggerEl: noopRef,
    };
  }

  return {
    triggerProps: {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ...(popoverId ? {popoverTarget: popoverId} : null),
    },
    contentProps: {
      onMouseEnter: handleContentMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleListKeyDown,
    },
    menuRef,
    focusFirst,
    focusMenu,
    confirmHoverOpen,
    close: hideAndRestoreFocus,
    setTriggerEl: setTriggerRef,
  };
}
