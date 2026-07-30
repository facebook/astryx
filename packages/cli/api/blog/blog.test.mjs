// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the blog API — reads the blog over the canonical RSS feed
 * and fetches each post's plaintext (.txt) alternate. `fetch` is stubbed so
 * the tests never hit the network. The feed origin is fixed (not
 * user-configurable), so the tests assert the canonical URLs directly.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {blog} from './blog.mjs';
import {AstryxError} from '../error.mjs';
import {SITE_URL} from '../../lib/site.mjs';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Astryx Blog</title>
    <link>${SITE_URL}/blog</link>
    <item>
      <title>How Astryx works</title>
      <link>${SITE_URL}/blog/how-astryx-works</link>
      <guid isPermaLink="true">${SITE_URL}/blog/how-astryx-works</guid>
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
      <guid isPermaLink="true">${SITE_URL}/blog/introducing-astryx</guid>
      <description>The launch</description>
      <category>update</category>
      <author>cvkxx</author>
      <pubDate>Thu, 18 Jun 2026 00:00:00 GMT</pubDate>
      <atom:link rel="alternate" type="text/plain" href="${SITE_URL}/blog/introducing-astryx.txt" />
    </item>
  </channel>
</rss>`;

const POST_TEXT = '# How Astryx works\n\nThe body of the post.';
const FEED_URL = `${SITE_URL}/rss.xml`;
const TXT_URL = `${SITE_URL}/blog/how-astryx-works.txt`;

/** Build a fetch stub from a url→{status,body} map. */
function stubFetch(routes) {
  return vi.fn(async (url, opts) => {
    const u = String(url);
    const r = routes[u];
    if (!r) return {ok: false, status: 404, text: async () => 'not found'};
    if (r.throw) throw r.throw;
    return {ok: r.status < 400, status: r.status, text: async () => r.body};
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', stubFetch({
    [FEED_URL]: {status: 200, body: FEED},
    [TXT_URL]: {status: 200, body: POST_TEXT},
    [`${SITE_URL}/blog/introducing-astryx.txt`]: {status: 200, body: 'launch body'},
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('blog API', () => {
  it('lists posts parsed from the canonical feed', async () => {
    const res = await blog();
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

  it('reads a post via its plaintext alternate', async () => {
    const res = await blog('how-astryx-works');
    expect(res.type).toBe('blog.detail');
    expect(res.data.text).toBe(POST_TEXT);
    expect(res.data.feedUrl).toBe(FEED_URL);
    expect(fetch).toHaveBeenCalledWith(TXT_URL, expect.any(Object));
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
    vi.stubGlobal('fetch', stubFetch({
      [FEED_URL]: {status: 500, body: 'boom'},
    }));
    await expect(blog()).rejects.toMatchObject({code: 'ERR_FETCH_FAILED'});
  });

  it('refuses a post whose plaintext URL is on a different origin (SSRF guard)', async () => {
    const evilFeed = FEED.replace(
      `${SITE_URL}/blog/how-astryx-works.txt`,
      'http://169.254.169.254/latest/meta-data',
    );
    vi.stubGlobal('fetch', stubFetch({
      [FEED_URL]: {status: 200, body: evilFeed},
      'http://169.254.169.254/latest/meta-data': {status: 200, body: 'SECRETS'},
    }));
    await expect(blog('how-astryx-works')).rejects.toMatchObject({
      code: 'ERR_FETCH_FAILED',
    });
    // The internal host must never be fetched.
    expect(fetch).not.toHaveBeenCalledWith(
      'http://169.254.169.254/latest/meta-data',
      expect.anything(),
    );
  });

  it('always reads from the canonical feed URL', async () => {
    await blog();
    expect(fetch).toHaveBeenCalledWith(FEED_URL, expect.any(Object));
  });
});
