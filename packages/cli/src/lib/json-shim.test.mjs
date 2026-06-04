// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration tests for the JSON shim — extends the --json
 * contract to cover Commander's parse-time short-circuits.
 *
 * Spawns the CLI as a real subprocess so Commander hooks, exitOverride,
 * and process.exit fire end-to-end. Asserts:
 *
 *   1. `--help --json` (root + subcommand) emits a JSON help envelope,
 *      not raw "Usage:" text. Exit 0.
 *   2. Parse errors (missing required arg, unknown option) emit a
 *      JSON error envelope on stdout. Exit 1.
 *   3. Unknown subcommand produces an error envelope (not a help
 *      envelope with exit 0).
 *   4. Invalid `--detail` choice produces a single error envelope
 *      (not error then help).
 *   5. Non-`--json` invocations still print to stderr and exit 1
 *      exactly as before — no regression.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/xds.mjs');

function runCli(args) {
  const res = spawnSync('node', [CLI_BIN, ...args], {
    encoding: 'utf-8',
    timeout: 20_000,
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

function parseJson(stdout) {
  return JSON.parse(stdout);
}

describe('--json shim: --help renders JSON envelope', () => {
  it('xds --help --json emits a help envelope (not raw text), exit 0', () => {
    const {status, stdout, stderr} = runCli(['--help', '--json']);
    expect(status).toBe(0);
    expect(stderr).toBe('');
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('help');
    expect(parsed.data).toBeDefined();
    expect(parsed.data.command).toBe('xds');
    // Should list known subcommands
    const subNames = parsed.data.subcommands.map((s) => s.name);
    expect(subNames).toContain('component');
    expect(subNames).toContain('theme');
  });

  it('xds component --help --json emits a subcommand help envelope', () => {
    const {status, stdout} = runCli(['component', '--help', '--json']);
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('help');
    expect(parsed.data.command).toBe('xds component');
    // Should expose its options
    const flags = parsed.data.options.map((o) => o.flags);
    expect(flags).toContain('--list');
  });

  it('xds theme build --help --json emits a nested subcommand help envelope', () => {
    const {status, stdout} = runCli(['theme', 'build', '--help', '--json']);
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('help');
    expect(parsed.data.command).toBe('xds theme build');
    expect(parsed.data.usage).toMatch(/<file>/);
  });
});

describe('--json shim: parse errors emit JSON error envelope', () => {
  it('xds theme build --json (missing required arg) emits error envelope, exit 1', () => {
    const {status, stdout} = runCli(['theme', 'build', '--json']);
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.error).toMatch(/missing required argument/i);
    expect(parsed.error).toMatch(/file/i);
  });

  it('xds --bogus-flag --json (unknown option) emits error envelope, exit 1', () => {
    const {status, stdout} = runCli(['--bogus-flag', '--json']);
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.error).toMatch(/unknown option/i);
    expect(parsed.error).toMatch(/--bogus-flag/);
  });

  it('xds component --json --bogus-flag (unknown option on subcmd) emits error envelope, exit 1', () => {
    const {status, stdout} = runCli(['component', '--json', '--bogus-flag']);
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.error).toMatch(/unknown option/i);
  });
});

describe('--json shim: unknown subcommand emits error envelope', () => {
  it('xds bogus-cmd --json emits error envelope, exit 1 (not exit 0 + help)', () => {
    const {status, stdout} = runCli(['bogus-cmd', '--json']);
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.error).toMatch(/unknown command/i);
    expect(parsed.error).toMatch(/bogus-cmd/);
    // Suggestions should list known commands
    expect(Array.isArray(parsed.suggestions)).toBe(true);
    const names = parsed.suggestions.map((s) => s.name);
    expect(names).toContain('component');
  });
});

describe('--json shim: invalid --detail choice', () => {
  it('xds --detail bogus --json emits a single error envelope, exit 1', () => {
    const {status, stdout} = runCli(['--detail', 'bogus', '--json']);
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.error).toMatch(/--detail/);
    expect(parsed.error).toMatch(/invalid|allowed/i);
    // Single emission only — stdout must be exactly one JSON document.
    // (parseJson would have thrown if there were two concatenated docs.)
    // Belt-and-suspenders: count opening braces at column 0.
    const topLevelBraces = stdout.split('\n').filter((l) => l === '{').length;
    expect(topLevelBraces).toBe(1);
  });
});

describe('--json shim: non-JSON behavior is preserved', () => {
  it('xds theme build (no --json, missing arg) writes to stderr and exits 1', () => {
    const {status, stdout, stderr} = runCli(['theme', 'build']);
    expect(status).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/missing required argument/i);
  });

  it('xds --bogus-flag (no --json) writes to stderr and exits 1', () => {
    const {status, stdout, stderr} = runCli(['--bogus-flag']);
    expect(status).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/unknown option/i);
  });

  it('xds bogus-cmd (no --json) writes to stderr and exits 1', () => {
    const {status, stdout, stderr} = runCli(['bogus-cmd']);
    expect(status).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/unknown command/i);
  });

  it('xds --detail bogus (no --json) writes to stderr and exits 1', () => {
    const {status, stdout, stderr} = runCli(['--detail', 'bogus']);
    expect(status).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/--detail/);
  });

  it('xds --help (no --json) writes raw help text to stdout, exit 0', () => {
    const {status, stdout, stderr} = runCli(['--help']);
    expect(status).toBe(0);
    expect(stdout).toMatch(/^Usage: xds/);
    expect(stderr).toBe('');
  });
});

describe('--json shim: stdout discipline under --json', () => {
  it('all error envelopes have empty stderr (no leak of legacy "error: ..." line)', () => {
    const cases = [
      ['theme', 'build', '--json'],
      ['--bogus-flag', '--json'],
      ['bogus-cmd', '--json'],
      ['--detail', 'bogus', '--json'],
    ];
    for (const args of cases) {
      const {stderr} = runCli(args);
      expect(stderr, `stderr should be empty for: ${args.join(' ')}`).toBe('');
    }
  });
});
