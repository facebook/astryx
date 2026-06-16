// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Per-theme content for the /themes showcase (the theme-showcase template
 * rendered by ThemePackagePage).
 *
 * The template ships with a generic "Studio" store (minimalist watch, wireless
 * headphones, etc.) as its defaults. Some themes read better with bespoke
 * products that match their personality — e.g. Matcha shows a matcha café menu
 * instead of gadgets. This registry supplies those overrides; the template
 * falls back to its own neutral defaults for any theme not listed here.
 *
 * Keyed by theme slug (the `<slug>` in `@xds/theme-<slug>` / /themes?theme=<slug>).
 */

import type {
  ProductSpec,
  InventoryRow,
} from '../../../../packages/cli/templates/pages/theme-showcase/page';

export interface ThemeShowcaseContent {
  images: Record<string, string>;
  products: ProductSpec[];
  inventory: InventoryRow[];
}

const XDS_CDN = 'https://lookaside.facebook.com/assets/xds_oss';

// Matcha café — six matcha-drink photos mapped onto the showcase slots.
//   watch → classic latte · headphones → strawberry · backpack → ube
//   wallet → vanilla · tumbler → hazelnut · throw_ → mocha
const MATCHA_IMAGES: Record<string, string> = {
  watch: `${XDS_CDN}/matcha-product-1.png`,
  headphones: `${XDS_CDN}/matcha-product-2.png`,
  backpack: `${XDS_CDN}/matcha-product-3.png`,
  wallet: `${XDS_CDN}/matcha-product-5.png`,
  tumbler: `${XDS_CDN}/matcha-product-4.png`,
  throw_: `${XDS_CDN}/matcha-product-6.png`,
};

const MATCHA_CONTENT: ThemeShowcaseContent = {
  images: MATCHA_IMAGES,
  products: [
    {
      name: 'Iced Matcha Latte',
      description: 'Stone-ground ceremonial matcha over cold milk.',
      badge: 'Classic',
      badgeVariant: 'green',
    },
    {
      name: 'Strawberry Matcha',
      description: 'Fresh strawberry purée layered with bright matcha.',
      badge: 'Seasonal',
      badgeVariant: 'orange',
    },
    {
      name: 'Ube Matcha',
      description: 'Creamy ube and matcha for a sweet, earthy swirl.',
      badge: 'New',
      badgeVariant: 'blue',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: 'Iced Matcha Latte',
      meta: 'Ceremonial grade, oat or whole',
      available: 64,
      location: 'Bar 1',
      tags: [{label: 'Classic', variant: 'green'}],
      imageKey: 'watch',
      thumbnailFallback: 'M',
      selected: false,
    },
    {
      id: 'b',
      name: 'Strawberry Matcha',
      meta: 'Real fruit purée, no syrup',
      available: 38,
      location: 'Bar 2',
      tags: [{label: 'Seasonal', variant: 'orange'}],
      imageKey: 'headphones',
      thumbnailFallback: 'S',
      selected: true,
    },
    {
      id: 'c',
      name: 'Ube Matcha',
      meta: 'Ube cream, double shot',
      available: 51,
      location: 'Bar 2',
      tags: [{label: 'New', variant: 'blue'}],
      imageKey: 'backpack',
      thumbnailFallback: 'U',
      selected: false,
    },
    {
      id: 'd',
      name: 'Vanilla Matcha',
      meta: 'Madagascar vanilla bean',
      available: 12,
      location: 'Bar 3',
      tags: [{label: 'Smooth', variant: 'yellow'}],
      imageKey: 'wallet',
      thumbnailFallback: 'V',
      selected: true,
    },
    {
      id: 'e',
      name: 'Hazelnut Matcha',
      meta: 'Toasted hazelnut, whipped top',
      available: 27,
      location: 'Bar 3',
      tags: [{label: 'Rich', variant: 'green'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'H',
      selected: false,
    },
    {
      id: 'f',
      name: 'Matcha Mocha',
      meta: 'Dark chocolate, single origin',
      available: 19,
      location: 'Bar 4',
      tags: [{label: 'Bold', variant: 'orange'}],
      imageKey: 'throw_',
      thumbnailFallback: 'M',
      selected: true,
    },
  ],
};

const CONTENT_BY_THEME: Record<string, ThemeShowcaseContent> = {
  matcha: MATCHA_CONTENT,
};

/**
 * Resolve bespoke showcase content for a theme slug, or `undefined` when the
 * theme has no override (the template then renders its neutral defaults).
 */
export function getThemeShowcaseContent(
  slug: string,
): ThemeShowcaseContent | undefined {
  return CONTENT_BY_THEME[slug];
}
