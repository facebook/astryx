import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {findCoreDir, findProjectRoot, listComponents} from './paths.mjs';

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
