// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Stone Theme
 *
 * A warm, earthy neutral theme inspired by natural stone and sandstone.
 * Colors reference the reviewed Stone palette generated from palette.config.json.
 * Montserrat for headings, Figtree for body, JetBrains Mono for code.
 */

import {defineTheme, defineSyntaxTheme} from '@astryxdesign/core/theme';
import {stoneIconRegistry} from './icons';
import {stonePaletteRefs} from './stonePaletteRefs.generated';

const {blue, cyan, green, neutral, orange, pink, purple, red, teal, yellow} =
  stonePaletteRefs;

const lightDark = (light: string, dark: string): string =>
  `light-dark(${light}, ${dark})`;
const withAlpha = (color: string, alpha: string): string => `${color}${alpha}`;

const INPUT_STATUS_VARS = {
  'status:success': {
    '--color-success': lightDark(green.light[60], green.dark[70]),
  },
  'status:warning': {
    '--color-warning': lightDark(yellow.light[60], yellow.dark[70]),
  },
  'status:error': {
    '--color-error': lightDark(red.light[60], red.dark[70]),
  },
} as const;

const stoneSyntax = defineSyntaxTheme({
  name: 'astryx-stone',
  tokens: {
    keyword: [purple.light[40], purple.dark[70]],
    string: [teal.light[40], green.dark[70]],
    comment: [neutral.light[40], neutral.dark[70]],
    number: [red.light[40], orange.dark[70]],
    function: [blue.light[40], blue.dark[70]],
    type: [purple.light[40], purple.dark[70]],
    variable: [neutral.light[40], neutral.dark[70]],
    operator: [neutral.light[40], neutral.dark[70]],
    constant: [red.light[40], orange.dark[70]],
    tag: [red.light[40], red.dark[70]],
    attribute: [yellow.light[45], yellow.dark[70]],
    property: [teal.light[40], teal.dark[70]],
    punctuation: [neutral.light[40], neutral.dark[70]],
    background: [neutral.light[95], neutral.dark[5]],
    added: [withAlpha(green.light[90], '40'), withAlpha(green.dark[80], '33')],
    removed: [withAlpha(red.light[90], '40'), withAlpha(red.dark[80], '33')],
    'added-marker': [green.light[30], green.dark[90]],
    'removed-marker': [red.light[30], red.dark[90]],
  },
});

/**
 * The secondary Button treatment. Selector, MultiSelector, and ComplexSelector
 * reuse it for their `secondary` trigger so every secondary control in this
 * theme matches (AST-079 FR2).
 */
const SECONDARY_BUTTON = {
  backgroundColor: 'transparent',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: 'var(--color-border-emphasized)',
  ':hover': {
    backgroundColor: 'var(--color-neutral)',
  },
} as const;

/**
 * The secondary Button treatment on Selector and MultiSelector triggers
 * (AST-079 FR2). Inside an InputGroup a trigger keeps the neutral fill and the
 * group's edges instead (FR6). The hover stays off disabled and read-only
 * triggers, which carry `data-disabled` and `data-readonly`.
 */
const SECONDARY_SELECTOR = {
  ':not(.astryx-input-group *)': {
    backgroundColor: SECONDARY_BUTTON.backgroundColor,
    borderWidth: SECONDARY_BUTTON.borderWidth,
    borderStyle: SECONDARY_BUTTON.borderStyle,
    borderColor: SECONDARY_BUTTON.borderColor,
  },
  ':hover:not([data-disabled], [data-readonly], .astryx-input-group *)':
    SECONDARY_BUTTON[':hover'],
} as const;

/**
 * The secondary Button treatment on ComplexSelector triggers (AST-079 FR2), with
 * the hover kept off a disabled trigger, whose inner button is disabled.
 */
const SECONDARY_COMPLEX_SELECTOR = {
  backgroundColor: SECONDARY_BUTTON.backgroundColor,
  borderWidth: SECONDARY_BUTTON.borderWidth,
  borderStyle: SECONDARY_BUTTON.borderStyle,
  borderColor: SECONDARY_BUTTON.borderColor,
  ':hover:not(:has(> :disabled))': SECONDARY_BUTTON[':hover'],
} as const;

