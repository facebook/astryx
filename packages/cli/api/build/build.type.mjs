// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `build` command — source of truth for the
 * `build.help` (playbook signal) and `build.kit` (composition kit) JSON
 * responses. Re-exported by types/build.d.ts.
 */

/**
 * xds --json build (no query) — the "how to build a page" playbook signal.
 *
 * @typedef {object} BuildHelpResponse
 * @property {'build.help'} type
 * @property {object} data
 * @property {true} data.playbook Always true; marks this envelope as the playbook rather than a result set.
 */

/**
 * xds --json build "<idea>" — the composition kit for what you're building.
 *
 * Entries are raw `SearchResultEntry` objects (no package-manager-prefixed
 * command strings — the CLI adds those); `frame`/`foundation` are static
 * component-name arrays surfaced on every kit.
 *
 * @typedef {object} BuildKitResponse
 * @property {'build.kit'} type
 * @property {object} data
 * @property {string} data.query
 * @property {boolean} data.hasResults False when search returned nothing (renderer shows "No matches").
 * @property {boolean} data.directMatch True when the top page template is a confident direct match.
 * @property {import('../search/search.type.mjs').SearchResultEntry[]} data.pages Closest page templates (≤3).
 * @property {import('../search/search.type.mjs').SearchResultEntry[]} data.blocks Drop-in block patterns covering parts of the idea (≤5).
 * @property {import('../search/search.type.mjs').SearchResultEntry[]} data.domain Idea-specific components/hooks (≤6), excluding frame/foundation.
 * @property {string[]} data.frame Always-on page-shell component names.
 * @property {string[]} data.foundation Always-on layout/typography/action component names.
 */

/**
 * Options for `build()`.
 * @typedef {object} BuildOptions
 * @property {string} [cwd]
 * @property {import('../search/search.type.mjs').SearchDomain} [type]
 * @property {number} [limit]
 */

export {};
