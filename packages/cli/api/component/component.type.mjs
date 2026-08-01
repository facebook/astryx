// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `component` command — source of truth for the
 * component command's JSON responses. These typedefs describe the `{type, data}`
 * envelopes emitted by `xds --json component` and returned by the `component()`
 * API; the `types/component.d.ts` barrel re-exports them for consumers.
 *
 * Detail-level contract for list views (brief < compact < full):
 *   --detail brief    Names only. Smallest, most scannable. (DEFAULT for --list)
 *   --detail compact  Names + 1-line description + import path.
 *   --detail full     Full ComponentDoc per entry (props, theming, examples, etc.).
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json component                      -> component.list (data.detail='names')
 * xds --json component --list               -> component.list (data.detail='names')
 * xds --json component --category Form      -> component.list (filtered)
 * xds --json component --list --detail compact -> component.list (data.detail='compact')
 * xds --json component --list --detail full -> component.list (data.detail='full')
 * xds --json component Button               -> component.detail
 * xds --json component Button --props       -> component.detail.props
 * xds --json component Button --source      -> component.detail.source
 * xds --json component Button --showcase    -> component.detail.showcase
 * xds --json component Button --blocks      -> component.detail.blocks
 * (not found)                               -> CLIError
 */

/**
 * xds --json component [--list] [--category X] [--detail names|compact|full]
 *
 * The list view emits ONE `component.list` type across all three detail levels;
 * the depth is carried in `data.detail` and `data.components` holds the grouped
 * map whose entry shape depends on that level:
 *   - 'names'   -> ComponentListEntry[]  (name + owner package)
 *   - 'compact' -> ComponentBriefEntry[] (name + 1-line description + import)
 *   - 'full'    -> ComponentDoc[]        (full authored doc per entry)
 * @typedef {object} ComponentListResponse
 * @property {'component.list'} type
 * @property {ComponentListData} data
 */

/**
 * Detail-tagged payload for `component.list` (discriminated on `detail`).
 * @typedef {(
 *   | {detail: 'names'; components: Record<string, ComponentListEntry[]>}
 *   | {detail: 'compact'; components: Record<string, ComponentBriefEntry[]>}
 *   | {detail: 'full'; components: Record<string, import('@astryxdesign/cli/authoring').ComponentDoc[]>}
 * )} ComponentListData
 */

/**
 * A single entry in a `component.list` group at `detail: 'names'`. Pre-1.0 the
 * list moved from bare strings to package-qualified objects so consumers can
 * disambiguate ownership (core vs. an integration package).
 * @typedef {object} ComponentListEntry
 * @property {string} name
 * @property {string} package - Owner package, e.g. '@astryxdesign/core' or '@acme/astryx-meta'.
 */

/**
 * A single entry in a `component.list` group at `detail: 'compact'`.
 * @typedef {object} ComponentBriefEntry
 * @property {string} name
 * @property {string} description
 * @property {string} import
 */

/**
 * xds --json component <name>
 * @typedef {object} ComponentDetailResponse
 * @property {'component.detail'} type
 * @property {import('@astryxdesign/cli/authoring').ComponentDoc & ComponentOwnership} data
 */

/**
 * Ownership metadata attached to every `component.detail` payload. Exposes the
 * owner package, the import specifier, and whether a swizzleable source file is
 * available — the inputs the integration-component swizzle (a later PR) needs.
 * @typedef {object} ComponentOwnership
 * @property {string} package - Owner package, e.g. '@astryxdesign/core' or an integration package name.
 * @property {string} import - Import specifier for the component (e.g. '@astryxdesign/core/Button').
 * @property {boolean} sourceAvailable - Whether a component source file exists for `--source` / swizzle.
 */

/**
 * xds --json component <name> --props
 * @typedef {object} ComponentDetailPropsResponse
 * @property {'component.detail.props'} type
 * @property {import('@astryxdesign/cli/authoring').ComponentPropDoc[]} data
 */

/**
 * xds --json component <name> --source
 * @typedef {object} ComponentDetailSourceResponse
 * @property {'component.detail.source'} type
 * @property {{component: string; source: string}} data
 */

/**
 * xds --json component <name> --showcase
 * @typedef {object} ComponentDetailShowcaseResponse
 * @property {'component.detail.showcase'} type
 * @property {{component: string; aspectRatio: number; source: string}} data
 */

/**
 * xds --json component <name> --blocks
 * @typedef {object} ComponentDetailBlocksResponse
 * @property {'component.detail.blocks'} type
 * @property {{component: string; showcase: BlockEntry | null; examples: BlockEntry[]; related: BlockEntry[]}} data
 */

/**
 * @typedef {object} BlockEntry
 * @property {string} name
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} isShowcase
 * @property {string} category
 */

/**
 * Options for `component()`.
 * @typedef {object} ComponentOptions
 * @property {string} [cwd]
 * @property {boolean} [list]
 * @property {string} [category]
 * @property {string} [package] Scope lookup to a specific external package (e.g. '@acme/xds-widgets').
 * @property {boolean} [props]
 * @property {boolean} [source]
 * @property {boolean} [showcase]
 * @property {boolean} [blocks] List example blocks for the component: showcase, examples, and related.
 * @property {'full' | 'compact' | 'brief'} [detail]
 * @property {string} [lang]
 * @property {boolean} [zh]
 * @property {boolean} [dense]
 */

export {};
