// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {SearchResultEntry} from '@astryxdesign/cli/api';

/** One `astryx search` result, with the site path it opens and, for a doc,
 *  the title the site shows for it. */
export type SiteSearchResult = SearchResultEntry & {
  href: string;
  siteTitle?: string;
};
