'use client';

/**
 * @file useMenuHoverIntent.ts
 * @input Uses React hooks, matchMedia, useXDSPopover, useListFocus
 * @output Exports useMenuHoverIntent hook for hover-to-open menu behavior
 * @position Internal hook; used by XDSSideNavHeading and XDSTopNavHeading
 *
 * Replicates XDSTopNavMenu's interaction model for nav heading menus:
 * - Hover to open (with delay), hover to close (with delay)
 * - Click to lock open (hover away won't close), click again to release
 * - Arrow-key navigation through menu items via useListFocus
 * - Escape to close and return focus to trigger
 * - skipAutoFocus on hover-triggered show (focus stays on trigger)
 * - Only activates hover on devices with pointer capability
 *
 * Timings match XDSTopNavMenu defaults: 150ms show, 200ms hide.
 */

import {useCallback, useEffect, useRef} from 'react';
import {useListFocus} from './useListFocus';

interface UseMenuHoverIntentOptions {
  /** Popover show function (from useXDSPopover) */
  show: (options?: {skipAutoFocus?: boolean}) => void;
  /** Popover hide function (from useXDSPopover) */
  hide: () => void;
  /** Whether the popover is currently open (from useXDSPopover) */
  isOpen: boolean;
  /** Whether the menu is provided (hook is a no-op when false) */
  isEnabled: boolean;
  /** Delay before showing on hover (ms) @default 150 */
  showDelay?: number;
  /** Delay before hiding after mouseleave (ms) @default 200 */
  hideDelay?: number;
}

interface UseMenuHoverIntentReturn {
  /** Spread on the heading trigger container */
  triggerHoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
  };
  /** Spread on the popover content wrapper */
  contentHoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** Ref to attach to the menu content container for arrow-key focus */
  menuRef: React.RefObject<HTMLElement | null>;
  /** Whether the menu was opened via click (locked open) */
  isClickLocked: boolean;
}

const HOVER_QUERY = '(hover: hover)';

/**
 * Hook that replicates XDSTopNavMenu's interaction model for heading menus.
 *
 * Returns props for both the trigger and content, plus a menuRef for
 * arrow-key navigation. The click-to-lock pattern means a click pins the
 * menu open (hover away won't close it), and a second click releases.
 *
 * @example
 * ```
 * const {triggerHoverProps, contentHoverProps, menuRef} = useMenuHoverIntent({
 *   show: popover.show,
 *   hide: popover.hide,
 *   isOpen: popover.isOpen,
 *   isEnabled: !!menu,
 * });
 *
 * <div {...triggerHoverProps}>Heading trigger</div>
 * {popover.render(
 *   <div ref={menuRef} {...contentHoverProps}>{menu}</div>
 * )}
 * ```
 */
export function useMenuHoverIntent(
  options: UseMenuHoverIntentOptions,
): UseMenuHoverIntentReturn {
  const {
    show,
    hide,
    isOpen,
    isEnabled,
    showDelay = 150,
    hideDelay = 200,
  } = options;

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickLockedRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const canHoverRef = useRef(false);

  // Arrow-key focus management inside the menu content
  const {
    listRef: menuRef,
    handleKeyDown: handleListKeyDown,
    focusFirst,
  } = useListFocus({
    onEscape: () => {
      clearTimers();
      clickLockedRef.current = false;
      hide();
      triggerRef.current?.focus();
    },
  });

  // Check for hover capability once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      canHoverRef.current = window.matchMedia(HOVER_QUERY).matches;
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const scheduleShow = useCallback(() => {
    if (!canHoverRef.current) return;
    clearTimers();
    showTimerRef.current = setTimeout(() => {
      show({skipAutoFocus: true});
    }, showDelay);
  }, [clearTimers, show, showDelay]);

  const scheduleHide = useCallback(() => {
    if (!canHoverRef.current) return;
    clearTimers();
    hideTimerRef.current = setTimeout(() => {
      hide();
    }, hideDelay);
  }, [clearTimers, hide, hideDelay]);

  const handleMouseEnter = useCallback(() => {
    if (!clickLockedRef.current) scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    if (!clickLockedRef.current) scheduleHide();
  }, [scheduleHide]);

  const handleContentMouseEnter = useCallback(() => {
    // Cancel any pending hide when mouse enters the popover content
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    clearTimers();
    if (isOpen) {
      // Close and release lock
      clickLockedRef.current = false;
      hide();
    } else {
      // Open and lock — hover away won't close
      clickLockedRef.current = true;
      show();
      requestAnimationFrame(() => focusFirst());
    }
  }, [isOpen, clearTimers, show, hide, focusFirst]);

  const noop = useCallback(() => {}, []);
  const noopKeyDown = useCallback((_e: React.KeyboardEvent) => {}, []);

  if (!isEnabled) {
    return {
      triggerHoverProps: {
        onMouseEnter: noop,
        onMouseLeave: noop,
        onClick: noop,
      },
      contentHoverProps: {
        onMouseEnter: noop,
        onMouseLeave: noop,
        onKeyDown: noopKeyDown,
      },
      menuRef,
      isClickLocked: false,
    };
  }

  return {
    triggerHoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
    },
    contentHoverProps: {
      onMouseEnter: handleContentMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleListKeyDown,
    },
    menuRef,
    isClickLocked: clickLockedRef.current,
  };
}
