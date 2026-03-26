import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {findCoreDir, findProjectRoot, listComponents, discoverExternalPackages} from './paths.mjs';

let tmpDir;

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'xds-paths-test-'));
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

  it('finds node_modules/@xds/core fallback', () => {
    const nmCore = path.join(tmpDir, 'node_modules', '@xds', 'core');
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
  it('finds packages with an "xds" field in package.json', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'xds-charts');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({
        name: 'xds-charts',
        xds: {docs: './src', category: 'Data Viz'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([
      {
        name: 'xds-charts',
        category: 'Data Viz',
        docsDir: path.join(extDir, 'src'),
      },
    ]);
  });

  it('handles scoped packages (@org/pkg)', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const scopedDir = path.join(nm, '@acme', 'xds-widgets');
    fs.mkdirSync(scopedDir, {recursive: true});
    fs.writeFileSync(
      path.join(scopedDir, 'package.json'),
      JSON.stringify({
        name: '@acme/xds-widgets',
        xds: {docs: './lib', category: 'Widgets'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([
      {
        name: '@acme/xds-widgets',
        category: 'Widgets',
        docsDir: path.join(scopedDir, 'lib'),
      },
    ]);
  });

  it('skips @xds/core', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const coreDir = path.join(nm, '@xds', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({
        name: '@xds/core',
        xds: {docs: './src'},
      }),
    );

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([]);
  });

  it('skips packages without "xds" field', () => {
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
        xds: {docs: './docs'},
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
    const extDir = path.join(nm, 'xds-ext');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({
        name: 'xds-ext',
        xds: {docs: './src'},
      }),
    );

    const nested = path.join(tmpDir, 'packages', 'app');
    fs.mkdirSync(nested, {recursive: true});

    const result = discoverExternalPackages(nested);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('xds-ext');
  });

  it('handles invalid JSON in package.json gracefully', () => {
    const nm = path.join(tmpDir, 'node_modules');
    const extDir = path.join(nm, 'bad-json');
    fs.mkdirSync(extDir, {recursive: true});
    fs.writeFileSync(path.join(extDir, 'package.json'), '{not valid json!!!');

    const result = discoverExternalPackages(tmpDir);
    expect(result).toEqual([]);
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
