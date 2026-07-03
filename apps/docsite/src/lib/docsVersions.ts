// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Version-switcher wiring for the docsite.
 *
 * The docsite ships as ONE codebase built for two content targets:
 *   - `latest`  — documents the last published release (what `npm install`
 *                 gives you today). This is the default, canonical site.
 *   - `canary`  — documents `main` (work-in-progress, unreleased).
 *
 * Both are deployed from the same code; only the package sources the build-time
 * data pipeline reads from differ (see scripts/resolve-content-root.mjs). The
 * switcher lets a reader jump between the two deploys while keeping their
 * current path, so "the same page, other version" is one click away.
 *
 * Deploy URLs are configurable via env so the same code works in production,
 * preview, and local dev. When a target's base URL is unset (e.g. local dev
 * with a single build) the switcher degrades to a no-op link to `/`.
 */

import {buildTarget, type DocsTarget} from '../generated/buildTarget';

export interface DocsVersionInfo {
  target: DocsTarget;
  /** Menu label, e.g. "Latest (stable)". */
  label: string;
  /** Absolute base URL of that deploy, or null if not configured. */
  baseUrl: string | null;
}

/**
 * Base URLs for each deployed target. Set at build time:
 *   NEXT_PUBLIC_DOCS_LATEST_URL  — e.g. https://astryx.dev
 *   NEXT_PUBLIC_DOCS_CANARY_URL  — e.g. https://next.astryx.dev
 * Both are read by the client bundle (hence NEXT_PUBLIC_).
 */
const LATEST_URL = process.env.NEXT_PUBLIC_DOCS_LATEST_URL ?? null;
const CANARY_URL = process.env.NEXT_PUBLIC_DOCS_CANARY_URL ?? null;

export const DOCS_VERSIONS: Record<DocsTarget, DocsVersionInfo> = {
  latest: {target: 'latest', label: 'Latest (stable)', baseUrl: LATEST_URL},
  canary: {target: 'canary', label: 'Canary (main)', baseUrl: CANARY_URL},
};

/** The target this build was generated for. */
export const CURRENT_TARGET: DocsTarget = buildTarget.target;

/** The @astryxdesign/core version this build documents, if known. */
export const CURRENT_CORE_VERSION: string | null = buildTarget.coreVersion;

/**
 * Build the URL that lands on the same `path` in the given target's deploy.
 * Returns null when that target has no configured base URL (so callers can
 * disable the option instead of linking somewhere broken).
 */
export function urlForTarget(target: DocsTarget, path: string): string | null {
  const base = DOCS_VERSIONS[target].baseUrl;
  if (!base) {return null;}
  const trimmed = base.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${trimmed}${suffix}`;
}

/** True when at least one *other* target has a configured deploy URL. */
export function hasSwitchableTargets(): boolean {
  return (Object.keys(DOCS_VERSIONS) as DocsTarget[]).some(
    t => t !== CURRENT_TARGET && DOCS_VERSIONS[t].baseUrl != null,
  );
}
