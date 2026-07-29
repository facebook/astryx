// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Barrel for the `component` command's JSON response types. The source of
 * truth now lives beside the API at `api/component/component.type.mjs`; this thin
 * re-export keeps `types/api.d.ts` and external `@astryxdesign/cli` consumers
 * resolving these names unchanged.
 */

export type {
  ComponentListResponse,
  ComponentListData,
  ComponentListEntry,
  ComponentBriefEntry,
  ComponentDetailResponse,
  ComponentOwnership,
  ComponentDetailPropsResponse,
  ComponentDetailSourceResponse,
  ComponentDetailShowcaseResponse,
  ComponentDetailBlocksResponse,
  BlockEntry,
} from '../api/component/component.type.mjs';
