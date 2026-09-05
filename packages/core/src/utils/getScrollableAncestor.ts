// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file getScrollableAncestor.ts
 * @input Receives a DOM element and an optional `requireOverflow` flag.
 * @output Exports `getScrollableAncestor`, the shared "which ancestor scrolls
 *   this element" walk.
 * @position Internal utility (deliberately not re-exported from utils/index,
 *   which is public API); consumed by Outline's scroll spy and by
 *   ChatMessageList's load-earlier compensation, the surfaces that must find
 *   the scroller clipping them without being told about it.
 *
 * Walks up from the element's parent and returns the first ancestor whose
 * computed `overflow-y` is `auto`, `scroll`, or the deprecated `overlay`
 * (older Chromium still computes it for overlay scrollbars).
 *
 * `requireOverflow` decides whether that ancestor must be able to scroll
 * right now (`scrollHeight > clientHeight`):
 *
 * - `true` (default; Outline): a scroll spy only cares about a scroller that
 *   actually moves, so a wrapper with `overflow: auto` and nothing to scroll
 *   is skipped in favor of a higher ancestor that overflows, else the
 *   viewport.
 * - `false` (ChatMessageList): a load-earlier list starts underfilled, so its
 *   scroller cannot scroll yet; scroll compensation and auto-refill must
 *   still target that element rather than the page.
 */

export function getScrollableAncestor(
  element: Element | null,
  {requireOverflow = true}: {requireOverflow?: boolean} = {},
): HTMLElement | null {
  for (
    let node = element?.parentElement ?? null;
    node != null;
    node = node.parentElement
  ) {
    const {overflowY} = window.getComputedStyle(node);
    const canScroll =
      overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
    if (
      canScroll &&
      (!requireOverflow || node.scrollHeight > node.clientHeight)
    ) {
      return node;
    }
  }
  return null;
}
