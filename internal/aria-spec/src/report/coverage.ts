// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file coverage.ts
 * @input Uses ../types (ContractResult); node:fs for optional JSON emit
 * @output collectCoverage — folds ContractResults into a coverage matrix;
 *   formatCoverageSummary — human-readable table; writeCoverageJson — artifact emit
 * @position Reporting layer; turns raw results into the pattern × component matrix
 *   the issue calls for
 *
 * SYNC: When ContractResult in ../types.ts changes, update this
 */

import type {ContractResult, ExpectationResult} from '../types';

export interface ComponentCoverage {
  readonly pattern: string;
  readonly component: string;
  readonly tier: string;
  readonly total: number;
  readonly passed: number;
  /** 0-100, matches the internal component-quality scoring convention. */
  readonly score: number;
  readonly blockingFailures: number;
  readonly expectedFailures: number;
  readonly unexpectedPasses: number;
}

export interface CoverageMatrix {
  readonly components: readonly ComponentCoverage[];
  readonly overallScore: number;
}

function scoreOne(
  results: readonly ExpectationResult[],
): ComponentCoverage['score'] {
  if (results.length === 0) {
    return 100;
  }
  // Expected-failures count as "known gap" — excluded from the denominator so the
  // score reflects real conformance progress, not tracked debt.
  const scorable = results.filter(r => r.status !== 'expected-failure');
  if (scorable.length === 0) {
    return 100;
  }
  const passed = scorable.filter(r => r.status === 'passed').length;
  return Math.round((passed / scorable.length) * 100);
}

export function collectCoverage(
  contractResults: readonly ContractResult[],
): CoverageMatrix {
  const components = contractResults.map(cr => ({
    pattern: cr.pattern,
    component: cr.component,
    tier: cr.tier,
    total: cr.results.length,
    passed: cr.results.filter(r => r.status === 'passed').length,
    score: scoreOne(cr.results),
    blockingFailures: cr.results.filter(
      r => r.status === 'failed' && r.priority === 'blocker',
    ).length,
    expectedFailures: cr.results.filter(r => r.status === 'expected-failure')
      .length,
    unexpectedPasses: cr.results.filter(r => r.status === 'unexpected-pass')
      .length,
  }));

  const overallScore =
    components.length === 0
      ? 100
      : Math.round(
          components.reduce((sum, c) => sum + c.score, 0) / components.length,
        );

  return {components, overallScore};
}

export function formatCoverageSummary(matrix: CoverageMatrix): string {
  const lines: string[] = [];
  lines.push('ARIA Spec Coverage');
  lines.push('==================');
  for (const c of matrix.components) {
    const flags: string[] = [];
    if (c.blockingFailures > 0) {
      flags.push(`${c.blockingFailures} BLOCKING`);
    }
    if (c.expectedFailures > 0) {
      flags.push(`${c.expectedFailures} known-gap`);
    }
    if (c.unexpectedPasses > 0) {
      flags.push(`${c.unexpectedPasses} stale-expectedFailure`);
    }
    lines.push(
      `  [${String(c.score).padStart(3)}%] ${c.pattern}/${c.component} ` +
        `(${c.passed}/${c.total}, ${c.tier})` +
        (flags.length > 0 ? `  — ${flags.join(', ')}` : ''),
    );
  }
  lines.push(`Overall: ${matrix.overallScore}%`);
  return lines.join('\n');
}
