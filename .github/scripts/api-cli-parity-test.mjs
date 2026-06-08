#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

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
    const parsed = JSON.parse(r.stdout);
    // Normalize to the {type, data} / {error, suggestions} shape the API side
    // produces (see apiCall). The CLI envelope also carries transport metadata
    // (apiVersion, and an optional meta sidecar) that the API functions don't
    // return; strip it so parity compares semantics, not envelope framing.
    if (parsed && typeof parsed === 'object' && !parsed.__parse_error) {
      if (parsed.error !== undefined) {
        return {error: parsed.error, suggestions: parsed.suggestions};
      }
      if (parsed.type !== undefined) {
        return {type: parsed.type, data: parsed.data};
      }
    }
    return parsed;
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

const hookList = cliJson(['hook', '--list']);
const allHooks = hookList.data && !hookList.error
  ? Object.values(hookList.data).flat()
  : [];
const hookCategories = hookList.data && !hookList.error
  ? Object.keys(hookList.data)
  : [];

console.log(`  ${allComponents.length} components, ${allTopics.length} doc topics, ${categories.length} categories`);
console.log(`  ${allHooks.length} hooks, ${hookCategories.length} hook categories`);

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

// Template — uses API
add('template --list', ['template', '--list'],
  () => apiCall(api.template));
add('template nonexistent', ['template', 'nonexistent99'],
  () => apiCall(api.template, 'nonexistent99'));

// Hook — list variants
add('hook --list', ['hook', '--list'],
  () => apiCall(api.hook, undefined, {list: true, cwd: ROOT}));

for (const cat of hookCategories) {
  add(`hook --category ${cat}`, ['hook', '--category', cat],
    () => apiCall(api.hook, undefined, {category: cat, cwd: ROOT}));
}

// Hook — every discovered hook
for (const name of allHooks) {
  add(`hook ${name}`, ['hook', name],
    () => apiCall(api.hook, name, {cwd: ROOT}));
}

// Hook — params (sample)
const hookSample = allHooks[0];
if (hookSample) {
  add(`hook ${hookSample} --params`, ['hook', hookSample, '--params'],
    () => apiCall(api.hook, hookSample, {params: true, cwd: ROOT}));
}

// Hook — error
add('hook NotARealHook99', ['hook', 'NotARealHook99'],
  () => apiCall(api.hook, 'NotARealHook99', {cwd: ROOT}));

// Other commands — probe with safe read-only args (no API yet)
const otherCommands = [
  ['swizzle', '--list'],
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
      execSync('pnpm install --frozen-lockfile 2>/dev/null || true', {cwd: wt, timeout: 60_000});
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

import {createHash} from 'node:crypto';

function sha(obj) {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 12);
}

function summarize(obj) {
  if (!obj) return '(null)';
  if (obj.__parse_error) return '(parse error)';
  if (obj.error) return `error: "${obj.error}"`;
  const d = obj.data;
  if (Array.isArray(d)) return `[${d.length} items]`;
  if (d && typeof d === 'object') {
    if (d.name) return `{name: "${d.name}", ${Object.keys(d).length} keys}`;
    if (d.source) return `{source: ${d.source.length} chars}`;
    const keys = Object.keys(d);
    if (keys.length <= 4) return `{${keys.join(', ')}}`;
    return `{${keys.slice(0, 3).join(', ')}, +${keys.length - 3}}`;
  }
  return String(d).slice(0, 60);
}

let pass = 0;
let fail = 0;
const failures = [];
const apiTypes = new Set();
const cliTypes = new Set();
const cliOnlyTypes = new Set();

// Write full JSON to a file for inspection
const fullOutput = {};

for (const r of results) {
  const cliData = r.cli;
  const apiData = r.api;
  const ct = typeOf(cliData);

  if (!cliData?.error) cliTypes.add(ct);

  let identical;
  if (!apiData) {
    identical = null;
    if (!cliData?.error && cliData?.type) cliOnlyTypes.add(ct);
  } else {
    if (!apiData.error) apiTypes.add(typeOf(apiData));
    identical = deepEqual(apiData, cliData);
  }

  const ok = identical === true || identical === null;
  if (ok) pass++; else {
    fail++;
    failures.push(r);
  }

  const cliHash = sha(cliData);
  const apiHash = apiData ? sha(apiData) : '—';

  console.log('');
  console.log(`${ ok ? 'PASS' : 'FAIL'}  ${r.label}`);
  console.log(`  CLI: type=${ct}  hash=${cliHash}  ${summarize(cliData)}`);
  if (apiData) {
    console.log(`  API: type=${typeOf(apiData)}  hash=${apiHash}  ${summarize(apiData)}`);
  } else {
    console.log(`  API: (no API function — CLI-only command)`);
  }
  if (identical === true) {
    console.log(`  Match: identical (${cliHash})`);
  } else if (identical === false) {
    console.log(`  MISMATCH — CLI and API returned different data:`);
    console.log(`    CLI: ${JSON.stringify(cliData).slice(0, 200)}`);
    console.log(`    API: ${JSON.stringify(apiData).slice(0, 200)}`);
  }

  fullOutput[r.label] = {cli: cliData, api: apiData, identical};
}

// Write full results to file for manual inspection
const outPath = path.join(ROOT, '.parity-test-results.json');
fs.writeFileSync(outPath, JSON.stringify(fullOutput, null, 2));
console.log(`\nFull results written to ${path.relative(ROOT, outPath)}`);

// Coverage check
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
  for (const f of failures) {
    console.log(`\n  ${f.label}`);
    console.log(`    CLI: ${JSON.stringify(f.cli).slice(0, 300)}`);
    console.log(`    API: ${JSON.stringify(f.api).slice(0, 300)}`);
  }
  process.exit(1);
}

console.log('\nAll checks passed.');
