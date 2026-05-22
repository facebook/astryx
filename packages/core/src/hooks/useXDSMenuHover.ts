// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useXDSMenuHover.ts
 * @input Uses React hooks, useListFocus
 * @output Exports useXDSMenuHover hook
 * @position Internal hook; used by nav heading components and XDSTopNavMenu
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
 *    - Click-to-close additionally skips the next mouseenter
 *
 * Only uses mouseenter/mouseleave (not mouseover).
 */

import {useCallback, useEffect, useRef} from 'react';
import {useListFocus} from './useListFocus';
import {useMediaQuery} from './useMediaQuery';

interface UseXDSMenuHoverOptions {
  show: (options?: {skipAutoFocus?: boolean}) => void;
  hide: () => void;
  isOpen: boolean;
  isEnabled: boolean;
  showDelay?: number;
  hideDelay?: number;
}

interface UseXDSMenuHoverReturn<T extends HTMLElement = HTMLElement> {
  triggerProps: {
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  contentProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  menuRef: React.RefObject<T | null>;
  focusFirst: () => void;
  setTriggerEl: (el: HTMLElement | null) => void;
}

export function useXDSMenuHover<T extends HTMLElement = HTMLElement>(
  options: UseXDSMenuHoverOptions,
): UseXDSMenuHoverReturn<T> {
  const {
    show,
    hide,
    isOpen,
    isEnabled,
    showDelay = 150,
    hideDelay = 200,
  } = options;

  const hasHover = useMediaQuery('(hover: hover)');

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);
  // Whether the menu was opened/interacted via hover (enables mouseleave-to-close)
  const hoverModeRef = useRef(false);
  // One-shot: skip the next mouseenter after click-to-close
  const skipNextEnterRef = useRef(false);
  const prevIsOpenRef = useRef(isOpen);

  // When popover closes (any reason), reset hover mode
  if (prevIsOpenRef.current && !isOpen) {
    hoverModeRef.current = false;
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

  const {
    listRef: menuRef,
    handleKeyDown: handleListKeyDown,
    focusFirst,
  } = useListFocus<T>({
    onEscape: () => {
      clearTimeouts();
      hide();
    },
  });

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  // Click: always toggle
  const handleClick = useCallback(() => {
    clearTimeouts();
    if (isOpen) {
      skipNextEnterRef.current = true;
      hide();
    } else {
      skipNextEnterRef.current = false;
      show();
      requestAnimationFrame(() => focusFirst());
    }
  }, [isOpen, clearTimeouts, show, hide, focusFirst]);

  // Hover: mouseenter activates hover mode and opens
  const handleMouseEnter = useCallback(() => {
    if (!hasHover) {
      return;
    }
    if (skipNextEnterRef.current) {
      skipNextEnterRef.current = false;
      return;
    }
    hoverModeRef.current = true;
    clearTimeouts();
    if (showDelay > 0) {
      showTimerRef.current = setTimeout(() => {
        show({skipAutoFocus: true});
      }, showDelay);
    } else {
      show({skipAutoFocus: true});
    }
  }, [hasHover, clearTimeouts, show, showDelay]);

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
      setTriggerEl: noopRef,
    };
  }

  return {
    triggerProps: {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    contentProps: {
      onMouseEnter: handleContentMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleListKeyDown,
    },
    menuRef,
    focusFirst,
    setTriggerEl: setTriggerRef,
  };
}
