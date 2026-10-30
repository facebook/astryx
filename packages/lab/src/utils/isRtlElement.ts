// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRtlElement.ts
 * @input A DOM element (nullable)
 * @output isRtlElement: whether the element renders right to left, per its
 *   computed `direction`
 * @position Lab-internal, not exported from `@astryxdesign/lab`: lab's own
 *   direction check, used by SearchField's touch layer. Core's helper of the
 *   same name is not among core's published exports, so lab keeps its own
 *
 * SYNC: When modified, update isRtlElement.test.ts.
 */

/**
 * Whether `element` renders right to left, per its computed `direction`.
 * False without an element or without a DOM (a server render), so callers
 * read it when they lay out, never while rendering.
 */
export function isRtlElement(element: Element | null | undefined): boolean {
  if (element == null || typeof window === 'undefined') {
    return false;
  }
  return window.getComputedStyle(element).direction === 'rtl';
}
