// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Astryx Theme
 *
 * Warm minimal — cream backgrounds, warm near-black text, and a single
 * muted tan accent. Expressed as a canonical defineTheme() call: the
 * `color` scale handles accent/background/surface/border/text derivation,
 * and explicit `tokens` only override the handful of palette anchors
 * (cream body, near-black ink) and warm-leaning status colors.
 *
 * Source palette:
 *   Light: cream body #F7F2EA · raised #FFFFFF · ink #1F1B17 ·
 *          border #E5DDCD · accent #7A5A3B (muted tan) ·
 *          success #5C7A4F · warning #B58A3E · danger #9E4A3D
 *   Dark:  body #1E1A15 · raised #2A251E · text #F2EBDC ·
 *          accent #C8A37A (lifted warm tan)
 *
 * Figtree is the single typeface — loaded by the consumer (the docsite
 * exposes it via next/font/google with --font-figtree, and the wiki's
 * "Best" path of a <head> <link> is also in place as a safety net).
 */

import {defineTheme} from '@xds/core/theme';

export const astryxTheme = defineTheme({
  name: 'astryx',

  // Warm muted tan — derives accent + accent-muted + on-accent + text-accent
  // tokens via the HCT model. neutralStyle: 'warm' bleeds the tan hue into
  // neutrals/backgrounds so derived surfaces stay in-family with the
  // cream palette. The explicit `tokens` block below pins the visible
  // anchors (cream surfaces, near-black ink) on top of those derivatives.
  color: {
    accent: '#7A5A3B',
    neutralStyle: 'warm',
    contrast: 'standard',
  },

  // Figtree across body + heading. The `family` slot uses a CSS
  // variable so consumers wiring next/font (variable: '--font-figtree')
  // get the self-hosted, FOUC-free binary; if --font-figtree isn't
  // set, the var() fallback names plain "Figtree" — picked up by the
  // shared Google Fonts <link>. The fallbacks chain ends in the
  // system sans stack so the page renders cleanly even with no font.
  //
  // Note: defineTheme's buildFontFamily() quotes `family` when it
  // contains a space, so the var() expression is written without an
  // inner space (var(--font-figtree,Figtree), not var(--font-figtree, Figtree)).
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'var(--font-figtree,Figtree)',
      fallbacks:
        '"Figtree Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'var(--font-figtree,Figtree)',
      fallbacks:
        '"Figtree Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
  },

  // Slightly soft radii — quiet rounding without losing the minimal edge.
  // base=4 + multiplier=1 matches XDS defaults (the warm minimal aesthetic
  // is conveyed by color, not geometry).
  radius: {base: 4, multiplier: 1},

  // Match the default theme's motion (#674 proposal) — calm, not snappy.
  motion: {fast: 175, medium: 410, slow: 975, ratio: 0.75},

  // Explicit overrides. The color scale gives us most of the palette;
  // these pin the visible anchors and add the warm-leaning status hues
  // (success olive, warning amber, danger muted brick) so the whole
  // theme reads warm and cohesive.
  tokens: {
    // --- Anchored surface + ink (override scale-generated values) ---
    '--color-background-body': ['#F7F2EA', '#1E1A15'],
    '--color-background-surface': ['#FFFFFF', '#2A251E'],
    '--color-background-card': ['#FFFFFF', '#2A251E'],
    '--color-background-popover': ['#FFFFFF', '#2A251E'],
    '--color-background-muted': ['#EFE9DC', '#2F2A22'],
    '--color-text-primary': ['#1F1B17', '#F2EBDC'],
    '--color-text-secondary': ['#5A544B', '#A8A091'],
    '--color-text-disabled': ['#A39C8E', '#6B6358'],
    '--color-icon-primary': ['#1F1B17', '#F2EBDC'],
    '--color-icon-secondary': ['#5A544B', '#A8A091'],
    '--color-icon-disabled': ['#A39C8E', '#6B6358'],
    '--color-border': ['#E5DDCD', '#3A332A'],
    '--color-border-emphasized': ['#B7AC95', '#6B6358'],
    '--color-skeleton': ['#E5DDCD', '#3A332A'],

    // --- on-* must be absolute (never light-dark) per wiki §On-Media ---
    '--color-on-dark': '#F7F2EA',
    '--color-on-light': '#1F1B17',

    // --- Warm-leaning status colors (kept in palette family) ---
    '--color-success': ['#5C7A4F', '#A6C396'],
    '--color-success-muted': ['#5C7A4F1F', '#A6C39624'],
    '--color-warning': ['#B58A3E', '#D9B97A'],
    '--color-warning-muted': ['#B58A3E1F', '#D9B97A24'],
    '--color-error': ['#9E4A3D', '#D49E92'],
    '--color-error-muted': ['#9E4A3D1F', '#D49E9224'],
  },

  components: {
    // Secondary buttons read as a quiet outline on cream so the warm tan
    // accent stays the only saturated element on the page.
    button: {
      'variant:secondary': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border-emphasized)',
        ':hover': {
          backgroundColor: 'var(--color-neutral)',
        },
      },
    },
  },
});
