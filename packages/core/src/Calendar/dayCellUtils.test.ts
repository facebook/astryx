// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  computeDayCellState,
  computeRangeRounding,
  computePreviewRounding,
  computeDayNeighborContinuity,
  isEndpoint,
  isRangeHighlighted,
  isPreviewHighlighted,
  type DayCellStateInput,
} from './dayCellUtils';
import {plainDateFromISO, plainDateIsEqual} from '../utils/plainDate';

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

  it('does not identify an outside day as today', () => {
    const state = computeDayCellState(makeInput({isOutside: true}));
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

  // Regression (#2715): outside (adjacent-month) days must not receive
  // selection/range/preview state. In the two-month layout the same date
  // renders in both panes, so highlighting the spillover copy would duplicate
  // the selection onto the wrong month's pane.
  it('does not apply range state to outside days', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        isOutside: true,
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(state.isInRange).toBe(false);
    expect(state.isRangeStart).toBe(false);
    expect(state.isRangeEnd).toBe(false);
  });

  it('does not apply preview state to outside days', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        isOutside: true,
        previewStart: plainDateFromISO('2024-03-15'),
        previewEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    expect(state.isInPreview).toBe(false);
    expect(state.isPreviewStart).toBe(false);
    expect(state.isPreviewEnd).toBe(false);
  });

  it('does not mark an outside day as selected', () => {
    const state = computeDayCellState(
      makeInput({
        isOutside: true,
        selectedDate: plainDateFromISO('2024-03-15'),
      }),
    );
    expect(state.isSelected).toBe(false);
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

  // #2715 follow-up: cap the highlight where the range meets a disabled or
  // adjacent-month (outside) day. A mid-range day (neither endpoint nor grid
  // edge) gets an end cap on the side whose neighbour breaks the run.
  it('caps the right edge when the next day breaks the range (e.g. disabled)', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 3,
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computeRangeRounding(state, {
      prevInRange: true,
      nextInRange: false,
    });
    expect(rounding.roundLeft).toBe(false);
    expect(rounding.roundRight).toBe(true);
  });

  it('caps the left edge when the previous day breaks the range', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 3,
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computeRangeRounding(state, {
      prevInRange: false,
      nextInRange: true,
    });
    expect(rounding.roundLeft).toBe(true);
    expect(rounding.roundRight).toBe(false);
  });

  it('does not cap a mid-range day when both neighbours continue the range', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 3,
        mode: 'range',
        rangeStart: plainDateFromISO('2024-03-15'),
        rangeEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computeRangeRounding(state, {
      prevInRange: true,
      nextInRange: true,
    });
    expect(rounding.roundLeft).toBe(false);
    expect(rounding.roundRight).toBe(false);
  });
});

describe('isRangeHighlighted', () => {
  const base = {
    date: plainDateFromISO('2024-03-17'),
    mode: 'range' as const,
    rangeStart: plainDateFromISO('2024-03-15'),
    rangeEnd: plainDateFromISO('2024-03-20'),
    isDisabled: false,
    isOutside: false,
  };

  it('true for an enabled in-month day inside the range', () => {
    expect(isRangeHighlighted(base)).toBe(true);
  });

  it('false for a disabled day (breaks continuity)', () => {
    expect(isRangeHighlighted({...base, isDisabled: true})).toBe(false);
  });

  it('false for an adjacent-month (outside) day', () => {
    expect(isRangeHighlighted({...base, isOutside: true})).toBe(false);
  });

  it('false outside the range bounds', () => {
    expect(
      isRangeHighlighted({...base, date: plainDateFromISO('2024-03-25')}),
    ).toBe(false);
  });

  it('false in single mode', () => {
    expect(isRangeHighlighted({...base, mode: 'single'})).toBe(false);
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

  // #2715: the hover preview needs the same disabled/outside caps as the
  // committed range, so the transient highlight terminates cleanly at the gap.
  it('caps the right edge when the next day breaks the preview run', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 3,
        previewStart: plainDateFromISO('2024-03-15'),
        previewEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computePreviewRounding(state, {
      prevInPreview: true,
      nextInPreview: false,
    });
    expect(rounding.roundLeft).toBe(false);
    expect(rounding.roundRight).toBe(true);
  });

  it('caps the left edge when the previous day breaks the preview run', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 3,
        previewStart: plainDateFromISO('2024-03-15'),
        previewEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computePreviewRounding(state, {
      prevInPreview: false,
      nextInPreview: true,
    });
    expect(rounding.roundLeft).toBe(true);
    expect(rounding.roundRight).toBe(false);
  });

  it('does not cap a mid-preview day when both neighbours continue', () => {
    const state = computeDayCellState(
      makeInput({
        date: plainDateFromISO('2024-03-17'),
        dayIndex: 3,
        previewStart: plainDateFromISO('2024-03-15'),
        previewEnd: plainDateFromISO('2024-03-20'),
      }),
    );
    const rounding = computePreviewRounding(state, {
      prevInPreview: true,
      nextInPreview: true,
    });
    expect(rounding.roundLeft).toBe(false);
    expect(rounding.roundRight).toBe(false);
  });
});

