// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  assertAggregateReportPublicSafe,
  compareGuidanceRows,
  matrixCoverage,
  type SetupAggregateRow,
} from './setup-aggregate.js';
import type {Regression, SetupScore} from './setup-eval.js';

function score(regressions: Regression[] = []): SetupScore {
  return {
    label: 'run',
    builds: true,
    clean: true,
    validRun: true,
    executionSucceeded: true,
    consoleErrors: 0,
    failedRequests: 0,
    regressions: regressions.length,
    regressionDetails: regressions,
    byCategory: {
      typography: regressions.filter(item => item.category === 'typography')
        .length,
      color: regressions.filter(item => item.category === 'color').length,
      geometry: regressions.filter(item => item.category === 'geometry').length,
      spacing: regressions.filter(item => item.category === 'spacing').length,
    },
    baselineFailures: [],
    missingProbes: [],
    contrastFailures: [],
    modeDependent: [],
    variablesCaptured: [],
    measurementErrors: [],
    layeringFailures: [],
    layerOrderFailures: [],
    cascadeInverted: false,
    layerOrder: [],
    taskSuccess: true,
    taskFailures: [],
    integrityFailures: [],
  };
}

function regression(
  property: string,
  category: Regression['category'],
): Regression {
  return {
    probe: 'host',
    property,
    category,
    before: 'before',
    after: 'after',
  };
}

function row(
  condition: 'current' | 'candidate',
  value: SetupScore,
  suffix = '',
): SetupAggregateRow {
  return {
    id: `guidance__${condition}__fixture__prompt__bundle__r1${suffix}`,
    file: `${condition}${suffix}.json`,
    stage: 'guidance',
    fixture: 'fixture',
    prompt: 'prompt',
    condition,
    bundle: 'bundle',
    executor: 'harness/model',
    rep: 1,
    score: value,
  };
}

describe('setup aggregation policy', () => {
  it('fails closed on missing, duplicate, and unexpected matrix cells', () => {
    const current = row('current', score());
    const duplicate = {...current, file: 'duplicate.json'};
    const unexpected = {...current, id: 'guidance__unexpected'};
    expect(
      matrixCoverage(
        [current, duplicate, unexpected],
        [{id: current.id}, {id: 'guidance__required'}],
      ),
    ).toEqual({
      missing: ['guidance__required'],
      duplicate: [current.id],
      unexpected: ['guidance__unexpected'],
    });
  });

  it('reports every per-dimension tradeoff without assigning an automatic rank', () => {
    const current = row('current', score([regression('color', 'color')]));
    const candidate = row(
      'candidate',
      score([regression('borderTopLeftRadius', 'geometry')]),
    );
    const result = compareGuidanceRows([current, candidate]);
    expect(result.comparisons[0]).toMatchObject({
      complete: true,
      deltas: {color: -1, radius: 1},
      regressions: ['radius'],
      improvements: ['color'],
    });
    expect(result).not.toHaveProperty('advances');
    expect(result).not.toHaveProperty('score');
  });

  it('marks an incomplete pair without turning it into a ranking verdict', () => {
    const candidate = row('candidate', score());
    expect(compareGuidanceRows([candidate])).toMatchObject({
      complete: false,
      regressions: [],
      improvements: [],
    });
  });

  it('rejects aggregate report data containing absolute paths or private hosts', () => {
    const absoluteFile = {
      ...row('candidate', score()),
      file: '/home/example/results/candidate.json',
    };
    expect(() => assertAggregateReportPublicSafe([absoluteFile])).toThrow(
      /contains private path or host data/,
    );

    const privateHost = {
      ...row('candidate', score()),
      executor: 'runner.internal.example/model',
    };
    expect(() => assertAggregateReportPublicSafe([privateHost])).toThrow(
      /contains private path or host data/,
    );
    expect(() =>
      assertAggregateReportPublicSafe([row('candidate', score())]),
    ).not.toThrow();
  });
});
