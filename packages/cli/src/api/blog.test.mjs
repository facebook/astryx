// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the blog API — reads the blog over the published RSS feed
 * and fetches each post's plaintext (.txt) alternate. `fetch` is stubbed so
 * the tests never hit the network.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {blog} from './blog.mjs';
import {AstryxError} from './error.mjs';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Astryx Blog</title>
    <link>https://astryx.atmeta.com/blog</link>
    <item>
      <title>How Astryx works</title>
      <link>https://astryx.atmeta.com/blog/how-astryx-works</link>
      <guid isPermaLink="true">https://astryx.atmeta.com/blog/how-astryx-works</guid>
      <description>Under the hood</description>
      <category>engineering</category>
      <author>cvkxx</author>
      <author>cixzhang</author>
      <pubDate>Mon, 29 Jun 2026 00:00:00 GMT</pubDate>
      <atom:link rel="alternate" type="text/plain" href="https://astryx.atmeta.com/blog/how-astryx-works.txt" />
    </item>
    <item>
      <title>Introducing Astryx</title>
      <link>https://astryx.atmeta.com/blog/introducing-astryx</link>
      <guid isPermaLink="true">https://astryx.atmeta.com/blog/introducing-astryx</guid>
      <description>The launch</description>
      <category>update</category>
      <author>cvkxx</author>
      <pubDate>Thu, 18 Jun 2026 00:00:00 GMT</pubDate>
      <atom:link rel="alternate" type="text/plain" href="https://astryx.atmeta.com/blog/introducing-astryx.txt" />
    </item>
  </channel>
</rss>`;

const POST_TEXT = '# How Astryx works\n\nThe body of the post.';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async url => {
    const u = String(url);
    if (u.endsWith('.txt')) {
      return {ok: true, status: 200, text: async () => POST_TEXT};
    }
    if (u.endsWith('/rss.xml')) {
      return {ok: true, status: 200, text: async () => FEED};
    }
    return {ok: false, status: 404, text: async () => 'not found'};
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('blog API', () => {
  it('lists posts parsed from the feed', async () => {
    const res = await blog();
    expect(res.type).toBe('blog.list');
    expect(res.data.map(p => p.slug)).toEqual([
      'how-astryx-works',
      'introducing-astryx',
    ]);
    expect(res.data[0].authors).toEqual(['cvkxx', 'cixzhang']);
    expect(res.data[0].textUrl).toMatch(/how-astryx-works\.txt$/);
    // The list never fetches post bodies.
    expect(res.data[0].text).toBeUndefined();
  });

  it('reads a post via its plaintext alternate', async () => {
    const res = await blog('how-astryx-works');
    expect(res.type).toBe('blog.detail');
    expect(res.data.text).toBe(POST_TEXT);
    expect(fetch).toHaveBeenCalledWith(
      'https://astryx.atmeta.com/blog/how-astryx-works.txt',
    );
  });

  it('is case-insensitive on the slug', async () => {
    const res = await blog('How-Astryx-Works');
    expect(res.data.slug).toBe('how-astryx-works');
  });

  it('throws ERR_UNKNOWN_POST with suggestions for a bad slug', async () => {
    await expect(blog('does-not-exist')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_POST',
    });
    try {
      await blog('does-not-exist');
    } catch (e) {
      expect(e).toBeInstanceOf(AstryxError);
      expect(Array.isArray(e.suggestions)).toBe(true);
      expect(e.suggestions.length).toBeGreaterThan(0);
    }
  });

  it('throws ERR_FETCH_FAILED when the feed request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 500,
      text: async () => 'boom',
    })));
    await expect(blog()).rejects.toMatchObject({code: 'ERR_FETCH_FAILED'});
  });

  it('reads from a custom origin when --site is given', async () => {
    await blog(undefined, {site: 'http://localhost:3000'});
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/rss.xml');
  });
});
