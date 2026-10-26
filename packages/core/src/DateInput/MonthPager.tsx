// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MonthPager.tsx
 * @input Month bounds, selected value, constraints, week start
 * @output Exports MonthPager, MonthScroller's counterpart with the same props
 *   and handle
 * @position Internal component of the pickers' touch layer
 *   (datePickerTouch.ts); TouchDateField.tsx and TouchDateTimeField.tsx render
 *   it under a finger, on iPhone and Android alike, and MonthScroller (native
 *   scroll-snap) with a mouse
 *
 * The inline calendar's month grid, paged the way UIDatePicker pages it: a
 * paging scroll view (motion/uikit/datePicker.ts `calendar`, on the paging
 * table). It is driven by the shared pager (hooks/usePager.ts), not native
 * scrolling:
 *
 * - A horizontal drag moves the months 1:1 on the compositor; past the first
 *   or last reachable month it rubber-bands.
 * - At the lift the month is chosen with UIKit's paging rule (300 pt/s or
 *   half a page, at most one month per release) and the grid settles on
 *   UIKit's paging integrator. A native scroll-snap container cannot: iOS
 *   gives it the fast deceleration rate bent onto WebKit's snap target, and
 *   a fling crossed three or four months.
 * - The header's title follows the drag: it names the month nearest the
 *   offset, changing as the content crosses half a page.
 * - `scrollToMonth` runs `setContentOffset(_:animated:)`'s 0.3 s curve (the
 *   header chevrons), restarting from wherever the grid is when a second tap
 *   lands mid-scroll; a far jump (the wheels, Today) moves at once.
 * - Inside a bottom sheet, a drag is decided as UIKit decides it, on the
 *   first move where either axis has travelled 10 px: the pager's when its
 *   sideways travel has reached 10 px there, the sheet's otherwise
 *   (useSheetAxisSplit).
 *
 * Every pane is a fixed six-row grid, so the picker never changes height. The
 * list is long (a century by default) but only a few panes are mounted, each
 * placed at its own offset in the pager's track and on its own compositor
 * layer: through a busy main thread Mobile Safari moves the track but cannot
 * paint a page it had not painted.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/MonthScroller.tsx (the shared props and
 *   handle)
 * - /packages/core/src/DateInput/TouchDateField.tsx
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx
 * - /packages/core/src/DateInput/__tests__/MonthPager.interaction.browser.spec.ts
 */

import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useCalendarDays} from '../Calendar';
import {usePager} from '../hooks/usePager';
import {useDirection, useLocale} from '../i18n';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {
  colorVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
  durationVars,
  borderVars,
} from '../theme/tokens.stylex';
import {focusOutlineStyles} from '../utils';
import {
  type DayOfWeek,
  type ISODateString,
  type PlainDate,
  plainDateAddDays,
  plainDateAddMonths,
  plainDateDayOfWeek,
  plainDateFormat,
  plainDateIsEqual,
  plainDateToISO,
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
} from '../utils';
import {dateInputTouchSizes, dateInputTouchGeometry} from './tokens.stylex';
import type {MonthScrollerProps} from './MonthScroller';
import {useSheetAxisSplit} from './useSheetAxisSplit';
import {
  clampIndex,
  fromMonthIndex,
  monthIndexOf,
  paneWindow,
  rowsIn,
} from './monthGeometry';

const DAY_SIZE = dateInputTouchSizes.daySize;

/**
 * Panes mounted on each side of the target month: UIKit's calendar keeps
 * seven pages. A release moves at most one month and a chevron one per tap,
 * so the window, which follows the target, always holds the pages on screen.
 */
const OVERSCAN = 3;

/**
 * A horizontal wheel gesture (a trackpad's two-finger swipe, or Shift with a
 * mouse wheel) pages one month once it has travelled this far, as the native
 * scroller paged before; a gesture ends after this long without a wheel
 * event, its momentum included.
 *
 * @source GUESS — not UIKit values: UIKit's grid follows a trackpad's scroll
 *   and pages on its release rule, which this step stands in for; 25 px turns
 *   a month on a short deliberate swipe but not on a nudge, and 120 ms
 *   outlasts the gap between a swipe's momentum events
 * @measure M-DP02
 */
