// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolveRingGeometry.ts
 * @input The resolved `--_spinner-ring-diameter` / `--_spinner-ring-rail` as
 *   read off the canvas — the public `--spinner-*` vars if a theme set them,
 *   the size's defaults otherwise — plus the size's built-in geometry.
 * @output The diameter and rail width the ring is actually drawn with.
 * @position Extracted from Spinner.tsx's draw effect so the fallback rules are
 *   testable. The ring is painted on a canvas — jsdom implements neither the
 *   2d context nor layout — so this is the only part of the geometry a unit
 *   test can reach. What it draws is verified in a browser.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Spinner/Spinner.tsx (the caller)
 * - /packages/core/src/Spinner/Spinner.doc.mjs (documented var defaults)
 */

/** The built-in geometry of a named size, in px. */
export interface RingGeometry {
  diameter: number;
  border: number;
}

/**
 * Resolve what the ring is drawn with, given a theme's values and the size's
 * defaults.
 *
 * The two vars are registered as `<length>`, so a themed value arrives already
 * resolved to px and `parseFloat` gets a real number — that is what lets a
 * theme write `rem`, `em` or `calc()`. Anything that did not resolve arrives as
 * `NaN` instead: no stylesheet yet on the first paint, a value the registration
 * rejected, or an engine without registered properties.
 *
 * The two vars fall back differently, and the asymmetry is deliberate:
 *
 * - **Diameter**: `0` is treated as absent. A zero-diameter ring is not a thing
 *   anyone asks for, and it is what an unresolved var looks like when a
 *   registration supplied `0px` as its initial value — so falling back keeps a
 *   spinner visible rather than rendering nothing at all.
 * - **Rail**: `0` is honoured. "No visible track" is a legitimate thing to
 *   theme, and reading it as absent is what made a rail of `0` silently draw
 *   the default 4px ring in a box sized for none.
 *
 * @param themedDiameter - parsed `--_spinner-ring-diameter`, or NaN when
 *   unresolved
 * @param themedRail - parsed `--_spinner-ring-rail`, or NaN when unresolved
 * @param fallback - the built-in geometry for the current `size`
 */
export function resolveRingGeometry(
  themedDiameter: number,
  themedRail: number,
  fallback: RingGeometry,
): RingGeometry {
  return {
    diameter:
      Number.isFinite(themedDiameter) && themedDiameter > 0
        ? themedDiameter
        : fallback.diameter,
    border: Number.isFinite(themedRail) ? themedRail : fallback.border,
  };
}
