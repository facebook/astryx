/**
 * @file Utility functions for the vibeability test harness
 * @position internal/vibe-tests/src/utils.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type {TestPrompt, TestSet} from './types.js';

/**
 * Generate a short iteration ID (first 8 chars of UUID)
 */
export function generateIterationId(): string {
  return crypto.randomUUID().slice(0, 8);
}

/**
 * Hash content to track versions
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

/**
 * Rough token count estimate (string length / 4)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Sleep for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensure directory exists
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
  }
}

/**
 * Read JSON file
 */
export function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Write JSON file
 */
export function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Append to JSONL file
 */
export function appendJsonl(filePath: string, data: unknown): void {
  fs.appendFileSync(filePath, JSON.stringify(data) + '\n');
}

/**
 * Read JSONL file
 */
export function readJsonl<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .trim()
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => JSON.parse(line) as T);
}

/**
 * Read a prompt file (markdown)
 */
export function readPromptFile(promptPath: string): string {
  return fs.readFileSync(promptPath, 'utf-8');
}

/**
 * Get the prompts directory path
 */
export function getPromptsDir(): string {
  return path.join(import.meta.dirname, '..', 'prompts');
}

/**
 * Get the test-sets directory path
 */
export function getTestSetsDir(): string {
  return path.join(import.meta.dirname, '..', 'test-sets');
}

/**
 * Get the results directory path
 */
export function getResultsDir(): string {
  return path.join(import.meta.dirname, '..', 'results');
}

/**
 * Load a test set by name
 */
export function loadTestSet(name: string): TestSet {
  const filePath = path.join(getTestSetsDir(), `${name}.json`);
  return readJson<TestSet>(filePath);
}

/**
 * Stratified sampling: select N prompts with at least 1 per category
 */
export function stratifiedSample(
  prompts: TestPrompt[],
  sampleSize: number,
): TestPrompt[] {
  // Group by category
  const byCategory = new Map<string, TestPrompt[]>();
  for (const prompt of prompts) {
    const existing = byCategory.get(prompt.category) ?? [];
    existing.push(prompt);
    byCategory.set(prompt.category, existing);
  }

  const categories = Array.from(byCategory.keys());
  const result: TestPrompt[] = [];

  // First pass: one from each category
  for (const category of categories) {
    const categoryPrompts = byCategory.get(category)!;
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
    result.push(categoryPrompts[randomIndex]);

    if (result.length >= sampleSize) {
      return result.slice(0, sampleSize);
    }
  }

  // Second pass: round-robin remaining slots
  let categoryIndex = 0;
  while (result.length < sampleSize) {
    const category = categories[categoryIndex % categories.length];
    const categoryPrompts = byCategory.get(category)!;
    const available = categoryPrompts.filter(p => !result.includes(p));

    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      result.push(available[randomIndex]);
    }

    categoryIndex++;

    // Prevent infinite loop if we've exhausted all prompts
    if (categoryIndex > categories.length * prompts.length) {
      break;
    }
  }

  return result;
}

/**
 * Format a progress bar
 */
export function progressBar(
  current: number,
  total: number,
  width = 20,
): string {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${current}/${total}`;
}

/**
 * Get current timestamp in ISO format
 */
export function timestamp(): string {
  return new Date().toISOString();
}
