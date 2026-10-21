// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {SearchResultEntry} from '@astryxdesign/cli/api';

/** One `astryx search` result, with the site path it opens. */
export type SiteSearchResult = SearchResultEntry & {href: string};
