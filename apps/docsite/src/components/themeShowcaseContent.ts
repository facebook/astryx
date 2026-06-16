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

// Butter bakery — five butter/breakfast photos across the six showcase slots.
//   watch → croissant · headphones → pancake · backpack → waffle
//   wallet → toast · tumbler → butter stick · throw_ → croissant (reused; only
//   five Butter assets exist)
const BUTTER_IMAGES: Record<string, string> = {
  watch: `${XDS_CDN}/Butter-Croissant.png`,
  headphones: `${XDS_CDN}/Butter-Pancake.png`,
  backpack: `${XDS_CDN}/Butter-Waffle.png`,
  wallet: `${XDS_CDN}/Butter-Toast.png`,
  tumbler: `${XDS_CDN}/Butter-Stick.png`,
  throw_: `${XDS_CDN}/Butter-Croissant.png`,
};

const BUTTER_CONTENT: ThemeShowcaseContent = {
  images: BUTTER_IMAGES,
  products: [
    {
      name: 'Butter Croissant',
      description: 'Flaky, laminated layers baked golden each morning.',
      badge: 'Fresh',
      badgeVariant: 'yellow',
    },
    {
      name: 'Buttermilk Pancakes',
      description: 'Stacked tall with a melting pat of butter.',
      badge: 'Popular',
      badgeVariant: 'orange',
    },
    {
      name: 'Belgian Waffle',
      description: 'Deep pockets made for syrup and butter.',
      badge: 'New',
      badgeVariant: 'green',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: 'Butter Croissant',
      meta: 'All-butter, 27 layers',
      available: 64,
      location: 'Case 1',
      tags: [{label: 'Fresh', variant: 'yellow'}],
      imageKey: 'watch',
      thumbnailFallback: 'C',
      selected: false,
    },
    {
      id: 'b',
      name: 'Buttermilk Pancakes',
      meta: 'Stack of three',
      available: 38,
      location: 'Griddle',
      tags: [{label: 'Popular', variant: 'orange'}],
      imageKey: 'headphones',
      thumbnailFallback: 'P',
      selected: true,
    },
    {
      id: 'c',
      name: 'Belgian Waffle',
      meta: 'Liège style, pearl sugar',
      available: 51,
      location: 'Griddle',
      tags: [{label: 'New', variant: 'green'}],
      imageKey: 'backpack',
      thumbnailFallback: 'W',
      selected: false,
    },
    {
      id: 'd',
      name: 'Buttered Toast',
      meta: 'Sourdough, thick cut',
      available: 12,
      location: 'Case 2',
      tags: [{label: 'Classic', variant: 'yellow'}],
      imageKey: 'wallet',
      thumbnailFallback: 'T',
      selected: true,
    },
    {
      id: 'e',
      name: 'Cultured Butter',
      meta: 'European style, salted',
      available: 27,
      location: 'Cooler',
      tags: [{label: 'Staple', variant: 'orange'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'B',
      selected: false,
    },
    {
      id: 'f',
      name: 'Almond Croissant',
      meta: 'Frangipane filled',
      available: 19,
      location: 'Case 1',
      tags: [{label: 'Limited', variant: 'green'}],
      imageKey: 'throw_',
      thumbnailFallback: 'A',
      selected: true,
    },
  ],
};

// Stone homeware — five speckled-stoneware photos across the six slots.
//   watch → mug · headphones → shallow bowl · backpack → tumbler
//   wallet → plate · tumbler → deep bowl · throw_ → mug (reused; only five
//   light-product assets exist)
const STONE_IMAGES: Record<string, string> = {
  watch: `${XDS_CDN}/light-product-1.png`,
  headphones: `${XDS_CDN}/light-product-2.png`,
  backpack: `${XDS_CDN}/light-product-3.png`,
  wallet: `${XDS_CDN}/light-product-4.png`,
  tumbler: `${XDS_CDN}/light-product-5.png`,
  throw_: `${XDS_CDN}/light-product-1.png`,
};

const STONE_CONTENT: ThemeShowcaseContent = {
  images: STONE_IMAGES,
  products: [
    {
      name: 'Speckled Mug',
      description: 'Hand-thrown stoneware with a raw clay foot.',
      badge: 'New',
      badgeVariant: 'blue',
    },
    {
      name: 'Stoneware Bowl',
      description: 'Shallow serving bowl, reactive matte glaze.',
      badge: 'Popular',
      badgeVariant: 'green',
    },
    {
      name: 'Ceramic Tumbler',
      description: 'Everyday cup with a speckled, tactile finish.',
      badge: 'Limited',
      badgeVariant: 'yellow',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: 'Speckled Mug',
      meta: 'Stoneware, 12oz',
      available: 64,
      location: 'Shelf 1',
      tags: [{label: 'New', variant: 'blue'}],
      imageKey: 'watch',
      thumbnailFallback: 'M',
      selected: false,
    },
    {
      id: 'b',
      name: 'Stoneware Bowl',
      meta: 'Reactive glaze, 16cm',
      available: 38,
      location: 'Shelf 2',
      tags: [{label: 'Popular', variant: 'green'}],
      imageKey: 'headphones',
      thumbnailFallback: 'B',
      selected: true,
    },
    {
      id: 'c',
      name: 'Ceramic Tumbler',
      meta: 'Speckled, 10oz',
      available: 51,
      location: 'Shelf 1',
      tags: [{label: 'Limited', variant: 'yellow'}],
      imageKey: 'backpack',
      thumbnailFallback: 'T',
      selected: false,
    },
    {
      id: 'd',
      name: 'Dinner Plate',
      meta: 'Two-tone, 22cm',
      available: 15,
      location: 'Shelf 3',
      tags: [{label: 'Tableware', variant: 'orange'}],
      imageKey: 'wallet',
      thumbnailFallback: 'P',
      selected: true,
    },
    {
      id: 'e',
      name: 'Deep Serving Bowl',
      meta: 'Matte clay foot, 20cm',
      available: 27,
      location: 'Shelf 2',
      tags: [{label: 'Kitchen', variant: 'green'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'D',
      selected: false,
    },
    {
      id: 'f',
      name: 'Espresso Cup',
      meta: 'Stoneware, 3oz',
      available: 19,
      location: 'Shelf 1',
      tags: [{label: 'Small batch', variant: 'orange'}],
      imageKey: 'throw_',
      thumbnailFallback: 'E',
      selected: true,
    },
  ],
};

// Y2K trinkets — five iridescent/holo charms across the six slots.
//   watch → flip phone · headphones → puffy heart · backpack → butterfly
//   wallet → glow stars · tumbler → daisy charm · throw_ → heart (reused; only
//   five Y2K assets exist)
const Y2K_IMAGES: Record<string, string> = {
  watch: `${XDS_CDN}/Y2K-Phone.png`,
  headphones: `${XDS_CDN}/Y2K-Heart.png`,
  backpack: `${XDS_CDN}/Y2K-Butterfly.png`,
  wallet: `${XDS_CDN}/Y2K-Star.png`,
  tumbler: `${XDS_CDN}/Y2K-Flower.png`,
  throw_: `${XDS_CDN}/Y2K-Heart.png`,
};

const Y2K_CONTENT: ThemeShowcaseContent = {
  images: Y2K_IMAGES,
  products: [
    {
      name: 'Holo Flip Phone',
      description: 'Iridescent clamshell with a rainbow screen.',
      badge: 'Retro',
      badgeVariant: 'blue',
    },
    {
      name: 'Puffy Heart Charm',
      description: 'Squishy holographic heart for your bag.',
      badge: 'Popular',
      badgeVariant: 'pink',
    },
    {
      name: 'Glitter Butterfly',
      description: 'Sparkly stick-on in pastel chrome.',
      badge: 'New',
      badgeVariant: 'purple',
    },
  ],
  inventory: [
    {
      id: 'a',
      name: 'Holo Flip Phone',
      meta: 'Iridescent, rainbow LCD',
      available: 64,
      location: 'Bin 1',
      tags: [{label: 'Retro', variant: 'blue'}],
      imageKey: 'watch',
      thumbnailFallback: 'P',
      selected: false,
    },
    {
      id: 'b',
      name: 'Puffy Heart Charm',
      meta: 'Squishy, holo finish',
      available: 38,
      location: 'Bin 2',
      tags: [{label: 'Popular', variant: 'pink'}],
      imageKey: 'headphones',
      thumbnailFallback: 'H',
      selected: true,
    },
    {
      id: 'c',
      name: 'Glitter Butterfly',
      meta: 'Stick-on, pastel chrome',
      available: 51,
      location: 'Bin 2',
      tags: [{label: 'New', variant: 'purple'}],
      imageKey: 'backpack',
      thumbnailFallback: 'B',
      selected: false,
    },
    {
      id: 'd',
      name: 'Glow Star Set',
      meta: 'Glow-in-the-dark, pack of 3',
      available: 12,
      location: 'Bin 3',
      tags: [{label: 'Classic', variant: 'green'}],
      imageKey: 'wallet',
      thumbnailFallback: 'S',
      selected: true,
    },
    {
      id: 'e',
      name: 'Daisy Charm',
      meta: 'Holographic, clip-on',
      available: 27,
      location: 'Bin 3',
      tags: [{label: 'Cute', variant: 'pink'}],
      imageKey: 'tumbler',
      thumbnailFallback: 'D',
      selected: false,
    },
    {
      id: 'f',
      name: 'Heart Sticker Pack',
      meta: 'Holo, sheet of 12',
      available: 19,
      location: 'Bin 1',
      tags: [{label: 'Limited', variant: 'purple'}],
      imageKey: 'throw_',
      thumbnailFallback: 'H',
      selected: true,
    },
  ],
};

const CONTENT_BY_THEME: Record<string, ThemeShowcaseContent> = {
  matcha: MATCHA_CONTENT,
  butter: BUTTER_CONTENT,
  stone: STONE_CONTENT,
  y2k: Y2K_CONTENT,
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
