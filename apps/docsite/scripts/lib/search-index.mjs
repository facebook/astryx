// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The site's search index: the CLI's exported search catalog, cut to
 * the packages this build documents, beside the site's link tables.
 * generate-search-index.mjs writes it; check-search-index.mjs and the tests
 * check it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SEARCH_CATALOG_FORMAT} from '@astryxdesign/cli/search';

/** Where the index is written, relative to the docsite root. */
export const SEARCH_INDEX_FILE = 'public/search-index.json';

/** Packages every build documents: Core and the CLI's own docs and themes. */
const ALWAYS = new Set(['@astryxdesign/core', '@astryxdesign/cli']);

/**
 * The version of the @astryxdesign/cli this site builds with: the package its
 * `@astryxdesign/cli/api` import resolves to.
 * @returns {string}
 */
export function cliPackageVersion() {
  let dir = path.dirname(
    fileURLToPath(import.meta.resolve('@astryxdesign/cli/api')),
  );
  for (;;) {
    const file = path.join(dir, 'package.json');
    if (fs.existsSync(file)) {
      const manifest = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (manifest.name === '@astryxdesign/cli') return manifest.version;
    }
    const up = path.dirname(dir);
    if (up === dir) throw new Error('@astryxdesign/cli package.json not found');
    dir = up;
  }
}

/**
 * The catalog with only the entries of packages this build documents. A
 * search gathers each package's entries on their own, so this is the catalog
 * a project with just these integrations would search.
 * @param {import('@astryxdesign/cli/search').GatheredSearchCatalog} catalog
 * @param {string[]} admitted - The integration packages this build documents.
 */
export function documentedCatalog(catalog, admitted) {
  const keep = new Set([...ALWAYS, ...admitted]);
  const kept = catalog.all.filter(
    c => c._package == null || keep.has(c._package),
  );
  if (kept.length === catalog.all.length) return catalog;
  const at = new Map(kept.map((c, i) => [c, i]));
  return {
    ...catalog,
    all: kept,
    components: catalog.components
      .map(i => at.get(catalog.all[i]))
      .filter(i => i != null),
  };
}

/**
 * Throws unless the index was written by the CLI this site builds with, in
 * the catalog shape its search reads.
 * @param {{catalog: {format: number, version: string}, links: object}} index
 * @param {string} version - The @astryxdesign/cli version the site builds with.
 */
export function checkSearchIndex(index, version) {
  const {catalog} = index;
  if (catalog?.format !== SEARCH_CATALOG_FORMAT) {
    throw new Error(
      `search index: catalog format ${catalog?.format} is not the engine's ${SEARCH_CATALOG_FORMAT}. Rerun pnpm generate.`,
    );
  }
  if (catalog.version !== version) {
    throw new Error(
      `search index: catalog from @astryxdesign/cli ${catalog.version}, but the site builds with ${version}. Rerun pnpm generate.`,
    );
  }
  if (!index.links) throw new Error('search index: link tables missing.');
}
