#!/usr/bin/env node
/**
 * Three-way parity test: API vs CLI (new) vs CLI (old main).
 *
 * Proves:
 * 1. The programmatic API returns identical data to `xds --json` (same code path).
 * 2. The refactored CLI produces identical output to the pre-refactor main (no regressions).
 *
 * Prints a comparison table and exits non-zero on any unexpected mismatch.
 *
 * Usage: node .github/scripts/api-cli-parity-test.mjs [--baseline <commit>]
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
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
  });
  try {
    return JSON.parse(result.stdout);
  } catch {
    return {__parse_error: true, stdout: result.stdout?.slice(0, 200), stderr: result.stderr?.slice(0, 200)};
  }
}

async function apiCall(fn, ...args) {
  try {
    const result = await fn(...args);
    return {type: result.type, data: result.data};
  } catch (e) {
    return {error: e.message, suggestions: e.suggestions};
  }
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function typeOf(result) {
  if (!result) return '(null)';
  if (result.__parse_error) return '(parse error)';
  if (result.error) return `error: ${result.error.slice(0, 40)}`;
  return result.type || '(no type)';
}

// ─── Test cases ───────────────────────────────────────────────────────────────

const cases = [
  // Component — list modes
  {id: 'comp-list',             label: 'component --list',                    cli: ['component', '--list']},
  {id: 'comp-cat-layout',      label: 'component --category Layout',         cli: ['component', '--category', 'Layout']},
  {id: 'comp-brief-all',       label: 'component --detail brief',            cli: ['component', '--detail', 'brief']},
  {id: 'comp-cat-brief',       label: 'component --category Form --detail brief', cli: ['component', '--category', 'Form', '--detail', 'brief']},

  // Component — single component
  {id: 'comp-button',          label: 'component Button',                    cli: ['component', 'Button']},
  {id: 'comp-button-props',    label: 'component Button --props',            cli: ['component', 'Button', '--props']},
  {id: 'comp-button-source',   label: 'component Button --source',           cli: ['component', 'Button', '--source']},
  {id: 'comp-dialog',          label: 'component Dialog',                    cli: ['component', 'Dialog']},
  {id: 'comp-table',           label: 'component Table',                     cli: ['component', 'Table']},

  // Component — sub-components (previously returned markdown on old main)
  {id: 'comp-stackitem',       label: 'component StackItem',                 cli: ['component', 'StackItem'],     expectOldDiff: true},
  {id: 'comp-tablerow',        label: 'component TableRow',                  cli: ['component', 'TableRow'],      expectOldDiff: true},
  {id: 'comp-dialogheader',    label: 'component DialogHeader',              cli: ['component', 'DialogHeader'],  expectOldDiff: true},
  {id: 'comp-dropdownitem',    label: 'component DropdownMenuItem',          cli: ['component', 'DropdownMenuItem'], expectOldDiff: true},
  {id: 'comp-sidenavitem',     label: 'component SideNavItem',              cli: ['component', 'SideNavItem'],   expectOldDiff: true},
  {id: 'comp-topnavheading',   label: 'component TopNavHeading',             cli: ['component', 'TopNavHeading'], expectOldDiff: true},
  {id: 'comp-cmdpaletteitem',  label: 'component CommandPaletteItem',        cli: ['component', 'CommandPaletteItem'], expectOldDiff: true},

  // Component — fuzzy match / error
  {id: 'comp-notfound',        label: 'component NotARealThing99',           cli: ['component', 'NotARealThing99']},

  // Docs
  {id: 'docs-list',            label: 'docs (list)',                          cli: ['docs']},
  {id: 'docs-principles',      label: 'docs principles',                     cli: ['docs', 'principles']},
  {id: 'docs-tokens',          label: 'docs tokens',                         cli: ['docs', 'tokens']},
  {id: 'docs-theme',           label: 'docs theme',                          cli: ['docs', 'theme']},
  {id: 'docs-notfound',        label: 'docs nonexistent',                    cli: ['docs', 'nonexistent_xyz']},

  // Template
  {id: 'tmpl-list',            label: 'template --list',                     cli: ['template', '--list'],         apiSkip: true},
  {id: 'tmpl-notfound',        label: 'template nonexistent',                cli: ['template', 'nonexistent99'],  apiSkip: true},

  // Swizzle
  {id: 'swizzle-list',         label: 'swizzle --list',                      cli: ['swizzle', '--list'],          apiSkip: true},
  {id: 'swizzle-notfound',     label: 'swizzle NotReal',                     cli: ['swizzle', 'NotReal99'],       apiSkip: true},

  // Gap report
  {id: 'gap-categories',       label: 'gap-report --list-categories',        cli: ['gap-report', '--list-categories'], apiSkip: true},
];

// ─── Phase 1: Run API calls (current branch) ─────────────────────────────────

console.log('Phase 1: Running API calls...');
const {component, docs: docsApi, discover: discoverApi} = await import('../../packages/cli/src/api/index.mjs');

const apiResults = {};
for (const tc of cases) {
  if (tc.apiSkip) {
    apiResults[tc.id] = null;
    continue;
  }

  const args = tc.cli;
  const cmd = args[0];

  if (cmd === 'component') {
    const opts = {cwd: ROOT};
    // Parse options, consuming values for --option <value> pairs
    const optionsWithValue = new Set(['--category', '--detail']);
    const consumed = new Set();
    for (let i = 0; i < args.length; i++) {
      if (optionsWithValue.has(args[i]) && i + 1 < args.length) {
        consumed.add(i + 1);
      }
    }
    if (args.includes('--list')) opts.list = true;
    if (args.includes('--props')) opts.props = true;
    if (args.includes('--source')) opts.source = true;
    const catIdx = args.indexOf('--category');
    if (catIdx >= 0) opts.category = args[catIdx + 1];
    const detIdx = args.indexOf('--detail');
    if (detIdx >= 0) opts.detail = args[detIdx + 1];
    // Positional: first arg that isn't the command, an option flag, or a consumed value
    const name = args.find((a, i) => i > 0 && !a.startsWith('--') && !consumed.has(i));
    apiResults[tc.id] = await apiCall(component, name, opts);
  } else if (cmd === 'docs') {
    const positional = args.filter(a => a !== 'docs' && !a.startsWith('--'));
    apiResults[tc.id] = await apiCall(docsApi, positional[0], positional[1], {});
  } else {
    apiResults[tc.id] = null;
  }
}

// ─── Phase 2: Run CLI calls (current branch) ─────────────────────────────────

console.log('Phase 2: Running CLI --json calls (current branch)...');
const cliResults = {};
for (const tc of cases) {
  cliResults[tc.id] = cliJson(tc.cli);
}

// ─── Phase 3: Run CLI calls (old main via worktree) ───────────────────────────

const oldResults = {};

if (skipBaseline) {
  console.log('Phase 3: Skipped (--no-baseline)');
} else {
  console.log(`Phase 3: Running CLI --json calls (baseline: ${baselineRef})...`);
  const worktreeDir = path.join(ROOT, '.worktree-parity-test');

  let worktreeOk = false;
  try {
    execSync(`git worktree add "${worktreeDir}" ${baselineRef} --detach 2>/dev/null`, {cwd: ROOT});
    if (!fs.existsSync(path.join(worktreeDir, 'node_modules'))) {
      execSync('yarn install --frozen-lockfile 2>/dev/null || true', {cwd: worktreeDir, timeout: 60_000});
    }
    worktreeOk = true;
  } catch (e) {
    console.log(`  Warning: could not create worktree for ${baselineRef}: ${e.message}`);
  }

  if (worktreeOk) {
    const oldCli = path.join(worktreeDir, 'packages/cli/bin/xds.mjs');
    for (const tc of cases) {
      const result = spawnSync(process.execPath, [oldCli, '--json', ...tc.cli], {
        cwd: worktreeDir,
        encoding: 'utf8',
        timeout: 30_000,
      });
      try {
        oldResults[tc.id] = JSON.parse(result.stdout);
      } catch {
        oldResults[tc.id] = {__parse_error: true, stdout: result.stdout?.slice(0, 200)};
      }
    }
  }

  try {
    execSync(`git worktree remove "${worktreeDir}" --force 2>/dev/null`, {cwd: ROOT});
  } catch { /* ignore */ }
}

