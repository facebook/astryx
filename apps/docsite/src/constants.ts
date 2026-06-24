// Copyright (c) Meta Platforms, Inc. and affiliates.

export const GITHUB_REPO = 'https://github.com/facebook/astryx';

export const DISCORD_URL = 'https://discord.com/invite/XnsUcFykEP';
export const FACEBOOK_URL = 'https://www.facebook.com/astryxdesign';
export const INSTAGRAM_URL = 'https://www.instagram.com/astryxdesign';
export const THREADS_URL = 'https://www.threads.com/@astryxdesign';
export const X_URL = 'https://x.com/Astryxdesign';

/**
 * Public GitHub Pages deployment for the site (Storybook, sandbox, and the
 * landing page). Distinct from GITHUB_REPO, which points at the source repo.
 * See .github/workflows/deploy.yml — the site is published to gh-pages with
 * no CNAME, so it resolves to the org's github.io subpath.
 */
export const GITHUB_PAGES = 'https://facebook.github.io/astryx';

/**
 * Astryx brand blue — logo/wordmark only (not wired to any semantic token).
 * Lives here, not in astryxTheme.ts, so it can be imported without pulling in
 * the unbuilt source theme object (which triggers runtime style injection).
 */
export const BRAND_BLUE = 'light-dark(#225BFF, #3D87FF)';
