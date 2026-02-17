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
  it('discovers *Theme.stylex.ts files and returns sorted array', () => {
    const themeDir = path.join(tmpDir, 'src', 'theme');
    fs.mkdirSync(themeDir, {recursive: true});
    fs.writeFileSync(path.join(themeDir, 'neutralTheme.stylex.ts'), '');
    fs.writeFileSync(path.join(themeDir, 'defaultTheme.stylex.ts'), '');
    fs.writeFileSync(path.join(themeDir, 'tokens.stylex.ts'), ''); // not a theme file
    fs.writeFileSync(path.join(themeDir, 'utils.ts'), ''); // not a theme file

    const result = discoverThemes(tmpDir);
    expect(result).toEqual([
      {name: 'default', exportName: 'defaultTheme'},
      {name: 'neutral', exportName: 'neutralTheme'},
    ]);
  });

  it('returns empty array when theme dir is missing', () => {
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
