// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drift guard for the bundled CLI themes.
 *
 * `scripts/generate-cli-themes.mjs` copies each theme's source verbatim into
 * `packages/cli/assets/templates/themes/` so `astryx theme add` can scaffold a
 * theme without the package installed. Nothing verified the bundle stayed in
 * sync with source, so the neutral theme's WCAG text-secondary fix (and a
 * StatusDot override block) shipped to source but never reached the bundle —
 * `astryx theme add neutral` scaffolded a theme below AA contrast. This test
 * pins the copies to their source byte-for-byte; when a theme changes, run
 * `pnpm bundle:cli-themes` and commit the regenerated bundle.
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

const toIdentifier = (slug) =>
  slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

/** Theme slugs discovered the same way the generator discovers them. */
function themeSlugs() {
  if (!fs.existsSync(THEMES_SRC_ROOT)) return [];
  return fs
    .readdirSync(THEMES_SRC_ROOT, {withFileTypes: true})
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((slug) => {
      const themeFile = path.join(
        THEMES_SRC_ROOT,
        slug,
        'src',
        `${toIdentifier(slug)}Theme.ts`,
      );
      if (!fs.existsSync(themeFile)) return false;
      // Private packages are not themes a user can pick — packages/themes/probe
      // is a generated visual-gate fixture. The generator skips them, so this
      // discovery must too, or it would demand the fixture be bundled.
      const pkg = path.join(THEMES_SRC_ROOT, slug, 'package.json');
      return !fs.existsSync(pkg) || readJSON(pkg).private !== true;
    })
    .sort();
}

/** Theme dirs that exist but must never reach the CLI tarball. */
function privateThemeSlugs() {
  if (!fs.existsSync(THEMES_SRC_ROOT)) return [];
  return fs
    .readdirSync(THEMES_SRC_ROOT, {withFileTypes: true})
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((slug) => {
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
    const id = toIdentifier(slug);
    const themeFileName = `${id}Theme.ts`;
    const src = path.join(THEMES_SRC_ROOT, slug, 'src', themeFileName);
    const bundled = path.join(CLI_THEMES_OUT, slug, themeFileName);

    it(`${slug}: bundled ${themeFileName} matches source (run \`pnpm bundle:cli-themes\`)`, () => {
      expect(
        fs.existsSync(bundled),
        `missing bundled theme: ${path.relative(REPO_ROOT, bundled)}`,
      ).toBe(true);
      expect(fs.readFileSync(bundled, 'utf8')).toBe(
        fs.readFileSync(src, 'utf8'),
      );
    });

    const srcIcons = path.join(THEMES_SRC_ROOT, slug, 'src', 'icons.tsx');
    if (fs.existsSync(srcIcons)) {
      it(`${slug}: bundled icons.tsx matches source`, () => {
        const bundledIcons = path.join(CLI_THEMES_OUT, slug, 'icons.tsx');
        expect(
          fs.existsSync(bundledIcons),
          `missing bundled icons: ${path.relative(REPO_ROOT, bundledIcons)}`,
        ).toBe(true);
        expect(fs.readFileSync(bundledIcons, 'utf8')).toBe(
          fs.readFileSync(srcIcons, 'utf8'),
        );
      });
    }
  }

  // These assets ship inside the CLI tarball, so a private package that
  // happens to live in packages/themes becomes an installable theme unless
  // the generator excludes it. The probe fixture did exactly that once.
  for (const slug of privateThemeSlugs()) {
    it(`${slug}: private theme package is not shipped to CLI users`, () => {
      expect(
        fs.existsSync(path.join(CLI_THEMES_OUT, slug)),
        `packages/themes/${slug} is private but is bundled into the CLI — ` +
          'it would be offered by `astryx theme add`',
      ).toBe(false);
    });
  }

  it('bundles exactly the discovered themes, and nothing else', () => {
    const bundled = fs
      .readdirSync(CLI_THEMES_OUT, {withFileTypes: true})
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    expect(bundled).toEqual(slugs);
  });
});
