// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file list.ts
 * @input `timing` (the press clocks the touch press model measured)
 * @output Exports `list`: the clocks and curves of UITableView and
 *   UICollectionView list cells (the cell highlight's release, the selected
 *   cell's deselect inside a navigation pop, the touch row heights, the
 *   springs of list updates and outline expansion)
 * @position The list domain of the UIKit constants table (motion/uikit);
 *   read by utils/interactionOverlay.stylex.ts (the row press layer)
 *   through its build-time mirror, by List/selectionHold.ts (a row kept
 *   selected through a navigation push), by List/listRow.stylex.ts (touch
 *   row heights) through its mirror, and by TreeList/useTreeExpansionMotion.ts
 *   (expand and collapse)
 *
 * Every leaf carries one or more `@source`; GUESS values also carry the
 * `@measure` task that will confirm or replace them (MEASUREMENTS.md, M-LI
 * rows). uikit.test.ts enforces both. Durations are in ms; curves are
 * cubic-bézier control points [x1, y1, x2, y2]; lengths are in points, one
 * CSS px each.
 *
 * The deselect's clock and curve and the update springs are motion roles a
 * theme may retune (motion/roles.ts: `list.deselect.navigationPopMs`,
 * `list.deselect.navigationPopCurve`, `list.update.outlineSpring`,
 * `list.update.tableSpring`); the highlight's release is not (see the
 * registration below), and the row heights are lengths, not motion.
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
    /**
     * How far a row's text moves into the table when it enters edit mode:
     * the content view moves 44 pt to make room for the editing control and
     * its margin shrinks from 20 to 16 pt, so the visible text of a plain
     * table's rows moves 40 pt (every cell style, a `.none` style row
     * included, unless it opts out of the indent). The trailing accessories
     * fade out in place and do not move.
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro,
     *   `setEditing(_:animated:)` on a plain UITableView, view frames read
     *   frame by frame (batch 75), Oct 24 2026
     */
    editingIndent: 40,
  },
  update: {
    /**
     * An outline list's expand and collapse (UICollectionView list,
     * `outlineDisclosure`, a section snapshot applied with animated
     * differences): the children slide out from under the parent as one
     * block inside a clip that grows with them, the rows below move with
     * them, and the disclosure chevron turns 90°, all on this spring
     * (critically damped, response 0.25 s, 0.367 s to settle). No fade.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone
     *   17 Pro, CAAnimation dump (CASpringAnimation m1 k631.655 c50.265 on
     *   the children, the rows below, the clip and the chevron), Oct 23 2026
     */
    outlineSpring: {mass: 1, stiffness: 631.655, damping: 50.265},
    /**
     * A table's row updates: insert, delete, move and reload (`.automatic`
     * and `.fade`), batch updates, editing's slide-in and self-sizing
     * growth (critically damped, response 0.3 s, 0.441 s to settle). Edit
     * mode (`setEditing(_:animated:)`) enters and leaves on this spring,
     * `UIView.animate(springDuration: 0.3, bounce: 0)`: the rows' content,
     * the editing controls and the reorder grips together.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone
     *   17 Pro, CAAnimation dump (CASpringAnimation m1 k438.649 c41.888),
     *   Oct 23 2026; edit mode, batch 75, Oct 24 2026
     */
    tableSpring: {mass: 1, stiffness: 438.649, damping: 41.888},
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
