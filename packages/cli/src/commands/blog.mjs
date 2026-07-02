// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog command — Read Astryx blog posts.
 *
 * The CLI owns the blog posts (blog/posts/<slug>.md) as its source of truth,
 * the same way it owns docs and templates. The docsite renders them from here.
 *
 * Usage:
 *   astryx blog                  List published posts
 *   astryx blog <slug>           Print a post (frontmatter + body)
 *   astryx blog --drafts         Include drafts in the list/lookup
 */

import {getRunPrefix} from '../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {blog as blogApi} from '../api/blog.mjs';

function formatList(posts, run) {
  if (posts.length === 0) return '\nNo blog posts found.\n';
  const lines = ['\nAstryx blog:\n'];
  for (const p of posts) {
    lines.push(`  ${p.slug}`);
    lines.push(`    ${p.title}`);
    lines.push(`    ${p.date} · ${p.type} · ${p.readingTimeMinutes} min read`);
    lines.push('');
  }
  lines.push(`Usage: ${run} astryx blog <slug>`);
  return lines.join('\n');
}

function formatPost(post) {
  const meta = [
    `# ${post.title}`,
    '',
    `${post.date} · ${post.type} · ${post.readingTimeMinutes} min read`,
    `By ${post.authors.join(', ')}`,
    `Tags: ${post.tags.join(', ')}`,
    '',
    post.description,
    '',
    '---',
    '',
    post.body,
  ];
  return meta.join('\n');
}

export function registerBlog(program) {
  program
    .command('blog [slug]')
    .description('Read Astryx blog posts')
    .option('--drafts', 'Include draft posts')
    .action((slug, options) => {
      const run = getRunPrefix();
      const json = program.opts().json || false;
      const includeDrafts = options.drafts || false;

      let result;
      try {
        result = blogApi(slug, {includeDrafts});
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions || [], code: e.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      switch (result.type) {
        case 'blog.list':
          humanLog(formatList(result.data, run));
          break;
        case 'blog.detail':
          humanLog(formatPost(result.data));
          break;
      }
    });
}
