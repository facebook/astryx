// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `search` command — source of truth for the
 * `astryx search <query>` JSON response shapes. `types/search.d.ts` re-exports
 * these so the public `./types/search` entrypoint (and the types barrel) keep
 * working unchanged.
 */

/**
 * The domain a search result belongs to.
 * @typedef {'component' | 'hook' | 'doc' | 'template'} SearchDomain
 */

/**
 * A single ranked search result, tagged with its domain.
 * @typedef {object} SearchResultEntry
 * @property {SearchDomain} domain - Which content domain this result came from.
 * @property {string} name - Primary identifier (component/hook name, doc topic, template dir).
 * @property {number} score - Relevance score (higher is better).
 * @property {string} reason - Human-readable reason the candidate matched (e.g. `keyword "button"`).
 * @property {string} description - One-line description, when available.
 * @property {string} command - Follow-up command to act on this result (e.g. `astryx component Button`).
 * @property {string} [import] - Import path — present for component and hook results.
 * @property {string} [title] - Doc title — present for doc results.
 * @property {string} [displayName] - Friendly display name — present for template results.
 * @property {'page' | 'block'} [kind] - Template kind (`page` | `block`) — present for template results.
 */

/**
 * xds --json search <query>
 * @typedef {object} SearchResponse
 * @property {'search'} type
 * @property {object} data
 * @property {string} data.query
 * @property {SearchResultEntry[]} data.results
 */

/**
 * Options for `search()`.
 * @typedef {object} SearchOptions
 * @property {string} [cwd]
 * @property {SearchDomain} [type]
 * @property {number} [limit]
 */

export {};
