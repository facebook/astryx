// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Proves the global --detail validator rejects invalid values for
 * EVERY command (exit 1, clear message, JSON envelope under --json) — even
 * commands that don't otherwise read --detail. Spawns the real bin so the
 * Commander preAction hook and process.exit are exercised end-to-end.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(__dirname, '../../bin/xds.mjs');

function runCli(args) {
  return spawnSync('node', [BIN, ...args], {
    encoding: 'utf-8',
    env: {...process.env, NO_COLOR: '1', FORCE_COLOR: '0'},
  });
}

// Commands that previously silently accepted a bogus --detail (and ones
// that already validated it) — all must now reject uniformly.
const COMMANDS = [
  ['template'],
  ['discover'],
  ['swizzle', '--list'],
  ['gap-report', '--list-categories'],
  ['component', 'XDSButton'],
  ['docs', 'XDSButton'],
  ['upgrade', '--list'],
];

describe('global --detail validation', () => {
  for (const argv of COMMANDS) {
    const label = argv.join(' ');
    it(`rejects bogus --detail for \`${label}\` with exit 1 + clear message`, () => {
      const {status, stderr, stdout} = runCli([...argv, '--detail', 'bogus']);
      expect(status).toBe(1);
      const out = (stderr || '') + (stdout || '');
      expect(out).toMatch(/Invalid --detail value "bogus"/);
      expect(out).toMatch(/full, compact, brief/);
    });

    it(`rejects bogus --detail for \`${label}\` under --json (error envelope, no partial output)`, () => {
      const {status, stdout} = runCli(['--json', ...argv, '--detail', 'bogus']);
      expect(status).toBe(1);
      const parsed = JSON.parse(stdout.trim());
      expect(parsed.error).toMatch(/Invalid --detail value "bogus"/);
      // No command envelope should have been emitted (rejected before side effects).
      expect(parsed.type).toBeUndefined();
    });
  }

  it('accepts a valid --detail level (brief) without erroring', () => {
    const {status, stderr} = runCli(['component', 'XDSButton', '--detail', 'brief']);
    expect(status).toBe(0);
    expect(stderr || '').not.toMatch(/Invalid --detail/);
  });
});
