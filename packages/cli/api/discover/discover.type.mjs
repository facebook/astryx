// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `discover` command — source of truth for the
 * discover JSON response shapes. `types/discover.d.ts` re-exports these.
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

/**
 * xds --json discover
 * @typedef {object} DiscoverListResponse
 * @property {'discover.list'} type
 * @property {DiscoverListEntry[]} data
 * @property {{configured: boolean}} [meta] Present when the list is empty so
 *   callers can distinguish "no packages configured" from "configured but
 *   nothing discovered".
 */

/**
 * @typedef {object} DiscoverListEntry
 * @property {string} name
 * @property {string} category
 * @property {string[]} components
 * @property {string} [version]
 * @property {string} [description]
 * @property {string} [displayName]
 */

/**
 * xds --json discover @scope/name
 * @typedef {object} DiscoverDetailResponse
 * @property {'discover.detail'} type
 * @property {DiscoverListEntry} data
 */

/**
 * xds --json discover @scope/name/Component
 * @typedef {object} DiscoverDetailDocResponse
 * @property {'discover.detail.doc'} type
 * @property {import('@astryxdesign/cli/authoring').ComponentDoc} data
 */

/**
 * xds --json discover <searchterm> (multiple matches)
 * @typedef {object} DiscoverSearchResponse
 * @property {'discover.search'} type
 * @property {{query: string, matches: DiscoverSearchEntry[]}} data
 */

/**
 * @typedef {object} DiscoverSearchEntry
 * @property {string} package
 * @property {string} component
 */

/**
 * Options for `discover()`.
 * @typedef {object} DiscoverOptions
 * @property {boolean} [components]
 * @property {string} [lang]
 * @property {boolean} [zh]
 */

export {};
