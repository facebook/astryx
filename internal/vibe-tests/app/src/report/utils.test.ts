// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import type {
  UniversalAggregate,
  UniversalComparison,
  UniversalScore,
} from './types';
import {a11yCoverage, a11yCoverageVsBaseline, dimensionLabel} from './utils';

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

const RUNTIME = score({
  score: 75,
  metrics: {
    eligibleSites: 0,
    eligibleByRule: {},
    rulesFired: 0,
    runtime: true,
  },
});

describe('a11yCoverage', () => {
  it('reads old-format results with no a11y metrics as static-only', () => {
    const byPrompt = {'tc-1': score({score: 100})};
    expect(a11yCoverage(byPrompt)).toEqual({
      basis: 'static',
      runtime: 0,
      total: 1,
    });
  });

  it('reports a mixed basis when only some prompts carry runtime metrics', () => {
    const byPrompt = {'tc-1': score({score: 100}), 'tc-2': RUNTIME};
    expect(a11yCoverage(byPrompt)).toEqual({
      basis: 'mixed',
      runtime: 1,
      total: 2,
    });
  });

  it('reports a runtime basis only when every prompt carries runtime metrics', () => {
    const byPrompt = {'tc-1': RUNTIME, 'tc-2': RUNTIME};
    expect(a11yCoverage(byPrompt)).toEqual({
      basis: 'runtime',
      runtime: 2,
      total: 2,
    });
  });

  it('counts across every target passed, skipping absent ones', () => {
    const astryx = {'tc-1': RUNTIME};
    const baseline = {'tc-1': score({score: 100})};
    expect(a11yCoverage(astryx, baseline, undefined)).toEqual({
      basis: 'mixed',
      runtime: 1,
      total: 2,
    });
  });

  it('handles an empty prompt map', () => {
    expect(a11yCoverage({}).basis).toBe('static');
  });
});

describe('a11yCoverageVsBaseline', () => {
  const runtimeOnly = {
    byPrompt: {'tc-1': RUNTIME, 'tc-2': RUNTIME},
  } as unknown as UniversalAggregate;

  it('counts the baseline a score card shows its delta against', () => {
    // A fully runtime-backed report compared with a hygiene-only baseline is
    // the mixed comparison CompareView labels; the card must not read runtime
    const comparison = {
      baseline: {
        byPrompt: {'tc-1': score({score: 100}), 'tc-2': score({score: 100})},
      },
    } as unknown as UniversalComparison;
    const coverage = a11yCoverageVsBaseline(runtimeOnly, comparison);
    expect(coverage).toEqual({basis: 'mixed', runtime: 2, total: 4});
    expect(dimensionLabel('accessibility', coverage)).toBe(
      'Accessibility (mixed: 2/4 runtime)',
    );
  });

  it('uses only the report itself when there is no comparison', () => {
    expect(a11yCoverageVsBaseline(runtimeOnly, undefined)).toEqual({
      basis: 'runtime',
      runtime: 2,
      total: 2,
    });
  });
});

describe('dimensionLabel', () => {
  it('labels accessibility by basis and leaves other dimensions alone', () => {
    expect(
      dimensionLabel('accessibility', {basis: 'static', runtime: 0, total: 2}),
    ).toBe('A11y Hygiene (composition)');
    expect(
      dimensionLabel('accessibility', {basis: 'mixed', runtime: 1, total: 2}),
    ).toBe('Accessibility (mixed: 1/2 runtime)');
    expect(
      dimensionLabel('accessibility', {basis: 'runtime', runtime: 2, total: 2}),
    ).toBe('Accessibility (runtime + hygiene)');
    expect(
      dimensionLabel('correctness', {basis: 'static', runtime: 0, total: 2}),
    ).toBe('Correctness');
    expect(
      dimensionLabel('design', {basis: 'runtime', runtime: 2, total: 2}),
    ).toBe('Design');
  });
});
