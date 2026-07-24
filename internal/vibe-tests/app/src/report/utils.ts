// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {UniversalDimension, UniversalScore} from './types';

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
 * True when any prompt's accessibility score is backed by runtime axe data
 * (issue #4145). Older results have no a11y metrics and read as static-only.
 */
export function hasRuntimeA11y(
  byPrompt: Record<string, UniversalScore>,
): boolean {
  return Object.values(byPrompt).some(
    s => s.accessibility?.metrics?.runtime === true,
  );
}

/**
 * Dimension label that is honest about what backs the accessibility score:
 * without runtime axe data the static scan only measures raw-HTML footgun
 * avoidance, so it is labeled as hygiene rather than accessibility.
 */
export function dimensionLabel(
  dim: UniversalDimension,
  runtimeA11y: boolean,
): string {
  if (dim === 'accessibility') {
    return runtimeA11y
      ? 'Accessibility (runtime + hygiene)'
      : 'A11y Hygiene (composition)';
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
