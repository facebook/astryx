// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog.detail leaf — read one post via its plaintext (.txt) alternate.
 *
 * A projection over the shared adapter: it loads the parsed feed, selects the
 * post by slug (case-insensitive), then reads that post's plaintext body. All
 * network fetch + RSS parsing live in ../_adapter.mjs. The envelope carries
 * `feedUrl` so a caller can hit the RSS feed directly.
 *
 * @input  slug (post identifier derived from the feed link)
 * @output {type:'blog.detail', data:{...post, feedUrl, text}} envelope
 * @position api — leaf under api/blog; dispatched by ../blog.mjs
 */

import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {loadFeed, fetchPostText} from '../_adapter.mjs';

/**
 * Read one post identified by slug (case-insensitive) via its .txt alternate.
 * @param {string} slug
 * @returns {Promise<import('../blog.type.mjs').BlogDetailResponse>}
 */
export async function detail(slug) {
  // Validate the slug type before any network work — the dispatcher routes
  // any truthy value here, and a public API caller (`@astryxdesign/cli/api`)
  // could pass a non-string. Without this guard `slug.toLowerCase()` throws a
  // raw TypeError with no `.code`, which the CLI downgrades to ERR_UNKNOWN.
  if (typeof slug !== 'string') {
    throw new AstryxError(
      `Invalid blog slug: ${String(slug)}`,
      [],
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const {feedUrl, posts} = await loadFeed();

  const normalized = slug.toLowerCase();
  const post = posts.find(p => p.slug.toLowerCase() === normalized);
  if (!post) {
    throw new AstryxError(
      `No blog post with slug "${slug}"`,
      posts.map(p => ({name: p.slug, reason: 'available post'})),
      ERROR_CODES.ERR_UNKNOWN_POST,
    );
  }

  if (!post.textUrl) {
    throw new AstryxError(
      `Post "${slug}" has no plaintext alternate in the feed`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }

  const text = await fetchPostText(post.textUrl);
  return {type: 'blog.detail', data: {...post, feedUrl, text}};
}
