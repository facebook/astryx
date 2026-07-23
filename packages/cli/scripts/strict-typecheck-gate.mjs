#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Strict type-check gate for the CLI's JS sources.
 *
 * The CLI ships as hand-written `.mjs` (no build step) but is type-checked via
 * TypeScript's `checkJs` against JSDoc annotations. This gate runs the compiler
 * over the WHOLE non-test tree under full `strict` (see tsconfig.strict.json)
 * and enforces two invariants:
 *
 *   1. ENFORCED SET (zero tolerance). Every file listed in
 *      `strict-typecheck-allowlist.json` — plus all `.d.ts` — must have ZERO
 *      strict errors. A listed file can never regress; a brand-new source file
 *      is expected to be strict-clean and added to the list. This is what
 *      forces complete JSDoc annotations on in-scope code.
 *
 *   2. WHOLE-TREE RATCHET (monotonic). The total strict-error count across the
 *      remaining (not-yet-clean) files may never exceed the committed baseline
 *      in `strict-typecheck-baseline.json`. Debt can only shrink. When it does,
 *      run this script with `--update-baseline` to lower the number (and, when
 *      files reach zero, promote them into the allowlist).
 *
 * Usage:
 *   node scripts/strict-typecheck-gate.mjs                 # CI gate
 *   node scripts/strict-typecheck-gate.mjs --update-baseline
 *
 * Exit 0 = pass, non-zero = fail.
 */

import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, '..');
const PROJECT = path.join(CLI_DIR, 'tsconfig.strict.json');
const ALLOWLIST_FILE = path.join(CLI_DIR, 'strict-typecheck-allowlist.json');
const BASELINE_FILE = path.join(CLI_DIR, 'strict-typecheck-baseline.json');

const UPDATE = process.argv.includes('--update-baseline');

/**
 * Normalize a tsc file path to a stable, cwd-independent key
 * (e.g. `src/api/blog.mjs`).
 * @param {string} p
 * @returns {string}
 */
function normalize(p) {
  return p.replace(/\\/g, '/');
}

/**
 * Run the strict project and return combined tsc output.
 * @returns {string}
 */
function runTsc() {
  const res = spawnSync(
    'pnpm',
    ['exec', 'tsc', '--project', PROJECT, '--pretty', 'false'],
    {cwd: CLI_DIR, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024},
  );
  // tsc exits non-zero when errors exist; that's expected — we parse output.
  return (res.stdout || '') + (res.stderr || '');
}

/**
 * Parse `src/...(line,col): error TSxxxx: msg` lines into per-file counts.
 * @param {string} out
 * @returns {{byFile: Map<string, number>, total: number}}
 */
function parseErrors(out) {
  const byFile = new Map();
  const re = /^(src\/[^(]+)\(\d+,\d+\): error TS\d+:/;
  let total = 0;
  for (const line of out.split('\n')) {
    const m = re.exec(line.trim());
    if (!m) continue;
    total++;
    const f = normalize(m[1]);
    byFile.set(f, (byFile.get(f) || 0) + 1);
  }
  return {byFile, total};
}

/**
 * @template T
 * @param {string} file
 * @param {T} fallback
 * @returns {T}
 */
function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/**
 * Enumerate non-test .mjs sources (the ratchet's promotion candidates).
 * @returns {string[]}
 */
function listNonTestSources() {
  const res = spawnSync(
    'find',
    ['src', '-name', '*.mjs', '!', '-name', '*.test.mjs'],
    {cwd: CLI_DIR, encoding: 'utf8'},
  );
  return (res.stdout || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(normalize)
    .sort();
}

function main() {
  const out = runTsc();
  const {byFile, total} = parseErrors(out);

  if (UPDATE) {
    const allSrc = listNonTestSources();
    const nowClean = allSrc.filter(f => !byFile.has(f));
    fs.writeFileSync(
      ALLOWLIST_FILE,
      JSON.stringify({files: nowClean}, null, 2) + '\n',
    );
    fs.writeFileSync(
      BASELINE_FILE,
      JSON.stringify({maxErrors: total}, null, 2) + '\n',
    );
    console.log(
      `Updated: ${total} total strict errors; ` +
        `${nowClean.length} files enforced at zero errors.`,
    );
    process.exit(0);
  }

  const allowlist = readJson(ALLOWLIST_FILE, {files: []});
  const enforced = new Set(allowlist.files || []);
  const baseline = readJson(BASELINE_FILE, {
    maxErrors: Number.POSITIVE_INFINITY,
  });

  let failed = false;

  const regressed = [];
  for (const f of enforced) {
    if (byFile.has(f)) regressed.push({file: f, count: byFile.get(f)});
  }
  if (regressed.length > 0) {
    failed = true;
    console.error(
      '\n✗ Strict type errors in enforced (zero-tolerance) files:\n',
    );
    for (const {file, count} of regressed.sort((a, b) =>
      a.file.localeCompare(b.file),
    )) {
      console.error(`  ${file}: ${count} error(s)`);
    }
    console.error(
      '\nThese files are in strict-typecheck-allowlist.json and must stay ' +
        'strict-clean. Add or repair the JSDoc annotations that resolve the ' +
        'errors above before merging.',
    );
  }

  const max = baseline.maxErrors ?? Number.POSITIVE_INFINITY;
  if (total > max) {
    failed = true;
    console.error(
      `\n✗ Total strict-error count rose to ${total}, above the baseline of ` +
        `${max}. New type errors are not allowed.\n` +
        'Fix the new errors. If you legitimately reduced errors elsewhere, run ' +
        '`pnpm -F @astryxdesign/cli typecheck:strict:update` and commit the ' +
        'lowered baseline + expanded allowlist.',
    );
  }

  if (failed) process.exit(1);

  console.log(
    `✓ Strict gate passed — ${enforced.size} files enforced at zero errors; ` +
      `total strict errors ${total} <= baseline ${max}.`,
  );
}

main();
