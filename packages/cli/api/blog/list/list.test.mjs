// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the blog.list leaf — parses the canonical RSS feed into a
 * post list. `fetch` is stubbed so the test never hits the network. The feed
 * origin is fixed (not user-configurable), so the URLs are asserted directly.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {list} from './list.mjs';
import {SITE_URL} from '../_site.mjs';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Astryx Blog</title>
    <link>${SITE_URL}/blog</link>
    <item>
      <title>How Astryx works</title>
      <link>${SITE_URL}/blog/how-astryx-works</link>
      <description>Under the hood &amp; more</description>
      <category>engineering</category>
      <author>cvkxx</author>
      <author>cixzhang</author>
      <pubDate>Mon, 29 Jun 2026 00:00:00 GMT</pubDate>
      <atom:link rel="alternate" type="text/plain" href="${SITE_URL}/blog/how-astryx-works.txt" />
    </item>
    <item>
      <title>Introducing Astryx</title>
      <link>${SITE_URL}/blog/introducing-astryx</link>
      <description>The launch</description>
      <category>update</category>
      <author>cvkxx</author>
      <pubDate>Thu, 18 Jun 2026 00:00:00 GMT</pubDate>
      <atom:link rel="alternate" type="text/plain" href="${SITE_URL}/blog/introducing-astryx.txt" />
    </item>
  </channel>
</rss>`;

const FEED_URL = `${SITE_URL}/rss.xml`;
const TXT_URL = `${SITE_URL}/blog/how-astryx-works.txt`;

/** Build a fetch stub from a url→{status,body} map. */
function stubFetch(routes) {
  return vi.fn(async url => {
    const r = routes[String(url)];
    if (!r) return {ok: false, status: 404, text: async () => 'not found'};
    return {ok: r.status < 400, status: r.status, text: async () => r.body};
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', stubFetch({[FEED_URL]: {status: 200, body: FEED}}));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('blog.list leaf', () => {
  it('lists posts parsed from the canonical feed', async () => {
    const res = await list();
    expect(res.type).toBe('blog.list');
    expect(res.data.feedUrl).toBe(FEED_URL);
    expect(res.data.posts.map(p => p.slug)).toEqual([
      'how-astryx-works',
      'introducing-astryx',
    ]);
    expect(res.data.posts[0].authors).toEqual(['cvkxx', 'cixzhang']);
    expect(res.data.posts[0].textUrl).toBe(TXT_URL);
    // Entity decoding works (&amp; -> &).
    expect(res.data.posts[0].description).toBe('Under the hood & more');
    // The list never fetches post bodies.
    expect(res.data.posts[0].text).toBeUndefined();
  });

  it('always reads from the canonical feed URL', async () => {
    await list();
    expect(fetch).toHaveBeenCalledWith(FEED_URL, expect.any(Object));
  });
});
