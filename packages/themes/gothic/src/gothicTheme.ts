// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Gothic Theme — dark only
 *
 * A dark-only theme with deep blue-gray tones and a distressed display
 * heading. Inspired by ink, manuscript, and noir typography.
 *
 * Core palette: #E8F1F6, #96A0AB, #495056, #24292D, #101314
 * Categorical colors follow a pastel-on-dark pattern (light backgrounds
 * with dark text) — same in any system color preference.
 *
 * Uses Manufacturing Consent for headings and Fustat for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {gothicIconRegistry} from './icons';

/**
 * Gothic syntax palette — atmospheric tones drawn from the gothic
 * categorical palette: deep purples (cathedral), blood crimson (tags),
 * aged gold (numbers), forest moss (strings), midnight indigo (functions).
 *
 * Single values (no tuples) since this is a dark-only theme.
 */
const gothicSyntax = defineSyntaxTheme({
  name: 'xds-gothic',
  tokens: {
    keyword: '#c39adb',     // Cathedral plum
    string: '#a3c987',      // Forest moss
    comment: '#6b7079',     // Faded ink
    number: '#dec074',      // Aged gold
    function: '#8aa1d8',    // Midnight indigo
    type: '#c39adb',        // Cathedral plum
    variable: '#E8F1F6',    // Parchment
    operator: '#96A0AB',    // Mid neutral
    constant: '#e6b85e',    // Candlelight amber
    tag: '#d97580',         // Blood crimson
    attribute: '#dec074',   // Aged gold
    property: '#7cc5b3',    // Verdigris
    punctuation: '#7a8290', // Mid neutral
    background: '#101314',
  },
});

