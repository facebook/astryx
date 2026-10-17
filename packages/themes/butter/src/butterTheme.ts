// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Butter Theme
 *
 * Warm, golden buttery theme with blue accents.
 * Sarina for display, Outfit for headings and body.
 *
 * All colors resolve through named stops from Butter's reviewed palette.
 * The signature blue and butter yellow remain exact anchors.
 */

import {defineTheme, defineSyntaxTheme} from '@astryxdesign/core/theme';
import {butterIconRegistry} from './icons';
import {butterPaletteRefs} from './butterPaletteRefs.generated';

const {
  accent,
  blue,
  cyan,
  green,
  neutral,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} = butterPaletteRefs;

const withAlpha = (color: string, alpha: string): string => `${color}${alpha}`;
const lightDark = (light: string, dark: string): string =>
  `light-dark(${light}, ${dark})`;

/** Butter syntax colors resolved through reviewed palette stops. */
const butterSyntax = defineSyntaxTheme({
  name: 'astryx-butter',
  tokens: {
    keyword: [purple.light[25], purple.dark[80]], // Purple
    string: [green.light[25], green.dark[80]], // Green
    comment: [neutral.light[45], neutral.dark[70]],
    number: [orange.light[25], orange.dark[80]], // Orange
    function: [blue.light[25], blue.dark[80]], // Blue
    type: [purple.light[25], purple.dark[80]], // Purple
    variable: [neutral.light[45], neutral.dark[70]],
    operator: [neutral.light[45], neutral.dark[70]],
    constant: [orange.light[25], orange.dark[80]],
    tag: [red.light[25], red.dark[80]], // Red
    attribute: [yellow.light[25], yellow.dark[70]], // Yellow
    property: [teal.light[25], teal.dark[80]], // Teal
    punctuation: [neutral.light[45], neutral.dark[70]],
    background: [neutral.light[95], neutral.dark[5]],
  },
});

/**
 * The secondary Button treatment. Selector, MultiSelector, and ComplexSelector
 * reuse it for their `secondary` trigger so every secondary control in this
 * theme matches (AST-079 FR2).
 *
 * Secondary: blue outline + label in light, butter yellow in dark.
 */
