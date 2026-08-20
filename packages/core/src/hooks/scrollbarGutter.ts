// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file scrollbarGutter.ts
 * @input Live viewport metrics (window.innerWidth vs documentElement.clientWidth)
 * @output Exports holdScrollbarGutter
 * @position Internal hook utility; used by useScrollLock and MobileNav so that
 *   locking background scroll does not resize the layout viewport.
 *
 * Locking scroll hides the document's scrollbar. Where that scrollbar is a
 * classic (space-taking) one — Windows/Linux desktop, and macOS set to
 * "Always" show scroll bars — hiding it widens the layout viewport by the
 * scrollbar's width and the whole page jumps sideways behind the overlay.
 *
 * The fix is `scrollbar-gutter: stable`, which holds that space once the
 * scrollbar goes away. Being a real layout change it holds `position: fixed`
 * chrome (sticky headers, toast viewports) as well as in-flow content, which
 * padding fundamentally cannot: fixed elements resolve against the viewport,
 * not against the padded element.
 *
 * Applied dynamically, for the duration of the lock only. A static rule in
 * reset.css would also work, but it reserves the gutter for the whole life of
 * every document — including pages too short to scroll, which never had the
 * shift in the first place. On a short full-bleed page (a one-screen marketing
 * page) that permanently narrows the layout by the scrollbar's width and pulls
 * full-bleed art off the right edge.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

/** Balanced by the disposer `holdScrollbarGutter` returns. */
let holdCount = 0;

/** The value to put back once the last hold is released. */
let restoreTo: string | null = null;

const NOOP = () => {};

/**
 * Holds the layout viewport at its current width across a scroll lock that is
 * about to hide the document's scrollbar. Returns a disposer that gives the
 * gutter back; calling it more than once is safe.
 *
 * Call it *before* applying the lock's own styles — the measurement has to see
 * the scrollbar while it is still there:
 *
 * ```
 * const release = holdScrollbarGutter();
 * body.style.position = 'fixed';
 * // …later
 * release();
 * ```
 *
 * Nested overlays share one hold: the gutter is taken by the first and given
 * back by the last, in whatever order they close.
 *
 * Does nothing where there is no gutter to hold — overlay scrollbars (mobile,
 * and macOS by default) take no layout space, and neither does a page too
 * short to scroll.
 */
export function holdScrollbarGutter(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return NOOP;
  }

  const root = document.documentElement;

  if (holdCount === 0) {
    const viewportWidth = root.clientWidth;

    // 0 means "no layout to measure" (jsdom, and any non-visual environment),
    // not "the scrollbar is as wide as the window".
    if (viewportWidth === 0 || window.innerWidth <= viewportWidth) {
      return NOOP;
    }

    restoreTo = root.style.scrollbarGutter;
    root.style.scrollbarGutter = 'stable';
  }

  holdCount += 1;

  let released = false;

  return () => {
    if (released) {
      return;
    }
    released = true;

    holdCount -= 1;

    if (holdCount === 0 && restoreTo !== null) {
      root.style.scrollbarGutter = restoreTo;
      restoreTo = null;
    }
  };
}
