// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMenuHover.ts
 * @input Uses React hooks, useListFocus, useMediaQuery
 * @output Exports useMenuHover hook
 * @position Internal hook; used by nav heading components, TopNavMenu,
 *           TopNavMegaMenu and DropdownMenuSubMenu
 *
 * Hover as a progressive enhancement over standard popover behavior: click
 * toggles, Escape and outside-click close, arrows navigate; on top of that,
 * mouseenter opens after a delay and mouseleave closes one that hover opened.
 *
 * Three behaviors here are not obvious and are load-bearing:
 *
 * 1. Hover→click guard (#3121). A hover-opened menu is already open under the
 *    cursor when the pointer arrives, so the click that naturally follows would
 *    toggle it shut. Within `clickGuardMs` a click instead confirms it: the menu
 *    pins and behaves like a click-open from then on.
 *
 * 2. Focus moves synchronously. `useLayer.show()` calls `showPopover()` in the
 *    same tick and the layer's children are always mounted, so items are
 *    focusable the moment `show()` returns — a `requestAnimationFrame` here
 *    lands after paint and races anything else moving focus. Hover-opens are the
 *    exception: the pointer is driving, so focus stays on the trigger. The hook
 *    always passes `skipAutoFocus` and owns focus itself, because the popover's
 *    auto-focus targets the first *tabbable* node while a menu wants its first
 *    item — under roving tabindex those are different elements.
 *
 * 3. Native light dismiss. A `popover="auto"` is dismissed by the browser on
 *    pointer interaction outside the panel, and a trigger outside the panel
 *    counts — before React's click handler runs. `popoverId` makes the trigger
 *    the panel's invoker, which exempts it. jsdom implements neither light
 *    dismiss nor invokers, so that wiring is only verifiable in a browser.
 */

import {useCallback, useEffect, useRef} from 'react';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';
import {useListFocus} from './useListFocus';
import {useMediaQuery} from './useMediaQuery';

const DEFAULT_CLICK_GUARD_MS = 500;

/**
 * How long after a close a mouseenter on the trigger is ignored.
 *
 * A panel positioned over its own trigger puts that trigger back under a
 * stationary pointer when it closes, and the browser fires a fresh mouseenter —
 * which reopened the menu the user had just dismissed. Time-bounded rather than
 * a one-shot flag, so a deliberate re-hover seconds later still opens; a real
 * mouseleave clears it early.
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
   * closing it. 0 opts out, making every click toggle. @default 500
   */
  clickGuardMs?: number;
  /**
   * Selector for the menu's focusable items, forwarded to `useListFocus`. A
   * panel of links (a mega menu) needs an override; `role="menuitem"` rows do
   * not. @default '[role="menuitem"]'
   */
  itemSelector?: string;
  /**
   * The popup's DOM id (`usePopover().id`). Supply it when the popup is a
   * native `popover="auto"` and the trigger sits outside it; omit it for
   * `popover="manual"` popups and triggers inside the panel.
   */
  popoverId?: string;
  /**
   * Whether the hook moves focus on a click or keyboard open. False for
   * consumers that wire the pointer half only and leave focus to the popover's
   * own trap — a panel that is a dialog rather than a menu (`SideNavItem`'s
   * collapsed flyout) has no items for the hook to focus. @default true
   */
  ownsFocus?: boolean;
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
   * For consumers with their own click handler: call this in the open branch.
   * Returns `true` when the click was the one following a hover-open — the menu
   * is now pinned and the click must NOT be treated as a dismissal.
   */
  confirmHoverOpen: () => boolean;
  /**
   * Close, restoring focus to the trigger. For dismiss affordances rendered
   * inside the popup, which are close buttons rather than the trigger and so
   * must not carry its toggle and keyboard-activation semantics.
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
    ownsFocus = true,
  } = options;

  const hasHover = useMediaQuery('(hover: hover)');

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);
  /** Menu was hover-opened, so mouseleave may close it. */
  const hoverModeRef = useRef(false);
  const closedAtRef = useRef(0);
  /** When the current open began as a hover-open; 0 once confirmed or closed. */
  const hoverOpenedAtRef = useRef(0);
  const prevIsOpenRef = useRef(isOpen);

  // Catches every close, whatever caused it. A layout effect, not render: it
  // must land before the browser hit-tests the vanished panel and fires the
  // mouseenter REOPEN_SUPPRESS_MS exists to swallow.
  useIsomorphicLayoutEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (wasOpen && !isOpen) {
      hoverModeRef.current = false;
      hoverOpenedAtRef.current = 0;
      closedAtRef.current = Date.now();
    }
  }, [isOpen]);

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

  // useListFocus needs an onEscape that is defined in terms of its own listRef;
  // the indirection avoids the use-before-declare.
  const escapeHandlerRef = useRef<() => void>(() => {});

  const {
    listRef: menuRef,
    handleKeyDown: handleListKeyDown,
    focusFirst,
  } = useListFocus<T>({
    itemSelector,
    onEscape: () => escapeHandlerRef.current(),
  });

  const hideAndRestoreFocus = useCallback(() => {
    // Read before hiding: closing the layer moves focus itself.
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

  const focusMenu = useCallback(() => {
    // An empty or still-loading menu has no focusable item; focus the container
    // so keyboard ownership still transfers off the trigger's list.
    if (!focusFirst()) {
      menuRef.current?.focus();
    }
  }, [focusFirst, menuRef]);

  const openAndFocus = useCallback(() => {
    if (!ownsFocus) {
      show();
      return;
    }
    show({skipAutoFocus: true});
    focusMenu();
  }, [ownsFocus, show, focusMenu]);

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

  const handleClick = useCallback(
    (event?: React.MouseEvent) => {
      // Cancel the invoker's default toggle so this handler stays the single
      // source of truth; popoverTarget still exempts the trigger from dismissal.
      if (popoverId) {
        event?.preventDefault();
      }
      clearTimeouts();

      // Enter/Space arrive as a click with detail 0, and always open. A keyboard
      // user reaches the trigger of an open menu only because a hover-open left
      // focus behind; closing there would stranded them outside a visible menu.
      const isKeyboardActivation = event != null && event.detail === 0;
      if (isKeyboardActivation) {
        closedAtRef.current = 0;
        hoverModeRef.current = false;
        hoverOpenedAtRef.current = 0;
        if (isOpen) {
          if (ownsFocus) {
            focusMenu();
          }
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
        if (ownsFocus) {
          focusMenu();
        }
        return;
      }

      hideAndRestoreFocus();
    },
    [
      popoverId,
      clearTimeouts,
      isOpen,
      ownsFocus,
      confirmHoverOpen,
      openAndFocus,
      focusMenu,
      hideAndRestoreFocus,
    ],
  );

  const handleMouseEnter = useCallback(() => {
    if (!hasHover) {
      return;
    }
    if (
      closedAtRef.current > 0 &&
      Date.now() - closedAtRef.current < REOPEN_SUPPRESS_MS
    ) {
      return;
    }
    // Re-entering an open menu's trigger must not un-pin it or re-arm the
    // guard, which would make the next deliberate click another "confirm" and
    // leave the menu undismissable.
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

  const handleMouseLeave = useCallback(() => {
    // A real leave ends the stationary-pointer case the suppression window
    // exists for, so the next enter is deliberate whenever it arrives.
    closedAtRef.current = 0;
    if (!hoverModeRef.current) {
      return;
    }
    clearTimeouts();
    hideTimerRef.current = setTimeout(() => {
      hide();
    }, hideDelay);
  }, [clearTimeouts, hide, hideDelay]);

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
