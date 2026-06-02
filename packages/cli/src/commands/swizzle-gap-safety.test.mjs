// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * End-to-end safety tests for `xds swizzle --gap` and `xds gap-report`.
 *
 * Critical: these tests must NEVER actually invoke `gh issue create`. We
 * defend in depth:
 *
 *   1. We spawn the CLI in a non-TTY pipe → triggers the dry-run gate.
 *   2. We set XDS_GAP_REPORT=off as an extra belt-and-suspenders for tests
 *      that would otherwise risk filing.
 *   3. We unset GH_TOKEN so that any unexpected `gh` invocation fails fast.
 *   4. We put a sabotaged `gh` shim earlier on PATH that blocks real
 *      `gh issue create` calls and writes a marker file. Any successful
 *      "filing" path leaves a marker we can assert against — so a regression
 *      is detected even if the gate silently breaks.
 *
 * Regression cases for issues #2370 and #2371: real gap-report issues filed
 * unintentionally during a verification run because the non-interactive path
 * called `gh issue create` with no confirmation.
 */

import {describe, it, expect, beforeAll, afterAll, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliBin = path.resolve(__dirname, '../../bin/xds.mjs');
const repoRoot = path.resolve(__dirname, '../../../..');

let shimDir;
let markerFile;
let baseEnv;

beforeAll(() => {
  shimDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-gh-shim-'));
  markerFile = path.join(shimDir, 'gh-issue-create-was-called.marker');

  // Sabotaged `gh` shim. Records ONLY `gh issue create` invocations to the
  // marker file, since that's the only command we want to detect as a
  // "would-have-filed" event. Other subcommands (auth status, label create)
  // succeed silently so they don't break the gh availability check or the
  // label-ensure path.
  const shim = `#!/usr/bin/env node
import * as fs from 'node:fs';
const args = process.argv.slice(2);
const isIssueCreate = args[0] === 'issue' && args[1] === 'create';
if (isIssueCreate) {
  fs.appendFileSync(${JSON.stringify(markerFile)}, JSON.stringify(args) + '\\n');
  process.stderr.write('TEST GUARD: real gh issue create blocked\\n');
  process.exit(1);
}
// Other commands (auth status, label create) succeed silently.
process.exit(0);
`;
  fs.writeFileSync(path.join(shimDir, 'gh'), shim);
  fs.chmodSync(path.join(shimDir, 'gh'), 0o755);

  baseEnv = {
    ...process.env,
    PATH: `${shimDir}:${process.env.PATH}`,
    // Belt-and-suspenders: even if a gate breaks, this disables the feature.
    // For tests that need the feature on, individual cases override this.
    GH_TOKEN: '',
  };
});

afterAll(() => {
  fs.rmSync(shimDir, {recursive: true, force: true});
});

function runXds(args, {env = {}, cwd = repoRoot} = {}) {
  // Reset marker for each run.
  if (fs.existsSync(markerFile)) fs.unlinkSync(markerFile);
  const result = spawnSync('node', [cliBin, ...args], {
    cwd,
    env: {...baseEnv, ...env},
    encoding: 'utf-8',
  });
  return {
    ...result,
    // True iff the CLI tried to call `gh issue create` — the actual filing
    // operation. Other gh subcommands (auth status, label create) are
    // ignored as benign.
    ghWasCalled: fs.existsSync(markerFile),
    ghCallArgs: fs.existsSync(markerFile)
      ? fs.readFileSync(markerFile, 'utf-8')
      : null,
  };
}

describe('gap-report: dry-run by default in non-interactive mode', () => {
  it('non-TTY pipe with all required flags → dry-run, exit 0, no gh call', () => {
    const r = runXds([
      'gap-report',
      '--component',
      'Button',
      '--category',
      'missing_variant',
      '--reason',
      'Test that we never file in non-interactive mode',
    ]);
    expect(r.status).toBe(0);
    expect(r.ghWasCalled).toBe(false);
    expect(r.stdout).toMatch(/dry-run/i);
    expect(r.stdout).toMatch(/Re-run with --commit/i);
    // Preview should include the title we'd file.
    expect(r.stdout).toContain('Button');
  });

  it('--json mode in non-TTY → structured dry-run JSON, no gh call', () => {
    const r = runXds([
      '--json',
      'gap-report',
      '--component',
      'Button',
      '--category',
      'missing_variant',
      '--reason',
      'JSON dry-run',
    ]);
    expect(r.status).toBe(0);
    expect(r.ghWasCalled).toBe(false);
    // jsonOut pretty-prints across multiple lines; parse the whole stdout
    // as JSON (after stripping any trailing whitespace).
    const parsed = JSON.parse(r.stdout.trim());
    expect(parsed.type).toBe('gap-report.dryRun');
    expect(parsed.data.dryRun).toBe(true);
    expect(parsed.data.title).toContain('Button');
    expect(parsed.data.wouldFile).toBe(true);
  });

  it('XDS_GAP_REPORT=off → no gh call, even with --commit flag', () => {
    const r = runXds(
      [
        'gap-report',
        '--component',
        'Button',
        '--category',
        'other',
        '--reason',
        'should be disabled',
        '--commit',
      ],
      {env: {XDS_GAP_REPORT: 'off'}},
    );
    // Should exit 0 with a "disabled" message; never calls gh.
    expect(r.ghWasCalled).toBe(false);
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).toMatch(/disabled/i);
  });

  it('--commit in non-TTY mode WOULD invoke gh (verified via shim)', () => {
    // This proves --commit actually engages the file path. Our shim exits 1
    // so the CLI will report failure, but the marker proves gh was invoked
    // with the expected args.
    const r = runXds(
      [
        'gap-report',
        '--component',
        'Button',
        '--category',
        'other',
        '--reason',
        'commit flag should engage filing',
        '--commit',
      ],
      {env: {XDS_GAP_REPORT: ''}}, // re-enable feature; shim will block real call
    );
    expect(r.ghWasCalled).toBe(true);
    expect(r.ghCallArgs).toContain('issue');
    expect(r.ghCallArgs).toContain('create');
    expect(r.ghCallArgs).toContain('facebookexperimental/xds');
  });
});

