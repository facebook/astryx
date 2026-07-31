// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Swizzle command JSON responses.
 *
 * The shapes now live next to the API as the source of truth in
 * `api/swizzle/swizzle.type.mjs`. This barrel re-exports them so existing
 * `./types/swizzle` consumers (types/index.d.ts) stay stable.
 */

export type {
  SwizzleListResponse,
  SwizzleFeedback,
  SwizzleCopyResponse,
} from '../api/swizzle/swizzle.type.mjs';
