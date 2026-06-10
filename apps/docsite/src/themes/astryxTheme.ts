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
    // light-dark() so primary buttons / accent surfaces invert in
    // dark mode — near-black warm in light, warm cream in dark, so
    // the brand pill stays legible against the body background in
    // both modes.
    '--color-accent': 'light-dark(#292724, #E8E3DA)',
    // Text on the accent surface flips with it: white-on-dark in
    // light mode, dark-on-cream in dark mode.
    '--color-on-accent': 'light-dark(#FFFFFF, #292724)',
    // Setting --color-accent alone leaves the *derived* accent tokens
    // (text/icon/muted) at the XDS default blue, so links and accent icons
    // across the docsite stayed blue. Point them at the brand accent too.
    '--color-text-accent': 'light-dark(#292724, #E8E3DA)',
    '--color-icon-accent': 'light-dark(#292724, #E8E3DA)',
    '--color-accent-muted':
      'light-dark(rgba(41, 39, 36, 0.12), rgba(232, 227, 218, 0.16))',
    // Mode-aware so the page background flips with dark mode. Light keeps the
    // warm Astryx cream; dark falls back to the XDS default body color
    // (a flat static value here would freeze the page in light mode).
    '--color-background-body': 'light-dark(#F8F4ED, #111112)',
    // Re-tint the categorical "gray" surface to match the page body
    // background. Cards rendered with `variant="gray"` (e.g. landing
    // feature cards) blend into the body, reading as content groups
    // shaped by padding + corners rather than as a coloured surface.
    // Dark mode keeps the default --color-background-gray tint so
    // recessed surfaces stay readable against the dark body.
    '--color-background-gray': 'light-dark(#F8F4ED, rgba(102, 106, 114, 0.30))',
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
