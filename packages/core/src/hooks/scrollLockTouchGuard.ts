// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file scrollLockTouchGuard.ts
 * @input Touch events on the document while a scroll lock holds the page
 * @output installScrollLockTouchGuard, which cancels a one-finger pan whose
 *   scroll would reach the page; isPanAbsorbedBeforePage, the scroller walk it
 *   decides with
 * @position Internal hook utility; used by useScrollLock.
 *
 * `overflow: hidden` on the root stops wheel, keyboard and scrollbar scrolling,
 * but iOS Safari before 26.4 still scrolls such a page under a finger: on iOS
 * 26.2 a drag on a scrim, on a dialog's header, or on an `overflow: auto` body
 * whose content fits each scrolls the page behind the overlay. The guard
 * cancels exactly those pans. It walks the scrollers under the finger once per
 * touch: a scroller that can move in the pan's direction, or one at its edge
 * that contains its own overscroll, takes the pan, and the move goes through;
 * a pan that would reach the page is cancelled. Two-finger gestures always go
 * through, so pinch-zoom keeps working.
 */

const SCROLLABLE = new Set(['auto', 'scroll']);

/** Overflow at or below this many px is a box that fits, not a scroller. */
const EDGE_TOLERANCE = 1;

function parentAcrossShadow(node: Node): Node | null {
  const parent = node.parentNode;
  if (parent == null) {
    return null;
  }
  return parent instanceof ShadowRoot ? parent.host : parent;
}

function canMoveY(element: Element, dy: number, range: number): boolean {
  // A finger moving down drags the content down: scrollTop decreases.
  return dy > 0
    ? element.scrollTop > EDGE_TOLERANCE - 0.5
    : element.scrollTop < range - EDGE_TOLERANCE + 0.5;
}

function canMoveX(
  element: Element,
  dx: number,
  range: number,
  isRtl: boolean,
): boolean {
  const min = isRtl ? -range : 0;
  const max = isRtl ? 0 : range;
  // A finger moving right drags the content right: scrollLeft decreases.
  return dx > 0
    ? element.scrollLeft > min + EDGE_TOLERANCE - 0.5
    : element.scrollLeft < max - EDGE_TOLERANCE + 0.5;
}

/**
 * Whether a scroller under `target` takes a pan of (`dx`, `dy`) before the
 * page does: one that can still move that way, or one at its edge whose
 * `overscroll-behavior` keeps the overscroll to itself.
 */
export function isPanAbsorbedBeforePage(
  target: EventTarget | null,
  dx: number,
  dy: number,
): boolean {
  if (!(target instanceof Node)) {
    return false;
  }
  const doc = target.ownerDocument ?? document;
  const view = doc.defaultView;
  if (view == null) {
    return false;
  }
  const isVertical = Math.abs(dy) >= Math.abs(dx);
  for (
    let node: Node | null = target;
    node != null;
    node = parentAcrossShadow(node)
  ) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (
      node === doc.documentElement ||
      node === doc.body ||
      node === doc.scrollingElement
    ) {
      break;
    }
    const style = view.getComputedStyle(node);
    if (!SCROLLABLE.has(isVertical ? style.overflowY : style.overflowX)) {
      continue;
    }
    const range = isVertical
      ? node.scrollHeight - node.clientHeight
      : node.scrollWidth - node.clientWidth;
    // Content that fits gives the finger nothing to scroll: the pan passes
    // on to the next scroller up, and in the end to the page.
    if (range <= EDGE_TOLERANCE) {
      continue;
    }
    const canMove = isVertical
      ? canMoveY(node, dy, range)
      : canMoveX(node, dx, range, style.direction === 'rtl');
    if (canMove) {
      return true;
    }
    const behavior = isVertical
      ? style.overscrollBehaviorY
      : style.overscrollBehaviorX;
    if (behavior === 'contain' || behavior === 'none') {
      return true;
    }
  }
  return false;
}

/**
 * Cancels one-finger pans that would scroll the page, until the returned
 * function removes the guard.
 */
export function installScrollLockTouchGuard(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }
  let startX = 0;
  let startY = 0;
  let verdict: 'pass' | 'cancel' | null = null;

  const onTouchStart = (event: TouchEvent) => {
    verdict = null;
    const touch = event.touches[0];
    if (event.touches.length === 1 && touch != null) {
      startX = touch.clientX;
      startY = touch.clientY;
    }
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    // A second finger is a pinch: zooming the page stays available.
    if (event.touches.length !== 1 || touch == null) {
      return;
    }
    if (verdict == null) {
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (dx === 0 && dy === 0) {
        return;
      }
      // The browser picks the scroller once per gesture; so does the guard.
      verdict = isPanAbsorbedBeforePage(event.target, dx, dy)
        ? 'pass'
        : 'cancel';
    }
    if (verdict === 'cancel' && event.cancelable) {
      event.preventDefault();
    }
  };

  document.addEventListener('touchstart', onTouchStart, {
    capture: true,
    passive: true,
  });
  document.addEventListener('touchmove', onTouchMove, {
    capture: true,
    passive: false,
  });
  return () => {
    document.removeEventListener('touchstart', onTouchStart, {capture: true});
    document.removeEventListener('touchmove', onTouchMove, {capture: true});
  };
}
