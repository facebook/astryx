// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Search command JSON responses.
 *
 * `astryx search <query>` returns a single ranked, typed result set spanning all
 * content domains — components, hooks, docs topics, and templates. Scoring is
 * keyword + fuzzy ranking (not semantic / embeddings).
 *
 * Invocation                                     -> type discriminator
 * ------------------------------------------------------------------
 * xds --json search button                       -> search
 * xds --json search modal --type component       -> search (filtered)
 * xds --json search forms --limit 5              -> search (capped)
 * xds --json search zzznomatch                   -> search (empty results, exit 0)
 * (no query)                                     -> CLIError
 */

/** The domain a search result belongs to. */
export type SearchDomain = 'component' | 'hook' | 'doc' | 'template';

/** A single ranked search result, tagged with its domain. */
export interface SearchResultEntry {
  /** Which content domain this result came from. */
  domain: SearchDomain;
  /** Primary identifier (component/hook name, doc topic, template dir). */
  name: string;
  /** Relevance score (higher is better). */
  score: number;
  /** Human-readable reason the candidate matched (e.g. `keyword "button"`). */
  reason: string;
  /** One-line description, when available. */
  description: string;
  /** Follow-up command to act on this result (e.g. `astryx component Button`). */
  command: string;
  /** Import path — present for component and hook results. */
  import?: string;
  /** Doc title — present for doc results. */
  title?: string;
  /** Friendly display name — present for template results. */
  displayName?: string;
  /** Template kind (`page` | `block`) — present for template results. */
  kind?: 'page' | 'block';
}

/** xds --json search <query> */
export interface SearchResponse {
  type: 'search';
  data: {
    query: string;
    results: SearchResultEntry[];
  };
}
