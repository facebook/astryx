// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file /blog/<slug>.txt route (served via a rewrite)
 *
 * Plaintext variant of a blog post: the raw Markdown body served as
 * text/plain. Append `.txt` to any post URL to get the source an agent can
 * read without HTML. A dynamic segment can't carry a static extension in the
 * App Router (a bare `[slug]` page would swallow `foo.txt`), so the public
 * URL `/blog/:slug.txt` is rewritten to this handler in next.config.js. The
 * RSS feed links here as each post's machine-readable alternate, and the CLI
 * reads posts through it.
 *
 * @output text/plain (the post's Markdown body) or 404
 */

import {blogPosts} from '../../../../generated/blogRegistry';

export function generateStaticParams() {
  return blogPosts.map(p => ({slug: p.slug}));
}

export async function GET(
  _req: Request,
  {params}: {params: Promise<{slug: string}>},
) {
  const {slug} = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) {
    return new Response('Not found\n', {
      status: 404,
      headers: {'content-type': 'text/plain; charset=utf-8'},
    });
  }

  // A minimal, readable header followed by the raw Markdown body. Deterministic
  // and human/agent-legible; no HTML, no site chrome.
  const header = [
    `# ${post.title}`,
    '',
    post.description,
    '',
    `Published: ${post.date}`,
    `Authors: ${post.authors.join(', ')}`,
    `Tags: ${post.tags.join(', ')}`,
    '',
    '---',
    '',
  ].join('\n');

  return new Response(header + post.body + '\n', {
    headers: {'content-type': 'text/plain; charset=utf-8'},
  });
}
