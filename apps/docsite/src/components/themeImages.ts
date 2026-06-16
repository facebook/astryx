// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Per-theme product image registry.
 *
 * Each theme can ship its own set of 6 product photos (watch, headphones,
 * backpack, wallet, tumbler, throw). These images appear in two places on the
 * dedicated /themes/<name> page:
 *
 *   1. ThemeShowcasePreview — the live themed fake "Studio" app, where the
 *      first three (watch, headphones, backpack) render as 1:1 product
 *      card photos.
 *   2. ThemeCardShowcase — the inventory table thumbnails, which use all
 *      six.
 *
 * Adding photos for a new theme:
 *   1. Drop the 6 PNGs into public/<theme-slug>/preview-<item>.png
 *   2. Add an entry to THEME_IMAGES below pointing at those paths
 *   3. That's it — both consumers pick them up automatically
 *
 * Themes not listed in THEME_IMAGES fall back to the neutral image set,
 * so the page never has missing thumbnails — just the most neutral
 * possible product photos until a bespoke set lands.
 */

export interface ThemeImageSet {
  watch: string;
  headphones: string;
  backpack: string;
  wallet: string;
  tumbler: string;
  throw_: string;
}

// Neutral product photos, served from the shared xds_oss asset CDN.
const NEUTRAL_CDN = 'https://lookaside.facebook.com/assets/xds_oss';
const NEUTRAL_IMAGES: ThemeImageSet = {
  watch: `${NEUTRAL_CDN}/Neutral-Watch.png`,
  headphones: `${NEUTRAL_CDN}/Neutral-Headphones.png`,
  backpack: `${NEUTRAL_CDN}/Neutral-Backpack.png`,
  wallet: `${NEUTRAL_CDN}/Neutral-Wallet.png`,
  tumbler: `${NEUTRAL_CDN}/Neutral-Tumbler.png`,
  throw_: `${NEUTRAL_CDN}/Neutral-Blanket.png`,
};

/**
 * Per-theme image overrides. Keyed by theme name (matches XDSDefinedTheme.name
 * and the slug used in /themes/<slug> URLs). Themes not listed here fall back
 * to the neutral set via getThemeImages().
 *
 * To add a new theme:
 *   1. Drop images into public/<theme-name>/preview-*.png
 *   2. Add an entry below:
 *      butter: {
 *        watch: '/butter/preview-watch.png',
 *        ...etc
 *      }
 */
const THEME_IMAGES: Record<string, ThemeImageSet> = {
  neutral: NEUTRAL_IMAGES,
};

/**
 * Resolve the image set for a theme name. Falls back to NEUTRAL_IMAGES for
 * themes that don't have their own image set yet.
 */
export function getThemeImages(themeName: string): ThemeImageSet {
  return THEME_IMAGES[themeName] ?? NEUTRAL_IMAGES;
}
