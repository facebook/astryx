// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Version-line wiring for the docsite.
 *
 * The docsite ships as ONE codebase deployed from `main`. Which content line a
 * given deploy documents is decided at build time by the deploy target:
 *
 *   - `latest`  — the last published release (what `npm install` gives you
 *                 today). The canonical, default site. Production only.
 *   - `canary`  — the live monorepo `main` (unreleased, WIP). The canary deploy
 *                 AND every PR preview.
 *
 * The build-time data pipeline reads package docs from the matching source (see
 * scripts/resolve-content-root.mjs); this module is the client-side counterpart
 * that tells the banner + footer link which line they're on and where the other
 * one lives.
 *
 * Target is derived from Vercel's environment: the production deploy is
 * `latest`; preview (the `main` deploy and every PR preview) and local dev are
 * `canary`. Reading `NEXT_PUBLIC_VERCEL_ENV` (Vercel's build-time system var,
 * exposed to the client bundle) keeps this a single source of truth with the
 * pipeline, with no generated file to keep in sync.
 */

export type DocsTarget = 'latest' | 'canary';

/**
 * Absolute URLs of the two deploys, used to cross-link between them. Configured
 * per Vercel project; the defaults match the current production + canary hosts
 * so the links work even if the env vars are ever unset.
 */
const LATEST_URL =
  process.env.NEXT_PUBLIC_DOCS_LATEST_URL ?? 'https://astryx.atmeta.com';
const CANARY_URL =
  process.env.NEXT_PUBLIC_DOCS_CANARY_URL ?? 'https://astryx-canary.vercel.app';

export interface DocsVersionInfo {
  target: DocsTarget;
  /** Human-readable label. */
  label: string;
  /** Absolute base URL of that deploy. */
  baseUrl: string;
}

export const DOCS_VERSIONS: Record<DocsTarget, DocsVersionInfo> = {
  latest: {target: 'latest', label: 'Latest (stable)', baseUrl: LATEST_URL},
  canary: {target: 'canary', label: 'Canary (main)', baseUrl: CANARY_URL},
};

/**
 * The target this build was produced for. Production → `latest`; every other
 * environment (preview = the `main` deploy + PR previews, development) →
 * `canary`. An explicit `NEXT_PUBLIC_DOCS_TARGET` overrides, mirroring the
 * pipeline's `DOCSITE_TARGET` override for local testing.
 */
export const CURRENT_TARGET: DocsTarget =
  process.env.NEXT_PUBLIC_DOCS_TARGET === 'latest'
    ? 'latest'
    : process.env.NEXT_PUBLIC_DOCS_TARGET === 'canary'
      ? 'canary'
      : process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? 'latest'
        : 'canary';

/**
 * URL of the same logical page on the other version's deploy. Both deploys
 * serve identical routes at their own origin, so we just swap the base URL and
 * keep the path. Returns null when there is no distinct sibling to link to
 * (e.g. a local build with both URLs pointing at the same origin).
 */
export function urlForTarget(target: DocsTarget, path: string): string | null {
  if (target === CURRENT_TARGET) {
    return null;
  }
  const base = DOCS_VERSIONS[target].baseUrl.replace(/\/$/, '');
  if (!base) {
    return null;
  }
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
