import type {UniversalDimension, UniversalScore} from './types';

export const ALL_DIMENSIONS: UniversalDimension[] = [
  'correctness',
  'accessibility',
  'codeQuality',
  'efficiency',
  'maintainability',
];

export const DIMENSION_LABELS: Record<UniversalDimension, string> = {
  correctness: 'Correctness',
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  efficiency: 'Efficiency',
  maintainability: 'Maintainability',
};

export function scoreToStatusVariant(
  score: number,
): 'positive' | 'neutral' | 'warning' | 'negative' {
  if (score >= 90) return 'positive';
  if (score >= 70) return 'neutral';
  if (score >= 50) return 'warning';
  return 'negative';
}

export function scoreToProgressVariant(
  score: number,
): 'positive' | 'accent' | 'warning' | 'negative' {
  if (score >= 90) return 'positive';
  if (score >= 70) return 'accent';
  if (score >= 50) return 'warning';
  return 'negative';
}

export function computeOverall(score: UniversalScore): number {
  const total = ALL_DIMENSIONS.reduce((sum, d) => sum + score[d].score, 0);
  return Math.round(total / ALL_DIMENSIONS.length);
}

export function formatScore(n: number): string {
  return String(Math.round(n));
}
