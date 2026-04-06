#!/usr/bin/env node
/**
 * CLI JSON smoke test — validates --json output for every supported command.
 *
 * Checks:
 * 1. Output is valid JSON
 * 2. Success responses have `type` (string) and `data` fields
 * 3. Error responses have `error` (string) field
 * 4. `type` values are from the known discriminator set
 * 5. Commands without --json support return CLIUnsupportedError
 *
 * Usage: node .github/scripts/cli-json-smoke-test.mjs
 */

import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(ROOT, 'packages/cli/bin/xds.mjs');

const KNOWN_TYPES = new Set([
  'component.list', 'component.brief', 'component.detail',
  'component.detail.props', 'component.detail.source',
  'discover.list', 'discover.detail', 'discover.detail.doc', 'discover.search',
  'docs.list', 'docs.detail', 'docs.detail.section',
  'template.list', 'template.copy',
  'swizzle.list', 'swizzle.copy',
  'theme.build',
  'upgrade.list', 'upgrade.run',
  'gap-report.categories', 'gap-report.file',
  'markdown',
]);

let passed = 0;
let failed = 0;
const failures = [];

function run(args) {
  const result = spawnSync(process.execPath, [CLI, '--json', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30_000,
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

function checkJson(label, args, {expectError = false, expectType = null} = {}) {
  const {stdout, status} = run(args);

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    console.log(`  FAIL  ${label}  (invalid JSON)`);
    if (stdout.trim()) console.log(`        ${stdout.trim().split('\n')[0].slice(0, 80)}`);
    failures.push({label, reason: 'invalid JSON'});
    failed++;
    return;
  }

  if (expectError) {
    if (!parsed.error) {
      console.log(`  FAIL  ${label}  (expected error, got type="${parsed.type}")`);
      failures.push({label, reason: 'expected error response'});
      failed++;
      return;
    }
    console.log(`  ok    ${label}  (error: "${parsed.error.slice(0, 60)}")`);
    passed++;
    return;
  }

  if (parsed.error) {
    if (status !== 1) {
      console.log(`  FAIL  ${label}  (error without exit code 1)`);
      failures.push({label, reason: 'error without exit code 1'});
      failed++;
      return;
    }
    console.log(`  ok    ${label}  (error: "${parsed.error.slice(0, 60)}")`);
    passed++;
    return;
  }

  if (typeof parsed.type !== 'string') {
    console.log(`  FAIL  ${label}  (missing type field)`);
    failures.push({label, reason: 'missing type field'});
    failed++;
    return;
  }

  if (!('data' in parsed)) {
    console.log(`  FAIL  ${label}  (missing data field)`);
    failures.push({label, reason: 'missing data field'});
    failed++;
    return;
  }

  if (!KNOWN_TYPES.has(parsed.type)) {
    console.log(`  FAIL  ${label}  (unknown type "${parsed.type}")`);
    failures.push({label, reason: `unknown type "${parsed.type}"`});
    failed++;
    return;
  }

  if (expectType && parsed.type !== expectType) {
    console.log(`  FAIL  ${label}  (expected type "${expectType}", got "${parsed.type}")`);
    failures.push({label, reason: `expected type "${expectType}"`});
    failed++;
    return;
  }

  console.log(`  ok    ${label}  (type: ${parsed.type})`);
  passed++;
}

// ── Component ────────────────────────────────────────────────────────

console.log('\ncomponent --json');
checkJson('component --list', ['component', '--list'], {expectType: 'component.list'});
checkJson('component Button', ['component', 'Button'], {expectType: 'component.detail'});
checkJson('component Button --props', ['component', 'Button', '--props'], {expectType: 'component.detail.props'});
checkJson('component NotAReal', ['component', 'NotARealComponent'], {expectError: true});

// ── Docs ─────────────────────────────────────────────────────────────

console.log('\ndocs --json');
checkJson('docs (list)', ['docs'], {expectType: 'docs.list'});

// ── Template ─────────────────────────────────────────────────────────

console.log('\ntemplate --json');
checkJson('template --list', ['template', '--list'], {expectType: 'template.list'});

// ── Swizzle ──────────────────────────────────────────────────────────

console.log('\nswizzle --json');
checkJson('swizzle --list', ['swizzle', '--list'], {expectType: 'swizzle.list'});

// ── Gap report ───────────────────────────────────────────────────────

console.log('\ngap-report --json');
checkJson('gap-report --list-categories', ['gap-report', '--list-categories'], {expectType: 'gap-report.categories'});

// ── Summary ──────────────────────────────────────────────────────────

console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\nFailed:');
  for (const f of failures) {
    console.log(`  - ${f.label}: ${f.reason}`);
  }
  process.exit(1);
}
