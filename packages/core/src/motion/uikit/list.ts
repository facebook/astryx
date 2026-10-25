// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file list.ts
 * @input `timing` (the press clocks the touch press model measured)
 * @output Exports `list`: the clocks and curves of UITableView and
 *   UICollectionView list cells (the cell highlight's release, the selected
 *   cell's deselect inside a navigation pop, the touch row heights)
 * @position The list domain of the UIKit constants table (motion/uikit);
 *   read by utils/interactionOverlay.stylex.ts (the row press layer)
 *   through its build-time mirror, by List/selectionHold.ts (a row kept
 *   selected through a navigation push), and by List/listRow.stylex.ts
 *   (touch row heights) through its mirror
 *
 * Every leaf carries one or more `@source`; GUESS values also carry the
 * `@measure` task that will confirm or replace them (MEASUREMENTS.md, M-LI
 * rows). uikit.test.ts enforces both. Durations are in ms; curves are
 * cubic-bézier control points [x1, y1, x2, y2]; lengths are in points, one
 * CSS px each.
 *
 * The deselect's clock and curve are motion roles a theme may retune
 * (motion/roles.ts: `list.deselect.navigationPopMs`,
 * `list.deselect.navigationPopCurve`); the highlight's release is not (see
 * the registration below).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/MEASUREMENTS.md
 * - /packages/core/src/utils/interactionOverlay.stylex.ts (`cellPressConsts`
 *   mirrors the cell release; interactionOverlay.cell.test.ts checks it)
 * - /packages/core/src/List/listRow.stylex.ts (`listRowConsts` mirrors the
 *   row heights; List.test.tsx checks it)
 */

import {registerMotionTable} from '../roles';
import {timing} from './timing';

export const list = {
  highlight: {
    /**
     * After the finger lifts, a cell's highlight leaves over this long:
     * UIKit's deselect cross-fade, the clock the touch press model removes
     * its attribute on.
     * @source measured: Settings and Contacts, iOS 26.2, simulator driven
     *   with real HID touches at 60 fps (PRESS_FADE_MS,
     *   packages/core/src/utils/pressGesture.ts, 2026-10-06)
     */
    releaseMs: timing.press.highlightOutMs,
    /**
     * The release's curve: an ease-out that spends the whole clock fading
     * (strength ≈ 0.2 at the midpoint), the curve the touch press model
     * shipped with.
     * @source GUESS — the curve the touch press model shipped with
     *   (utils/interactionOverlay.stylex.ts), chosen to read as a deselect
     *   cross-fade, not read from UIKit; the curve Core Animation attaches to
     *   the cell's deselect is to be read
     * @measure M-LI01
     */
    releaseCurve: [0, 0, 0.2, 1],
  },
  deselect: {
    /**
     * A row selected for a push is deselected when the pop starts (the back
     * button, or the edge swipe beginning): its background and its
     * separators fade over this long, linearly, inside the navigation
     * transition, so an interactive pop scrubs them with its progress.
     * List rows follow the background only: their dividers are borders,
     * which have no compositor-only fade, so they come back in the
     * deselect's first frame (List/ListItem.tsx) instead of fading in.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone
     *   17 Pro, cell hooks + CAAnimation dump (setSelected:NO animated:YES at
     *   the pop's start; backgroundColor and separator opacity
     *   CABasicAnimations, 0.35 s linear, inside the transition), Oct 23 2026
     */
    navigationPopMs: 350,
    /**
     * The deselect's pacing inside the pop: linear in the transition's time
     * (cubic-bézier (0, 0, 1, 1)).
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone
     *   17 Pro, CAAnimation dump (linear timing function), Oct 23 2026
     */
    navigationPopCurve: [0, 0, 1, 1],
  },
  metrics: {
    /**
     * A one-line row's height: the `.default`, `.value1` and `.value2`
     * styles at the default text size (`rowHeight` automatic).
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone
     *   17 Pro, view frame read (UITableView cells), Oct 23 2026
     */
    rowHeight: 52,
    /**
     * A row with a second line: the `.subtitle` style at the default text
     * size.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone
     *   17 Pro, view frame read (UITableView cells), Oct 23 2026
     */
    subtitleRowHeight: 62,
  },
} as const;

/**
 * Registers the list table's motion roles: each spring, duration and curve
 * above is a role a theme may retune (motion/roles.ts), but for the cell
 * highlight's release, whose clock is the touch press model's
 * (`timing.press.highlightOutMs`, a role of its own) and which the press
 * layer reads at build time (utils/interactionOverlay.stylex.ts
 * `cellPressConsts`), where no theme variable reaches it. Idempotent; the
 * list's touch modules call it before their first motion, so a page that
 * never animates a list ships no list roles.
 */
export function registerListTable(): void {
  registerMotionTable('list', list, {exclude: ['highlight']});
}
