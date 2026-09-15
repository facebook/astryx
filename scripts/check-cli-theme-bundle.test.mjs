// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drift guard for the bundled CLI themes.
 *
 * `scripts/generate-cli-themes.mjs` copies each public theme's source,
 * strongly typed same-stem descriptor, and supported authoring artifacts into
 * the CLI bundle. This test pins every copied byte and rejects the obsolete
 * central catalog. When a theme changes, run `pnpm bundle:cli-themes` and commit
 * the regenerated bundle.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const THEMES_SRC_ROOT = path.join(REPO_ROOT, 'packages', 'themes');
const CLI_THEMES_OUT = path.join(
  REPO_ROOT,
  'packages',
  'cli',
  'assets',
  'templates',
  'themes',
);

const toIdentifier = slug =>
  slug.replace(/-([a-z])/g, (_, character) => character.toUpperCase());

const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf-8'));

/** @param {string} directory @param {string} [prefix] */
function filesUnder(directory, prefix = '') {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const relative = prefix ? path.join(prefix, entry.name) : entry.name;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(full, relative));
    else if (entry.isFile()) files.push(relative.split(path.sep).join('/'));
  }
  return files.sort();
}

/** Theme slugs discovered the same way the generator discovers them. */
function themeSlugs() {
  if (!fs.existsSync(THEMES_SRC_ROOT)) return [];
  return fs
    .readdirSync(THEMES_SRC_ROOT, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(slug => {
      const stem = `${toIdentifier(slug)}Theme`;
      const sourceDir = path.join(THEMES_SRC_ROOT, slug, 'src');
      const source = path.join(sourceDir, `${stem}.ts`);
      const descriptor = path.join(sourceDir, `${stem}.doc.mjs`);
      if (!fs.existsSync(source) || !fs.existsSync(descriptor)) return false;
      const pkg = path.join(THEMES_SRC_ROOT, slug, 'package.json');
      return !fs.existsSync(pkg) || readJSON(pkg).private !== true;
    })
    .sort();
}

/** @param {string} slug */
function expectedFiles(slug) {
  const id = toIdentifier(slug);
  const sourceDir = path.join(THEMES_SRC_ROOT, slug, 'src');
  const candidates = [
    {source: path.join(sourceDir, `${id}Theme.ts`), output: `${id}Theme.ts`},
    {
      source: path.join(sourceDir, `${id}Theme.doc.mjs`),
      output: `${id}Theme.doc.mjs`,
    },
    {source: path.join(sourceDir, 'icons.tsx'), output: 'icons.tsx'},
    {
      source: path.join(sourceDir, `${id}Palettes.ts`),
      output: `${id}Palettes.ts`,
    },
    {
      source: path.join(sourceDir, `${id}Palettes.generated.ts`),
      output: `${id}Palettes.generated.ts`,
    },
    {
      source: path.join(sourceDir, `${id}PaletteRefs.generated.ts`),
      output: `${id}PaletteRefs.generated.ts`,
    },
    {
      source: path.join(sourceDir, `${id}Palettes.generated.receipt.json`),
      output: `${id}Palettes.generated.receipt.json`,
    },
    {
      source: path.join(THEMES_SRC_ROOT, slug, 'palette.config.json'),
      output: 'palette.config.json',
    },
  ];
  return candidates.filter(file => fs.existsSync(file.source));
}

/** Theme dirs that exist but must never reach the CLI tarball. */
function privateThemeSlugs() {
  if (!fs.existsSync(THEMES_SRC_ROOT)) return [];
  return fs
    .readdirSync(THEMES_SRC_ROOT, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(slug => {
      const pkg = path.join(THEMES_SRC_ROOT, slug, 'package.json');
      return fs.existsSync(pkg) && readJSON(pkg).private === true;
    })
    .sort();
}

describe('CLI theme bundle is in sync with source', () => {
  const slugs = themeSlugs();

  it('discovers at least one theme to check', () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  for (const slug of slugs) {
    it(`${slug}: bundled directory matches source (run \`pnpm bundle:cli-themes\`)`, () => {
      const bundledDir = path.join(CLI_THEMES_OUT, slug);
      const expected = expectedFiles(slug);
      expect(filesUnder(bundledDir)).toEqual(
        expected.map(file => file.output).sort(),
      );
      for (const file of expected) {
        expect(fs.readFileSync(path.join(bundledDir, file.output))).toEqual(
          fs.readFileSync(file.source),
        );
      }
    });
  }

  for (const slug of privateThemeSlugs()) {
    it(`${slug}: private theme package is not shipped to CLI users`, () => {
      expect(
        fs.existsSync(path.join(CLI_THEMES_OUT, slug)),
        `packages/themes/${slug} is private but is bundled into the CLI — ` +
          'it would be offered by `astryx theme add`',
      ).toBe(false);
    });
  }

  it('bundles exactly the discovered themes and no central catalog', () => {
    const bundled = fs
      .readdirSync(CLI_THEMES_OUT, {withFileTypes: true})
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort();
    expect(bundled).toEqual(slugs);
    expect(fs.existsSync(path.join(CLI_THEMES_OUT, 'manifest.json'))).toBe(
      false,
    );
  });
});
