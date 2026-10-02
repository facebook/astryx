// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file Tests for generated-record and legacy default-theme resolution. */

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {resolveTheme} from './resolve-theme.mjs';
import {renderThemeModule} from '../../../foundation/config/theme-state.mjs';

/** @type {string[]} */
const dirs = [];

function fixture(pkg = {name: 'app'}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-theme-'));
  dirs.push(dir);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  return dir;
}

function installPackage(dir, owner = '@acme/themes', slug = 'ocean') {
  const packageDir = path.join(dir, 'node_modules', ...owner.split('/'));
  fs.mkdirSync(packageDir, {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({
      name: owner,
      exports: {[`./themes/${slug}`]: `./${slug}.cjs`},
    }),
  );
  const moduleFile = path.join(packageDir, `${slug}.cjs`);
  fs.writeFileSync(
    moduleFile,
    `exports.${slug}Theme = {name: '${slug}', variants: {Button: ['primary']}, fonts: {body: 'Figtree'}};\n`,
  );
  return moduleFile;
}

function writePackageRecord(dir, owner = '@acme/themes', slug = 'ocean') {
  const moduleFile = installPackage(dir, owner, slug);
  fs.writeFileSync(
    path.join(dir, 'astryx-themes.js'),
    renderThemeModule(
      [
        {
          slug,
          owner,
          exportName: `${slug}Theme`,
          module: `${owner}/themes/${slug}`,
          stylesheet: `${owner}/themes/${slug}.css`,
          moduleFile,
          stylesheetFile: path.join(path.dirname(moduleFile), `${slug}.css`),
          source: 'package',
        },
      ],
      slug,
      false,
    ),
  );
}

afterEach(() => {
  delete process.env.ASTRYX_THEME;
  while (dirs.length > 0) {
    fs.rmSync(dirs.pop(), {recursive: true, force: true});
  }
});

describe('resolveTheme generated module record', () => {
  it('loads the default built package theme without executing the app module', () => {
    const dir = fixture();
    writePackageRecord(dir);

    expect(resolveTheme(dir)).toEqual({
      name: 'ocean',
      variants: {Button: ['primary']},
      fonts: {body: 'Figtree'},
    });
  });

  it('loads a built local default', () => {
    const dir = fixture();
    const sourceDir = path.join(dir, 'src', 'themes', 'ocean');
    fs.mkdirSync(sourceDir, {recursive: true});
    const moduleFile = path.join(sourceDir, 'ocean.js');
    fs.writeFileSync(
      moduleFile,
      "exports.oceanTheme = {name: 'ocean', variants: {Card: ['quiet']}};\n",
    );
    fs.writeFileSync(
      path.join(dir, 'src', 'astryx-themes.js'),
      renderThemeModule(
        [
          {
            slug: 'ocean',
            owner: './src/themes',
            exportName: 'oceanTheme',
            module: '',
            stylesheet: '',
            moduleFile,
            stylesheetFile: path.join(sourceDir, 'ocean.css'),
            source: 'local',
          },
        ],
        'ocean',
        false,
      ),
    );

    expect(resolveTheme(dir)).toMatchObject({
      name: 'ocean',
      variants: {Card: ['quiet']},
    });
  });

  it('ignores both the environment and legacy field when a module exists', () => {
    const dir = fixture({name: 'app', astryx: {theme: './legacy.cjs'}});
    fs.writeFileSync(
      path.join(dir, 'legacy.cjs'),
      "module.exports = {name: 'legacy', variants: {}};\n",
    );
    process.env.ASTRYX_THEME = './legacy.cjs';
    writePackageRecord(dir);

    expect(resolveTheme(dir)?.name).toBe('ocean');
  });

  it('does not read ASTRYX_THEME', () => {
    const dir = fixture();
    fs.writeFileSync(
      path.join(dir, 'legacy.cjs'),
      "module.exports = {name: 'legacy', variants: {}};\n",
    );
    process.env.ASTRYX_THEME = './legacy.cjs';
    expect(resolveTheme(dir)).toBeNull();
  });
});

describe('resolveTheme legacy package field', () => {
  it('keeps package.json astryx.theme behavior when no module exists', () => {
    const dir = fixture({name: 'app', astryx: {theme: './legacy.cjs'}});
    fs.writeFileSync(
      path.join(dir, 'legacy.cjs'),
      "module.exports = {name: 'legacy', variants: {Button: ['old']}};\n",
    );
    expect(resolveTheme(dir)).toMatchObject({
      name: 'legacy',
      variants: {Button: ['old']},
    });
  });

  it.each([123, ['a'], {x: 1}, true, ''])('treats malformed value %j as absent', value => {
    expect(resolveTheme(fixture({astryx: {theme: value}}))).toBeNull();
  });

  it('returns null with no theme field', () => {
    expect(resolveTheme(fixture({name: 'app'}))).toBeNull();
  });
});
