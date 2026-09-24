// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the swizzle.copy leaf — path-safety + overwrite +
 * recursive nested-source copy (#3506). The copy leaf writes files, so the
 * output base AND the component name (which becomes a path segment) must both
 * be confined to cwd. Every destination segment, including dangling symlinks,
 * is checked before any output is written.
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {swizzle} from '../swizzle.mjs';

// api/swizzle/copy/ -> up 5 = repo root.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const OUT = 'tmp-swizzle-copy-test';
const SLOW = 30_000;

describe('swizzle.copy — destination symlinks', () => {
  let fixture;
  afterEach(() => {
    if (fixture) fs.rmSync(fixture, {recursive: true, force: true});
  });

  it.each([
    ['out', false],
    ['out/Table', false],
    ['out/Table/plugins', false],
    ['out/Table/plugins/nested.ts', false],
    ['out/Table/plugins/nested.ts', true],
  ])('rejects %s (dangling: %s) before writing, with or without overwrite', async (linkPath, dangling) => {
    fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-swizzle-symlink-'));
    const cwd = path.join(fixture, 'project');
    const source = path.join(cwd, 'node_modules/@astryxdesign/core/src/Table');
    fs.mkdirSync(path.join(source, 'plugins'), {recursive: true});
    fs.writeFileSync(path.join(source, 'Table.tsx'), 'export const Table = 1;');
    fs.writeFileSync(path.join(source, 'plugins/nested.ts'), 'export const nested = 1;');
    fs.writeFileSync(path.join(cwd, 'package.json'), '{"name":"consumer"}');
    const outside = path.join(fixture, 'outside');
    fs.mkdirSync(outside);
    const target = linkPath.endsWith('.ts') ? path.join(outside, 'target.ts') : outside;
    if (target !== outside && !dangling) fs.writeFileSync(target, '// consumer edit');
    const link = path.join(cwd, linkPath);
    fs.mkdirSync(path.dirname(link), {recursive: true});
    fs.symlinkSync(target, link);

    for (const overwrite of [false, true]) {
      await expect(swizzle('Table', {cwd, output: './out', overwrite})).rejects.toMatchObject({
        code: 'ERR_PATH_TRAVERSAL',
      });
      expect(fs.existsSync(path.join(cwd, 'out/Table/Table.tsx'))).toBe(false);
      expect(fs.readdirSync(outside)).toEqual(target !== outside && !dangling ? ['target.ts'] : []);
      if (target !== outside && !dangling) expect(fs.readFileSync(target, 'utf8')).toBe('// consumer edit');
    }
  });

  it('also rejects a destination symlink whose target stays inside the project', async () => {
    fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-swizzle-symlink-'));
    const source = path.join(fixture, 'node_modules/@astryxdesign/core/src/Button');
    fs.mkdirSync(source, {recursive: true});
    fs.writeFileSync(path.join(source, 'Button.tsx'), 'export const Button = 1;');
    fs.mkdirSync(path.join(fixture, 'consumer-files'));
    fs.mkdirSync(path.join(fixture, 'out'));
    fs.symlinkSync(path.join(fixture, 'consumer-files'), path.join(fixture, 'out/Button'));
    await expect(swizzle('Button', {cwd: fixture, output: './out'})).rejects.toMatchObject({
      code: 'ERR_PATH_TRAVERSAL',
    });
    expect(fs.readdirSync(path.join(fixture, 'consumer-files'))).toEqual([]);
  });
});

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

describe('swizzle.copy — nested component source (#3506)', () => {
  afterEach(() => {
    fs.rmSync(path.join(REPO, OUT), {recursive: true, force: true});
  });

  it('copies nested subdirectories recursively and reports them', async () => {
    const r = await swizzle('Table', {cwd: REPO, output: './' + OUT});
    expect(r.type).toBe('swizzle.copy');
    const outDir = path.join(REPO, OUT, 'Table');
    // The entry barrel re-exports from ./plugins/* — those modules must exist
    // in the output (the bug: subdirectories were silently dropped).
    expect(fs.existsSync(path.join(outDir, 'plugins/selection/index.ts'))).toBe(true);
    expect(
      fs.existsSync(path.join(outDir, 'plugins/selection/useTableSelection.tsx')),
    ).toBe(true);
    // The receipt's file set includes the nested paths and matches the count.
    expect(r.data.files).toContain('plugins/selection/index.ts');
    expect(r.data.filesCopied).toBe(r.data.files.length);
    // Test/doc files stay excluded at every depth, not just the top level.
    expect(
      r.data.files.some(f => f.includes('.test.') || f.includes('.doc.')),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(outDir, 'plugins/selection/useTableSelection.test.tsx')),
    ).toBe(false);
  }, SLOW);

  it('keeps intra-component imports relative and rewrites escaping ones by depth', async () => {
    await swizzle('Table', {cwd: REPO, output: './' + OUT});
    const outDir = path.join(REPO, OUT, 'Table');
    // Downward ./ imports in the entry barrel resolve now that the subtree
    // exists — they must stay untouched.
    const index = fs.readFileSync(path.join(outDir, 'index.ts'), 'utf-8');
    expect(index).toContain(`from './plugins/selection'`);
    const nested = fs.readFileSync(
      path.join(outDir, 'plugins/pagination/useTablePagination.tsx'),
      'utf-8',
    );
    // A nested file's ../../ import into the component root stays relative...
    expect(nested).toContain(`from '../../types'`);
    // ...while its ../../../ imports (escaping the component) are rewritten.
    expect(nested).toContain(`from '@astryxdesign/core/Pagination'`);
    expect(nested).toContain(`from '@astryxdesign/core/theme/tokens.stylex'`);
    expect(nested).not.toContain(`'../../../`);
  }, SLOW);

  it('overwrite pre-flight sees nested files', async () => {
    // Pre-create ONLY a nested file — the recursive conflict check must find
    // it before any write happens.
    const nestedDir = path.join(REPO, OUT, 'Table', 'plugins', 'selection');
    fs.mkdirSync(nestedDir, {recursive: true});
    fs.writeFileSync(path.join(nestedDir, 'index.ts'), '// consumer edit\n');
    await expect(swizzle('Table', {cwd: REPO, output: './' + OUT})).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
    const r = await swizzle('Table', {cwd: REPO, output: './' + OUT, overwrite: true});
    expect(r.data.files).toContain('plugins/selection/index.ts');
  }, SLOW);

  it('never materializes directories whose files are all excluded', async () => {
    // FormLayout's only subdirectory is __snapshots__/ (test snapshots, all
    // matching the .test. exclusion) — the copy must not emit an empty dir.
    const r = await swizzle('FormLayout', {cwd: REPO, output: './' + OUT});
    expect(fs.existsSync(path.join(REPO, OUT, 'FormLayout'))).toBe(true);
    expect(fs.existsSync(path.join(REPO, OUT, 'FormLayout', '__snapshots__'))).toBe(false);
    expect(r.data.files.every(f => !f.startsWith('__snapshots__'))).toBe(true);
  }, SLOW);
});