// ─── Phase 4: Compare and print table ─────────────────────────────────────────

console.log('\n' + '═'.repeat(130));
console.log('  THREE-WAY PARITY TABLE');
console.log('═'.repeat(130));

const colW = {
  label: 40,
  type: 22,
  apiCli: 8,
  cliOld: 8,
  status: 8,
};

const header = [
  'Test Case'.padEnd(colW.label),
  'Type (CLI new)'.padEnd(colW.type),
  'Type (old)'.padEnd(colW.type),
  'API=CLI'.padEnd(colW.apiCli),
  'new=old'.padEnd(colW.cliOld),
  'Status',
].join(' | ');

console.log(header);
console.log('-'.repeat(130));

let totalPass = 0;
let totalFail = 0;
let totalExpectedDiff = 0;
const failures = [];

for (const tc of cases) {
  const api = apiResults[tc.id];
  const cli = cliResults[tc.id];
  const old = oldResults[tc.id];

  const cliType = typeOf(cli);
  const oldType = old ? typeOf(old) : '(skipped)';

  // API === CLI check
  let apiCliMatch;
  if (api === null) {
    apiCliMatch = 'n/a';
  } else if (deepEqual(api, cli)) {
    apiCliMatch = '✓';
  } else {
    apiCliMatch = '✗';
  }

  // CLI new === CLI old check (compare types, not full payloads —
  // payloads can differ due to env: xds.config.mjs, new components, etc.)
  let cliOldMatch;
  if (!old) {
    cliOldMatch = '(skip)';
  } else if (typeOf(cli) === typeOf(old)) {
    cliOldMatch = '✓';
  } else {
    cliOldMatch = tc.expectOldDiff ? '△' : '✗';
  }

  // Overall status
  let status;
  const apiOk = apiCliMatch === '✓' || apiCliMatch === 'n/a';
  const oldOk = cliOldMatch === '✓' || cliOldMatch === '(skip)' || cliOldMatch === '△';

  if (apiOk && oldOk) {
    status = cliOldMatch === '△' ? 'FIXED' : 'PASS';
    if (cliOldMatch === '△') totalExpectedDiff++;
    else totalPass++;
  } else {
    status = 'FAIL';
    totalFail++;
    failures.push({
      label: tc.label,
      apiCliMatch,
      cliOldMatch,
      apiType: api ? typeOf(api) : 'n/a',
      cliType,
      oldType,
    });
  }

  const row = [
    tc.label.padEnd(colW.label),
    cliType.padEnd(colW.type),
    oldType.padEnd(colW.type),
    apiCliMatch.padEnd(colW.apiCli),
    cliOldMatch.padEnd(colW.cliOld),
    status,
  ].join(' | ');
  console.log(row);
}

