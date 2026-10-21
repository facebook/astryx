// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for search on an exported catalog (search-catalog.mjs): the
 * same answer as `search()`, for open searches, limits and a typed catalog,
 * after the catalog goes through JSON; and the refusals that keep a site from
 * ranking with the wrong catalog.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search, gatherSearchCatalog} from './search.mjs';
import {
  SEARCH_CATALOG_FORMAT,
  linkKey,
  searchCatalog,
} from './search-catalog.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../..');
const cwd = REPO;
const SLOW = 60_000;

/** Public, made-up queries across every domain. */
const QUERIES = [
  'button',
  'date picker',
  'dark mode',
  'how do I theme my app',
  'sidebar layout',
  'table with sorting',
  'modal dialog',
  'tokens spacing',
  'toast notification',
  'login form',
  'useMediaQuery',
  'IconButton',
];

/** The catalog as a site receives it: through JSON. */
const exported = async (options = {}) =>
  JSON.parse(JSON.stringify(await gatherSearchCatalog({cwd, ...options})));

describe('searchCatalog — the same answer as search()', () => {
  it(
    'answers every query exactly as search() does',
    async () => {
      const catalog = await exported();
      expect(catalog.format).toBe(SEARCH_CATALOG_FORMAT);
      expect(catalog.type).toBeNull();
      for (const [i, query] of QUERIES.entries()) {
        for (const options of i < 3 ? [{}, {limit: 5}] : [{}]) {
          const expected = await search(query, {...options, cwd});
          const actual = await searchCatalog(query, options, catalog);
          expect(actual, `${query} ${JSON.stringify(options)}`).toEqual(
            expected,
          );
        }
      }
    },
    SLOW,
  );

  it(
    'answers a typed search from a catalog exported for that type',
    async () => {
      const catalog = await exported({type: 'doc'});
      expect(catalog.type).toBe('doc');
      for (const query of ['theme', 'spacing scale']) {
        expect(await searchCatalog(query, {type: 'doc'}, catalog)).toEqual(
          await search(query, {type: 'doc', cwd}),
        );
      }
    },
    SLOW,
  );

  it(
    'records the version of the CLI that exported it',
    async () => {
      const {version} = JSON.parse(
        fs.readFileSync(path.join(HERE, '../../package.json'), 'utf8'),
      );
      expect((await exported()).version).toBe(version);
    },
    SLOW,
  );
});

describe('searchCatalog — refusals', () => {
  it(
    'refuses a type the catalog was not exported for',
    async () => {
      const catalog = await exported();
      await expect(
        searchCatalog('theme', {type: 'doc'}, catalog),
      ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
    },
    SLOW,
  );

  it('refuses a catalog of another format', async () => {
    await expect(
      searchCatalog('button', {}, /** @type {any} */ ({format: 0})),
    ).rejects.toThrow(/format/);
  });

  it('checks its arguments as search() does', async () => {
    await expect(
      searchCatalog('', {}, /** @type {any} */ ({})),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });
});

describe('searchCatalog — descriptions with links', () => {
  it(
    'shows a component description with its links resolved, as search() does',
    async () => {
      const description = 'Use with {@link component:Button}.';
      const resolved = 'Use with Button (astryx component Button).';
      const candidate = {
        domain: 'component',
        name: 'Widget',
        _package: '@example/kit',
        description,
        keywords: ['widget'],
      };
      const catalog = {
        format: SEARCH_CATALOG_FORMAT,
        version: '0.0.0',
        type: null,
        all: [candidate],
        components: [0],
        searchedComponents: true,
        outside: false,
        coreSkipped: null,
        data: (await exported()).data,
        linked: {[linkKey('@example/kit', description)]: resolved},
      };
      const response = await searchCatalog('widget', {}, catalog);
      expect(response.data.results[0]).toMatchObject({
        name: 'Widget',
        description: resolved,
      });
    },
    SLOW,
  );
});

describe('searchCatalog — bundles for the browser', () => {
  it('imports nothing from Node or from a package, and never imports at run time', () => {
    /** @type {Set<string>} */
    const seen = new Set();
    /** @type {string[]} */
    const outside = [];
    /** @param {string} file */
    const walk = file => {
      if (seen.has(file)) return;
      seen.add(file);
      // Code only: JSDoc `import()` types are not imports.
      const code = fs
        .readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      if (/\bimport\(/.test(code)) outside.push(`${file}: import()`);
      for (const [, target] of code.matchAll(
        /(?:import|export)\s[^;]*?from\s+'([^']+)'/g,
      )) {
        if (target.startsWith('.')) {
          walk(path.resolve(path.dirname(file), target));
        } else {
          outside.push(`${file}: ${target}`);
        }
      }
    };
    walk(path.join(HERE, 'search-catalog.mjs'));
    expect(outside).toEqual([]);
    expect(seen.size).toBeGreaterThan(10);
  });
});
