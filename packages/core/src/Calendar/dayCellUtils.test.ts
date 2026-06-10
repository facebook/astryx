// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  computeDayCellState,
  computeRangeRounding,
  computePreviewRounding,
  isEndpoint,
  type DayCellStateInput,
} from './dayCellUtils';
import {plainDateFromISO} from '../utils/plainDate';

function makeInput(
  overrides: Partial<DayCellStateInput> = {},
): DayCellStateInput {
  return {
    date: plainDateFromISO('2024-03-15'),
    dayIndex: 3,
    mode: 'single',
    selectedDate: null,
    rangeStart: null,
    rangeEnd: null,
    previewStart: null,
    previewEnd: null,
    today: plainDateFromISO('2024-03-15'),
    isDisabled: false,
    isOutside: false,
    ...overrides,
  };
}

describe('computeDayCellState', () => {
  it('identifies today', () => {
    const state = computeDayCellState(makeInput());
    expect(state.isToday).toBe(true);
  });

  it('identifies not-today', () => {
    const state = computeDayCellState(
      makeInput({today: plainDateFromISO('2024-03-16')}),
    );
    expect(state.isToday).toBe(false);
  });

  it('identifies selected day in single mode', () => {
    const state = computeDayCellState(
      makeInput({selectedDate: plainDateFromISO('2024-03-15')}),
    );
    expect(state.isSelected).toBe(true);
  });

  it('does not mark selected in range mode', () => {
    const state = computeDayCellState(
      makeInput({
        mode: 'range',
        selectedDate: plainDateFromISO('2024-03-15'),
      }),
    );
    expect(state.isSelected).toBe(false);
  });

  it('identifies range start and end', () => {
    const state = computeDayCellState(
      makeInput({
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(state.isRangeStart).toBe(true);
    expect(state.isRangeEnd).toBe(false);
    expect(state.isInRange).toBe(true);
  });

  it('identifies day in middle of range', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(state.isRangeStart).toBe(false);
    expect(state.isRangeEnd).toBe(false);
    expect(state.isInRange).toBe(true);
  });

  it('marks effectively disabled when disabled', () => {
    const state = computeDayCellState(makeInput({isDisabled: true}));
    expect(state.effectivelyDisabled).toBe(true);
  });

  it('marks effectively disabled when outside', () => {
    const state = computeDayCellState(makeInput({isOutside: true}));
    expect(state.effectivelyDisabled).toBe(true);
  });

  it('identifies preview range', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        previewStart: plainDateFromISO('2024-03-15'),
        previewEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(state.isInPreview).toBe(true);
    expect(state.isPreviewStart).toBe(false);
    expect(state.isPreviewEnd).toBe(false);
  });

  it('identifies first and last column', () => {
    const stateFirst = computeDayCellState(makeInput({dayIndex: 0}));
    expect(stateFirst.isFirstColumn).toBe(true);
    expect(stateFirst.isLastColumn).toBe(false);

    const stateLast = computeDayCellState(makeInput({dayIndex: 6}));
    expect(stateLast.isFirstColumn).toBe(false);
    expect(stateLast.isLastColumn).toBe(true);
  });
});

describe('computeRangeRounding', () => {
  it('rounds left at range start', () => {
    const state = computeDayCellState(
      makeInput({
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computeRangeRounding(state);
    expect(rounding.roundLeft).toBe(true);
    expect(rounding.roundRight).toBe(false);
  });

  it('rounds left at first column even without range start', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 0,
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computeRangeRounding(state);
    expect(rounding.roundLeft).toBe(true);
  });

  it('rounds right at last column', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 6,
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computeRangeRounding(state);
    expect(rounding.roundRight).toBe(true);
  });
});

describe('computePreviewRounding', () => {
  it('rounds at preview boundaries', () => {
    const state = computeDayCellState(
      makeInput({
        previewStart: plainDateFromISO('2024-03-15'),
        previewEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computePreviewRounding(state);
    expect(rounding.roundLeft).toBe(true);
    expect(rounding.roundRight).toBe(false);
  });
});

describe('isEndpoint', () => {
  it('true when selected', () => {
    const state = computeDayCellState(
      makeInput({selectedDate: plainDateFromISO('2024-03-15')}),
    );
    expect(isEndpoint(state)).toBe(true);
  });

  it('true when range start', () => {
    const state = computeDayCellState(
      makeInput({
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(isEndpoint(state)).toBe(true);
  });

  it('false for mid-range day', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(isEndpoint(state)).toBe(false);
  });
});
