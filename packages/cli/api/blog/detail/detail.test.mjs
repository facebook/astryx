// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the blog.detail leaf — selects a post by slug from the
 * canonical feed, then reads its plaintext (.txt) alternate. `fetch` is stubbed
 * so the test never hits the network. The feed origin is fixed (not
 * user-configurable), so the URLs are asserted directly.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {detail} from './detail.mjs';
import {AstryxError} from '../../error.mjs';
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
      <pubDate>Mon, 29 Jun 2026 00:00:00 GMT</pubDate>
      <atom:link rel="alternate" type="text/plain" href="${SITE_URL}/blog/how-astryx-works.txt" />
    </item>
  </channel>
</rss>`;

const POST_TEXT = '# How Astryx works\n\nThe body of the post.';
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
  vi.stubGlobal('fetch', stubFetch({
    [FEED_URL]: {status: 200, body: FEED},
    [TXT_URL]: {status: 200, body: POST_TEXT},
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('blog.detail leaf', () => {
  it('reads a post via its plaintext alternate', async () => {
    const res = await detail('how-astryx-works');
    expect(res.type).toBe('blog.detail');
    expect(res.data.text).toBe(POST_TEXT);
    expect(res.data.feedUrl).toBe(FEED_URL);
    expect(fetch).toHaveBeenCalledWith(TXT_URL, expect.any(Object));
  });

  it('is case-insensitive on the slug', async () => {
    const res = await detail('How-Astryx-Works');
    expect(res.data.slug).toBe('how-astryx-works');
  });

  it('throws a coded error (not a raw TypeError) for a non-string slug', async () => {
    // The dispatcher routes any truthy value into detail(); a public API
    // caller could pass a non-string. It must surface a coded AstryxError,
    // not a raw TypeError that the CLI downgrades to ERR_UNKNOWN — and it must
    // fail fast, before any network fetch.
    for (const bad of [null, 42, {}, [1]]) {
      await expect(detail(/** @type {any} */ (bad))).rejects.toBeInstanceOf(
        AstryxError,
      );
      await expect(detail(/** @type {any} */ (bad))).rejects.toMatchObject({
        code: 'ERR_INVALID_ARGUMENT',
      });
    }
    // No feed fetch should have happened for the invalid inputs.
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws ERR_UNKNOWN_POST with suggestions for a bad slug', async () => {
    await expect(detail('does-not-exist')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_POST',
    });
    try {
      await detail('does-not-exist');
    } catch (e) {
      expect(e).toBeInstanceOf(AstryxError);
      expect(Array.isArray(e.suggestions)).toBe(true);
      expect(e.suggestions.length).toBeGreaterThan(0);
    }
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
    await expect(detail('how-astryx-works')).rejects.toMatchObject({
      code: 'ERR_FETCH_FAILED',
    });
    // The internal host must never be fetched.
    expect(fetch).not.toHaveBeenCalledWith(
      'http://169.254.169.254/latest/meta-data',
      expect.anything(),
    );
  });
});
