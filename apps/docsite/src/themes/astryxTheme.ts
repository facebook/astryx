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
 *
 * In addition to the standard XDS token overrides, this theme defines
 * a small set of marketing-only `--xds-marketing-*` custom tokens used
 * exclusively by the docsite home page (hero aurora carousel + feature
 * card backdrops). Capturing these palettes at the theme layer keeps
 * the page components free of literal hex colors and gives each token
 * a single, named source of truth — change a palette here and the
 * marketing surface updates without touching component code.
 */

import {defineTheme} from '@xds/core/theme';

// Marketing-only custom tokens. These are NOT part of the semantic XDS
// token system — they exist solely to back the docsite home page's
// hero aurora gradient + bento feature cards. They live in the theme
// (rather than as inline literals) so the entire marketing palette can
// be retuned in one place and so dark mode is handled by the token's
// own `light-dark()` value rather than by every consumer.
//
// All values stay as raw hex literals because Astryx's cream body bg
// (#F8F4ED) is so close to most pastel semantic tokens that they wash
// out completely — the saturated pastel choices below are tuned by
// hand against the cream body and don't map onto any semantic ramp.
//
// Keyed with the `--xds-marketing-*` prefix so they're trivially
// greppable and never collide with the standard XDS token namespace
// (`--color-*`, `--spacing-*`, etc.).
//
// Typed as Record<string, string> here so they pass through
// defineTheme's strict `Partial<Record<XDSTokenName, ...>>` shape via
// the cast at the call site below — defineTheme's runtime accepts any
// string-keyed token and emits it verbatim as a CSS custom property.
const marketingTokens: Record<string, string> = {
  // Feature card backdrop. Soft pastel blue in light mode, deep
  // navy in dark mode. Used by FeaturesShowcase's four bento cards
  // as `backgroundColor: var(--xds-marketing-feature-card-bg)`.
  // Picked specifically because Astryx's stock --color-background-blue
  // is a 20%-alpha saturated wash that would render too vivid against
  // the showcase's white surface; this token gives the cards a soft
  // pastel band the eye reads as a single related group.
  '--xds-marketing-feature-card-bg': 'light-dark(#E6F0FF, #1A2333)',

  // Marketing-section vertical rhythm. The XDS spacing scale tops
  // out at --spacing-12 = 48px, which is fine for in-app density
  // but too tight for a landing-page section break. Use this token
  // for the gap between major home-page sections (hero ↔ features
  // ↔ about ↔ discover) and for the page's first paddingBlockStart
  // so the rhythm reads as deliberate marketing pacing rather than
  // a maxed-out spacing step.
  '--xds-marketing-section-gap': '100px',
};

export const astryxTheme = defineTheme({
  name: 'astryx',

  // Set the accent token directly instead of using the `color: { accent }`
  // scale config — the scale runs HCT derivation across the whole palette
  // and bleeds the accent's hue into neutrals (which made all the "gray"
  // surfaces come out brown). Setting --color-accent directly leaves every
  // other token at the XDS default.
  //
  // Cast to relax `Partial<Record<XDSTokenName, ...>>` so the
  // marketing custom tokens above (which intentionally sit outside
  // the XDS semantic namespace) typecheck without per-key cast noise.
  // defineTheme's runtime accepts any string-keyed token and emits
  // it verbatim as a CSS custom property declaration.
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
    ...marketingTokens,
  } as Parameters<typeof defineTheme>[0]['tokens'],

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
