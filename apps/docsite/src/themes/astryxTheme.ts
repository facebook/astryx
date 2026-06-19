// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Astryx Theme
 *
 * The Astryx brand uses its blue ONLY for the logo/wordmark. Everything else
 * in the UI — buttons, links, focus rings, the Switch "on" track, accent
 * icons, and tints — is driven by the high-emphasis PRIMARY ink (warm
 * near-black). So the theme makes the accent tokens resolve to PRIMARY, and
 * the brand blue lives in the `BRAND_BLUE` constant in `@/constants`, reserved
 * for the logo (applied by the hero, not by any semantic token here).
 *
 *   1. PRIMARY    — the high-emphasis foreground ink (warm near-black). Drives
 *      primary text/icons AND the accent tokens, so all interactive UI reads
 *      as near-black rather than blue. See `PRIMARY` below.
 *   2. BRAND_BLUE — the Astryx brand blue, reserved for the logo only. Not
 *      wired to any semantic accent token; the hero paints the wordmark with
 *      it directly. Defined in `@/constants`.
 *
 * The only other overrides are the cream body color, Figtree typography, a
 * +4px radius bump, semibold display headings, and pill buttons. The neutral
 * gray ramp (surfaces, borders, secondary/disabled text, skeleton/track,
 * categorical gray) is intentionally left at the XDS defaults — Astryx is a
 * thin brand layer of primary + accent + body on top of the design system.
 */

import {defineTheme} from '@xds/core/theme';

// === PRIMARY (high-emphasis foreground ink — drives accent too) ==============
// Warm near-black that harmonizes with the cream body (light) and a warm
// off-white (dark). This is the primary text/icon color, and it ALSO drives
// the accent tokens (see below) so buttons/links/focus read as near-black.
const PRIMARY = 'light-dark(#15110C, #DFE2E5)';

// A warm near-black tint for the accent-muted surface (subtle hover/selected
// backgrounds). Mirrors PRIMARY's hue so muted accent fills match the primary-
// driven UI instead of staying blue. Dark mode uses a light warm tint.
const PRIMARY_MUTED =
  'light-dark(rgba(21, 17, 12, 0.08), rgba(223, 226, 229, 0.14))';

// BRAND_BLUE (logo/wordmark only) lives in `@/constants` — kept out of this
// source theme so consumers can read it without importing the unbuilt theme
// object (which would re-trigger runtime style injection).

export const astryxTheme = defineTheme({
  name: 'astryx',

  // Set the accent token directly instead of using the `color: { accent }`
  // scale config — the scale runs HCT derivation across the whole palette
  // and bleeds the accent's hue into neutrals (which made all the "gray"
  // surfaces come out brown). Setting --color-accent directly leaves every
  // other token at the XDS default.
  tokens: {
    // --- ACCENT tokens → PRIMARY ---
    // The brand blue is reserved for the logo, so every accent token resolves
    // to the warm PRIMARY ink instead. This makes all interactive UI (buttons,
    // links, focus rings, the Switch "on" track, accent icons, tints) read as
    // near-black rather than blue. The on-accent ink is set below so the
    // contrast holds in both modes (the accent flips light↔dark with PRIMARY).
    '--color-accent': PRIMARY,
    '--color-text-accent': PRIMARY,
    '--color-icon-accent': PRIMARY,
    '--color-accent-muted': PRIMARY_MUTED,
    // On-accent (the label/icon ON a filled accent surface, e.g. primary
    // button text) must invert with the accent: PRIMARY is near-black in light
    // and near-white in dark, so the on-accent ink is white in light and
    // near-black in dark. Without this it stays the XDS default white and
    // becomes unreadable on the light dark-mode accent fill.
    '--color-on-accent': 'light-dark(#FFFFFF, #15110C)',
    // Mode-aware so the page background flips with dark mode. Light keeps the
    // warm Astryx cream; dark falls back to the XDS default body color
    // (a flat static value here would freeze the page in light mode).
    '--color-background-body': 'light-dark(#F8F4ED, #111112)',

    // --- PRIMARY (high-emphasis foreground ink) ---
    // Both primary foreground tokens point at the single PRIMARY decision
    // above (which also drives the accent tokens). Secondary, disabled, and the
    // rest of the neutral gray ramp (surfaces, borders, skeleton/track,
    // categorical gray) are intentionally left at the XDS defaults — only the
    // primary ink is a brand decision.
    '--color-text-primary': PRIMARY,
    '--color-icon-primary': PRIMARY,

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
