// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Flow error-count baseline.
 *
 * Flow runs as a second, opt-in type checker layered on top of tsc. Because
 * Astryx source is authored in TypeScript, Flow starts from a large error
 * baseline (see docs/flow.md). Gating CI at zero errors would be red forever,
 * so instead we record the current count and fail only when it INCREASES.
 * This lets the number ratchet down over time without blocking unrelated work.
 *
 *   node scripts/flow-baseline.mjs            # write/update the baseline
 *   node scripts/flow-baseline.mjs --check    # CI mode: fail if count grew
 */

import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = join(ROOT, '.flow-baseline.json');
const CHECK = process.argv.includes('--check');

function flowErrorCount() {
  const flowBin = join(ROOT, 'node_modules', '.bin', 'flow');
  let raw;
  try {
    raw = execFileSync(flowBin, ['check', '--json'], {
      cwd: ROOT,
      maxBuffer: 512 * 1024 * 1024,
      encoding: 'utf8',
    });
  } catch (err) {
    // `flow check` exits non-zero when errors exist; the JSON is still on stdout.
    raw = err.stdout?.toString() ?? '';
  }
  if (!raw) throw new Error('flow produced no output');
  const data = JSON.parse(raw);
  return (data.errors ?? []).length;
}

const count = flowErrorCount();

if (!CHECK) {
  writeFileSync(BASELINE_PATH, JSON.stringify({errors: count}, null, 2) + '\n');
  console.log(`Wrote Flow baseline: ${count} errors`);
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error('No .flow-baseline.json found. Run `pnpm flow:baseline` first.');
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).errors;

if (count > baseline) {
  console.error(
    `Flow errors increased: ${count} (baseline ${baseline}). ` +
      `Fix the new errors, or if intentional run \`pnpm flow:baseline\` to update.`,
  );
  process.exit(1);
}

if (count < baseline) {
  console.log(
    `Flow errors decreased: ${count} (baseline ${baseline}). ` +
      `Nice — run \`pnpm flow:baseline\` to lock in the improvement.`,
  );
} else {
  console.log(`Flow errors unchanged: ${count} (baseline ${baseline}).`);
}
process.exit(0);
