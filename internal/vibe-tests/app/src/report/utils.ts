import type {UniversalDimension, UniversalScore} from './types';

export const ALL_DIMENSIONS: UniversalDimension[] = [
  'accessibility',
  'codeQuality',
  'repetition',
  'conciseness',
  'themeAdherence',
  'correctness',
];

export const DIMENSION_LABELS: Record<UniversalDimension, string> = {
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  repetition: 'DRYness',
  conciseness: 'Conciseness',
  themeAdherence: 'Theme Adherence',
  correctness: 'Correctness',
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
  const values = ALL_DIMENSIONS.map(d => score[d].score);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function formatScore(n: number): string {
  return n.toFixed(1);
}
