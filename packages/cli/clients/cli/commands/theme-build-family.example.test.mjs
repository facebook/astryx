// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {build as viteBuild} from 'vite';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {defineTheme} from '@astryxdesign/core/theme';
import {themeBuildFamily} from '../../../api/theme/build/build.mjs';

vi.setConfig({testTimeout: 120_000});

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const fixture = path.join(packageRoot, 'test/fixtures/theme-family');
const members = [
  'ocean.mjs',
  'ocean-deep.mjs',
  'ocean-midnight.mjs',
  'ocean-calm.mjs',
];
let project;

beforeEach(() => {
  project = fs.mkdtempSync(
    path.join(packageRoot, '.tmp-theme-family-example-'),
  );
  fs.cpSync(fixture, project, {recursive: true});
});

afterEach(() => {
  fs.rmSync(project, {recursive: true, force: true});
});

async function buildExample() {
  return themeBuildFamily(members, {familyKey: 'ocean-family'}, {cwd: project});
}

describe('public theme-family example', () => {
  it('is runnable, relocatable, and source-equivalent as an extension base', async () => {
    await buildExample();
    const family = path.join(project, 'ocean-family');
    const currentModule = path.join(family, 'current', 'ocean-family.js');
    const generated = await import(
      `${pathToFileURL(currentModule).href}?example=${Date.now()}`
    );
    const source = await import(
      `${pathToFileURL(path.join(project, 'ocean-deep.mjs')).href}?source=${Date.now()}`
    );

    const generatedChild = defineTheme({
      name: 'ocean-extension-probe',
      extends: generated.oceanDeepTheme,
      tokens: {'--color-accent': '#00b4d8'},
      components: {button: {base: {borderStyle: 'dashed'}}},
    });
    const sourceChild = defineTheme({
      name: 'ocean-extension-probe',
      extends: source.oceanDeepTheme,
      tokens: {'--color-accent': '#00b4d8'},
      components: {button: {base: {borderStyle: 'dashed'}}},
    });
    for (const field of [
      'tokens',
      'localTokens',
      'components',
      '__onDark',
      '__onLight',
      '__adaptations',
      '__adaptationRules',
      '__axes',
      '__localTokenOwners',
      '__localTokenLineage',
    ]) {
      expect(generatedChild[field]).toEqual(sourceChild[field]);
    }
    expect(generatedChild.icons).toEqual(sourceChild.icons);
    expect(Object.keys(generatedChild.indicators)).toEqual(
      Object.keys(sourceChild.indicators),
    );

    const emitted = fs.readFileSync(currentModule, 'utf8');
    expect(emitted).not.toContain(project);
    expect(emitted).not.toMatch(/(?:import|from)\s*['"][^'"]+\.css['"]/);

    const relocated = path.join(project, 'relocated-family');
    fs.cpSync(family, relocated, {
      recursive: true,
      dereference: false,
      verbatimSymlinks: true,
    });
    expect(fs.readlinkSync(path.join(relocated, 'current'))).toMatch(
      /^generations\//,
    );
    fs.rmSync(family, {recursive: true, force: true});
    const relocatedModule = await import(
      `${pathToFileURL(path.join(relocated, 'current', 'ocean-family.js')).href}?relocated=${Date.now()}`
    );
    expect(relocatedModule.oceanMidnightTheme.name).toBe('ocean-midnight');
    expect(relocatedModule.oceanDeepTheme.icons.close).toBe('deep-close');
  });

  it('is consumed by Vite from the exact native-link and ESM files', async () => {
    await buildExample();
    await viteBuild({
      root: project,
      logLevel: 'silent',
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
    });

    const html = fs.readFileSync(path.join(project, 'dist/index.html'), 'utf8');
    expect(html).toMatch(/<link[^>]+stylesheet/);
    const assets = fs.readdirSync(path.join(project, 'dist/assets'));
    expect(assets.some(file => file.endsWith('.css'))).toBe(true);
    expect(assets.some(file => file.endsWith('.js'))).toBe(true);
  });

  it('bundles a relative icon override so current stays relocatable', async () => {
    fs.writeFileSync(
      path.join(project, 'replacement-icons.mjs'),
      `export const icons = {close: 'replacement-close'};\n`,
    );
    await themeBuildFamily(
      ['ocean.mjs', 'ocean-calm.mjs'],
      {
        familyKey: 'override-family',
        iconsSpecifier: './replacement-icons.mjs',
      },
      {cwd: project},
    );
    fs.rmSync(path.join(project, 'replacement-icons.mjs'));
    fs.rmSync(path.join(project, 'ocean-registry.mjs'));
    const built = await import(
      `${
        pathToFileURL(
          path.join(
            project,
            'override-family',
            'current',
            'override-family.js',
          ),
        ).href
      }?override=${Date.now()}`
    );
    expect(built.oceanTheme.icons.close).toBe('replacement-close');
    expect(built.oceanCalmTheme.icons.close).toBe('replacement-close');
  });

  it('rejects a missing relative icon override before publication', async () => {
    await expect(
      themeBuildFamily(
        ['ocean.mjs', 'ocean-calm.mjs'],
        {
          familyKey: 'missing-override-family',
          iconsSpecifier: './missing-icons.mjs',
        },
        {cwd: project},
      ),
    ).rejects.toThrow(/does not exist/);
    expect(fs.existsSync(path.join(project, 'missing-override-family'))).toBe(
      false,
    );

    await expect(
      themeBuildFamily(
        ['ocean.mjs', 'ocean-calm.mjs'],
        {
          familyKey: 'absolute-override-family',
          iconsSpecifier: path.join(project, 'replacement-icons.mjs'),
        },
        {cwd: project},
      ),
    ).rejects.toThrow(/must be relative .* or a bare module specifier/);
    expect(fs.existsSync(path.join(project, 'absolute-override-family'))).toBe(
      false,
    );
  });

  it('rejects one icon override for two distinct family sources', async () => {
    await expect(
      themeBuildFamily(
        members,
        {familyKey: 'ocean-family', iconsSpecifier: '@example/icons'},
        {cwd: project},
      ),
    ).rejects.toThrow(/more than one distinct family icon registry/);
    expect(fs.existsSync(path.join(project, 'ocean-family'))).toBe(false);
  });
});
