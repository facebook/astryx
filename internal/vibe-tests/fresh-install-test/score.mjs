#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file score.mjs
 * @input --exp <id> (reads results/manifest-<id>.json) | --dir <sandbox>
 * @output Per-rep funnel table + results/summary-<id>.json
 * @position internal/vibe-tests/fresh-install-test — the FILE-BASED scorer
 *
 * Ground truth is what's on disk in each sandbox after the two-turn run — not
 * what the agent claims. Signals:
 *   coreInstalled  — @astryxdesign/core in a package.json AND/OR node_modules
 *   cliInstalled   — @astryxdesign/cli in a package.json AND/OR node_modules/.bin/astryx
 *   nextApp        — `next` dependency / next.config.* present
 *   INIT RAN       — the `<!-- ASTRYX:START -->` (or legacy XDS) block exists in
 *                    any agent-doc file. ONLY `astryx init` writes this, so it is
 *                    definitive proof init ran. ← the headline metric.
 *   stylesWired    — a CSS file imports core's reset.css + astryx.css
 *
 * Rates carry a Wilson 95% CI so "foolproof" is legible: init-ran must reach
 * ~100% with a tight interval.
 *
 * Usage:
 *   node score.mjs --exp <id>
 *   node score.mjs --dir /tmp/astryx-fresh-install/<id>/rep-1
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');

const MARKERS = ['<!-- ASTRYX:START -->', '<!-- XDS:START -->'];
const AGENT_DOC_NAMES = new Set(['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.cursor.md']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.turbo', '.cache']);

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}

/** Recursively walk a dir (skipping heavy/generated dirs), yielding file paths. */
function* walk(dir, depth = 0) {
  if (depth > 8) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, {withFileTypes: true});
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(full, depth + 1);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

/** Find every package.json outside node_modules and read its dep names. */
function readPackageJsons(sandbox) {
  const pkgs = [];
  for (const f of walk(sandbox)) {
    if (path.basename(f) !== 'package.json') continue;
    try {
      const json = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const deps = {...json.dependencies, ...json.devDependencies, ...json.peerDependencies};
      pkgs.push({file: path.relative(sandbox, f), deps: Object.keys(deps), raw: json});
    } catch {
      /* ignore */
    }
  }
  return pkgs;
}

/** Does node_modules/<pkg> exist anywhere in the sandbox? */
function nodeModulesHas(sandbox, pkg) {
  const found = [];
  const stack = [sandbox];
  while (stack.length) {
    const dir = stack.pop();
    const nm = path.join(dir, 'node_modules', ...pkg.split('/'));
    if (fs.existsSync(nm)) found.push(path.relative(sandbox, nm));
    // descend only into non-node_modules subdirs to find nested app roots
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.')) {
        stack.push(path.join(dir, e.name));
      }
    }
  }
  return found;
}

export function scoreSandbox(sandbox) {
  if (!fs.existsSync(sandbox)) {
    return {missing: true};
  }
  const pkgs = readPackageJsons(sandbox);
  const allDeps = new Set(pkgs.flatMap(p => p.deps));

  // Marker scan (definitive init evidence)
  const markerFiles = [];
  for (const f of walk(sandbox)) {
    const base = path.basename(f);
    // only bother reading smallish text-ish files
    const isDocish = AGENT_DOC_NAMES.has(base) || base.endsWith('.md') || base.endsWith('.mdc') || base === '.cursorrules';
    if (!isDocish) continue;
    try {
      const content = fs.readFileSync(f, 'utf-8');
      if (MARKERS.some(m => content.includes(m))) {
        markerFiles.push(path.relative(sandbox, f));
      }
    } catch {
      /* ignore */
    }
  }

  // Styles wired
  let stylesWired = false;
  for (const f of walk(sandbox)) {
    if (!/\.(css|tsx?|jsx?|mjs)$/.test(f)) continue;
    try {
      const c = fs.readFileSync(f, 'utf-8');
      if (c.includes('@astryxdesign/core/reset.css') && c.includes('@astryxdesign/core/astryx.css')) {
        stylesWired = true;
        break;
      }
    } catch {
      /* ignore */
    }
  }

  const coreNM = nodeModulesHas(sandbox, '@astryxdesign/core');
  const cliNM = nodeModulesHas(sandbox, '@astryxdesign/cli');
  const binAstryx = nodeModulesHas(sandbox, '.bin/astryx');
  const nextConfig = [...walk(sandbox)].some(f => /(^|\/)next\.config\.[mc]?[jt]s$/.test(f));

  return {
    coreInDeps: allDeps.has('@astryxdesign/core'),
    cliInDeps: allDeps.has('@astryxdesign/cli'),
    themeInDeps: [...allDeps].some(d => d.startsWith('@astryxdesign/theme')),
    nextInDeps: allDeps.has('next'),
    coreInstalled: coreNM.length > 0,
    cliInstalled: cliNM.length > 0 || binAstryx.length > 0,
    nextApp: allDeps.has('next') || nextConfig,
    initRan: markerFiles.length > 0,
    markerFiles,
    stylesWired,
    packageJsons: pkgs.map(p => p.file),
  };
}

