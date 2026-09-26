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
