// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog command (hidden) — read the Astryx blog from the published feed.
 *
 * Hidden on purpose: it's not part of the documented command surface and does
 * not appear in --help or the manifest. It reads the blog the same way any
 * feed reader would — over the public RSS feed — and prints a post's plaintext
 * (.txt) variant. Nothing about the blog's structure has to change for this to
 * work; the CLI is just a consumer of the feed.
 *
 *   astryx blog                    List posts from the feed
 *   astryx blog <slug>             Print a post as plaintext
 */

import {getRunPrefix} from '../../utils/package-manager.mjs';
import {humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {blog as blogApi} from '../../api/blog/blog.mjs';

/**
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
 * @typedef {(
 *   | {type: 'blog.list', data: BlogListData}
 *   | {type: 'blog.detail', data: BlogDetailData}
 * )} BlogResult
 */

/**
 * @param {BlogListData} data
 * @param {string} run
 */
function formatList({feedUrl, posts}, run) {
  const lines = [`\nAstryx blog · feed: ${feedUrl}\n`];
  if (posts.length === 0) {
    lines.push('No posts found in the feed.');
    return lines.join('\n');
  }
  for (const p of posts) {
    lines.push(`  ${p.slug}`);
    lines.push(`    ${p.title}`);
    if (p.type) lines.push(`    ${p.type}`);
    if (p.textUrl) lines.push(`    ${p.textUrl}`);
    lines.push('');
  }
  lines.push(`Read one: ${run} astryx blog <slug>`);
  return lines.join('\n');
}

/**
 * @param {import('commander').Command} program
 */
export function registerBlog(program) {
  program
    .command('blog [slug]', {hidden: true})
    .description('Read the Astryx blog from the published feed')
    .action(async (/** @type {string | undefined} */ slug) => {
      const run = getRunPrefix();
      /** @type {BlogResult} */
      let result;
      try {
        result = /** @type {BlogResult} */ (await blogApi(slug));
      } catch (e) {
        const err = /** @type {import('../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {
          suggestions: err.suggestions || [],
          code: err.code,
        });
        return;
      }

      if (result.type === 'blog.list') {
        humanLog(formatList(result.data, run));
      } else {
        // blog.detail — print the feed URL, then the plaintext body.
        humanLog(`Feed: ${result.data.feedUrl}\n`);
        humanLog(result.data.text);
      }
    });
}