const WHEEL_STEP_PX = 25;
const WHEEL_QUIET_MS = 120;

const styles = stylex.create({
  viewport: {
    position: 'relative',
    blockSize: dateInputTouchGeometry.paneBlockSize,
    // Stated, not inherited from the reset: the pane size and the pager's
    // page width key off the measured box.
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  /** The row of panes the pager translates. */
  track: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    inlineSize: '100%',
    // No native pan on either axis: horizontal drags are the pager's and
    // vertical ones the sheet's, both in JavaScript, as on the sheet's own
    // surface. (The pager leaves the viewport `pan-y`, which in a sheet lets
    // the browser start a vertical scroll and throttle the moves the sheet
    // drags with.) Pinch-zoom stays the browser's.
    touchAction: 'pinch-zoom',
  },
  pane: {
    position: 'absolute',
    insetBlock: 0,
    blockSize: dateInputTouchGeometry.paneBlockSize,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: dateInputTouchGeometry.paneRows,
    // Its own layer, painted whole before it moves (see the file header).
    willChange: 'transform',
  },
  row: {
    display: 'contents',
  },
  cell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    inlineSize: '100%',
    blockSize: '100%',
    minInlineSize: DAY_SIZE,
    minBlockSize: DAY_SIZE,
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    // A tap on a 44px target should not also select the number inside it.
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  /**
   * The circular hit/selection puck inside the tap target. Sizing the puck
   * rather than the button keeps the touch target at the full cell while the
   * visual stays a tidy circle.
   */
  puck: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    inlineSize: `calc(${DAY_SIZE} - 8px)`,
    blockSize: `calc(${DAY_SIZE} - 8px)`,
    borderRadius: radiusVars['--radius-full'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: durationVars['--duration-fast'],
  },
  puckHoverable: {
    // Two guards, for two different failure modes.
    //
    // `@media (hover: hover)`: on a touch screen a :hover tint sticks to the
    // last tapped day until something else is tapped.
    //
    // `:where(:not(:disabled,[aria-disabled="true"]))`: a browser suppresses a
    // disabled control's EVENTS, not its hover styling, so an unguarded
    // :hover tints a day you cannot pick. The day's disabled state lives on
    // the button (as `aria-disabled`, which keeps it focusable) and this puck
    // is the span inside it, so today the working mechanism is the JS gate at
    // the call site — this guard is what keeps the rule true if the styles
    // ever move onto the button itself.
    backgroundColor: {
      default: 'transparent',
      '@media (hover: hover)': {
        default: 'transparent',
        ':hover:where(:not(:disabled,[aria-disabled="true"]))':
          colorVars['--color-overlay-hover'],
      },
    },
  },
  puckToday: {
    borderColor: colorVars['--color-border-emphasized'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  puckSelected: {
    backgroundColor: {
      default: colorVars['--color-accent'],
      // Holds the accent through hover, overriding puckHoverable's tint.
      // Same guarded selector, so the two have equal specificity and
      // application order decides — which is what puts this one on top.
      ':hover:where(:not(:disabled,[aria-disabled="true"]))':
        colorVars['--color-accent'],
    },
    borderColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  /**
   * A day belonging to the month either side of this pane. Muted the way
   * Calendar mutes its own, and unselectable for the same reason it is
   * there: it exists to show where the month ends, not to offer a date. A
   * pane is one month, and tapping out of it would move the calendar under
   * your thumb; the swipe or the arrow says "next month" without ambiguity.
   *
   * It needs no special handling for the roving tab order: `tabbableISO` is
   * resolved per pane and only ever names a date in THAT pane's own month,
   * so an outside cell can never match it, and only the pane the pager shows
   * takes a tab stop at all (`isCurrent`). Which is the property that keeps
   * a date from having two tab stops — the pane that owns it, and the
   * neighbour that merely shows it.
   */
  dayOutside: {
    // Exactly what the desktop calendar does to its own spill days: the
    // secondary text colour AND half opacity, which is what makes them read
    // as background rather than as dimmer choices. (Calendar splits these
    // across two style objects — `dayOutside` in its theme layer carries the
    // colour, the one in its structural layer the opacity — so applying only
    // the colour, as this did at first, was half the treatment.)
    color: colorVars['--color-text-secondary'],
    opacity: 0.5,
  },
  dayDisabled: {
    // The desktop's disabled treatment, and deliberately not a disabled
    // COLOUR: it fades whatever colour the day already had (0.3), so an
    // in-month day and a spilled one stay a step apart while disabled, and
    // both land LIGHTER than an enabled spill day rather than darker.
    //
    // A flat `--color-text-disabled` is what this had, and it put an enabled
    // adjacent day at ~168 against a disabled in-month day at ~163 on white:
    // five levels apart, which is no difference at all. That is the whole
    // reason the two were hard to tell apart.
    opacity: 0.3,
    cursor: 'default',
  },
});

const dynamic = stylex.create({
  // insetInlineStart, not left: under RTL the panes lay out from the right,
  // and the pager mirrors its track with them.
  pane: (insetInlineStart: number, inlineSize: number) => ({
    insetInlineStart: `${insetInlineStart}px`,
    inlineSize: `${inlineSize}px`,
  }),
});

/**
 * A run of month grids paged like UIDatePicker's inline calendar.
 */
function MonthPagerComponent({
  handleRef,
  minMonthIndex,
  maxMonthIndex,
  initialMonthIndex,
  onVisibleMonthChange,
  selectedDate,
  today,
  isDateDisabled,
  weekStartsOn,
  onSelect,
}: MonthScrollerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rowCount = maxMonthIndex - minMonthIndex + 1;
  const initialRow = clampIndex(
    initialMonthIndex - minMonthIndex,
    0,
    rowCount - 1,
  );

  // Pane width is read from layout, never assumed, so the panes follow a
  // resize (rotation, a split-screen change). The pager measures the same
  // box for its page width.
  const [paneSize, setPaneSize] = useState(0);
  const paneSizeRef = useRef(0);
  // The pager's target month: the mounted window follows it.
  const [centerRow, setCenterRow] = useState(initialRow);
  // The month last reported to the owner, so a drag reports each crossing
  // once.
  const reportedRowRef = useRef(initialRow);
  // A far jump waits for its pane to mount before the track moves.
  const pendingRowRef = useRef<number | null>(null);

  // Keyboard focus moves by date, not by cell index, so it crosses month
  // boundaries the way a calendar should. Null until the user takes the grid
  // with the keyboard.
  const [focusedDate, setFocusedDate] = useState<PlainDate | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  const onVisibleMonthChangeRef = useRef(onVisibleMonthChange);
  useLayoutEffect(() => {
    onVisibleMonthChangeRef.current = onVisibleMonthChange;
  });

  const report = useCallback(
    (row: number) => {
      if (row === reportedRowRef.current) {
        return;
      }
      reportedRowRef.current = row;
      onVisibleMonthChangeRef.current(minMonthIndex + row);
    },
    [minMonthIndex],
  );

  const pager = usePager({
    viewportRef,
    trackRef,
    count: rowCount,
    defaultIndex: initialRow,
    onIndexChange: (index, reason) => {
      setCenterRow(index);
      // A release's month is reported by the settle as the content crosses
      // half a page (below); a steered move was asked for by an owner that
      // already knows the month.
      if (reason !== 'drag') {
        reportedRowRef.current = index;
      }
    },
    // The settle has come to rest: whatever the frames showed, the title
    // names the month the grid rests on.
    onSettle: index => report(index),
    // UIKit's split in a sheet (useSheetAxisSplit, motion/MEASUREMENTS.md
    // M-DP01): the pan begins on the first move where either axis has
    // travelled its hysteresis, and only if the sideways travel has reached
    // it there, however steep the drag. Like every pan, it claims its touch
    // only when it begins, the move the sheet's split decides on too.
    panOptions: {
      axisRatio: 0,
      shouldBegin: recognizer =>
        Math.abs(recognizer.totalTranslation().x) >=
        UIKIT_GESTURES.pan.hysteresis.value,
    },
  });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport == null) {
      return;
    }
    const measure = () => {
      // Ignore zero: the picker can be mounted inside something not yet
      // displayed (a closed BottomSheet).
      const measured = viewport.clientWidth;
      if (measured > 0) {
        paneSizeRef.current = measured;
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- pane width is a measurement; layout is the only place it exists
        setPaneSize(measured);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // The settle's frames, read for the title until the grid rests.
  const settleFrameRef = useRef<number | null>(null);
  const followSettle = useCallback(() => {
    if (settleFrameRef.current != null) {
      cancelAnimationFrame(settleFrameRef.current);
    }
    let frames = 0;
    const step = () => {
      frames += 1;
      const width = paneSizeRef.current;
      if (frames > 2 && width > 0) {
        report(
          clampIndex(Math.round(pager.presentation() / width), 0, rowCount - 1),
        );
      }
      settleFrameRef.current =
        frames <= 2 || pager.isSettling ? requestAnimationFrame(step) : null;
    };
    settleFrameRef.current = requestAnimationFrame(step);
  }, [pager, report, rowCount]);
  // Synchronizes with the browser's frame loop: stops reading a settle's
  // frames once the grid unmounts.
  useEffect(
    () => () => {
      if (settleFrameRef.current != null) {
        cancelAnimationFrame(settleFrameRef.current);
      }
    },
    [],
  );

  // The title follows the drag: the month nearest the offset, reported as the
  // content crosses half a page (UIDatePicker's
  // `datePicker.calendar.pager.titleFollows`). The pager's own listener runs
  // first, so the position read here is the one this move wrote.
  useEffect(
    () =>
      pager.pan.addListener(recognizer => {
        const state = recognizer.state;
        if (state === 'began' || state === 'changed') {
          const width = paneSizeRef.current;
          if (width > 0) {
            report(
              clampIndex(
                Math.round(pager.presentation() / width),
                0,
                rowCount - 1,
              ),
            );
          }
        } else if (state === 'ended' || state === 'cancelled') {
          // Not at the lift: the settle carries the title on, changing it as
          // the content crosses half a page, as during the drag. Its first
          // two frames report nothing, so the owner's render stays out of
          // Mobile Safari's hand-off of the settle to the compositor (the
          // pager defers its own report the same way).
          followSettle();
        }
      }),
    [pager, report, rowCount, followSettle],
  );

  // A steered move (an arrow, a key, the wheels, a trackpad step) names its
  // month: the release's settle it interrupts stops reporting, so the title
  // stays on the month the step named instead of falling back to the one the
  // content is still nearest (UIDatePicker's
  // `datePicker.calendar.chevron.retarget`).
  const stopFollowingSettle = useCallback(() => {
    if (settleFrameRef.current != null) {
      cancelAnimationFrame(settleFrameRef.current);
      settleFrameRef.current = null;
    }
  }, []);

  const scrollToMonth = useCallback(
    (monthIndex: number, behavior: ScrollBehavior = 'smooth') => {
      stopFollowingSettle();
      const row = clampIndex(monthIndex - minMonthIndex, 0, rowCount - 1);
      reportedRowRef.current = row;
      // Already the pager's target, as when the month and year wheels close
      // on the month shown: nothing moves. A far jump left pending here would
      // wait for a render `setCenterRow` does not cause, then land on the
      // next one (a drag crossing half a month) and cancel that drag.
      if (row === pager.virtualIndex) {
        return;
      }
      const distance = Math.abs(row - pager.virtualIndex);
      if (behavior === 'smooth' && distance <= OVERSCAN) {
        pager.goTo(row, {animated: true});
        return;
      }
      // Beyond the mounted window there is no pane at the target yet: mount
      // it first, then move (the layout effect below). A jump that far is
      // never worth animating either.
      pendingRowRef.current = row;
      setCenterRow(row);
    },
    [minMonthIndex, rowCount, pager, stopFollowingSettle],
  );

  // Deliberately un-keyed: it runs after every render, costs a null check, and
  // must fire on whichever render finally mounts the pending row's pane.
  useLayoutEffect(() => {
    const row = pendingRowRef.current;
    if (row == null) {
      return;
    }
    pendingRowRef.current = null;
    pager.goTo(row, {animated: false});
  });

  useImperativeHandle(handleRef, () => ({scrollToMonth}), [scrollToMonth]);

  // Synchronizes with the viewport's wheel events: one month per horizontal
  // wheel gesture (WHEEL_STEP_PX), following the reading direction.
  const isWheelRTL = useDirection() === 'rtl';
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport == null) {
      return undefined;
    }
    let travel = 0;
    let hasStepped = false;
    let quiet: number | null = null;
    const onWheel = (event: WheelEvent) => {
      const horizontal = event.shiftKey
        ? event.deltaX || event.deltaY
        : event.deltaX;
      const vertical = event.shiftKey ? 0 : event.deltaY;
      if (horizontal === 0 || Math.abs(horizontal) < Math.abs(vertical)) {
        return;
      }
      if (quiet != null) {
        window.clearTimeout(quiet);
      }
      quiet = window.setTimeout(() => {
        travel = 0;
        hasStepped = false;
        quiet = null;
      }, WHEEL_QUIET_MS);
      if (hasStepped) {
        return;
      }
      travel += horizontal;
      if (Math.abs(travel) < WHEEL_STEP_PX) {
        return;
      }
      hasStepped = true;
      const forward = travel > 0 !== isWheelRTL;
      const next = clampIndex(
        pager.virtualIndex + (forward ? 1 : -1),
        0,
        rowCount - 1,
      );
      if (next !== pager.virtualIndex) {
        stopFollowingSettle();
        report(next);
        pager.goTo(next, {animated: true});
      }
    };
    viewport.addEventListener('wheel', onWheel, {passive: true});
    return () => {
      viewport.removeEventListener('wheel', onWheel);
      if (quiet != null) {
        window.clearTimeout(quiet);
      }
    };
  }, [pager, report, rowCount, isWheelRTL, stopFollowingSettle]);

  // Inside a bottom sheet, keep the sheet's own touch listener off the drags
  // UIKit gives the grid, and off every move before the decision (see
  // useSheetAxisSplit; the pager's pan begins on the same rule, above).
  useSheetAxisSplit(viewportRef);

  // Move the keyboard focus by whole days (or months) and let the pager
  // follow. The vocabulary is the APG grid's, plus PageUp/PageDown for a
  // month and Shift with them for a year, as Calendar does.
  const moveFocusTo = useCallback(
    (from: PlainDate, next: PlainDate) => {
      const nextIndex = monthIndexOf(next);
      if (nextIndex < minMonthIndex || nextIndex > maxMonthIndex) {
        return;
      }
      shouldRestoreFocusRef.current = true;
      setFocusedDate(next);
      if (nextIndex !== monthIndexOf(from)) {
        scrollToMonth(nextIndex, 'smooth');
        onVisibleMonthChangeRef.current(nextIndex);
      }
    },
    [minMonthIndex, maxMonthIndex, scrollToMonth],
  );

  const isRTL = useDirection() === 'rtl';
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, date: PlainDate) => {
      // Column within the displayed week, which is what Home/End move to —
      // not the day of the month.
      const column = (plainDateDayOfWeek(date) - weekStartsOn + 7) % 7;
      // The horizontal arrows follow the reading direction (APG grid): under
      // RTL the next day sits to the left.
      const forward = isRTL ? 'ArrowLeft' : 'ArrowRight';
      const backward = isRTL ? 'ArrowRight' : 'ArrowLeft';
      const byDays = (days: number) => {
        event.preventDefault();
        moveFocusTo(date, plainDateAddDays(date, days));
      };
      const byMonths = (months: number) => {
        event.preventDefault();
        moveFocusTo(date, plainDateAddMonths(date, months));
      };
      switch (event.key) {
        case backward:
          byDays(-1);
          break;
        case forward:
          byDays(1);
          break;
        case 'ArrowUp':
          byDays(-7);
          break;
        case 'ArrowDown':
          byDays(7);
          break;
        case 'Home':
          byDays(-column);
          break;
        case 'End':
          byDays(6 - column);
          break;
        case 'PageUp':
          byMonths(event.shiftKey ? -12 : -1);
          break;
        case 'PageDown':
          byMonths(event.shiftKey ? 12 : 1);
          break;
        default:
          break;
      }
    },
    [isRTL, moveFocusTo, weekStartsOn],
  );

  // The focused day may have been in an unmounted pane a frame ago; focus it
  // once it exists, and only in response to a key press so a drag never
  // steals focus.
  const focusedISO = focusedDate == null ? null : plainDateToISO(focusedDate);
  useEffect(() => {
    if (!shouldRestoreFocusRef.current || focusedISO == null) {
      return;
    }
    // A date can be mounted twice: as a real day in its own pane and as a
    // dimmed, disabled spill copy at the edge of a neighbouring pane. Only
    // the real day may take focus, or Enter and Space would select nothing.
    const target = viewportRef.current?.querySelector<HTMLElement>(
      `[data-date="${focusedISO}"]:not([data-outside])`,
    );
    if (target != null) {
      shouldRestoreFocusRef.current = false;
      // preventScroll: the viewport does not scroll, and a browser
      // scroll-into-view would shift it under the pager's track.
      target.focus({preventScroll: true});
    }
  }, [focusedISO]);

  const visibleRows = paneWindow(centerRow, rowCount, OVERSCAN);

  // A focus event fires for the programmatic focus above too; only take the
  // date when it is actually a different day.
  const handleDayFocus = useCallback((date: PlainDate) => {
    setFocusedDate(previous =>
      previous != null && plainDateIsEqual(previous, date) ? previous : date,
    );
  }, []);

  return (
    <div
      ref={viewportRef}
      data-scroller="months"
      {...stylex.props(styles.viewport)}>
      <div ref={trackRef} data-month-track="" {...stylex.props(styles.track)}>
        {paneSize > 0 &&
          rowsIn(visibleRows).map(row => (
            <MonthPane
              key={row}
              monthIndex={minMonthIndex + row}
              insetInlineStart={row * paneSize}
              inlineSize={paneSize}
              selectedDate={selectedDate}
              focusedDate={focusedDate}
              today={today}
              isDateDisabled={isDateDisabled}
              weekStartsOn={weekStartsOn}
              onSelect={onSelect}
              onDayKeyDown={handleKeyDown}
              onDayFocus={handleDayFocus}
              isCurrent={row === centerRow}
            />
          ))}
      </div>
    </div>
  );
}

