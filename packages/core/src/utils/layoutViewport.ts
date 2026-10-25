// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layoutViewport.ts
 * @input A window: its innerHeight and innerWidth, and its visual viewport's
 *   width and scale
 * @output layoutViewportHeight: the layout viewport's height in layout px,
 *   pinch zoom included
 * @position Internal shared measurement (not re-exported from the utils
 *   entry): the keyboard module's height (spec:AST-099 FR2), BottomSheet's
 *   keyboard obstruction, ChatLayout's lift, and any layout that sizes
 *   against the layout viewport in the units of element rects
 *
 * `innerHeight` is the layout viewport's height in most engines. WebKit
 * reports `innerHeight` and `innerWidth` in the pinch-zoomed visual viewport's
 * px instead (536 and 302 at a 1.33 zoom of a 402 × 714 layout viewport,
 * measured in Safari on iOS 26.2), while element rects and the visual
 * viewport's height times its scale stay in layout px: read as is, a zoom
 * shrinks the layout viewport by the zoom.
 *
 * Which units `innerWidth` is in tells them apart without naming an engine:
 * the visual viewport's (its width) where the zoom applies, the layout
 * viewport's (that width times the scale) where it does not. `innerWidth` is
 * taken to be in the units of whichever of the two widths it is nearest to,
 * with no tolerance constant: it is a whole number of px against a fractional
 * width, so it is never expected to equal either. At a scale of 1 the two
 * widths are the same, nearest is not decided, and `innerHeight` is taken as
 * it is, so a classic scrollbar, which `innerWidth` counts and the visual
 * viewport does not, changes nothing.
 */

/**
 * The layout viewport's height, CSS px, in the units of element rects:
 * `innerHeight`, scaled back from the visual viewport's px where the engine
 * reports it zoomed (WebKit under a pinch zoom).
 */
export function layoutViewportHeight(win: Window): number {
  const viewport = win.visualViewport;
  const width = viewport?.width ?? 0;
  if (viewport == null || !(width > 0)) {
    return win.innerHeight;
  }
  const scale = viewport.scale;
  // innerWidth is in the units of whichever width it is nearest to.
  const fromVisual = Math.abs(win.innerWidth - width);
  const fromLayout = Math.abs(win.innerWidth - width * scale);
  return fromVisual < fromLayout ? win.innerHeight * scale : win.innerHeight;
}
