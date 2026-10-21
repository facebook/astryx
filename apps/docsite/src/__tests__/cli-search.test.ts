// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The site's search panel answers what `astryx search` answers.
 *
 * The panel runs the CLI's own search (`@astryxdesign/cli/search`) on
 * public/search-index.json (scripts/generate-search-index.mjs). These tests
 * hold it to the CLI: for a fixed list of public, made-up queries, the
 * panel's results are the results `astryx search --json` prints from this
 * site's project, in the same order; the index comes from the CLI this site
 * builds with; every result opens a page the site has; and the panel keeps
 * the CLI's order.
 */

import {execFile} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {promisify} from 'node:util';
import {describe, expect, it} from 'vitest';
import {searchCatalog} from '@astryxdesign/cli/search';
import type {
  GatheredSearchCatalog,
  SearchResponse,
} from '@astryxdesign/cli/search';
import {searchResultHref} from '../lib/searchLinks.mjs';
import type {SearchLinkTables} from '../lib/searchLinks.mjs';
import {createCliSearchSource, toSearchItem} from '../lib/cliSearchSource';
import type {SiteSearchResult} from '../lib/cliSearchTypes';
import {
  SEARCH_INDEX_FILE,
  checkSearchIndex,
  cliPackageVersion,
} from '../../scripts/lib/search-index.mjs';
import docsiteConfig from '../../astryx.config.mjs';
import {docTopics, docRedirects} from '../generated/docsRegistry';
import {packages} from '../generated/packageRegistry';
import admittedRecord from '../generated/integrationPackages.json';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '../..');
const ASTRYX = path.join(ROOT, 'node_modules', '.bin', 'astryx');
const index = JSON.parse(
  fs.readFileSync(path.join(ROOT, SEARCH_INDEX_FILE), 'utf-8'),
) as {catalog: GatheredSearchCatalog; links: SearchLinkTables};

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
  'chart',
];

// The panel searches the packages this build documents. On canary that is
// every configured integration, the same set `astryx search` reads here.
const documentsEveryIntegration =
  docsiteConfig.integrations.length === admittedRecord.packages.length;

describe('search panel = astryx search', () => {
  it('is built from the CLI this site builds with', () => {
    expect(() => checkSearchIndex(index, cliPackageVersion())).not.toThrow();
  });

  it.skipIf(!documentsEveryIntegration)(
    'answers each query with the results `astryx search --json` prints',
    async () => {
      const printed = await Promise.all(
        QUERIES.map(async query => {
          const {stdout} = await run(ASTRYX, ['search', query, '--json'], {
            cwd: ROOT,
            maxBuffer: 16 * 1024 * 1024,
          });
          return JSON.parse(stdout) as SearchResponse;
        }),
      );
      for (const [i, query] of QUERIES.entries()) {
        const panel = await searchCatalog(query, {}, index.catalog);
        expect(panel.data.results.length, query).toBeGreaterThan(0);
        expect(panel.data, query).toEqual(printed[i].data);
      }
    },
    120_000,
  );
});

describe('search panel links', () => {
  const pages = new Set([
    ...docTopics.map(topic => topic.topic),
    ...packages
      .map(p => p.name)
      .filter(name => !name.startsWith('@astryxdesign/theme-'))
      .map(name => name.replace('@astryxdesign/', '')),
  ]);
  const redirectTargets = new Set(Object.values(docRedirects));
  const components = new Set(index.links.components);
  const templates = new Set(index.links.templates);

  /** Whether the site serves this path. */
  const served = (href: string): boolean => {
    if (['/components', '/templates', '/themes', '/docs'].includes(href)) {
      return true;
    }
    if (redirectTargets.has(href)) {return true;}
    const [pathname] = href.split('#');
    const [, area, slug] = pathname.split('/');
    if (area === 'components') {return components.has(slug);}
    if (area === 'templates') {return templates.has(slug);}
    if (area === 'docs') {return pages.has(slug);}
    return false;
  };

  it('opens a page the site has for every result of every query', async () => {
    for (const query of QUERIES) {
      const {data} = await searchCatalog(query, {}, index.catalog);
      for (const result of data.results) {
        const href = searchResultHref(result, index.links);
        expect(
          served(href),
          `${query}: ${result.domain} ${result.name} -> ${href}`,
        ).toBe(true);
      }
    }
  });

  it('opens a doc section at its anchor', () => {
    const href = searchResultHref(
      {domain: 'doc', name: 'author-a-theme', section: 'palette'},
      index.links,
    );
    expect(href).toMatch(/^\/docs\/theme#/);
  });
});

describe('search panel order', () => {
  it('keeps the CLI order: no groups, one item per result', async () => {
    const {data} = await searchCatalog('button', {}, index.catalog);
    const results = data.results.map(result => ({
      ...result,
      href: searchResultHref(result, index.links),
    })) as SiteSearchResult[];
    const posted: unknown[] = [];
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      postMessage(message: {type: string; id?: number}) {
        posted.push(message);
        if (message.type === 'search') {
          queueMicrotask(() =>
            worker.onmessage?.({
              data: {id: message.id, results},
            } as MessageEvent),
          );
        }
      },
    };
    const source = createCliSearchSource(() => worker as unknown as Worker);
    expect(source.bootstrap()).toEqual([]);
    expect(posted).toEqual([{type: 'load'}]);
    const items = await source.search('button');
    expect(items.map(item => item.auxiliaryData.name)).toEqual(
      results.map(result => result.name),
    );
    expect(new Set(items.map(item => item.id)).size).toBe(items.length);
    for (const item of items) {
      expect(item.auxiliaryData).not.toHaveProperty('group');
      expect(source.item(item.id)).toBe(item);
    }
    expect(toSearchItem(results[0], 0).label).toBeTruthy();
  });
});
