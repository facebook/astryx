// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Sampling utilities for stratified prompt selection
 * @position internal/vibe-tests/src/sampling.ts
 */

import type {TestPrompt} from './types.js';

/**
 * Stratified sampling: select N prompts with at least 1 per category,
 * distributes remaining slots round-robin.
 */
export function stratifiedSample(
  prompts: TestPrompt[],
  sampleSize: number,
): TestPrompt[] {
  if (sampleSize >= prompts.length) {
    return [...prompts];
  }

  // Group by category
  const byCategory = new Map<string, TestPrompt[]>();
  for (const prompt of prompts) {
    const existing = byCategory.get(prompt.category) ?? [];
    existing.push(prompt);
    byCategory.set(prompt.category, existing);
  }

  const categories = Array.from(byCategory.keys());
  const selected = new Set<string>();
  const result: TestPrompt[] = [];

  // Shuffle categories for randomness
  shuffleArray(categories);

  // First pass: one from each category
  for (const category of categories) {
    if (result.length >= sampleSize) {
      break;
    }

    const categoryPrompts = byCategory.get(category);
    if (categoryPrompts == null) {
      continue;
    }
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
    const prompt = categoryPrompts[randomIndex];

    result.push(prompt);
    selected.add(prompt.id);
  }

  // Second pass: round-robin remaining slots
  let categoryIndex = 0;
  let attempts = 0;
  const maxAttempts = prompts.length * 2;

  while (result.length < sampleSize && attempts < maxAttempts) {
    const category = categories[categoryIndex % categories.length];
    const categoryPrompts = byCategory.get(category);
    if (categoryPrompts == null) {
      categoryIndex++;
      attempts++;
      continue;
    }
    const available = categoryPrompts.filter(p => !selected.has(p.id));

    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const prompt = available[randomIndex];
      result.push(prompt);
      selected.add(prompt.id);
    }

    categoryIndex++;
    attempts++;
  }

  return result;
}

/**
 * Fisher-Yates shuffle (in-place)
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Get category distribution from prompts
 */
export function getCategoryDistribution(
  prompts: TestPrompt[],
): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const prompt of prompts) {
    distribution[prompt.category] = (distribution[prompt.category] ?? 0) + 1;
  }
  return distribution;
}
