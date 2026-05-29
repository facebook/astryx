// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration tests for `init` non-interactive safety.
 *
 * `xds init` with no flags launches an interactive @clack/prompts wizard.
 * In a non-interactive context (CI, piped stdin, no TTY) that wizard would
 * block forever waiting for input. These tests spawn the CLI as a real
 * subprocess with stdin set to 'ignore' (no TTY) and prove that:
 *
 *   1. `xds init` (no flags) fails fast (exit 1) with actionable guidance
 *      instead of hanging — and writes NO files.
 *   2. The non-interactive feature paths (`--all`, `--features`) still work
 *      without a TTY (they must NOT be caught by the guard).
 *
 * A real subprocess is required: the guard reads process.stdin.isTTY, which
 * is only meaningful for a spawned process with a controlled stdio.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, '..', '..', 'bin', 'xds.mjs');

let tmpDir;

function runInit(args, opts = {}) {
  // stdio stdin 'ignore' => process.stdin.isTTY is undefined (non-TTY),
  // exactly the CI / piped condition we must be safe under.
  return spawnSync(process.execPath, [CLI, 'init', ...args], {
    cwd: tmpDir,
    encoding: 'utf8',
    timeout: 20_000,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {...process.env, FORCE_COLOR: '0'},
    ...opts,
  });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-init-noninteractive-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('init non-interactive safety (no TTY)', () => {
  it('fails fast with exit 1 instead of hanging on the wizard', () => {
    const r = runInit([]);
    // If the guard were missing, spawnSync would hit the 20s timeout
    // (signal SIGTERM, status null). Prove it exited cleanly with code 1.
    expect(r.signal).toBeNull();
    expect(r.status).toBe(1);
  });

  it('prints actionable guidance pointing at --all / --features', () => {
    const r = runInit([]);
    const out = r.stderr + r.stdout;
    expect(out).toMatch(/requires a TTY/i);
    expect(out).toMatch(/--all/);
    expect(out).toMatch(/--features/);
  });

  it('does not write any files when bailing out', () => {
    runInit([]);
    const entries = fs.readdirSync(tmpDir);
    expect(entries).toEqual([]);
  });

  it('still runs --features agents non-interactively (guard does not block opt-in)', () => {
    const r = runInit(['--features', 'agents']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    // agents feature writes an AGENTS.md (or similar) — prove a side effect
    // happened, i.e. the guard did NOT swallow the explicit non-interactive path.
    const entries = fs.readdirSync(tmpDir);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('rejects unknown --features with exit 1 (no TTY dependence)', () => {
    const r = runInit(['--features', 'bogus']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(1);
    expect(r.stderr + r.stdout).toMatch(/Unknown features/i);
  });
});
