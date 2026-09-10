// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The import specifier an integration component is reported under has to
 * be the SAME at every surface, and it has to resolve.
 *
 * `component` reports it as ownership metadata and `search` reports it on every
 * hit. Each used to resolve it independently, and they disagreed: `component`
 * derived the subpath from the doc's directory against the owning package's
 * `exports`, while `search` handed back the bare package name — a specifier
 * that does not resolve for a package whose components live behind subpaths.
 * An agent that searched and then imported what it was told got a broken file.
 *
 * The two now call one resolver, so the agreement is structural. These tests
 * pin the property rather than the implementation: ask both surfaces about the
 * same component and require the same answer.
 *
 * Fixtures live under a repo-local temp dir, not /tmp, because Vite refuses to
 * dynamically import a module from outside the project root.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {component} from './component.mjs';
import {search} from '../search/search.mjs';

const SLOW = 30_000;

let tmpDir;

/**
 * A consumer project with one configured integration that ships a single
 * component, `AcmeCarousel`, in a directory named after the concept rather
 * than after the component — the shape real packages use when one entry point
 * exports several components, and the case the bare-package answer got wrong.
 *
 * @param {{exports?: Record<string, string>}} [options] the owning package's
 *   `exports` map; omit it for a package that publishes no subpaths.
 */
function scaffold({exports: exportsMap} = {}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    "export default {integrations: ['@acme/widgets']};\n",
  );

  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  const componentDir = path.join(pkgDir, 'src', 'Carousel');
  fs.mkdirSync(componentDir, {recursive: true});

  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name: '@acme/widgets',
      version: '1.0.0',
      ...(exportsMap ? {exports: exportsMap} : {}),
    }),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    "export default {components: './src'};\n",
  );
  fs.writeFileSync(
    path.join(componentDir, 'AcmeCarousel.tsx'),
    'export const AcmeCarousel = () => null;\n',
  );
  fs.writeFileSync(
    path.join(componentDir, 'AcmeCarousel.doc.mjs'),
    `export const docs = ${JSON.stringify(
      {
        type: 'component',
        name: 'AcmeCarousel',
        displayName: 'Acme Carousel',
        keywords: ['carousel', 'slides'],
        usage: {description: 'A carousel that cycles through slides.'},
        props: [],
      },
      null,
      2,
    )};\n`,
  );
}

/** The import `search` reports for a named component, or null. */
function searchImportFor(result, name) {
  for (const group of Object.values(result.data ?? {})) {
    if (!Array.isArray(group)) continue;
    const hit = group.find(entry => entry?.name === name);
    if (hit) return hit.import ?? null;
  }
  return null;
}

const SUBPATH_EXPORTS = {
  '.': './src/index.js',
  './Carousel': './src/Carousel/index.js',
};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-import-agreement-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration component import specifiers', () => {
  it(
    'component and search report the same import for the same component',
    async () => {
      scaffold({exports: SUBPATH_EXPORTS});

      const detail = await component('AcmeCarousel', {cwd: tmpDir});
      const found = await search('carousel', {cwd: tmpDir});

      expect(detail.data.import).toBe('@acme/widgets/Carousel');
      expect(searchImportFor(found, 'AcmeCarousel')).toBe(detail.data.import);
    },
    SLOW,
  );

  it(
    'neither surface reports the bare package when a subpath is exported',
    async () => {
      scaffold({exports: SUBPATH_EXPORTS});

      const detail = await component('AcmeCarousel', {cwd: tmpDir});
      const found = await search('carousel', {cwd: tmpDir});

      expect(detail.data.import).not.toBe('@acme/widgets');
      expect(searchImportFor(found, 'AcmeCarousel')).not.toBe('@acme/widgets');
    },
    SLOW,
  );

  it(
    'both fall back to the package root when it exports no matching subpath',
    async () => {
      scaffold();

      const detail = await component('AcmeCarousel', {cwd: tmpDir});
      const found = await search('carousel', {cwd: tmpDir});

      // The bare package is the honest answer here: it is what a consumer
      // would have to write by hand. What matters is that both agree on it.
      expect(detail.data.import).toBe('@acme/widgets');
      expect(searchImportFor(found, 'AcmeCarousel')).toBe('@acme/widgets');
    },
    SLOW,
  );
});
