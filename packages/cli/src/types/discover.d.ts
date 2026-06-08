// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Discover command JSON responses.
 *
 * Invocation                                      -> type discriminator
 * ------------------------------------------------------------------
 * xds --json discover                            -> discover.list
 * xds --json discover @scope/name                -> discover.detail
 * xds --json discover @scope/name/Component      -> discover.detail.doc
 * xds --json discover <searchterm> (1 match)     -> discover.detail.doc
 * xds --json discover <searchterm> (N matches)   -> discover.search
 * (not found)                                    -> CLIError
 */

import type {ComponentDoc} from '../../../core/src/docs-types';

/** xds --json discover */
export interface DiscoverListResponse {
  type: 'discover.list';
  data: DiscoverListEntry[];
  /**
   * Present when the list is empty so callers can distinguish "no packages
   * configured" from "configured but nothing discovered".
   */
  meta?: {configured: boolean};
}

export interface DiscoverListEntry {
  name: string;
  category: string;
  components: string[];
  version?: string;
  description?: string;
  displayName?: string;
}

/** xds --json discover @scope/name */
export interface DiscoverDetailResponse {
  type: 'discover.detail';
  data: DiscoverListEntry;
}

/** xds --json discover @scope/name/Component */
export interface DiscoverDetailDocResponse {
  type: 'discover.detail.doc';
  data: ComponentDoc;
}

/** xds --json discover <searchterm> (multiple matches) */
export interface DiscoverSearchResponse {
  type: 'discover.search';
  data: {query: string; matches: DiscoverSearchEntry[]};
}

export interface DiscoverSearchEntry {
  package: string;
  component: string;
}
