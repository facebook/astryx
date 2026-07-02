// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file /rss.xml route
 *
 * RSS 2.0 feed for the Astryx blog. Regenerated on every build from the same
 * generated registry that drives the blog routes, so it never drifts from the
 * posts themselves. Each item carries the human post URL plus a machine
 * alternate: the plaintext (.txt) variant an agent can read directly. The CLI
 * consumes this feed to browse and read the blog.
 *
 * @output application/rss+xml
 */

import {blogPosts} from '../../generated/blogRegistry';
import {SITE_URL, SITE_NAME, SITE_DESCRIPTION} from '../../lib/siteConfig';

function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString();
}

export async function GET() {
  const feedUrl = abs('/rss.xml');
  const blogUrl = abs('/blog');
  const lastBuild = new Date().toUTCString();

  const items = blogPosts
    .map(post => {
      const link = abs(`/blog/${post.slug}`);
      const txt = abs(`/blog/${post.slug}.txt`);
      const parts = [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        `      <category>${escapeXml(post.type)}</category>`,
        ...post.authors.map(a => `      <author>${escapeXml(a)}</author>`),
      ];
      const pub = rfc822(post.date);
      if (pub) parts.push(`      <pubDate>${pub}</pubDate>`);
      // Machine-readable plaintext alternate for this post. Atom's <link> with
      // rel="alternate" rides inside the RSS item so a reader (or the CLI) can
      // fetch the raw Markdown without scraping HTML.
      parts.push(
        `      <atom:link rel="alternate" type="text/plain" href="${txt}" />`,
      );
      parts.push('    </item>');
      return parts.join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} Blog</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {'content-type': 'application/rss+xml; charset=utf-8'},
  });
}
