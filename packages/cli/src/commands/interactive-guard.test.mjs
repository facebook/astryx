// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Subprocess no-hang tests for `astryx init`.
 *
 * TTY was removed from the CLI: `init` is non-interactive by default and must
 * run cleanly (exit 0, writing the agent cheat sheet) instead of hanging on a
 * prompt. These tests spawn the CLI with stdin/stdout NOT a TTY (the CI / piped
 * / agent condition). A hang would show as signal SIGTERM + status null; we
 * assert `signal === null && status === 0` to prove it exits cleanly and works.
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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-interactive-guard-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('init is non-interactive by default (no TTY needed)', () => {
  it('runs cleanly (exit 0, no hang) and writes agent docs', () => {
    const r = runCli(['init']);
    expect(r.signal).toBeNull(); // did not hang
    expect(r.status).toBe(0); // succeeded without a TTY
    expect(fs.readdirSync(tmpDir).length).toBeGreaterThan(0); // wrote the cheat sheet
  });

  it('writes an agent-doc file containing the ASTRYX cheat-sheet marker', () => {
    runCli(['init']);
    // init injects into existing agent-doc files if present, else creates AGENTS.md
    const candidates = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', path.join('.claude', 'CLAUDE.md')];
    const doc = candidates.find(f => fs.existsSync(path.join(tmpDir, f)));
    expect(doc).toBeTruthy();
    expect(fs.readFileSync(path.join(tmpDir, doc), 'utf8')).toMatch(/ASTRYX:START/);
  });

  it('still runs --features agents non-interactively', () => {
    const r = runCli(['init', '--features', 'agents']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    expect(fs.readdirSync(tmpDir).length).toBeGreaterThan(0);
  });
});
