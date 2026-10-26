// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layoutViewport.ts
 * @input A window: its innerHeight and innerWidth, its visual viewport's
 *   width and scale, and its document's root box
 * @output layoutViewportHeight: the layout viewport's height in layout px,
 *   pinch zoom included, less a classic horizontal scrollbar (its thickness
 *   measured once per document and zoom); __resetLayoutViewportForTest
 * @position Internal shared measurement (not re-exported from the utils
 *   entry): the keyboard module's height (spec:AST-099 FR2), BottomSheet's
 *   keyboard obstruction, and any layout that sizes against the layout
 *   viewport in the units of element rects
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
 *
 * A classic horizontal scrollbar is in `innerHeight` and not in the visual
 * viewport's height, so it is taken out: on a desktop page wider than its
 * window, Chromium's `innerHeight` is 800 for a 785 px visual viewport. It is
 * the part of `innerHeight` the root's client height leaves out, up to the
 * thickness of a scrollbar that takes room. Where scrollbars overlay the
 * content (every phone) that thickness is 0, so the room a hidden toolbar adds
 * to `innerHeight` (Chrome on Android sizes the root to the viewport with its
 * toolbar shown) is never taken for one. The thickness is measured once per
 * document and zoom (a probe element writes to the document and forces a
 * layout), so every later measurement stays one layout read
 * (architecture:react-component-runtime INV11).
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
    return win.innerHeight - horizontalScrollbarHeight(win);
  }
  const scale = viewport.scale;
  // innerWidth is in the units of whichever width it is nearest to.
  const fromVisual = Math.abs(win.innerWidth - width);
  const fromLayout = Math.abs(win.innerWidth - width * scale);
  const height =
    fromVisual < fromLayout ? win.innerHeight * scale : win.innerHeight;
  return height - horizontalScrollbarHeight(win);
}

/** The document's classic horizontal scrollbar, CSS px (see the header). */
function horizontalScrollbarHeight(win: Window): number {
  const root = win.document.documentElement;
  const gap = win.innerHeight - root.clientHeight;
  if (!(gap > 0) || root.scrollWidth <= root.clientWidth) {
    return 0;
  }
  return Math.min(gap, scrollbarThickness(win.document));
}

// The scrollbar thickness each document measured, at the device pixel ratio
// it measured it at: a browser zoom changes the ratio, and with it how many
// CSS px a classic scrollbar takes.
let thicknesses = new WeakMap<
  Document,
  {devicePixelRatio: number; thickness: number}
>();

/** How much room a scrollbar takes from a scrolling box: 0 where overlaid. */
function scrollbarThickness(doc: Document): number {
  const devicePixelRatio = doc.defaultView?.devicePixelRatio ?? 1;
  const known = thicknesses.get(doc);
  if (known != null && known.devicePixelRatio === devicePixelRatio) {
    return known.thickness;
  }
  const thickness = measureScrollbarThickness(doc);
  thicknesses.set(doc, {devicePixelRatio, thickness});
  return thickness;
}

function measureScrollbarThickness(doc: Document): number {
  const probe = doc.createElement('div');
  probe.style.position = 'absolute';
  probe.style.top = '-200px';
  probe.style.width = '100px';
  probe.style.height = '100px';
  probe.style.overflow = 'scroll';
  probe.style.visibility = 'hidden';
  (doc.body ?? doc.documentElement).append(probe);
  const thickness = probe.offsetHeight - probe.clientHeight;
  probe.remove();
  return thickness;
}

/** Forgets every measured scrollbar thickness. Tests only. */
export function __resetLayoutViewportForTest(): void {
  thicknesses = new WeakMap();
}
