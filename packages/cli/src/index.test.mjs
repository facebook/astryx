// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';

// Subprocess tests for top-level CLI dispatch. These run the real bin so
// we prove the actual process exit code, not a mocked one.
const cliBin = path.resolve(import.meta.dirname, '..', 'bin', 'xds.mjs');

function runCli(args) {
  try {
    const stdout = execFileSync(process.execPath, [cliBin, ...args], {
      env: {...process.env, FORCE_COLOR: '0'},
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return {code: 0, stdout, stderr: ''};
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

describe('xds top-level command dispatch', () => {
  it('exits 0 and prints help when run with no args', () => {
    const {code, stdout} = runCli([]);
    expect(code).toBe(0);
    expect(stdout).toContain('xds');
  });

  it('exits 0 for --help', () => {
    const {code, stdout} = runCli(['--help']);
    expect(code).toBe(0);
    expect(stdout).toContain('Commands');
  });

  it('exits 1 with a clear error for an unknown command', () => {
    const {code, stderr} = runCli(['definitely-not-a-command']);
    expect(code).toBe(1);
    expect(stderr).toContain("unknown command 'definitely-not-a-command'");
  });

  it('does NOT mask an unknown command as exit 0 + help', () => {
    const {code} = runCli(['bogus-subcommand']);
    // Regression guard: commander's default action used to print help and
    // exit 0 for unmatched positionals.
    expect(code).not.toBe(0);
  });

  it('reports the unknown command name (first positional)', () => {
    const {code, stderr} = runCli(['frobnicate', '--json']);
    expect(code).toBe(1);
    expect(stderr).toContain("unknown command 'frobnicate'");
  });
});
