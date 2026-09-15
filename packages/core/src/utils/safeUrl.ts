// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file safeUrl.ts
 * @input A URL string arriving via a component prop
 * @output Whether core may navigate to it or hand it to a link component
 * @position Shared URL scheme rule for the imperative navigation and link
 *   plumbing in core (useClickableContainer, useLinkComponent).
 *
 * React DOM vets the hrefs it writes itself, but core also navigates
 * imperatively (window.open, location.href) and forwards hrefs to custom
 * link components — paths React never sees. This is the one rule those
 * paths share: relative URLs and ordinary schemes pass; javascript:,
 * vbscript:, and data:text/html do not.
 *
 * Same rule as the Markdown parser's isSafeUrl (Markdown/parser.ts), kept
 * in step deliberately: control characters are stripped before testing
 * because browsers ignore them inside a scheme, so the check must see the
 * URL the way a browser will.
 */

/** True when `url` is safe to navigate to or render as an href. */
export function isSafeUrl(url: string): boolean {
  // eslint-disable-next-line no-control-regex -- control chars are the bypass
  const normalized = url.replace(/[\x00-\x1f\x7f]/g, '').trim();
  const lower = normalized.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html')
  ) {
    return false;
  }
  return true;
}