export const stoneTheme = defineTheme({
  name: 'stone',

  typography: {
    scale: {base: 14, ratio: 1.25},
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Montserrat',
      fallbacks:
        '"Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  // Touch + narrow (Mobile Type, Pin): floor base to the 16px floor and
  // re-derive the ratio so Display 1 keeps its desktop size:
  // ratio' = 1.25 * (14/16)^(1/6) ~= 1.2225. Body 14 -> 16px, display-1 stays 53px.
  adaptations: {
    rules: [
      {
        when: {pointer: 'coarse', width: {below: 'lg'}},
        value: {typography: {scale: {base: 16, ratio: 1.2225}}},
      },
    ],
  },

  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: stoneSyntax,

  tokens: {
    // Core neutrals
    '--color-accent': [neutral.light[15], neutral.dark[95]],
    '--color-accent-muted': [
      withAlpha(neutral.light[15], '14'),
      withAlpha(neutral.dark[95], '20'),
    ],
    '--color-neutral': [
      withAlpha(neutral.light[15], '0f'),
      withAlpha(neutral.dark[95], '1a'),
    ],
    '--color-background-surface': [neutral.light[100], neutral.dark[10]],
    '--color-background-body': [neutral.light[95], neutral.dark[5]],
    '--color-overlay': [
      withAlpha(neutral.light[15], '80'),
      withAlpha(neutral.dark[15], 'cc'),
    ],
    '--color-overlay-hover': [
      withAlpha(neutral.light[15], '0d'),
      withAlpha(neutral.dark[95], '0d'),
    ],
    '--color-overlay-pressed': [
      withAlpha(neutral.light[15], '1a'),
      withAlpha(neutral.dark[95], '1a'),
    ],
    '--color-background-muted': [neutral.light[90], neutral.dark[25]],

    // Text
    '--color-text-primary': [neutral.light[15], neutral.dark[95]],
    '--color-text-secondary': [neutral.light[40], neutral.dark[70]],
    '--color-text-disabled': [neutral.light[85], neutral.dark[40]],
    '--color-text-accent': [neutral.light[15], neutral.dark[95]],
    '--color-on-dark': neutral.light[100],
    '--color-on-light': [neutral.light[15], neutral.dark[15]],
    '--color-on-accent': [neutral.light[100], neutral.dark[15]],
    '--color-on-success': [green.light[30], green.dark[90]],
    '--color-on-error': [red.light[30], red.dark[90]],
    '--color-on-warning': [yellow.light[30], yellow.dark[90]],

    // Icon
    '--color-icon-accent': [neutral.light[15], neutral.dark[95]],
    '--color-icon-primary': [neutral.light[15], neutral.dark[95]],
    '--color-icon-secondary': [neutral.light[55], neutral.dark[65]],
    '--color-icon-disabled': [neutral.light[85], neutral.dark[40]],

    // Surface variants
    '--color-background-card': [neutral.light[100], neutral.dark[15]],
    '--color-background-popover': [neutral.light[100], neutral.dark[20]],
    '--color-background-inverted': [neutral.light[15], neutral.dark[95]],

    // Status / sentiment
    '--color-success': [green.light[30], green.dark[80]],
    '--color-success-muted': [green.light[90], green.dark[80]],
    '--color-error': [red.light[30], red.dark[80]],
    '--color-error-muted': [red.light[90], red.dark[80]],
    '--color-warning': [yellow.light[30], yellow.dark[80]],
    '--color-warning-muted': [yellow.light[90], yellow.dark[80]],

    // Border
    '--color-border': [neutral.light[90], withAlpha(neutral.dark[95], '1a')],
    '--color-border-emphasized': [neutral.light[55], neutral.dark[40]],

    // Effects
    '--color-skeleton': [neutral.light[85], neutral.dark[40]],
    '--color-shadow': [
      withAlpha(neutral.light[15], '1a'),
      withAlpha(neutral.dark[0], '4d'),
    ],
    '--color-tint-hover': [neutral.light[0], neutral.dark[100]],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical
    '--color-background-blue': [blue.light[90], blue.dark[35]],
    '--color-border-blue': [blue.light[85], blue.dark[25]],
    '--color-icon-blue': [blue.light[30], blue.dark[90]],
    '--color-text-blue': [blue.light[30], blue.dark[90]],

    '--color-background-cyan': [cyan.light[90], cyan.dark[35]],
    '--color-border-cyan': [cyan.light[85], cyan.dark[25]],
    '--color-icon-cyan': [cyan.light[30], cyan.dark[90]],
    '--color-text-cyan': [cyan.light[30], cyan.dark[90]],

    '--color-background-gray': [neutral.light[90], neutral.dark[35]],
    '--color-border-gray': [neutral.light[85], neutral.dark[25]],
    '--color-icon-gray': [neutral.light[30], neutral.dark[90]],
    '--color-text-gray': [neutral.light[30], neutral.dark[90]],

    '--color-background-green': [green.light[90], green.dark[35]],
    '--color-border-green': [green.light[85], green.dark[25]],
    '--color-icon-green': [green.light[30], green.dark[90]],
    '--color-text-green': [green.light[30], green.dark[90]],

    '--color-background-orange': [orange.light[90], orange.dark[35]],
    '--color-border-orange': [orange.light[85], orange.dark[25]],
    '--color-icon-orange': [orange.light[30], orange.dark[90]],
    '--color-text-orange': [orange.light[30], orange.dark[90]],

    '--color-background-pink': [pink.light[90], pink.dark[35]],
    '--color-border-pink': [pink.light[85], pink.dark[25]],
    '--color-icon-pink': [pink.light[30], pink.dark[90]],
    '--color-text-pink': [pink.light[30], pink.dark[90]],

    '--color-background-purple': [purple.light[90], purple.dark[35]],
    '--color-border-purple': [purple.light[85], purple.dark[25]],
    '--color-icon-purple': [purple.light[30], purple.dark[90]],
    '--color-text-purple': [purple.light[30], purple.dark[90]],

    '--color-background-red': [red.light[90], red.dark[35]],
    '--color-border-red': [red.light[85], red.dark[25]],
    '--color-icon-red': [red.light[30], red.dark[90]],
    '--color-text-red': [red.light[30], red.dark[90]],

    '--color-background-teal': [teal.light[90], teal.dark[35]],
    '--color-border-teal': [teal.light[85], teal.dark[25]],
    '--color-icon-teal': [teal.light[30], teal.dark[90]],
    '--color-text-teal': [teal.light[30], teal.dark[90]],

    '--color-background-yellow': [yellow.light[90], yellow.dark[35]],
    '--color-border-yellow': [yellow.light[85], yellow.dark[25]],
    '--color-icon-yellow': [yellow.light[30], yellow.dark[90]],
    '--color-text-yellow': [yellow.light[30], yellow.dark[90]],

    // Radius
    '--radius-none': '0px',
    '--radius-inner': '0.25rem',
    '--radius-element': '0.5rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // Shadows
    '--shadow-low': `0 2px 4px ${withAlpha(neutral.light[15], '0d')}, 0 4px 8px ${withAlpha(neutral.light[15], '1a')}`,
    '--shadow-med': `0 2px 4px ${withAlpha(neutral.light[15], '0d')}, 0 4px 12px ${withAlpha(neutral.light[15], '1a')}`,
    '--shadow-high': `0 4px 6px ${withAlpha(neutral.light[15], '1a')}, 0 12px 24px ${withAlpha(neutral.light[15], '26')}`,
    '--shadow-inset-hover': `inset 0 0 0 2px ${withAlpha(neutral.light[15], '30')}`,
    '--shadow-inset-selected': `inset 0 0 0 2px ${withAlpha(neutral.light[15], '50')}`,
    '--shadow-inset-success': `inset 0 0 0 2px ${withAlpha(neutral.light[55], '30')}`,
    '--shadow-inset-warning': `inset 0 0 0 2px ${withAlpha(neutral.light[55], '30')}`,
    '--shadow-inset-error': `inset 0 0 0 2px ${withAlpha(neutral.light[55], '30')}`,
  },

  components: {
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
      'variant:secondary': SECONDARY_BUTTON,
      'variant:destructive': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
      },
    },

    badge: {
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
      'status:info': {
        '--color-accent-muted': 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
      },
      'status:success': {
        '--color-success-muted': 'var(--color-background-green)',
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
        '--color-success': 'var(--color-text-green)',
      },
      'status:warning': {
        '--color-warning-muted': 'var(--color-background-yellow)',
        '--color-text-primary': 'var(--color-text-yellow)',
        '--color-text-secondary': 'var(--color-text-yellow)',
        '--color-warning': 'var(--color-text-yellow)',
      },
      'status:error': {
        '--color-error-muted': 'var(--color-background-red)',
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
        '--color-error': 'var(--color-text-red)',
      },
    },

    'progress-bar-fill': {
      'variant:accent': {
        backgroundColor: lightDark(blue.light[90], blue.dark[70]),
      },
      'variant:success': {
        backgroundColor: lightDark(green.light[90], green.dark[70]),
      },
      'variant:warning': {
        backgroundColor: lightDark(yellow.light[90], yellow.dark[70]),
      },
      'variant:error': {
        backgroundColor: lightDark(red.light[90], red.dark[70]),
      },
    },

    'progress-bar-track': {
      base: {
        backgroundColor: 'var(--color-skeleton)',
      },
    },

    switch: {
      base: {
        '--color-background-gray': 'var(--color-skeleton)',
      },
    },

    'field-status': {
      'type:success': {
        backgroundColor: 'var(--color-background-green)',
      },
      'type:warning': {
        backgroundColor: 'var(--color-background-yellow)',
      },
      'type:error': {
        backgroundColor: 'var(--color-background-red)',
      },
    },

    'text-input': INPUT_STATUS_VARS,
    'text-area': INPUT_STATUS_VARS,
    'number-input': INPUT_STATUS_VARS,
    'date-input': INPUT_STATUS_VARS,
    'time-input': INPUT_STATUS_VARS,
    selector: {...INPUT_STATUS_VARS, 'variant:secondary': SECONDARY_SELECTOR},
    'multi-selector': {
      ...INPUT_STATUS_VARS,
      'variant:secondary': SECONDARY_SELECTOR,
    },
    'complex-selector': {'variant:secondary': SECONDARY_COMPLEX_SELECTOR},
    typeahead: INPUT_STATUS_VARS,
    tokenizer: INPUT_STATUS_VARS,

    card: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    section: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },
  },

  icons: stoneIconRegistry,
});
