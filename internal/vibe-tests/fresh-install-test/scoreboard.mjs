#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scoreboard.mjs
 * @input subcommands: record | list | canvas-data
 * @output results/scoreboard.json (the living, per-model, per-commit needle tracker)
 * @position internal/vibe-tests/fresh-install-test — the progress tracker
 *
 * The needle tracker. Each DATA POINT = one (commit/condition × model) batch,
 * carrying the three headline rates: core installed, CLI installed, astryx init
 * ran. Points are ordered along the x-axis (baseline → each needle-moving
 * commit). The canvas renders one line chart PER MODEL with those three lines.
 *
 * Workflow (one entry per PR commit that moves the needle):
 *   1. make a change to the package (README / banner / auto-init / …), commit it
 *   2. run BOTH models against it:  node run.mjs --source local --model <m> --exp <id>
 *   3. record a point:  node scoreboard.mjs record --exp <id> --label "c1: README R1" \
 *          --commit <sha> --description "what the commit does"
 *   4. refresh the canvas from `scoreboard.mjs canvas-data`
 *
 * Usage:
 *   node scoreboard.mjs record --exp <id> --label "<x-label>" [--commit <sha>] [--description "..."] [--order <n>]
 *   node scoreboard.mjs list
 *   node scoreboard.mjs canvas-data     # prints the {categories, byModel} block to embed in the canvas
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scoreSandbox} from './score.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');
const SCOREBOARD = path.join(RESULTS_DIR, 'scoreboard.json');

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}

function load() {
  if (!fs.existsSync(SCOREBOARD)) return {updatedAt: null, points: []};
  return JSON.parse(fs.readFileSync(SCOREBOARD, 'utf-8'));
}

function save(board) {
  board.updatedAt = new Date().toISOString();
  fs.mkdirSync(RESULTS_DIR, {recursive: true});
  fs.writeFileSync(SCOREBOARD, JSON.stringify(board, null, 2));
}

const pct = (arr, pick) => (arr.length ? Math.round((arr.filter(pick).length / arr.length) * 100) : 0);

function measure(expId) {
  const manifest = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, `manifest-${expId}.json`), 'utf-8'));
  const finished = [];
  for (const repDir of manifest.repDirs ?? []) {
    if (!fs.existsSync(path.join(repDir, 'rep.json'))) continue; // finished only
    const s = scoreSandbox(repDir);
    if (s.missing) continue;
    finished.push(s);
  }
  return {
    model: manifest.model,
    source: manifest.source ?? 'public',
    n: finished.length,
    core: pct(finished, s => s.coreInstalled || s.coreInDeps),
    cli: pct(finished, s => s.cliInstalled || s.cliInDeps),
    init: pct(finished, s => s.initRan),
    styled: pct(finished, s => s.stylesWired),
  };
}

function record() {
  const expId = arg('--exp');
  const label = arg('--label');
  if (!expId || !label) {
    console.error('record needs --exp <id> and --label "<x-label>"');
    process.exit(1);
  }
  const m = measure(expId);
  const board = load();
  const point = {
    order: arg('--order') ? Number(arg('--order')) : undefined,
    label,
    commit: arg('--commit') ?? null,
    description: arg('--description') ?? '',
    model: m.model,
    source: m.source,
    n: m.n,
    core: m.core,
    cli: m.cli,
    init: m.init,
    styled: m.styled,
    exp: expId,
    recordedAt: new Date().toISOString(),
  };
  // upsert by (label, model)
  const idx = board.points.findIndex(p => p.label === label && p.model === m.model);
  if (idx !== -1) {
    point.order = point.order ?? board.points[idx].order;
    board.points[idx] = point;
  } else {
    point.order = point.order ?? board.points.length + 1;
    board.points.push(point);
  }
  board.points.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  save(board);
  console.log(`✓ recorded ${label} · ${m.model} → core ${m.core}% · cli ${m.cli}% · init ${m.init}%  (n=${m.n})`);
}

function list() {
  const board = load();
  if (!board.points.length) {
    console.log('scoreboard empty. Record a point with: node scoreboard.mjs record --exp <id> --label "..."');
    return;
  }
  console.log(`\n📈 Scoreboard (updated ${board.updatedAt})\n`);
  console.log(`${'label'.padEnd(24)} ${'model'.padEnd(24)} ${'n'.padEnd(4)} core  cli   init`);
  console.log('─'.repeat(78));
  for (const p of board.points) {
    console.log(`${p.label.padEnd(24)} ${String(p.model).padEnd(24)} ${String(p.n).padEnd(4)} ${String(p.core).padStart(3)}%  ${String(p.cli).padStart(3)}%  ${String(p.init).padStart(3)}%`);
  }
  console.log('');
}

/** Emit {categories, byModel:{model:[{label,core,cli,init,n,commit,description}]}} for the canvas. */
function canvasData() {
  const board = load();
  const orderedLabels = [];
  for (const p of board.points) if (!orderedLabels.includes(p.label)) orderedLabels.push(p.label);
  const models = [...new Set(board.points.map(p => p.model))];
  const byModel = {};
  for (const model of models) {
    byModel[model] = orderedLabels
      .map(label => board.points.find(p => p.label === label && p.model === model))
      .filter(Boolean)
      .map(p => ({label: p.label, core: p.core, cli: p.cli, init: p.init, n: p.n, commit: p.commit, description: p.description}));
  }
  console.log(JSON.stringify({categories: orderedLabels, models, byModel, updatedAt: board.updatedAt}, null, 2));
}

const cmd = process.argv[2];
if (cmd === 'record') record();
else if (cmd === 'list') list();
else if (cmd === 'canvas-data') canvasData();
else {
  console.error('Usage: scoreboard.mjs <record|list|canvas-data> [flags]');
  process.exit(1);
}
