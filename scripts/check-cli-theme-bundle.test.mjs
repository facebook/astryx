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
      return fs.existsSync(themeFile);
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
});
