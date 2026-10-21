// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {SearchResultEntry} from '@astryxdesign/cli/search';

/** One CLI search result, with the site path it opens. */
export type SiteSearchResult = SearchResultEntry & {href: string};

export type SearchWorkerRequest =
  {type: 'load'} | {type: 'search'; id: number; query: string};

export type SearchWorkerResponse =
  {id: number; results: SiteSearchResult[]} | {id: number; error: string};
