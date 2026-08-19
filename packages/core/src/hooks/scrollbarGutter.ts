// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scrollbarGutter.ts
 * @input An element to compensate, plus viewport metrics (window.innerWidth vs
 *   document.documentElement.clientWidth)
 * @output Exports SCROLLBAR_GUTTER_VAR, measureScrollbarGutter,
 *   reserveScrollbarGutter, releaseScrollbarGutter
 * @position Internal hook utility; used by useScrollLock and MobileNav so that
 *   locking background scroll does not resize the layout viewport.
 *
 * Locking scroll hides the document's scrollbar. Where that scrollbar is a
 * classic (space-taking) one — Windows/Linux desktop, and macOS set to
 * "Always" show scroll bars — hiding it widens the layout viewport by the
 * scrollbar's width and the whole page jumps sideways behind the overlay.
 * These helpers reserve that width back as padding on whichever element the
 * lock pins, so the content box keeps its pre-lock size.
 *
 * Overlay scrollbars (mobile, default macOS) measure 0 and are left alone.
 */

/**
 * Custom property holding the reserved gutter width while a scroll lock is
 * active (`0px` is not set — the property is simply absent when unlocked).
 *
 * Padding on the pinned element only compensates content in the document
 * flow. `position: fixed` chrome (sticky headers, toast viewports) is laid out
 * against the viewport itself and has to compensate explicitly:
 *
 * ```
 * paddingRight: 'var(--astryx-scrollbar-gutter, 0px)'
 * ```
 */
export const SCROLLBAR_GUTTER_VAR = '--astryx-scrollbar-gutter';

export interface ScrollbarGutterSnapshot {
  /** The element's inline `padding-right` before the lock. */
  paddingRight: string;
  /** Whether this lock is the one that reserved the gutter. */
  reserved: boolean;
}

/**
 * Width of the document's classic scrollbar, in pixels; `0` when the scrollbar
 * is an overlay one (or when there is no scrollbar at all).
 *
 * Must be read *before* the scroll lock's styles are applied — afterwards the
 * scrollbar is already gone and the difference measures 0.
 */
export function measureScrollbarGutter(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 0;
  }

  const viewportWidth = document.documentElement.clientWidth;

  // 0 means "no layout to measure" (jsdom, and any non-visual environment),
  // not "the scrollbar is as wide as the window".
  if (viewportWidth === 0) {
    return 0;
  }

  return Math.max(0, window.innerWidth - viewportWidth);
}

/**
 * Reserves the scrollbar's width as extra `padding-right` on `element`, so
 * hiding the scrollbar doesn't widen the content box.
 *
 * Physical `padding-right`, not logical `padding-inline-end`: where the
 * document's scrollbar sits is a UA decision, not a writing-mode one. Chromium
 * keeps the root scrollbar at the physical right edge even in RTL documents,
 * where compensating the inline-end edge measurably moved RTL content by the
 * gutter width instead of holding it still.
 *
 * Returns a snapshot to hand back to {@link releaseScrollbarGutter}.
 */
export function reserveScrollbarGutter(
  element: HTMLElement,
): ScrollbarGutterSnapshot {
  const paddingRight = element.style.paddingRight;
  const gutter = measureScrollbarGutter();

  if (gutter === 0) {
    return {paddingRight, reserved: false};
  }

  const existing =
    Number.parseFloat(window.getComputedStyle(element).paddingRight || '0') ||
    0;

  element.style.paddingRight = `${existing + gutter}px`;
  document.documentElement.style.setProperty(
    SCROLLBAR_GUTTER_VAR,
    `${gutter}px`,
  );

  return {paddingRight, reserved: true};
}

/** Undoes {@link reserveScrollbarGutter}, restoring the inline padding. */
export function releaseScrollbarGutter(
  element: HTMLElement,
  snapshot: ScrollbarGutterSnapshot,
): void {
  if (!snapshot.reserved) {
    return;
  }

  element.style.paddingRight = snapshot.paddingRight;
  document.documentElement.style.removeProperty(SCROLLBAR_GUTTER_VAR);
}