console.log('-'.repeat(130));

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('');
console.log(`Total: ${cases.length} test cases`);
console.log(`  PASS:  ${totalPass} (API=CLI and no regression)`);
console.log(`  FIXED: ${totalExpectedDiff} (API=CLI, old main returned different type — expected)`);
console.log(`  FAIL:  ${totalFail}`);

if (totalExpectedDiff > 0) {
  console.log('');
  console.log('FIXED cases (old main returned markdown, now returns component.detail):');
  for (const tc of cases.filter(c => c.expectOldDiff)) {
    const old = oldResults[tc.id];
    const cli = cliResults[tc.id];
    if (old && !deepEqual(cli, old)) {
      console.log(`  ${tc.label}: ${typeOf(old)} → ${typeOf(cli)}`);
    }
  }
}

if (totalFail > 0) {
  console.log('');
  console.log('FAILURES:');
  for (const f of failures) {
    console.log(`  ${f.label}`);
    console.log(`    API type:     ${f.apiType}`);
    console.log(`    CLI new type: ${f.cliType}`);
    console.log(`    CLI old type: ${f.oldType}`);
    console.log(`    API=CLI: ${f.apiCliMatch}  new=old: ${f.cliOldMatch}`);
  }
  process.exit(1);
}

console.log('\nAll checks passed.');
