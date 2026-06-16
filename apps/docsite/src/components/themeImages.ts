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
 * Photos are served from the shared `xds_oss` asset CDN, named
 * `<TitleTheme>-<Item>.png` (e.g. `Neutral-Watch.png`). The `cdnSet()` helper
 * builds the 6 URLs from a theme's title-case name, so adding a theme is just
 * one entry once its assets exist on the CDN.
 *
 * Readiness gate: a theme only uses its own set once `ready: true`. Until its
 * photos are uploaded, it stays `ready: false` and falls back to the Neutral
 * set — so the page never shows broken/404 thumbnails while a set is in
 * progress. Flip `ready` to `true` the moment the assets land.
 */

export interface ThemeImageSet {
  watch: string;
  headphones: string;
  backpack: string;
  wallet: string;
  tumbler: string;
  throw_: string;
}

const XDS_CDN = 'https://lookaside.facebook.com/assets/xds_oss';

/**
 * Per-item CDN file suffix. The asset names don't always match the registry
 * key 1:1 (e.g. the `throw_` slot is served as `*-Blanket.png`), so map each
 * key to its canonical file item name here.
 */
const ITEM_FILE: Record<keyof ThemeImageSet, string> = {
  watch: 'Watch',
  headphones: 'Headphones',
  backpack: 'Backpack',
  wallet: 'Wallet',
  tumbler: 'Tumbler',
  throw_: 'Blanket',
};

/**
 * Build a full image set for a theme from its title-case name, following the
 * `<TitleTheme>-<Item>.png` CDN convention. `overrides` lets a theme point an
 * individual slot at a differently-named asset without hand-writing all six.
 */
function cdnSet(
  titleTheme: string,
  overrides: Partial<ThemeImageSet> = {},
): ThemeImageSet {
  const url = (item: string) => `${XDS_CDN}/${titleTheme}-${item}.png`;
  return {
    watch: overrides.watch ?? url(ITEM_FILE.watch),
    headphones: overrides.headphones ?? url(ITEM_FILE.headphones),
    backpack: overrides.backpack ?? url(ITEM_FILE.backpack),
    wallet: overrides.wallet ?? url(ITEM_FILE.wallet),
    tumbler: overrides.tumbler ?? url(ITEM_FILE.tumbler),
    throw_: overrides.throw_ ?? url(ITEM_FILE.throw_),
  };
}

const NEUTRAL_IMAGES: ThemeImageSet = cdnSet('Neutral');

interface ThemeImageEntry {
  images: ThemeImageSet;
  /**
   * Whether this theme's bespoke photos exist on the CDN yet. When false, the
   * theme falls back to NEUTRAL_IMAGES so no broken thumbnails are shown. Flip
   * to true once all six assets are uploaded.
   */
  ready: boolean;
}

/**
 * Per-theme image overrides, keyed by theme name (matches XDSDefinedTheme.name
 * and the slug used in /themes/<slug> URLs).
 *
 * Each non-ready entry is pre-wired to the `<TitleTheme>-<Item>.png` convention
 * so it can be turned on by flipping `ready: true` (and adjusting any slot
 * whose asset is named differently via the cdnSet overrides). Confirm the exact
 * uploaded asset names before flipping each one on.
 */
const THEME_IMAGES: Record<string, ThemeImageEntry> = {
  neutral: {images: NEUTRAL_IMAGES, ready: true},

  // Pending bespoke photo sets — fall back to Neutral until their CDN assets
  // exist. Flip `ready: true` per theme once uploaded.
  butter: {images: cdnSet('Butter'), ready: false},
  matcha: {images: cdnSet('Matcha'), ready: false},
  daily: {images: cdnSet('Daily'), ready: false},
  gothic: {images: cdnSet('Gothic'), ready: false},
  y2k: {images: cdnSet('Y2K'), ready: false},
  stone: {images: cdnSet('Stone'), ready: false},
  chocolate: {images: cdnSet('Chocolate'), ready: false},
};

/**
 * Resolve the image set for a theme name. Returns a theme's bespoke set only
 * when it's marked ready; otherwise falls back to NEUTRAL_IMAGES so the page
 * never renders missing/404 thumbnails.
 */
export function getThemeImages(themeName: string): ThemeImageSet {
  const entry = THEME_IMAGES[themeName];
  return entry?.ready ? entry.images : NEUTRAL_IMAGES;
}
