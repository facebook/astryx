// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Build command JSON responses.
 *
 * The shapes now live next to the API as the source of truth in
 * `api/build/build.type.mjs`. This barrel re-exports them so existing
 * `./types/build` consumers (types/index.d.ts) stay stable.
 */

export type {
  BuildHelpResponse,
  BuildKitResponse,
} from '../api/build/build.type.mjs';
