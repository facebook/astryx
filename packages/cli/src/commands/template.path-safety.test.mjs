// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-traversal regression tests for `astryx template <name> <path>`.
 *
 * Drives the template API directly (it owns destination resolution +
 * path-safety enforcement). Spawning the CLI bin is unnecessary because
 * `template()` resolves and writes to disk itself.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

let tmpDir;
let templateApi;

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-template-paths-'));
  templateApi = (await import('../api/template.mjs')).template;
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('template path safety', () => {
  it('rejects targetPath with ../ traversal and writes no file outside cwd', async () => {
    const cwd = path.join(tmpDir, 'project');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(cwd, {recursive: true});
    fs.mkdirSync(outside, {recursive: true});

    await expect(
      templateApi('blank', {targetPath: '../outside/leaked', cwd}),
    ).rejects.toThrow(/traversal|outside the project root/i);

    // Nothing escaped.
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('rejects absolute targetPath', async () => {
    const cwd = path.join(tmpDir, 'project');
    fs.mkdirSync(cwd, {recursive: true});
    const absTarget = path.join(tmpDir, 'absolute-out');

    await expect(
      templateApi('blank', {targetPath: absTarget, cwd}),
    ).rejects.toThrow(/absolute paths are not allowed/i);

    expect(fs.existsSync(absTarget)).toBe(false);
  });

  it('treats targetPath with .tsx extension as a file, not a directory', async () => {
    const cwd = path.join(tmpDir, 'project');
    fs.mkdirSync(cwd, {recursive: true});

    // Use a real template name from the discovered set.
    const {discoverTemplates} = await import('../api/template.mjs');
    const all = await discoverTemplates();
    const page = all.find(t => t.type === 'page');
    if (!page) {
      // No page templates packaged in this checkout — skip without failing the suite.
      return;
    }

    const result = await templateApi(page.dirName, {
      targetPath: './foo.tsx',
      cwd,
    });

    // The file MUST be at ./foo.tsx, not ./foo.tsx/page.tsx.
    expect(result.type).toBe('template.copy');
    expect(result.data.fileName).toBe('foo.tsx');

    expect(fs.existsSync(path.join(cwd, 'foo.tsx'))).toBe(true);
    expect(fs.statSync(path.join(cwd, 'foo.tsx')).isFile()).toBe(true);
    // The bad-old behavior would have left foo.tsx as a directory.
    expect(fs.statSync(path.join(cwd, 'foo.tsx')).isDirectory()).toBe(false);
  });
});
