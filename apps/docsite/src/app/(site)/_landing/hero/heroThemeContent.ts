// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file heroThemeContent.ts
 * @input the docsite theme package registry (generated) + the local Astryx theme
 * @output an ordered list of {theme, label, content} slides the hero cycles
 * @position Home hero — single source of truth for the theming showcase reel.
 *
 * Per-theme content (copy + product photos) for the reel's cards, plus the
 * curated theme list/order (REEL_THEMES) and per-theme aurora/wordmark/mode.
 */

import type {XDSDefinedTheme} from '@xds/core/theme';
import {packages} from '../../../../generated/packageRegistry';
import {themeObjects} from '../../../../generated/themeRegistry';
import {astryxTheme, BRAND_BLUE} from '../../../../themes/astryxTheme';

// Sentinel for the docsite's local brand theme (not an @xds/theme-* package).
const ASTRYX = 'astryx';

export interface HeroThemeContent {
  /** Product card (image + title/description + price). */
  product: {
    image: string;
    title: string;
    description: string;
    price: string;
  };
  /** Feature/reward card image + title/price. */
  feature: {
    image: string;
    title: string;
    price: string;
  };
  /** The buy card (thumbnail + title/description + cart). */
  mini: {
    image: string;
    title: string;
    description: string;
  };
  /** Floating pill callouts (leading badge, trailing radio). */
  pills: {
    leading: string;
    trailing: string;
  };
  /** Chat composer placeholder. */
  chatPrompt: string;
  /** Reward-progress card copy. */
  reward: {
    label: string;
    value: number;
    total: number;
    member: string;
  };
}

/** The three aurora blob colors (left, center, right). */
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
  /** CSS color the wordmark paints in (must read on the slide's hero fill). */
  wordmarkColor: string;
  /**
   * Dark-first theme. On dark slides the hero text/links/nav switch to light,
   * and the theme renders in dark mode (fill, cards, blobs use its dark palette).
   */
  isDark: boolean;
  /** Color mode the slide's theme renders in. Dark-first themes use 'dark'. */
  mode: 'light' | 'dark';
}

// The curated reel — these themes, in this order. Edit here to add/remove.
const REEL_THEMES: ReadonlyArray<string> = [
  ASTRYX,
  '@xds/theme-neutral',
  '@xds/theme-butter',
  '@xds/theme-matcha',
  '@xds/theme-gothic',
  '@xds/theme-y2k',
];

// Per-theme card content, keyed by theme name (or the ASTRYX sentinel).
const CONTENT_BY_THEME: Record<string, HeroThemeContent> = {
  [ASTRYX]: {
    product: {
      image: '/neutral/preview-headphones.png',
      title: 'Studio headphones',
      description: 'Quiet, considered sound for deep focus.',
      price: '$180',
    },
    feature: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/light-product-1.png',
      title: 'Ceramic mug',
      price: '$32',
    },
    mini: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/light-product-1.png',
      title: 'Speckled mug',
      description: 'Hand-thrown stoneware.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help?',
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
    chatPrompt: 'How can I help?',
    reward: {
      label: 'Member rewards',
      value: 6,
      total: 10,
      member: 'Alex Rivera',
    },
  },
  '@xds/theme-butter': {
    product: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/light-product-1.png',
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
    chatPrompt: 'How can I help?',
    reward: {label: 'Loyalty perks', value: 5, total: 9, member: 'Noa Bright'},
  },
  '@xds/theme-matcha': {
    product: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/matcha-product-1.png',
      title: 'Sweet vanilla matcha',
      description: 'Vanilla matcha with whole milk or oat milk.',
      price: '$6',
    },
    feature: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/matcha-product-4.png',
      title: 'Ube matcha',
      price: '$7',
    },
    mini: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/matcha-product-4.png',
      title: 'Ube matcha',
      description: 'Ube and cream matcha.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help?',
    reward: {
      label: 'Reward progress',
      value: 7,
      total: 8,
      member: 'Lottie Wang',
    },
  },
  '@xds/theme-gothic': {
    product: {
      image: '/theme-gothic-preview.png',
      title: 'Onyx pendant',
      description: 'Blackened silver with a matte finish.',
      price: '$96',
    },
    feature: {
      image: '/theme-gothic-preview.png',
      title: 'Midnight cuff',
      price: '$120',
    },
    mini: {
      image: '/theme-gothic-preview.png',
      title: 'Raven ring',
      description: 'Hand-forged band.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help?',
    reward: {label: 'Member rewards', value: 7, total: 8, member: 'Mara Vale'},
  },
  '@xds/theme-y2k': {
    product: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/colorful-product-2.png',
      title: 'Bubbly charm',
      description: 'A glossy little throwback keepsake.',
      price: '$18',
    },
    feature: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/colorful-product-1.png',
      title: 'Puppy keychain',
      price: '$12',
    },
    mini: {
      image:
        'https://lookaside.facebook.com/assets/xds_oss/colorful-product-1.png',
      title: 'Puppy keychain',
      description: 'Plush + chrome ring.',
    },
    pills: {leading: 'Limited time', trailing: 'Free shipping'},
    chatPrompt: 'How can I help?',
    reward: {label: 'Sparkle points', value: 6, total: 8, member: 'Bella Cruz'},
  },
};