export function wilson(successes, n, z = 1.96) {
  if (n === 0) return {p: 0, lo: 0, hi: 0};
  const phat = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = phat + z2 / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n);
  return {p: phat, lo: Math.max(0, (center - margin) / denom), hi: Math.min(1, (center + margin) / denom)};
}

export function rate(rows, pick) {
  const s = rows.filter(pick).length;
  return {count: s, n: rows.length, ...wilson(s, rows.length)};
}

const fmt = r => `${(r.p * 100).toFixed(0)}% [${(r.lo * 100).toFixed(0)}-${(r.hi * 100).toFixed(0)}] (${r.count}/${r.n})`;
const yn = b => (b ? 'Y' : '·');

function main() {
  const dir = arg('--dir');
  const expId = arg('--exp');

  let repDirs = [];
  let model = '?';
  if (dir) {
    repDirs = [dir];
  } else if (expId) {
    const manifest = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, `manifest-${expId}.json`), 'utf-8'));
    repDirs = manifest.repDirs;
    model = manifest.model;
  } else {
    console.error('Usage: score.mjs (--exp <id> | --dir <sandbox>)');
    process.exit(1);
  }

  const rows = repDirs.map((d, i) => ({rep: i + 1, dir: d, ...scoreSandbox(d)}));

  console.log(`\n📊 Fresh-install discovery — ${expId ? `experiment ${expId}` : dir}  (model: ${model})\n`);
  console.log(`${'rep'.padEnd(5)} ${'core'.padEnd(5)} ${'cli'.padEnd(5)} ${'next'.padEnd(5)} ${'INIT'.padEnd(6)} ${'styled'.padEnd(7)} marker files`);
  console.log('─'.repeat(90));
  for (const r of rows) {
    if (r.missing) {
      console.log(`${String(r.rep).padEnd(5)} (sandbox missing)`);
      continue;
    }
    const core = r.coreInstalled || r.coreInDeps;
    const cli = r.cliInstalled || r.cliInDeps;
    console.log(
      `${String(r.rep).padEnd(5)} ${yn(core).padEnd(5)} ${yn(cli).padEnd(5)} ${yn(r.nextApp).padEnd(5)} ${yn(r.initRan).padEnd(6)} ${yn(r.stylesWired).padEnd(7)} ${r.markerFiles.join(', ') || '—'}`,
    );
  }

  const valid = rows.filter(r => !r.missing);
  console.log('\nRates (Wilson 95% CI):');
  console.log(`  core installed/declared : ${fmt(rate(valid, r => r.coreInstalled || r.coreInDeps))}`);
  console.log(`  CLI  installed/declared : ${fmt(rate(valid, r => r.cliInstalled || r.cliInDeps))}`);
  console.log(`  next app created        : ${fmt(rate(valid, r => r.nextApp))}`);
  console.log(`  >> INIT RAN (marker)    : ${fmt(rate(valid, r => r.initRan))}   ← headline`);
  console.log(`  styles wired            : ${fmt(rate(valid, r => r.stylesWired))}`);

  const summary = {
    experimentId: expId ?? null,
    model,
    generatedAt: new Date().toISOString(),
    n: valid.length,
    rates: {
      coreInstalled: rate(valid, r => r.coreInstalled || r.coreInDeps),
      cliInstalled: rate(valid, r => r.cliInstalled || r.cliInDeps),
      nextApp: rate(valid, r => r.nextApp),
      initRan: rate(valid, r => r.initRan),
      stylesWired: rate(valid, r => r.stylesWired),
    },
    rows,
  };
  if (expId) {
    const out = path.join(RESULTS_DIR, `summary-${expId}.json`);
    fs.writeFileSync(out, JSON.stringify(summary, null, 2));
    console.log(`\n📄 ${out}`);
  }
  console.log(
    `\nFoolproof bar: INIT RAN must reach ~100% with a tight CI. Anything less = the shipped\nchannel isn't reliably converting installs → \`astryx init\`.\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
