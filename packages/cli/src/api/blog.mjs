// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the blog command.
 *
 * The CLI owns the blog posts (blog/posts/<slug>.md) as its source of truth,
 * the same way it owns docs and templates. This exposes them so an agent can
 * read the blog through the same interface it reads everything else.
 */

import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {discoverPosts, BLOG_DIR} from '../lib/blog.mjs';

/**
 * List posts, or print a single post by slug.
 *
 * @param {string} [slug]
 * @param {object} [options]
 * @param {boolean} [options.includeDrafts]  Include draft posts (default false).
 * @returns {{type: string, data: unknown}}
 */
export function blog(slug, options = {}) {
  const {includeDrafts = false} = options;
  const posts = discoverPosts(BLOG_DIR, {includeDrafts});

  if (!slug) {
    return {
      type: 'blog.list',
      data: posts.map(p => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        type: p.type,
        authors: p.authors,
        tags: p.tags,
        readingTimeMinutes: p.readingTimeMinutes,
      })),
    };
  }

  const normalized = slug.toLowerCase();
  const post = posts.find(p => p.slug.toLowerCase() === normalized);
  if (!post) {
    throw new AstryxError(
      `No blog post with slug "${slug}"`,
      posts.map(p => ({name: p.slug, reason: 'available post'})),
      ERROR_CODES.ERR_UNKNOWN_POST,
    );
  }

  return {type: 'blog.detail', data: post};
}