const SECONDARY_BUTTON = {
  backgroundColor: 'transparent',
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: lightDark(accent.light[40], yellow.dark[90]),
  color: lightDark(accent.light[40], yellow.dark[90]),
  ':hover': {
    backgroundColor: lightDark(
      withAlpha(accent.light[40], '14'),
      withAlpha(yellow.dark[90], '14'),
    ),
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
    color: SECONDARY_BUTTON.color,
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
  color: SECONDARY_BUTTON.color,
  ':hover:not(:has(> :disabled))': SECONDARY_BUTTON[':hover'],
} as const;

export const butterTheme = defineTheme({
  name: 'butter',

  typography: {
    scale: {base: 14, ratio: 1.25},
    body: {
      family: 'Outfit',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Outfit',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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

  syntax: butterSyntax,

  tokens: {
    // =========================================================================
    // Core semantic — accent uses the exact signature brand stop
    // =========================================================================
    '--color-accent': [accent.light[40], yellow.dark[90]],
    '--color-accent-muted': [
      withAlpha(accent.light[40], '33'),
      withAlpha(yellow.dark[90], '40'),
    ],
    '--color-neutral': [
      withAlpha(neutral.light[15], '0f'),
      withAlpha(neutral.dark[90], '1a'),
    ],
    '--color-background-surface': [neutral.light[100], neutral.dark[15]],
    '--color-background-body': [neutral.light[95], neutral.dark[10]],
    '--color-overlay': [
      withAlpha(neutral.light[15], '80'),
      withAlpha(neutral.dark[10], 'cc'),
    ],
    '--color-overlay-hover': [
      withAlpha(neutral.light[15], '0d'),
      withAlpha(neutral.dark[90], '0d'),
    ],
    '--color-overlay-pressed': [
      withAlpha(neutral.light[15], '1a'),
      withAlpha(neutral.dark[90], '1a'),
    ],
    '--color-background-muted': [neutral.light[90], neutral.dark[20]],

    // Text — warm neutral
    '--color-text-primary': [neutral.light[15], neutral.dark[90]],
    '--color-text-secondary': [neutral.light[45], neutral.dark[70]],
    '--color-text-disabled': [neutral.light[70], neutral.dark[45]],
    '--color-text-accent': [accent.light[40], yellow.dark[90]],
    '--color-on-dark': neutral.light[100],
    '--color-on-light': neutral.light[15],
    '--color-on-accent': [neutral.light[100], neutral.light[15]],
    // Light foregrounds used on vivid semantic surfaces.
    '--color-on-success': [green.light[85], green.dark[15]],
    '--color-on-error': [red.light[95], red.dark[15]],
    '--color-on-warning': [yellow.light[95], yellow.dark[15]],

    // Icon
    '--color-icon-accent': [accent.light[40], yellow.dark[90]],
    '--color-icon-primary': [neutral.light[15], neutral.dark[90]],
    '--color-icon-secondary': [neutral.light[45], neutral.dark[70]],
    '--color-icon-disabled': [neutral.light[70], neutral.dark[45]],

    // Surface variants
    '--color-background-card': [neutral.light[100], neutral.dark[20]],
    '--color-background-popover': [neutral.light[100], neutral.dark[20]],
    '--color-background-inverted': [neutral.light[15], neutral.dark[95]],

    // Status semantics share the Red, Yellow, and Green families.
    '--color-error': [red.light[30], red.dark[85]],
    '--color-error-muted': [
      withAlpha(red.light[30], '33'),
      withAlpha(red.dark[85], '40'),
    ],
    '--color-warning': [yellow.light[30], yellow.dark[75]],
    '--color-warning-muted': [
      withAlpha(yellow.light[30], '33'),
      withAlpha(yellow.dark[75], '40'),
    ],
    '--color-success': [green.light[25], green.dark[70]],
    '--color-success-muted': [
      withAlpha(green.light[25], '33'),
      withAlpha(green.dark[70], '40'),
    ],

    // Border — softer taupe card outline (emphasized) in light mode.
    '--color-border': [neutral.light[85], withAlpha(neutral.dark[90], '1a')],
    '--color-border-emphasized': [neutral.light[75], neutral.dark[60]],

    // Effects
    '--color-skeleton': [neutral.light[85], neutral.dark[35]],
    '--color-shadow': [
      withAlpha(neutral.light[15], '1a'),
      withAlpha(neutral.dark[0], '4d'),
    ],
    '--color-tint-hover': [neutral.light[0], neutral.dark[100]],

    // Typography override
    '--text-supporting-size': '12px',

    // Element sizes — slightly taller defaults so the new input padding
    // (--spacing-2 block) has room to breathe.
    '--size-element-sm': '32px',
    '--size-element-md': '40px',
    '--size-element-lg': '48px',

    // =========================================================================
    // Categorical — reviewed light and dark stops for each family.
    // =========================================================================

    // Blue
    '--color-background-blue': [blue.light[90], blue.dark[90]],
    '--color-border-blue': [blue.light[80], blue.dark[80]],
    '--color-icon-blue': [blue.light[25], blue.dark[25]],
    '--color-text-blue': [blue.light[25], blue.dark[25]],

    // Cyan
    '--color-background-cyan': [cyan.light[90], cyan.dark[90]],
    '--color-border-cyan': [cyan.light[80], cyan.dark[80]],
    '--color-icon-cyan': [cyan.light[25], cyan.dark[25]],
    '--color-text-cyan': [cyan.light[25], cyan.dark[25]],

    // Gray (uses the neutral palette)
    '--color-background-gray': [neutral.dark[85], neutral.dark[85]],
    '--color-border-gray': [neutral.light[80], neutral.dark[80]],
    '--color-icon-gray': [neutral.light[30], neutral.dark[30]],
    '--color-text-gray': [neutral.light[30], neutral.dark[30]],

    // Green
    '--color-background-green': [green.light[90], green.dark[90]],
    '--color-border-green': [green.light[80], green.dark[80]],
    '--color-icon-green': [green.light[25], green.dark[20]],
    '--color-text-green': [green.light[25], green.dark[20]],

    // Orange
    '--color-background-orange': [orange.light[90], orange.dark[90]],
    '--color-border-orange': [orange.light[80], orange.dark[80]],
    '--color-icon-orange': [orange.light[25], orange.dark[25]],
    '--color-text-orange': [orange.light[25], orange.dark[25]],

    // Pink
    '--color-background-pink': [pink.light[90], pink.dark[90]],
    '--color-border-pink': [pink.light[80], pink.dark[80]],
    '--color-icon-pink': [pink.light[25], pink.dark[25]],
    '--color-text-pink': [pink.light[25], pink.dark[25]],

    // Purple
    '--color-background-purple': [purple.light[90], purple.dark[90]],
    '--color-border-purple': [purple.light[80], purple.dark[80]],
    '--color-icon-purple': [purple.light[25], purple.dark[25]],
    '--color-text-purple': [purple.light[25], purple.dark[25]],

    // Red
    '--color-background-red': [red.light[90], red.dark[90]],
    '--color-border-red': [red.light[80], red.dark[80]],
    '--color-icon-red': [red.light[25], red.dark[25]],
    '--color-text-red': [red.light[25], red.dark[25]],

    // Teal
    '--color-background-teal': [teal.light[90], teal.dark[90]],
    '--color-border-teal': [teal.light[80], teal.dark[80]],
    '--color-icon-teal': [teal.light[25], teal.dark[25]],
    '--color-text-teal': [teal.light[25], teal.dark[25]],

    // Yellow
    '--color-background-yellow': [yellow.light[85], yellow.dark[85]],
    '--color-border-yellow': [yellow.light[70], yellow.dark[70]],
    '--color-icon-yellow': [yellow.light[25], yellow.dark[25]],
    '--color-text-yellow': [yellow.light[25], yellow.dark[25]],

    // =========================================================================
    // Radius
    //   --radius-element drives buttons, badges, inputs — 8px per design
    //   --radius-container drives cards, banners, popovers — 12px per design
    //   --radius-none and --radius-full are always fixed and must never be
    //   scaled by a theme (see defineTheme's radius config docs) — 0 and
    //   9999px respectively, matching @astryxdesign/core's own defaults.
    // =========================================================================
    '--radius-none': '0px',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.5rem', // 8px
    '--radius-container': '0.75rem', // 12px
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — warm neutral tint
    // =========================================================================
    '--shadow-low': `0 2px 4px ${withAlpha(neutral.light[15], '0d')}, 0 4px 8px ${withAlpha(neutral.light[15], '1a')}`,
    '--shadow-med': `0 2px 4px ${withAlpha(neutral.light[15], '0d')}, 0 4px 12px ${withAlpha(neutral.light[15], '1a')}`,
    '--shadow-high': `0 4px 6px ${withAlpha(neutral.light[15], '1a')}, 0 12px 24px ${withAlpha(neutral.light[15], '26')}`,
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${withAlpha(neutral.light[55], '30')}`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${withAlpha(neutral.light[55], '50')}`,
    '--shadow-inset-success': `inset 0px 0px 0px 2px ${withAlpha(green.light[25], '30')}`,
    '--shadow-inset-warning': `inset 0px 0px 0px 2px ${withAlpha(yellow.light[30], '30')}`,
    '--shadow-inset-error': `inset 0px 0px 0px 2px ${withAlpha(red.light[30], '30')}`,
  },

  components: {
    // TopNav uses Butter's blue accent: the heading and the selected item are
    // the full brand blue; unselected items (default + hover) use a lighter
    // blue. Dark mode keeps the theme's butter-yellow accent.
    'top-nav-heading': {
      // The heading text is an inner span that reads --color-text-primary, so
      // redirect that token (not just `color`) to the brand blue so the text
      // itself turns blue, not only the container.
      base: {
        color: lightDark(accent.light[40], yellow.dark[90]),
        '--color-text-primary': lightDark(accent.light[40], yellow.dark[90]),
      },
    },
    'top-nav-item': {
      base: {
        color: lightDark(accent.light[60], withAlpha(yellow.dark[90], 'cc')),
      },
      // Selected item: full brand blue, no pill background — rely on weight +
      // color for emphasis. Hover/active keep the neutral overlay.
      selected: {
        color: lightDark(accent.light[40], yellow.dark[90]),
        backgroundColor: 'transparent',
        ':hover': {
          backgroundColor: 'var(--color-overlay-hover)',
        },
        ':active': {
          backgroundColor: 'var(--color-overlay-pressed)',
        },
      },
    },
    button: {
      // Radius intentionally not pinned, so buttons keep core's
      // `var(--_button-radius, --radius-element)`: standalone buttons stay 8px,
      // while the chat composer (which sets --_button-radius) rounds them fully.
      base: {
        paddingBlock: 'var(--spacing-3)',
        paddingInline: 'var(--spacing-4)',
      },
      'variant:secondary': SECONDARY_BUTTON,
      // Ghost: same accent color as secondary, no background.
      'variant:ghost': {
        color: lightDark(accent.light[40], yellow.dark[90]),
      },
      'variant:destructive': {
        backgroundColor: lightDark(red.light[90], red.dark[80]),
        color: lightDark(red.light[10], red.dark[25]),
      },
    },

    badge: {
      // Match astryx/daily badge sizing: 30px tall with 12px horizontal pad.
      // Use explicit values because butter inherits the standard spacing
      // scale (where --spacing-3 = 12px), unlike astryx which redefines it.
      base: {
        height: '30px',
        paddingBlock: '0',
        paddingInline: 'var(--spacing-3)',
      },
      // Vivid semantic badges — pinned to the reviewed semantic stops.
      // Info uses Butter’s lighter accent stop rather than its signature stop.
      'variant:info': {
        backgroundColor: accent.light[55],
        color: neutral.light[100],
      },
      'variant:neutral': {
        backgroundColor: yellow.light[90],
        color: accent.light[40],
      },
      'variant:success': {
        backgroundColor: green.light[70],
        color: neutral.light[15],
      },
      'variant:warning': {
        backgroundColor: yellow.light[80],
        color: neutral.light[15],
      },
      'variant:error': {
        backgroundColor: red.light[60],
        color: neutral.light[100],
      },
    },

    // Banner backgrounds match the semantic badge fills.
    // Banner status colors — override the muted tokens locally so the
    // header (which reads --color-*-muted via StyleX) renders vivid fills
    // matching the badge palette. Scoped to the banner root, doesn't leak.
    banner: {
      'status:info': {
        '--color-accent-muted': accent.light[55],
        '--color-text-primary': neutral.light[100],
        '--color-text-secondary': neutral.light[100],
        '--color-accent': neutral.light[100],
      },
      'status:success': {
        '--color-success-muted': green.light[70],
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[15],
        '--color-success': neutral.light[15],
      },
      'status:warning': {
        '--color-warning-muted': yellow.light[80],
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[15],
        '--color-warning': neutral.light[15],
      },
      'status:error': {
        '--color-error-muted': red.light[60],
        '--color-text-primary': neutral.light[100],
        '--color-text-secondary': neutral.light[100],
        '--color-error': neutral.light[100],
      },
    },

    card: {
      base: {
        borderRadius: 'var(--radius-container)',
        padding: 'var(--spacing-4)',
      },
      'variant:info': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:success': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:warning': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:error': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:blue': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:cyan': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:gray': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:green': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:orange': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:pink': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:purple': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:red': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:teal': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:yellow': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
      'variant:muted': {
        '--color-text-primary': neutral.light[15],
        '--color-text-secondary': neutral.light[45],
      },
    },

    section: {
      base: {
        padding: 'var(--spacing-4)',
      },
    },

    // Progress bar — pale track in light, warm brown in dark. Vivid
    // semantic fills match the banner colors (Success / Warning / Error).
    'progress-bar-track': {
      base: {
        backgroundColor: lightDark(neutral.light[85], neutral.dark[40]),
      },
    },
    'progress-bar-fill': {
      'variant:success': {
        backgroundColor: green.light[70],
      },
      'variant:warning': {
        backgroundColor: yellow.light[80],
      },
      'variant:error': {
        backgroundColor: red.light[60],
      },
    },

    // Field status bubble — match the corresponding banner colors so the
    // helper text below an input reads as the same "this is a warning /
    // error / success" surface as the standalone banner.
    'field-status': {
      'type:success': {
        backgroundColor: green.light[70],
        color: neutral.light[15],
      },
      'type:warning': {
        backgroundColor: yellow.light[80],
        color: neutral.light[15],
      },
      'type:error': {
        backgroundColor: red.light[60],
        color: neutral.light[100],
      },
    },

    // Inputs — softer border than default, more vertical breathing room.
    // Status modifiers also remap the semantic tokens locally so the
    // status icon + border read as the same vivid hue as the banner
    // (icons inherit from --color-{success,warning,error}).
    'text-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },
    'text-area': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },
    'number-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },
    'date-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },
    'time-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },
    selector: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
      'variant:secondary': SECONDARY_SELECTOR,
    },
    'multi-selector': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
      'variant:secondary': SECONDARY_SELECTOR,
    },
    'complex-selector': {'variant:secondary': SECONDARY_COMPLEX_SELECTOR},
    typeahead: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },
    tokenizer: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': green.light[70]},
      'status:warning': {'--color-warning': yellow.light[80]},
      'status:error': {'--color-error': red.light[60]},
    },

    // Display sizes use Sarina — the signature buttery display
    // cursive, reserved for hero/marketing-scale text only.
    // Headings (h1–h6) and body still use Outfit (configured above
    // under typography.heading / typography.body). Same pattern
    // Gothic uses for its Manufacturing Consent display family.
    text: {
      'type:display-1': {
        fontFamily: 'Sarina, "Brush Script MT", "Snell Roundhand", cursive',
      },
      'type:display-2': {
        fontFamily: 'Sarina, "Brush Script MT", "Snell Roundhand", cursive',
      },
      'type:display-3': {
        fontFamily: 'Sarina, "Brush Script MT", "Snell Roundhand", cursive',
      },
    },
  },

  icons: butterIconRegistry,
});
