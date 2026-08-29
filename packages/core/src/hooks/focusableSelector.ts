// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusableSelector.ts
 * @input Uses DOM visibility, tab-order, and descendant queries
 * @output Exports the canonical focusable selector and query helpers
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

/**
 * Whether an element opts out of sequential focus with an explicit negative
 * tabindex. The selector alone cannot express this: its `[tabindex]` clause
 * excludes `tabindex="-1"`, but natively focusable elements (button, a[href],
 * input, ...) match their own clause, so `<button tabindex="-1">` slips
 * through and must be filtered here. Parsed rather than string-matched so
 * `tabindex=" -1"` and other negative values are also caught.
 */
function hasNegativeTabIndex(element: HTMLElement): boolean {
  const explicit = element.getAttribute('tabindex');
  if (explicit == null) {
    return false;
  }
  const parsed = Number.parseInt(explicit, 10);
  return !Number.isNaN(parsed) && parsed < 0;
}

/**
 * Whether an element is a visible sequential-focus stop — one the browser
 * offers to a Tab press. Excludes:
 *
 * - explicit `tabindex="-1"`, which is focusable only programmatically;
 * - `inert`/`hidden` subtrees, which keyboard navigation skips;
 * - `aria-hidden="true"` subtrees, which sighted keyboard users must not
 *   reach while assistive technology cannot perceive them (WCAG 4.1.2);
 * - CSS-hidden elements. `display: none` does not inherit, so a hidden
 *   ancestor never shows up in the descendant's own computed style — the
 *   ancestor chain is walked explicitly. `visibility` does inherit (and a
 *   visible descendant of a hidden ancestor genuinely is focusable), so the
 *   element's own computed value is already the whole answer there.
 */
function isVisibleSequentialFocusStop(element: HTMLElement): boolean {
  if (hasNegativeTabIndex(element)) {
    return false;
  }
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
    if (style.visibility === 'hidden' || style.visibility === 'collapse') {
      return false;
    }
    for (
      let node: HTMLElement | null = element;
      node != null;
      node = node.parentElement
    ) {
      if (window.getComputedStyle(node).display === 'none') {
        return false;
      }
    }
  }
  return true;
}

/**
 * Get the visible, sequentially focusable descendants of a container.
 *
 * Selector matches alone are insufficient: CSS-hidden elements, descendants
 * of `inert` or `hidden` subtrees, and natives carrying `tabindex="-1"` stay
 * in the DOM but are skipped by sequential keyboard navigation. Descendants
 * of `aria-hidden="true"` are also excluded because sighted keyboard users
 * must not reach controls that assistive technology cannot perceive
 * (WCAG 4.1.2).
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisibleSequentialFocusStop);
}

/**
 * Whether a container has any visible sequential-focus descendant.
 *
 * This intentionally stops at the first match. Consumers that only need a
 * boolean can run after subtree mutations without repeatedly computing styles
 * for every control in a large, virtualized surface.
 */
export function hasFocusableDescendant(container: HTMLElement): boolean {
  const candidates =
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  for (const candidate of candidates) {
    if (isVisibleSequentialFocusStop(candidate)) {
      return true;
    }
  }
  return false;
}
