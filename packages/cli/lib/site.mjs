// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file site.mjs — the canonical Astryx site origin for CLI code.
 *
 * The published Astryx site is the single source of truth for docs, the blog,
 * and the MCP endpoint. Anything in the CLI that needs to reach the site reads
 * this constant, so the origin is defined in exactly one place. It is
 * intentionally not user-configurable: the CLI should never be pointed at an
 * arbitrary host.
 *
 * (The docsite has its own SITE_URL in apps/docsite; the CLI is a separately
 * published package and can't import from the app, so the origin is mirrored
 * here for CLI use.)
 */

export const SITE_URL = 'https://astryx.atmeta.com';

/** The site's origin (scheme + host), used for same-origin checks. */
export const SITE_ORIGIN = new URL(SITE_URL).origin;
