// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docsiteTheme.ts
 * @position Colocated copy of the docsite's Astryx brand theme so the Lab →
 *   Core graduation page renders with the same look as facebook.github.io/astryx
 *   (Figtree type, cream body, near-black accent ink, pill buttons, +4px radii).
 *
 * This mirrors apps/docsite/src/themes/astryxTheme.ts. The docsite theme is not
 * published as a package, so it is duplicated here rather than imported across
 * the app boundary. BRAND_BLUE is inlined (docsite reads it from a local
 * constants module reserved for the logo/wordmark only).
 */

import {defineTheme, type TokenValue} from '@astryxdesign/core/theme';

// Reserved for the logo/wordmark only — not wired to any semantic token.
const BRAND_BLUE = 'light-dark(#225BFF, #3D87FF)';

// High-emphasis foreground ink (warm near-black). Drives primary text/icons
// AND the accent tokens, so interactive UI reads as near-black, not blue.
const PRIMARY = 'light-dark(#15110C, #DFE2E5)';
const PRIMARY_MUTED =
  'light-dark(rgba(21, 17, 12, 0.08), rgba(223, 226, 229, 0.14))';

const customTokens: Record<string, TokenValue> = {
  '--color-brand': BRAND_BLUE,
};

export const docsiteTheme = defineTheme({
  name: 'astryx-docsite',
  tokens: {
    '--color-accent': PRIMARY,
    '--color-text-accent': PRIMARY,
    '--color-icon-accent': PRIMARY,
    '--color-accent-muted': PRIMARY_MUTED,
    '--color-on-accent': 'light-dark(#FFFFFF, #15110C)',
    '--color-background-body': 'light-dark(#F8F4ED, #111112)',
    '--color-text-primary': PRIMARY,
    '--color-icon-primary': PRIMARY,
    '--text-display-1-weight': 'var(--font-weight-semibold)',
    '--text-display-2-weight': 'var(--font-weight-semibold)',
    '--text-display-3-weight': 'var(--font-weight-semibold)',
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',
    ...customTokens,
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
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
    },
  },
});
