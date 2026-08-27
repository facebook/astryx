// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the blog adapter (api/blog/_adapter.mjs) — the shared network
 * + RSS-parsing layer behind the blog leaves. `fetch` is stubbed so nothing
 * hits the network. Locks the SSRF/origin guard, invalid-URL handling, and the
 * garbage-feed degradation that the leaves depend on but never test directly.
 */

import {describe, it, expect, afterEach, vi} from 'vitest';
import {loadFeed, fetchPostText, FEED_URL} from './_adapter.mjs';
import {AstryxError} from '../error.mjs';
import {SITE_URL} from './_site.mjs';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Astryx Blog</title>
    <link>${SITE_URL}/blog</link>
    <item>
      <title>Under the hood &amp; more</title>
      <link>${SITE_URL}/blog/how-astryx-works</link>
      <atom:link rel="alternate" type="text/plain" href="${SITE_URL}/blog/how-astryx-works.txt" />
    </item>
  </channel>
</rss>`;

/** Build a fetch stub from a url→{status,body} map. */
function stubFetch(routes) {
  return vi.fn(async url => {
    const r = routes[String(url)];
    if (!r) return {ok: false, status: 404, text: async () => 'not found'};
    return {ok: r.status < 400, status: r.status, text: async () => r.body};
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('blog adapter — loadFeed', () => {
  it('parses posts and reports the canonical feed URL', async () => {
    vi.stubGlobal('fetch', stubFetch({[FEED_URL]: {status: 200, body: FEED}}));
    const {feedUrl, posts} = await loadFeed();
    expect(feedUrl).toBe(FEED_URL);
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('how-astryx-works');
    // XML entities in the title are unescaped.
    expect(posts[0].title).toBe('Under the hood & more');
  });

  it('returns an empty post list for non-RSS / garbage feed content', async () => {
    vi.stubGlobal(
      'fetch',
      stubFetch({[FEED_URL]: {status: 200, body: '<html>not a feed</html>'}}),
    );
    const {feedUrl, posts} = await loadFeed();
    expect(feedUrl).toBe(FEED_URL);
    expect(posts).toEqual([]);
  });

  it('throws ERR_FETCH_FAILED when the feed request is non-200', async () => {
    vi.stubGlobal('fetch', stubFetch({[FEED_URL]: {status: 500, body: 'boom'}}));
    await expect(loadFeed()).rejects.toMatchObject({code: 'ERR_FETCH_FAILED'});
  });
});

describe('blog adapter — fetchPostText SSRF/origin guard', () => {
  it('rejects a plaintext URL on a non-canonical origin (SSRF)', async () => {
    const spy = vi.fn(async () => ({ok: true, status: 200, text: async () => 'SECRETS'}));
    vi.stubGlobal('fetch', spy);
    await expect(
      fetchPostText('http://169.254.169.254/latest/meta-data'),
    ).rejects.toBeInstanceOf(AstryxError);
    await expect(
      fetchPostText('http://169.254.169.254/latest/meta-data'),
    ).rejects.toMatchObject({code: 'ERR_FETCH_FAILED'});
    // The internal host must never be fetched.
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects an unparseable URL with ERR_FETCH_FAILED', async () => {
    vi.stubGlobal('fetch', vi.fn());
    await expect(fetchPostText('not a url')).rejects.toMatchObject({
      code: 'ERR_FETCH_FAILED',
    });
  });

  it('fetches a same-origin plaintext URL', async () => {
    const url = `${SITE_URL}/blog/how-astryx-works.txt`;
    vi.stubGlobal('fetch', stubFetch({[url]: {status: 200, body: '# body'}}));
    await expect(fetchPostText(url)).resolves.toBe('# body');
  });
});
