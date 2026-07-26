// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {findCoreDir, findProjectRoot, listComponents, discoverExternalPackages} from './paths.mjs';

let tmpDir;

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-paths-test-'));
}

beforeEach(() => {
  tmpDir = makeTmpDir();
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('findCoreDir', () => {
  it('finds packages/core walking up directories', () => {
    const coreDir = path.join(tmpDir, 'packages', 'core');
    fs.mkdirSync(coreDir, {recursive: true});

    const nested = path.join(tmpDir, 'sub', 'deep');
    fs.mkdirSync(nested, {recursive: true});

    expect(findCoreDir(nested)).toBe(coreDir);
  });

  it('finds node_modules/@astryxdesign/core fallback', () => {
    const nmCore = path.join(tmpDir, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(nmCore, {recursive: true});

    expect(findCoreDir(tmpDir)).toBe(nmCore);
  });

  it('returns null when nothing found', () => {
    expect(findCoreDir(tmpDir)).toBeNull();
  });
});

describe('findProjectRoot', () => {
  it('finds root with workspaces in package.json', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'root', workspaces: ['packages/*']}),
    );

    const nested = path.join(tmpDir, 'packages', 'foo');
    fs.mkdirSync(nested, {recursive: true});

    expect(findProjectRoot(nested)).toBe(tmpDir);
  });

  it('returns null when no workspaces found', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'no-workspaces'}),
    );

    expect(findProjectRoot(tmpDir)).toBeNull();
  });
});

describe('discoverExternalPackages', () => {
  it('finds packages with an "astryx" field in package.json', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'astryx-charts');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({
        name: 'astryx-charts',
        astryx: {docs: './src', category: 'Data Viz'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([
      {
        name: 'astryx-charts',
        category: 'Data Viz',
        docsDir: path.join(extDir, 'src'),
        blocksDir: null,
      },
    ]);
  });

  it('handles scoped packages (@org/pkg)', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const scopedDir = path.join(nm, '@acme', 'astryx-widgets');
    fs.mkdirSync(scopedDir, {recursive: true});
    fs.writeFileSync(
      path.join(scopedDir, 'package.json'),
      JSON.stringify({
        name: '@acme/astryx-widgets',
        astryx: {docs: './lib', category: 'Widgets'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([
      {
        name: '@acme/astryx-widgets',
        category: 'Widgets',
        docsDir: path.join(scopedDir, 'lib'),
        blocksDir: null,
      },
    ]);
  });

  it('skips @astryxdesign/core', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const coreDir = path.join(nm, '@astryxdesign', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({
        name: '@astryxdesign/core',
        astryx: {docs: './src'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([]);
  });

  it('skips packages without "astryx" field', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'some-lib');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({name: 'some-lib'}),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([]);
  });

  it('defaults category to package name when not specified', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'my-components');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({
        name: 'my-components',
        astryx: {docs: './docs'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result[0].category).toBe('my-components');
  });

  it('returns empty array when no node_modules found', () => {
    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([]);
  });

  it('walks up directories to find node_modules', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'astryx-ext');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({
        name: 'astryx-ext',
        astryx: {docs: './src'},
      }),
    );

    const nested = path.join(tmpDir, 'packages', 'app');
    fs.mkdirSync(nested, {recursive: true});

    const result = discoverExternalPackages(nested);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('astryx-ext');
  });

  it('handles invalid JSON in package.json gracefully', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'bad-json');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(path.join(extDir, 'package.json'), '{not valid json!!!');

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([]);
  });

  // pnpm — and `file:`/`link:`/workspace deps on every package manager — install
  // a package as a SYMLINK into node_modules. `readdirSync(withFileTypes)` does
  // not follow links, so a symlinked package reports isDirectory() === false. It
  // must still be discovered, or external-package support is inert under pnpm.
  it('finds a package installed as a symlink (pnpm layout)', () => {
    const store = path.join(
      tmpDir,
      'node_modules',
      '.pnpm',
      '@acme+widgets@1.0.0',
      'node_modules',
      '@acme',
      'widgets',
    );
    fs.mkdirSync(path.join(store, 'src'), {recursive: true});
    fs.writeFileSync(
      path.join(store, 'package.json'),
      JSON.stringify({name: '@acme/widgets', astryx: {docs: './src'}}),
    );
    const scopeDir = path.join(tmpDir, 'node_modules', '@acme');
    fs.mkdirSync(scopeDir, {recursive: true});
    fs.symlinkSync(store, path.join(scopeDir, 'widgets'), 'dir');

    const result = discoverExternalPackages(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('@acme/widgets');
    // docsDir resolves through the link, so the real files stay reachable.
    expect(fs.existsSync(result[0].docsDir)).toBe(true);
  });

  it('finds a symlinked package at an unscoped node_modules entry', () => {
    const real = path.join(tmpDir, 'linked-pkg');
    fs.mkdirSync(path.join(real, 'src'), {recursive: true});
    fs.writeFileSync(
      path.join(real, 'package.json'),
      JSON.stringify({name: 'linked-pkg', astryx: {docs: './src'}}),
    );
    const nm = path.join(tmpDir, 'node_modules');
    fs.mkdirSync(nm, {recursive: true});
    fs.symlinkSync(real, path.join(nm, 'linked-pkg'), 'dir');

    const result = discoverExternalPackages(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('linked-pkg');
  });

  it('skips a broken symlink without throwing', () => {
    const nm = path.join(tmpDir, 'node_modules');
    fs.mkdirSync(nm, {recursive: true});
    fs.symlinkSync(path.join(tmpDir, 'gone'), path.join(nm, 'ghost'), 'dir');

    expect(() => discoverExternalPackages(tmpDir)).not.toThrow();
    expect(discoverExternalPackages(tmpDir)).toEqual([]);
  });
});

describe('listComponents', () => {
  it('returns sorted component directory names, skipping hooks/theme/utils', () => {
    const srcDir = path.join(tmpDir, 'src');
    for (const dir of ['Button', 'Avatar', 'hooks', 'theme', 'utils', 'Zebra']) {
      fs.mkdirSync(path.join(srcDir, dir), {recursive: true});
    }

    const result = listComponents(tmpDir);
    expect(result).toEqual(['Avatar', 'Button', 'Zebra']);
  });

  it('returns empty array when src dir is missing', () => {
    expect(listComponents(tmpDir)).toEqual([]);
  });
});
