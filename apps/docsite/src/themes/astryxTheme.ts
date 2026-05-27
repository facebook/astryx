// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Astryx Theme
 *
 * Minimal — only two brand decisions:
 *   1. Accent color: #292724 (warm near-black)
 *   2. Typography: Figtree
 *
 * Everything else (surfaces, text, borders, status, radius, motion) is
 * inherited from the default XDS theme behavior so the design system
 * stays the source of truth and Astryx is a thin brand layer on top.
 */

import {defineTheme} from '@xds/core/theme';

export const astryxTheme = defineTheme({
  name: 'astryx',

  // Set the accent token directly instead of using the `color: { accent }`
  // scale config — the scale runs HCT derivation across the whole palette
  // and bleeds the accent's hue into neutrals (which made all the "gray"
  // surfaces come out brown). Setting --color-accent directly leaves every
  // other token at the XDS default.
  tokens: {
    '--color-accent': '#292724',
    '--color-background-body': '#F8F4ED',
    // Astryx display headings render semibold (XDS default is normal weight).
    '--text-display-1-weight': 'var(--font-weight-semibold)',
    '--text-display-2-weight': 'var(--font-weight-semibold)',
    '--text-display-3-weight': 'var(--font-weight-semibold)',
    // Bump each radius scale step by +4px for slightly softer corners across
    // the whole UI (inputs, cards, panels, page containers). --radius-none
    // and --radius-full stay fixed.
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',
  },

  typography: {
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

  components: {
    // Fully-rounded (pill) buttons across all variants and sizes.
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
    },
    // TopNav items: remove the "pill" background on the selected state and
    // rely on weight + primary text color for emphasis. Hover/active still
    // get the neutral overlay from the base styles.
    'top-nav-item': {
      selected: {
        backgroundColor: 'transparent',
        ':hover': {
          backgroundColor: 'var(--color-overlay-hover)',
        },
        ':active': {
          backgroundColor: 'var(--color-overlay-pressed)',
        },
      },
    },
  },
});
