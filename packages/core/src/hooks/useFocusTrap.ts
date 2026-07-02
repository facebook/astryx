// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useFocusTrap.ts
 * @input Uses React useCallback, useEffect, useRef
 * @output Exports useFocusTrap hook for trapping focus within a container
 * @position Core hook; used by dialogs, modals, date pickers
 *
 * Based on WAI-ARIA dialog pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useCallback, useEffect, useRef} from 'react';

import {FOCUSABLE_SELECTOR} from './focusableSelector';

/**
 * Module-level stack of active focus-trap Escape handlers.
 *
 * Every active `useFocusTrap` used to attach its own document-level `keydown`
 * listener with no coordination, so a single Escape press closed *every* open
 * layer at once (e.g. a popover nested inside a Dialog closed both). Tracking
 * traps in a shared stack lets only the most recently activated (top-most)
 * trap respond to Escape.
 */
const escapeStack: (() => void)[] = [];

function pushEscapeHandler(handler: () => void): void {
  escapeStack.push(handler);
}

function removeEscapeHandler(handler: () => void): void {
  const index = escapeStack.lastIndexOf(handler);
  if (index !== -1) {
    escapeStack.splice(index, 1);
  }
}

function isTopEscapeHandler(handler: () => void): boolean {
  return escapeStack[escapeStack.length - 1] === handler;
}

/**
 * Whether any focus-trap Escape handler is currently active (i.e. a popover
 * layer is open). Other overlay primitives that manage their own Escape (e.g.
 * Dialog) can consult this to defer to a popover layered on top of them,
 * giving topmost-only dismissal until a full layer stack exists.
 */
export function hasActiveFocusTrapEscape(): boolean {
  return escapeStack.length > 0;
}

/**
 * Whether an Escape keydown should be ignored because it is cancelling an
 * in-progress IME composition. CJK/IME users press Escape to cancel
 * composition; that must not close the surrounding overlay. `keyCode === 229`
 * covers browsers that fire keydown before `isComposing` is set. Exported so
 * other overlays (Dialog, Drawer, CommandPalette) share one definition.
 */
export function isImeKeyEvent(event: {
  isComposing?: boolean;
  keyCode?: number;
}): boolean {
  return event.isComposing === true || event.keyCode === 229;
}

/**
 * Whether an element is currently perceivable/focusable — excludes ones hidden
 * via `display:none`/`visibility:hidden` or inside an `inert`/`hidden` subtree,
 * which the browser skips for Tab.
 */
function isVisiblyFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('inert') || el.closest('[inert]')) {
    return false;
  }
  if (el.hidden || el.closest('[hidden]')) {
    return false;
  }
  // offsetParent is null for display:none (and fixed elements); pair with a
  // visibility check via getComputedStyle when available.
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }
  }
  return true;
}

/**
 * Get all focusable elements within a container.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisiblyFocusable);
}

/**
 * Attempt to focus an element. Returns true if focus was successful.
 */
function attemptFocus(element: HTMLElement): boolean {
  try {
    element.focus();
  } catch {
    // Some elements may throw on focus
  }
  return document.activeElement === element;
}

/**
 * Focus the first focusable descendant of a container.
 * Returns true if a focusable element was found and focused.
 */
function focusFirstDescendant(container: HTMLElement): boolean {
  const focusable = getFocusableElements(container);
  for (const element of focusable) {
    if (attemptFocus(element)) {
      return true;
    }
  }
  return false;
}

/**
 * Focus the last focusable descendant of a container.
 * Returns true if a focusable element was found and focused.
 */
function focusLastDescendant(container: HTMLElement): boolean {
  const focusable = getFocusableElements(container);
  for (let i = focusable.length - 1; i >= 0; i--) {
    if (attemptFocus(focusable[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Configuration for focus trap behavior
 */
export interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is currently active.
   */
  isActive: boolean;

  /**
   * Callback when Escape key is pressed.
   */
  onEscape?: () => void;
}

/**
 * Return type for useFocusTrap hook
 */
export interface UseFocusTrapReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the container element that should trap focus.
   */
  containerRef: React.RefObject<T | null>;

  /**
   * Focus the first focusable element in the container.
   */
  focusFirst: () => void;
}

/**
 * Hook for trapping focus within a container element.
 *
 * Implements the WAI-ARIA dialog focus trap pattern:
 * - Listens to focus events on the document
 * - Redirects focus back into the container if it escapes
 * - Handles both Tab and Shift+Tab navigation
 *
 * @example
 * ```
 * const {containerRef, focusFirst} = useFocusTrap({
 *   isActive: isOpen,
 *   onEscape: () => setIsOpen(false),
 * });
 *
 * useEffect(() => {
 *   if (isOpen) {
 *     focusFirst();
 *   }
 * }, [isOpen, focusFirst]);
 *
 * <div ref={containerRef}>
 *   <button>First</button>
 *   <button>Last</button>
 * </div>
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions,
): UseFocusTrapReturn<T> {
  const {isActive, onEscape} = options;

  const containerRef = useRef<T | null>(null);
  const lastFocusRef = useRef<Element | null>(null);
  // Track if focus change was triggered by keyboard (Tab key)
  const isKeyboardNavigationRef = useRef(false);

  /**
   * Focus the first focusable element.
   */
  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      focusFirstDescendant(containerRef.current);
    }
  }, []);

  /**
   * Handle focus events - redirect focus back into container if it escapes.
   * Only redirects for keyboard navigation, not mouse clicks.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleFocus = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const target = event.target as Node;

      if (container.contains(target)) {
        // Focus is inside the container - track it
        lastFocusRef.current = target as Element;
      } else if (isKeyboardNavigationRef.current) {
        // Focus escaped via keyboard - redirect it back
        focusFirstDescendant(container);

        // If we're back at the same element (Shift+Tab from first element),
        // try focusing the last element instead
        if (lastFocusRef.current === document.activeElement) {
          focusLastDescendant(container);
        }

        lastFocusRef.current = document.activeElement;
      }
      // If focus escaped via mouse click, don't redirect - let light dismiss handle it

      // Reset keyboard navigation flag
      isKeyboardNavigationRef.current = false;
    };

    // Use capture phase to intercept focus before it settles
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [isActive]);

  /**
   * Handle Tab key to wrap focus at boundaries, and Escape to close.
   * Also tracks that keyboard navigation is occurring.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Register this trap on the shared Escape stack so only the top-most
    // active trap responds to Escape. A stable identity per active period is
    // enough — we push on activate and remove on cleanup.
    const escapeHandler = () => {
      onEscape?.();
    };
    if (onEscape) {
      pushEscapeHandler(escapeHandler);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      if (event.key === 'Escape' && onEscape) {
        // Ignore Escape that is cancelling an IME composition, already handled
        // by a nested handler, or not targeting the top-most trap.
        if (
          event.defaultPrevented ||
          isImeKeyEvent(event) ||
          !isTopEscapeHandler(escapeHandler)
        ) {
          return;
        }
        // Mark handled and stop propagation so an outer layer (e.g. a Dialog
        // hosting this popover) does not also dismiss on the same press.
        event.preventDefault();
        event.stopPropagation();
        onEscape();
        return;
      }

      if (event.key === 'Tab') {
        // Mark that keyboard navigation is happening
        isKeyboardNavigationRef.current = true;

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (onEscape) {
        removeEscapeHandler(escapeHandler);
      }
    };
  }, [isActive, onEscape]);

  return {
    containerRef,
    focusFirst,
  };
}
