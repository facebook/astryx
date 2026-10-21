// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The search panel's worker: runs the CLI's own search on the site's
 * search index, off the main thread.
 * @input {type: 'load'} to fetch the index early, or {type: 'search', id,
 *   query} for one search.
 * @output {id, results} with each result's site link, or {id, error}.
 * @position Started by cliSearchSource.ts on the first open of the panel.
 *
 * `searchCatalog` is `astryx search`: the same module, ranking, and catalog
 * (scripts/generate-search-index.mjs), so the panel answers what the CLI
 * answers. Nothing here ranks or reorders.
 */

import {searchCatalog} from '@astryxdesign/cli/search';
import type {GatheredSearchCatalog} from '@astryxdesign/cli/search';
import {searchResultHref} from './searchLinks.mjs';
import type {SearchLinkTables} from './searchLinks.mjs';
import type {SearchWorkerRequest, SearchWorkerResponse} from './cliSearchTypes';

interface SearchIndex {
  catalog: GatheredSearchCatalog;
  links: SearchLinkTables;
}

let index: Promise<SearchIndex> | null = null;
// The newest search asked for. Typing sends one query per keystroke; a query
// a newer one replaced is answered empty instead of searched.
let latest = 0;

function loadIndex(): Promise<SearchIndex> {
  index ??= fetch('/search-index.json').then(response => {
    if (!response.ok) {
      throw new Error(`search index: HTTP ${response.status}`);
    }
    return response.json() as Promise<SearchIndex>;
  });
  return index;
}

const post = (message: SearchWorkerResponse) => self.postMessage(message);

self.onmessage = async (event: MessageEvent<SearchWorkerRequest>) => {
  const request = event.data;
  if (request.type === 'load') {
    loadIndex().catch(() => {
      index = null;
    });
    return;
  }
  latest = request.id;
  // Let queued messages arrive first, so only the newest query is searched.
  await new Promise(resolve => setTimeout(resolve, 0));
  if (request.id !== latest) {
    post({id: request.id, results: []});
    return;
  }
  try {
    const {catalog, links} = await loadIndex();
    const response = await searchCatalog(request.query, {}, catalog);
    post({
      id: request.id,
      results: response.data.results.map(result => ({
        ...result,
        href: searchResultHref(result, links),
      })),
    });
  } catch (error) {
    index = null;
    post({id: request.id, error: String(error)});
  }
};
