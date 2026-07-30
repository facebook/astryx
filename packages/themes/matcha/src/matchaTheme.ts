// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Matcha Theme
 *
 * An earthy green theme inspired by matcha tea and natural botanicals.
 * Core palette: #3E481D, #707E46, #C0CBA9, #F0F0E0, #FFFFFF
 * Uses Playwrite US Trad for headings and DM Sans for body text.
 *
 * Contrast promises (WCAG 2.1 AA, audited by internal/theme-contrast):
 * text tokens hold >=4.5:1 and icon tokens >=3:1 on every surface they are
 * laid out on, in both modes. #707E46 remains the palette's sage for icons
 * and borders, but text roles ship its darker text stop #5c6739 (>=4.8:1 on
 * the deepest neutral wash). Filled status chips keep white labels in light
 * mode (fills darkened to >=4.8:1) and flip to deep olive ink #1c2210 on
 * the bright dark-mode fills — the same dark-on-bright approach on-warning
 * has always used.
 */

import {defineTheme, defineSyntaxTheme} from '@astryxdesign/core/theme';
import {matchaIconRegistry} from './icons';

/**
 * Matcha syntax palette — earthy greens and warm tones.
 * Code is text: every stop holds >=4.5:1 on the code background in both
 * modes; the dimmest stops (comment/operator/punctuation) sit just past
 * 4.5:1 (~4.7) so they still read dimmer than the primary stops.
 */
const matchaSyntax = defineSyntaxTheme({
  name: 'xds-matcha',
  tokens: {
    keyword: ['#5a6b2a', '#a8bf6a'],
    string: ['#2e6b4a', '#7bc49e'],
    comment: ['#636f3e', '#7d8d4e'],
    number: ['#82632c', '#d4b870'],
    function: ['#3a5e8c', '#7ba8d4'],
    type: ['#6b4a8c', '#b08ed4'],
    variable: ['#3E481D', '#C0CBA9'],
    operator: ['#636f3e', '#94a468'],
    constant: ['#82632c', '#d4b870'],
    tag: ['#8c3a3a', '#d47a7a'],
    attribute: ['#7c5e3a', '#c4a882'],
    property: ['#367364', '#70c4b0'],
    punctuation: ['#636f3e', '#7e8c59'],
    background: ['#F0F0E0', '#1a1c14'],
  },
});

