// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file picker.ts
 * @input Nothing; data only
 * @output Exports `picker`, the UIPickerView constants: the cylinder the rows
 *   sit on, the selection band, the release rule (velocity, target, coast),
 *   the snap at rest, the tap spin and the selection tick
 * @position The picker domain of the UIKit constants table (motion/uikit);
 *   read by DateInput/wheelPhysics.ts, DateInput/wheelDrum.ts and the Wheel
 *
 * Every leaf carries one `@source` (apple-docs | wwdc | webkit | measured |
 * GUESS); webkit and GUESS values also carry the `@measure` task that will
 * confirm or replace them (listed in motion/MEASUREMENTS.md). uikit.test.ts
 * enforces both.
 *
 * Lengths are in pt at UIKit's scale (the Wheel scales them to its row
 * pitch), times in ms, velocities in pt/ms (UIScrollView's own unit).
 *
 * The measurements are a 402 × 216 pt UIPickerView with two columns (24 and
 * 60 rows) in an instrumented host app on the iOS 26.2 simulator (iPhone 17
 * Pro), driven by real HID touches: per-frame offsets, the table views' and
 * cells' layers, the delegate calls and the haptics, Oct 23 2026.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/MEASUREMENTS.md (measurement tasks)
 */

export const picker = {
  geometry: {
    /**
     * Row pitch: rows sit at k × 32 pt in each column's table.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIPickerView table offsets and cell frames, Oct 23 2026
     */
    rowHeight: 32,
    /**
     * The picker's height (its intrinsic content size).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIPickerView frame, Oct 23 2026
     */
    height: 216,
    /**
     * Radius of the cylinder the rows are drawn on. Each cell is a rotation
     * about x by its distance from the band over this radius (18.85°,
     * 37.8°, 56.7°, 75.7° for rows ±1 to ±4), moved onto the cylinder
     * (R sin θ, R (cos θ − 1)).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, cell CATransform3D of the outer table copies at rest
     *   (m22 = m33 = cos θ, m23 = −m32 = sin θ; m42, m43), Oct 23 2026
     */
    cylinderRadius: 97.2,
    /**
     * Perspective distance of the dimmed copies above and below the band:
     * their tables' sublayerTransform has m34 = −1/900, centred on the
     * picker (every column's table is centred on it, so all columns share
     * one vanishing point). The band's own copy has none.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIPickerTableView layer sublayerTransform, Oct 23 2026
     */
    perspective: 900,
    /**
     * Height of the selection band, centred on the picker.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the band UIView (384 × 34 pt at 9, 291), Oct 23 2026
     */
    bandHeight: 34,
    /**
     * The band's inset from the picker's sides: one band spans every column.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the band UIView (384 × 34 pt at 9, 291 in a 402 pt
     *   picker), Oct 23 2026
     */
    bandInset: 9,
    /**
     * The band's copy of the rows is magnified about the picker's centre:
     * its labels are 23.5 pt against 21 pt in the dimmed copies, and its
     * columns sit that much further from the centre (band digits ≈ 11 pt
     * outward of the rows above and below, on screen).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, label fonts of the three table copies and the
     *   rendered digits' extents in a screenshot, Oct 23 2026
     */
    bandMagnification: 23.5 / 21,
    /**
     * Opacity of the rows in the copies above and below the band (the band's
     * copy is opaque); the same at every angle.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, label alpha in the outer table copies, Oct 23 2026
     */
    outerOpacity: 0.447,
    /**
     * d of the rubber band past the first or last row: the column's table
     * view is 291 pt tall in a 216 pt picker (scroll.rubberBand's formula
     * with c = 0.55 puts 10, 50 and 110 pt of finger travel past the end at
     * 5.4, 25.1 and 50.1 pt; measured 5.3, 25 and 50).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIPickerTableView frame and offsets during drags
     *   20, 60 and 120 pt past the last row, Oct 23 2026
     */
    rubberBandDimension: 291,
  },
  release: {
    /**
     * The velocity the scroll view coasts with is not the pan's own
     * velocity(in:) but 0.25 × it plus 0.75 × its value one event earlier
     * (0.05 / 0.35 / 0.60 on the last three instantaneous velocities, a
     * missing older one taking the oldest value): 0.9335, 0.5437, 2.1143
     * and 1.0146 pt/ms against 0.9334, 0.5436, 2.1140 and 1.0162 handed to
     * scrollViewWillEndDragging on four HID releases.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, scrollViewWillEndDragging velocity against the touch
     *   stream, four releases (200 pt in 50, 100 and 200 ms; a 90 pt flick),
     *   Oct 23 2026
     */
    currentVelocityWeight: 0.25,
    /**
     * The speed at which a coast ends. The scroll view's projected target is
     * offset + (v − this) × r ÷ (1 − r) with r = scroll.decelerationRate
     * .normal (461.33, 502.67 and 266.67 pt for v = 0.9334, 1.0162 and
     * 0.5436, all three to 0.3 pt). The coast onto the row it snaps to keeps
     * the release velocity and re-solves the rate so that the speed reaches
     * this exactly at that row, where it stops (0.4 and 0.3 pt RMS over two
     * coasts, ending within 30 ms of the measured end).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, scrollViewWillEndDragging targets and per-frame
     *   offsets to rest, Oct 23 2026
     */
    stopSpeed: 0.0089,
    /**
     * Below this release speed (pt/ms, the weighted velocity above) a
     * release inside the rows carries no velocity: the wheel snaps to the
     * nearest row instead of coasting. Past the first or last row the
     * velocity is kept, however small (0.0816 kept). A pause before the lift
     * does not zero it: the velocity changes only when the finger moves.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, steady 100 pt drags mid-list lifted while moving: zeroed
     *   at 100 to 250 pt/s both ways, passed from 260 pt/s (0.2577 the
     *   smallest velocity handed on); a 300 pt/s drag held still 300 ms
     *   still coasted, Oct 23 2026
     */
    minimumSpeed: 0.25,
  },
  /**
   * A release without velocity (or a coast already on a row) eases onto the
   * nearest row exponentially, at this fraction of the distance left per
   * millisecond: e^(−0.011 t), done in about 0.3 s (fitted 0.0099, 0.0107
   * and 0.0123 for snaps of 4, 6 and 8 pt).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame offsets after three slow releases between
   *   rows, Oct 23 2026
   */
  snapRate: 0.011,
  tapSpin: {
    /**
     * A tap on a row turns the wheel onto it (setContentOffset animated) in
     * this long, on Core Animation's ease-in-ease-out
     * (timing.curves.easeInOut), and selects it on arrival; a tap on the
     * band's row does nothing.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-frame offsets after a tap two rows below the band
     *   (6.8, 25.1, 50.2, 75.4, 93.7 % at 50 ms steps, arriving at 300 ms;
     *   the same with Reduce Motion and Prefer Cross-Fade on), Oct 23 2026
     */
    durationMs: 300,
  },
  selectionTick: {
    /**
     * One selection haptic per row whose centre reaches the band's centre,
     * at most one per this interval. Not during a tap's spin.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, selectionChangedAtLocation: and the feedback
     *   generator's minimum interval (0.040 s) logged during drags and
     *   coasts, Oct 23 2026
     */
    minimumIntervalMs: 40,
  },
} as const;
