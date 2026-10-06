// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {integrationAddTheme} from './add-theme.mjs';
import {validateLocalIntegration} from './validate-integration.mjs';

let tmpDir;

function setup({
  manifest = 'export default {};\n',
  files = ['dist'],
  includeFiles = true,
} = {}) {
  /** @type {{name: string, version: string, files?: string[]}} */
  const pkg = {name: '@acme/themes', version: '1.0.0'};
  if (includeFiles) pkg.files = files;
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(pkg, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(tmpDir, 'astryx.integration.mjs'), manifest);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-add-theme-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integrationAddTheme', () => {
  it('writes a typed same-stem descriptor and source with no central catalog', async () => {
    setup();
    const result = await integrationAddTheme('ocean', {cwd: tmpDir});

    expect(result).toEqual({
      type: 'integration.add',
      data: {
        kind: 'theme',
        name: 'ocean',
        root: {path: './themes', created: true},
        manifest: 'astryx.integration.mjs',
        files: [
          'themes/ocean/oceanTheme.ts',
          'themes/ocean/oceanTheme.doc.mjs',
          'package.json',
          'astryx.integration.mjs',
        ],
        written: true,
        dryRun: false,
      },
    });
    expect(
      fs.readFileSync(path.join(tmpDir, 'themes/ocean/oceanTheme.ts'), 'utf-8'),
    ).toContain('export const oceanTheme = defineTheme');

    const descriptor = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.doc.mjs'),
      'utf-8',
    );
    expect(descriptor).toContain("@astryxdesign/cli/authoring').ThemeDoc");
    expect(descriptor).toContain("type: 'theme'");
    expect(descriptor).toContain("name: 'ocean'");
    expect(fs.existsSync(path.join(tmpDir, 'themes/manifest.json'))).toBe(
      false,
    );
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toContain("themes: './themes'");
    expect(
      JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'))
        .files,
    ).toEqual(['dist', 'themes', 'astryx.integration.mjs']);
    expect((await validateLocalIntegration(tmpDir)).issues).toEqual([]);
  });

  it('declares the optional CLI peer that reads typed theme descriptors', async () => {
    setup({includeFiles: false});
    const result = await integrationAddTheme('ocean', {cwd: tmpDir});
    expect(result.data.files).toContain('package.json');
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.peerDependencies).toEqual({'@astryxdesign/cli': '>=0.6.4'});
    expect(pkg.peerDependenciesMeta).toEqual({
      '@astryxdesign/cli': {optional: true},
    });
  });

  it('keeps a CLI peer that already reads typed theme descriptors', async () => {
    const pkg = {
      name: '@acme/themes',
      version: '1.0.0',
      peerDependencies: {'@astryxdesign/cli': '^0.7.2'},
    };
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default {};\n',
    );
    const result = await integrationAddTheme('ocean', {cwd: tmpDir});
    expect(result.data.files).not.toContain('package.json');
    expect(
      JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')),
    ).toEqual(pkg);
  });

  it('dry-runs the identical receipt without writing anything', async () => {
    setup();
    const beforeManifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    const result = await integrationAddTheme('ocean', {
      cwd: tmpDir,
      dryRun: true,
    });

    expect(result.data.written).toBe(false);
    expect(result.data.dryRun).toBe(true);
    expect(result.data.root).toEqual({path: './themes', created: true});
    expect(result.data.files).toContain('themes/ocean/oceanTheme.ts');
    expect(result.data.files).toContain('themes/ocean/oceanTheme.doc.mjs');
    expect(fs.existsSync(path.join(tmpDir, 'themes'))).toBe(false);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toBe(beforeManifest);
  });

  it('does not create package.json files when the package had no allowlist', async () => {
    setup({includeFiles: false});
    await integrationAddTheme('ocean', {cwd: tmpDir});
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg).not.toHaveProperty('files');
    expect(pkg).not.toHaveProperty('exports');
  });

  it('uses an author-declared custom root without rewriting it', async () => {
    setup({
      manifest: `export default {themes: './src/themes'};\n`,
      files: undefined,
    });
    fs.mkdirSync(path.join(tmpDir, 'src/themes'), {recursive: true});
    const result = await integrationAddTheme('ocean', {cwd: tmpDir});

    expect(result.data.root).toEqual({path: './src/themes', created: false});
    expect(result.data.files).not.toContain('astryx.integration.mjs');
    expect(
      fs.existsSync(path.join(tmpDir, 'src/themes/ocean/oceanTheme.ts')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'src/themes/ocean/oceanTheme.doc.mjs')),
    ).toBe(true);
  });

  it('keeps each theme to its own folder: a second theme touches no shared file', async () => {
    setup({manifest: "export default {themes: './themes'};\n"});
    await integrationAddTheme('ocean', {cwd: tmpDir});
    const shared = ['package.json', 'astryx.integration.mjs'].map(file =>
      fs.readFileSync(path.join(tmpDir, file), 'utf-8'),
    );

    const result = await integrationAddTheme('reef', {cwd: tmpDir});

    expect(result.data.files).toEqual([
      'themes/reef/reefTheme.ts',
      'themes/reef/reefTheme.doc.mjs',
    ]);
    expect(fs.readdirSync(path.join(tmpDir, 'themes')).sort()).toEqual([
      'ocean',
      'reef',
    ]);
    expect(
      ['package.json', 'astryx.integration.mjs'].map(file =>
        fs.readFileSync(path.join(tmpDir, file), 'utf-8'),
      ),
    ).toEqual(shared);
  });

  it('refuses an obsolete central catalog without changing its bytes', async () => {
    setup();
    fs.mkdirSync(path.join(tmpDir, 'themes'));
    const catalog = path.join(tmpDir, 'themes', 'manifest.json');
    fs.writeFileSync(catalog, '{"version":1}\n');

    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_INVALID'});
    expect(fs.readFileSync(catalog, 'utf-8')).toBe('{"version":1}\n');
    expect(fs.existsSync(path.join(tmpDir, 'themes', 'ocean'))).toBe(false);
  });

  it('refuses an invalid existing descriptor without changing it', async () => {
    setup();
    const existing = path.join(tmpDir, 'themes', 'forest');
    fs.mkdirSync(existing, {recursive: true});
    const descriptor = path.join(existing, 'forestTheme.doc.mjs');
    fs.writeFileSync(descriptor, 'export default {type: "theme"};\n');
    fs.writeFileSync(
      path.join(existing, 'forestTheme.ts'),
      'export const forestTheme = {};\n',
    );

    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_INVALID'});
    expect(fs.readFileSync(descriptor, 'utf-8')).toBe(
      'export default {type: "theme"};\n',
    );
    expect(fs.existsSync(path.join(tmpDir, 'themes', 'ocean'))).toBe(false);
  });

  it('refuses a duplicate valid theme directory', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir});
    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_FILE_EXISTS'});
  });

  it('refuses an existing invalid theme directory', async () => {
    setup();
    fs.mkdirSync(path.join(tmpDir, 'themes', 'ocean'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'oceanTheme.ts'),
      'export const oceanTheme = {};\n',
    );
    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_INVALID'});
  });

  it.each([
    ['an empty folder', []],
    ['a folder holding .gitkeep', ['.gitkeep']],
    ['a folder holding NOTES.md', ['NOTES.md']],
  ])('fills %s', async (_, files) => {
    setup();
    const dir = path.join(tmpDir, 'themes', 'ocean');
    fs.mkdirSync(dir, {recursive: true});
    for (const file of files) fs.writeFileSync(path.join(dir, file), 'x\n');
    const result = await integrationAddTheme('ocean', {cwd: tmpDir});
    expect(result.data.written).toBe(true);
    expect(fs.readdirSync(dir).sort()).toEqual(
      [...files, 'oceanTheme.doc.mjs', 'oceanTheme.ts'].sort(),
    );
  });

  it('refuses to overwrite a file it would write', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir});
    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
      message:
        'Refusing to overwrite existing file themes/ocean/oceanTheme.ts.',
    });
  });

  it.each(['../ocean', 'Ocean', 'ocean theme', '.ocean'])(
    'refuses unsafe or noncanonical name %s',
    async name => {
      setup();
      await expect(
        integrationAddTheme(name, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_ARGUMENT',
      });
    },
  );

  it('creates the integration manifest on the first add', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'plain', files: []}),
    );
    const result = await integrationAddTheme('ocean', {cwd: tmpDir});

    expect(result.data.manifest).toBe('astryx.integration.mjs');
    expect(
      result.data.files.filter(file => file === result.data.manifest),
    ).toHaveLength(1);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toContain("themes: './themes'");
    expect(
      JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'))
        .files,
    ).toEqual(['themes', 'astryx.integration.mjs']);
  });

  it('plans manifest creation without writing it under dry-run', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"plain"}\n');
    const result = await integrationAddTheme('ocean', {
      cwd: tmpDir,
      dryRun: true,
    });
    expect(result.data.files).toContain('astryx.integration.mjs');
    expect(fs.existsSync(path.join(tmpDir, 'astryx.integration.mjs'))).toBe(
      false,
    );
  });
});