describe('isPreviewHighlighted', () => {
  const base = {
    date: plainDateFromISO('2024-03-17'),
    previewStart: plainDateFromISO('2024-03-15'),
    previewEnd: plainDateFromISO('2024-03-20'),
    isDisabled: false,
    isOutside: false,
  };

  it('true for an enabled in-month day inside the preview span', () => {
    expect(isPreviewHighlighted(base)).toBe(true);
  });

  it('false for a disabled day', () => {
    expect(isPreviewHighlighted({...base, isDisabled: true})).toBe(false);
  });

  it('false for an adjacent-month (outside) day', () => {
    expect(isPreviewHighlighted({...base, isOutside: true})).toBe(false);
  });

  it('false outside the preview bounds', () => {
    expect(
      isPreviewHighlighted({...base, date: plainDateFromISO('2024-03-25')}),
    ).toBe(false);
  });

  it('false with no preview span', () => {
    expect(
      isPreviewHighlighted({...base, previewStart: null, previewEnd: null}),
    ).toBe(false);
  });
});

describe('computeDayNeighborContinuity', () => {
  // A week row of 5 consecutive in-month days, Mar 15–19.
  const week = (
    [
      '2024-03-15',
      '2024-03-16',
      '2024-03-17',
      '2024-03-18',
      '2024-03-19',
    ] as const
  ).map(iso => ({
    date: plainDateFromISO(iso),
    isOutside: false,
  }));

  const baseInput = {
    week,
    mode: 'range' as const,
    rangeStart: plainDateFromISO('2024-03-15'),
    rangeEnd: plainDateFromISO('2024-03-19'),
    previewStart: null,
    previewEnd: null,
    isDisabled: () => false,
  };

  it('reports both range neighbours continuing for a mid-range day', () => {
    const c = computeDayNeighborContinuity({...baseInput, dayIndex: 2});
    expect(c.prevInRange).toBe(true);
    expect(c.nextInRange).toBe(true);
  });

  it('breaks continuity where a neighbour is disabled', () => {
    // Disable Mar 18 (index 3): its neighbour Mar 17 (index 2) sees a break to
    // the right.
    const disabledDay = plainDateFromISO('2024-03-18');
    const c = computeDayNeighborContinuity({
      ...baseInput,
      dayIndex: 2,
      isDisabled: date => plainDateIsEqual(date, disabledDay),
    });
    expect(c.prevInRange).toBe(true);
    expect(c.nextInRange).toBe(false);
  });

  it('breaks continuity where a neighbour is an outside day', () => {
    const weekWithOutside = week.map((d, i) =>
      i === 3 ? {...d, isOutside: true} : d,
    );
    const c = computeDayNeighborContinuity({
      ...baseInput,
      week: weekWithOutside,
      dayIndex: 2,
    });
    expect(c.nextInRange).toBe(false);
  });

  it('treats a missing neighbour (row edge) as a break', () => {
    const first = computeDayNeighborContinuity({...baseInput, dayIndex: 0});
    expect(first.prevInRange).toBe(false);
    const last = computeDayNeighborContinuity({
      ...baseInput,
      dayIndex: week.length - 1,
    });
    expect(last.nextInRange).toBe(false);
  });

  it('derives preview continuity independently of range', () => {
    const c = computeDayNeighborContinuity({
      ...baseInput,
      rangeStart: null,
      rangeEnd: null,
      previewStart: plainDateFromISO('2024-03-15'),
      previewEnd: plainDateFromISO('2024-03-19'),
      dayIndex: 2,
    });
    expect(c.prevInRange).toBe(false);
    expect(c.nextInRange).toBe(false);
    expect(c.prevInPreview).toBe(true);
    expect(c.nextInPreview).toBe(true);
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
