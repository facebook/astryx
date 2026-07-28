// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog.list leaf — list posts parsed from the canonical RSS feed.
 *
 * A pure projection over the shared adapter: all network fetch + RSS parsing
 * live in ../_adapter.mjs. The envelope carries `feedUrl` so a caller can hit
 * the RSS feed directly.
 *
 * @input  none (the feed origin is fixed — there is no user-supplied URL)
 * @output {type:'blog.list', data:{feedUrl, posts}} envelope
 * @position api — leaf under api/blog; dispatched by ../blog.mjs
 */

import {loadFeed} from '../_adapter.mjs';

/**
 * List posts from the feed.
 * @returns {Promise<import('../../../types/blog').BlogListResponse>}
 */
export async function list() {
  const data = await loadFeed();
  return {type: 'blog.list', data};
}
