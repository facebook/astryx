// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Search command JSON responses.
 *
 * NOTE: These types are colocated with the command implementation — the source
 * of truth now lives in `../api/search/search.type.mjs` (JSDoc typedefs). This
 * file re-exports them so the public `./types/search` entrypoint and the
 * `types/index.d.ts` barrel keep working unchanged.
 */

export type {
  SearchDomain,
  SearchResultEntry,
  SearchResponse,
} from '../api/search/search.type.mjs';
