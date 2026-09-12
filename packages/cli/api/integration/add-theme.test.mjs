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
  it('writes a valid source theme, catalog, root, package files entry, and receipt', async () => {
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
          'themes/manifest.json',
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
    expect(
      JSON.parse(
        fs.readFileSync(path.join(tmpDir, 'themes/manifest.json'), 'utf-8'),
      ),
    ).toMatchObject({
      version: 1,
      themes: [
        {
          slug: 'ocean',
          entry: 'oceanTheme.ts',
          exportName: 'oceanTheme',
          files: ['oceanTheme.ts'],
        },
      ],
    });
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
  });

  it('refuses an invalid existing catalog without changing its bytes', async () => {
    setup();
    fs.mkdirSync(path.join(tmpDir, 'themes'));
    const catalog = path.join(tmpDir, 'themes', 'manifest.json');
    fs.writeFileSync(catalog, '{not-json\n');

    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_INVALID'});
    expect(fs.readFileSync(catalog, 'utf-8')).toBe('{not-json\n');
    expect(fs.existsSync(path.join(tmpDir, 'themes', 'ocean'))).toBe(false);
  });

  it('refuses duplicate themes and existing source files', async () => {
    setup();
    await integrationAddTheme('ocean', {cwd: tmpDir});
    await expect(
      integrationAddTheme('ocean', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_FILE_EXISTS'});
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
