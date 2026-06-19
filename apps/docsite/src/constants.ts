// Copyright (c) Meta Platforms, Inc. and affiliates.

export const GITHUB_REPO = 'https://github.com/facebookexperimental/xds';

/**
 * Astryx brand blue — logo/wordmark only (not wired to any semantic token).
 * Lives here, not in astryxTheme.ts, so it can be imported without pulling in
 * the unbuilt source theme object (which triggers runtime style injection).
 */
export const BRAND_BLUE = 'light-dark(#225BFF, #3D87FF)';
