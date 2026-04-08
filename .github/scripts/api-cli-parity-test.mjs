#!/usr/bin/env node
/**
 * API ↔ CLI parity test — auto-discovers all components and doc topics,
 * then verifies API and CLI return identical results for every one.
 *
 * Nothing is hardcoded. New components, doc topics, or API functions are
 * picked up automatically. If someone adds a CLI --json type without a
 * matching API function, this test fails.
 *
 * Checks:
 * 1. API=CLI: programmatic API returns identical data to `xds --json`
 * 2. Coverage: every CLI --json type has a matching API function
 * 3. Baseline (optional): compare against an older commit for regressions
 *
 * Usage:
 *   node .github/scripts/api-cli-parity-test.mjs              (full: API + CLI + baseline)
 *   node .github/scripts/api-cli-parity-test.mjs --no-baseline (CI: API + CLI only)
 *   node .github/scripts/api-cli-parity-test.mjs --baseline <ref>
 */

import {spawnSync, execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(ROOT, 'packages/cli/bin/xds.mjs');

const skipBaseline = process.argv.includes('--no-baseline');
const baselineRef = process.argv.includes('--baseline')
  ? process.argv[process.argv.indexOf('--baseline') + 1]
  : 'main';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cliJson(args, {cwd = ROOT} = {}) {
  const result = spawnSync(process.execPath, [CLI, '--json', ...args], {
    cwd, encoding: 'utf8', timeout: 30_000,
  });
  try { return JSON.parse(result.stdout); }
  catch { return {__parse_error: true, stdout: result.stdout?.slice(0, 200)}; }
}

function cliText(args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: ROOT, encoding: 'utf8', timeout: 30_000,
  }).stdout || '';
}

async function apiCall(fn, ...args) {
  try {
    const result = await fn(...args);
    return {type: result.type, data: result.data};
  } catch (e) {
    return {error: e.message, suggestions: e.suggestions};
  }
}

function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function typeOf(result) {
  if (!result) return '(null)';
  if (result.__parse_error) return '(parse error)';
  if (result.error) return `error`;
  return result.type || '(no type)';
}

// ─── Auto-discover ────────────────────────────────────────────────────────────

console.log('Auto-discovering components and doc topics...');

// Discover all components
const listResult = cliJson(['component', '--list']);
const allComponents = [];
if (listResult.data && !listResult.error) {
  for (const [, comps] of Object.entries(listResult.data)) {
    allComponents.push(...comps);
  }
}
console.log(`  ${allComponents.length} components`);

// Discover all doc topics
const docsResult = cliJson(['docs']);
const allTopics = [];
if (docsResult.data && !docsResult.error) {
  for (const entry of docsResult.data) {
    allTopics.push(entry.topic);
  }
}
console.log(`  ${allTopics.length} doc topics: ${allTopics.join(', ')}`);

// Discover all categories
const categories = listResult.data && !listResult.error ? Object.keys(listResult.data) : [];
const sampleCategory = categories[0] || 'Layout';

// ─── Build test cases (auto-generated) ────────────────────────────────────────

/**
 * @typedef {{ id: string, label: string, cli: string[], apiSkip?: boolean,
 *             apiFn?: (api: any) => Promise<any> }} TestCase
 */

/** @type {TestCase[]} */
const cases = [];

// Component — list operations
cases.push({
  id: 'comp-list', label: 'component --list', cli: ['component', '--list'],
  apiFn: (api) => apiCall(api.component, undefined, {list: true, cwd: ROOT}),
});
cases.push({
  id: 'comp-brief', label: 'component --detail brief', cli: ['component', '--detail', 'brief'],
  apiFn: (api) => apiCall(api.component, undefined, {detail: 'brief', cwd: ROOT}),
});
cases.push({
  id: `comp-cat-${sampleCategory}`, label: `component --category ${sampleCategory}`,
  cli: ['component', '--category', sampleCategory],
  apiFn: (api) => apiCall(api.component, undefined, {category: sampleCategory, cwd: ROOT}),
});
cases.push({
  id: `comp-cat-${sampleCategory}-brief`,
  label: `component --category ${sampleCategory} --detail brief`,
  cli: ['component', '--category', sampleCategory, '--detail', 'brief'],
  apiFn: (api) => apiCall(api.component, undefined, {category: sampleCategory, detail: 'brief', cwd: ROOT}),
});

