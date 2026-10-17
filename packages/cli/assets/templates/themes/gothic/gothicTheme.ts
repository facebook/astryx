// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Gothic Theme — dark only
 *
 * A dark-only theme with deep blue-gray tones and a distressed display
 * heading. Inspired by ink, manuscript, and noir typography.
 *
 * Categorical colors follow a pastel-on-dark pattern (light backgrounds
 * with dark text) — same in any system color preference.
 *
 * Uses Manufacturing Consent for headings and Fustat for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@astryxdesign/core/theme';
import {gothicIconRegistry} from './icons';
import {gothicPaletteRefs} from './gothicPaletteRefs.generated';

const {blue, cyan, green, neutral, orange, pink, purple, red, teal, yellow} =
  gothicPaletteRefs;

const withAlpha = (color: string, alpha: string): string => `${color}${alpha}`;

/**
 * Gothic syntax palette — atmospheric tones drawn from the gothic
 * categorical palette: deep purples (cathedral), blood crimson (tags),
 * aged gold (numbers), forest moss (strings), midnight indigo (functions).
 *
 * Single values (no tuples) since this is a dark-only theme.
 */
const gothicSyntax = defineSyntaxTheme({
  name: 'astryx-gothic',
  tokens: {
    keyword: purple.dark[80],
    string: green.dark[70],
    comment: neutral.dark[55],
    number: yellow.dark[70],
    function: blue.dark[65],
    type: purple.dark[80],
    variable: neutral.dark[95],
    operator: neutral.dark[75],
    constant: yellow.dark[65],
    tag: pink.dark[65],
    attribute: yellow.dark[70],
    property: teal.dark[70],
    punctuation: neutral.dark[65],
    background: neutral.dark[10],
    added: green.dark[5],
    removed: red.dark[5],
    'added-marker': green.dark[70],
    'removed-marker': pink.dark[65],
  },
});

/**
 * The secondary Button treatment. Selector, MultiSelector, and ComplexSelector
 * reuse it for their `secondary` trigger so every secondary control in this
 * theme matches (AST-079 FR2).
 *
 * Primary inherits default — light pill with dark text via
 * --color-accent / --color-on-accent (matches the cream badge).
 * Secondary uses the dark-slate "neutral" badge treatment.
 */
const SECONDARY_BUTTON = {
  backgroundColor: 'var(--color-background-gray)',
  color: 'var(--color-text-gray)',
  borderColor: 'transparent',
  borderWidth: '0',
} as const;

/**
 * The secondary Button treatment on Selector and MultiSelector triggers
 * (AST-079 FR2). Inside an InputGroup a trigger keeps the neutral fill and the
 * group's edges instead (FR6).
 */
const SECONDARY_SELECTOR = {
  ':not(.astryx-input-group *)': {
    backgroundColor: SECONDARY_BUTTON.backgroundColor,
    color: SECONDARY_BUTTON.color,
    borderColor: SECONDARY_BUTTON.borderColor,
    borderWidth: SECONDARY_BUTTON.borderWidth,
  },
} as const;

