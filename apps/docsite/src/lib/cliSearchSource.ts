// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The search panel's source: each query goes to the CLI's own search,
 * run in a worker (cliSearch.worker.ts), and its results come back in the
 * CLI's order.
 * @position Consumed by SearchPalette.tsx.
 *
 * Nothing loads with the page: the worker starts, and fetches the search
 * index, the first time the panel opens (bootstrap). Items carry no `group`,
 * since CommandPalette orders grouped items by group and the CLI's order is
 * the answer.
 */

import type {SearchSource, SearchableItem} from '@astryxdesign/core/Typeahead';
import type {
  SearchWorkerRequest,
  SearchWorkerResponse,
  SiteSearchResult,
} from './cliSearchTypes';

export interface CliSearchItem extends SearchableItem<SiteSearchResult> {
  id: string;
  label: string;
  auxiliaryData: SiteSearchResult;
}

/** The kind a result is, as the panel labels it. */
export function resultKind(result: SiteSearchResult): string {
  switch (result.domain) {
    case 'component':
      return 'Component';
    case 'hook':
      return 'Hook';
    case 'doc':
      return 'Docs';
    case 'template':
      return result.kind === 'block' ? 'Block' : 'Template';
    case 'theme':
      return 'Theme';
    default:
      return result.domain;
  }
}

/** The panel item for one result, in the order the CLI gave it. */
export function toSearchItem(
  result: SiteSearchResult,
  position: number,
): CliSearchItem {
  const label =
    result.domain === 'doc'
      ? (result.title ?? result.name)
      : (result.displayName ?? result.name);
  return {
    // Two results can open the same page (sections, blocks), so the id is
    // the position, never the link.
    id: `${position}:${result.domain}:${result.name}${result.section ? `#${result.section}` : ''}`,
    label,
    auxiliaryData: result,
  };
}

type Post = (request: SearchWorkerRequest) => void;

/**
 * A SearchSource that answers with the CLI's search.
 * @param createWorker - Starts the worker; called on first use only.
 */
export function createCliSearchSource(
  createWorker: () => Worker,
): SearchSource<CliSearchItem> & {item(id: string): CliSearchItem | undefined} {
  let worker: Worker | null = null;
  // The items of the newest answer, by id, for the panel's selection.
  let shown = new Map<string, CliSearchItem>();
  let nextId = 0;
  const pending = new Map<number, (items: CliSearchItem[]) => void>();

  const post: Post = request => {
    if (!worker) {
      worker = createWorker();
      worker.onmessage = (event: MessageEvent<SearchWorkerResponse>) => {
        const response = event.data;
        const resolve = pending.get(response.id);
        if (!resolve) {return;}
        pending.delete(response.id);
        if ('error' in response) {
          console.error(`search: ${response.error}`);
          resolve([]);
        } else {
          const items = response.results.map(toSearchItem);
          shown = new Map(items.map(item => [item.id, item]));
          resolve(items);
        }
      };
    }
    worker.postMessage(request);
  };

  return {
    bootstrap() {
      post({type: 'load'});
      return [];
    },
    search(query) {
      if (query.trim() === '') {return [];}
      const id = ++nextId;
      return new Promise(resolve => {
        pending.set(id, resolve);
        post({type: 'search', id, query});
      });
    },
    item(id) {
      return shown.get(id);
    },
    cancel() {
      for (const resolve of pending.values()) {resolve([]);}
      pending.clear();
    },
  };
}
