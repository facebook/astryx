// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetEdgeTint.tsx
 * @input Uses StyleX and core color tokens
 * @output Exports BottomSheetEdgeTint, an internal decorative element
 * @position Private helper rendered inside a non-modal BottomSheet dialog
 *
 * iOS 26 Safari dropped `<meta name="theme-color">` and instead derives the
 * colour it paints behind its translucent toolbars by sampling the page: it
 * hit tests a point just inside each viewport edge, walks up to the nearest
 * `fixed`/`sticky` ancestor, and extends that element's declared
 * `background-color` into the browser chrome.
 *
 * A modal sheet is served by that heuristic already — WebKit has a dedicated
 * branch for a dialog's `::backdrop`. A non-modal sheet is not: the nearest
 * fixed ancestor of the panel is the sheet's own full-viewport `<dialog>`,
 * which is transparent and viewport-sized, and WebKit answers a viewport-sized
 * candidate by *keeping the colour it already had* — the host page's. The page
 * then shows through behind the address bar while the sheet covers the screen
 * above it.
 *
 * This element gives the heuristic something unambiguous to sample: fixed,
 * full width, flush with the bottom edge, taller than WebKit's 10px minimum
 * for reading a declared colour, and painted in the sheet's own surface
 * colour. It is masked out so it never renders for the user; Safari reads the
 * computed style, not the painted pixels.
 *
 * Everywhere else it is inert decoration.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.test.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

/**
 * WebKit ignores the declared `background-color` of a sampled box thinner than
 * 10px and falls back to sampling painted pixels, which a masked element has
 * none of. 12px clears that floor with room to spare and is still far below
 * the ~40px of chrome it colours.
 */
const SAMPLE_HEIGHT_PX = 12;

const styles = stylex.create({
  tint: {
    position: 'fixed',
    insetInline: 0,
    insetBlockEnd: 0,
    height: `${SAMPLE_HEIGHT_PX}px`,
    backgroundColor: colorVars['--color-background-surface'],
    // Above the panel so the edge hit test lands here, and never in the way of
    // a touch that was meant for the sheet.
    zIndex: 2,
    pointerEvents: 'none',
    // Invisible to the user. WebKit's sampler checks `visibility` and
    // `opacity` — either would disqualify the element — but not `mask`, so
    // this hides the strip while leaving the colour readable. Without it the
    // strip would show as a hairline under the panel as the sheet slides out.
    maskImage: 'linear-gradient(transparent, transparent)',
    WebkitMaskImage: 'linear-gradient(transparent, transparent)',
  },
});

/**
 * Colours the iOS Safari toolbar strip below a non-modal sheet. Renders
 * nothing visible; see the file header for why it exists.
 */
export function BottomSheetEdgeTint() {
  return (
    <div
      {...stylex.props(styles.tint)}
      data-sheet-edge-tint=""
      aria-hidden="true"
    />
  );
}
