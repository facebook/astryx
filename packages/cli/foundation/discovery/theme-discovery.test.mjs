// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  BUNDLED_THEME_PACKAGE,
  discoverBundledThemes,
  discoverIntegrationThemes,
  discoverThemeDirectory,
} from './theme-discovery.mjs';

let tmpDir;

/** @param {Record<string, unknown>} doc */
function descriptorSource(doc) {
  return `/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\nexport default ${JSON.stringify(doc, null, 2)};\n`;
}

/**
 * @param {{slug?: string, stem?: string, extension?: string, source?: string,
 *   doc?: Record<string, unknown>, files?: Record<string, string>}} [options]
 */
function writeTheme({
  slug = 'ocean',
  stem = 'oceanTheme',
  extension = '.ts',
  source = `export const ${stem} = {};\n`,
  doc = {},
  files = {},
} = {}) {
  const themeDir = path.join(tmpDir, slug);
  fs.mkdirSync(themeDir, {recursive: true});
  fs.writeFileSync(path.join(themeDir, `${stem}${extension}`), source);
  fs.writeFileSync(
    path.join(themeDir, `${stem}.doc.mjs`),
    descriptorSource({
      type: 'theme',
      name: slug,
      displayName: 'Ocean',
      description: 'Blue and calm.',
      maintained: true,
      ...doc,
    }),
  );
  for (const [file, contents] of Object.entries(files)) {
    const target = path.join(themeDir, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, contents);
  }
  return themeDir;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-descriptor-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme descriptor discovery', () => {
  it('reads bundled descriptors with package ownership', () => {
    const themes = discoverBundledThemes();
    expect(themes.length).toBeGreaterThan(0);
    expect(themes.every(theme => theme.package === BUNDLED_THEME_PACKAGE)).toBe(
      true,
    );
    expect(themes.every(theme => theme.bundled)).toBe(true);
    expect(
      themes.filter(theme => theme.maintained).map(theme => theme.slug),
    ).toEqual(['neutral']);
    expect(themes.every(theme => theme.docPath.endsWith('.doc.mjs'))).toBe(
      true,
    );
  });

  it('derives source entry and runtime export from the shared stem', () => {
    writeTheme();
    expect(discoverThemeDirectory(tmpDir, '@acme/themes')).toEqual([
      expect.objectContaining({
        slug: 'ocean',
        displayName: 'Ocean',
        description: 'Blue and calm.',
        maintained: true,
        entry: 'oceanTheme.ts',
        exportName: 'oceanTheme',
        files: ['oceanTheme.doc.mjs', 'oceanTheme.ts'],
        package: '@acme/themes',
        sourceDir: path.join(tmpDir, 'ocean'),
        docPath: path.join(tmpDir, 'ocean', 'oceanTheme.doc.mjs'),
        bundled: false,
      }),
    ]);
  });

  it('parses source without executing it', async () => {
    writeTheme({
      source:
        "throw new Error('theme source executed');\nexport const oceanTheme = {};\n",
    });
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({slug: 'ocean', exportName: 'oceanTheme'}),
    ]);
  });

  it('rejects an untyped descriptor', () => {
    const themeDir = writeTheme();
    fs.writeFileSync(
      path.join(themeDir, 'oceanTheme.doc.mjs'),
      "export default {type: 'theme', name: 'ocean', displayName: 'Ocean', description: '', maintained: true};\n",
    );
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /must declare its public ThemeDoc type/u,
    );
  });

  it('rejects a descriptor module with executable statements', () => {
    const themeDir = writeTheme();
    fs.writeFileSync(
      path.join(themeDir, 'oceanTheme.doc.mjs'),
      `throw new Error('descriptor executed');\n${descriptorSource({
        type: 'theme',
        name: 'ocean',
        displayName: 'Ocean',
        description: 'Blue and calm.',
        maintained: true,
      })}`,
    );
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /only its static default-exported ThemeDoc object/u,
    );
  });

  it('rejects an entry that does not export its inferred runtime name', async () => {
    writeTheme({source: 'export const anotherTheme = {};\n'});
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/does not export "oceanTheme"/u);
  });

  it('rejects a type-only export of its inferred runtime name', async () => {
    writeTheme({source: 'export type oceanTheme = {};\n'});
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/does not export "oceanTheme"/u);
  });

  it('rejects an unbound source-less export specifier', async () => {
    writeTheme({source: 'export {oceanTheme};\n'});
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(
      /could not be parsed: Export 'oceanTheme' is not defined/u,
    );
  });

  it('accepts a source-less export backed by a local runtime declaration', async () => {
    writeTheme({source: 'const oceanTheme = {};\nexport {oceanTheme};\n'});
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toHaveLength(1);
  });

  it('follows imported aliases and local re-exports without execution', async () => {
    writeTheme({
      source:
        "import {theme as oceanTheme} from './tokens/theme';\nexport {oceanTheme};\n",
      files: {
        'tokens/theme.ts':
          "throw new Error('nested source executed');\nexport const theme = {};\n",
      },
    });
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toEqual([
      expect.objectContaining({
        files: ['oceanTheme.doc.mjs', 'oceanTheme.ts', 'tokens/theme.ts'],
      }),
    ]);
  });

  it('follows a default re-export', async () => {
    writeTheme({
      source: "export {default as oceanTheme} from './theme';\n",
      files: {'theme.ts': 'export default {};\n'},
    });
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toHaveLength(1);
  });

  it('follows an export-all barrel', async () => {
    writeTheme({
      source: "export * from './theme';\n",
      files: {'theme.ts': 'export const oceanTheme = {};\n'},
    });
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toHaveLength(1);
  });

  it('accepts a runtime binding imported from a package', async () => {
    writeTheme({
      source:
        "import {defineTheme as oceanTheme} from '@astryxdesign/core/theme';\nexport {oceanTheme};\n",
    });
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).resolves.toHaveLength(1);
  });

  it('copies unreferenced nested authoring artifacts as part of the directory', () => {
    writeTheme({
      files: {
        'tokens/ocean.palette.ts': 'export const palette = {};\n',
        'receipts/palette.json': '{"version":1}\n',
      },
    });
    expect(discoverThemeDirectory(tmpDir, '@acme/themes')[0].files).toEqual([
      'oceanTheme.doc.mjs',
      'oceanTheme.ts',
      'receipts/palette.json',
      'tokens/ocean.palette.ts',
    ]);
  });

  it('rejects a theme source that imports its descriptor', async () => {
    writeTheme({
      source:
        "import metadata from './oceanTheme.doc.mjs';\nvoid metadata;\nexport const oceanTheme = {};\n",
    });
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/must not import its descriptor "oceanTheme\.doc\.mjs"/u);
  });

  it('rejects a local import outside the theme directory', async () => {
    writeTheme({
      source:
        "import {palette} from '../outside';\nexport const oceanTheme = {palette};\n",
    });
    fs.writeFileSync(
      path.join(tmpDir, 'outside.ts'),
      'export const palette = {};\n',
    );
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/must resolve to a file inside the theme directory/u);
  });

  it('rejects a literal dynamic import outside the theme directory', async () => {
    writeTheme({
      extension: '.mjs',
      source: "void import('../extra.mjs');\nexport const oceanTheme = {};\n",
    });
    fs.writeFileSync(
      path.join(tmpDir, 'extra.mjs'),
      'export const extra = {};\n',
    );
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/must resolve to a file inside the theme directory/u);
  });

  it('rejects a local re-export outside the theme directory', async () => {
    writeTheme({source: "export * from '../outside';\n"});
    fs.writeFileSync(
      path.join(tmpDir, 'outside.ts'),
      'export const oceanTheme = {};\n',
    );
    await expect(
      discoverIntegrationThemes({name: '@acme/themes', themes: tmpDir}),
    ).rejects.toThrow(/must resolve to a file inside the theme directory/u);
  });

  it('rejects the obsolete central manifest even when descriptors exist', () => {
    writeTheme();
    fs.writeFileSync(path.join(tmpDir, 'manifest.json'), '{"version":1}\n');
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /unsupported manifest\.json/u,
    );
  });

  it('rejects a descriptor placed at the themes root', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'oceanTheme.doc.mjs'),
      descriptorSource({
        type: 'theme',
        name: 'ocean',
        displayName: 'Ocean',
        description: '',
        maintained: true,
      }),
    );
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /must be inside a lower-kebab theme directory/u,
    );
  });

  it('rejects a missing descriptor', () => {
    const dir = path.join(tmpDir, 'ocean');
    fs.mkdirSync(dir);
    fs.writeFileSync(
      path.join(dir, 'oceanTheme.ts'),
      'export const oceanTheme = {};\n',
    );
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /exactly one same-stem \.doc\.mjs descriptor; found 0/u,
    );
  });

  it('rejects more than one descriptor', () => {
    const dir = writeTheme();
    fs.writeFileSync(
      path.join(dir, 'other.doc.mjs'),
      descriptorSource({
        type: 'theme',
        name: 'ocean',
        displayName: 'Other',
        description: '',
        maintained: false,
      }),
    );
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /exactly one same-stem \.doc\.mjs descriptor; found 2/u,
    );
  });

  it('rejects missing and ambiguous same-stem source files', () => {
    const dir = writeTheme();
    fs.rmSync(path.join(dir, 'oceanTheme.ts'));
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /exactly one same-stem source.*found 0/u,
    );

    fs.writeFileSync(
      path.join(dir, 'oceanTheme.ts'),
      'export const oceanTheme = {};\n',
    );
    fs.writeFileSync(
      path.join(dir, 'oceanTheme.mjs'),
      'export const oceanTheme = {};\n',
    );
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /exactly one same-stem source.*found 2/u,
    );
  });

  it('rejects descriptor identity that differs from its directory', () => {
    writeTheme({doc: {name: 'sea'}});
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /names "sea" but its directory is "ocean"/u,
    );
  });

  it('rejects malformed descriptor fields and unknown catalog-era fields', () => {
    writeTheme({doc: {maintained: 'yes'}});
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /maintained/u,
    );

    fs.rmSync(path.join(tmpDir, 'ocean'), {recursive: true});
    writeTheme({doc: {entry: 'oceanTheme.ts'}});
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /unrecognized key|entry/iu,
    );
  });

  it('rejects invalid theme directory and source stem names', () => {
    writeTheme({slug: 'Ocean'});
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /invalid directory/u,
    );

    fs.rmSync(path.join(tmpDir, 'Ocean'), {recursive: true});
    writeTheme({stem: 'ocean-theme'});
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /not a valid runtime export name/u,
    );
  });

  it('rejects symlinks inside the copy boundary', () => {
    const dir = writeTheme();
    const outside = path.join(tmpDir, 'outside.json');
    fs.writeFileSync(outside, '{}\n');
    fs.symlinkSync(outside, path.join(dir, 'outside.json'));
    expect(() => discoverThemeDirectory(tmpDir, '@acme/themes')).toThrow(
      /contains symlink/u,
    );
  });
});
