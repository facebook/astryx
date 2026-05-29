// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * End-to-end tests for the global `--lang` validation hook.
 *
 * Proves the advertised global `--lang` flag is HONEST on every command:
 *
 *   1. An unsupported locale (`--lang xx`) exits 1 with a clear message on
 *      read commands (component, discover) AND write/action commands
 *      (init, template, upgrade) — not a silent English fallback.
 *   2. A write command (`init --all --lang xx`) exits 1 BEFORE touching the
 *      filesystem — zero files written (path-safety / no half-writes).
 *   3. `--json --lang xx` emits a structured `{ error }` envelope and exits
 *      non-zero (contract — rejected before side effects).
 *   4. A partially-translated locale (`--lang zh`) succeeds (exit 0) but
 *      warns on stderr that prose falls back to English (no silent English).
 *   5. `--lang en` succeeds with no warning.
 *   6. `--lang zh --dense` (ambiguous combo) exits 1.
 *
 * Regression guard: init/template/theme/upgrade/swizzle/gap-report advertise
 * the global `--lang` flag (declared on the root program) but never translate;
 * before this hook they accepted `--lang xx` silently.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliBin = path.resolve(__dirname, '../../bin/xds.mjs');

function runCli(args, opts = {}) {
  return spawnSync('node', [cliBin, ...args], {
    encoding: 'utf-8',
    timeout: 30000,
    // Non-TTY pipe (default for spawnSync) — exercises non-interactive path.
    input: '',
    ...opts,
  });
}

describe('global --lang validation: unsupported locale exits 1', () => {
  for (const args of [
    ['component', '--list'],
    ['discover'],
    ['template', 'list'],
    ['upgrade'],
  ]) {
    it(`xds ${args.join(' ')} --lang xx exits 1 (not silent fallback)`, () => {
      const r = runCli([...args, '--lang', 'xx']);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/Unsupported language "xx"/);
      expect(r.stderr).toMatch(/en, zh, dense/);
    });
  }
});

describe('global --lang validation: write command is side-effect-free on reject', () => {
  it('init --all --lang xx exits 1 and writes NO files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-init-lang-'));
    try {
      const r = runCli(['init', '--all', '--lang', 'xx'], {cwd: tmp});
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/Unsupported language "xx"/);
      // No half-writes: the empty dir must stay empty.
      const entries = fs.readdirSync(tmp);
      expect(entries).toEqual([]);
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true});
    }
  });
});

describe('global --lang validation: --json contract', () => {
  it('--json --lang xx emits a structured { error } and exits non-zero', () => {
    const r = runCli(['component', '--list', '--json', '--lang', 'xx']);
    expect(r.status).not.toBe(0);
    const parsed = JSON.parse(r.stdout.trim());
    expect(parsed).toHaveProperty('error');
    expect(parsed.error).toMatch(/Unsupported language "xx"/);
  });
});

describe('global --lang validation: i18n honesty', () => {
  it('--lang zh succeeds but warns that prose falls back to English', () => {
    const r = runCli(['component', '--list', '--lang', 'zh']);
    expect(r.status).toBe(0);
    expect(r.stderr).toMatch(/translations are incomplete/);
    expect(r.stderr).toMatch(/fall back to English/);
  });

  it('--lang en succeeds with no incomplete-translation warning', () => {
    const r = runCli(['component', '--list', '--lang', 'en']);
    expect(r.status).toBe(0);
    expect(r.stderr).not.toMatch(/translations are incomplete/);
  });

  it('--lang zh --dense (ambiguous combo) exits 1', () => {
    const r = runCli(['component', '--list', '--lang', 'zh', '--dense']);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/Cannot combine --lang/);
  });
});
