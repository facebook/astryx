// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Subprocess tests for `astryx init --agent` validation.
 *
 * `init --features agents --agent <tool>` forwards `--agent` straight into
 * installAgentDocs() without checking it against the known agent presets
 * (claude, cursor, codex, hermes, all). An unrecognized value silently fell
 * through to the default file (AGENTS.md) instead of erroring, unlike
 * `--features`, which already validates against VALID_FEATURES and exits 1
 * via cliError(ERR_UNKNOWN_FEATURE) on a bad value.
 *
 * No existing test exercised the `--features`/ERR_UNKNOWN_FEATURE error path
 * either — this file follows the same subprocess pattern used by
 * interactive-guard.test.mjs (spawn the real CLI binary in an isolated temp
 * cwd) to cover both the new ERR_UNKNOWN_AGENT guard and confirm valid
 * `--agent` values still work.
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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-init-agent-validation-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('init --agent validation', () => {
  it('rejects an unknown --agent value (exit 1, no files written)', () => {
    const r = runCli(['init', '--features', 'agents', '--agent', 'bogus']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(1);
    expect(r.stderr + r.stdout).toMatch(/unknown agent/i);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
    expect(fs.readdirSync(tmpDir)).toEqual([]);
  });

  it('still accepts a valid --agent value (exit 0, creates AGENTS.md)', () => {
    const r = runCli(['init', '--features', 'agents', '--agent', 'hermes']);
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
  });
});
