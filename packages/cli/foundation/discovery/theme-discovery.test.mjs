// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  BUNDLED_THEME_PACKAGE,
  discoverBundledThemes,
  discoverThemeCatalog,
} from './theme-discovery.mjs';

let tmpDir;

function writeCatalog(entries) {
  fs.mkdirSync(tmpDir, {recursive: true});
  for (const entry of entries) {
    const themeDir = path.join(tmpDir, entry.slug);
    fs.mkdirSync(themeDir, {recursive: true});
    for (const file of entry.files) {
      const target = path.join(themeDir, file);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, `export const ${entry.exportName} = {};\n`);
    }
  }
  fs.writeFileSync(
    path.join(tmpDir, 'manifest.json'),
    JSON.stringify({version: 1, themes: entries}),
  );
}

const ocean = {
  slug: 'ocean',
  displayName: 'Ocean',
  description: 'Blue and calm.',
  maintained: true,
  entry: 'oceanTheme.ts',
  exportName: 'oceanTheme',
  files: ['oceanTheme.ts'],
};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-catalog-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme catalog discovery', () => {
  it('reads the existing bundled catalog with package ownership', () => {
    const themes = discoverBundledThemes();
    expect(themes.length).toBeGreaterThan(0);
    expect(themes.every(theme => theme.package === BUNDLED_THEME_PACKAGE)).toBe(
      true,
    );
    expect(themes.every(theme => theme.bundled)).toBe(true);
  });

  it('reads the canonical manifest-plus-slug-directory shape', () => {
    writeCatalog([ocean]);
    expect(discoverThemeCatalog(tmpDir, '@acme/themes')).toEqual([
      expect.objectContaining({
        ...ocean,
        package: '@acme/themes',
        sourceDir: path.join(tmpDir, 'ocean'),
        bundled: false,
      }),
    ]);
  });

  it('rejects duplicate slugs case-insensitively', () => {
    writeCatalog([ocean, {...ocean, slug: 'OCEAN'}]);
    expect(() => discoverThemeCatalog(tmpDir, '@acme/themes')).toThrow(
      /invalid slug|duplicate slug/u,
    );
  });

  it('rejects files that escape the theme directory', () => {
    fs.mkdirSync(path.join(tmpDir, 'ocean'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'outside.ts'),
      'export const oceanTheme = {};\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'manifest.json'),
      JSON.stringify({
        version: 1,
        themes: [
          {
            ...ocean,
            entry: '../outside.ts',
            files: ['../outside.ts'],
          },
        ],
      }),
    );
    expect(() => discoverThemeCatalog(tmpDir, '@acme/themes')).toThrow(
      /must stay inside/u,
    );
  });

  it('rejects a missing catalog file and a missing listed source', () => {
    expect(() => discoverThemeCatalog(tmpDir, '@acme/themes')).toThrow(
      /must contain manifest\.json/u,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'manifest.json'),
      JSON.stringify({version: 1, themes: [ocean]}),
    );
    expect(() => discoverThemeCatalog(tmpDir, '@acme/themes')).toThrow(
      /missing directory "ocean"/u,
    );
  });

  it('requires the named entry to be one of the copied files', () => {
    writeCatalog([{...ocean, files: ['other.ts']}]);
    expect(() => discoverThemeCatalog(tmpDir, '@acme/themes')).toThrow(
      /must include entry/u,
    );
  });
});
