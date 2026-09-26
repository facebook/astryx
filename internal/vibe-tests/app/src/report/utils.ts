// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {A11yCoverage, UniversalDimension, UniversalScore} from './types';

/** The 5 code-analysis dimensions (always present). */
export const CODE_DIMENSIONS: UniversalDimension[] = [
  'correctness',
  'accessibility',
  'codeQuality',
  'efficiency',
  'maintainability',
];

/** All 6 dimensions including design (design is optional — from screenshot evaluation). */
export const ALL_DIMENSIONS: UniversalDimension[] = [
  ...CODE_DIMENSIONS,
  'design',
];

export const DIMENSION_LABELS: Record<UniversalDimension, string> = {
  correctness: 'Correctness',
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  efficiency: 'Efficiency',
  maintainability: 'Maintainability',
  design: 'Design',
};

/**
 * How much of the accessibility score runtime axe data backs (issue #4145),
 * across every prompt map passed: 'mixed' when only some prompts have it.
 * Older results have no a11y metrics and read as static-only.
 */
export function a11yCoverage(
  ...byPrompts: Array<Record<string, UniversalScore> | undefined>
): A11yCoverage {
  const scores = byPrompts.flatMap(byPrompt => Object.values(byPrompt ?? {}));
  const runtime = scores.filter(
    s => s.accessibility?.metrics?.runtime === true,
  ).length;
  const basis =
    runtime === 0 ? 'static' : runtime === scores.length ? 'runtime' : 'mixed';
  return {basis, runtime, total: scores.length};
}

/**
 * Dimension label that is honest about what backs the accessibility score:
 * without runtime axe data the static scan only measures raw-HTML footgun
 * avoidance, so it is labeled as hygiene rather than accessibility, and
 * partial runtime coverage says how partial it is.
 */
export function dimensionLabel(
  dim: UniversalDimension,
  coverage: A11yCoverage,
): string {
  if (dim === 'accessibility') {
    switch (coverage.basis) {
      case 'runtime':
        return 'Accessibility (runtime + hygiene)';
      case 'mixed':
        return `Accessibility (mixed: ${coverage.runtime}/${coverage.total} runtime)`;
      default:
        return 'A11y Hygiene (composition)';
    }
  }
  return DIMENSION_LABELS[dim];
}

export function scoreToStatusVariant(
  score: number,
): 'success' | 'neutral' | 'warning' | 'error' {
  if (score >= 90) {
    return 'success';
  }
  if (score >= 70) {
    return 'neutral';
  }
  if (score >= 50) {
    return 'warning';
  }
  return 'error';
}

export function scoreToProgressVariant(
  score: number,
): 'success' | 'accent' | 'warning' | 'error' {
  if (score >= 90) {
    return 'success';
  }
  if (score >= 70) {
    return 'accent';
  }
  if (score >= 50) {
    return 'warning';
  }
  return 'error';
}

/** Compute overall score. Null-safe for optional design dimension. */
export function computeOverall(score: UniversalScore): number {
  const available = ALL_DIMENSIONS.filter(d => score[d] != null);
  if (available.length === 0) {
    return 0;
  }
  const total = available.reduce((sum, d) => sum + (score[d]?.score ?? 0), 0);
  return Math.round(total / available.length);
}

export function formatScore(n: number): string {
  return String(Math.round(n));
}
