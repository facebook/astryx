// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog command — read the Astryx blog from the published feed.
 *
 * A normal, agent-facing command: it appears in `--help` + the manifest and
 * supports `--json`. It reads the blog the same way any feed reader would — over
 * the public RSS feed — and prints a post's plaintext (.txt) variant. Nothing
 * about the blog's structure has to change for this to work; the CLI is just a
 * consumer of the feed.
 *
 *   astryx blog                    List posts from the feed
 *   astryx blog <slug>             Print a post as plaintext
 *   astryx blog --json             Structured list/detail envelope
 */

import {getRunPrefix} from '../../utils/package-manager.mjs';
import {humanLog, jsonOut} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {blog as blogApi} from '../../api/blog/blog.mjs';

/**
 * @param {import('../../types/blog').BlogListData} data
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
    .command('blog [slug]')
    .description('Read the Astryx blog from the published feed')
    .action(async (/** @type {string | undefined} */ slug) => {
      const run = getRunPrefix();
      /** @type {import('../../types/blog').BlogListResponse | import('../../types/blog').BlogDetailResponse} */
      let result;
      try {
        result = await blogApi(slug);
      } catch (e) {
        const err = /** @type {import('../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {
          suggestions: err.suggestions || [],
          code: err.code,
        });
        return;
      }

      if (program.opts().json) {
        jsonOut(result);
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
