// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `discover` command — source of truth for the
 * discover JSON response shapes. `types/discover.d.ts` re-exports these.
 *
 * Invocation                                      -> type discriminator
 * ------------------------------------------------------------------
 * astryx --json discover                          -> discover.list
 * astryx --json discover @scope/name[@version]    -> discover.detail
 * astryx --json discover @scope/name/Component    -> discover.detail.doc
 * astryx --json discover @scope/name/<item>       -> discover.item
 * astryx --json discover <searchterm>                -> discover.search
 * (not found)                                     -> CLIError
 *
 * Fields added for discover sources are additive: every earlier field keeps
 * its meaning.
 */

/**
 * astryx --json discover
 * @typedef {object} DiscoverListResponse
 * @property {'discover.list'} type
 * @property {DiscoverListEntry[]} data The integrations the project loads.
 * @property {DiscoverListMeta} [meta] Present when the list is empty, and
 *   whenever the project has a discover source.
 */

/**
 * @typedef {object} DiscoverListMeta
 * @property {boolean} [configured] Present when `data` is empty, so callers can
 *   distinguish "no packages configured" from "configured but nothing
 *   discovered".
 * @property {DiscoverAvailableEntry[]} [available] What the project could add,
 *   one entry per integration, never an alias of a package it has.
 * @property {DiscoverSourceState[]} [sources] What each discover source did.
 */

/**
 * An installed integration.
 * @typedef {object} DiscoverListEntry
 * @property {string} name
 * @property {string} category
 * @property {string[]} components
 * @property {string} [version]
 * @property {string} [description]
 * @property {string} [displayName]
 * @property {string[]} [templates] Template ids, when it adds any.
 * @property {string[]} [docs] Doc topic names, when it adds any.
 * @property {string[]} [themes] Theme slugs, when it adds any.
 * @property {string[]} [codemods] `<version>/<id>`, when it adds any.
 * @property {string[]} [agentDocs] Agent guidance, when a source lists any.
 * @property {string} [latest] The latest release a discover source knows.
 */

/**
 * A package the project could add.
 * @typedef {object} DiscoverAvailableEntry
 * @property {string} name
 * @property {string} [version] Its latest release.
 * @property {string[]} components
 * @property {string[]} [templates]
 * @property {string[]} [docs]
 * @property {string[]} [themes]
 * @property {string[]} [codemods]
 * @property {string[]} [agentDocs]
 * @property {string} [description]
 * @property {string[]} [aliases] The integration's other package names.
 * @property {string} source The discover source that lists it.
 */

/**
 * @typedef {object} DiscoverSourceState
 * @property {string} name
 * @property {string} from `astryx.config`, or the integration that exports it.
 * @property {'fresh' | 'saved' | 'failed'} status `saved`: the live call
 *   failed and discover used the copy saved at `savedAt`.
 * @property {string} [generatedAt]
 * @property {boolean} [complete]
 * @property {string} [savedAt]
 * @property {string} [error]
 */

/**
 * astryx --json discover @scope/name[@version]
 * @typedef {object} DiscoverDetailResponse
 * @property {'discover.detail'} type
 * @property {DiscoverListEntry & {
 *   installed: boolean,
 *   installedVersion?: string,
 *   aliases?: string[],
 *   source?: string,
 *   installedAs?: string,
 *   install?: string,
 *   versions?: import('../../authoring/discover/type').DiscoverVersion[],
 * }} data `installed` says whether the project has the package;
 *   `installedVersion` is set when it has another version than the one shown.
 *   `install` is the package-manager command that adds a package the project
 *   does not have; discover prints it and never runs it. `installedAs` names
 *   the package the project has instead, when this one is an alias of it.
 *   `versions` (newest first) comes from a discover source.
 */

/**
 * astryx --json discover @scope/name/Component
 * @typedef {object} DiscoverDetailDocResponse
 * @property {'discover.detail.doc'} type
 * @property {import('@astryxdesign/cli/authoring').ComponentDoc} data
 */

/**
 * astryx --json discover @scope/name/<item>, for an item that is not an
 * installed component.
 * @typedef {object} DiscoverItemResponse
 * @property {'discover.item'} type
 * @property {{
 *   package: string,
 *   version?: string,
 *   kind: import('../../authoring/discover/type').DiscoverKind,
 *   name: string,
 *   title?: string,
 *   summary?: string,
 *   keywords?: string[],
 *   installed: boolean,
 *   installedAs?: string,
 *   install?: string,
 *   source?: string,
 * }} data
 */

/**
 * astryx --json discover <searchterm>
 * @typedef {object} DiscoverSearchResponse
 * @property {'discover.search'} type
 * @property {{query: string, matches: DiscoverSearchEntry[], total?: number}} data
 *   `total` is set when `--limit` cut the list.
 */

/**
 * @typedef {object} DiscoverSearchEntry
 * @property {string} package
 * @property {string} component The item's name, for every kind; for a package
 *   match, the package name.
 * @property {import('../../authoring/discover/type').DiscoverKind | 'package'} kind
 * @property {boolean} installed Whether the project has the package.
 * @property {string} [title]
 * @property {string} [summary]
 */

/**
 * Options for `discover()`.
 * @typedef {object} DiscoverOptions
 * @property {boolean} [components]
 * @property {string} [lang]
 * @property {boolean} [zh]
 * @property {import('../../authoring/discover/type').DiscoverKind} [type]
 * @property {boolean} [installed]
 * @property {boolean} [available]
 * @property {number} [limit]
 */

export {};
