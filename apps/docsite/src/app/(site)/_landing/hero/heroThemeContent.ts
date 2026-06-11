// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file heroThemeContent.ts
 * @input the docsite theme package registry (generated) + the local Astryx theme
 * @output an ordered list of {theme, label, content} entries the hero cycles
 * @position Home hero — single source of truth for the theming showcase reel.
 *
 * The hero's floating UI cards are built from themed XDS components, so colors,
 * type, radius, and motion re-skin automatically when wrapped in <XDSTheme>.
 * The only per-theme *content* (copy + a representative product photo) lives
 * here so each slide in the reel reads as a believable, on-brand mini-app
 * rather than the same lorem repeated.
 *
 * The reel intentionally features a curated subset of themes (not every
 * installed package) — see REEL_THEMES below for the exact list + order. Astryx
 * leads because it's the docsite's own brand theme (defined locally, not shipped
 * as an @xds/theme-* package), so it's added explicitly rather than pulled from
 * the package registry.
 */

import type {XDSDefinedTheme} from '@xds/core/theme';
import {packages} from '../../../../generated/packageRegistry';
import {themeObjects} from '../../../../generated/themeRegistry';
import {astryxTheme} from '../../../../themes/astryxTheme';

// Sentinel name for the docsite's own brand theme. Not an @xds/theme-* package,
// so it never appears in the generated registry — handled explicitly below.
const ASTRYX = 'astryx';

export interface HeroThemeContent {
  /**
   * Left floating card — an image-led product card with an assistant prompt
   * bubble overlapping the bottom of the photo.
   */
  product: {
    /** Path under /public for the product photo (clean product-on-color). */
    image: string;
    /** Short product title. */
    title: string;
    /** One-line product description. */
    description: string;
    /** Price string. */
    price: string;
  };
  /**
   * Right floating card — a second, taller image-led product card. A small
   * "mini" buy card overlaps its lower-left corner (see `mini`).
   */
  feature: {
    image: string;
    title: string;
    price: string;
  };
  /** The small overlapping buy card on the feature card (thumbnail + cart). */
  mini: {
    image: string;
    title: string;
    description: string;
  };
  /** Small floating "pill" callouts that flank the hero. */
  pills: {
    /** Top-leading callout (e.g. "Limited edition"). */
    leading: string;
    /** Top-trailing callout (e.g. "Fast shipping"). */
    trailing: string;
  };
  /** A single chat bubble overlaid on the left product card. */
  chatPrompt: string;
  /** Reward-progress card copy (separate card under the feature card). */
  reward: {
    label: string;
    /** Completed steps for the "x/total" label. */
    value: number;
    /** Total steps. */
    total: number;
    /** Member name shown beside the avatar. */
    member: string;
  };
}

/**
 * Three colors for the hero's blurred "aurora" background blobs (left, center,
 * right). Each is a categorical background token (e.g. --color-background-green)
 * so it resolves to the active theme's own soft pastel palette — and inherits
 * the token's light-dark() pair for dark mode for free.
 */
export interface HeroAuroraPalette {
  left: string;
  center: string;
  right: string;
}

export interface HeroThemeSlide {
  /** Theme package name, e.g. '@xds/theme-matcha'. */
  name: string;
  /** Human-readable label, e.g. 'Matcha'. */
  label: string;
  /** Resolved theme object passed to <XDSTheme>. */
  theme: XDSDefinedTheme;
  /** Per-theme content for the floating cards. */
  content: HeroThemeContent;
  /** Soft pastel palette feeding the blurred aurora background blobs. */
  aurora: HeroAuroraPalette;
  /**
   * CSS color the wordmark paints in for this theme. The wordmark always sits
   * on the Astryx page background (a warm cream in light mode), so it needs a
   * color that reads against *that* surface — which is the theme's accent for
   * most themes, but NOT for dark-only themes whose accent is a pale on-dark
   * tone (e.g. Gothic). Such themes override this with a dark brand ink.
   */
  wordmarkColor: string;
}

// The curated reel — exactly these themes, in this order. Astryx leads (the
// docsite's own brand), then a spread from restrained (Neutral) to expressive
// (Y2K). To add/remove a theme from the hero, edit this list only.
const REEL_THEMES: ReadonlyArray<string> = [
  ASTRYX,
  '@xds/theme-neutral',
  '@xds/theme-butter',
  '@xds/theme-matcha',
  '@xds/theme-y2k',
];

