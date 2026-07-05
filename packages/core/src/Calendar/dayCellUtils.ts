// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {PlainDate} from '../utils/plainDate';
import {plainDateIsEqual, plainDateIsInRange} from '../utils/plainDate';

export interface DayCellState {
  effectivelyDisabled: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInPreview: boolean;
  isPreviewStart: boolean;
  isPreviewEnd: boolean;
  isFirstColumn: boolean;
  isLastColumn: boolean;
}

export interface DayCellStateInput {
  date: PlainDate;
  dayIndex: number;
  mode: 'single' | 'range';
  selectedDate: PlainDate | null;
  rangeStart: PlainDate | null;
  rangeEnd: PlainDate | null;
  previewStart: PlainDate | null;
  previewEnd: PlainDate | null;
  today: PlainDate;
  isDisabled: boolean;
  isOutside: boolean;
}

/**
 * Derives all visual/interaction states for a single day cell.
 *
 * Outside (adjacent-month) days never receive selection, range, or preview
 * state: in the two-month layout the same date renders in both panes, and
 * highlighting the spillover copy would duplicate the selection onto the wrong
 * month's pane (#2715).
 */
export function computeDayCellState(input: DayCellStateInput): DayCellState {
  const {
    date,
    dayIndex,
    mode,
    selectedDate,
    rangeStart,
    rangeEnd,
    previewStart,
    previewEnd,
    today,
    isDisabled,
    isOutside,
  } = input;

  return {
    effectivelyDisabled: isDisabled || isOutside,
    isToday: plainDateIsEqual(date, today),
    isSelected: !!(
      !isOutside &&
      mode === 'single' &&
      selectedDate &&
      plainDateIsEqual(date, selectedDate)
    ),
    isInRange: !!(
      !isOutside &&
      mode === 'range' &&
      rangeStart &&
      rangeEnd &&
      plainDateIsInRange(date, [rangeStart, rangeEnd])
    ),
    isRangeStart: !!(
      !isOutside &&
      mode === 'range' &&
      rangeStart &&
      plainDateIsEqual(date, rangeStart)
    ),
    isRangeEnd: !!(
      !isOutside &&
      mode === 'range' &&
      rangeEnd &&
      plainDateIsEqual(date, rangeEnd)
    ),
    isInPreview: !!(
      !isOutside &&
      previewStart &&
      previewEnd &&
      plainDateIsInRange(date, [previewStart, previewEnd])
    ),
    isPreviewStart: !!(
      !isOutside &&
      previewStart &&
      plainDateIsEqual(date, previewStart)
    ),
    isPreviewEnd: !!(
      !isOutside &&
      previewEnd &&
      plainDateIsEqual(date, previewEnd)
    ),
    isFirstColumn: dayIndex === 0,
    isLastColumn: dayIndex === 6,
  };
}

/**
 * Rounding for the range background.
 *
 * Rounds at the range endpoints and the grid row edges, and also caps the
 * highlight where the range meets a break in continuity — a neighbouring cell
 * that is disabled or an adjacent-month (outside) day. Without a cap the
 * highlight would run with a hard square edge straight into the disabled/gap
 * cell; capping it reads as a proper end of the highlighted run (#2715).
 *
 * `neighbors` describes whether the day immediately before/after (in the same
 * week row) continues the highlighted range. When omitted, only the endpoint
 * and grid-edge rounding applies (backwards compatible).
 */
export function computeRangeRounding(
  state: DayCellState,
  neighbors?: {prevInRange?: boolean; nextInRange?: boolean},
) {
  const prevBreaks = neighbors ? neighbors.prevInRange === false : false;
  const nextBreaks = neighbors ? neighbors.nextInRange === false : false;
  return {
    roundLeft: state.isRangeStart || state.isFirstColumn || prevBreaks,
    roundRight: state.isRangeEnd || state.isLastColumn || nextBreaks,
  };
}

/**
 * Rounding for the preview background (the transient highlight shown while
 * hovering during range selection). Mirrors {@link computeRangeRounding}: it
 * rounds at the preview endpoints and grid row edges, and caps the highlight
 * where the preview run meets a disabled or adjacent-month (outside) day so the
 * hover highlight terminates cleanly at the gap just like the committed range
 * does (#2715).
 */
