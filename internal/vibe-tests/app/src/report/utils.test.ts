// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import type {UniversalScore} from './types';
import {dimensionLabel, hasRuntimeA11y} from './utils';

function score(accessibility: UniversalScore['accessibility']): UniversalScore {
  const dim = {score: 100};
  return {
    correctness: dim,
    accessibility,
    codeQuality: dim,
    efficiency: {score: 100},
    maintainability: {score: 100},
  } as UniversalScore;
}

describe('hasRuntimeA11y', () => {
  it('reads old-format results with no a11y metrics as static-only', () => {
    const byPrompt = {'tc-1': score({score: 100})};
    expect(hasRuntimeA11y(byPrompt)).toBe(false);
  });

  it('detects runtime basis when any prompt carries runtime metrics', () => {
    const byPrompt = {
      'tc-1': score({score: 100}),
      'tc-2': score({
        score: 75,
        metrics: {
          eligibleSites: 0,
          eligibleByRule: {},
          rulesFired: 0,
          runtime: true,
        },
      }),
    };
    expect(hasRuntimeA11y(byPrompt)).toBe(true);
  });

  it('handles an empty prompt map', () => {
    expect(hasRuntimeA11y({})).toBe(false);
  });
});

describe('dimensionLabel', () => {
  it('labels accessibility by basis and leaves other dimensions alone', () => {
    expect(dimensionLabel('accessibility', false)).toBe(
      'A11y Hygiene (composition)',
    );
    expect(dimensionLabel('accessibility', true)).toBe(
      'Accessibility (runtime + hygiene)',
    );
    expect(dimensionLabel('correctness', false)).toBe('Correctness');
    expect(dimensionLabel('design', true)).toBe('Design');
  });
});