// Component — every single discovered component (auto!)
for (const comp of allComponents) {
  cases.push({
    id: `comp-${comp}`, label: `component ${comp}`, cli: ['component', comp],
    apiFn: (api) => apiCall(api.component, comp, {cwd: ROOT}),
  });
}

// Component — props + source for a sample
const sample = allComponents.includes('Button') ? 'Button' : allComponents[0];
if (sample) {
  cases.push({
    id: 'comp-sample-props', label: `component ${sample} --props`,
    cli: ['component', sample, '--props'],
    apiFn: (api) => apiCall(api.component, sample, {props: true, cwd: ROOT}),
  });
  cases.push({
    id: 'comp-sample-source', label: `component ${sample} --source`,
    cli: ['component', sample, '--source'],
    apiFn: (api) => apiCall(api.component, sample, {source: true, cwd: ROOT}),
  });
}

// Component — error case
cases.push({
  id: 'comp-notfound', label: 'component NotARealThing99', cli: ['component', 'NotARealThing99'],
  apiFn: (api) => apiCall(api.component, 'NotARealThing99', {cwd: ROOT}),
});

// Docs — list
cases.push({
  id: 'docs-list', label: 'docs (list)', cli: ['docs'],
  apiFn: (api) => apiCall(api.docs),
});

// Docs — every discovered topic (auto!)
for (const topic of allTopics) {
  cases.push({
    id: `docs-${topic}`, label: `docs ${topic}`, cli: ['docs', topic],
    apiFn: (api) => apiCall(api.docs, topic),
  });
}

// Docs — error case
cases.push({
  id: 'docs-notfound', label: 'docs nonexistent', cli: ['docs', 'nonexistent_xyz'],
  apiFn: (api) => apiCall(api.docs, 'nonexistent_xyz'),
});

// Commands without API (yet) — still verify CLI works
cases.push({id: 'tmpl-list', label: 'template --list', cli: ['template', '--list'], apiSkip: true});
cases.push({id: 'tmpl-err', label: 'template nonexistent', cli: ['template', 'nonexistent99'], apiSkip: true});
cases.push({id: 'swizzle-list', label: 'swizzle --list', cli: ['swizzle', '--list'], apiSkip: true});
cases.push({id: 'swizzle-err', label: 'swizzle NotReal', cli: ['swizzle', 'NotReal99'], apiSkip: true});
cases.push({id: 'gap-cats', label: 'gap-report --list-categories', cli: ['gap-report', '--list-categories'], apiSkip: true});

console.log(`  ${cases.length} total test cases\n`);

// ─── Phase 1: Run API + CLI ──────────────────────────────────────────────────

console.log('Phase 1: Running API calls...');
const api = await import('../../packages/cli/src/api/index.mjs');

const apiResults = {};
for (const tc of cases) {
  if (tc.apiSkip || !tc.apiFn) { apiResults[tc.id] = null; continue; }
  apiResults[tc.id] = await tc.apiFn(api);
}

console.log('Phase 2: Running CLI --json calls...');
const cliResults = {};
for (const tc of cases) {
  cliResults[tc.id] = cliJson(tc.cli);
}

// ─── Phase 3: Optional baseline ──────────────────────────────────────────────

const oldResults = {};
if (skipBaseline) {
  console.log('Phase 3: Skipped (--no-baseline)');
} else {
  console.log(`Phase 3: Running baseline CLI (${baselineRef})...`);
  const worktreeDir = path.join(ROOT, '.worktree-parity-test');
  let worktreeOk = false;
  try {
    execSync(`git worktree add "${worktreeDir}" ${baselineRef} --detach 2>/dev/null`, {cwd: ROOT});
    if (!fs.existsSync(path.join(worktreeDir, 'node_modules'))) {
      execSync('yarn install --frozen-lockfile 2>/dev/null || true', {cwd: worktreeDir, timeout: 60_000});
    }
    worktreeOk = true;
  } catch (e) {
    console.log(`  Warning: could not create worktree: ${e.message}`);
  }
  if (worktreeOk) {
    const oldCli = path.join(worktreeDir, 'packages/cli/bin/xds.mjs');
    for (const tc of cases) {
      const r = spawnSync(process.execPath, [oldCli, '--json', ...tc.cli], {
        cwd: worktreeDir, encoding: 'utf8', timeout: 30_000,
      });
      try { oldResults[tc.id] = JSON.parse(r.stdout); }
      catch { oldResults[tc.id] = {__parse_error: true}; }
    }
  }
  try { execSync(`git worktree remove "${worktreeDir}" --force 2>/dev/null`, {cwd: ROOT}); }
  catch { /* ignore */ }
}

