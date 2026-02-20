import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {discoverThemes, writeThemeConfig} from './theme.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-theme-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('discoverThemes', () => {
  it('discovers *Theme.stylex.ts files in packages/theme/src/', () => {
    // Simulate monorepo structure: coreDir = packages/core
    // themes at packages/theme/src/default/defaultTheme.stylex.ts
    const coreDir = path.join(tmpDir, 'packages', 'core');
    const themeDir = path.join(tmpDir, 'packages', 'theme', 'src');
    const defaultDir = path.join(themeDir, 'default');
    const neutralDir = path.join(themeDir, 'neutral');

    fs.mkdirSync(coreDir, {recursive: true});
    fs.mkdirSync(defaultDir, {recursive: true});
    fs.mkdirSync(neutralDir, {recursive: true});
    fs.writeFileSync(path.join(defaultDir, 'defaultTheme.stylex.ts'), '');
    fs.writeFileSync(path.join(neutralDir, 'neutralTheme.stylex.ts'), '');

    const result = discoverThemes(coreDir);
    expect(result).toEqual([
      {name: 'default', exportName: 'defaultTheme'},
      {name: 'neutral', exportName: 'neutralTheme'},
    ]);
  });

  it('discovers *Theme.stylex.ts files in legacy location (core/src/theme/)', () => {
    const coreDir = tmpDir;
    const themeDir = path.join(coreDir, 'src', 'theme');
    fs.mkdirSync(themeDir, {recursive: true});
    fs.writeFileSync(path.join(themeDir, 'defaultTheme.stylex.ts'), '');
    fs.writeFileSync(path.join(themeDir, 'tokens.stylex.ts'), ''); // not a theme

    const result = discoverThemes(coreDir);
    expect(result).toEqual([
      {name: 'default', exportName: 'defaultTheme'},
    ]);
  });

  it('deduplicates themes found in both locations', () => {
    const coreDir = path.join(tmpDir, 'packages', 'core');
    const legacyDir = path.join(coreDir, 'src', 'theme');
    const newDir = path.join(tmpDir, 'packages', 'theme', 'src', 'default');

    fs.mkdirSync(legacyDir, {recursive: true});
    fs.mkdirSync(newDir, {recursive: true});
    fs.writeFileSync(path.join(legacyDir, 'defaultTheme.stylex.ts'), '');
    fs.writeFileSync(path.join(newDir, 'defaultTheme.stylex.ts'), '');

    const result = discoverThemes(coreDir);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('default');
  });

  it('returns empty array when no theme dirs exist', () => {
    expect(discoverThemes(tmpDir)).toEqual([]);
  });
});

describe('writeThemeConfig', () => {
  it('writes xds.config.mjs with correct content', () => {
    const configPath = writeThemeConfig(tmpDir, 'neutralTheme');

    expect(configPath).toBe(path.join(tmpDir, 'xds.config.mjs'));

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain("theme: 'neutralTheme'");
    expect(content).toContain('XDS Configuration');
  });
});
