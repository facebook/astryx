// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Bundles each theme's source (`src/<slug>Theme.ts` + `icons.tsx`) and a
 * `manifest.json` into `packages/core/templates/themes/` so `astryx theme add`
 * can scaffold a theme without the package installed — like page templates.
 * Run from the repo root; commit the output so the published CLI carries it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const THEMES_SRC_ROOT = path.join(REPO_ROOT, 'packages', 'themes');
const CLI_THEMES_OUT = path.join(
  REPO_ROOT,
  'packages',
  'core',
  'templates',
  'themes',
);

// Flagged in the manifest so `theme list` can mark it "(maintained)".
const MAINTAINED_SLUG = 'neutral';

function toIdentifier(slug) {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Title-case a slug for display ("y2k" → "Y2K" is special-cased). */
function toDisplayName(slug) {
  if (slug === 'y2k') return 'Y2K';
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function listThemeSlugs() {
  if (!fs.existsSync(THEMES_SRC_ROOT)) return [];
  return fs
    .readdirSync(THEMES_SRC_ROOT, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(slug => {
      // A theme dir must have a package.json + a src/<slug>Theme.ts to qualify.
      const pkg = path.join(THEMES_SRC_ROOT, slug, 'package.json');
      const themeFile = path.join(
        THEMES_SRC_ROOT,
        slug,
        'src',
        `${toIdentifier(slug)}Theme.ts`,
      );
      return fs.existsSync(pkg) && fs.existsSync(themeFile);
    })
    .sort();
}

function main() {
  const slugs = listThemeSlugs();
  if (slugs.length === 0) {
    console.warn('generate-cli-themes: no theme packages found — skipping.');
    return;
  }

  // Reset the output dir so removed themes don't linger.
  fs.rmSync(CLI_THEMES_OUT, {recursive: true, force: true});
  fs.mkdirSync(CLI_THEMES_OUT, {recursive: true});

  const entries = [];

  for (const slug of slugs) {
    const id = toIdentifier(slug);
    const srcDir = path.join(THEMES_SRC_ROOT, slug, 'src');
    const themeFileName = `${id}Theme.ts`;
    const themeFile = path.join(srcDir, themeFileName);

    // The theme file imports './icons', so bundle it too (optional).
    const iconsFile = path.join(srcDir, 'icons.tsx');
    const hasIcons = fs.existsSync(iconsFile);

    const outDir = path.join(CLI_THEMES_OUT, slug);
    fs.mkdirSync(outDir, {recursive: true});

    const files = [themeFileName];
    fs.copyFileSync(themeFile, path.join(outDir, themeFileName));
    if (hasIcons) {
      files.push('icons.tsx');
      fs.copyFileSync(iconsFile, path.join(outDir, 'icons.tsx'));
    }

    // Pull the human description from the package.json (falls back to empty).
    let description = '';
    try {
      const pkg = readJSON(path.join(THEMES_SRC_ROOT, slug, 'package.json'));
      description = pkg.description || '';
    } catch {
      /* best-effort */
    }

    entries.push({
      slug,
      displayName: toDisplayName(slug),
      description,
      maintained: slug === MAINTAINED_SLUG,
      entry: themeFileName,
      exportName: `${id}Theme`,
      files,
    });

    console.log(`  bundled theme "${slug}" (${files.length} files)`);
  }

  const manifest = {
    version: 1,
    generatedBy: 'scripts/generate-cli-themes.mjs',
    themes: entries,
  };
  fs.writeFileSync(
    path.join(CLI_THEMES_OUT, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );

  console.log(
    `generate-cli-themes: wrote ${entries.length} themes + manifest to ${path.relative(REPO_ROOT, CLI_THEMES_OUT)}`,
  );
}

main();
