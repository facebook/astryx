// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration tests for the --detail level contract on list views.
 *
 * Spawns the CLI as a subprocess against the real monorepo core dir and
 * asserts the documented size ordering for both `component --list` and
 * `hook --list`:
 *
 *   brief  (names only)              <  smallest
 *   compact (name + 1-line desc)     <  middle
 *   full   (dense per-entry docs)       largest
 *
 * All three levels must produce DISTINCT output. This guards against the
 * historically-inverted behavior where `brief` was densest and `full`
 * duplicated `compact`.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');
// Repo root holds packages/core, which findCoreDir() walks up to locate.
const REPO_ROOT = path.resolve(__dirname, '../../../..');

function runCli(args) {
  const res = spawnSync('node', [CLI_BIN, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    timeout: 60_000,
    // component.full JSON can exceed the default 1MB stdout buffer.
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

function listOutputs(cmd) {
  const brief = runCli([cmd, '--list', '--detail', 'brief']).stdout;
  const compact = runCli([cmd, '--list', '--detail', 'compact']).stdout;
  const full = runCli([cmd, '--list', '--detail', 'full']).stdout;
  return {brief, compact, full};
}

describe('--detail level ordering: component --list', () => {
  const {brief, compact, full} = listOutputs('component');

  it('produces strictly increasing output size: brief < compact < full', () => {
    expect(brief.length).toBeGreaterThan(0);
    expect(compact.length).toBeGreaterThan(brief.length);
    expect(full.length).toBeGreaterThan(compact.length);
  });

  it('produces three distinct outputs', () => {
    expect(brief).not.toEqual(compact);
    expect(compact).not.toEqual(full);
    expect(brief).not.toEqual(full);
  });

  it('brief is names-only (no targets, import hints, or prose descriptions)', () => {
    expect(brief).not.toMatch(/Targets:/);
    expect(brief).not.toMatch(/\u2190 from/);
    // Names only — should contain XDS component names but no " — " desc separator.
    expect(brief).toMatch(/Button/);
    expect(brief).not.toMatch(/ \u2014 /);
  });

  it('compact has 1-line descriptions (name + em-dash separator)', () => {
    expect(compact).toMatch(/ \u2014 /);
  });

  it('full has dense per-entry docs (props, targets, and import hints)', () => {
    expect(full).toMatch(/Targets:/);
    expect(full).toMatch(/\u2190 from/);
    // Prop name lists appear in the dense brief-all rendering.
    expect(full).toMatch(/children/);
  });

  it('full --json returns a valid component.full envelope', () => {
    const {stdout} = runCli(['component', '--list', '--detail', 'full', '--json']);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('component.full');
    expect(parsed.apiVersion).toBe(1);
    expect(typeof parsed.data).toBe('object');
  });
});

describe('--detail level ordering: hook --list', () => {
  const {brief, compact, full} = listOutputs('hook');

  it('produces strictly increasing output size: brief < compact < full', () => {
    expect(brief.length).toBeGreaterThan(0);
    expect(compact.length).toBeGreaterThan(brief.length);
    expect(full.length).toBeGreaterThan(compact.length);
  });

  it('produces three distinct outputs', () => {
    expect(brief).not.toEqual(compact);
    expect(compact).not.toEqual(full);
    expect(brief).not.toEqual(full);
  });

  it('brief is names-only (no param tables or import blocks)', () => {
    expect(brief).not.toMatch(/\| Param \|/);
    expect(brief).not.toMatch(/## Parameters/);
    expect(brief).not.toMatch(/import \{/);
    expect(brief).toMatch(/use[A-Z]/);
    expect(brief).not.toMatch(/ \u2014 /);
  });

  it('compact has 1-line descriptions (name + em-dash separator)', () => {
    expect(compact).toMatch(/ \u2014 /);
  });

  it('full has dense docs (param tables and import statements)', () => {
    expect(full).toMatch(/\| Param \|/);
    expect(full).toMatch(/import \{/);
  });

  it('full --json returns a valid hook.full envelope', () => {
    const {stdout} = runCli(['hook', '--list', '--detail', 'full', '--json']);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('hook.full');
    expect(parsed.apiVersion).toBe(1);
    expect(typeof parsed.data).toBe('object');
  });
});
