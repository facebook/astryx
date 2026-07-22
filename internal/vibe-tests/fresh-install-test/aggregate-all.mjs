#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file aggregate-all.mjs
 * @input (none) — scans results/manifest-*.json + their /tmp sandboxes
 * @output results/aggregate.json + a printed table (funnel across all runs)
 * @position internal/vibe-tests/fresh-install-test — cross-experiment roll-up
 *
 * Joins every experiment's finished reps into one dataset for the funnel:
 * next app → core installed → CLI installed → INIT RAN (marker) → styled.
 * Ground truth is on disk (via score.mjs scoreSandbox); the astryx command
 * trail (from rep.json) is a secondary signal.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scoreSandbox, wilson} from './score.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');

function trailFrom(repDir) {
  const out = {commands: [], initInTrail: false, ranAnyAstryx: false};
  try {
    const rj = JSON.parse(fs.readFileSync(path.join(repDir, 'rep.json'), 'utf-8'));
    for (const t of rj.turns ?? []) {
      for (const c of t.commands ?? []) {
        out.commands.push(c);
        if (/(^|\s|\/)astryx\b/.test(c) || /\bnpx\s+astryx\b/.test(c)) out.ranAnyAstryx = true;
        if (/astryx[^\n]*\binit\b/.test(c)) out.initInTrail = true;
      }
    }
  } catch {
    /* pre-stream-json runs or unfinished */
  }
  return out;
}

function main() {
  const manifests = fs
    .readdirSync(RESULTS_DIR)
    .filter(f => /^manifest-.*\.json$/.test(f));

  const rows = [];
  for (const mf of manifests) {
    const m = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, mf), 'utf-8'));
    for (const repDir of m.repDirs ?? []) {
      const s = scoreSandbox(repDir);
      if (s.missing) continue;
      const finished = fs.existsSync(path.join(repDir, 'rep.json'));
      const trail = trailFrom(repDir);
      rows.push({
        exp: m.experimentId,
        model: m.model,
        rep: path.basename(repDir),
        finished,
        nextApp: !!s.nextApp,
        core: !!(s.coreInstalled || s.coreInDeps),
        cli: !!(s.cliInstalled || s.cliInDeps),
        initRan: !!s.initRan,
        styled: !!s.stylesWired,
        markerFiles: s.markerFiles ?? [],
        initInTrail: trail.initInTrail,
        ranAnyAstryx: trail.ranAnyAstryx,
      });
    }
  }

  const finished = rows.filter(r => r.finished);
  const pct = (arr, pick) => {
    const c = arr.filter(pick).length;
    return {count: c, n: arr.length, ...wilson(c, arr.length)};
  };

  const funnel = {
    nextApp: pct(finished, r => r.nextApp),
    core: pct(finished, r => r.core),
    cli: pct(finished, r => r.cli),
    initRan: pct(finished, r => r.initRan),
    styled: pct(finished, r => r.styled),
    ranAnyAstryx: pct(finished, r => r.ranAnyAstryx),
  };

  const out = {
    generatedAt: new Date().toISOString(),
    totalRows: rows.length,
    finishedRows: finished.length,
    funnel,
    byExp: [...new Set(rows.map(r => r.exp))].map(exp => {
      const er = finished.filter(r => r.exp === exp);
      return {exp, model: rows.find(r => r.exp === exp)?.model, n: er.length, initRan: pct(er, r => r.initRan)};
    }),
    rows,
  };
  fs.writeFileSync(path.join(RESULTS_DIR, 'aggregate.json'), JSON.stringify(out, null, 2));

  const f = r => `${(r.p * 100).toFixed(0)}% (${r.count}/${r.n})`;
  console.log(`\n🧮 Aggregate — ${finished.length} finished / ${rows.length} total runs\n`);
  console.log(`  next app created : ${f(funnel.nextApp)}`);
  console.log(`  core installed   : ${f(funnel.core)}`);
  console.log(`  CLI installed    : ${f(funnel.cli)}`);
  console.log(`  ran any astryx   : ${f(funnel.ranAnyAstryx)}`);
  console.log(`  >> INIT RAN      : ${f(funnel.initRan)}   ← headline`);
  console.log(`  styled           : ${f(funnel.styled)}`);
  console.log(`\n  by experiment:`);
  for (const e of out.byExp) console.log(`    ${String(e.exp).padEnd(10)} init ${f(e.initRan)}  (model ${e.model})`);
  console.log(`\n📄 ${path.join(RESULTS_DIR, 'aggregate.json')}\n`);
}

main();
