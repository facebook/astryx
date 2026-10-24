// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerKeyboardClearance.ts
 * @input A layer's box, the layout viewport's height and the keyboard's
 *   cover
 * @output Exports `LAYER_KEYBOARD_CLEARANCE_PX` and `keyboardClearanceCap`
 * @position Layer runtime: the software keyboard cap's numbers, with no DOM
 *   and no React, so a browser proof can import them on its own
 *   (useLayerKeyboardClearance.ts applies them; spec:AST-059 FR9)
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/useLayerKeyboardClearance.ts
 * - /packages/core/src/Layer/useLayerKeyboardClearance.test.tsx
 */

/**
 * How far above the software keyboard a capped layer ends, CSS px: the
 * clearance UIKit keeps under a popover the keyboard would cover.
 * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
 *   iPhone 17 Pro, presentation frames and CABasicAnimation dumps, Oct 23
 *   2026: a 320 × 533 popover below a source at y 160 (top 204) shrank to
 *   325 pt, its bottom at 529 with the keyboard's top at about 539, from
 *   UIKeyboardWillShow over the keyboard's 0.3833 s, and grew back the same
 *   way on the hide; a 320 × 240 popover clear of the keyboard did not move
 */
export const LAYER_KEYBOARD_CLEARANCE_PX = 10;

/**
 * The block size that keeps a layer `LAYER_KEYBOARD_CLEARANCE_PX` above a
 * keyboard covering `inset` px of the layout viewport's bottom, or null when
 * the layer (at its own size) is already clear of it.
 */
export function keyboardClearanceCap(
  box: {top: number; bottom: number},
  viewportHeight: number,
  inset: number,
): number | null {
  if (inset <= 0) {
    return null;
  }
  const limit = viewportHeight - inset - LAYER_KEYBOARD_CLEARANCE_PX;
  if (box.bottom <= limit) {
    return null;
  }
  return Math.max(0, limit - box.top);
}
