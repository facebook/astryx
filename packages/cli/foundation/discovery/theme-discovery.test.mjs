// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  BUNDLED_THEME_PACKAGE,
  discoverBundledThemes,
  discoverIntegrationThemes,
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

  it('parses a named runtime export without executing the entry', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "throw new Error('theme source executed');\nexport const oceanTheme = {};\n",
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('rejects an entry that does not export the catalog name', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      'export const anotherTheme = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      'Theme catalog for @acme/themes entry "oceanTheme.ts" does not export "oceanTheme".',
    );
  });

  it('rejects a type-only export of the catalog name', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      'export type oceanTheme = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/does not export "oceanTheme"/u);
  });

  it('rejects an unbound source-less export specifier', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      'export {oceanTheme};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /could not be parsed: Export 'oceanTheme' is not defined/u,
    );
  });

  it('accepts a source-less export backed by a local runtime declaration', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      'const oceanTheme = {};\nexport {oceanTheme};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('accepts a source-less export backed by a listed imported alias', async () => {
    writeCatalog([{...ocean, files: ['oceanTheme.ts', 'theme.ts']}]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "import {theme as oceanTheme} from './theme';\nexport {oceanTheme};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'theme.ts'),
      'export const theme = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('accepts a source-less export backed by a bare package import', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "import {defineTheme as oceanTheme} from '@astryxdesign/core/theme';\nexport {oceanTheme};\n",
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('follows a listed default re-export', async () => {
    writeCatalog([{...ocean, files: ['oceanTheme.ts', 'theme.ts']}]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "export {default as oceanTheme} from './theme';\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'theme.ts'),
      'export default {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('follows local export-all barrels without executing them', async () => {
    writeCatalog([{...ocean, files: ['oceanTheme.ts', 'theme.ts']}]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "export * from './theme';\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'theme.ts'),
      "throw new Error('theme source executed');\nexport const oceanTheme = {};\n",
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('accepts a listed nested palette import without executing it', async () => {
    writeCatalog([
      {...ocean, files: ['oceanTheme.ts', 'tokens/ocean.palette.ts']},
    ]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "import {oceanPalette} from './tokens/ocean.palette';\nexport const oceanTheme = {oceanPalette};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'tokens', 'ocean.palette.ts'),
      "throw new Error('palette source executed');\nexport const oceanPalette = {};\n",
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('rejects a direct import from an unlisted theme file', async () => {
    writeCatalog([ocean]);
    fs.mkdirSync(path.join(tmpDir, 'ocean', 'tokens'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "import {oceanPalette} from './tokens/ocean.palette';\nexport const oceanTheme = {oceanPalette};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'tokens', 'ocean.palette.ts'),
      'export const oceanPalette = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /must resolve to a listed file inside the theme directory/u,
    );
  });

  it('rejects a direct import outside the theme directory', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "import {oceanPalette} from '../outside';\nexport const oceanTheme = {oceanPalette};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'outside.ts'),
      'export const oceanPalette = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /must resolve to a listed file inside the theme directory/u,
    );
  });

  it('rejects a literal dynamic import from an unlisted file', async () => {
    const mjsTheme = {
      ...ocean,
      entry: 'oceanTheme.mjs',
      files: ['oceanTheme.mjs'],
    };
    writeCatalog([mjsTheme]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.mjs'),
      "void import('./extra.mjs');\nexport const oceanTheme = {};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'extra.mjs'),
      'export const extra = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /must resolve to a listed file inside the theme directory/u,
    );
  });

  it('rejects a re-export outside the theme directory', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "export * from '../outside';\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'outside.ts'),
      'export const oceanTheme = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /must resolve to a listed file inside the theme directory/u,
    );
  });

  it('rejects a re-export from an unlisted theme file', async () => {
    writeCatalog([ocean]);
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'oceanTheme.ts'),
      "export * from './theme';\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'ocean', 'theme.ts'),
      'export const oceanTheme = {};\n',
    );

    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /must resolve to a listed file inside the theme directory/u,
    );
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