/**
 * Memoized, as its panes are: the sheet re-renders on every month/year toggle
 * while nothing the calendar shows changes (its props are stable), and
 * re-rendering every mounted pane's 42 days was most of the toggle's
 * main-thread work.
 */
export const MonthPager = memo(MonthPagerComponent);

MonthPager.displayName = 'MonthPager';

interface MonthPaneProps {
  monthIndex: number;
  insetInlineStart: number;
  inlineSize: number;
  selectedDate: PlainDate | null;
  focusedDate: PlainDate | null;
  today: PlainDate;
  isDateDisabled: (date: PlainDate) => boolean;
  weekStartsOn: DayOfWeek;
  onSelect: (value: ISODateString) => void;
  onDayKeyDown: (event: React.KeyboardEvent, date: PlainDate) => void;
  onDayFocus: (date: PlainDate) => void;
  /**
   * Whether this is the month the pager shows. Only its day takes a tab stop:
   * a neighbour is mounted off-screen, and Tab into it would scroll the
   * clipped viewport under the pager's track.
   */
  isCurrent: boolean;
}

/**
 * One month, as a six-row grid.
 *
 * There is no `role="columnheader"` row in here: the weekday names are a
 * single sticky row outside the scroller (they would otherwise scroll away),
 * so each day instead carries its weekday in its accessible name.
 */
