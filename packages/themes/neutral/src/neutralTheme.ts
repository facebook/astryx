// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  defineTheme,
  defineSyntaxTheme,
  type TokenValue,
} from '@astryxdesign/core/theme';
import {neutralIconRegistry} from './icons';
import {neutralPalettes} from './neutralPalettes';

const {blue, cyan, green, neutral, orange, pink, purple, red, teal, yellow} =
  neutralPalettes;
const withAlpha = (color: string, alpha: string) => `${color}${alpha}`;

const neutralSyntax = defineSyntaxTheme({
  name: 'astryx-neutral',
  tokens: {
    keyword: [purple.light[30], purple.light[80]],
    string: [green.light[30], green.light[80]],
    comment: [neutral.light[45], neutral.dark[65]],
    number: [orange.light[30], orange.dark[80]],
    function: [blue.light[30], blue.dark[80]],
    type: [purple.light[30], purple.light[80]],
    variable: [neutral.light[5], neutral.dark[90]],
    operator: [neutral.light[45], neutral.dark[65]],
    constant: [orange.light[30], orange.dark[80]],
    tag: [red.light[30], red.dark[80]],
    attribute: [yellow.light[30], yellow.light[80]],
    property: [teal.light[30], teal.light[80]],
    punctuation: [neutral.light[45], neutral.dark[65]],
    background: [neutral.light[100], neutral.dark[5]],
  },
});

const neutralLocalTokens: Record<string, TokenValue> = {
  '--astryx-theme-neutral-color-status-fill-accent': ['#0074e2', '#6d9cfe'],
  '--astryx-theme-neutral-color-status-fill-success': ['#198100', '#64af4c'],
  '--astryx-theme-neutral-color-status-fill-warning': '#ffce2f',
  '--astryx-theme-neutral-color-status-fill-error': ['#c9303a', '#ff705d'],
  '--astryx-theme-neutral-color-on-tint-neutral': ['#fafafa4D', '#0a0a0a4D'],
  '--astryx-theme-neutral-color-on-tint-overlay-hover': [
    '#fafafa1A',
    '#0a0a0a1A',
  ],
  '--astryx-theme-neutral-color-on-tint-overlay-pressed': [
    '#fafafa33',
    '#0a0a0a33',
  ],
};

const statusFill = {
  accent: 'var(--astryx-theme-neutral-color-status-fill-accent)',
  success: 'var(--astryx-theme-neutral-color-status-fill-success)',
  warning: 'var(--astryx-theme-neutral-color-status-fill-warning)',
  error: 'var(--astryx-theme-neutral-color-status-fill-error)',
} as const;

