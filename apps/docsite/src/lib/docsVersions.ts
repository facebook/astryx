// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Version-switching wiring for the docsite.
 *
 * The docsite ships as ONE codebase built for two content targets:
 *   - `latest`  — documents the last published release (what `npm install`
 *                 gives you today). This is the default, canonical site.
 *   - `canary`  — documents `main` (work-in-progress, unreleased).
 *
 * Both are deployed from the same code; only the package sources the build-time
 * data pipeline reads from differ (see scripts/resolve-content-root.mjs). Two
 * UI affordances let a reader move between the deploys while keeping their
 * current path: a low-key footer link (DocsVersionFooterLink) on every page,
 * and — on canary only — the prominent CanaryBanner link back to latest.
 *
 * Deploy URLs are configurable via env so the same code works in production,
 * preview, and local dev. When a target's base URL is unset (e.g. local dev
 * with a single build) urlForTarget degrades to a no-op link to `/`.
 */

import {buildTarget, type DocsTarget} from '../generated/buildTarget';

export interface DocsVersionInfo {
  target: DocsTarget;
  /** Menu label, e.g. "Latest (stable)". */
  label: string;
  /**
   * Base path or absolute URL of that deploy. Empty string means "this origin,
   * at the root" (the default latest deploy). A path like "/canary" or an
   * absolute "https://…" are both supported.
   */
  baseUrl: string;
}

/**
 * Base path/URL for each target. In the default ONE-DEPLOY topology
 * (see scripts/build-versioned.mjs) both targets live on the SAME deployment:
 *   latest → served at "/"        (full Next server build)
 *   canary → served at "/canary"  (static export nested in public/canary/)
 * so the defaults are same-origin path prefixes and version switching works
 * with no configuration.
 *
 * To split the targets across two deployments/domains instead, set absolute
 * URLs at build time (read by the client bundle, hence NEXT_PUBLIC_):
 *   NEXT_PUBLIC_DOCS_LATEST_URL  — e.g. https://astryx.dev
 *   NEXT_PUBLIC_DOCS_CANARY_URL  — e.g. https://next.astryx.dev
 */
const LATEST_URL = process.env.NEXT_PUBLIC_DOCS_LATEST_URL ?? '';
const CANARY_URL = process.env.NEXT_PUBLIC_DOCS_CANARY_URL ?? '/canary';

export const DOCS_VERSIONS: Record<DocsTarget, DocsVersionInfo> = {
  latest: {target: 'latest', label: 'Latest (stable)', baseUrl: LATEST_URL},
  canary: {target: 'canary', label: 'Canary (main)', baseUrl: CANARY_URL},
};

/** The target this build was generated for. */
export const CURRENT_TARGET: DocsTarget = buildTarget.target;

/** The @astryxdesign/core version this build documents, if known. */
export const CURRENT_CORE_VERSION: string | null = buildTarget.coreVersion;

/** Base paths, ordered longest-first, that a target may be mounted under. */
const KNOWN_BASE_PATHS = ['/canary'];

/**
 * Strip a known target base path prefix from a pathname so we get the
 * target-agnostic "logical" path. e.g. on the canary deploy the current
 * pathname is "/canary/components"; the logical path is "/components".
 */
function toLogicalPath(pathname: string): string {
  for (const base of KNOWN_BASE_PATHS) {
    if (pathname === base) {
      return '/';
    }
    if (pathname.startsWith(base + '/')) {
      return pathname.slice(base.length);
    }
  }
  return pathname || '/';
}

/**
 * Build the URL that lands on the same logical page in the given target's
 * deploy. `path` is the CURRENT pathname (which may carry the current target's
 * base path); we normalize it first, then apply the destination target's base.
 * Returns null only when the destination is the current target (no-op).
 */
export function urlForTarget(target: DocsTarget, path: string): string | null {
  if (target === CURRENT_TARGET) {
    return null;
  }
  const logical = toLogicalPath(path);
  const base = DOCS_VERSIONS[target].baseUrl.replace(/\/$/, '');
  const suffix = logical.startsWith('/') ? logical : `/${logical}`;
  // base "" → same origin at root; base "/canary" → nested; base "https://…"
  // → other origin. All compose the same way.
  return `${base}${suffix}` || '/';
}
