// Copyright (c) Meta Platforms, Inc. and affiliates.

// Types for the `upgrade` command now live next to their API as the source of
// truth. This module re-exports them so `types/upgrade` stays a stable import.
// Edit shapes/descriptions in `../api/upgrade/upgrade.type.mjs`, not here.

export type {
  UpgradeListResponse,
  UpgradeListEntry,
  AgentDocsSummary,
  UpgradeRunResponse,
  UpgradeStatusResponse,
} from '../api/upgrade/upgrade.type.mjs';
