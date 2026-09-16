// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file url.ts
 * @input Untrusted Markdown link or image destination
 * @output Normalized safe destination or rejection
 * @position Shared URL policy for parser, transforms, and renderer
 */

const DANGEROUS_URL_PATTERN = /^(javascript|data:text\/html|vbscript):/i;

export function sanitizeMarkdownUrl(url: string): string | null {
  // Browsers ignore embedded controls in schemes, so normalize before checking.
  // eslint-disable-next-line no-control-regex -- control chars are the bypass
  const normalized = url.replace(/[\x00-\x1f\x7f]/g, '').trim();
  return normalized !== '' && !DANGEROUS_URL_PATTERN.test(normalized)
    ? normalized
    : null;
}

export function isSafeMarkdownUrl(url: string): boolean {
  return sanitizeMarkdownUrl(url) != null;
}
