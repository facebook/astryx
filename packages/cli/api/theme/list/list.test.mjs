// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {themeList, themeListAvailable} from './list.mjs';
import {BUNDLED_THEME_PACKAGE} from '../../../foundation/discovery/theme-discovery.mjs';

let tmpDir;

function installThemeIntegration(packageName = '@acme/themes', slug = 'ocean') {
  const packageDir = path.join(tmpDir, 'node_modules', ...packageName.split('/'));
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
          displayName: 'Ocean',
          description: 'Blue and calm.',
          maintained: true,
          entry: 'oceanTheme.ts',
          exportName: 'oceanTheme',
          files: ['oceanTheme.ts'],
        },
      ],
    }),
  );
  fs.writeFileSync(
    path.join(themeDir, 'oceanTheme.ts'),
    'export const oceanTheme = {};\n',
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-theme-list-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer', dependencies: {'@acme/themes': '^1.0.0'}}),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeList (bundled compatibility API)', () => {
  it('stays synchronous and preserves the original entry shape', () => {
    const result = themeList();
    expect(result.type).toBe('theme.list');
    expect(result.data.length).toBeGreaterThan(0);
    expect(Object.keys(result.data[0]).sort()).toEqual([
      'description',
      'displayName',
      'maintained',
      'slug',
    ]);
  });
});

describe('themeListAvailable (project-aware API)', () => {
  it('returns bundled themes with owner package', async () => {
    const result = await themeListAvailable({cwd: tmpDir});
    expect(result.type).toBe('theme.list');
    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.some(theme => theme.package === BUNDLED_THEME_PACKAGE),
    ).toBe(true);
  });

  it('surfaces a maintained installed integration theme', async () => {
    installThemeIntegration();
    const result = await themeListAvailable({cwd: tmpDir});
    expect(result.data).toContainEqual({
      slug: 'ocean',
      displayName: 'Ocean',
      description: 'Blue and calm.',
      maintained: true,
      package: '@acme/themes',
    });
  });

  it('filters by exact owner package', async () => {
    installThemeIntegration();
    const result = await themeListAvailable({
      cwd: tmpDir,
      package: '@acme/themes',
    });
    expect(result.data).toEqual([
      {
        slug: 'ocean',
        displayName: 'Ocean',
        description: 'Blue and calm.',
        maintained: true,
        package: '@acme/themes',
      },
    ]);
  });

  it('projects only public list fields', async () => {
    const [first] = (await themeListAvailable({cwd: tmpDir})).data;
    expect(Object.keys(first ?? {}).sort()).toEqual([
      'description',
      'displayName',
      'maintained',
      'package',
      'slug',
    ]);
  });
});
