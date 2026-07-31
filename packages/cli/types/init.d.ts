// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Re-export barrel for the `init` command's response types. The source of
 * truth now lives colocated with the API at api/init/init.type.mjs; this file
 * keeps existing `./types/init` consumers (types/index.d.ts) resolving
 * unchanged. Options live in api/init/init.type.mjs (like UpgradeOptions).
 */

export type {
  InitRunData,
  InitRunResponse,
  InitRemoveResponse,
} from '../api/init/init.type.mjs';
