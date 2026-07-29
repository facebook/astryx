// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Discover command JSON response types.
 *
 * Source of truth is colocated with the command's API at
 * `../api/discover/discover.type.mjs`; this file re-exports those types so
 * existing `types/discover` importers keep working.
 */

export type {
  DiscoverListResponse,
  DiscoverListEntry,
  DiscoverDetailResponse,
  DiscoverDetailDocResponse,
  DiscoverSearchResponse,
  DiscoverSearchEntry,
} from '../api/discover/discover.type.mjs';
