// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Hook command JSON responses.
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

import type {HookDoc, HookParamDoc} from '../../core/src/docs-types';

// Re-export the authored-doc types the hook leaves project so they stay central
// here (the leaf @returns reference these rather than reaching into core).
export type {HookDoc, HookParamDoc};

/**
 * xds --json hook [--list] [--category X] [--detail names|compact|full]
 *
 * The list view emits ONE `hook.list` type across all three detail levels; the
 * depth is carried in `data.detail` and `data.components` holds the grouped map
 * whose entry shape depends on that level:
 *   - 'names'   -> string[]         (hook names only)
 *   - 'compact' -> HookBriefEntry[] (name + 1-line description + import)
 *   - 'full'    -> HookDoc[]         (full authored doc per entry)
 */
export interface HookListResponse {
  type: 'hook.list';
  data: HookListData;
}

/** Detail-tagged payload for `hook.list` (discriminated on `detail`). */
export type HookListData =
  | {detail: 'names'; components: Record<string, string[]>}
  | {detail: 'compact'; components: Record<string, HookBriefEntry[]>}
  | {detail: 'full'; components: Record<string, HookDoc[]>};

/** A single entry in a `hook.list` group at `detail: 'compact'`. */
export interface HookBriefEntry {
  name: string;
  description: string;
  import: string;
}

/** xds --json hook <name> */
export interface HookDetailResponse {
  type: 'hook.detail';
  data: HookDoc;
}

/** xds --json hook <name> --params */
export interface HookDetailParamsResponse {
  type: 'hook.detail.params';
  data: HookParamDoc[];
}
