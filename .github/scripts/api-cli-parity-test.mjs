#!/usr/bin/env node
/**
 * API ↔ CLI parity test.
 *
 * Auto-discovers every component, doc topic, and CLI command,
 * then verifies the programmatic API returns identical results
 * to `xds --json` for each one. Nothing is hardcoded.
 *
 * Usage:
 *   node .github/scripts/api-cli-parity-test.mjs              # full run
 *   node .github/scripts/api-cli-parity-test.mjs --no-baseline # skip git worktree comparison
 */

import {spawnSync, execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CLI = path.join(ROOT, 'packages/cli/bin/xds.mjs');
const skipBaseline = process.argv.includes('--no-baseline');
const baselineRef = process.argv.includes('--baseline')
  ? process.argv[process.argv.indexOf('--baseline') + 1]
  : 'main';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cliJson(args, cwd = ROOT) {
  const r = spawnSync(process.execPath, [CLI, '--json', ...args], {
    cwd, encoding: 'utf8', timeout: 30_000,
  });
  try {
    return JSON.parse(r.stdout);
  } catch {
    return {__parse_error: true, raw: r.stdout?.slice(0, 200)};
  }
}

async function apiCall(fn, ...args) {
  try {
    const r = await fn(...args);
    return {type: r.type, data: r.data};
  } catch (e) {
    return {error: e.message, suggestions: e.suggestions};
  }
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function typeOf(r) {
  if (!r) return '(null)';
  if (r.__parse_error) return '(parse error)';
  if (r.error) return 'error';
  return r.type || '(no type)';
}

// ─── Discover ─────────────────────────────────────────────────────────────────

console.log('Discovering...');

const api = await import('../../packages/cli/src/api/index.mjs');

const componentList = cliJson(['component', '--list']);
const allComponents = componentList.data && !componentList.error
  ? Object.values(componentList.data).flat()
  : [];

const docsList = cliJson(['docs']);
const allTopics = docsList.data && !docsList.error
  ? docsList.data.map(e => e.topic)
  : [];

const categories = componentList.data ? Object.keys(componentList.data) : [];

console.log(`  ${allComponents.length} components, ${allTopics.length} doc topics, ${categories.length} categories`);

// ─── Build cases ──────────────────────────────────────────────────────────────
//
// Each case: { label, cli, apiFn? }
//   - cli:   args for `xds --json ...`
//   - apiFn: if present, called to get API result; compared with CLI result
//   - if apiFn is absent, CLI-only (still counted for coverage)

const cases = [];

function add(label, cli, apiFn) {
  cases.push({label, cli, apiFn: apiFn || null});
}

// Component — list variants
add('component --list', ['component', '--list'],
  () => apiCall(api.component, undefined, {list: true, cwd: ROOT}));
add('component --detail brief', ['component', '--detail', 'brief'],
  () => apiCall(api.component, undefined, {detail: 'brief', cwd: ROOT}));

for (const cat of categories) {
  add(`component --category ${cat}`, ['component', '--category', cat],
    () => apiCall(api.component, undefined, {category: cat, cwd: ROOT}));
}

// Component — every discovered component
for (const name of allComponents) {
  add(`component ${name}`, ['component', name],
    () => apiCall(api.component, name, {cwd: ROOT}));
}

// Component — props + source (sample)
const sample = allComponents.includes('Button') ? 'Button' : allComponents[0];
if (sample) {
  add(`component ${sample} --props`, ['component', sample, '--props'],
    () => apiCall(api.component, sample, {props: true, cwd: ROOT}));
  add(`component ${sample} --source`, ['component', sample, '--source'],
    () => apiCall(api.component, sample, {source: true, cwd: ROOT}));
}

// Component — error
add('component NotARealThing99', ['component', 'NotARealThing99'],
  () => apiCall(api.component, 'NotARealThing99', {cwd: ROOT}));

// Docs — every topic
add('docs (list)', ['docs'], () => apiCall(api.docs));
for (const topic of allTopics) {
  add(`docs ${topic}`, ['docs', topic], () => apiCall(api.docs, topic));
}
add('docs nonexistent', ['docs', 'nonexistent_xyz'],
  () => apiCall(api.docs, 'nonexistent_xyz'));

// Other commands — probe with safe read-only args
const otherCommands = [
  ['swizzle', '--list'],
  ['template', '--list'],
  ['gap-report', '--list-categories'],
  ['upgrade', '--list'],
];
for (const args of otherCommands) {
  const probe = cliJson(args);
  if (!probe.__parse_error && !probe.error?.includes('not supported')) {
    add(args.join(' '), args);
  }
}

console.log(`  ${cases.length} test cases\n`);

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log('Running API + CLI...');

const results = [];
for (const tc of cases) {
  const cli = cliJson(tc.cli);
  const apiResult = tc.apiFn ? await tc.apiFn() : null;
  results.push({...tc, cli, api: apiResult});
}

// ─── Baseline (optional) ─────────────────────────────────────────────────────

const oldResults = new Map();
if (!skipBaseline) {
  console.log(`Running baseline CLI (${baselineRef})...`);
  const wt = path.join(ROOT, '.worktree-parity-test');
  try {
    execSync(`git worktree add "${wt}" ${baselineRef} --detach 2>/dev/null`, {cwd: ROOT});
    if (!fs.existsSync(path.join(wt, 'node_modules'))) {
      execSync('yarn install --frozen-lockfile 2>/dev/null || true', {cwd: wt, timeout: 60_000});
    }
    const oldCli = path.join(wt, 'packages/cli/bin/xds.mjs');
    for (const r of results) {
      const old = spawnSync(process.execPath, [oldCli, '--json', ...r.cli], {
        cwd: wt, encoding: 'utf8', timeout: 30_000,
      });
      try { oldResults.set(r.label, JSON.parse(old.stdout)); }
      catch { oldResults.set(r.label, {__parse_error: true}); }
    }
  } catch (e) {
    console.log(`  Warning: ${e.message}`);
  }
  try { execSync(`git worktree remove "${wt}" --force 2>/dev/null`, {cwd: ROOT}); }
  catch {}
} else {
  console.log('Baseline: skipped (--no-baseline)');
}

// ─── Report ───────────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;
const failures = [];
const apiTypes = new Set();
const cliTypes = new Set();
const cliOnlyTypes = new Set();

console.log('\n' + '═'.repeat(95));

const cols = ['Test Case', 'Type', 'API=CLI'];
if (!skipBaseline) cols.push('old');
cols.push('');
console.log(cols.map((c, i) => c.padEnd(i === 0 ? 45 : i === 1 ? 24 : 8)).join(' | '));
console.log('-'.repeat(95));

for (const r of results) {
  const ct = typeOf(r.cli);
  if (!r.cli?.error) cliTypes.add(ct);

  let match;
  if (!r.api) {
    match = 'n/a';
    if (!r.cli?.error && r.cli?.type) cliOnlyTypes.add(ct);
  } else {
    if (!r.api.error) apiTypes.add(typeOf(r.api));
    match = deepEqual(r.api, r.cli) ? '✓' : '✗';
  }

  let old = '';
  if (!skipBaseline) {
    const o = oldResults.get(r.label);
    old = !o ? '—' : typeOf(r.cli) === typeOf(o) ? '✓' : '△';
  }

  const ok = match === '✓' || match === 'n/a';
  if (ok) pass++; else {
    fail++;
    failures.push({label: r.label, api: r.api ? typeOf(r.api) : 'n/a', cli: ct});
  }

  const row = [r.label.padEnd(45), ct.padEnd(24), match.padEnd(8)];
  if (!skipBaseline) row.push(old.padEnd(8));
  row.push(ok ? 'PASS' : 'FAIL');
  console.log(row.join(' | '));
}

console.log('-'.repeat(95));

// Coverage: any CLI type that no API function produced and no CLI-only probe covered?
const uncovered = [...cliTypes].filter(t => !apiTypes.has(t) && !cliOnlyTypes.has(t));
if (uncovered.length > 0) {
  console.log(`\nCOVERAGE GAP — CLI types without API or probe coverage:`);
  for (const t of uncovered) console.log(`  ${t}`);
  fail += uncovered.length;
}

console.log(`\n${results.length} cases | ${cliTypes.size} CLI types | ${apiTypes.size} API types | ${cliOnlyTypes.size} CLI-only`);
console.log(`PASS: ${pass}  FAIL: ${fail}`);

if (fail > 0) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  ${f.label}: api=${f.api} cli=${f.cli}`);
  process.exit(1);
}

console.log('\nAll checks passed.');