// Fallback content for any theme without a bespoke entry (uses its preview img).
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
    chatPrompt: 'How can I help?',
    reward: {label: 'Member rewards', value: 6, total: 10, member: 'Sam Lee'},
  };
}

// Properly-cased dot labels (package displayNames are sometimes lowercased).
const LABEL_BY_THEME: Record<string, string> = {
  [ASTRYX]: 'Astryx',
  '@xds/theme-neutral': 'Neutral',
  '@xds/theme-butter': 'Butter',
  '@xds/theme-matcha': 'Matcha',
  '@xds/theme-gothic': 'Gothic',
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

// Resolve a slide's theme object (Astryx is local; others from the registry).
// Returns null for an uninstalled package so the reel skips it.
function themeFor(name: string): XDSDefinedTheme | null {
  if (name === ASTRYX) {
    return astryxTheme;
  }
  return themeObjects[name] ?? null;
}

// Wordmark color — by default the theme's accent text token. Each theme's
// --color-text-accent is already mode-correct (a dark ink on light themes,
// a light ink on dark-only themes like Gothic where accent === #E8F1F6).
const WORDMARK_COLOR = 'var(--color-text-accent)';

// Per-theme wordmark overrides. Astryx is special: its theme repoints every
// accent token to the warm primary ink (the brand blue is reserved for the
// logo), so --color-text-accent is now near-black. The wordmark therefore
// uses the brand blue directly so the Astryx logo stays blue while the rest of
// the slide's UI reads as primary. Other themes fall back to WORDMARK_COLOR.
const WORDMARK_COLOR_BY_THEME: Record<string, string> = {
  [ASTRYX]: BRAND_BLUE,
};

function wordmarkColorFor(name: string): string {
  return WORDMARK_COLOR_BY_THEME[name] ?? WORDMARK_COLOR;
}

// Dark-first themes (rendered in dark mode; hero text/nav go light).
const DARK_THEMES: ReadonlySet<string> = new Set<string>(['@xds/theme-gothic']);

// Per-theme aurora blob palettes (categorical background tokens, on-brand hues).
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
  // Gothic (dark mode): use saturated --color-border-* tokens so the blobs glow
  // instead of washing out white (the 20%-alpha background tints would).
  '@xds/theme-gothic': {
    left: 'var(--color-border-purple)',
    center: 'var(--color-border-blue)',
    right: 'var(--color-border-teal)',
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

// Ordered slides from REEL_THEMES; unresolved (uninstalled) themes are skipped.
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
          wordmarkColor: wordmarkColorFor(name),
          isDark: DARK_THEMES.has(name),
          mode: DARK_THEMES.has(name) ? 'dark' : 'light',
        }
      : null;
  },
).filter((s): s is HeroThemeSlide => s !== null);
