// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useFocusTrap.ts
 * @input Uses React useCallback, useEffect, useRef
 * @output Exports useFocusTrap hook for trapping focus within a container and
 *   restoring focus to the previously-focused element on deactivation
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
import {useLayerDismissal} from '../Layer/useLayerDismissal';

// Escape-dismissible focus traps currently mounted. This is the whole state
// behind `hasActiveFocusTrapEscape`, which predates the shared stack and must
// keep answering about focus traps alone — the stack now carries families that
// never trapped focus (tooltips, hover cards), and counting those would tell
// callers a trap is above them when none is.
let activeEscapeTrapCount = 0;

/**
 * Whether an Escape-dismissible focus trap is currently active — a Popover,
 * menu or other trapped layer that would take an Escape press.
 *
 * @deprecated The focus trap no longer owns Escape coordination — every overlay
 *   family shares one stack (`useLayerDismissal`), which routes each press to
 *   the top-most layer. A layer that wants the same ordering should join the
 *   stack rather than ask whether a trap exists.
 */
export function hasActiveFocusTrapEscape(): boolean {
  return activeEscapeTrapCount > 0;
}

/**
 * Whether an element is currently perceivable/focusable — excludes ones hidden
 * via `display:none`/`visibility:hidden` or inside an `inert`/`hidden` subtree,
 * which the browser skips for Tab, and ones inside an `aria-hidden="true"`
 * subtree, which sighted-keyboard users could Tab to while AT skips them
 * (WCAG 4.1.2 — focusable content must be exposed to assistive tech).
 */
function isVisiblyFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('inert') || el.closest('[inert]')) {
    return false;
  }
  if (el.hidden || el.closest('[hidden]')) {
    return false;
  }
  // closest() matches the element itself as well as any ancestor.
  if (el.closest('[aria-hidden="true"]')) {
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
 * - Restores focus to the element that was focused before activation when the
 *   trap deactivates or unmounts, unless focus was already moved elsewhere
 *   (so consumers that restore focus themselves are unaffected)
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

  // Join the shared layer dismissal stack. The trap no longer listens for
  // Escape itself: the stack owns one listener and routes each press to the
  // top-most layer, so a popover inside a Dialog, a submenu inside a menu, and
  // a modal inside a modal all peel off one at a time. A trap with no
  // `onEscape` is not dismissible and stays off the stack, so a press flows
  // past it to whatever is underneath.
  // One expression drives both the stack registration and the deprecated
  // `hasActiveFocusTrapEscape` count, so the two can never disagree about
  // whether this trap is active.
  const isEscapeTrap = isActive && onEscape != null;

  useLayerDismissal({
    isActive: isEscapeTrap,
    onDismiss: () => {
      onEscape?.();
    },
    // The trap renders nothing, so it cannot push a depth provider around its
    // content; hand the stack the container instead so two DOM-nested traps
    // still resolve in the right order.
    getContainer: () => containerRef.current,
  });

  useEffect(() => {
    if (!isEscapeTrap) {
      return;
    }
    activeEscapeTrapCount += 1;
    return () => {
      activeEscapeTrapCount -= 1;
    };
  }, [isEscapeTrap]);

  /**
   * Focus the first focusable element.
   */
  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      focusFirstDescendant(containerRef.current);
    }
  }, []);

  /**
   * Capture the element focused before the trap activated, and restore focus to
   * it when the trap deactivates (or the component unmounts). Overlays are
   * opened imperatively (e.g. `showPopover()`), so the browser's declarative
   * popover focus restoration does not apply — without this, closing a Popover
   * via Escape or light dismiss drops keyboard focus to `<body>`.
   *
   * The restore is guarded so it never steals focus a consumer moved on
   * purpose: it only runs when focus would otherwise be lost — i.e. the active
   * element is nothing, the document body/root, or still inside the (possibly
   * now-unmounted) trap container. If focus already moved to some other element
   * outside the trap (the user clicked elsewhere, or a consumer such as
   * DropdownMenu already refocused its trigger), the restore is a no-op.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Snapshot the container now; by cleanup it may be detached or unmounted.
    const container = containerRef.current;

    return () => {
      const active = document.activeElement;
      const focusWasLost =
        active == null ||
        active === document.body ||
        active === document.documentElement ||
        (container != null && container.contains(active));

      if (!focusWasLost) {
        return;
      }

      if (
        previouslyFocused != null &&
        previouslyFocused.isConnected &&
        typeof previouslyFocused.focus === 'function'
      ) {
        previouslyFocused.focus();
      }
    };
  }, [isActive]);

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
        const focusedFirst = focusFirstDescendant(container);

        // If we're back at the same element (Shift+Tab from first element),
        // try focusing the last element instead
        if (focusedFirst && lastFocusRef.current === document.activeElement) {
          focusLastDescendant(container);
        } else if (
          !focusedFirst &&
          lastFocusRef.current instanceof HTMLElement &&
          container.contains(lastFocusRef.current)
        ) {
          // A modal surface may intentionally have no tabbable controls and
          // place initial focus on a tabIndex={-1} heading or panel. Preserve
          // that programmatic focus target instead of letting Tab escape.
          attemptFocus(lastFocusRef.current);
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
   * Handle Tab key to wrap focus at boundaries. Also tracks that keyboard
   * navigation is occurring.
   *
   * No Escape here, and no IME guard: the shared stack owns the press, claims
   * a composing Escape so no close request follows, and dismisses the trap
   * through `onEscape` above. The trap renders no element of its own, so it
   * has no `cancel` to answer either.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      if (event.key === 'Tab') {
        // Mark that keyboard navigation is happening
        isKeyboardNavigationRef.current = true;

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement) || !container.contains(active)) {
            // A layer can be open while focus legitimately sits outside it —
            // a listbox popup anchored to its own input. Cancelling there
            // would take Tab away from the whole page.
            return;
          }
          // There is nowhere to advance to. Keep focus on the current
          // programmatic target (for example a dialog panel with tabIndex=-1)
          // rather than allowing the browser to move into background content.
          event.preventDefault();
          lastFocusRef.current = active;
          isKeyboardNavigationRef.current = false;
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
    };
  }, [isActive, onEscape]);

  return {
    containerRef,
    focusFirst,
  };
}
