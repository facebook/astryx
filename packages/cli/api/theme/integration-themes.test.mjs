// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {themeAdd} from './add/add.mjs';

let tmpDir;

function installThemeIntegration(
  packageName,
  slug,
  source = 'export const oceanTheme = {};\n',
  extraFiles = {},
) {
  const packageDir = path.join(
    tmpDir,
    'node_modules',
    ...packageName.split('/'),
  );
  const themeDir = path.join(packageDir, 'themes', slug);
  fs.mkdirSync(themeDir, {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({name: packageName, version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    `export default {themes: './themes'};\n`,
  );
  fs.writeFileSync(
    path.join(packageDir, 'themes', 'manifest.json'),
    JSON.stringify({
      version: 1,
      themes: [
        {
          slug,
          displayName: slug === 'neutral' ? 'Neutral Plus' : 'Ocean',
          description: 'Integration-owned theme.',
          maintained: true,
          entry: 'oceanTheme.ts',
          exportName: 'oceanTheme',
          files: ['oceanTheme.ts', ...Object.keys(extraFiles)],
        },
      ],
    }),
  );
  fs.writeFileSync(path.join(themeDir, 'oceanTheme.ts'), source);
  for (const [relativePath, contents] of Object.entries(extraFiles)) {
    const file = path.join(themeDir, relativePath);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, contents);
  }
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-theme-integration-'),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      dependencies: {'@acme/themes': '^1.0.0'},
    }),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeAdd with integration themes', () => {
  it('copies source from an installed integration and records its owner', async () => {
    installThemeIntegration('@acme/themes', 'ocean');
    const result = await themeAdd('ocean', {cwd: tmpDir});

    expect(result.data.package).toBe('@acme/themes');
    expect(result.data.outputDir).toBe(path.join('src', 'themes', 'ocean'));
    expect(
      fs.readFileSync(
        path.join(tmpDir, 'src', 'themes', 'ocean', 'oceanTheme.ts'),
        'utf-8',
      ),
    ).toContain('oceanTheme');
  });

  it('copies nested files listed by an integration theme catalog', async () => {
    installThemeIntegration(
      '@acme/themes',
      'ocean',
      "import {oceanBlue} from './tokens/colors';\nexport const oceanTheme = {oceanBlue};\n",
      {'tokens/colors.ts': "export const oceanBlue = '#0064e0';\n"},
    );

    const result = await themeAdd('ocean', {cwd: tmpDir});

    expect(result.data.files).toEqual(['oceanTheme.ts', 'tokens/colors.ts']);
    expect(
      fs.readFileSync(
        path.join(tmpDir, 'src', 'themes', 'ocean', 'tokens', 'colors.ts'),
        'utf-8',
      ),
    ).toContain('oceanBlue');
  });

  it('fails closed on a duplicate slug and resolves it with package scope', async () => {
    installThemeIntegration('@acme/themes', 'neutral');

    await expect(themeAdd('neutral', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_AMBIGUOUS_THEME',
    });
    const result = await themeAdd('neutral', {
      cwd: tmpDir,
      package: '@acme/themes',
    });
    expect(result.data.package).toBe('@acme/themes');
  });

  it('reports a selected installed package with a corrupted theme catalog', async () => {
    installThemeIntegration(
      '@acme/themes',
      'ocean',
      "export {oceanBlue} from './tokens/colors';\n",
      {'tokens/colors.ts': "export const oceanBlue = '#0064e0';\n"},
    );
    fs.rmSync(
      path.join(
        tmpDir,
        'node_modules',
        '@acme',
        'themes',
        'themes',
        'ocean',
        'tokens',
        'colors.ts',
      ),
    );

    await expect(
      themeAdd('ocean', {cwd: tmpDir, package: '@acme/themes'}),
    ).rejects.toMatchObject({
      code: 'ERR_THEME_INVALID',
      message: expect.stringContaining('tokens/colors.ts'),
    });
  });

  it('reports an unknown package selection without falling back to another owner', async () => {
    installThemeIntegration('@acme/themes', 'ocean');
    await expect(
      themeAdd('ocean', {cwd: tmpDir, package: '@other/themes'}),
    ).rejects.toMatchObject({code: 'ERR_UNKNOWN_THEME'});
  });
});
