#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run-matrix.mjs
 * @input --condition <label> [--description --commit --source --reps --concurrency --models]
 * @output runs run.mjs for every tracked model, then records a scoreboard point each
 * @position internal/vibe-tests/fresh-install-test — one data point across all models
 *
 * One "data point" on the needle scoreboard = this whole matrix for a given
 * condition/commit: run every model in models.json against it, then record each
 * model's core/CLI/init rates. Models run SEQUENTIALLY (run.mjs parallelizes reps
 * within a model) to bound machine load.
 *
 * Usage:
 *   # baseline (published package, real npm)
 *   node run-matrix.mjs --condition "baseline" --description "published core, no changes"
 *   # a needle-moving commit, tested via the local Verdaccio rig
 *   node run-matrix.mjs --condition "c1: README R1" --commit <sha> --source local \
 *       --description "README: init is the only easy path"
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {spawnSync, spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS = JSON.parse(fs.readFileSync(path.join(__dirname, 'models.json'), 'utf-8')).models;

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}
const slugify = s => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

const condition = arg('--condition');
if (!condition) {
  console.error('run-matrix: --condition "<x-axis label>" is required');
  process.exit(1);
}
const description = arg('--description', '');
const commit = arg('--commit');
const source = arg('--source', 'public');
const reps = arg('--reps', '6');
const concurrency = arg('--concurrency', '3');
const turnTimeout = arg('--turn-timeout', '700');
const only = arg('--models');
const models = only ? MODELS.filter(m => only.split(',').map(s => s.trim()).includes(m.slug)) : MODELS;
// --parallel-models: run every model's batch at once (each commit = ~1 model's
// wall-time instead of 4×). Total concurrent agents ≈ models × --concurrency, so
// keep --concurrency modest (2–3) when parallel to avoid machine/API thrash.
const parallel = process.argv.includes('--parallel-models');

console.log(`\n🎛  Matrix — condition "${condition}"`);
console.log(`   source ${source} · reps ${reps} · concurrency ${concurrency} · ${parallel ? 'PARALLEL' : 'sequential'} models: ${models.map(m => m.slug).join(', ')}\n`);

function runModel(m) {
  return new Promise(resolve => {
    const exp = `${slugify(condition)}-${m.short}-${crypto.randomBytes(2).toString('hex')}`;
    console.log(`\n════ start ${m.label} (${m.slug}) · exp ${exp} ════`);
    const child = spawn(
      'node',
      [path.join(__dirname, 'run.mjs'), '--reps', reps, '--model', m.slug, '--source', source, '--concurrency', concurrency, '--turn-timeout', turnTimeout, '--exp', exp],
      {stdio: 'inherit'},
    );
    child.on('close', code => {
      if (code !== 0) console.error(`⚠ run.mjs exited ${code} for ${m.slug}; recording finished reps anyway`);
      const recArgs = [path.join(__dirname, 'scoreboard.mjs'), 'record', '--exp', exp, '--label', condition, '--description', description];
      if (commit) recArgs.push('--commit', commit);
      const rec = spawnSync('node', recArgs, {stdio: 'inherit'});
      resolve({model: m.slug, exp, recorded: rec.status === 0});
    });
    child.on('error', err => {
      console.error(`✗ ${m.slug}: ${err}`);
      resolve({model: m.slug, exp, recorded: false});
    });
  });
}

let results;
if (parallel) {
  results = await Promise.all(models.map(runModel));
} else {
  results = [];
  for (const m of models) results.push(await runModel(m));
}

console.log(`\n✅ Matrix complete for "${condition}".`);
for (const r of results) console.log(`   ${r.model.padEnd(24)} exp ${r.exp} ${r.recorded ? '✓ recorded' : '✗ record failed'}`);
console.log(`\n   node scoreboard.mjs list`);
console.log(`   node scoreboard.mjs canvas-data     # then refresh the canvas\n`);
