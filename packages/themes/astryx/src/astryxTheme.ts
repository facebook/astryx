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
  },
});
