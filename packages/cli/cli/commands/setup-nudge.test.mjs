// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guardrail tests — the centralized setup check + enforcement layer 3.
 *
 * Unit: isAstryxInitialized() detects the Astryx marker across EVERY agent-doc
 * location (including the previously-missed Hermes files) and legacy XDS blocks.
 *
 * Integration: the CLI nudges (stderr) before a command when the project hasn't
 * run init — INCLUDING in --json mode (agents pass --json, and stderr never
 * corrupts the stdout JSON envelope). Quiet once set up, outside a project, and
 * for the installer command itself.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {isAstryxInitialized} from './agent-docs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, '..', '..', 'bin', 'astryx.mjs');
const MARKER = '<!-- ASTRYX:START -->';
const NUDGE = /finish setup and install the Astryx agent prompt/;

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-setup-nudge-'));
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

function write(rel, body) {
  const p = path.join(tmp, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, body);
}

function run(args, cwd = tmp) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    env: {...process.env, FORCE_COLOR: '0'},
  });
}

describe('isAstryxInitialized — centralized setup check (one place)', () => {
  it('is false in an empty project', () => {
    expect(isAstryxInitialized(tmp)).toBe(false);
  });

  // Covers EVERY location a preset can write — .hermes.md/HERMES.md were the gap.
  it.each(['AGENTS.md', 'CLAUDE.md', '.claude/CLAUDE.md', '.cursorrules', '.hermes.md', 'HERMES.md'])(
    'detects the marker in %s',
    file => {
      write(file, `# doc\n${MARKER}\nbody`);
      expect(isAstryxInitialized(tmp)).toBe(true);
    },
  );

  it('detects the legacy XDS marker for back-compat', () => {
    write('AGENTS.md', '<!-- XDS:START -->');
    expect(isAstryxInitialized(tmp)).toBe(true);
  });

  it('is false when a doc file exists WITHOUT the marker', () => {
    write('AGENTS.md', 'project notes, no astryx block');
    expect(isAstryxInitialized(tmp)).toBe(false);
  });
});

describe('enforcement layer 3 — per-command setup nudge', () => {
  const asProject = () => write('package.json', '{"name":"t"}');

  it('nudges on stderr after a command when not set up', () => {
    asProject();
    const r = run(['docs', 'tokens']);
    expect(r.stderr).toMatch(NUDGE);
  });

  it('is suppressed in --json (machine mode stays clean), stdout valid JSON', () => {
    asProject();
    const r = run(['--json', 'docs', 'tokens']);
    // --json is machine output with a clean stdout+stderr contract; the human
    // nudge must NOT leak into it (json-shim: error envelopes have empty stderr).
    expect(r.stderr).not.toMatch(NUDGE);
    expect(() => JSON.parse(r.stdout)).not.toThrow();
  });

  it('is quiet once set up (marker present)', () => {
    asProject();
    write('AGENTS.md', MARKER);
    expect(run(['docs', 'tokens']).stderr).not.toMatch(NUDGE);
  });

  it('is quiet outside a project (no package.json)', () => {
    expect(run(['docs', 'tokens']).stderr).not.toMatch(NUDGE);
  });

  it('does not nudge for the installer command itself', () => {
    asProject();
    expect(run(['init']).stderr).not.toMatch(NUDGE);
  });
});
