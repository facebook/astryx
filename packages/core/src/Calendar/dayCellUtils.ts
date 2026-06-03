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

/** Derives all visual/interaction states for a single day cell. */
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
      mode === 'single' &&
      selectedDate &&
      plainDateIsEqual(date, selectedDate)
    ),
    isInRange: !!(
      mode === 'range' &&
      rangeStart &&
      rangeEnd &&
      plainDateIsInRange(date, [rangeStart, rangeEnd])
    ),
    isRangeStart: !!(
      mode === 'range' &&
      rangeStart &&
      plainDateIsEqual(date, rangeStart)
    ),
    isRangeEnd: !!(
      mode === 'range' &&
      rangeEnd &&
      plainDateIsEqual(date, rangeEnd)
    ),
    isInPreview: !!(
      previewStart &&
      previewEnd &&
      plainDateIsInRange(date, [previewStart, previewEnd])
    ),
    isPreviewStart: !!(previewStart && plainDateIsEqual(date, previewStart)),
    isPreviewEnd: !!(previewEnd && plainDateIsEqual(date, previewEnd)),
    isFirstColumn: dayIndex === 0,
    isLastColumn: dayIndex === 6,
  };
}

/** Edge rounding for range background (rounds at grid edges and range endpoints). */
export function computeRangeRounding(state: DayCellState) {
  return {
    roundLeft: state.isRangeStart || state.isFirstColumn,
    roundRight: state.isRangeEnd || state.isLastColumn,
  };
}

/** Edge rounding for preview background. */
export function computePreviewRounding(state: DayCellState) {
  return {
    roundLeft: state.isPreviewStart || state.isFirstColumn,
    roundRight: state.isPreviewEnd || state.isLastColumn,
  };
}

/** Whether a day is a selection endpoint (selected, range start, or range end). */
export function isEndpoint(state: DayCellState): boolean {
  return state.isSelected || state.isRangeStart || state.isRangeEnd;
}
