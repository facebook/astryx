// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `hook` command — source of truth for its JSON
 * responses (re-exported by the `./json` barrel at `../json/index.d.ts`).
 *
 * Detail-level contract for list views (brief < compact < full):
 *   --detail brief    Names only. Smallest, most scannable. (DEFAULT for --list)
 *   --detail compact  Names + 1-line description + import path.
 *   --detail full     Full HookDoc per entry (params, returns, usage, etc.).
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json hook                           -> hook.list (data.detail='names')
 * xds --json hook --list                    -> hook.list (data.detail='names')
 * xds --json hook --category State          -> hook.list (filtered)
 * xds --json hook --list --detail compact   -> hook.list (data.detail='compact')
 * xds --json hook --list --detail full      -> hook.list (data.detail='full')
 * xds --json hook useMediaQuery             -> hook.detail
 * xds --json hook useMediaQuery --params    -> hook.detail.params
 * (not found)                               -> CLIError
 */

// Re-export the authored-doc types from core so the hook leaves reference these
// colocated aliases here (the leaf @returns reference these rather than reaching
// into core directly).
/** @typedef {import('@astryxdesign/cli/authoring').HookDoc} HookDoc */
/** @typedef {import('@astryxdesign/cli/authoring').HookParamDoc} HookParamDoc */

/**
 * xds --json hook [--list] [--category X] [--detail names|compact|full]
 *
 * The list view emits ONE `hook.list` type across all three detail levels; the
 * depth is carried in `data.detail` and `data.components` holds the grouped map
 * whose entry shape depends on that level:
 *   - 'names'   -> string[]         (hook names only)
 *   - 'compact' -> HookBriefEntry[] (name + 1-line description + import)
 *   - 'full'    -> HookDoc[]         (full authored doc per entry)
 *
 * @typedef {object} HookListResponse
 * @property {'hook.list'} type
 * @property {HookListData} data
 */

/**
 * Detail-tagged payload for `hook.list` (discriminated on `detail`).
 * @typedef {{detail: 'names', components: Record<string, string[]>} | {detail: 'compact', components: Record<string, HookBriefEntry[]>} | {detail: 'full', components: Record<string, HookDoc[]>}} HookListData
 */

/**
 * A single entry in a `hook.list` group at `detail: 'compact'`.
 * @typedef {object} HookBriefEntry
 * @property {string} name
 * @property {string} description
 * @property {string} import
 */

/**
 * xds --json hook <name>
 * @typedef {object} HookDetailResponse
 * @property {'hook.detail'} type
 * @property {HookDoc} data
 */

/**
 * xds --json hook <name> --params
 * @typedef {object} HookDetailParamsResponse
 * @property {'hook.detail.params'} type
 * @property {HookParamDoc[]} data
 */

/**
 * Options for `hook()`.
 * @typedef {object} HookOptions
 * @property {string} [cwd]
 * @property {boolean} [list]
 * @property {string} [category]
 * @property {boolean} [params]
 * @property {'full' | 'compact' | 'brief'} [detail]
 * @property {string} [lang]
 * @property {boolean} [zh]
 */

export {};
