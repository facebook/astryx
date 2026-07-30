// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Subprocess smoke tests for the zero-dependency docs script.
 *
 * `docs.mjs` no longer prints component docs itself — it intentionally
 * redirects to the Astryx CLI (`npx @astryxdesign/cli init`) so agents and
 * humans converge on the CLI + `init` rather than a stale bundled snapshot.
 * These tests spawn the script as a real subprocess from a neutral cwd and
 * assert that, regardless of the arguments passed, it prints the redirect
 * banner and exits 0 instead of rendering a component catalog or per-component
 * docs.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_SCRIPT = path.resolve(__dirname, '..', 'docs.mjs');

function runDocs(args) {
  return spawnSync(process.execPath, [DOCS_SCRIPT, ...args], {
    cwd: os.tmpdir(),
    encoding: 'utf8',
    timeout: 20_000,
    env: {...process.env, FORCE_COLOR: '0'},
  });
}

describe('docs.mjs redirects to the Astryx CLI', () => {
  it('redirects to the CLI instead of printing a component catalog for --list', () => {
    const r = runDocs(['--list']);
    expect(r.error).toBeUndefined();
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    // Prints the redirect banner, not a component list.
    expect(r.stdout).toMatch(/docs are served by the Astryx CLI/);
    expect(r.stdout).toMatch(/npx @astryxdesign\/cli init/);
    expect(r.stdout).toMatch(/npx @astryxdesign\/cli component --list/);
  });

  it('redirects to the CLI instead of rendering docs for a single component', () => {
    const r = runDocs(['Button']);
    expect(r.error).toBeUndefined();
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    // A pure redirect: it must not render the component's docs.
    expect(r.stdout).not.toMatch(/^# Button$/m);
    expect(r.stdout).not.toMatch(/## Props/);
    expect(r.stdout).toMatch(/npx @astryxdesign\/cli component <Name>/);
  });
});
