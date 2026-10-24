// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file datePicker.ts
 * @input Nothing; data only
 * @output Exports `datePicker`, the UIDatePicker constants: the inline
 *   calendar (day selection, month paging and its chevrons, the month/year
 *   toggle and its wheels) and the date and time wheels' rules (the AM/PM
 *   column following the hour, looping columns, the bounds, the minute
 *   interval)
 * @position The date picker domain of the UIKit constants table
 *   (motion/uikit); read by the DateInput, DateTimeInput and TimeInput touch
 *   surfaces
 *
 * The inline calendar's month grid is a paging UICollectionView
 * (`isPagingEnabled`, `decelerationRate` 0.998): its drag, release and settle
 * are the paging table's (`paging`), and its wheels are UIPickerView's
 * (`picker`). This file holds what UIDatePicker adds on top.
 *
 * Every leaf carries one or more `@source` (apple-docs | wwdc | webkit |
 * measured | GUESS); webkit and GUESS values also carry the `@measure` task
 * that will confirm or replace them (motion/MEASUREMENTS.md). uikit.test.ts
 * enforces both. Times are in ms.
 *
 * The measurements are `UIDatePicker`s (`.date` `.inline`, `.compact`,
 * `.time`, `.date` and `.dateAndTime` `.wheels`, `.yearAndMonth`), en_US,
 * Gregorian, America/Los_Angeles, in an instrumented host app on the iOS 26.2
 * simulator (iPhone 17 Pro), driven by real HID touches: per-frame offsets,
 * the animations UIKit attached, the gesture recognizers' states and the
 * `valueChanged` events, Oct 23 2026.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/MEASUREMENTS.md (measurement tasks)
 * - /packages/core/src/motion/README.md (the table's file list)
 */

export const datePicker = {
  calendar: {
    selection: {
      /**
       * A tap on a day selects it at once: the new day's circle and numeral
       * take their style in the frame of the lift, the old day's go, with no
       * animation; `valueChanged` fires at the lift (81–95 ms after
       * touch-down for a quick tap).
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   taps on two days with every CAAnimation logged (none on the day
       *   cells) and `valueChanged` timestamps, Oct 23 2026
       */
      tapAnimates: false,
      /**
       * `setDate(_:animated: true)` moves the selection by fading the old
       * circle's background out and the new one's in on this spring, which
       * is critically damped with a 0.3 s response (`UIView.animate
       * (springDuration: 0.3, bounce: 0)`): settling in 0.441 s.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   `setDate(_:animated: true)` to a day in the shown month: two
       *   CASpringAnimation backgroundColor (mass 1, stiffness 438.649,
       *   damping 41.888, settlingDuration 0.441), Oct 23 2026
       */
      programmaticSpring: {mass: 1, stiffness: 438.649, damping: 41.888},
    },
    pager: {
      /**
       * While a finger drags the month grid, the header's title names the
       * month nearest the content offset: it changes when the content
       * crosses half a page, during the drag (and during a settle), not at
       * the lift.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   a slow drag released at 70 % of a page: the title turned to the
       *   next month at 51 % (offset 1124 of a 320 pt page from 960), 560 ms
       *   before the lift, Oct 23 2026
       */
      titleFollows: 'nearestPage',
      /**
       * A release picks its month by the paging rule and settles on the
       * paging integrator (`paging.release`, `paging.integrator`): slow
       * drags released at 30 % and 50 % of a page settle back, at 70 % on
       * the next month; a drag toward a month past `maximumDate` stays.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   the grid's `UICollectionView` (`isPagingEnabled`,
       *   `decelerationRate` 0.998) read and its offsets logged per frame
       *   for slow drags released at 30, 50 and 70 % and a drag past the
       *   last allowed month, Oct 23 2026
       */
      release: 'paging',
      /**
       * In a sheet, a drag that starts on the grid moves the sheet only when
       * it is steeper than 45° (vertical travel over horizontal above this
       * ratio). The grid pages only within its own axis lock
       * (`paging.panAxisRatio`, 26.6°), so the drags in between move
       * neither.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`
       *   in a sheet: drags at 20° paged the grid; at 35° and 45° moved
       *   neither the grid nor the sheet; at 55° and 65° moved the sheet,
       *   Oct 23 2026
       */
      sheetAxisRatio: 1,
    },
    chevron: {
      /**
       * A tap on the previous or next chevron names the new month in the
       * title at the lift, then scrolls the grid one page on
       * `setContentOffset(_:animated:)`'s curve (`paging.animatedScroll`:
       * 0.3 s, sinusoidal), starting in the same frame.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   a tap on Next: the title changed in the first frame after the
       *   lift and the offset ran 960 → 1280 on the 0.3 s sinusoid from that
       *   frame (9.67, 21.33, 80, 160, 240, 298.67, 317.67 pt at 33, 50, 100,
       *   150, 200, 250, 284 ms), Oct 23 2026
       */
      step: 'animatedScroll',
      /**
       * A second tap while the grid is still scrolling names the month after
       * that at once and starts a new 0.3 s sinusoid toward it from where the
       * grid is, from rest (the first motion's velocity is not kept).
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   two taps on Next 150 ms apart: the title jumped two months, the
       *   offset held one frame at 1092.33 and then ran to 1600 on a fresh
       *   0.3 s sinusoid (4, 59.33, 253.67, 448.33, 503.67 pt at 17, 67, 150,
       *   233, 283 ms), Oct 23 2026
       */
      retarget: 'fromPresentation',
      /**
       * In the first or last month `minimumDate` and `maximumDate` allow,
       * the chevron toward the outside is disabled, not hidden: it stays in
       * place, a touch on it goes to the header behind it, and its glyph
       * takes the secondary label colour.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`
       *   at `maximumDate`'s month: the Next button in place with opacity 1
       *   and `isEnabled` false, a tap on it landing on
       *   `_UICalendarHeaderView` and changing nothing, its glyph tinted
       *   rgba(0.235, 0.235, 0.263, 0.298) (#C5C5C7 on white) while the
       *   button's tintColor stays the accent, Oct 23 and 24 2026
       */
      atBound: 'disabled',
    },
    monthYearToggle: {
      /**
       * Tapping the title fades the month and year wheels in while the day
       * grid, the weekday row and both chevrons fade out, all at once; a
       * second tap reverses it. Each is a 0.25 s opacity animation from
       * `UIView.animate(withDuration: 0.25, options: .beginFromCurrentState)`
       * (no curve option: UIKit's default ease-in-ease-out,
       * `timing.curves.easeInOut`).
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   title taps opening and closing the wheels: five CABasicAnimation
       *   opacity 0.25 s (`_UICalendarMonthYearSelector`, the
       *   `UICollectionView`, `_UICalendarWeekdayView`, both buttons) under
       *   one `UIView.animate` 0.25 s with options 4, Oct 23 2026
       */
      fadeMs: 250,
      /**
       * The title's chevron turns a quarter turn with them: it points along
       * the reading direction while the calendar shows and down while the
       * wheels show, a 0.25 s transform animation each way (the same
       * `UIView.animate` curve as the fades).
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   the title's UIImageView: CABasicAnimation transform 0.25 s from a
       *   −90° rotation on opening and from +90° on closing, to identity,
       *   Oct 23 2026
       */
      chevronTurnDegrees: 90,
    },
    monthYearWheels: {
      /**
       * The month wheel behind the title loops: December is followed by
       * January.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   a fling of the month wheel from October past December landed on
       *   May, Oct 23 2026
       */
      monthLoops: true,
      /**
       * Turning the month or year wheel changes the picker's date, keeping
       * the day, and fires `valueChanged`.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline`,
       *   October 15 → May 15 after the month wheel's fling, with a
       *   `valueChanged` carrying May 15, Oct 23 2026
       */
      changesDate: true,
    },
  },
  compact: {
    /**
     * The compact picker's calendar opens on this spring (with a
     * `springDuration` 0.6 layout pass) while the field's label dims; the
     * same as `springs.menuOpen`.
     * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.compact`,
     *   a tap on the field: the popover's CASpringAnimations (damping ratio
     *   0.8, response 0.32), Oct 23 2026
     */
    present: {response: 0.32, dampingRatio: 0.8},
    /**
     * A tap outside closes it on this spring (`springs.menuClose`).
     * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.compact`,
     *   taps outside the open popover: CASpringAnimations damping ratio 0.85,
     *   response 0.35, Oct 23 2026
     */
    dismiss: {response: 0.35, dampingRatio: 0.85},
    /**
     * While it is open the field's label (`_UIDatePickerLinkedLabel`) dims,
     * and it undims on closing, each a 0.47 s opacity animation.
     * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.compact`,
     *   CABasicAnimation opacity 0.47 s on the label at both ends,
     *   Oct 23 2026
     */
    labelDimMs: 470,
  },
  wheels: {
    /**
     * In 12-hour time the AM/PM column follows the hour: turning the hour
     * from 11 to 12 turns the time from AM to PM (and back the other way),
     * while 12 to 1 keeps it.
     * @source measured: UIKit lab, iOS 26.2 simulator, `.time` `.wheels`,
     *   en_US: 11:58 AM, hour wheel +1 row → `valueChanged` 12:58 PM; +1
     *   again → 1:02 PM, Oct 23 2026
     */
    meridiemFollowsHour: true,
    columnTurn: {
      /**
       * A column the picker turns by itself (the AM/PM column following the
       * hour; a column turning back onto a bound) scrolls in this long with
       * `setContentOffset(_:animated: true)`, not `selectRow`. The AM/PM
       * column starts as the hour column reaches its row, 35 ms before the
       * hour rests and `valueChanged` fires; the same, reversed, from 12
       * back to 11.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.time` `.wheels`,
       *   en_US: the AM/PM table's per-frame offsets after the hour was
       *   dragged from 11 to 12 and back (32 pt over 0.29 s; first move at
       *   +1015 ms, hour at rest and `valueChanged` at +1050 ms); hooks on
       *   both `selectRow` paths never fired, Oct 24 2026; the hour column
       *   turning two rows back onto 9:00 (`restPastBound`), Oct 23 2026
       */
      durationMs: 300,
      /**
       * Its curve: the sinusoid ½ − ½ cos(πt) of an animated
       * `setContentOffset` (0.09 pt RMS over the AM/PM column's 19 frames,
       * against 0.39 pt for ease-in-ease-out; 0.42 against 0.53 pt over the
       * turn onto a bound), as this cubic-bézier, which stays within 0.2 %
       * of it.
       * @source measured: UIKit lab, iOS 26.2 simulator, `.time` `.wheels`,
       *   en_US: the same per-frame offsets fitted over 0.3 s, Oct 24 2026
       */
      curve: [0.37, 0, 0.63, 1],
    },
    /**
     * The hour and minute columns loop (12 is followed by 1, 59 by 00); the
     * AM/PM column does not. The hour column passes 12 twice a turn of 24
     * rows, flipping the AM/PM column each time.
     * @source measured: UIKit lab, iOS 26.2 simulator, `.time` `.wheels`,
     *   en_US: the hour turned 11 → 12 → 1 in one direction and the minute
     *   58 → 02 in four rows, Oct 23 2026; the hour +4 rows from 11 AM →
     *   3 PM, −4 back to 11 AM, and a fling of about 17 rows from 11 AM
     *   ending at 4 AM, Oct 24 2026
     */
    timeColumnsLoop: true,
    /**
     * A minute column passing 59 → 00 changes only the minutes: the hour
     * does not carry.
     * @source measured: UIKit lab, iOS 26.2 simulator, `.time` `.wheels`,
     *   en_US: 12:58 PM, minute wheel +4 rows → 12:02 PM, Oct 23 2026
     */
    minutesCarry: false,
    /**
     * `minuteInterval` must divide 60; 1 is the default and minimum, 30 the
     * maximum, and any other value falls back to 1. The minute column shows
     * every n-th minute.
     * @source apple-docs https://developer.apple.com/documentation/uikit/uidatepicker/minuteinterval
     */
    minuteIntervalMax: 30,
    /**
     * With `roundsToMinuteInterval` (the default), the picker's date always
     * rounds to the minute interval.
     * @source apple-docs https://developer.apple.com/documentation/uikit/uidatepicker/roundstominuteinterval
     */
    roundsToMinuteInterval: true,
    /**
     * A column that comes to rest past `minimumDate` or `maximumDate`
     * turns back onto the bound, and `valueChanged` already carries the
     * bound (the hour of 10:00 dragged to 7 with bounds 9:00–17:00: the
     * date reads 9:00 at rest and the hour column turns 64 pt, two rows,
     * back to 9 on `columnTurn`).
     * @source measured: UIKit lab, iOS 26.2 simulator, `.time` `.wheels`
     *   with bounds 9:00–17:00 and `minuteInterval` 15, per-frame hour
     *   offsets after the rest (0.4, 2, 7.4, 16, 26.4, 37.7, 48.3, 56.7,
     *   62, 64 pt at 33 ms steps) and the `valueChanged` time, Oct 23 2026
     */
    restPastBound: 'turnToBound',
    /**
     * In `.date` wheels a day the month does not have clamps to the month's
     * last day (January 30, month +1 → February 28).
     * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.wheels`
     *   with bounds Jun 1 2026 – Mar 15 2027, Oct 23 2026
     */
    dayClampsToMonth: true,
    /**
     * In `.yearAndMonth` mode the month column does not loop: a fling from
     * October stops at December.
     * @source measured: UIKit lab, iOS 26.2 simulator, `.yearAndMonth`
     *   `.wheels`, a month fling from October, Oct 23 2026
     */
    yearAndMonthMonthLoops: false,
  },
} as const;
