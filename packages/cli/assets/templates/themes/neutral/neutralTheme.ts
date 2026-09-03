// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Neutral theme with a grayscale foundation and approved OKLCH color ramps. */

import {
  defineTheme,
  defineSyntaxTheme,
  defineTonalPalettes,
  type TokenValue,
} from '@astryxdesign/core/theme';
import {neutralIconRegistry} from './icons';

/** Approved tonal palette. Prefer semantic tokens before selecting a stop. */
export const neutralPalettes = defineTonalPalettes({
  neutral: {
    light: {
      0: '#000000',
      5: '#111111',
      10: '#1b1b1b',
      15: '#262626',
      20: '#303030',
      25: '#3b3b3b',
      30: '#474747',
      35: '#525252',
      40: '#5e5e5e',
      45: '#6a6a6a',
      50: '#777777',
      55: '#848484',
      60: '#919191',
      65: '#9e9e9e',
      70: '#ababab',
      75: '#b9b9b9',
      80: '#c6c6c6',
      85: '#d4d4d4',
      90: '#e2e2e2',
      95: '#f1f1f1',
      100: '#ffffff',
    },
    dark: {
      0: '#111111',
      5: '#1b1b1b',
      10: '#262626',
      15: '#303030',
      20: '#3b3b3b',
      25: '#474747',
      30: '#525252',
      35: '#5e5e5e',
      40: '#6a6a6a',
      45: '#777777',
      50: '#848484',
      55: '#919191',
      60: '#9e9e9e',
      65: '#ababab',
      70: '#b9b9b9',
      75: '#c6c6c6',
      80: '#d4d4d4',
      85: '#dedede',
      90: '#e7e7e7',
      95: '#f1f1f1',
      100: '#ffffff',
    },
    description:
      'Pure grayscale foundation for surfaces, text, borders, and neutral states.',
  },
  red: {
    light: {
      0: '#000000',
      5: '#2c0000',
      10: '#3e0002',
      15: '#500004',
      20: '#620008',
      25: '#76000c',
      30: '#8a0011',
      35: '#9e0017',
      40: '#b3001b',
      45: '#c71024',
      50: '#d62830',
      55: '#e53c3e',
      60: '#f44c4b',
      65: '#ff635e',
      70: '#ff7e78',
      75: '#ff9790',
      80: '#ffaea7',
      85: '#ffc4be',
      90: '#ffd8d3',
      95: '#feecea',
      100: '#ffffff',
      hue: 25,
      chroma: 0.0767,
    },
    dark: {
      0: '#2c0000',
      5: '#3e0002',
      10: '#500004',
      15: '#620008',
      20: '#76000c',
      25: '#890012',
      30: '#9b0e1a',
      35: '#ab2126',
      40: '#ba3132',
      45: '#ca3f3e',
      50: '#d94e4a',
      55: '#e85c57',
      60: '#f76a65',
      65: '#f7847d',
      70: '#f99c94',
      75: '#fab1aa',
      80: '#fac5c0',
      85: '#fbd3cf',
      90: '#fce0dc',
      95: '#fcedeb',
      100: '#ffffff',
      hue: 25,
      chroma: 0.0767,
    },
    semantic: 'error',
    description: 'Error, destructive, and red categorical states.',
  },
  orange: {
    light: {
      0: '#000000',
      5: '#200b00',
      10: '#2d1500',
      15: '#3b1e00',
      20: '#492700',
      25: '#583100',
      30: '#673a00',
      35: '#774500',
      40: '#884f00',
      45: '#985900',
      50: '#aa6400',
      55: '#bb6f00',
      60: '#cd7a00',
      65: '#df8600',
      70: '#f19100',
      75: '#f6a44b',
      80: '#f7b87a',
      85: '#f8cba0',
      90: '#faddc2',
      95: '#fbeee3',
      100: '#ffffff',
      hue: 65,
      chroma: 0.0826,
    },
    dark: {
      0: '#200b00',
      5: '#2d1500',
      10: '#3b1e00',
      15: '#492700',
      20: '#583100',
      25: '#673a00',
      30: '#774500',
      35: '#884f00',
      40: '#985900',
      45: '#aa6400',
      50: '#bb6f00',
      55: '#cd7a00',
      60: '#df8600',
      65: '#eb952c',
      70: '#eea75f',
      75: '#f2ba85',
      80: '#f4cca7',
      85: '#f6d8bc',
      90: '#f8e3d1',
      95: '#faefe5',
      100: '#ffffff',
      hue: 65,
      chroma: 0.0826,
    },
    description: 'Orange categorical states.',
  },
  yellow: {
    light: {
      0: '#000000',
      5: '#190f00',
      10: '#251a00',
      15: '#312400',
      20: '#3d2e00',
      25: '#4b3900',
      30: '#584400',
      35: '#664f00',
      40: '#745b00',
      45: '#836700',
      50: '#927300',
      55: '#a17f00',
      60: '#b18c00',
      65: '#c09800',
      70: '#d0a500',
      75: '#e1b300',
      80: '#f1c000',
      85: '#f9d05b',
      90: '#f9e19e',
      95: '#fbf0d3',
      100: '#ffffff',
      hue: 90,
      chroma: 0.1534,
    },
    dark: {
      0: '#190f00',
      5: '#251a00',
      10: '#312400',
      15: '#3d2e00',
      20: '#4b3900',
      25: '#584400',
      30: '#664f00',
      35: '#745b00',
      40: '#836700',
      45: '#927300',
      50: '#a17f00',
      55: '#b18c00',
      60: '#c09800',
      65: '#d0a500',
      70: '#e1b300',
      75: '#f1c000',
      80: '#f4d170',
      85: '#f6dc97',
      90: '#f7e6b8',
      95: '#f9f0d7',
      100: '#ffffff',
      hue: 90,
      chroma: 0.1534,
    },
    semantic: 'warning',
    description: 'Warning and yellow categorical states.',
  },
  green: {
    light: {
      0: '#000000',
      5: '#001800',
      10: '#002401',
      15: '#003004',
      20: '#003d08',
      25: '#004a0c',
      30: '#005711',
      35: '#006516',
      40: '#00731b',
      45: '#008120',
      50: '#009026',
      55: '#079f2b',
      60: '#27ad3c',
      65: '#3dba4b',
      70: '#67c46d',
      75: '#85cd88',
      80: '#a1d7a1',
      85: '#bbe1bb',
      90: '#d2ead2',
      95: '#eaf4ea',
      100: '#ffffff',
      hue: 145,
      chroma: 0.0708,
    },
    dark: {
      0: '#001800',
      5: '#002401',
      10: '#003004',
      15: '#003d08',
      20: '#004a0c',
      25: '#005711',
      30: '#006518',
      35: '#00731c',
      40: '#0c8124',
      45: '#228e31',
      50: '#339c3f',
      55: '#43a94c',
      60: '#53b75a',
      65: '#74c177',
      70: '#8ecb8f',
      75: '#a6d5a6',
      80: '#bedfbe',
      85: '#cee6cd',
      90: '#dcecdb',
      95: '#ebf4eb',
      100: '#ffffff',
      hue: 145,
      chroma: 0.0708,
    },
    semantic: 'success',
    description: 'Success and green categorical states.',
  },
  teal: {
    light: {
      0: '#000000',
      5: '#001612',
      10: '#00221c',
      15: '#002e27',
      20: '#003a31',
      25: '#00463d',
      30: '#005348',
      35: '#006154',
      40: '#006e60',
      45: '#007c6d',
      50: '#008b79',
      55: '#009986',
      60: '#00a893',
      65: '#00b7a1',
      70: '#00c6ae',
      75: '#34d4bc',
      80: '#76dcc9',
      85: '#a2e4d6',
      90: '#c3ede3',
      95: '#e4f5f1',
      100: '#ffffff',
      hue: 180,
      chroma: 0.0767,
    },
    dark: {
      0: '#001612',
      5: '#00221c',
      10: '#002e27',
      15: '#003a31',
      20: '#00463d',
      25: '#005348',
      30: '#006154',
      35: '#006e60',
      40: '#007c6d',
      45: '#008b79',
      50: '#009986',
      55: '#00a893',
      60: '#00b7a1',
      65: '#00c6ae',
      70: '#55d1bb',
      75: '#84dac8',
      80: '#a8e2d6',
      85: '#bee9df',
      90: '#d2eee8',
      95: '#e6f5f1',
      100: '#ffffff',
      hue: 180,
      chroma: 0.0767,
    },
    description: 'Teal categorical states.',
  },
  cyan: {
    light: {
      0: '#000000',
      5: '#00151b',
      10: '#002028',
      15: '#002c35',
      20: '#003742',
      25: '#004350',
      30: '#00505f',
      35: '#005d6d',
      40: '#006a7d',
      45: '#00788c',
      50: '#00869c',
      55: '#0094ac',
      60: '#00a2bd',
      65: '#00b1ce',
      70: '#00bfdf',
      75: '#29ceed',
      80: '#71d7ef',
      85: '#9ee1f1',
      90: '#c2eaf5',
      95: '#e3f4f9',
      100: '#ffffff',
      hue: 215,
      chroma: 0.0767,
    },
    dark: {
      0: '#00151b',
      5: '#002028',
      10: '#002c35',
      15: '#003742',
      20: '#004350',
      25: '#00505f',
      30: '#005d6d',
      35: '#006a7d',
      40: '#00788c',
      45: '#00869c',
      50: '#0094ac',
      55: '#00a2bd',
      60: '#00b1ce',
      65: '#00bfdf',
      70: '#50cbe7',
      75: '#80d6ea',
      80: '#a7dfed',
      85: '#bce7f1',
      90: '#d1edf5',
      95: '#e5f4f8',
      100: '#ffffff',
      hue: 215,
      chroma: 0.0767,
    },
    description: 'Cyan categorical states.',
  },
  blue: {
    light: {
      0: '#000000',
      5: '#000f30',
      10: '#001a41',
      15: '#002452',
      20: '#002f64',
      25: '#003a78',
      30: '#00458c',
      35: '#0050a1',
      40: '#005cb6',
      45: '#0068cc',
      50: '#0074e2',
      55: '#0081f9',
      60: '#2f90ff',
      65: '#529fff',
      70: '#6eaeff',
      75: '#87bcff',
      80: '#a0caff',
      85: '#b8d7ff',
      90: '#d0e5ff',
      95: '#e8f2ff',
      100: '#ffffff',
      hue: 255,
      chroma: 0.1003,
    },
    dark: {
      0: '#000f30',
      5: '#001a41',
      10: '#002452',
      15: '#002f64',
      20: '#003a78',
      25: '#00458c',
      30: '#0050a1',
      35: '#005cb6',
      40: '#0068cc',
      45: '#0074e2',
      50: '#0080f9',
      55: '#2f90ff',
      60: '#529fff',
      65: '#6eaeff',
      70: '#87bcff',
      75: '#a0caff',
      80: '#b8d7ff',
      85: '#c8e0ff',
      90: '#d8e9ff',
      95: '#e8f2ff',
      100: '#ffffff',
      hue: 255,
      chroma: 0.1003,
    },
    semantic: 'info',
    description: 'Information, accent, and blue categorical states.',
  },
  purple: {
    light: {
      0: '#000000',
      5: '#22002a',
      10: '#31003b',
      15: '#40004c',
      20: '#4f005e',
      25: '#5f0070',
      30: '#6f0782',
      35: '#7c1a90',
      40: '#8b2a9f',
      45: '#9838ad',
      50: '#a746bb',
      55: '#b455c9',
      60: '#c263d7',
      65: '#cf71e6',
      70: '#d58ae6',
      75: '#dc9fe9',
      80: '#e1b3ed',
      85: '#e8c7ef',
      90: '#f0dbf4',
      95: '#f6edf8',
      100: '#ffffff',
      hue: 320,
      chroma: 0.0708,
    },
    dark: {
      0: '#22002a',
      5: '#31003b',
      10: '#40004c',
      15: '#4f005d',
      20: '#5c116b',
      25: '#6a1e78',
      30: '#762b87',
      35: '#843895',
      40: '#9244a3',
      45: '#a051b1',
      50: '#ae5fc0',
      55: '#bb6cce',
      60: '#c979dc',
      65: '#d090de',
      70: '#d7a3e3',
      75: '#dfb6e8',
      80: '#e6c9ec',
      85: '#ebd5ef',
      90: '#f0e2f4',
      95: '#f6eef7',
      100: '#ffffff',
      hue: 320,
      chroma: 0.0708,
    },
    description: 'Purple categorical states.',
  },
  pink: {
    light: {
      0: '#000000',
      5: '#290013',
      10: '#3b001e',
      15: '#4b0028',
      20: '#5d0034',
      25: '#70003f',
      30: '#82004b',
      35: '#960058',
      40: '#a81064',
      45: '#b72470',
      50: '#c6357d',
      55: '#d5458a',
      60: '#e45397',
      65: '#f363a4',
      70: '#f47fb0',
      75: '#f697bc',
      80: '#f7adc9',
      85: '#f9c4d6',
      90: '#fad7e4',
      95: '#fbecf1',
      100: '#ffffff',
      hue: 355,
      chroma: 0.0708,
    },
    dark: {
      0: '#290013',
      5: '#3b001e',
      10: '#4b0028',
      15: '#5d0034',
      20: '#6f003f',
      25: '#800a4a',
      30: '#8f1b56',
      35: '#9e2b63',
      40: '#ad3870',
      45: '#bc467c',
      50: '#cb5389',
      55: '#d96196',
      60: '#e86ea3',
      65: '#eb87b0',
      70: '#ee9cbd',
      75: '#f1b1c9',
      80: '#f4c6d6',
      85: '#f6d3df',
      90: '#f8e0e8',
      95: '#faedf1',
      100: '#ffffff',
      hue: 355,
      chroma: 0.0708,
    },
    description: 'Pink categorical states.',
  },
});

/** Syntax colors are selected from the same palette stops as categorical icons. */
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
  palettes: neutralPalettes,

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

  // Core and categorical tokens retain explicit colors selected from the
  // approved palette. Theme-local component status fills remain independently
  // approved semantic colors.
  tokens: {
    // =========================================================================
    // Core — explicit colors selected from neutralPalettes.neutral.
    // =========================================================================

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
    // Contrast: neutral accent is near-black (L) / near-white (D)
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
