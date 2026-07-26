// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file isRtlElement.ts
 * @input DOM element (nullable)
 * @output Exports isRtlElement helper resolving an element's computed text
 *   direction
 * @position Internal hook utility; used by useListFocus and useGridFocus to
 *   auto-detect RTL for arrow-key navigation (same getComputedStyle precedent
 *   as Resizable's ResizeHandle drag deltas).
 */

/**
 * Whether `el` renders right-to-left, per its computed `direction`.
 *
 * SSR-safe: returns false when `el` is null or no DOM is available. Callers
 * should invoke this lazily (on keydown, not on render) so getComputedStyle
 * runs only when a horizontal arrow key is actually handled.
 */
export function isRtlElement(el: HTMLElement | null): boolean {
  if (!el || typeof window === 'undefined') {
    return false;
  }
  return window.getComputedStyle(el).direction === 'rtl';
}
