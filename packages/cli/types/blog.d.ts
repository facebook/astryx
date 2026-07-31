// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public re-export of the `blog` command's types.
 *
 * The source of truth is colocated with the API leaves in
 * `api/blog/blog.type.mjs` (functions own their types). This file keeps the
 * `./types/blog` consumers (and the `@astryxdesign/cli` `./json` surface)
 * resolving the same type names without duplicating the shapes.
 */

export type {
  BlogPost,
  BlogListData,
  BlogDetailData,
  BlogListResponse,
  BlogDetailResponse,
} from '../api/blog/blog.type.mjs';
