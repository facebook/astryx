// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusableSelector.ts
 * @input Uses DOM visibility and descendant queries
 * @output Exports the canonical focusable selector and query helper
 * @position Internal utility; shared by focus-management hooks and components
 *   so their focusable-element model stays aligned. Not exported from the
 *   public barrel — internal implementation detail.
 */

/**
 * Canonical CSS selector for commonly focusable elements. Includes the
 * tabbable natives (button/link/input/select/textarea/[tabindex]) plus
 * editable and media elements the browser also puts in the tab order —
 * contenteditable, media with controls, iframe, and an open <details>'s
 * <summary> — which a naive selector misses, letting Tab escape a trap whose
 * only interactive content is (e.g.) a contenteditable composer (infra-8).
 *
 * This is the canonical focusable selector; prefer importing it here over
 * re-declaring the string so behavior stays consistent across hooks.
 */
export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], iframe, details > summary:first-child';

function isVisiblyFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('inert') || element.closest('[inert]')) {
    return false;
  }
  if (element.hidden || element.closest('[hidden]')) {
    return false;
  }
  // closest() matches the element itself as well as any ancestor.
  if (element.closest('[aria-hidden="true"]')) {
    return false;
  }
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }
  }
  return true;
}

/**
 * Get the currently perceivable focusable descendants of a container.
 *
 * Selector matches alone are insufficient: hidden elements and descendants of
 * `inert` or `hidden` subtrees stay in the DOM but are skipped by keyboard
 * navigation. Descendants of `aria-hidden="true"` are also excluded because
 * sighted keyboard users must not reach controls that assistive technology
 * cannot perceive (WCAG 4.1.2).
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisiblyFocusable);
}

/**
 * Whether a container has any perceivable focusable descendant.
 *
 * This intentionally stops at the first match. Consumers that only need a
 * boolean can run after subtree mutations without repeatedly computing styles
 * for every control in a large, virtualized surface.
 */
export function hasFocusableDescendant(container: HTMLElement): boolean {
  const candidates =
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  for (const candidate of candidates) {
    if (isVisiblyFocusable(candidate)) {
      return true;
    }
  }
  return false;
}