export const gothicTheme = defineTheme({
  name: 'gothic',

  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Fustat',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    // Headings (h1-h6) use Fustat to match the body — Manufacturing Consent
    // is reserved for display sizes only (see component overrides below).
    heading: {
      family: 'Fustat',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  // Slower, theatrical motion — gothic doesn't rush.
  motion: {fast: 150, medium: 350, slow: 800, ratio: 0.75},

  syntax: gothicSyntax,

  tokens: {
    // =========================================================================
    // Colors — gothic dark palette (single values, dark-only)
    // Core: #E8F1F6, #96A0AB, #495056, #24292D, #101314
    // =========================================================================

    // Core semantic
    '--color-accent': '#E8F1F6',
    '--color-accent-muted': '#E8F1F620',
    '--color-neutral': '#E8F1F61A',
    '--color-background-surface': '#101314',
    '--color-background-body': '#101314',
    '--color-overlay': '#101314CC',
    '--color-overlay-hover': '#E8F1F60D',
    '--color-overlay-pressed': '#E8F1F61A',
    '--color-background-muted': '#24292D',

    // Text
    '--color-text-primary': '#E8F1F6',
    '--color-text-secondary': '#96A0AB',
    '--color-text-disabled': '#495056',
    '--color-text-accent': '#E8F1F6',
    '--color-on-dark': '#E8F1F6',
    '--color-on-light': '#101314',
    '--color-on-accent': '#101314',
    '--color-on-success': '#101314',
    '--color-on-error': '#101314',
    '--color-on-warning': '#101314',

    // Icon
    '--color-icon-accent': '#E8F1F6',
    '--color-icon-primary': '#E8F1F6',
    '--color-icon-secondary': '#96A0AB',
    '--color-icon-disabled': '#495056',

    // Surface variants
    '--color-background-card': '#1a1d20',
    '--color-background-popover': '#24292D',
    '--color-background-inverted': '#E8F1F6',

    // Status / Sentiment — dusty pastels matching the categorical
    // pattern. Used for status surfaces, destructive button bg, etc.
    '--color-success': '#b3c79a',         // sage moss
    '--color-success-muted': '#b3c79a',
    '--color-error': '#c6a6a2',           // dusty rose
    '--color-error-muted': '#c6a6a2',
    '--color-warning': '#d3c490',         // aged gold
    '--color-warning-muted': '#d3c490',

    // Border
    '--color-border': '#E8F1F61A',
    '--color-border-emphasized': '#495056',

    // Effects
    '--color-skeleton': '#495056',
    '--color-shadow': '#0000004D',
    '--color-tint-hover': 'white',

    // =========================================================================
    // Categorical — dusty pastel-on-dark pattern
    // Hand-tuned dusty pastels (T75 with reduced chroma) — confident
    // but never bright. Neutral is a dark slate with white text — the
    // "no-color" variant earns its hierarchy by matching the page mood.
    // =========================================================================

    // Blue (periwinkle midnight)
    '--color-background-blue': '#a3b5d6',
    '--color-border-blue': '#8696b8',
    '--color-icon-blue': '#2a3b6e',
    '--color-text-blue': '#1f2c54',

    // Cyan (cathedral mist)
    '--color-background-cyan': '#a3c2cf',
    '--color-border-cyan': '#86a4b1',
    '--color-icon-cyan': '#2a5e75',
    '--color-text-cyan': '#204858',

    // Gray (dark slate — special: dark bg + light text)
    '--color-background-gray': '#3d4248',
    '--color-border-gray': '#5d646b',
    '--color-icon-gray': '#E8F1F6',
    '--color-text-gray': '#E8F1F6',

    // Green (sage moss)
    '--color-background-green': '#b3c79a',
    '--color-border-green': '#96a880',
    '--color-icon-green': '#3a5e2c',
    '--color-text-green': '#244023',

    // Orange (warm tan)
    '--color-background-orange': '#d3b89a',
    '--color-border-orange': '#b6987d',
    '--color-icon-orange': '#8a4818',
    '--color-text-orange': '#6e3812',

    // Pink (dusty rose)
    '--color-background-pink': '#c89aab',
    '--color-border-pink': '#aa7d8e',
    '--color-icon-pink': '#8d2d4c',
    '--color-text-pink': '#71223c',

    // Purple (muted plum)
    '--color-background-purple': '#b29bc4',
    '--color-border-purple': '#947da6',
    '--color-icon-purple': '#5a2370',
    '--color-text-purple': '#481b58',

    // Red (dusty rose)
    '--color-background-red': '#c6a6a2',
    '--color-border-red': '#a48581',
    '--color-icon-red': '#5e3a35',
    '--color-text-red': '#4a2520',

    // Teal (sage verdigris)
    '--color-background-teal': '#a3c2b6',
    '--color-border-teal': '#86a499',
    '--color-icon-teal': '#1f5e52',
    '--color-text-teal': '#174a40',

    // Yellow (aged gold)
    '--color-background-yellow': '#d3c490',
    '--color-border-yellow': '#b6a775',
    '--color-icon-yellow': '#876515',
    '--color-text-yellow': '#6c5010',

    // =========================================================================
    // Radius — subtle rounding (original gothic)
    // =========================================================================
    '--radius-none': '0.125rem',
    '--radius-inner': '0.25rem',
    '--radius-element': '0.5rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — restrained, atmospheric
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #00000033, 0 4px 8px #00000040',
    '--shadow-med':
      '0 2px 4px #00000033, 0 4px 12px #00000040',
    '--shadow-high':
      '0 4px 6px #00000040, 0 12px 24px #0000004D',
    '--shadow-inset-hover': 'inset 0px 0px 0px 1px #96A0AB30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #96A0AB50',
    '--shadow-inset-success': 'inset 0px 0px 0px 1px #87b06a50',
    '--shadow-inset-warning': 'inset 0px 0px 0px 1px #d6b56a50',
    '--shadow-inset-error': 'inset 0px 0px 0px 1px #d4485150',
  },

  components: {
    button: {
      // Primary inherits default — light pill with dark text via
      // --color-accent / --color-on-accent (matches the cream badge).
      // Secondary uses the dark-slate "neutral" badge treatment.
      'variant:secondary': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
        borderColor: 'transparent',
        borderWidth: '0',
      },
      'variant:ghost': {
        ':hover': {
          backgroundColor: 'var(--color-overlay-hover)',
        },
      },
      // Destructive uses the dusty rose bg with dark warm-brown text
      // (matches the red badge).
      'variant:destructive': {
        backgroundColor: 'var(--color-error)',
        color: 'var(--color-text-red)',
      },
    },

    badge: {
      base: {
        borderRadius: 'var(--radius-element)',
        fontWeight: 'var(--font-weight-medium)',
      },
      'variant:info': {
        backgroundColor: 'var(--color-background-blue)',
        color: 'var(--color-text-blue)',
      },
      'variant:neutral': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
      'variant:success': {
        backgroundColor: 'var(--color-background-green)',
        color: 'var(--color-text-green)',
      },
      'variant:warning': {
        backgroundColor: 'var(--color-background-yellow)',
        color: 'var(--color-text-yellow)',
      },
      'variant:error': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
      },
    },

    banner: {
      base: {
        borderRadius: 'var(--radius-element)',
      },
      'status:info': {
        backgroundColor: 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
      },
      'status:success': {
        backgroundColor: 'var(--color-background-green)',
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
        '--color-success': 'var(--color-text-green)',
      },
      'status:warning': {
        backgroundColor: 'var(--color-background-yellow)',
        '--color-text-primary': 'var(--color-text-yellow)',
        '--color-text-secondary': 'var(--color-text-yellow)',
        '--color-warning': 'var(--color-text-yellow)',
      },
      'status:error': {
        backgroundColor: 'var(--color-background-red)',
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
        '--color-error': 'var(--color-text-red)',
      },
    },

    card: {
      base: {
        padding: 'var(--spacing-3)',
        borderRadius: 'var(--radius-container)',
      },
      // Categorical variants — flip --color-text-primary so child
      // XDSText labels stay readable against the dusty pastel bg.
      'variant:blue': {
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
      },
      'variant:cyan': {
        '--color-text-primary': 'var(--color-text-cyan)',
        '--color-text-secondary': 'var(--color-text-cyan)',
      },
      'variant:gray': {
        '--color-text-primary': 'var(--color-text-gray)',
        '--color-text-secondary': 'var(--color-text-gray)',
      },
      'variant:green': {
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
      },
      'variant:orange': {
        '--color-text-primary': 'var(--color-text-orange)',
        '--color-text-secondary': 'var(--color-text-orange)',
      },
      'variant:pink': {
        '--color-text-primary': 'var(--color-text-pink)',
        '--color-text-secondary': 'var(--color-text-pink)',
      },
      'variant:purple': {
        '--color-text-primary': 'var(--color-text-purple)',
        '--color-text-secondary': 'var(--color-text-purple)',
      },
      'variant:red': {
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
      },
      'variant:teal': {
        '--color-text-primary': 'var(--color-text-teal)',
        '--color-text-secondary': 'var(--color-text-teal)',
      },
      'variant:yellow': {
        '--color-text-primary': 'var(--color-text-yellow)',
        '--color-text-secondary': 'var(--color-text-yellow)',
      },
    },

    section: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    field: {
      base: {
        borderRadius: 'var(--radius-element)',
      },
    },

    // Display sizes use Manufacturing Consent — the signature gothic
    // display font, reserved for hero/marketing-scale text only.
    text: {
      'type:display-1': {
        fontFamily:
          '"Manufacturing Consent", "UnifrakturMaguntia", "Old English Text MT", serif',
      },
      'type:display-2': {
        fontFamily:
          '"Manufacturing Consent", "UnifrakturMaguntia", "Old English Text MT", serif',
      },
      'type:display-3': {
        fontFamily:
          '"Manufacturing Consent", "UnifrakturMaguntia", "Old English Text MT", serif',
      },
    },
  },

  icons: gothicIconRegistry,
});

