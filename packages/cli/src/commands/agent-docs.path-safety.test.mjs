// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-safety regression tests for `--agent-docs-path`.
 *
 * `installAgentDocs(targetDir, {paths})` previously joined each path
 * onto `targetDir` with no validation, so:
 *   - `../OUT.md` wrote outside `targetDir`
 *   - `/tmp/x.md` was silently re-rooted under `targetDir`
 *
 * Both cases now throw PathSafetyError before any file is touched.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {installAgentDocs} from './agent-docs.mjs';
import {PathSafetyError} from '../utils/path-safety.mjs';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-agent-docs-paths-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('installAgentDocs path safety', () => {
  it('rejects --agent-docs-path that escapes the target directory', () => {
    const target = path.join(tmpDir, 'project');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(target, {recursive: true});
    fs.mkdirSync(outside, {recursive: true});

    expect(() =>
      installAgentDocs(target, {paths: ['../OUT.md']}),
    ).toThrow(PathSafetyError);

    expect(fs.existsSync(path.join(tmpDir, 'OUT.md'))).toBe(false);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('rejects an absolute --agent-docs-path with a clear error', () => {
    const target = path.join(tmpDir, 'project');
    fs.mkdirSync(target, {recursive: true});
    const absPath = path.join(tmpDir, 'absolute.md');

    expect(() =>
      installAgentDocs(target, {paths: [absPath]}),
    ).toThrow(/absolute paths are not allowed/i);

    expect(fs.existsSync(absPath)).toBe(false);
  });

  it('rejects deeper traversal segments', () => {
    const target = path.join(tmpDir, 'a', 'b', 'c');
    fs.mkdirSync(target, {recursive: true});

    expect(() =>
      installAgentDocs(target, {paths: ['../../../escaped.md']}),
    ).toThrow(PathSafetyError);

    expect(fs.existsSync(path.join(tmpDir, 'escaped.md'))).toBe(false);
  });
});
