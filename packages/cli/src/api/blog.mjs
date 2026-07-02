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

import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

/** Default published origin. Override for previews via the `site` option. */
export const DEFAULT_SITE = 'https://astryx.atmeta.com';

function feedUrl(site) {
  return new URL('/rss.xml', site).toString();
}

async function fetchText(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new AstryxError(
      `Could not reach ${url}: ${e.message}`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
  if (!res.ok) {
    throw new AstryxError(
      `Request to ${url} failed with ${res.status}`,
      [],
      ERROR_CODES.ERR_FETCH_FAILED,
    );
  }
  return res.text();
}

function unescapeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function tag(item, name) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? unescapeXml(m[1].trim()) : '';
}

function tagAll(item, name) {
  const out = [];
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'g');
  let m;
  while ((m = re.exec(item))) out.push(unescapeXml(m[1].trim()));
  return out;
}

/** Extract the plaintext alternate href from an <item>. */
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

/** Derive a slug from a post link (last path segment). */
function slugFromLink(link) {
  try {
    const path = new URL(link).pathname.replace(/\/$/, '');
    return path.slice(path.lastIndexOf('/') + 1);
  } catch {
    return link;
  }
}

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
 *
 * @param {string} [slug]
 * @param {object} [options]
 * @param {string} [options.site]  Origin to read from (default published site).
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function blog(slug, options = {}) {
  const {site = DEFAULT_SITE} = options;
  const xml = await fetchText(feedUrl(site));
  const posts = parseFeed(xml);

  if (!slug) {
    return {type: 'blog.list', data: posts};
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

  const text = await fetchText(post.textUrl);
  return {type: 'blog.detail', data: {...post, text}};
}
