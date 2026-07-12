// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file release.ts
 * Detects "release posts" from their title so they can render a generated
 * version cover instead of a hand-authored image.
 *
 * @input  a post title
 * @output the semantic version embedded in the title (e.g. "0.1.3"), or null
 * @position Used by BlogCard/BlogArticle to decide whether to render ReleaseCoverArt.
 */

/**
 * Extract a `vX.Y[.Z]` version from a post title. A post is treated as a
 * release post when its title carries such a version (e.g. "Astryx v0.1.3: …").
 * Returns the version without the leading `v`, or null when none is present.
 */
export function parseReleaseVersion(title: string): string | null {
  const match = title.match(/\bv(\d+\.\d+(?:\.\d+)?)\b/i);
  return match ? match[1] : null;
}
