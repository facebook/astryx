// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  defineTheme,
  defineSyntaxTheme,
  type TokenValue,
} from '@astryxdesign/core/theme';
import {neutralIconRegistry} from './icons';

const neutralSyntax = defineSyntaxTheme({
  name: 'astryx-neutral',
  tokens: {
    keyword: ['#6f0782', '#e6c9ec'],
    string: ['#005711', '#bedfbe'],
    comment: ['#777777', '#9e9e9e'],
    number: ['#673a00', '#f4cca7'],
    function: ['#00458c', '#b8d7ff'],
    type: ['#6f0782', '#e6c9ec'],
    variable: ['#1b1b1b', '#e2e2e2'],
    operator: ['#777777', '#9e9e9e'],
    constant: ['#673a00', '#f4cca7'],
    tag: ['#8a0011', '#fac5c0'],
    attribute: ['#584400', '#f4d170'],
    property: ['#005348', '#a8e2d6'],
    // #a3a3a3/#525252 (this pair's own disabled-text stop) failed WCAG AA
    // against the syntax background: 2.42:1 light, 2.53:1 dark. #5386.
    punctuation: ['#6e6e6e', '#a0a0a0'], // neutral, 4.89:1 / 7.57:1
    background: ['#f1f1f1', '#000000'],
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
    // Core neutrals

    // Dark cards and popovers match the body and rely on elevation; interactive
    // surfaces use the next lighter neutral stop.
    '--color-background-surface': ['#ffffff', '#262626'],
    '--color-background-body': ['#f1f1f1', '#1b1b1b'],
    '--color-background-card': ['#ffffff', '#1b1b1b'],
    '--color-background-popover': ['#ffffff', '#1b1b1b'],
    '--color-background-muted': ['#f1f1f1', '#1b1b1b'],

    // Accent + neutral surface tints (sit alongside backgrounds)
    '--color-accent': ['#262626', '#e7e7e7'],
    '--color-accent-muted': ['#f1f1f1', '#262626'],
    '--color-neutral': ['#0000000F', '#ffffff1A'],

    // Overlays (modal scrims, hover/pressed tints)
    '--color-overlay': ['#00000080', '#000000CC'],
    '--color-overlay-hover': ['#0000000D', '#ffffff0D'],
    '--color-overlay-pressed': ['#0000001A', '#ffffff1A'],

    // Text
    '--color-text-primary': ['#1b1b1b', '#f1f1f1'],
    // Light secondary is stop 35 (#525252), not stop 50 (#777777): stop 50 only
    // reaches 4.19:1 on the stop 95 body (#f1f1f1), just under WCAG AA 4.5:1.
    // 600 clears it (6.9:1 on body, 7.8:1 on card). Dark stays neutral-400.
    '--color-text-secondary': ['#525252', '#9e9e9e'],
    '--color-text-disabled': ['#9e9e9e', '#525252'],
    '--color-text-accent': ['#262626', '#e7e7e7'],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#1b1b1b',
    '--color-on-accent': ['#ffffff', '#1b1b1b'],
    '--color-on-success': ['#ffffff', '#1b1b1b'],
    '--color-on-error': ['#ffffff', '#1b1b1b'],
    '--color-on-warning': '#1b1b1b',

    // Icon
    '--color-icon-accent': ['#262626', '#e7e7e7'],
    '--color-icon-primary': ['#1b1b1b', '#f1f1f1'],
    '--color-icon-secondary': ['#777777', '#9e9e9e'],
    '--color-icon-disabled': ['#9e9e9e', '#525252'],

    // Status colors pair dark foregrounds with pastel surfaces in light mode,
    // and light foregrounds with translucent hue surfaces in dark mode.
    '--color-success': ['#005711', '#bedfbe'],
    // Error uses stronger stops to preserve contrast through pressed overlays.
    '--color-error': ['#76000c', '#fbd3cf'],
    '--color-warning': ['#584400', '#f4d170'],
    '--color-success-muted': ['#bbe1bb', '#8ecb8f3D'],
    '--color-error-muted': ['#ffc4be', '#f99c943D'],
    '--color-warning-muted': ['#f9e19e', '#e1b3003D'],

    // Borders retain the released Neutral appearance with colors selected from
    // approved stops. Components that require a 3:1 identifying boundary
    // should provide that treatment through a component-specific mapping.
    '--color-border': ['#00000014', '#ffffff1A'],
    '--color-border-emphasized': ['#d4d4d4', '#525252'],

    // Effects
    '--color-skeleton': ['#e2e2e2', '#525252'],
    '--color-shadow': ['#0000001A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical roles use pastel surfaces and dark text in light mode, then
    // translucent hue surfaces and light text in dark mode.
    '--color-background-red': ['#ffc4be', '#f99c943D'],
    '--color-border-red': ['#ffaea7', '#f76a65'],
    '--color-icon-red': ['#8a0011', '#f99c94'],
    '--color-text-red': ['#76000c', '#fbd3cf'],

    '--color-background-orange': ['#f8cba0', '#eea75f3D'],
    '--color-border-orange': ['#f7b87a', '#df8600'],
    '--color-icon-orange': ['#673a00', '#eea75f'],
    '--color-text-orange': ['#673a00', '#f4cca7'],

    '--color-background-yellow': ['#f9e19e', '#e1b3003D'],
    '--color-border-yellow': ['#f1c000', '#c09800'],
    '--color-icon-yellow': ['#584400', '#e1b300'],
    '--color-text-yellow': ['#584400', '#f4d170'],

    '--color-background-green': ['#bbe1bb', '#8ecb8f3D'],
    '--color-border-green': ['#a1d7a1', '#53b75a'],
    '--color-icon-green': ['#005711', '#8ecb8f'],
    '--color-text-green': ['#005711', '#bedfbe'],

    '--color-background-teal': ['#a2e4d6', '#55d1bb3D'],
    '--color-border-teal': ['#76dcc9', '#00b7a1'],
    '--color-icon-teal': ['#005348', '#55d1bb'],
    '--color-text-teal': ['#005348', '#a8e2d6'],

    '--color-background-cyan': ['#9ee1f1', '#50cbe73D'],
    '--color-border-cyan': ['#71d7ef', '#00b1ce'],
    '--color-icon-cyan': ['#00505f', '#50cbe7'],
    '--color-text-cyan': ['#00505f', '#a7dfed'],

    '--color-background-blue': ['#b8d7ff', '#87bcff3D'],
    '--color-border-blue': ['#a0caff', '#529fff'],
    '--color-icon-blue': ['#00458c', '#87bcff'],
    '--color-text-blue': ['#00458c', '#b8d7ff'],

    '--color-background-purple': ['#e8c7ef', '#d7a3e33D'],
    '--color-border-purple': ['#e1b3ed', '#c979dc'],
    '--color-icon-purple': ['#6f0782', '#d7a3e3'],
    '--color-text-purple': ['#6f0782', '#e6c9ec'],

    '--color-background-pink': ['#f9c4d6', '#ee9cbd3D'],
    '--color-border-pink': ['#f7adc9', '#e86ea3'],
    '--color-icon-pink': ['#82004b', '#ee9cbd'],
    '--color-text-pink': ['#82004b', '#f4c6d6'],

    // Gray uses the neutral categorical surface rather than a chromatic ramp.
    '--color-background-gray': ['#e2e2e2', 'var(--color-neutral)'],
    '--color-border-gray': ['#d4d4d4', '#262626'],
    '--color-icon-gray': ['#525252', '#9e9e9e'],
    '--color-text-gray': ['#262626', '#e7e7e7'],

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
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${'#0068cc4D'}`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${'#0068cc80'}`,
    '--shadow-inset-success': `inset 0px 0px 0px 2px ${'#0081204D'}`,
    '--shadow-inset-warning': `inset 0px 0px 0px 2px ${'#f9d05b4D'}`,
    '--shadow-inset-error': `inset 0px 0px 0px 2px ${'#d628304D'}`,
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