export const gothicTheme = defineTheme({
  name: 'gothic',

  typography: {
    // base 16 / ratio 1.25 — larger scale so the (optically small) blackletter
    // display sizes read large enough to carry the theme.
    scale: {base: 16, ratio: 1.25},
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
    '--color-accent': neutral.dark[95],
    '--color-accent-muted': withAlpha(neutral.dark[95], '20'),
    '--color-neutral': withAlpha(neutral.dark[95], '1a'),
    '--color-background-surface': neutral.dark[10],
    '--color-background-body': neutral.dark[10],
    '--color-overlay': withAlpha(neutral.dark[10], 'cc'),
    '--color-overlay-hover': withAlpha(neutral.dark[95], '0d'),
    '--color-overlay-pressed': withAlpha(neutral.dark[95], '1a'),
    '--color-background-muted': neutral.dark[20],

    '--color-text-primary': neutral.dark[95],
    '--color-text-secondary': neutral.dark[75],
    '--color-text-disabled': neutral.dark[40],
    '--color-text-accent': neutral.dark[95],
    '--color-on-dark': neutral.dark[95],
    '--color-on-light': neutral.dark[10],
    '--color-on-accent': neutral.dark[10],
    '--color-on-success': neutral.dark[10],
    '--color-on-error': neutral.dark[10],
    '--color-on-warning': neutral.dark[10],

    '--color-icon-accent': neutral.dark[95],
    '--color-icon-primary': neutral.dark[95],
    '--color-icon-secondary': neutral.dark[75],
    '--color-icon-disabled': neutral.dark[40],

    '--color-background-card': neutral.dark[15],
    '--color-background-popover': neutral.dark[20],
    '--color-background-inverted': neutral.dark[95],

    '--color-success': green.dark[75],
    '--color-success-muted': green.dark[75],
    '--color-error': red.dark[75],
    '--color-error-muted': red.dark[75],
    '--color-warning': yellow.dark[75],
    '--color-warning-muted': yellow.dark[75],

    '--color-border': withAlpha(neutral.dark[95], '1a'),
    '--color-border-emphasized': neutral.dark[40],

    '--color-skeleton': neutral.dark[40],
    '--color-shadow': withAlpha(neutral.dark[0], '4d'),
    '--color-tint-hover': neutral.dark[100],

    '--color-background-blue': blue.dark[75],
    '--color-border-blue': blue.dark[60],
    '--color-icon-blue': blue.dark[30],
    '--color-text-blue': blue.dark[20],

    '--color-background-cyan': cyan.dark[75],
    '--color-border-cyan': cyan.dark[60],
    '--color-icon-cyan': cyan.dark[30],
    '--color-text-cyan': cyan.dark[20],

    '--color-background-gray': neutral.dark[35],
    '--color-border-gray': neutral.dark[50],
    '--color-icon-gray': neutral.dark[95],
    '--color-text-gray': neutral.dark[95],

    '--color-background-green': green.dark[75],
    '--color-border-green': green.dark[60],
    '--color-icon-green': green.dark[30],
    '--color-text-green': green.dark[20],

    '--color-background-orange': orange.dark[75],
    '--color-border-orange': orange.dark[60],
    '--color-icon-orange': orange.dark[30],
    '--color-text-orange': orange.dark[20],

    '--color-background-pink': pink.dark[75],
    '--color-border-pink': pink.dark[60],
    '--color-icon-pink': pink.dark[30],
    '--color-text-pink': pink.dark[20],

    '--color-background-purple': purple.dark[75],
    '--color-border-purple': purple.dark[60],
    '--color-icon-purple': purple.dark[30],
    '--color-text-purple': purple.dark[20],

    '--color-background-red': red.dark[75],
    '--color-border-red': red.dark[60],
    '--color-icon-red': red.dark[30],
    '--color-text-red': red.dark[20],

    '--color-background-teal': teal.dark[75],
    '--color-border-teal': teal.dark[60],
    '--color-icon-teal': teal.dark[30],
    '--color-text-teal': teal.dark[20],

    '--color-background-yellow': yellow.dark[75],
    '--color-border-yellow': yellow.dark[60],
    '--color-icon-yellow': yellow.dark[30],
    '--color-text-yellow': yellow.dark[20],

    // =========================================================================
    // Radius — subtle rounding (original gothic)
    //   --radius-none and --radius-full are always fixed and must never be
    //   scaled by a theme (see defineTheme's radius config docs) — 0 and
    //   9999px respectively, matching @astryxdesign/core's own defaults.
    // =========================================================================
    '--radius-none': '0px',
    '--radius-inner': '0.25rem',
    '--radius-element': '0.5rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — restrained, atmospheric
    // =========================================================================
    '--shadow-low': `0 2px 4px ${withAlpha(neutral.dark[0], '33')}, 0 4px 8px ${withAlpha(neutral.dark[0], '40')}`,
    '--shadow-med': `0 2px 4px ${withAlpha(neutral.dark[0], '33')}, 0 4px 12px ${withAlpha(neutral.dark[0], '40')}`,
    '--shadow-high': `0 4px 6px ${withAlpha(neutral.dark[0], '40')}, 0 12px 24px ${withAlpha(neutral.dark[0], '4d')}`,
    '--shadow-inset-hover': `inset 0 0 0 1px ${withAlpha(neutral.dark[75], '30')}`,
    '--shadow-inset-selected': `inset 0 0 0 2px ${withAlpha(neutral.dark[75], '50')}`,
    '--shadow-inset-success': `inset 0 0 0 1px ${withAlpha(green.dark[55], '50')}`,
    '--shadow-inset-warning': `inset 0 0 0 1px ${withAlpha(yellow.dark[75], '50')}`,
    '--shadow-inset-error': `inset 0 0 0 1px ${withAlpha(red.dark[75], '50')}`,
  },

  components: {
    button: {
      'variant:secondary': SECONDARY_BUTTON,
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
    // Secondary selector triggers match the secondary Button (AST-079 FR2).
    selector: {'variant:secondary': SECONDARY_SELECTOR},
    'multi-selector': {'variant:secondary': SECONDARY_SELECTOR},
    'complex-selector': {'variant:secondary': SECONDARY_BUTTON},

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