/**
 * Raw tonal palettes — every color at every tone step (0–100 in 5s).
 * Use these for custom components or data visualization.
 *
 * Categorical hues (blue, green, etc.) follow gothic gem-tone hues.
 * Neutral mirrors the original gothic blue-gray palette (H≈210).
 */
export const gothicPalettes = {
  // Neutral — H=210 C=4 (cool blue-gray, original gothic)
  neutral: {
    hue: 210, chroma: 4,
    0: '#000000', 5: '#0a0d0f', 10: '#101314', 15: '#181c1f', 20: '#24292D',
    25: '#2c3236', 30: '#363c40', 35: '#40464b', 40: '#495056', 45: '#535a61',
    50: '#5d646b', 55: '#676f76', 60: '#727a82', 65: '#7e8690', 70: '#8a929c',
    75: '#96A0AB', 80: '#a8b1bb', 85: '#bbc3cb', 90: '#cdd5db', 95: '#E8F1F6',
    100: '#ffffff',
  },
  // Blue — H=255 C=20 (midnight indigo)
  blue: {
    hue: 255, chroma: 20,
    0: '#000000', 5: '#050930', 10: '#0c143f', 15: '#161e4d', 20: '#1f2c54',
    25: '#2a3565', 30: '#2a3b6e', 35: '#3a4783', 40: '#475497', 45: '#5462ab',
    50: '#6170bf', 55: '#6a85cf', 60: '#7793d6', 65: '#8aa1d8', 70: '#a3b5e0',
    75: '#b6c5e7', 80: '#c4d1ec', 85: '#d2dcef', 90: '#dde2f1', 95: '#e8ecf6',
    100: '#ffffff',
  },
  // Cyan — H=200 C=25 (cathedral mist)
  cyan: {
    hue: 200, chroma: 25,
    0: '#000000', 5: '#001724', 10: '#062436', 15: '#0d3046', 20: '#204858',
    25: '#1c4a66', 30: '#2a5e75', 35: '#3a6e85', 40: '#487d94', 45: '#598ea3',
    50: '#6a9eb1', 55: '#7ab0c0', 60: '#8cc3d8', 65: '#a0cce0', 70: '#b1d3e5',
    75: '#bcdaeb', 80: '#c5dfee', 85: '#cbe4f0', 90: '#d6e6ee', 95: '#e3eef3',
    100: '#ffffff',
  },
  // Green — H=140 C=18 (forest moss)
  green: {
    hue: 140, chroma: 18,
    0: '#000000', 5: '#0c1a08', 10: '#152511', 15: '#1c321a', 20: '#2c4a20',
    25: '#2c4d2a', 30: '#3a5e2c', 35: '#446a39', 40: '#557c44', 45: '#658d50',
    50: '#779e5d', 55: '#87b06a', 60: '#96bd76', 65: '#a3c987', 70: '#b5d397',
    75: '#bdd99e', 80: '#c8e0ad', 85: '#d4e6bd', 90: '#dde6d4', 95: '#eaf3df',
    100: '#ffffff',
  },
  // Orange — H=40 C=35 (rust copper)
  orange: {
    hue: 40, chroma: 35,
    0: '#000000', 5: '#1f0d00', 10: '#2c1606', 15: '#3a200d', 20: '#6e3812',
    25: '#5a371a', 30: '#8a4818', 35: '#9a5824', 40: '#a05728', 45: '#b66839',
    50: '#c87a4a', 55: '#d6905a', 60: '#dca275', 65: '#e1b288', 70: '#e8b894',
    75: '#ebbf9d', 80: '#eecfb5', 85: '#efddcd', 90: '#f3e5d8', 95: '#f9eee5',
    100: '#ffffff',
  },
  // Pink — H=345 C=22 (rose madder)
  pink: {
    hue: 345, chroma: 22,
    0: '#000000', 5: '#22060e', 10: '#2e0c16', 15: '#3a131e', 20: '#71223c',
    25: '#572235', 30: '#8d2d4c', 35: '#9b3358', 40: '#a04563', 45: '#a04a6e',
    50: '#b15876', 55: '#c26988', 60: '#cf7593', 65: '#d56891', 70: '#dc82a4',
    75: '#e094b1', 80: '#e7a5be', 85: '#ebb6ca', 90: '#eed6df', 95: '#f5e3eb',
    100: '#ffffff',
  },
  // Purple — H=290 C=30 (cathedral plum)
  purple: {
    hue: 290, chroma: 30,
    0: '#000000', 5: '#1e0c25', 10: '#2a1334', 15: '#371b43', 20: '#481b58',
    25: '#502163', 30: '#5a2370', 35: '#6e3088', 40: '#82409c', 45: '#9352ad',
    50: '#a363bd', 55: '#b06ec9', 60: '#bb7cd1', 65: '#c084d6', 70: '#c692db',
    75: '#cd9be0', 80: '#d2a3df', 85: '#dab3e6', 90: '#e6daee', 95: '#f0e6f4',
    100: '#ffffff',
  },
  // Red — H=15 C=12 (dusty rose) — gothic uses a desaturated rose
  // family rather than vibrant crimson; #c6a6a2 sits near T80.
  red: {
    hue: 15, chroma: 12,
    0: '#000000', 5: '#1c0d09', 10: '#26140f', 15: '#301b16', 20: '#3a231d',
    25: '#452c25', 30: '#50352d', 35: '#5b3e36', 40: '#66483e', 45: '#725347',
    50: '#7d5e51', 55: '#896a5b', 60: '#957565', 65: '#a18170', 70: '#ad8d7b',
    75: '#b99a87', 80: '#c6a6a2', 85: '#d2b4af', 90: '#dec2bc', 95: '#ebd0ca',
    100: '#ffffff',
  },
  // Teal — H=170 C=20 (verdigris)
  teal: {
    hue: 170, chroma: 20,
    0: '#000000', 5: '#001b14', 10: '#062821', 15: '#0d3530', 20: '#174a40',
    25: '#194e44', 30: '#1f5e52', 35: '#2c6c5f', 40: '#3a7b6c', 45: '#498a7a',
    50: '#5aa091', 55: '#5db5a3', 60: '#6cbeab', 65: '#7cc5b3', 70: '#90d0c0',
    75: '#9fd4c5', 80: '#b1ddcf', 85: '#c0e1d6', 90: '#d4e7e2', 95: '#e1efe9',
    100: '#ffffff',
  },
  // Yellow — H=80 C=40 (aged gold)
  yellow: {
    hue: 80, chroma: 40,
    0: '#000000', 5: '#2c1d00', 10: '#3a2900', 15: '#4a3500', 20: '#6c5010',
    25: '#6c5010', 30: '#876515', 35: '#9c7b1f', 40: '#b18e2f', 45: '#c39e3e',
    50: '#cca74c', 55: '#d6b56a', 60: '#dec074', 65: '#e2c884', 70: '#e6d091',
    75: '#e9d29a', 80: '#ebd9a7', 85: '#ebe1c4', 90: '#f0e8d6', 95: '#f7f1e3',
    100: '#ffffff',
  },
} as const;
