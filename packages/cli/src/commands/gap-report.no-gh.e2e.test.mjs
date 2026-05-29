// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * End-to-end PROOF that `xds gap-report` never shells out to `gh` in
 * non-interactive (dry-run-by-default) contexts.
 *
 * The unit suite in gap-report.test.mjs asserts the *logic* of
 * `shouldActuallyFile`. That is necessary but not sufficient: a future
 * refactor could call `gh` before consulting that gate, and the unit
 * tests would still pass. This suite closes that gap by running the
 * real CLI binary as a subprocess with a hostile `gh` shim placed FIRST
 * on PATH. The shim drops a sentinel file and exits non-zero whenever it
 * is invoked. If gap-report touches `gh` at all, the sentinel appears
 * and/or the process fails — either way the test fails loudly.
 *
 * Regression guard for #2370 / #2371 (gap-report issues filed in CI).
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..', '..');
const cliBin = path.join(repoRoot, 'packages', 'cli', 'bin', 'xds.mjs');

describe('gap-report never invokes gh in non-interactive mode (e2e)', () => {
  let shimDir;
  let sentinel;

  beforeAll(() => {
    shimDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gap-report-gh-shim-'));
    sentinel = path.join(shimDir, 'gh-was-invoked');
    // A fake `gh` that records every invocation and fails hard. If
    // gap-report calls it, the sentinel exists and exit code is 87.
    const ghShim = path.join(shimDir, 'gh');
    fs.writeFileSync(
      ghShim,
      [
        '#!/usr/bin/env bash',
        `echo "$@" >> "${sentinel}"`,
        'echo "FAKE GH INVOKED: $*" >&2',
        'exit 87',
      ].join('\n') + '\n',
    );
    fs.chmodSync(ghShim, 0o755);
  });

  afterAll(() => {
    if (shimDir) fs.rmSync(shimDir, {recursive: true, force: true});
  });

  function runGapReport(args, extraEnv = {}) {
    // Force non-TTY by piping stdio (default for execFileSync). Put the
    // shim FIRST on PATH so a bare `gh` resolves to it.
    const env = {
      ...process.env,
      PATH: `${shimDir}${path.delimiter}${process.env.PATH}`,
      FORCE_COLOR: '0',
      CI: '', // exercise the non-TTY-by-pipe path, not just CI=true
      ...extraEnv,
    };
    let stdout = '';
    let status = 0;
    try {
      stdout = execFileSync(process.execPath, [cliBin, ...args], {
        env,
        stdio: 'pipe',
        encoding: 'utf-8',
      });
    } catch (err) {
      status = err.status ?? 1;
      stdout = (err.stdout || '') + (err.stderr || '');
    }
    return {stdout, status};
  }

  function assertGhUntouched() {
    expect(
      fs.existsSync(sentinel),
      sentinel && fs.existsSync(sentinel)
        ? `gh was invoked: ${fs.readFileSync(sentinel, 'utf-8')}`
        : 'gh was not invoked',
    ).toBe(false);
  }

  it('non-interactive dry-run (piped, no --commit) does not call gh and exits 0', () => {
    const {status} = runGapReport([
      'gap-report',
      '--component',
      'Tooltip',
      '--category',
      'missing_component',
      '--reason',
      'no tooltip component exists',
    ]);
    expect(status).toBe(0);
    assertGhUntouched();
  });

  it('--json non-interactive emits a dryRun envelope without calling gh', () => {
    const {stdout, status} = runGapReport([
      '--json',
      'gap-report',
      '--component',
      'Tooltip',
      '--category',
      'missing_component',
      '--reason',
      'no tooltip component exists',
    ]);
    expect(status).toBe(0);
    assertGhUntouched();
    // Output must be a clean JSON envelope; gh stderr would corrupt it.
    const parsed = JSON.parse(stdout.trim());
    expect(parsed.type).toBe('gap-report.dryRun');
    expect(parsed.data.dryRun).toBe(true);
  });

  it('XDS_GAP_REPORT=off short-circuits before any gh contact (even with --commit)', () => {
    const {status} = runGapReport(
      [
        'gap-report',
        '--commit',
        '--component',
        'Tooltip',
        '--category',
        'missing_component',
        '--reason',
        'disabled path',
      ],
      {XDS_GAP_REPORT: 'off'},
    );
    // Disabled mode prints a hint and exits cleanly; gh untouched.
    expect(status).toBe(0);
    assertGhUntouched();
  });

  it('--list-categories never touches gh', () => {
    const {status} = runGapReport(['gap-report', '--list-categories']);
    expect(status).toBe(0);
    assertGhUntouched();
  });
});
