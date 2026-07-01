// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Subprocess smoke tests for the zero-dependency docs script.
 *
 * `docs.mjs` resolves the package directory from `import.meta.url`. Using
 * `new URL(...).pathname` there breaks on Windows (drive-letter paths come
 * back as `/D:/...`), which made `--list` print nothing and component
 * lookups crash with ENOENT. These tests spawn the script as a real
 * subprocess from a neutral cwd, so resolution can only come from the
 * module URL, and assert it finds the component catalog on every platform.
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

describe('docs.mjs component discovery', () => {
  it('--list discovers the component catalog', () => {
    const r = runDocs(['--list']);
    expect(r.error).toBeUndefined();
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/\bButton\b/);
    expect(r.stdout).toMatch(/\bDialog\b/);
  });

  it('renders docs for a single component', () => {
    const r = runDocs(['Button']);
    expect(r.error).toBeUndefined();
    expect(r.signal).toBeNull();
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/^# Button$/m);
    expect(r.stdout).toMatch(/## Props/);
  });
});