describe('swizzle --gap respects safety gates', () => {
  // swizzle's --output is path-safety guarded: absolute paths and `..`
  // traversal are rejected (see swizzle.path-safety.test.mjs). These gap
  // tests only care about the gh-call / status gates, so they write into a
  // *relative* output dir created under the repo root (a valid, in-root
  // target) and clean it up afterward. The CLI still resolves @xds/core via
  // findCoreDir walking up from the cwd.
  let swizzleOutDir;
  beforeEach(() => {
    swizzleOutDir = fs.mkdtempSync(path.join(repoRoot, '.xds-swizzle-gap-test-'));
  });
  afterEach(() => {
    if (swizzleOutDir) fs.rmSync(swizzleOutDir, {recursive: true, force: true});
  });
  // Relative path into the temp dir, so it passes the path-safety guard
  // (cwd === repoRoot for runXds by default).
  const relOut = () => path.relative(repoRoot, swizzleOutDir);

  it('swizzle --gap in non-TTY → dry-run, no gh call', () => {
    const r = runXds([
      'swizzle',
      'Button',
      '--output',
      relOut(),
      '--gap',
      'Need a compact variant',
      '--gap-category',
      'missing_variant',
    ]);
    expect(r.ghWasCalled).toBe(false);
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/dry-run/i);
  });

  it('swizzle --gap --no-report → never engages gap reporting at all', () => {
    const r = runXds([
      'swizzle',
      'Button',
      '--output',
      relOut(),
      '--gap',
      'Should be suppressed entirely',
      '--gap-category',
      'missing_variant',
      '--no-report',
    ]);
    expect(r.ghWasCalled).toBe(false);
    expect(r.status).toBe(0);
    // Should not even show a dry-run preview — reporting is suppressed.
    expect(r.stdout).toMatch(/suppressed/i);
    expect(r.stdout).not.toMatch(/Would file GitHub issue/i);
  });

  it('swizzle --gap --no-report --commit → STILL no gh call (no-report wins)', () => {
    // Critical regression test: --no-report must beat --commit for the
    // --gap auto-file path. Otherwise CI scripts could file issues.
    const r = runXds(
      [
        'swizzle',
        'Button',
        '--output',
        relOut(),
        '--gap',
        'should never file',
        '--gap-category',
        'other',
        '--no-report',
        '--commit',
      ],
      {env: {XDS_GAP_REPORT: ''}},
    );
    expect(r.ghWasCalled).toBe(false);
    expect(r.status).toBe(0);
  });

  it('swizzle --gap with XDS_GAP_REPORT=off → no gh call', () => {
    const r = runXds(
      [
        'swizzle',
        'Button',
        '--output',
        relOut(),
        '--gap',
        'should be disabled by env',
        '--gap-category',
        'other',
        '--commit',
      ],
      {env: {XDS_GAP_REPORT: 'off'}},
    );
    expect(r.ghWasCalled).toBe(false);
    expect(r.status).toBe(0);
  });
});
