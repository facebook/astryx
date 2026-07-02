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
 *   astryx blog --site <url>       Read from a different origin (e.g. a preview)
 */

import {getRunPrefix} from '../utils/package-manager.mjs';
import {humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {blog as blogApi, DEFAULT_SITE} from '../api/blog.mjs';

function formatList(posts, run) {
  if (posts.length === 0) return '\nNo posts found in the feed.\n';
  const lines = ['\nAstryx blog:\n'];
  for (const p of posts) {
    lines.push(`  ${p.slug}`);
    lines.push(`    ${p.title}`);
    if (p.type) lines.push(`    ${p.type}`);
    lines.push('');
  }
  lines.push(`Read one: ${run} astryx blog <slug>`);
  return lines.join('\n');
}

export function registerBlog(program) {
  program
    .command('blog [slug]', {hidden: true})
    .description('Read the Astryx blog from the published feed')
    .option('--site <url>', 'Origin to read from', DEFAULT_SITE)
    .action(async (slug, options) => {
      const run = getRunPrefix();
      let result;
      try {
        result = await blogApi(slug, {site: options.site});
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions || [], code: e.code});
        return;
      }

      if (result.type === 'blog.list') {
        humanLog(formatList(result.data, run));
      } else {
        // blog.detail — the plaintext body is already the readable form.
        humanLog(result.data.text);
      }
    });
}
