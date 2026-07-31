// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hook command JSON response types.
 *
 * Thin mirror that re-exports the colocated source of truth at
 * `../api/hook/hook.type.mjs`; see that file for the detail-level contract and
 * the invocation -> type discriminator table.
 */

export type {
  HookDoc,
  HookParamDoc,
  HookListResponse,
  HookListData,
  HookBriefEntry,
  HookDetailResponse,
  HookDetailParamsResponse,
} from '../api/hook/hook.type.mjs';
