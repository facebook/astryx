// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Subprocess no-hang tests for the interactivity contract.
 *
 * The wizard command `init` blocks on @clack/prompts. In a
 * non-interactive context it must fail fast (exit 1) instead of hanging.
 * These tests spawn the CLI as a real subprocess with stdin/stdout NOT a TTY
 * (stdio 'ignore'/'pipe'), which is exactly the CI / piped condition. If the
 * guard were missing, spawnSync would hit the timeout (signal SIGTERM,
 * status null) — so asserting `signal === null && status === 1` proves the
 * process exited cleanly rather than hanging.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, '..', '..', 'bin', 'astryx.mjs');

let tmpDir;

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: tmpDir,
    encoding: 'utf8',
    timeout: 20_000,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {...process.env, FORCE_COLOR: '0', CI: ''},
  });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-interactive-guard-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('init non-interactive safety', () => {
  it('fails fast (exit 1, no hang) and writes no files', () => {
    const r = runCli(['init']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(1);
    expect(fs.readdirSync(tmpDir)).toEqual([]);
  });

  it('prints actionable guidance (--all / --features)', () => {
    const out = (() => {
      const r = runCli(['init']);
      return r.stderr + r.stdout;
    })();
    expect(out).toMatch(/requires a TTY/i);
    expect(out).toMatch(/--all/);
    expect(out).toMatch(/--features/);
  });

  it('still runs --features agents non-interactively (guard does not over-catch)', () => {
    const r = runCli(['init', '--features', 'agents']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    expect(fs.readdirSync(tmpDir).length).toBeGreaterThan(0);
  });
});
