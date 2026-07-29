// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Re-export barrel for the `init` command's response types. The source of
 * truth now lives colocated with the API at api/init/init.type.mjs; this file
 * keeps types/api.d.ts (and the `@astryxdesign/cli/api` public type surface)
 * resolving unchanged. Options live in api.d.ts (like UpgradeOptions).
 */

export type {
  InitRunData,
  InitRunResponse,
  InitRemoveResponse,
} from '../api/init/init.type.mjs';
