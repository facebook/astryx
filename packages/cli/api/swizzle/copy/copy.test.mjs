// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the swizzle.copy leaf — path-safety + overwrite.
 * The copy leaf writes files, so the output base AND the component name (which
 * becomes a path segment) must both be confined to cwd.
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {swizzle} from '../swizzle.mjs';

// api/swizzle/copy/ -> up 5 = repo root.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const OUT = 'tmp-swizzle-copy-test';
const SLOW = 30_000;

describe('swizzle.copy — path safety', () => {
  afterEach(() => {
    fs.rmSync(path.join(REPO, OUT), {recursive: true, force: true});
    // guard against an escape landing at <repo>/src
    if (fs.existsSync(path.join(REPO, 'src'))) {
      // never auto-delete a real src; the test asserts it wasn't created.
    }
  });

  it('rejects a component name that traverses out of the output base', async () => {
    await expect(
      swizzle('../src', {cwd: REPO, output: './' + OUT}),
    ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});
  }, SLOW);

  it('rejects a component name containing a path separator', async () => {
    await expect(
      swizzle('foo/bar', {cwd: REPO, output: './' + OUT}),
    ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});
  }, SLOW);

  it('rejects an --output that escapes cwd (relative and absolute)', async () => {
    await expect(swizzle('Button', {cwd: REPO, output: '../evil'})).rejects.toMatchObject({
      code: 'ERR_PATH_TRAVERSAL',
    });
    await expect(swizzle('Button', {cwd: REPO, output: '/tmp/evil'})).rejects.toMatchObject({
      code: 'ERR_PATH_TRAVERSAL',
    });
  }, SLOW);

  it('copies a component\'s subdirectories so its inner imports resolve', async () => {
    // Markdown imports from ./plugins and ./parser; Table from ./plugins/*.
    // Every relative import left in a copied file must point at a copied file.
    for (const name of ['Markdown', 'Table']) {
      const r = await swizzle(name, {cwd: REPO, output: './' + OUT});
      expect(r.type).toBe('swizzle.copy');
      expect(r.data.files.some(f => f.startsWith('plugins/'))).toBe(true);
      expect(r.data.files.some(f => f.includes('__tests__'))).toBe(false);
      expect(r.data.filesCopied).toBe(r.data.files.length);

      const outDir = path.join(REPO, OUT, name);
      const dangling = [];
      for (const file of r.data.files) {
        if (!/\.tsx?$/.test(file)) continue;
        const abs = path.join(outDir, file);
        expect(fs.existsSync(abs), `${name}/${file} was not written`).toBe(true);
        const content = fs.readFileSync(abs, 'utf-8');
        const re = /(?:from|import\()\s*['"](\.\.?\/[^'"]+)['"]/g;
        let m;
        while ((m = re.exec(content)) !== null) {
          const target = path.resolve(path.dirname(abs), m[1]);
          const candidates = [
            target,
            `${target}.ts`,
            `${target}.tsx`,
            path.join(target, 'index.ts'),
            path.join(target, 'index.tsx'),
          ];
          if (!candidates.some(c => fs.existsSync(c) && fs.statSync(c).isFile())) {
            dangling.push(`${name}/${file}: ${m[1]}`);
          }
        }
      }
      expect(dangling, 'relative imports in the copy must resolve').toEqual([]);
      fs.rmSync(path.join(REPO, OUT), {recursive: true, force: true});
    }
  }, SLOW * 2);

  it('copies a real component, then refuses to clobber without overwrite', async () => {
    const r = await swizzle('Button', {cwd: REPO, output: './' + OUT});
    expect(r.type).toBe('swizzle.copy');
    expect(r.data.filesCopied).toBeGreaterThan(0);
    await expect(swizzle('Button', {cwd: REPO, output: './' + OUT})).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
    const r2 = await swizzle('Button', {cwd: REPO, output: './' + OUT, overwrite: true});
    expect(r2.data.filesCopied).toBe(r.data.filesCopied);
  }, SLOW);
});
