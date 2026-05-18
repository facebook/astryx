#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file collect-results.mjs
 *
 * Copies agent output from per-agent project directories into the
 * standard results/ path that the evaluation pipeline expects.
 *
 * Usage:
 *   node internal/vibe-tests/src/collect-results.mjs <iteration-id>
 *
 * Copies: results/<id>/projects/<pid>/<pid>.tsx → results/<id>/results/<pid>.tsx
 *         results/<id>/projects/<pid>/<pid>.json → results/<id>/results/<pid>.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.resolve(__dirname, '..', 'results');

const iterationId = process.argv[2];
if (!iterationId) {
  console.error('Usage: node collect-results.mjs <iteration-id>');
  process.exit(1);
}

const iterDir = path.join(RESULTS_DIR, iterationId);
const projectsDir = path.join(iterDir, 'projects');
const resultsDir = path.join(iterDir, 'results');

if (!fs.existsSync(projectsDir)) {
  console.error(`No projects/ directory found at ${projectsDir}`);
  process.exit(1);
}

fs.mkdirSync(resultsDir, {recursive: true});

let copied = 0;
let missing = 0;

for (const pid of fs.readdirSync(projectsDir)) {
  const projectDir = path.join(projectsDir, pid);
  if (!fs.statSync(projectDir).isDirectory()) continue;

  for (const ext of ['.tsx', '.json']) {
    const src = path.join(projectDir, `${pid}${ext}`);
    const dest = path.join(resultsDir, `${pid}${ext}`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      copied++;
    } else {
      missing++;
      console.warn(`  ⚠ Missing: ${pid}${ext}`);
    }
  }
}

console.log(`✓ Collected ${copied} files from ${fs.readdirSync(projectsDir).length} projects${missing ? ` (${missing} missing)` : ''}`);
