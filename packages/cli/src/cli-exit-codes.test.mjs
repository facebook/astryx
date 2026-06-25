// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end exit-code policy tests.
 *
 * Spawns the CLI as a subprocess and asserts the exit code (and JSON
 * envelope shape, where applicable) for every error path the policy
 * covers. This is the test that catches CI-script-breaking regressions:
 * if a future change accidentally restores `exit 0` on a user-visible
 * error, this file fires.
 *
 * Policy under test (see lib/cli-error.mjs for full doc-block):
 *   - Any user-visible error → exit 1 (both modes).
 *   - Help/version/empty → exit 0.
 *   - --json and non-JSON exit with the same code for the same case.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, '..', 'bin', 'astryx.mjs');

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    timeout: 20_000,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {...process.env, FORCE_COLOR: '0', CI: ''},
  });
}

/** Shorthand for asserting the exit code. */
function expectExit(args, code) {
  const r = runCli(args);
  expect(
    r.status,
    `xds ${args.join(' ')} should exit ${code}, got ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`,
  ).toBe(code);
  return r;
}

/** Parse the stdout of a --json invocation as a JSON envelope. */
function parseEnvelope(r) {
  try {
    return JSON.parse(r.stdout);
  } catch {
    throw new Error(`stdout was not JSON:\n${r.stdout}\n--- stderr ---\n${r.stderr}`);
  }
}

// ─── Error paths: must exit 1 ────────────────────────────────────────────────

describe('exit codes — error paths (human mode → exit 1)', () => {
  it('astryx bogus-cmd → exit 1', () => {
    const r = expectExit(['bogus-cmd'], 1);
    expect(r.stderr).toMatch(/unknown command/i);
  });

  it('astryx theme bogus → exit 1', () => {
    const r = expectExit(['theme', 'bogus'], 1);
    expect(r.stderr).toMatch(/unknown subcommand/i);
  });

  it('astryx component bogus → exit 1', () => {
    const r = expectExit(['component', 'bogus'], 1);
    expect(r.stderr).toMatch(/no component named/i);
  });

  it('astryx hook bogus → exit 1', () => {
    const r = expectExit(['hook', 'bogus'], 1);
    expect(r.stderr).toMatch(/no hook named/i);
  });

  it('astryx docs bogus → exit 1', () => {
    const r = expectExit(['docs', 'bogus'], 1);
    expect(r.stderr).toMatch(/unknown topic/i);
  });

  it('astryx --bogus-flag → exit 1', () => {
    const r = expectExit(['--bogus-flag'], 1);
    // Commander's unknown-option message goes to stderr.
    expect(r.stderr).toMatch(/unknown option/i);
  });
});

describe('exit codes — error paths (--json → exit 1, valid envelope)', () => {
  it('astryx bogus-cmd --json → exit 1, error envelope', () => {
    const r = expectExit(['bogus-cmd', '--json'], 1);
    const env = parseEnvelope(r);
    expect(env.apiVersion).toBe(1);
    expect(env.error).toMatch(/unknown command/i);
  });

  it('astryx component bogus --json → exit 1, error envelope', () => {
    const r = expectExit(['component', 'bogus', '--json'], 1);
    const env = parseEnvelope(r);
    expect(env.apiVersion).toBe(1);
    expect(env.error).toMatch(/no component named/i);
  });

  it('astryx hook bogus --json → exit 1, error envelope', () => {
    const r = expectExit(['hook', 'bogus', '--json'], 1);
    const env = parseEnvelope(r);
    expect(env.apiVersion).toBe(1);
    expect(env.error).toMatch(/no hook named/i);
  });

  it('astryx docs bogus --json → exit 1, error envelope', () => {
    const r = expectExit(['docs', 'bogus', '--json'], 1);
    const env = parseEnvelope(r);
    expect(env.apiVersion).toBe(1);
    expect(env.error).toMatch(/unknown topic/i);
  });
});

// ─── Success paths: must exit 0 (positive controls) ──────────────────────────

describe('exit codes — success paths (exit 0)', () => {
  it('astryx (no args) → exit 0, prints help', () => {
    const r = expectExit([], 0);
    // Help should land on stdout (Commander default for help()).
    expect(r.stdout + r.stderr).toMatch(/Usage:/);
  });

  it('astryx --help → exit 0', () => {
    expectExit(['--help'], 0);
  });

  it('astryx --version → exit 0, prints a version', () => {
    const r = expectExit(['--version'], 0);
    expect(r.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('astryx component (list mode) → exit 0', () => {
    expectExit(['component'], 0);
  });

  it('astryx component Button → exit 0', () => {
    expectExit(['component', 'Button'], 0);
  });

  it('astryx docs (list mode) → exit 0', () => {
    expectExit(['docs'], 0);
  });

  it('astryx theme (no subcommand) → exit 0, shows help', () => {
    // Bare theme without a subcommand is a help-display case → exit 0.
    expectExit(['theme'], 0);
  });

  it('astryx hook (list mode) → exit 0', () => {
    expectExit(['hook'], 0);
  });
});

// ─── Mode parity: same case must exit the same in both modes ────────────────

describe('exit codes — JSON / non-JSON parity', () => {
  const cases = [
    ['bogus-cmd'],
    ['component', 'bogus'],
    ['hook', 'bogus'],
    ['docs', 'bogus'],
  ];

  for (const args of cases) {
    it(`xds ${args.join(' ')} — exit code matches with and without --json`, () => {
      const human = runCli(args);
      const jsonRun = runCli([...args, '--json']);
      expect(jsonRun.status).toBe(human.status);
      expect(jsonRun.status).toBe(1);
    });
  }
});
