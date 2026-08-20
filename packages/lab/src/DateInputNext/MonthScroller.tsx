// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MonthScroller.tsx
 * @input Month bounds, selected value, constraints, week start
 * @output Exports MonthScroller and MonthScrollerHandle
 * @position Internal component; consumed by MobileDateField.tsx
 *
 * The continuous surface: months stacked vertically in one scroller, each pane
 * exactly as tall as the scrollport and snapped to its start. Two consequences
 * fall out of that single geometric choice — the picker never changes height,
 * and there is no resting position that shows half of two months.
 *
 * Every pane is a fixed six-row grid, including the months that only need
 * four or five, because a pane whose height depended on its contents would
 * make snap offsets vary from month to month and the scroll position drift.
 *
 * The list is long (a century by default) but only a few panes are ever
 * mounted: a spacer holds the full scroll height and the visible panes are
 * positioned into it absolutely. Nothing is stitched or recycled during a
 * scroll, so snap offsets are constant and momentum is never interrupted —
 * which is the failure mode of the usual "append months at the edge" approach.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/DateInputNext/MobileDateField.tsx
 * - /packages/lab/src/DateInputNext/DateInputNext.doc.mjs
 * - /packages/lab/src/DateInputNext/DateInputNext.test.tsx
 */

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useCalendarDays} from '@astryxdesign/core/Calendar';
import {
  colorVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
  durationVars,
  borderVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {focusOutlineStyles} from '@astryxdesign/core/utils';
import {
  type DayOfWeek,
  type ISODateString,
  type PlainDate,
  plainDateAddDays,
  plainDateDayOfWeek,
  plainDateFormat,
  plainDateIsEqual,
  plainDateToISO,
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
} from '@astryxdesign/core/utils';
import {dateInputNextVars, dateInputNextGeometry} from './tokens.stylex';
import {
  fromMonthIndex,
  monthIndexOf,
  paneWindow,
  rowAtScrollTop,
  rowsIn,
} from './monthGeometry';

const DAY_SIZE = dateInputNextVars['--date-input-next-day-size'];

/**
 * Panes mounted on each side of the visible one. Sized against a fast fling:
 * the window widens once per animation frame, so it only fails if a single
 * frame travels further than this — three months, about 800px at the default
 * day size. Under `scroll-snap-type: mandatory`, landing on an unmounted pane
 * would not merely show a gap, it would re-snap to the nearest mounted one.
 */
const OVERSCAN = 3;

const styles = stylex.create({
  scroller: {
    position: 'relative',
    blockSize: dateInputNextGeometry.paneBlockSize,
    // Stated, not inherited from the reset: the pane height, the snap offsets
    // and the virtualization all key off clientHeight, so a consumer without
    // reset.css (or with a stray box-sizing rule — the reset's is
    // zero-specificity `:where`) must not be able to change what it means.
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    // The paging behaviour. Every snap area is a full pane, so the scroller
    // has exactly one resting position per month.
    scrollSnapType: 'y mandatory',
    // Keeps a fling inside the picker instead of handing it to the sheet or
    // the page behind it once the ends are reached.
    overscrollBehavior: 'contain',
    scrollbarWidth: 'none',
    touchAction: 'pan-y',
  },
  spacer: {
    position: 'relative',
    inlineSize: '100%',
  },
  pane: {
    position: 'absolute',
    insetInline: 0,
    blockSize: dateInputNextGeometry.paneBlockSize,
    scrollSnapAlign: 'start',
    // No `scroll-snap-stop: always`. It would cap every fling at one month,
    // which is tidy but stops the surface being continuous — "three months
    // ahead" should be one throw, not three flicks. Momentum carrying past
    // several panes is why OVERSCAN is what it is.
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: dateInputNextGeometry.paneRows,
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
    cursor: 'pointer',
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
  dayDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
  },
});

const dynamic = stylex.create({
  spacer: (blockSize: number) => ({
    blockSize: `${blockSize}px`,
  }),
  pane: (insetBlockStart: number) => ({
    insetBlockStart: `${insetBlockStart}px`,
  }),
});

export interface MonthScrollerHandle {
  /** Bring a month to rest at the top of the scrollport. */
  scrollToMonth: (monthIndex: number, behavior?: ScrollBehavior) => void;
}

export interface MonthScrollerProps {
  /** Imperative handle for programmatic navigation (Today, the wheels). */
  handleRef?: React.RefObject<MonthScrollerHandle | null>;
  /** First reachable month, as a month index. */
  minMonthIndex: number;
  /** Last reachable month, as a month index. */
  maxMonthIndex: number;
  /** Month to rest on at mount. */
  initialMonthIndex: number;
  /** Fires as the scroller passes each month, settled or not. */
  onVisibleMonthChange: (monthIndex: number) => void;
  /** Currently selected date. */
  selectedDate: PlainDate | null;
  /** Today, for the `aria-current` marker. */
  today: PlainDate;
  /** Whether a date fails min/max or a custom constraint. */
  isDateDisabled: (date: PlainDate) => boolean;
  /** First column of the week. */
  weekStartsOn: DayOfWeek;
  /** Fired when a day is tapped. */
  onSelect: (value: ISODateString) => void;
}

/**
 * A vertically continuous, snap-paged run of month grids.
 */
export function MonthScroller({
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rowCount = maxMonthIndex - minMonthIndex + 1;

  // Pane height is read from layout, never assumed: it is whatever the CSS
  // says the scrollport is, so a theme retuning --date-input-next-day-size
  // moves the snap offsets and the virtualization together.
  const [paneBlockSize, setPaneBlockSize] = useState(0);
  const [centerRow, setCenterRow] = useState(initialMonthIndex - minMonthIndex);
  // The visible row, mirrored so the scroll handler can tell "changed" from
  // "same" without reading state, and notify the parent OUTSIDE a state
  // updater — React runs updaters during render, where another component's
  // setState is illegal.
  const centerRowRef = useRef(centerRow);
  // A row to scroll to once its pane is mounted; see scrollToMonth.
  const pendingScrollRef = useRef<number | null>(null);

  // Keyboard focus moves by date, not by cell index, so it crosses month
  // boundaries the way a calendar should. Null until the user takes the grid
  // with the keyboard.
  const [focusedDate, setFocusedDate] = useState<PlainDate | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  const onVisibleMonthChangeRef = useRef(onVisibleMonthChange);
  onVisibleMonthChangeRef.current = onVisibleMonthChange;

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller == null) {
      return;
    }
    const measure = () => {
      // Ignore zero: the picker can be mounted inside something not yet
      // displayed (a closed BottomSheet), and a zero height would unmount
      // every pane and lose the scroll position.
      const measured = scroller.clientHeight;
      if (measured > 0) {
        setPaneBlockSize(measured);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  // Land on the initial month before the first paint. Runs once the height is
  // known; `hasPositioned` keeps a later resize from yanking the user back.
  const hasPositionedRef = useRef(false);
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller == null || paneBlockSize === 0 || hasPositionedRef.current) {
      return;
    }
    hasPositionedRef.current = true;
    scroller.scrollTop = (initialMonthIndex - minMonthIndex) * paneBlockSize;
  }, [paneBlockSize, initialMonthIndex, minMonthIndex]);

  const scrollToMonth = useCallback(
    (monthIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const scroller = scrollerRef.current;
      if (scroller == null || paneBlockSize === 0) {
        return;
      }
      const row = Math.min(
        rowCount - 1,
        Math.max(0, monthIndex - minMonthIndex),
      );
      if (Math.abs(row - centerRowRef.current) > OVERSCAN) {
        // Beyond the mounted window there is no pane at the target offset, and
        // `scroll-snap-type: mandatory` will not leave the scroller resting
        // where no snap area is — it re-snaps to the nearest mounted pane, so
        // a jump to another year lands one month away instead. Mount the
        // target first and scroll once it exists (see the layout effect
        // below); a jump that far is never worth animating either.
        pendingScrollRef.current = row;
        centerRowRef.current = row;
        setCenterRow(row);
        return;
      }
      scroller.scrollTo({top: row * paneBlockSize, behavior});
    },
    [paneBlockSize, minMonthIndex, rowCount],
  );

  // Deliberately un-keyed: it runs after every render, costs a null check, and
  // must fire on whichever render finally mounts the pending row's pane.
  useLayoutEffect(() => {
    const row = pendingScrollRef.current;
    const scroller = scrollerRef.current;
    if (row == null || scroller == null || paneBlockSize === 0) {
      return;
    }
    pendingScrollRef.current = null;
    scroller.scrollTo({top: row * paneBlockSize, behavior: 'auto'});
  });

  useImperativeHandle(handleRef, () => ({scrollToMonth}), [scrollToMonth]);

  // rAF-throttled: a touch scroll fires far more scroll events than frames,
  // and all this does is move a label and widen a window.
  const frameRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const scroller = scrollerRef.current;
    // Not before the height is known. A listener attached while it was zero
    // would close over that zero and report row 0 for any scroll — and the
    // scroll event fired by the initial positioning arrives just late enough
    // to be handled by that stale listener. Every pane then unmounts except
    // rows 0-2, and `scroll-snap-type: mandatory` yanks the scroller to the
    // nearest surviving snap area, a century away from where it just landed.
    if (scroller == null || paneBlockSize === 0) {
      return;
    }
    const onScroll = () => {
      if (frameRef.current != null) {
        return;
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = undefined;
        const row = rowAtScrollTop(scroller.scrollTop, paneBlockSize, rowCount);
        if (row === centerRowRef.current) {
          return;
        }
        centerRowRef.current = row;
        setCenterRow(row);
        onVisibleMonthChangeRef.current(minMonthIndex + row);
      });
    };
    scroller.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [paneBlockSize, rowCount, minMonthIndex]);

  // Move the keyboard focus by whole days and let the scroller follow. Paging
  // by month is PageUp/PageDown; everything else is the APG grid vocabulary.
  const moveFocus = useCallback(
    (from: PlainDate, deltaDays: number) => {
      const next = plainDateAddDays(from, deltaDays);
      const nextIndex = monthIndexOf(next);
      if (nextIndex < minMonthIndex || nextIndex > maxMonthIndex) {
        return;
      }
      shouldRestoreFocusRef.current = true;
      setFocusedDate(next);
      if (nextIndex !== monthIndexOf(from)) {
        scrollToMonth(nextIndex, 'smooth');
      }
    },
    [minMonthIndex, maxMonthIndex, scrollToMonth],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, date: PlainDate) => {
      // Column within the displayed week, which is what Home/End move to —
      // not the day of the month.
      const column = (plainDateDayOfWeek(date) - weekStartsOn + 7) % 7;
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus(date, -1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveFocus(date, 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveFocus(date, -7);
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveFocus(date, 7);
          break;
        case 'Home':
          event.preventDefault();
          moveFocus(date, -column);
          break;
        case 'End':
          event.preventDefault();
          moveFocus(date, 6 - column);
          break;
        default:
          break;
      }
    },
    [moveFocus, weekStartsOn],
  );

  // The focused day may have been in an unmounted pane a frame ago; focus it
  // once it exists, and only in response to a key press so a scroll never
  // steals focus.
  const focusedISO = focusedDate == null ? null : plainDateToISO(focusedDate);
  useEffect(() => {
    if (!shouldRestoreFocusRef.current || focusedISO == null) {
      return;
    }
    const target = scrollerRef.current?.querySelector<HTMLElement>(
      `[data-date="${focusedISO}"]`,
    );
    if (target != null) {
      shouldRestoreFocusRef.current = false;
      // preventScroll: the scroller is already snapping to this month; a
      // browser scroll-into-view here would fight the snap and land between
      // two panes.
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
      ref={scrollerRef}
      data-scroller="months"
      {...stylex.props(styles.scroller)}>
      <div
        {...stylex.props(
          styles.spacer,
          dynamic.spacer(rowCount * paneBlockSize),
        )}>
        {paneBlockSize > 0 &&
          rowsIn(visibleRows).map(row => (
            <MonthPane
              key={row}
              monthIndex={minMonthIndex + row}
              insetBlockStart={row * paneBlockSize}
              selectedDate={selectedDate}
              focusedDate={focusedDate}
              today={today}
              isDateDisabled={isDateDisabled}
              weekStartsOn={weekStartsOn}
              onSelect={onSelect}
              onDayKeyDown={handleKeyDown}
              onDayFocus={handleDayFocus}
            />
          ))}
      </div>
    </div>
  );
}

MonthScroller.displayName = 'MonthScroller';

interface MonthPaneProps {
  monthIndex: number;
  insetBlockStart: number;
  selectedDate: PlainDate | null;
  focusedDate: PlainDate | null;
  today: PlainDate;
  isDateDisabled: (date: PlainDate) => boolean;
  weekStartsOn: DayOfWeek;
  onSelect: (value: ISODateString) => void;
  onDayKeyDown: (event: React.KeyboardEvent, date: PlainDate) => void;
  onDayFocus: (date: PlainDate) => void;
}

/**
 * One month, as a six-row grid.
 *
 * There is no `role="columnheader"` row in here: the weekday names are a
 * single sticky row outside the scroller (they would otherwise scroll away),
 * so each day instead carries its weekday in its accessible name.
 */
function MonthPane({
  monthIndex,
  insetBlockStart,
  selectedDate,
  focusedDate,
  today,
  isDateDisabled,
  weekStartsOn,
  onSelect,
  onDayKeyDown,
  onDayFocus,
}: MonthPaneProps) {
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
      {...stylex.props(styles.pane, dynamic.pane(insetBlockStart))}>
      {weeks.map(week => (
        <div key={week[0].iso} role="row" {...stylex.props(styles.row)}>
          {week.map(day => {
            // No adjacent-month spill. In a continuous scroller the
            // neighbouring month is one flick away and rendering its days
            // here puts the same date on screen twice — mid-scroll you see a
            // week greyed at the bottom of one pane and again at the top of
            // the next. An empty cell keeps the grid aligned and leaves each
            // date in exactly one place.
            if (day.isOutside) {
              return (
                <div
                  key={day.iso}
                  role="gridcell"
                  {...stylex.props(styles.cell)}
                />
              );
            }
            const isDisabled = isDateDisabled(day.date);
            const isSelected =
              selectedDate != null && plainDateIsEqual(day.date, selectedDate);
            const isToday = plainDateIsEqual(day.date, today);

            return (
              <div
                key={day.iso}
                role="gridcell"
                aria-selected={isSelected || undefined}
                {...stylex.props(styles.cell)}>
                <button
                  type="button"
                  data-date={day.iso}
                  tabIndex={day.iso === tabbableISO ? 0 : -1}
                  aria-label={plainDateFormat(
                    day.date,
                    DATE_FORMAT_WITH_WEEKDAY,
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
}

MonthPane.displayName = 'MonthPane';