export function computePreviewRounding(
  state: DayCellState,
  neighbors?: {prevInPreview?: boolean; nextInPreview?: boolean},
) {
  const prevBreaks = neighbors ? neighbors.prevInPreview === false : false;
  const nextBreaks = neighbors ? neighbors.nextInPreview === false : false;
  return {
    roundLeft: state.isPreviewStart || state.isFirstColumn || prevBreaks,
    roundRight: state.isPreviewEnd || state.isLastColumn || nextBreaks,
  };
}

/** Whether a day is a selection endpoint (selected, range start, or range end). */
export function isEndpoint(state: DayCellState): boolean {
  return state.isSelected || state.isRangeStart || state.isRangeEnd;
}

/**
 * Whether a day participates in the continuous range highlight — i.e. it is a
 * range day whose background actually paints as part of an unbroken run.
 * Outside (adjacent-month) and disabled days break the run, so the highlighted
 * day beside them gets an end cap (see {@link computeRangeRounding}). Used to
 * derive a neighbour's continuity.
 */
export function isRangeHighlighted(input: {
  date: PlainDate;
  mode: 'single' | 'range';
  rangeStart: PlainDate | null;
  rangeEnd: PlainDate | null;
  isDisabled: boolean;
  isOutside: boolean;
}): boolean {
  const {date, mode, rangeStart, rangeEnd, isDisabled, isOutside} = input;
  return !!(
    mode === 'range' &&
    !isOutside &&
    !isDisabled &&
    rangeStart &&
    rangeEnd &&
    plainDateIsInRange(date, [rangeStart, rangeEnd])
  );
}

/**
 * Preview-span counterpart of {@link isRangeHighlighted}: whether a day is part
 * of an unbroken preview-highlight run (enabled, in-month, inside the preview
 * span). Used to cap the preview highlight at disabled / outside neighbours.
 */
export function isPreviewHighlighted(input: {
  date: PlainDate;
  previewStart: PlainDate | null;
  previewEnd: PlainDate | null;
  isDisabled: boolean;
  isOutside: boolean;
}): boolean {
  const {date, previewStart, previewEnd, isDisabled, isOutside} = input;
  return !!(
    !isOutside &&
    !isDisabled &&
    previewStart &&
    previewEnd &&
    plainDateIsInRange(date, [previewStart, previewEnd])
  );
}

/**
 * Continuity of the highlighted run through a day's immediate neighbours in the
 * same week row, for both the committed range and the hover preview. A day gets
 * an end cap on whichever side its neighbour does not continue the run (see
 * {@link computeRangeRounding} / {@link computePreviewRounding}).
 */
export interface DayNeighborContinuity {
  prevInRange: boolean;
  nextInRange: boolean;
  prevInPreview: boolean;
  nextInPreview: boolean;
}

/** Minimal shape needed from a week's day cells to derive neighbour continuity. */
export interface NeighborDay {
  date: PlainDate;
  isOutside: boolean;
}

/**
 * Derives whether the previous/next day in the same week row continues the
 * highlighted run, for both range and preview. Broken out from the render path
 * so the neighbour logic is unit-testable in isolation.
 */
export function computeDayNeighborContinuity(input: {
  week: ReadonlyArray<NeighborDay>;
  dayIndex: number;
  mode: 'single' | 'range';
  rangeStart: PlainDate | null;
  rangeEnd: PlainDate | null;
  previewStart: PlainDate | null;
  previewEnd: PlainDate | null;
  isDisabled: (date: PlainDate) => boolean;
}): DayNeighborContinuity {
  const {
    week,
    dayIndex,
    mode,
    rangeStart,
    rangeEnd,
    previewStart,
    previewEnd,
    isDisabled,
  } = input;

  const prev = week[dayIndex - 1];
  const next = week[dayIndex + 1];

  const rangeContinues = (day: NeighborDay | undefined): boolean =>
    day != null &&
    isRangeHighlighted({
      date: day.date,
      mode,
      rangeStart,
      rangeEnd,
      isDisabled: isDisabled(day.date),
      isOutside: day.isOutside,
    });

  const previewContinues = (day: NeighborDay | undefined): boolean =>
    day != null &&
    isPreviewHighlighted({
      date: day.date,
      previewStart,
      previewEnd,
      isDisabled: isDisabled(day.date),
      isOutside: day.isOutside,
    });

  return {
    prevInRange: rangeContinues(prev),
    nextInRange: rangeContinues(next),
    prevInPreview: previewContinues(prev),
    nextInPreview: previewContinues(next),
  };
}
