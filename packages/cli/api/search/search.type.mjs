// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `search` command — source of truth for the
 * `astryx search <query>` JSON response shapes. `types/search.d.ts` re-exports
 * these so the public `./types/search` entrypoint (and the types barrel) keep
 * working unchanged.
 */

/**
 * The domain a search result belongs to.
 * @typedef {'component' | 'hook' | 'doc' | 'template' | 'theme'} SearchDomain
 */

/**
 * A single ranked search result, tagged with its domain.
 * @typedef {object} SearchResultEntry
 * @property {SearchDomain} domain - Which content domain this result came from.
 * @property {string} name - Primary identifier (component/hook name, doc topic or docs-tree route, template dir, theme slug).
 * @property {number} score - Relevance score (higher is better).
 * @property {string} reason - Human-readable reason the candidate matched (e.g. `keyword "button"`).
 * @property {string} description - One-line description, when available.
 * @property {string} command - Follow-up command to act on this result (e.g. `astryx component Button`, or `astryx theme add neutral` for a theme).
 * @property {string} [import] - Import path — present for component and hook results.
 * @property {string} [title] - Doc title — present for doc results.
 * @property {string} [section] - Section key — present when a doc result is one section of a topic; `command` reads only that section.
 * @property {string} [package] - The npm package that authored a doc result (for a section, the package whose file the section came from), or that ships a theme result.
 * @property {string} [parent] - Command that opens the level above a doc result — its topic's section list for a section, the docs-tree namespace it sits in for a tree node — so a reader can see the siblings and open another.
 * @property {string} [displayName] - Friendly display name — present for template and theme results.
 * @property {'page' | 'block'} [kind] - Template kind (`page` | `block`) — present for template results.
 */

/**
 * astryx --json search <query>
 * @typedef {object} SearchResponse
 * @property {'search'} type
 * @property {object} data
 * @property {string} data.query
 * @property {number} data.matchCount - How many candidates matched the query in total, before `limit` was applied. `results` is the bounded slice of that set, so `matchCount > results.length` means the answer was capped.
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