// Per-theme card content. Keyed by theme name (package name, or the ASTRYX
// sentinel). Imagery uses clean product-on-color photos so each slide reads as
// a real little storefront; copy + product mix is tuned to each theme's mood.
const CONTENT_BY_THEME: Record<string, HeroThemeContent> = {
  [ASTRYX]: {
    product: {
      image: '/neutral/preview-headphones.png',
      title: 'Studio headphones',
      description: 'Quiet, considered sound for deep focus.',
      price: '$180',
    },
    feature: {
      image: '/template-assets/light-product-1.png',
      title: 'Ceramic mug',
      price: '$32',
    },
    mini: {
      image: '/template-assets/light-product-1.png',
      title: 'Speckled mug',
      description: 'Hand-thrown stoneware.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help you today?',
    reward: {
      label: 'Setup progress',
      value: 7,
      total: 8,
      member: 'Astryx team',
    },
  },
  '@xds/theme-neutral': {
    product: {
      image: '/neutral/preview-watch.png',
      title: 'Minimalist watch',
      description: 'Clean design, everyday durability.',
      price: '$240',
    },
    feature: {
      image: '/neutral/preview-headphones.png',
      title: 'Wireless headphones',
      price: '$180',
    },
    mini: {
      image: '/neutral/preview-backpack.png',
      title: 'Canvas backpack',
      description: 'Water-resistant.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help you today?',
    reward: {
      label: 'Member rewards',
      value: 6,
      total: 10,
      member: 'Alex Rivera',
    },
  },
  '@xds/theme-butter': {
    product: {
      image: '/template-assets/light-product-1.png',
      title: 'Speckled mug',
      description: 'Warm stoneware for slow mornings.',
      price: '$32',
    },
    feature: {
      image: '/theme-butter-preview.png',
      title: 'Buttermilk waffles',
      price: '$14',
    },
    mini: {
      image: '/theme-butter-preview.png',
      title: 'Maple waffles',
      description: 'Served warm.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help you today?',
    reward: {label: 'Loyalty perks', value: 5, total: 9, member: 'Noa Bright'},
  },
  '@xds/theme-matcha': {
    product: {
      image: '/template-assets/matcha-product-1.png',
      title: 'Sweet vanilla matcha',
      description: 'Vanilla matcha with whole milk or oat milk.',
      price: '$6',
    },
    feature: {
      image: '/template-assets/matcha-product-4.png',
      title: 'Ube matcha',
      price: '$7',
    },
    mini: {
      image: '/template-assets/matcha-product-4.png',
      title: 'Ube matcha',
      description: 'Ube and cream matcha.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help you today?',
    reward: {
      label: 'Reward progress',
      value: 7,
      total: 8,
      member: 'Lottie Wang',
    },
  },
  '@xds/theme-y2k': {
    product: {
      image: '/template-assets/colorful-product-2.png',
      title: 'Bubbly charm',
      description: 'A glossy little throwback keepsake.',
      price: '$18',
    },
    feature: {
      image: '/template-assets/colorful-product-1.png',
      title: 'Puppy keychain',
      price: '$12',
    },
    mini: {
      image: '/template-assets/colorful-product-1.png',
      title: 'Puppy keychain',
      description: 'Plush + chrome ring.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help you today?',
    reward: {label: 'Sparkle points', value: 6, total: 8, member: 'Bella Cruz'},
  },
};

// Fallback content for any theme that ships without a bespoke entry above —
// keeps the hero from breaking if a new theme package lands. Uses the theme's
// conventional preview image path so the visual still matches.
function fallbackContent(name: string): HeroThemeContent {
  const slug = name.replace('@xds/theme-', '');
  const image = `/theme-${slug}-preview.png`;
  return {
    product: {
      image,
      title: 'Featured product',
      description: 'A polished surface, styled by this theme.',
      price: '$40',
    },
    feature: {image, title: 'Featured product', price: '$40'},
    mini: {image, title: 'Featured', description: 'In stock now.'},
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help you today?',
    reward: {label: 'Member rewards', value: 6, total: 10, member: 'Sam Lee'},
  };
}

// Explicit, properly-cased labels for the reel. Some package displayNames are
// lowercased (e.g. "matcha"), so we don't rely on them for the user-facing dot
// labels — this map is the source of truth.
const LABEL_BY_THEME: Record<string, string> = {
  [ASTRYX]: 'Astryx',
  '@xds/theme-neutral': 'Neutral',
  '@xds/theme-butter': 'Butter',
  '@xds/theme-matcha': 'Matcha',
  '@xds/theme-y2k': 'Y2K',
};

function labelFor(name: string): string {
  if (LABEL_BY_THEME[name]) {
    return LABEL_BY_THEME[name];
  }
  const pkg = packages.find(p => p.name === name);
  const raw = pkg?.displayName ?? name.replace('@xds/theme-', '');
  return raw.replace(/^Theme:\s*/, '').replace(/\s*Theme$/, '');
}

// Resolve a reel entry's theme object. Astryx comes from the local brand theme;
// every other entry is an installed @xds/theme-* package in the generated
// registry. Returns null if a listed package isn't installed (so the reel
// silently skips it rather than crashing).
function themeFor(name: string): XDSDefinedTheme | null {
  if (name === ASTRYX) {
    return astryxTheme;
  }
  return themeObjects[name] ?? null;
}

// Default wordmark color: the theme's accent text token, which is a dark brand
// ink for every light-first theme and reads well on the cream page.
const DEFAULT_WORDMARK_COLOR = 'var(--color-text-accent)';

// Overrides for themes whose accent is a pale on-dark tone that would vanish on
// the light hero page. (None in the current reel, but kept as the extension
// point — e.g. a dark-only theme would map to a dark brand ink here.)
const WORDMARK_COLOR_BY_THEME: Record<string, string> = {};

// Per-theme aurora palettes. Each blob references a categorical background
// token so it resolves against the active theme's palette (and inherits its
// light-dark() pair). Chosen to feel on-brand: Astryx warm, Matcha sage/green,
// Y2K candy, Butter gold, Neutral cool. Mirrors the palette pairing used in the
// home-page-refresh PR's hero aurora.
const AURORA_BY_THEME: Record<string, HeroAuroraPalette> = {
  [ASTRYX]: {
    left: 'var(--color-background-yellow)',
    center: 'var(--color-background-yellow)',
    right: 'var(--color-background-pink)',
  },
  '@xds/theme-neutral': {
    left: 'var(--color-background-blue)',
    center: 'var(--color-background-gray)',
    right: 'var(--color-background-cyan)',
  },
  '@xds/theme-butter': {
    left: 'var(--color-background-yellow)',
    center: 'var(--color-background-yellow)',
    right: 'var(--color-background-orange)',
  },
  '@xds/theme-matcha': {
    left: 'var(--color-background-green)',
    center: 'var(--color-background-cyan)',
    right: 'var(--color-background-yellow)',
  },
  '@xds/theme-y2k': {
    left: 'var(--color-background-pink)',
    center: 'var(--color-background-purple)',
    right: 'var(--color-background-blue)',
  },
};

// Fallback aurora for any theme without a bespoke palette above.
const DEFAULT_AURORA: HeroAuroraPalette = {
  left: 'var(--color-background-blue)',
  center: 'var(--color-background-purple)',
  right: 'var(--color-background-pink)',
};

/**
 * Ordered list of hero slides — exactly the themes in REEL_THEMES, in order.
 * Any entry whose theme can't be resolved (e.g. a package that isn't installed)
 * is skipped so the reel stays robust.
 */
export const HERO_THEME_SLIDES: ReadonlyArray<HeroThemeSlide> = REEL_THEMES.map(
  name => {
    const theme = themeFor(name);
    return theme
      ? {
          name,
          label: labelFor(name),
          theme,
          content: CONTENT_BY_THEME[name] ?? fallbackContent(name),
          aurora: AURORA_BY_THEME[name] ?? DEFAULT_AURORA,
          wordmarkColor:
            WORDMARK_COLOR_BY_THEME[name] ?? DEFAULT_WORDMARK_COLOR,
        }
      : null;
  },
).filter((s): s is HeroThemeSlide => s !== null);
