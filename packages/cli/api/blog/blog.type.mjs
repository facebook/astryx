// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `blog` command — the source of truth for its
 * response/data shapes. The leaves' `@returns` reference these directly
 * (functions own their types); the public `@astryxdesign/cli/api` surface
 * re-exports them via types/blog.d.ts, so consumers see the same names.
 *
 * @position api — colocated typedefs for api/blog/{blog,list,detail,_adapter}
 */

/**
 * A single post as parsed from the canonical RSS feed.
 * @typedef {object} BlogPost
 * @property {string} slug
 * @property {string} title
 * @property {string} [description]
 * @property {string} [date]
 * @property {string} [type]
 * @property {string[]} [authors]
 * @property {string} [link]
 * @property {string | null} [textUrl]
 */

/**
 * @typedef {object} BlogListData
 * @property {string} feedUrl
 * @property {BlogPost[]} posts
 */

/**
 * @typedef {BlogPost & {feedUrl: string, text: string}} BlogDetailData
 */

/**
 * `astryx --json blog` (no slug).
 * @typedef {object} BlogListResponse
 * @property {'blog.list'} type
 * @property {BlogListData} data
 */

/**
 * `astryx --json blog <slug>`.
 * @typedef {object} BlogDetailResponse
 * @property {'blog.detail'} type
 * @property {BlogDetailData} data
 */

// Make this a module so the @typedefs above are importable as types via
// `import('./blog.type.mjs').BlogPost` (and re-exportable from a .d.ts).
export {};
