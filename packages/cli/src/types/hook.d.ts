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
 * xds --json hook                           -> hook.list
 * xds --json hook --list                    -> hook.list
 * xds --json hook --category State          -> hook.list (filtered)
 * xds --json hook --list --detail compact   -> hook.brief
 * xds --json hook --list --detail full      -> hook.full
 * xds --json hook useMediaQuery             -> hook.detail
 * xds --json hook useMediaQuery --params    -> hook.detail.params
 * (not found)                               -> CLIError
 */

import type {HookDoc, HookParamDoc} from '../../../core/src/docs-types';

/** xds --json hook [--list] [--category X] [--detail brief] */
export interface HookListResponse {
  type: 'hook.list';
  data: Record<string, string[]>;
}

/** xds --json hook --list --detail compact */
export interface HookBriefResponse {
  type: 'hook.brief';
  data: Record<string, HookBriefEntry[]>;
}

export interface HookBriefEntry {
  name: string;
  description: string;
  import: string;
}

/** xds --json hook --list --detail full */
export interface HookFullResponse {
  type: 'hook.full';
  data: Record<string, HookDoc[]>;
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
