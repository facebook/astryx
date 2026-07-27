#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run-purity.mjs
 * @input CLI flags (forwarded): --conditions, --prompts, --sample, --reps, --out, --concurrency, --model, --dry-run
 * @output Runs setup -> SDK run -> aggregate for one fresh experiment id
 * @position internal/vibe-tests/prompt-purity-test — one-command orchestrator
 *
 * This is the unit the /loop command would drive: tweak variants/*.md, then re-run
 * this to get a fresh A/B comparison. Requires the cursor-agent CLI to be logged in
 * (`cursor-agent status`) unless --dry-run.
 *
 * Usage:
 *   node run-purity.mjs                                             # A vs B, pilot prompts, 3 reps
 *   node run-purity.mjs --conditions A-control,B-selfcheck,C-strong --sample 6 --reps 5 --concurrency 4
 *   node run-purity.mjs --dry-run                                   # wire-check without model calls
 *
 * For AUTONOMOUS iteration, don't drive this file directly with /loop — follow the
 * playbook, which self-paces (event-gated on each run completing), evolves challenger
 * variants, confirms at K>=5, and ships the winner:
 *   /loop follow internal/vibe-tests/prompt-purity-test/ITERATE.md
 */

import * as crypto from 'node:crypto';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const EXP_DIR = path.dirname(fileURLToPath(import.meta.url));

function passthrough(argv, flag) {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : undefined;
}

function forward(argv, flags) {
  const out = [];
  for (const f of flags) {
    const v = passthrough(argv, f);
    if (v !== undefined) out.push(f, v);
  }
  return out;
}

function run(cmd, args) {
  console.log(`\n$ ${cmd} ${args.join(' ')}\n`);
  execFileSync(cmd, args, {stdio: 'inherit', cwd: EXP_DIR});
}

function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const expId = passthrough(argv, '--exp') ?? crypto.randomBytes(4).toString('hex');

  // 1. setup — build isolated sandbox projects per condition x prompt x rep
  run('node', [
    path.join(EXP_DIR, 'setup-purity.mjs'),
    '--exp', expId,
    ...forward(argv, ['--out', '--conditions', '--prompts', '--sample', '--reps']),
  ]);

  // 2. run — Cursor SDK, captures snapshots + transcript per run
  run('npx', [
    'tsx',
    path.join(EXP_DIR, 'run-purity.ts'),
    '--experiment', expId,
    ...forward(argv, ['--out', '--concurrency', '--model', '--conditions', '--timeout']),
    ...(dryRun ? ['--dry-run'] : []),
  ]);

  // 3. aggregate — per-condition Wilson-CI funnel + comparison vs control
  run('npx', ['tsx', path.join(EXP_DIR, 'purity-aggregate.ts'), '--experiment', expId, ...forward(argv, ['--out'])]);

  console.log(`\nExperiment ${expId} complete.`);
}

main();