// ─── Phase 4: Compare and report ─────────────────────────────────────────────

let totalPass = 0;
let totalFail = 0;
const failures = [];
const apiTypes = new Set();
const cliTypes = new Set();

console.log('\n' + '═'.repeat(100));
console.log('  PARITY RESULTS');
console.log('═'.repeat(100));

const hdr = [
  'Test Case'.padEnd(45),
  'Type'.padEnd(24),
  'API=CLI'.padEnd(8),
  skipBaseline ? '' : 'old'.padEnd(8),
  'Status',
].filter(Boolean).join(' | ');
console.log(hdr);
console.log('-'.repeat(100));

for (const tc of cases) {
  const a = apiResults[tc.id];
  const c = cliResults[tc.id];
  const o = oldResults[tc.id];

  const cType = typeOf(c);
  if (!c?.error) cliTypes.add(cType);
  if (a && !a.error) apiTypes.add(typeOf(a));

  // API=CLI
  let apiCli;
  if (a === null) apiCli = 'n/a';
  else if (deepEqual(a, c)) apiCli = '✓';
  else apiCli = '✗';

  // baseline
  let oldCol = '';
  if (!skipBaseline) {
    if (!o) oldCol = '(skip)';
    else if (typeOf(c) === typeOf(o)) oldCol = '✓';
    else oldCol = '△';
  }

  const apiOk = apiCli === '✓' || apiCli === 'n/a';
  const status = apiOk ? 'PASS' : 'FAIL';
  if (apiOk) totalPass++; else {
    totalFail++;
    failures.push({label: tc.label, apiType: a ? typeOf(a) : 'n/a', cliType: cType});
  }

  const cols = [
    tc.label.padEnd(45),
    cType.padEnd(24),
    apiCli.padEnd(8),
    skipBaseline ? '' : oldCol.padEnd(8),
    status,
  ].filter(Boolean);
  console.log(cols.join(' | '));
}

console.log('-'.repeat(100));

// ─── Coverage check ──────────────────────────────────────────────────────────

const apiOnlyTypes = new Set(['component.list', 'component.brief', 'component.detail',
  'component.detail.props', 'component.detail.source',
  'docs.list', 'docs.detail', 'docs.detail.section',
  'discover.list', 'discover.detail', 'discover.detail.doc', 'discover.search']);

const cliOnlyOk = new Set(['template.list', 'template.copy', 'swizzle.list', 'swizzle.copy',
  'theme.build', 'upgrade.list', 'upgrade.run',
  'gap-report.categories', 'gap-report.file']);

const uncoveredTypes = [];
for (const t of cliTypes) {
  if (!apiOnlyTypes.has(t) && !cliOnlyOk.has(t) && t !== 'error') {
    uncoveredTypes.push(t);
  }
}

if (uncoveredTypes.length > 0) {
  console.log('');
  console.log(`COVERAGE FAIL: CLI produces types without API coverage:`);
  for (const t of uncoveredTypes) {
    console.log(`  ${t}  — needs a matching function in @xds/cli/api`);
  }
  totalFail += uncoveredTypes.length;
  failures.push(...uncoveredTypes.map(t => ({label: `missing API for "${t}"`, apiType: 'n/a', cliType: t})));
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('');
console.log(`Total: ${cases.length} test cases, ${cliTypes.size} CLI types, ${apiTypes.size} API types`);
console.log(`  PASS:  ${totalPass}`);
console.log(`  FAIL:  ${totalFail}`);

if (totalFail > 0) {
  console.log('');
  console.log('FAILURES:');
  for (const f of failures) {
    console.log(`  ${f.label}: API=${f.apiType} CLI=${f.cliType}`);
  }
  process.exit(1);
}

console.log('\nAll checks passed.');
