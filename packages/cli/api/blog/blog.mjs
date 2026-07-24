// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the blog command.
 *
 * The blog is read the same way any feed reader reads it: over the published
 * RSS feed. Listing parses the feed; reading a post fetches the plaintext
 * (.txt) alternate the feed advertises for each item. Nothing here touches the
 * blog's source files — the CLI is just a consumer of the public feed, so the
 * blog's structure can change freely without touching the CLI.
 */

import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {SITE_URL, SITE_ORIGIN} from '../../lib/site.mjs';

/** Abort a feed/post fetch that hangs, and cap how much we'll read. */
const FETCH_TIMEOUT_MS = 15000;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — a blog feed is never larger.

const FEED_URL = new URL('/rss.xml', SITE_URL).toString();

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
    });
  } catch (e) {
    clearTimeout(timer);
    const reason =
      e instanceof Error
        ? e.name === 'AbortError'
          ? 'timed out'
          : e.message
        : String(e);
    throw new AstryxError(
      `Could not reach ${url}: ${reason}`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
  clearTimeout(timer);
  if (!res.ok) {
    throw new AstryxError(
      `Request to ${url} failed with ${res.status}`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
  const body = await res.text();
  if (body.length > MAX_BYTES) {
    throw new AstryxError(
      `Response from ${url} exceeded ${MAX_BYTES} bytes`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
  return body;
}

/**
 * Defense in depth: a post's plaintext URL comes from feed content. Require it
 * to live on the canonical origin so even a tampered feed can't redirect the
 * CLI to another host.
 * @param {string} target
 */
function assertCanonicalOrigin(target) {
  let targetOrigin;
  try {
    targetOrigin = new URL(target).origin;
  } catch {
    throw new AstryxError(
      `Post has an invalid plaintext URL: "${target}"`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
  if (targetOrigin !== SITE_ORIGIN) {
    throw new AstryxError(
      `Refusing to fetch post text from a non-canonical origin (${targetOrigin})`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
function unescapeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * @param {string} item
 * @param {string} name
 * @returns {string}
 */
function tag(item, name) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? unescapeXml(m[1].trim()) : '';
}

/**
 * @param {string} item
 * @param {string} name
 * @returns {string[]}
 */
function tagAll(item, name) {
  /** @type {string[]} */
  const out = [];
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'g');
  let m;
  while ((m = re.exec(item))) out.push(unescapeXml(m[1].trim()));
  return out;
}

/**
 * Extract the plaintext alternate href from an <item>.
 * @param {string} item
 * @returns {string | null}
 */
function textHref(item) {
  // Match the atom:link alternate regardless of attribute order/quoting; then
  // confirm it's the text/plain alternate before trusting the href.
  const re = /<atom:link\b[^>]*?\/?>/g;
  let m;
  while ((m = re.exec(item))) {
    const el = m[0];
    if (/rel\s*=\s*["']alternate["']/.test(el) &&
        /type\s*=\s*["']text\/plain["']/.test(el)) {
      const href = el.match(/href\s*=\s*["']([^"']+)["']/);
      if (href) return unescapeXml(href[1]);
    }
  }
  return null;
}

/**
 * Derive a slug from a post link (last path segment).
 * @param {string} link
 * @returns {string}
 */
function slugFromLink(link) {
  try {
    const path = new URL(link).pathname.replace(/\/$/, '');
    return path.slice(path.lastIndexOf('/') + 1);
  } catch {
    return link;
  }
}

/**
 * @param {string} xml
 */
function parseFeed(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const raw = m[1];
    const link = tag(raw, 'link');
    items.push({
      slug: slugFromLink(link),
      title: tag(raw, 'title'),
      description: tag(raw, 'description'),
      date: tag(raw, 'pubDate'),
      type: tag(raw, 'category'),
      authors: tagAll(raw, 'author'),
      link,
      textUrl: textHref(raw),
    });
  }
  return items;
}

/**
 * List posts (from the feed), or read one post (via its .txt alternate).
 * Both envelopes carry `feedUrl` so a caller can hit the RSS feed directly.
 * The feed is always the canonical site — there is no user-supplied URL.
 *
 * @param {string} [slug]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function blog(slug) {
  const xml = await fetchText(FEED_URL);
  const posts = parseFeed(xml);

  if (!slug) {
    return {type: 'blog.list', data: {feedUrl: FEED_URL, posts}};
  }

  const normalized = slug.toLowerCase();
  const post = posts.find(p => p.slug.toLowerCase() === normalized);
  if (!post) {
    throw new AstryxError(
      `No blog post with slug "${slug}"`,
      posts.map(p => ({name: p.slug, reason: 'available post'})),
      ERROR_CODES.ERR_UNKNOWN_POST,
    );
  }

  if (!post.textUrl) {
    throw new AstryxError(
      `Post "${slug}" has no plaintext alternate in the feed`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }

  assertCanonicalOrigin(post.textUrl);
  const text = await fetchText(post.textUrl);
  return {type: 'blog.detail', data: {...post, feedUrl: FEED_URL, text}};
}
