// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Neutral theme with a grayscale foundation and approved OKLCH color ramps. */

import {
  defineTheme,
  defineSyntaxTheme,
  defineTonalPalettes,
  type TonalPaletteTone,
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

function getPaletteStop(
  family: keyof typeof neutralPalettes,
  stop: TonalPaletteTone,
  mode: 'light' | 'dark' = 'light',
): string {
  return neutralPalettes[family][mode][stop];
}

function lightDark(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

function withAlpha(
  color: string,
  alpha: '0D' | '0F' | '14' | '1A' | '33' | '3D' | '4D' | '80' | 'CC',
): string {
  return `${color}${alpha}`;
}

/** Syntax colors use the same palette stops as categorical icons. */
const neutralSyntax = defineSyntaxTheme({
  name: 'xds-neutral',
  tokens: {
    keyword: [
      getPaletteStop('purple', 30),
      getPaletteStop('purple', 80, 'dark'),
    ],
    string: [getPaletteStop('green', 30), getPaletteStop('green', 80, 'dark')],
    comment: [
      getPaletteStop('neutral', 50),
      getPaletteStop('neutral', 65, 'light'),
    ],
    number: [
      getPaletteStop('orange', 30),
      getPaletteStop('orange', 80, 'dark'),
    ],
    function: [getPaletteStop('blue', 30), getPaletteStop('blue', 80, 'dark')],
    type: [getPaletteStop('purple', 30), getPaletteStop('purple', 80, 'dark')],
    variable: [
      getPaletteStop('neutral', 10),
      getPaletteStop('neutral', 90, 'light'),
    ],
    operator: [
      getPaletteStop('neutral', 50),
      getPaletteStop('neutral', 65, 'light'),
    ],
    constant: [
      getPaletteStop('orange', 30),
      getPaletteStop('orange', 80, 'dark'),
    ],
    tag: [getPaletteStop('red', 30), getPaletteStop('red', 80, 'dark')],
    attribute: [
      getPaletteStop('yellow', 30),
      getPaletteStop('yellow', 80, 'dark'),
    ],
    property: [getPaletteStop('teal', 30), getPaletteStop('teal', 80, 'dark')],
    // #a3a3a3/#525252 (this pair's own disabled-text stop) failed WCAG AA
    // against the syntax background: 2.42:1 light, 2.53:1 dark. #5386.
    punctuation: ['#6e6e6e', '#a0a0a0'], // neutral, 4.89:1 / 7.57:1
    background: [
      getPaletteStop('neutral', 95, 'light'),
      getPaletteStop('neutral', 0),
    ],
  },
});

export const neutralTheme = defineTheme({
  name: 'neutral',
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

  // All mapped colors come from `palettes`; syntax punctuation is the only
  // documented opaque exception.
  tokens: {
    // =========================================================================
    // Core — exact numbered stops from neutralPalettes.neutral.
    // =========================================================================

    // Dark cards and popovers match the body and rely on elevation; interactive
    // surfaces use the next lighter neutral stop.
    '--color-background-surface': [
      getPaletteStop('neutral', 100),
      getPaletteStop('neutral', 10, 'dark'),
    ],
    '--color-background-body': [
      getPaletteStop('neutral', 95),
      getPaletteStop('neutral', 5, 'dark'),
    ],
    '--color-background-card': [
      getPaletteStop('neutral', 100),
      getPaletteStop('neutral', 5, 'dark'),
    ],
    '--color-background-popover': [
      getPaletteStop('neutral', 100),
      getPaletteStop('neutral', 5, 'dark'),
    ],
    '--color-background-muted': [
      getPaletteStop('neutral', 95),
      getPaletteStop('neutral', 5, 'dark'),
    ],

    // Accent + neutral surface tints (sit alongside backgrounds)
    '--color-accent': [
      getPaletteStop('neutral', 15),
      getPaletteStop('neutral', 90, 'dark'),
    ],
    '--color-accent-muted': [
      getPaletteStop('neutral', 95),
      getPaletteStop('neutral', 10, 'dark'),
    ],
    '--color-neutral': [
      withAlpha(getPaletteStop('neutral', 0), '0F'),
      withAlpha(getPaletteStop('neutral', 100), '1A'),
    ],

    // Overlays (modal scrims, hover/pressed tints)
    '--color-overlay': [
      withAlpha(getPaletteStop('neutral', 0), '80'),
      withAlpha(getPaletteStop('neutral', 0), 'CC'),
    ],
    '--color-overlay-hover': [
      withAlpha(getPaletteStop('neutral', 0), '0D'),
      withAlpha(getPaletteStop('neutral', 100), '0D'),
    ],
    '--color-overlay-pressed': [
      withAlpha(getPaletteStop('neutral', 0), '1A'),
      withAlpha(getPaletteStop('neutral', 100), '1A'),
    ],

    // Text
    '--color-text-primary': [
      getPaletteStop('neutral', 10),
      getPaletteStop('neutral', 95),
    ],
    // Light secondary is stop 35 (#525252), not stop 50 (#777777): stop 50 only
    // reaches 4.19:1 on the stop 95 body (#f1f1f1), just under WCAG AA 4.5:1.
    // 600 clears it (6.9:1 on body, 7.8:1 on card). Dark stays neutral-400.
    '--color-text-secondary': [
      getPaletteStop('neutral', 35),
      getPaletteStop('neutral', 65),
    ],
    '--color-text-disabled': [
      getPaletteStop('neutral', 65),
      getPaletteStop('neutral', 35),
    ],
    '--color-text-accent': [
      getPaletteStop('neutral', 15),
      getPaletteStop('neutral', 90, 'dark'),
    ],
    '--color-on-dark': getPaletteStop('neutral', 100),
    '--color-on-light': getPaletteStop('neutral', 10),
    // Contrast: neutral accent is near-black (L) / near-white (D)
    '--color-on-accent': [
      getPaletteStop('neutral', 100),
      getPaletteStop('neutral', 10),
    ],
    '--color-on-success': [
      getPaletteStop('neutral', 100),
      getPaletteStop('neutral', 10),
    ],
    '--color-on-error': [
      getPaletteStop('neutral', 100),
      getPaletteStop('neutral', 10),
    ],
    '--color-on-warning': getPaletteStop('neutral', 10),

    // Icon
    '--color-icon-accent': [
      getPaletteStop('neutral', 15),
      getPaletteStop('neutral', 90, 'dark'),
    ],
    '--color-icon-primary': [
      getPaletteStop('neutral', 10),
      getPaletteStop('neutral', 95),
    ],
    '--color-icon-secondary': [
      getPaletteStop('neutral', 50),
      getPaletteStop('neutral', 65),
    ],
    '--color-icon-disabled': [
      getPaletteStop('neutral', 65),
      getPaletteStop('neutral', 35),
    ],

    // Status colors pair dark foregrounds with pastel surfaces in light mode,
    // and light foregrounds with translucent hue surfaces in dark mode.
    '--color-success': [
      getPaletteStop('green', 30),
      getPaletteStop('green', 80, 'dark'),
    ],
    // Error uses stronger stops to preserve contrast through pressed overlays.
    '--color-error': [
      getPaletteStop('red', 25),
      getPaletteStop('red', 85, 'dark'),
    ],
    '--color-warning': [
      getPaletteStop('yellow', 30),
      getPaletteStop('yellow', 80, 'dark'),
    ],
    '--color-success-muted': [
      getPaletteStop('green', 85),
      withAlpha(getPaletteStop('green', 70, 'dark'), '3D'),
    ],
    '--color-error-muted': [
      getPaletteStop('red', 85),
      withAlpha(getPaletteStop('red', 70, 'dark'), '3D'),
    ],
    '--color-warning-muted': [
      getPaletteStop('yellow', 90),
      withAlpha(getPaletteStop('yellow', 70, 'dark'), '3D'),
    ],

    // Borders retain the released Neutral appearance while referencing exact
    // approved stops. Components that require a 3:1 identifying boundary
    // should provide that treatment through a component-specific mapping.
    '--color-border': [
      withAlpha(getPaletteStop('neutral', 0), '14'),
      withAlpha(getPaletteStop('neutral', 100), '1A'),
    ],
    '--color-border-emphasized': [
      getPaletteStop('neutral', 85),
      getPaletteStop('neutral', 30, 'dark'),
    ],

    // Effects
    '--color-skeleton': [
      getPaletteStop('neutral', 90),
      getPaletteStop('neutral', 30, 'dark'),
    ],
    '--color-shadow': [
      withAlpha(getPaletteStop('neutral', 0), '1A'),
      withAlpha(getPaletteStop('neutral', 0), '4D'),
    ],
    '--color-tint-hover': ['black', 'white'],

    // Categorical roles use pastel surfaces and dark text in light mode, then
    // translucent hue surfaces and light text in dark mode.
    '--color-background-red': [
      getPaletteStop('red', 85),
      withAlpha(getPaletteStop('red', 70, 'dark'), '3D'),
    ],
    '--color-border-red': [
      getPaletteStop('red', 80),
      getPaletteStop('red', 60, 'dark'),
    ],
    '--color-icon-red': [
      getPaletteStop('red', 30),
      getPaletteStop('red', 70, 'dark'),
    ],
    '--color-text-red': [
      getPaletteStop('red', 25),
      getPaletteStop('red', 85, 'dark'),
    ],

    '--color-background-orange': [
      getPaletteStop('orange', 85),
      withAlpha(getPaletteStop('orange', 70, 'dark'), '3D'),
    ],
    '--color-border-orange': [
      getPaletteStop('orange', 80),
      getPaletteStop('orange', 60, 'dark'),
    ],
    '--color-icon-orange': [
      getPaletteStop('orange', 30),
      getPaletteStop('orange', 70, 'dark'),
    ],
    '--color-text-orange': [
      getPaletteStop('orange', 30),
      getPaletteStop('orange', 80, 'dark'),
    ],

    '--color-background-yellow': [
      getPaletteStop('yellow', 90),
      withAlpha(getPaletteStop('yellow', 70, 'dark'), '3D'),
    ],
    '--color-border-yellow': [
      getPaletteStop('yellow', 80),
      getPaletteStop('yellow', 60, 'dark'),
    ],
    '--color-icon-yellow': [
      getPaletteStop('yellow', 30),
      getPaletteStop('yellow', 70, 'dark'),
    ],
    '--color-text-yellow': [
      getPaletteStop('yellow', 30),
      getPaletteStop('yellow', 80, 'dark'),
    ],

    '--color-background-green': [
      getPaletteStop('green', 85),
      withAlpha(getPaletteStop('green', 70, 'dark'), '3D'),
    ],
    '--color-border-green': [
      getPaletteStop('green', 80),
      getPaletteStop('green', 60, 'dark'),
    ],
    '--color-icon-green': [
      getPaletteStop('green', 30),
      getPaletteStop('green', 70, 'dark'),
    ],
    '--color-text-green': [
      getPaletteStop('green', 30),
      getPaletteStop('green', 80, 'dark'),
    ],

    '--color-background-teal': [
      getPaletteStop('teal', 85),
      withAlpha(getPaletteStop('teal', 70, 'dark'), '3D'),
    ],
    '--color-border-teal': [
      getPaletteStop('teal', 80),
      getPaletteStop('teal', 60, 'dark'),
    ],
    '--color-icon-teal': [
      getPaletteStop('teal', 30),
      getPaletteStop('teal', 70, 'dark'),
    ],
    '--color-text-teal': [
      getPaletteStop('teal', 30),
      getPaletteStop('teal', 80, 'dark'),
    ],

    '--color-background-cyan': [
      getPaletteStop('cyan', 85),
      withAlpha(getPaletteStop('cyan', 70, 'dark'), '3D'),
    ],
    '--color-border-cyan': [
      getPaletteStop('cyan', 80),
      getPaletteStop('cyan', 60, 'dark'),
    ],
    '--color-icon-cyan': [
      getPaletteStop('cyan', 30),
      getPaletteStop('cyan', 70, 'dark'),
    ],
    '--color-text-cyan': [
      getPaletteStop('cyan', 30),
      getPaletteStop('cyan', 80, 'dark'),
    ],

    '--color-background-blue': [
      getPaletteStop('blue', 85),
      withAlpha(getPaletteStop('blue', 70, 'dark'), '3D'),
    ],
    '--color-border-blue': [
      getPaletteStop('blue', 80),
      getPaletteStop('blue', 60, 'dark'),
    ],
    '--color-icon-blue': [
      getPaletteStop('blue', 30),
      getPaletteStop('blue', 70, 'dark'),
    ],
    '--color-text-blue': [
      getPaletteStop('blue', 30),
      getPaletteStop('blue', 80, 'dark'),
    ],

    '--color-background-purple': [
      getPaletteStop('purple', 85),
      withAlpha(getPaletteStop('purple', 70, 'dark'), '3D'),
    ],
    '--color-border-purple': [
      getPaletteStop('purple', 80),
      getPaletteStop('purple', 60, 'dark'),
    ],
    '--color-icon-purple': [
      getPaletteStop('purple', 30),
      getPaletteStop('purple', 70, 'dark'),
    ],
    '--color-text-purple': [
      getPaletteStop('purple', 30),
      getPaletteStop('purple', 80, 'dark'),
    ],

    '--color-background-pink': [
      getPaletteStop('pink', 85),
      withAlpha(getPaletteStop('pink', 70, 'dark'), '3D'),
    ],
    '--color-border-pink': [
      getPaletteStop('pink', 80),
      getPaletteStop('pink', 60, 'dark'),
    ],
    '--color-icon-pink': [
      getPaletteStop('pink', 30),
      getPaletteStop('pink', 70, 'dark'),
    ],
    '--color-text-pink': [
      getPaletteStop('pink', 30),
      getPaletteStop('pink', 80, 'dark'),
    ],

    // Gray uses the neutral categorical surface rather than a chromatic ramp.
    '--color-background-gray': [
      getPaletteStop('neutral', 90),
      'var(--color-neutral)',
    ],
    '--color-border-gray': [
      getPaletteStop('neutral', 85),
      getPaletteStop('neutral', 10, 'dark'),
    ],
    '--color-icon-gray': [
      getPaletteStop('neutral', 35),
      getPaletteStop('neutral', 65),
    ],
    '--color-text-gray': [
      getPaletteStop('neutral', 15),
      getPaletteStop('neutral', 90, 'dark'),
    ],

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
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${withAlpha(getPaletteStop('blue', 45), '4D')}`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${withAlpha(getPaletteStop('blue', 45), '80')}`,
    '--shadow-inset-success': `inset 0px 0px 0px 2px ${withAlpha(getPaletteStop('green', 45), '4D')}`,
    '--shadow-inset-warning': `inset 0px 0px 0px 2px ${withAlpha(getPaletteStop('yellow', 85), '4D')}`,
    '--shadow-inset-error': `inset 0px 0px 0px 2px ${withAlpha(getPaletteStop('red', 50), '4D')}`,
  },

  components: {
    // =========================================================================
    // Button — primary gets white text, secondary gets a border, destructive
    // uses the OKLCH red filled treatment.
    // =========================================================================
    button: {
      'variant:destructive': {
        backgroundColor: 'var(--color-error-muted)', // locked pastel red bg
        color: 'var(--color-error)', // locked T30 red — matches banner/input error text
      },
    },

    // =========================================================================
    // Badge —
    //   Semantic (info/success/warning/error): filled saturated T50 + contrasting
    //     text (white, or dark on yellow). The filled-button rule from #2150
    //     §3 — text contrast locks the bg stop, so this stays at T50 in
    //     BOTH modes, unlike pastel surfaces which invert by mode.
    //   Categorical (blue/green/red/orange/etc.): pastel-tinted hue surface +
    //     colored text — light mode = soft T87-T90 + dark T30 text; dark mode
    //     = T20 tinted + T80 light pastel text (sources: --color-background-X
    //     and --color-text-X tokens).
    //   Neutral: light gray bg + dark text (or inverted in dark mode).
    // =========================================================================
    badge: {
      // Semantic — filled saturated bg + contrasting text.
      //   Light: vivid T45-T55 from the OKLCH palette + white text
      //          (~4.5-5:1 — Material/Linear/Vercel pop).
      //   Dark : T60 stop from the dark-mode tonal palette (chroma×0.85,
      //          +5 stop-lift taper from issue #2150 §4) + DARK text.
      //          T60+white fails AA-large (~2.7:1); T60+dark hits 6.6-7:1
      //          and tames the §4 vibration. Same dark-text-on-bright-bg
      //          treatment that warning yellow uses in both modes.
      'variant:info': {
        // Light: T50 #0074e2 (palette saturated stop)
        // Dark : T60 stop from dark-mode tonal palette of source #0074e2
        backgroundColor: 'light-dark(#0074e2, #6d9cfe)',
        color: 'light-dark(#ffffff, #171717)',
      },
      'variant:neutral': {
        // Mirrors the gray categorical badge — same neutral chip treatment
        // (Neutral 200 light / semi-transparent white wash dark) sourced
        // from the gray hue tokens, so a single change at the token layer
        // updates both variants.
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
      'variant:success': {
        // Light: T45 #198100 (palette saturated stop)
        // Dark : T60 stop from dark-mode tonal palette of source #198100
        backgroundColor: 'light-dark(#198100, #64af4c)',
        color: 'light-dark(#ffffff, #171717)',
      },
      'variant:warning': {
        // Yellow stays at the same hex in both modes — chroma reduction
        // is barely visible at T85, and dark text on yellow doesn't
        // suffer from the §4 vibration concern.
        backgroundColor: '#ffce2f',
        color: '#171717',
      },
      'variant:error': {
        // Light: T58 #c9303a. The T55 stop #e33f4a pairs with white at only
        //        4.14:1 — the label is 12px/500, so AA wants 4.5, not the 3:1
        //        large-text allowance. One tonal step down holds the hue
        //        (OKLCH H 21.9 -> 22.8, C 0.200 -> 0.189) and reaches 5.29:1.
        // Dark : T60 stop from dark-mode tonal palette of Tailwind red-600
        //        source #dc2626 (kept on H=27 alarm-red rather than coral).
        //        Dark text on it is 6.60:1 and unchanged.
        backgroundColor: 'light-dark(#c9303a, #ff705d)',
        color: 'light-dark(#ffffff, #171717)',
      },

      // Categorical — bg + text reference the per-hue tokens, so behavior
      // tracks the categorical palette automatically:
      //   Light: pastel T87-T90 bg + dark T30 colored text (low-key chip)
      //   Dark : tinted T20 bg + light T80 colored text (per #2150 §5,
      //          inverted from light to avoid the "pastel-in-both-modes"
      //          anti-pattern that makes locked light pastels glow on a
      //          dark body)
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

    // =========================================================================
    // StatusDot — fill uses the SAME vivid stops as the filled semantic Badge
    // (and ProgressBar), so a dot and its badge read as one status language.
    //
    // The default component maps each variant to a raw semantic token
    // (--color-success / --color-error / --color-warning / --color-icon-
    // secondary), which in light mode are the dark T30/T40 stops meant to
    // sit as TEXT on a pastel surface — as a solid dot they read muddy
    // (dark green / maroon / brown). Redirect them to the badge fills.
    //
    //   success → badge success bg  (green T45 / dark-ramp T60)
    //   warning → badge warning bg  (yellow T85, same hex both modes)
    //   error   → badge error bg    (red T58 / dark-ramp T60)
    //   accent  → badge info bg     (blue T50 / dark-ramp T60) — the
    //             StatusDot "accent" is the info/attention color, so it
    //             pairs with the info badge rather than --color-accent
    //             (near-black #262626, the darkest offender).
    //
    // `neutral` is intentionally NOT overridden: the neutral badge bg is a
    // near-invisible light gray (--color-background-gray #e5e5e5 / 10% white
    // wash), fine as a large pill but unreadable as an 8px dot. It keeps the
    // component default's visible mid-gray (--color-icon-secondary), which is
    // not among the "too dark" cases.
    // =========================================================================
    statusdot: {
      'variant:success': {backgroundColor: 'light-dark(#198100, #64af4c)'},
      'variant:warning': {backgroundColor: '#ffce2f'},
      'variant:error': {backgroundColor: 'light-dark(#c9303a, #ff705d)'},
      'variant:accent': {backgroundColor: 'light-dark(#0074e2, #6d9cfe)'},
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

    // =========================================================================
    // Banner — sits on a hue-tinted surface with colored text/icon:
    //   Light: pastel T90 bg (pulled from --color-{X}-muted / --color-background-blue)
    //          + dark T30 colored text (--color-text-{hue}).
    //   Dark : tinted T20 bg (same tokens, dark slot) + light T80 colored text.
    //          Per #2150 §5 — large hue-tinted surfaces in dark mode invert
    //          to a deep tinted bg + light text rather than locking the
    //          light-mode pastel.
    //
    // The inner-header *-muted token carries the tinted background for every
    // status, info included. A theme override that sets a plain CSS property
    // instead lands in @layer astryx-theme, which StyleX's @layer priority4
    // outranks, so `backgroundColor` here would silently do nothing and the
    // info banner would paint no background at all.
    //
    // Status overrides reference --color-text-{hue} so text/icon colors
    // stay in sync with the palette anchors automatically.
    banner: {
      'status:info': {
        '--color-accent-muted': 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
      },
      // success/warning/error banner bgs come from --color-{X}-muted, which
      // already carries the correct light/dark tinted values. We only need
      // to redirect the text/icon to the palette colored stop.
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
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
        '--color-error': 'var(--color-text-red)',
      },
    },

    // =========================================================================
    // TextInput — no per-status overrides needed. The global tokens
    // --color-{success,error,warning} carry the correct values in both
    // modes (light=T40 dark colored, dark=T80 light pastel) for both
    // surfaces the input border/icon touches: the input surface
    // (white/T15-dark) and the status message bubble (light pastel T90 /
    // dark T20). Verified all six combinations clear AA non-text 3:1.
    // =========================================================================

    // =========================================================================
    // Switch — off-state track uses the same lifted-neutral surface as the
    // ProgressBar track (--color-border-emphasized). Aligns the two
    // "channel-on-body" components so their off-states share one visual
    // language: light T85 #d4d4d4 sits one step darker than the body T95
    // bg, dark T35 #525252 sits one step lighter than the body T10. Each
    // is a defined channel, not a wash that blends in.
    // =========================================================================
    switch: {
      base: {
        '--color-background-gray': 'var(--color-border-emphasized)',
      },
    },

    progressbar: {
      base: {
        // Track uses --color-background-muted; override it to
        // --color-border-emphasized (Neutral T85 #d4d4d4 in light mode) so
        // the track is clearly darker than the body bg (Neutral T95 #f1f1f1)
        // and reads as a defined channel rather than blending in. Dark
        // mode inherits T35 #525252 — same one-step-lighter behavior.
        '--color-background-muted': 'var(--color-border-emphasized)',
      },
      // Vivid stops match the filled semantic badge colors (info/success/
      // warning/error variants in the badge override above). Same hex
      // values; documented per role with palette provenance.
      'variant:accent': {
        // Blue T50 saturated stop (= variant:info badge bg)
        '--color-accent': '#0074e2',
      },
      'variant:success': {
        // Green T45 saturated stop (= variant:success badge bg)
        '--color-success': '#198100',
      },
      'variant:warning': {
        // Yellow T85 saturated stop (= variant:warning badge bg)
        '--color-warning': '#ffce2f',
      },
      'variant:error': {
        // Red T58 saturated stop (= variant:error badge bg)
        '--color-error': '#c9303a',
      },
    },

    // =========================================================================
    // Card — tighter padding via public card padding token
    // =========================================================================
    card: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    // =========================================================================
    // Section — tighter padding via public section padding token
    // =========================================================================
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