describe('integrationAddTheme --from', () => {
  it('forks a bundled theme into the integration package', async () => {
    setup();
    const result = await integrationAddTheme('ocean', {
      cwd: tmpDir,
      from: 'neutral',
    });

    expect(result.type).toBe('integration.add');
    expect(result.data.kind).toBe('theme');
    expect(result.data.name).toBe('ocean');
    expect(result.data.from).toBe('neutral');
    expect(result.data.written).toBe(true);
    expect(result.data.dryRun).toBe(false);
    expect(result.data.root).toEqual({path: './themes', created: true});

    // The entry file must exist with the new export name.
    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.ts'),
      'utf-8',
    );
    expect(entry).toContain('oceanTheme');
    expect(entry).toContain("name: 'ocean'");
    // It must NOT contain the original theme identifier as a prefix.
    expect(entry).not.toMatch(/\bneutralTheme\b/);
    expect(entry).not.toMatch(/\bneutralPalettes\b/);
    expect(entry).not.toMatch(/\bneutralSyntax\b/);
    expect(entry).toContain('defineTheme');

    // A fresh descriptor, not copied from the base.
    const descriptor = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.doc.mjs'),
      'utf-8',
    );
    expect(descriptor).toContain("name: 'ocean'");
    expect(descriptor).toContain("@astryxdesign/cli/authoring').ThemeDoc");
    expect(descriptor).toContain('maintained: true');

    // The theme must validate.
    expect((await validateLocalIntegration(tmpDir)).issues).toEqual([]);
  });

  it('renames palette and support files from the base theme', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});

    const themeDir = path.join(tmpDir, 'themes/ocean');
    const files = fs.readdirSync(themeDir).sort();
    // neutralPalettes.ts → oceanPalettes.ts, etc.
    expect(files).toContain('oceanTheme.ts');
    expect(files).toContain('oceanTheme.doc.mjs');
    expect(files).toContain('oceanPalettes.ts');
    expect(files).toContain('oceanPaletteRefs.generated.ts');
    expect(files).toContain('icons.tsx');
    // Must not contain any file starting with 'neutral'.
    expect(files.filter(f => f.startsWith('neutral'))).toEqual([]);
  });

  it('rewrites import paths inside forked files', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});

    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.ts'),
      'utf-8',
    );
    // Import references must use the new identifier.
    expect(entry).toContain('./oceanPaletteRefs.generated');
    expect(entry).not.toContain('./neutralPaletteRefs.generated');
    // The icon registry import must also be renamed.
    expect(entry).toContain('oceanIconRegistry');
    expect(entry).not.toContain('neutralIconRegistry');
  });

  it('rewrites CSS custom properties scoped to the base theme', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});

    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.ts'),
      'utf-8',
    );
    expect(entry).toContain('--astryx-theme-ocean-');
    expect(entry).not.toContain('--astryx-theme-neutral-');
  });

  it('rewrites the syntax theme name', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});

    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.ts'),
      'utf-8',
    );
    expect(entry).toContain("'astryx-ocean'");
    expect(entry).not.toContain("'astryx-neutral'");
  });

  it('strips the copyright header from forked files', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});

    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/ocean/oceanTheme.ts'),
      'utf-8',
    );
    expect(entry).not.toContain('Copyright (c) Meta Platforms');
  });

  it('includes data.from in the receipt only when --from is used', async () => {
    setup();
    const blank = await integrationAddTheme('plain', {cwd: tmpDir});
    expect(blank.data).not.toHaveProperty('from');

    const forked = await integrationAddTheme('ocean', {
      cwd: tmpDir,
      from: 'neutral',
    });
    expect(forked.data.from).toBe('neutral');
  });

  it('refuses to fork a theme into itself', async () => {
    setup();
    await expect(
      integrationAddTheme('neutral', {cwd: tmpDir, from: 'neutral'}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('refuses an unknown base theme with a helpful suggestion list', async () => {
    setup();
    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir, from: 'nonexistent'}),
    ).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_THEME',
      message: expect.stringContaining('nonexistent'),
    });
  });

  it('dry-runs with --from without writing anything', async () => {
    setup();
    const result = await integrationAddTheme('ocean', {
      cwd: tmpDir,
      from: 'neutral',
      dryRun: true,
    });

    expect(result.data.written).toBe(false);
    expect(result.data.dryRun).toBe(true);
    expect(result.data.from).toBe('neutral');
    expect(result.data.files).toContain('themes/ocean/oceanTheme.ts');
    expect(result.data.files).toContain('themes/ocean/oceanTheme.doc.mjs');
    expect(fs.existsSync(path.join(tmpDir, 'themes'))).toBe(false);
  });

  it('refuses to overwrite when the target already exists', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});
    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'}),
    ).rejects.toMatchObject({code: 'ERR_FILE_EXISTS'});
  });

  it('works with different bundled themes', async () => {
    setup();
    const result = await integrationAddTheme('dusk', {
      cwd: tmpDir,
      from: 'gothic',
    });

    expect(result.data.from).toBe('gothic');
    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/dusk/duskTheme.ts'),
      'utf-8',
    );
    expect(entry).toContain('duskTheme');
    expect(entry).toContain("name: 'dusk'");
    expect(entry).not.toMatch(/\bgothicTheme\b/);
    expect((await validateLocalIntegration(tmpDir)).issues).toEqual([]);
  });

  it('forks from a theme the package already owns', async () => {
    setup();
    // First, add a blank theme.
    await integrationAddTheme('base', {cwd: tmpDir});
    // Then fork it.
    const result = await integrationAddTheme('variant', {
      cwd: tmpDir,
      from: 'base',
    });

    expect(result.data.from).toBe('base');
    const entry = fs.readFileSync(
      path.join(tmpDir, 'themes/variant/variantTheme.ts'),
      'utf-8',
    );
    expect(entry).toContain('variantTheme');
    expect(entry).toContain("name: 'variant'");
    expect((await validateLocalIntegration(tmpDir)).issues).toEqual([]);
  });

  it('declares the optional CLI peer that reads typed theme descriptors', async () => {
    setup({includeFiles: false});
    await integrationAddTheme('ocean', {cwd: tmpDir, from: 'neutral'});
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.peerDependencies).toEqual({'@astryxdesign/cli': '>=0.6.4'});
    expect(pkg.peerDependenciesMeta).toEqual({
      '@astryxdesign/cli': {optional: true},
    });
  });
});
