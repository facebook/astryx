// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the blog command — dispatcher + barrel.
 *
 * The blog is read the same way any feed reader reads it: over the published
 * RSS feed. `blog()` dispatches to two leaves — list (no slug) and detail
 * (a slug) — that share one adapter for the network fetch + RSS parse
 * (./_adapter.mjs). Nothing here touches the blog's source files; the CLI is
 * just a consumer of the public feed, so the blog's structure can change
 * freely without touching the CLI.
 *
 * The barrel re-exports the leaf functions (`list` / `detail`) so callers can
 * reach a single leaf directly; `blog` stays exported unchanged so
 * api/index.mjs and the CLI wrapper need no edits.
 *
 * @input  optional slug
 * @output blog.list | blog.detail envelope
 * @position api — dispatcher over api/blog/{list,detail}; command wrapper in commands/blog.mjs
 */

import {list} from './list/list.mjs';
import {detail} from './detail/detail.mjs';

/**
 * List posts (from the feed), or read one post (via its .txt alternate).
 * Both envelopes carry `feedUrl` so a caller can hit the RSS feed directly.
 * The feed is always the canonical site — there is no user-supplied URL.
 *
 * @param {string} [slug]
 * @returns {Promise<import('../../types/blog').BlogListResponse | import('../../types/blog').BlogDetailResponse>}
 */
export async function blog(slug) {
  return slug ? detail(slug) : list();
}

export {list, detail};