const MonthPane = memo(function MonthPane({
  monthIndex,
  insetInlineStart,
  inlineSize,
  selectedDate,
  focusedDate,
  today,
  isDateDisabled,
  weekStartsOn,
  onSelect,
  onDayKeyDown,
  onDayFocus,
  isCurrent,
}: MonthPaneProps) {
  const locale = useLocale();
  const {year, month} = fromMonthIndex(monthIndex);
  const {weeks} = useCalendarDays({
    year,
    month,
    weekStartsOn,
    // Always six rows: a variable grid would make pane heights differ, and
    // with them every snap offset below this month.
    hasVariableRowCount: false,
  });

  const monthLabel = plainDateFormat(
    {year, month, day: 1},
    DATE_FORMAT_MONTH_YEAR,
    locale,
  );

  // Exactly one day per pane is tab-reachable, so Tab moves through the
  // picker rather than through 42 buttons: the focused day if the keyboard
  // owns one, else the selection, else the first of the month.
  const tabbableISO = (() => {
    if (
      focusedDate != null &&
      focusedDate.year === year &&
      focusedDate.month === month
    ) {
      return plainDateToISO(focusedDate);
    }
    if (
      selectedDate != null &&
      selectedDate.year === year &&
      selectedDate.month === month
    ) {
      return plainDateToISO(selectedDate);
    }
    return plainDateToISO({year, month, day: 1});
  })();

  return (
    <div
      role="grid"
      aria-label={monthLabel}
      data-month={monthLabel}
      {...stylex.props(
        styles.pane,
        dynamic.pane(insetInlineStart, inlineSize),
      )}>
      {weeks.map(week => (
        <div key={week[0].iso} role="row" {...stylex.props(styles.row)}>
          {week.map(day => {
            // A spilled day is context, not a choice. Calendar computes the
            // same thing as `effectivelyDisabled: isDisabled || isOutside`,
            // and guards today/selected on `!isOutside` beside it, so a date
            // borrowed from a neighbouring month never carries a ring or a
            // puck in the pane that is only showing it.
            const isDisabled = day.isOutside || isDateDisabled(day.date);
            const isSelected =
              !day.isOutside &&
              selectedDate != null &&
              plainDateIsEqual(day.date, selectedDate);
            const isToday = !day.isOutside && plainDateIsEqual(day.date, today);

            return (
              <div
                key={day.iso}
                role="gridcell"
                aria-selected={isSelected || undefined}
                {...stylex.props(styles.cell)}>
                <button
                  type="button"
                  data-date={day.iso}
                  data-outside={day.isOutside ? '' : undefined}
                  tabIndex={isCurrent && day.iso === tabbableISO ? 0 : -1}
                  aria-label={plainDateFormat(
                    day.date,
                    DATE_FORMAT_WITH_WEEKDAY,
                    locale,
                  )}
                  aria-disabled={isDisabled || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelect(day.iso);
                    }
                  }}
                  onFocus={() => onDayFocus(day.date)}
                  onKeyDown={event => onDayKeyDown(event, day.date)}
                  {...stylex.props(
                    styles.day,
                    focusOutlineStyles.focusVisible,
                    // Outside FIRST, so disabled wins where both apply: a
                    // spilled day past the range is unselectable, and must
                    // not be painted more available than the in-month days
                    // beside it.
                    day.isOutside && styles.dayOutside,
                    isDisabled && styles.dayDisabled,
                  )}>
                  <span
                    {...stylex.props(
                      styles.puck,
                      !isDisabled && styles.puckHoverable,
                      isToday && styles.puckToday,
                      isSelected && styles.puckSelected,
                    )}>
                    {day.dayNumber}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

MonthPane.displayName = 'MonthPane';