export const matchaTheme = defineTheme({
  name: 'matcha',

  typography: {
    // base 16 / ratio 1.25 — aligned with the other themes' geometric scale.
    scale: {base: 16, ratio: 1.25},
    body: {
      family: 'DM Sans',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Playwrite US Trad',
      fallbacks: 'Georgia, "Times New Roman", Times, serif',
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: matchaSyntax,

  tokens: {
    // =========================================================================
    // Colors — earthy matcha palette
    // Core: #3E481D, #707E46, #C0CBA9, #F0F0E0, #FFFFFF
    // =========================================================================

    // Core semantic
    '--color-accent': ['#3E481D', '#C0CBA9'],
    '--color-accent-muted': ['#3E481D14', '#C0CBA920'],
    '--color-neutral': ['#3E481D0F', '#C0CBA91A'],
    '--color-background-surface': ['#FFFFFF', '#1a1c14'],
    '--color-background-body': ['#F0F0E0', '#12140e'],
    '--color-overlay': ['#3E481D80', '#3E481DCC'],
    '--color-overlay-hover': ['#3E481D0D', '#C0CBA90D'],
    '--color-overlay-pressed': ['#3E481D1A', '#C0CBA91A'],
    '--color-background-muted': ['#F0F0E0', '#2a3113'], // dark follows popover (zebra rows, Code, muted cards)

    // Text
    // Secondary is the sage's text stop: #707E46 misses AA on the washes
    // (4.41:1 on white, 3.49:1 on neutral-over-body), so text roles use
    // #5c6739 light / #abb889 dark (>=4.8:1 on their deepest wash).
    '--color-text-primary': ['#3E481D', '#C0CBA9'],
    '--color-text-secondary': ['#5c6739', '#abb889'],
    '--color-text-disabled': ['#C0CBA9', '#5a6440'],
    '--color-text-accent': ['#3E481D', '#C0CBA9'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#3E481D',
    // Dark-mode error/success fills stay bright, so their labels use deep
    // olive ink (5.4:1 / 7.1:1) — olive #3E481D only reads 3.2:1 there.
    '--color-on-accent': ['#FFFFFF', '#3E481D'],
    '--color-on-success': ['#FFFFFF', '#1c2210'],
    '--color-on-error': ['#FFFFFF', '#1c2210'],
    '--color-on-warning': ['#3E481D', '#3E481D'],

    // Icon
    '--color-icon-accent': ['#3E481D', '#C0CBA9'],
    '--color-icon-primary': ['#3E481D', '#C0CBA9'],
    '--color-icon-secondary': ['#5c6739', '#abb889'], // kept equal to text-secondary (paired icon+label rows stay one sage)
    '--color-icon-disabled': ['#C0CBA9', '#5a6440'],

    // Surface variants
    // Dark popover deepened from #3E481D so secondary text and the
    // accent-muted selection wash on it clear AA (primary 6.0:1 on the
    // selected wash; it was 4.45:1 on the old olive).
    '--color-background-card': ['#FFFFFF', '#1e2016'],
    '--color-background-popover': ['#FFFFFF', '#2a3113'],
    '--color-background-inverted': ['#3E481D', '#C0CBA9'],

    // Status / Sentiment
    // Light success/error double as 12px text and as filled chip bgs under
    // white labels, so both sit at 4.8:1 vs white (muted tints track them).
    '--color-success': ['#418100', '#6dbf2a'],
    '--color-success-muted': ['#41810020', '#6dbf2a20'],
    '--color-error': ['#e60000', '#ff5c5c'],
    '--color-error-muted': ['#e6000020', '#ff5c5c20'],
    '--color-warning': ['#FFB600', '#ffc940'],
    '--color-warning-muted': ['#FFB60020', '#ffc94020'],

    // Border
    // Softer sage borders (default + emphasized/card) in light mode.
    '--color-border': ['#DCE3CE', '#C0CBA91A'],
    '--color-border-emphasized': ['#B7C29E', '#5a6440'],

    // Effects
    '--color-skeleton': ['#C0CBA9', '#5a6440'],
    '--color-shadow': ['#3E481D1A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical — Blue
    '--color-background-blue': ['#3a5e8c33', '#3a5e8c33'],
    '--color-border-blue': ['#3a5e8c', '#7ba8d4'],
    '--color-icon-blue': ['#3a5e8c', '#7ba8d4'],
    '--color-text-blue': ['#2e4a6e', '#8dbce0'],

    // Categorical — Cyan
    '--color-background-cyan': ['#3a7c7c33', '#3a7c7c33'],
    '--color-border-cyan': ['#3a7c7c', '#70c4c4'],
    '--color-icon-cyan': ['#3a7c7c', '#70c4c4'],
    '--color-text-cyan': ['#2e6060', '#82d4d4'],

    // Categorical — Gray
    '--color-background-gray': ['#707E4633', '#5a644033'],
    '--color-border-gray': ['#707E46', '#707E46'],
    '--color-icon-gray': ['#707E46', '#94a468'],
    '--color-text-gray': ['#3E481D', '#C0CBA9'],

    // Categorical — Green
    '--color-background-green': ['#4D990033', '#6dbf2a33'],
    '--color-border-green': ['#4D9900', '#6dbf2a'],
    '--color-icon-green': ['#4D9900', '#6dbf2a'],
    '--color-text-green': ['#387000', '#80d43a'], // light darkened for 4.8:1 on its tint

    // Categorical — Orange
    '--color-background-orange': ['#c4762033', '#d4903a33'],
    '--color-border-orange': ['#c47620', '#d4903a'],
    '--color-icon-orange': ['#c47620', '#d4903a'],
    '--color-text-orange': ['#8e5515', '#e0a04a'], // light darkened for 4.8:1 on its tint

    // Categorical — Pink
    '--color-background-pink': ['#c44a7033', '#e07a9a33'],
    '--color-border-pink': ['#c44a70', '#e07a9a'],
    '--color-icon-pink': ['#c44a70', '#e07a9a'],
    '--color-text-pink': ['#a03a5a', '#f08aaa'],

    // Categorical — Purple
    '--color-background-purple': ['#6b4a8c33', '#b08ed433'],
    '--color-border-purple': ['#6b4a8c', '#b08ed4'],
    '--color-icon-purple': ['#6b4a8c', '#b08ed4'],
    '--color-text-purple': ['#553a70', '#c0a0e0'],

    // Categorical — Red
    '--color-background-red': ['#FD000033', '#ff5c5c33'],
    '--color-border-red': ['#FD0000', '#ff5c5c'],
    '--color-icon-red': ['#FD0000', '#ff5c5c'],
    '--color-text-red': ['#b90000', '#ff7a7a'], // light darkened for 4.8:1 on its tint

    // Categorical — Teal
    '--color-background-teal': ['#2e6b5a33', '#5ab89833'],
    '--color-border-teal': ['#2e6b5a', '#5ab898'],
    '--color-icon-teal': ['#2e6b5a', '#5ab898'],
    '--color-text-teal': ['#245546', '#6ccaaa'],

    // Categorical — Yellow
    // Bright #FFB600 physically can't reach 3:1 on white/cream, so the
    // light icon stop is the same hue at amber depth (3.3-3.8:1).
    '--color-background-yellow': ['#FFB60033', '#ffc94033'],
    '--color-border-yellow': ['#FFB600', '#ffc940'],
    '--color-icon-yellow': ['#ab7a00', '#ffc940'],
    '--color-text-yellow': ['#8a6300', '#ffd960'], // light darkened for 4.8:1 on its tint

    // =========================================================================
    // Spacing
    // =========================================================================
    '--spacing-0-5': '3px',
    '--spacing-1': '6px',
    '--spacing-1-5': '9px',
    '--spacing-2': '12px',
    '--spacing-3': '18px',
    '--spacing-4': '24px',
    '--spacing-5': '30px',
    '--spacing-6': '36px',
    '--spacing-7': '42px',
    '--spacing-8': '48px',
    '--spacing-9': '54px',
    '--spacing-10': '60px',
    '--spacing-11': '66px',
    '--spacing-12': '72px',

    // =========================================================================
    // Radius — soft and rounded
    // =========================================================================
    '--radius-inner': '6px',
    '--radius-element': '12px',
    '--radius-container': '18px',
    '--radius-page': '42px',

    // No explicit --font-size-* overrides — font sizes come from
    // typography.scale above, keeping the scale the single source of truth.

    // =========================================================================
    // Element sizes
    // =========================================================================
    '--size-element-sm': '36px',
    '--size-element-md': '40px',
    '--size-element-lg': '44px',

    // =========================================================================
    // Shadows
    // =========================================================================
    '--shadow-low': '0 2px 4px #3E481D0D, 0 4px 8px #3E481D1A',
    '--shadow-med': '0 2px 4px #3E481D0D, 0 4px 12px #3E481D1A',
    '--shadow-high': '0 4px 6px #3E481D1A, 0 12px 24px #3E481D26',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #3E481D30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #3E481D50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #4D990050',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #FFB60050',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #FD000050',
  },

  components: {
    banner: {
      'status:warning': {
        // Banner paints its warning icon with --color-warning, and the
        // bright badge yellow #FFB600 vanishes on the pale warning wash
        // (1.6:1). Rebind it here to the amber icon stop (3.5:1) so the
        // warning badge keeps its signature #FFB600 + olive label (5.6:1).
        '--color-warning': 'light-dark(#ab7a00, #ffc940)',
      },
    },
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
    },
    card: {
      base: {
        borderRadius: 'var(--radius-page)',
        padding: 'var(--spacing-3)',
      },
    },
    section: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },
  },

  icons: matchaIconRegistry,
});
