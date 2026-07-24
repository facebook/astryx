// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Utility functions for the vibeability test harness
 * @position internal/vibe-tests/src/utils.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
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
    const categoryPrompts = byCategory.get(category);
    if (categoryPrompts == null) {
      continue;
    }
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
    const categoryPrompts = byCategory.get(category);
    if (categoryPrompts == null) {
      categoryIndex++;
      continue;
    }
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

/**
 * Serve a directory of static files on a random port.
 * Returns the base URL and a close function.
 * Shared by screenshot-previews.ts and axe-previews.ts.
 */
export function serveStatic(
  dir: string,
): Promise<{url: string; close: () => Promise<void>}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url || '/');
      const filePath = path.join(dir, urlPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
      };

      const content = fs.readFileSync(filePath);
      res.writeHead(200, {'Content-Type': contentTypes[ext] || 'text/plain'});
      res.end(content);
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to get server address'));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise<void>(r => {
            server.close(() => r());
          }),
      });
    });

    server.on('error', reject);
  });
}

/** One built preview HTML file discovered in an iteration directory. */
export interface PreviewFile {
  promptId: string;
  target: string;
  /** Absolute path to the preview HTML file */
  path: string;
}

/**
 * Enumerate built preview HTML files for an iteration — from
 * previews/manifest.json when present, otherwise by scanning for .html
 * files. Entries whose files are missing on disk are skipped.
 * Shared by screenshot-previews.ts and axe-previews.ts.
 */
export function enumeratePreviews(
  iterDir: string,
  prompts?: string[],
): PreviewFile[] {
  const previewsDir = path.join(iterDir, 'previews');
  const previewFiles: PreviewFile[] = [];

  const manifestPath = path.join(previewsDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    for (const [promptId, targets] of Object.entries(manifest)) {
      if (prompts && !prompts.includes(promptId)) {
        continue;
      }
      // A malformed entry (string instead of target map) would otherwise
      // iterate as characters and leak garbage paths
      if (typeof targets !== 'object' || targets == null) {
        continue;
      }
      for (const [target, relPath] of Object.entries(
        targets as Record<string, string>,
      )) {
        const fullPath = path.join(iterDir, relPath);
        if (fs.existsSync(fullPath)) {
          previewFiles.push({promptId, target, path: fullPath});
        }
      }
    }
    return previewFiles;
  }

  // No manifest — scan for HTML files directly
  const scanDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const fullPath = path.join(dir, entry.name);
        const promptId = path.basename(path.dirname(fullPath));
        if (prompts && !prompts.includes(promptId)) {
          continue;
        }
        previewFiles.push({
          promptId,
          target: path.basename(entry.name, '.html'),
          path: fullPath,
        });
      }
    }
  };
  scanDir(previewsDir);
  return previewFiles;
}

/**
 * Result file entry from the JSON evaluation format.
 * Each JSON file is an array of these (one per trajectory depth).
 */
interface JsonResultEntry {
  response: string;
  trajectoryDepth: number;
  [key: string]: unknown;
}

/**
 * Ensure .tsx files exist in a results directory.
 *
 * Handles two result formats:
 *   1. Direct .tsx files (old format) — already present, nothing to do
 *   2. .json evaluation files (new format) — each is an array of entries
 *      with a `response` field containing TSX code; extracts depth-0 entry
 *
 * Returns the list of prompt IDs that have .tsx files after extraction.
 */
export function ensureTsxFiles(codeDir: string): string[] {
  const tsxFiles = fs.readdirSync(codeDir).filter(f => f.endsWith('.tsx'));
  if (tsxFiles.length > 0) {
    return tsxFiles.map(f => path.basename(f, '.tsx'));
  }

  // No .tsx files — try extracting from JSON results
  const jsonFiles = fs.readdirSync(codeDir).filter(f => f.endsWith('.json'));
  const extracted: string[] = [];

  for (const jsonFile of jsonFiles) {
    const promptId = path.basename(jsonFile, '.json');
    const jsonPath = path.join(codeDir, jsonFile);

    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as
        JsonResultEntry | JsonResultEntry[];

      // Find the depth-0 entry (initial generation, before follow-ups)
      const entries = Array.isArray(data) ? data : [data];
      const entry = entries.find(e => e.trajectoryDepth === 0) ?? entries[0];

      if (entry?.response && typeof entry.response === 'string') {
        const tsxPath = path.join(codeDir, `${promptId}.tsx`);
        fs.writeFileSync(tsxPath, entry.response);
        extracted.push(promptId);
      }
    } catch {
      // Skip malformed JSON files
    }
  }

  if (extracted.length > 0) {
    console.log(
      `  ⚡ Extracted ${extracted.length} .tsx file(s) from JSON results`,
    );
  }

  return extracted;
}
