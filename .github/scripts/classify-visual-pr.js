#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Local calibration/debug CLI for the static visual-diff
 *   classifier (#3667). CI consumes the classifier through review-signal.yml;
 *   this runs the same scoring against any local ref range so a threshold or
 *   signal change can be validated against real diffs before shipping
 *   (e.g. `gh pr checkout <n> && node .github/scripts/classify-visual-pr.js`).
 * @input --base <ref> --head <ref> --output <file>
 * @output JSON file with the classification ({ score, bucket, signals, … })
 */

const fs = require('node:fs');
const { execSync } = require('node:child_process');
const { classifyVisualDiff } = require('./lib/classify-visual');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const baseRef = getArg('base') || 'origin/main';
const headRef = getArg('head') || 'HEAD';
const outputFile = getArg('output') || 'visual-classification.json';

// A missing merge base means the clone is too shallow — the three-dot diff
// would be empty and every PR would classify as a confident "non-visual".
// Fail loudly instead of reporting a bogus result.
try {
  execSync(`git merge-base ${baseRef} ${headRef}`, { encoding: 'utf8', stdio: 'pipe' });
} catch {
  console.error(
    `No merge base between ${baseRef} and ${headRef} — the checkout is too shallow to diff. ` +
    'Fetch full history (fetch-depth: 0) before running the classifier.'
  );
  process.exit(1);
}

const diff = execSync(
  `git diff ${baseRef}...${headRef}`,
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
);

const result = classifyVisualDiff(diff);
console.log(`Visual classification: ${result.bucket} (score ${result.score})`);

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
console.log(`Classification written to ${outputFile}`);