export const neutralTheme = defineTheme({
  name: 'neutral',
  localTokens: neutralLocalTokens,

  // Typography: Figtree across body, heading, and display sizes (display
  // size tokens inherit from heading.family). Monospace stays as the
  // platform default for code.
  // Scale: base=14, ratio=1.2. Bold weights on h3/h4 for subsection hierarchy.
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'ui-monospace',
      fallbacks:
        '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },

  // Motion: snappier than default to match shadcn/Tailwind conventions.
  // Produces: fast-min=95ms, fast=125ms, fast-max=165ms,
  //           medium-min=225ms, medium=300ms, medium-max=400ms.
  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: neutralSyntax,

  tokens: {
    '--color-background-surface': [neutral.light[100], neutral.dark[15]],
    '--color-background-body': [neutral.light[95], neutral.dark[10]],
    '--color-background-card': [neutral.light[100], neutral.dark[10]],
    '--color-background-popover': [neutral.light[100], neutral.dark[10]],
    '--color-background-muted': [neutral.light[95], neutral.dark[10]],

    '--color-accent': [neutral.light[15], neutral.dark[95]],
    '--color-accent-muted': [neutral.light[95], neutral.dark[15]],
    '--color-neutral': [
      withAlpha(neutral.light[0], '0F'),
      withAlpha(neutral.dark[100], '1A'),
    ],

    // Overlays (modal scrims, hover/pressed tints)
    '--color-overlay': [
      withAlpha(neutral.light[0], '80'),
      withAlpha(neutral.dark[0], 'CC'),
    ],
    '--color-overlay-hover': [
      withAlpha(neutral.light[0], '0D'),
      withAlpha(neutral.dark[100], '0D'),
    ],
    '--color-overlay-pressed': [
      withAlpha(neutral.light[0], '1A'),
      withAlpha(neutral.dark[100], '1A'),
    ],

    // Text
    '--color-text-primary': [neutral.light[5], neutral.dark[100]],
    '--color-text-secondary': [neutral.light[35], neutral.dark[65]],
    '--color-text-disabled': [neutral.light[65], neutral.dark[35]],
    '--color-text-accent': [neutral.light[15], neutral.dark[95]],
    '--color-on-dark': neutral.light[100],
    '--color-on-light': neutral.light[5],
    '--color-on-accent': [neutral.light[100], neutral.dark[5]],
    '--color-on-success': [neutral.light[100], neutral.dark[5]],
    '--color-on-error': [neutral.light[100], neutral.dark[5]],
    '--color-on-warning': neutral.light[5],

    // Icon
    '--color-icon-accent': [neutral.light[15], neutral.dark[95]],
    '--color-icon-primary': [neutral.light[5], neutral.dark[100]],
    '--color-icon-secondary': [neutral.light[50], neutral.dark[65]],
    '--color-icon-disabled': [neutral.light[65], neutral.dark[35]],

    '--color-success': [green.light[40], green.light[80]],
    '--color-error': [red.light[35], red.dark[85]],
    '--color-warning': [yellow.light[40], yellow.light[85]],
    '--color-success-muted': [green.dark[85], withAlpha(green.light[75], '3D')],
    '--color-error-muted': [red.light[85], withAlpha(red.dark[75], '3D')],
    '--color-warning-muted': [
      yellow.dark[90],
      withAlpha(yellow.light[75], '3D'),
    ],

    '--color-border': [
      withAlpha(neutral.light[0], '14'),
      withAlpha(neutral.dark[100], '1A'),
    ],
    '--color-border-emphasized': [neutral.light[85], neutral.dark[35]],

    // Effects
    '--color-skeleton': [neutral.light[95], neutral.dark[35]],
    '--color-shadow': [
      withAlpha(neutral.light[0], '1A'),
      withAlpha(neutral.dark[0], '4D'),
    ],
    '--color-tint-hover': ['black', 'white'],

    '--color-background-red': [red.light[85], withAlpha(red.dark[75], '3D')],
    '--color-border-red': [red.light[80], red.light[65]],
    '--color-icon-red': [red.light[30], red.dark[75]],
    '--color-text-red': [red.light[30], red.dark[85]],

    '--color-background-orange': [
      orange.light[85],
      withAlpha(orange.light[75], '3D'),
    ],
    '--color-border-orange': [orange.light[85], orange.dark[65]],
    '--color-icon-orange': [orange.light[30], orange.light[75]],
    '--color-text-orange': [orange.light[30], orange.dark[85]],

    '--color-background-yellow': [
      yellow.dark[90],
      withAlpha(yellow.light[75], '3D'),
    ],
    '--color-border-yellow': [yellow.dark[80], yellow.light[65]],
    '--color-icon-yellow': [yellow.light[30], yellow.light[75]],
    '--color-text-yellow': [yellow.light[30], yellow.light[85]],

    '--color-background-green': [
      green.dark[85],
      withAlpha(green.light[75], '3D'),
    ],
    '--color-border-green': [green.dark[80], green.light[65]],
    '--color-icon-green': [green.light[30], green.light[75]],
    '--color-text-green': [green.light[30], green.light[80]],

    '--color-background-teal': [teal.light[85], withAlpha(teal.dark[75], '3D')],
    '--color-border-teal': [teal.light[80], teal.dark[65]],
    '--color-icon-teal': [teal.light[30], teal.dark[75]],
    '--color-text-teal': [teal.light[30], teal.light[85]],

    '--color-background-cyan': [cyan.dark[85], withAlpha(cyan.dark[75], '3D')],
    '--color-border-cyan': [cyan.dark[80], cyan.dark[65]],
    '--color-icon-cyan': [cyan.light[30], cyan.dark[75]],
    '--color-text-cyan': [cyan.light[30], cyan.dark[85]],

    '--color-background-blue': [blue.light[85], withAlpha(blue.dark[75], '3D')],
    '--color-border-blue': [blue.light[80], blue.dark[65]],
    '--color-icon-blue': [blue.light[30], blue.dark[75]],
    '--color-text-blue': [blue.light[30], blue.dark[85]],

    '--color-background-purple': [
      purple.light[90],
      withAlpha(purple.light[75], '3D'),
    ],
    '--color-border-purple': [purple.light[85], purple.light[70]],
    '--color-icon-purple': [purple.light[30], purple.light[75]],
    '--color-text-purple': [purple.light[30], purple.dark[85]],

    '--color-background-pink': [pink.light[85], withAlpha(pink.dark[75], '3D')],
    '--color-border-pink': [pink.light[85], pink.light[70]],
    '--color-icon-pink': [pink.light[30], pink.dark[75]],
    '--color-text-pink': [pink.light[30], pink.dark[85]],

    '--color-background-gray': [neutral.light[90], 'var(--color-neutral)'],
    '--color-border-gray': [neutral.light[85], neutral.dark[15]],
    '--color-icon-gray': [neutral.light[35], neutral.dark[65]],
    '--color-text-gray': [neutral.light[15], neutral.dark[90]],

    // =========================================================================
    // Radius — slightly larger than default (kept as-is)
    // --radius-none and --radius-full are always fixed and must never be
    // scaled by a theme (see defineTheme's radius config docs) — 0 and
    // 9999px respectively, matching @astryxdesign/core's own defaults.
    // =========================================================================
    '--radius-none': '0px',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.625rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.75rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows
    //
    // Light mode: matches origin/main exactly (5%/10% low+med, 10%/15% high).
    // Subtle drops; light surfaces don't need rim highlights.
    //
    // Dark mode: deepened drops + an all-around 1px white inset that wraps
    // every edge ("Figma-style bezel"). The inset mimics ambient light
    // catching the surface's rim on every side, giving cards/popovers/modals
    // a substantial "lit from above" feel that drop shadows alone can't
    // achieve against a dark canvas.
    //   low  :  drops 25%/40% + 8%  white all-around inset
    //   med  :  drops 35%/50% + 12% white all-around inset
    //   high :  drops 50%/70% + 15% white all-around inset
    //
    // The inset layer uses light-dark(transparent, ...) so light mode is
    // unaffected — main's exact light values are preserved.
    // =========================================================================
    '--shadow-low':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 25%)), ' +
      '0 4px 8px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 40%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 8%))',
    '--shadow-med':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 35%)), ' +
      '0 4px 12px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 50%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 12%))',
    '--shadow-high':
      '0 4px 6px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 50%)), ' +
      '0 12px 24px light-dark(oklch(0 0 0 / 15%), oklch(0 0 0 / 70%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 15%))',
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${withAlpha(blue.light[50], '4D')}`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${withAlpha(blue.light[50], '80')}`,
    '--shadow-inset-success': `inset 0px 0px 0px 2px ${withAlpha(green.light[45], '4D')}`,
    '--shadow-inset-warning': `inset 0px 0px 0px 2px ${withAlpha(yellow.light[85], '4D')}`,
    '--shadow-inset-error': `inset 0px 0px 0px 2px ${withAlpha(red.light[55], '4D')}`,
  },

  components: {
    button: {
      'variant:destructive': {
        backgroundColor: 'var(--color-error-muted)',
        color: 'var(--color-error)',
      },
    },

    badge: {
      'variant:info': {
        backgroundColor: statusFill.accent,
        color: 'var(--color-on-accent)',
      },
      'variant:neutral': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
      'variant:success': {
        backgroundColor: statusFill.success,
        color: 'var(--color-on-success)',
      },
      'variant:warning': {
        backgroundColor: statusFill.warning,
        color: 'var(--color-on-warning)',
      },
      'variant:error': {
        backgroundColor: statusFill.error,
        color: 'var(--color-on-error)',
      },

      'variant:red': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
      },
      'variant:orange': {
        backgroundColor: 'var(--color-background-orange)',
        color: 'var(--color-text-orange)',
      },
      'variant:yellow': {
        backgroundColor: 'var(--color-background-yellow)',
        color: 'var(--color-text-yellow)',
      },
      'variant:green': {
        backgroundColor: 'var(--color-background-green)',
        color: 'var(--color-text-green)',
      },
      'variant:teal': {
        backgroundColor: 'var(--color-background-teal)',
        color: 'var(--color-text-teal)',
      },
      'variant:cyan': {
        backgroundColor: 'var(--color-background-cyan)',
        color: 'var(--color-text-cyan)',
      },
      'variant:blue': {
        backgroundColor: 'var(--color-background-blue)',
        color: 'var(--color-text-blue)',
      },
      'variant:purple': {
        backgroundColor: 'var(--color-background-purple)',
        color: 'var(--color-text-purple)',
      },
      'variant:pink': {
        backgroundColor: 'var(--color-background-pink)',
        color: 'var(--color-text-pink)',
      },
      'variant:gray': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
    },

    statusdot: {
      'variant:success': {backgroundColor: statusFill.success},
      'variant:warning': {backgroundColor: statusFill.warning},
      'variant:error': {backgroundColor: statusFill.error},
      'variant:accent': {backgroundColor: statusFill.accent},
    },

    'avatar-status-dot': {
      'variant:success': {backgroundColor: statusFill.success},
      'variant:error': {backgroundColor: statusFill.error},
    },

    // Give the Neutral segmented control a roomier inset without changing its
    // outside height. The selected item stays flat against the tinted track.
    'segmented-control': {
      base: {
        padding: 'var(--spacing-1)',
      },
    },
    'segmented-control-item': {
      'size:sm': {
        height: 'calc(var(--size-element-sm) - 8px)',
      },
      'size:md': {
        height: 'calc(var(--size-element-md) - 8px)',
      },
      'size:lg': {
        height: 'calc(var(--size-element-lg) - 8px)',
      },
      selected: {
        boxShadow: 'none',
      },
    },

    banner: {
      base: {
        '--color-neutral': 'var(--astryx-theme-neutral-color-on-tint-neutral)',
        '--color-overlay-hover':
          'var(--astryx-theme-neutral-color-on-tint-overlay-hover)',
        '--color-overlay-pressed':
          'var(--astryx-theme-neutral-color-on-tint-overlay-pressed)',
      },
      'status:info': {
        '--color-accent-muted': 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
      },
      'status:success': {
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
        '--color-success': 'var(--color-text-green)',
      },
      'status:warning': {
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

    'step-indicator': {
      'status:accent': {'--color-accent': statusFill.accent},
      'status:success': {'--color-success': statusFill.success},
      'status:warning': {'--color-warning': statusFill.warning},
      'status:error': {'--color-error': statusFill.error},
    },

    switch: {
      base: {
        '--color-background-gray': 'var(--color-border-emphasized)',
      },
    },

    progressbar: {
      base: {
        '--color-background-muted': 'var(--color-border-emphasized)',
      },
      'variant:accent': {
        '--color-accent': statusFill.accent,
      },
      'variant:success': {
        '--color-success': statusFill.success,
      },
      'variant:warning': {
        '--color-warning': statusFill.warning,
      },
      'variant:error': {
        '--color-error': statusFill.error,
      },
    },

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

    // Heading and text component overrides are auto-generated by typography.scale.
    // h3/h4 bold weights come from typography.heading.weights above.
  },

  icons: neutralIconRegistry,
});
