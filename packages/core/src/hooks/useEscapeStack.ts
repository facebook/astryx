// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useEscapeStack.ts
 * @input Uses React useEffect, useRef, useCallback
 * @output Exports useEscapeStack hook + hasActiveEscapeLayer + isImeKeyEvent,
 *   the shared "only the top-most overlay closes on Escape" coordination
 * @position Core hook; used by useFocusTrap (Popover, menus) and Dialog
 *   (Modal, Sheet), so every overlay family shares ONE Escape stack and ONE
 *   top-most resolver.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 *
 * Every overlay that closes on Escape used to attach its own listener with no
 * coordination, so a single Escape press closed *every* open layer at once
 * (a Popover nested in a Dialog closed both; a Modal opened from inside another
 * Modal closed both). Tracking every overlay in one shared stack, and letting
 * only the top-most respond, gives correct top-most-only dismissal across the
 * whole overlay family — regardless of which primitive (focus-trap-based or
 * native `<dialog>`) rendered it.
 *
 * "Top-most" is resolved by DOM containment first, push order second. Push
 * order alone is not reliable: React runs child effects before parent effects,
 * so when an outer and an inner (DOM-nested) layer mount in the SAME commit,
 * the inner layer pushes first and the outer would wrongly win a pure
 * last-pushed comparison.
 */

import {useCallback, useEffect, useRef} from 'react';

interface EscapeStackEntry {
  /** Stable identity for this active period; also the removal key. */
  handler: () => void;
  /**
   * The overlay's container element, read lazily — the ref may not be attached
   * at effect time, and the stack resolves top-most by DOM containment at
   * keydown time.
   */
  getContainer: () => HTMLElement | null;
}

const escapeStack: EscapeStackEntry[] = [];

function pushEscapeEntry(entry: EscapeStackEntry): void {
  escapeStack.push(entry);
}

function removeEscapeEntry(handler: () => void): void {
  for (let i = escapeStack.length - 1; i >= 0; i--) {
    if (escapeStack[i].handler === handler) {
      escapeStack.splice(i, 1);
      return;
    }
  }
}

/**
 * Resolve the top-most entry: walk the stack in push order, keeping the
 * deepest container by DOM containment. When a later entry's container
 * contains the current candidate's container, the candidate is nested inside
 * it and stays on top; otherwise the later push wins (containment for nested
 * layers, push order as the tiebreaker for unrelated ones).
 */
function isTopEscapeEntry(handler: () => void): boolean {
  if (escapeStack.length === 0) {
    return false;
  }
  let top = escapeStack[0];
  for (let i = 1; i < escapeStack.length; i++) {
    const entry = escapeStack[i];
    const topContainer = top.getContainer();
    const entryContainer = entry.getContainer();
    if (
      topContainer != null &&
      entryContainer != null &&
      entryContainer !== topContainer &&
      entryContainer.contains(topContainer)
    ) {
      // The current top is nested inside this entry — it stays on top.
      continue;
    }
    top = entry;
  }
  return top.handler === handler;
}

/**
 * Whether any overlay is currently registered on the shared Escape stack.
 * An overlay that manages its own Escape but is NOT on the stack can consult
 * this to defer to a registered layer on top of it. Registered overlays should
 * prefer their own `isTopmost()` (returned by `useEscapeStack`) instead.
 */
export function hasActiveEscapeLayer(): boolean {
  return escapeStack.length > 0;
}

/**
 * Whether an Escape keydown should be ignored because it is cancelling an
 * in-progress IME composition. CJK/IME users press Escape to cancel
 * composition; that must not close the surrounding overlay. `keyCode === 229`
 * covers browsers that fire keydown before `isComposing` is set. Exported so
 * every overlay (Dialog, Popover, CommandPalette, …) shares one definition.
 */
export function isImeKeyEvent(event: {
  isComposing?: boolean;
  keyCode?: number;
}): boolean {
  return event.isComposing === true || event.keyCode === 229;
}

/**
 * Options for {@link useEscapeStack}.
 */
export interface UseEscapeStackOptions {
  /** Whether this overlay is currently open/active. */
  isActive: boolean;
  /**
   * Called when this overlay should close on Escape. When omitted, the overlay
   * still registers nothing — it opts out of the stack entirely.
   */
  onEscape?: () => void;
  /**
   * Returns this overlay's container element, used to resolve top-most by DOM
   * containment. Read lazily at keydown time.
   */
  getContainer: () => HTMLElement | null;
}

/**
 * Return value of {@link useEscapeStack}.
 */
export interface UseEscapeStackReturn {
  /**
   * Whether this overlay is currently the top-most registered layer, i.e. the
   * one that should handle an Escape press. Callers gate their own Escape
   * handling on this and `stopPropagation()` so an outer layer does not also
   * dismiss on the same press.
   */
  isTopmost: () => boolean;
}

/**
 * Register an overlay on the shared Escape stack for the duration it is active,
 * and report whether it is the top-most layer.
 *
 * This does NOT attach any keydown listener or call `onEscape` itself — the
 * caller owns its own listener (a focus trap on `document`, a `<dialog>`'s
 * `keydown`/`cancel`, etc.) and consults `isTopmost()` before acting. Keeping
 * registration here and the listener at the call site lets primitives with very
 * different event models (focus-trap vs native `<dialog>`) share ONE stack and
 * ONE top-most resolver.
 *
 * `onEscape` is accepted so the entry's identity tracks the caller's intent to
 * handle Escape (an overlay with no `onEscape` does not register); the hook
 * never invokes it.
 */
export function useEscapeStack(
  options: UseEscapeStackOptions,
): UseEscapeStackReturn {
  const {isActive, onEscape, getContainer} = options;

  // Keep the latest container getter in a ref so the stack entry (created once
  // per active period) always reads through to the current one without
  // re-registering when the caller passes a new inline closure each render.
  const getContainerRef = useRef(getContainer);
  getContainerRef.current = getContainer;

  // Stable per-instance identity used as the stack entry's handler key. It is
  // never called — it only distinguishes this overlay's entry from others.
  const identityRef = useRef<() => void>(() => {});

  const shouldRegister = isActive && onEscape != null;

  useEffect(() => {
    if (!shouldRegister) {
      return;
    }
    const identity = identityRef.current;
    pushEscapeEntry({
      handler: identity,
      getContainer: () => getContainerRef.current(),
    });
    return () => {
      removeEscapeEntry(identity);
    };
  }, [shouldRegister]);

  const isTopmost = useCallback((): boolean => {
    if (!shouldRegister) {
      return false;
    }
    return isTopEscapeEntry(identityRef.current);
  }, [shouldRegister]);

  return {isTopmost};
}
