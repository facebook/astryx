// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the stable error-code contract.
 *
 * Two layers:
 *
 *   1. Unit — the taxonomy itself: every code is a non-empty, unique,
 *      stable string; the object is frozen; helpers behave.
 *
 *   2. End-to-end — spawn the CLI as a subprocess and assert that
 *      representative error paths emit the right `code` in their JSON
 *      envelope. Spawning is the only way to exercise Commander hooks,
 *      the json-shim, and the bin error boundary together.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ERROR_CODES, isErrorCode, allErrorCodes} from './error-codes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/xds.mjs');

function runCli(args, {cwd} = {}) {
  const res = spawnSync('node', [CLI_BIN, ...args], {
    cwd: cwd || process.cwd(),
    encoding: 'utf-8',
    timeout: 20_000,
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

/** Parse the JSON envelope from stdout. Throws if stdout isn't clean JSON. */
function envelope(stdout) {
  return JSON.parse(stdout);
}

describe('error-codes taxonomy', () => {
  it('every code is a non-empty string', () => {
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      // Key and value must match — the object is a string enum.
      expect(value).toBe(key);
    }
  });

  it('every code follows the ERR_ naming convention', () => {
    for (const value of Object.values(ERROR_CODES)) {
      expect(value).toMatch(/^ERR_[A-Z0-9_]+$/);
    }
  });

  it('all codes are unique', () => {
    const values = Object.values(ERROR_CODES);
    expect(new Set(values).size).toBe(values.length);
  });

  it('includes the generic fallback', () => {
    expect(ERROR_CODES.ERR_UNKNOWN).toBe('ERR_UNKNOWN');
  });

  it('the taxonomy object is frozen (codes are stable, append-only)', () => {
    expect(Object.isFrozen(ERROR_CODES)).toBe(true);
    expect(() => {
      // @ts-expect-error - intentional mutation attempt
      ERROR_CODES.ERR_NEW = 'ERR_NEW';
    }).toThrow();
    expect(ERROR_CODES.ERR_NEW).toBeUndefined();
  });

  it('isErrorCode recognizes known codes and rejects others', () => {
    expect(isErrorCode('ERR_UNKNOWN_COMPONENT')).toBe(true);
    expect(isErrorCode('ERR_UNKNOWN')).toBe(true);
    expect(isErrorCode('ERR_NOT_A_REAL_CODE')).toBe(false);
    expect(isErrorCode('')).toBe(false);
    expect(isErrorCode(42)).toBe(false);
    expect(isErrorCode(undefined)).toBe(false);
  });

  it('allErrorCodes returns the sorted, complete set', () => {
    const codes = allErrorCodes();
    expect(codes.length).toBe(Object.keys(ERROR_CODES).length);
    expect(codes).toEqual([...codes].sort());
    expect(codes).toContain('ERR_UNKNOWN');
    expect(codes).toContain('ERR_UNKNOWN_COMPONENT');
  });
});

describe('error codes: end-to-end JSON envelopes', () => {
  const cases = [
    {name: 'unknown component', args: ['component', 'Bogus', '--json'], code: 'ERR_UNKNOWN_COMPONENT'},
    {name: 'unknown hook', args: ['hook', 'bogusHook', '--json'], code: 'ERR_UNKNOWN_HOOK'},
    {name: 'unknown topic', args: ['docs', 'bogusTopic', '--json'], code: 'ERR_UNKNOWN_TOPIC'},
    {name: 'unknown template', args: ['template', 'bogusTemplate', '--json'], code: 'ERR_UNKNOWN_TEMPLATE'},
    {name: 'unknown command', args: ['bogus-cmd', '--json'], code: 'ERR_UNKNOWN_COMMAND'},
    {name: 'invalid --lang', args: ['docs', 'color', '--lang', 'fr', '--json'], code: 'ERR_INVALID_LANG'},
    {name: 'invalid --detail', args: ['docs', 'color', '--detail', 'bogus', '--json'], code: 'ERR_INVALID_DETAIL'},
    {name: 'unknown option', args: ['component', 'Button', '--bogus-flag', '--json'], code: 'ERR_INVALID_OPTION'},
    {name: 'missing argument', args: ['theme', 'build', '--json'], code: 'ERR_MISSING_ARGUMENT'},
    // `theme` is not on the --json allowlist, so --json on any theme subcommand
    // is rejected at the preAction gate with a stable invalid-option code.
    {name: 'json not supported', args: ['theme', 'bogus-sub', '--json'], code: 'ERR_INVALID_OPTION'},
  ];

  for (const {name, args, code} of cases) {
    it(`${name} → ${code}`, () => {
      const {status, stdout} = runCli(args);
      expect(status).toBe(1);
      const env = envelope(stdout);
      expect(env).toHaveProperty('apiVersion');
      expect(env).toHaveProperty('error');
      expect(env.code).toBe(code);
      // The code must be a recognized member of the taxonomy.
      expect(isErrorCode(env.code)).toBe(true);
    });
  }

  it('every error envelope carries a code (even unmatched paths fall back to ERR_UNKNOWN)', () => {
    const {stdout} = runCli(['component', 'Bogus', '--json']);
    const env = envelope(stdout);
    expect(typeof env.code).toBe('string');
    expect(env.code.length).toBeGreaterThan(0);
  });
});

describe('error codes: human mode stays clean', () => {
  it('the code is NOT printed in the human-facing error line', () => {
    const {status, stderr, stdout} = runCli(['component', 'Bogus']);
    expect(status).toBe(1);
    // Human output goes to stderr and must not leak the machine code.
    expect(stderr).toContain('No component named');
    expect(stderr).not.toContain('ERR_UNKNOWN_COMPONENT');
    expect(stdout).not.toContain('ERR_UNKNOWN_COMPONENT');
  });

  it('unknown subcommand exits 1 in human mode (code carried internally)', () => {
    // `theme` is not JSON-capable, so this path is human-only; we assert the
    // failure surfaces with exit 1 and a helpful message. The stable
    // ERR_UNKNOWN_SUBCOMMAND code rides along on the cliError call.
    const {status, stderr} = runCli(['theme', 'bogus-sub']);
    expect(status).toBe(1);
    expect(stderr).toContain("unknown subcommand 'theme bogus-sub'");
    expect(stderr).not.toContain('ERR_UNKNOWN_SUBCOMMAND');
  });
});
