/**
 * Butter Theme
 *
 * A warm, golden theme inspired by fresh butter and sunlight.
 * Source color: #FDEE8C (OKLCH H=102, C=0.13, L=0.94)
 * Accent: #225BFF (blue)
 * All tonal ramps derived from brand source colors via OKLCH.
 * Uses Inter for body and Nunito for headings.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {butterIconRegistry} from './icons';

/** Butter syntax palette — derived from brand categorical hues. */
const butterSyntax = defineSyntaxTheme({
  name: 'xds-butter',
  tokens: {
    keyword: ['#56307f', '#d4b6ff'], // Purple (H=303)
    string: ['#275322', '#a6d69f'], // Green (H=142)
    comment: ['#605f52', '#adac9e'], // Neutral (H=102)
    number: ['#693900', '#ffb565'], // Orange (H=66)
    function: ['#303d8b', '#b2c4ff'], // Blue (H=272)
    type: ['#56307f', '#d4b6ff'], // Purple (H=303)
    variable: ['#605f52', '#adac9e'], // Neutral
    operator: ['#605f52', '#adac9e'], // Neutral
    constant: ['#693900', '#ffb565'], // Orange (H=66)
    tag: ['#7d2208', '#ffb09b'], // Red (H=35)
    attribute: ['#514800', '#d6ca65'], // Yellow (H=102)
    property: ['#045439', '#93d8b6'], // Teal (H=163)
    punctuation: ['#605f52', '#adac9e'], // Neutral
    background: ['#fffdee', '#131107'],
  },
});

export const butterTheme = defineTheme({
  name: 'butter',

  typography: {
    scale: {base: 14, ratio: 1.25},
    body: {
      family: 'Inter',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Nunito',
      fallbacks:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: butterSyntax,

  tokens: {
    // =========================================================================
    // Colors — OKLCH-derived
    // Source: #FDEE8C (H=102.3, C=0.131)
    // Accent: #225BFF (H=269, C=0.283)
    // Neutrals: warm tint from butter hue (H=102, C=0.02)
    // =========================================================================

    // Accent — exact blue (#225BFF)
    '--color-accent': ['#225BFF', '#8ca9ff'],
    '--color-accent-muted': ['#225BFF33', '#8ca9ff40'],
    '--color-neutral': ['#1d1c110F', '#f3f2e21A'],
    '--color-background-surface': ['#FFFFFF', '#1d1c11'],
    '--color-background-body': ['#fffdee', '#131107'],
    '--color-overlay': ['#1d1c1180', '#131107cc'],
    '--color-overlay-hover': ['#1d1c110D', '#f3f2e20D'],
    '--color-overlay-pressed': ['#1d1c111A', '#f3f2e21A'],
    '--color-background-muted': ['#f3f2e2', '#323125'],

    // Text — warm neutral H=102 C=0.02
    '--color-text-primary': ['#1d1c11', '#f3f2e2'],
    '--color-text-secondary': ['#605f52', '#adac9e'],
    '--color-text-disabled': ['#adac9e', '#605f52'],
    '--color-text-accent': ['#225BFF', '#8ca9ff'],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#1d1c11',
    '--color-on-accent': ['#ffffff', '#1d1c11'],
    '--color-on-success': ['#faffea', '#182000'],
    '--color-on-error': ['#fffbfa', '#450000'],
    '--color-on-warning': ['#fffcf1', '#291800'],

    // Icon
    '--color-icon-accent': ['#225BFF', '#8ca9ff'],
    '--color-icon-primary': ['#1d1c11', '#f3f2e2'],
    '--color-icon-secondary': ['#605f52', '#adac9e'],
    '--color-icon-disabled': ['#adac9e', '#605f52'],

    // Surface variants — warm neutral
    '--color-background-card': ['#FFFFFF', '#323125'],
    '--color-background-popover': ['#FFFFFF', '#323125'],
    '--color-background-inverted': ['#1d1c11', '#f3f2e2'],

    // Status — OKLCH-derived from brand colors
    // Error = Red (source: #FF5947, H=29.2)
    '--color-error': ['#9a3b30', '#d46f61'],
    '--color-error-muted': ['#9a3b3033', '#d46f6140'],
    // Warning = Yellow (source: #F8C726, H=93.5)
    '--color-warning': ['#725c00', '#aa8e22'],
    '--color-warning-muted': ['#725c0033', '#aa8e2240'],
    // Success = Green (source: #AAC515, H=119.3)
    '--color-success': ['#596524', '#8a9957'],
    '--color-success-muted': ['#59652433', '#8a995740'],

    // Border — warm neutral
    '--color-border': ['#e5e3d4', '#f3f2e21A'],
    '--color-border-emphasized': ['#79786a', '#939184'],

    // Effects
    '--color-skeleton': ['#e5e3d4', '#49473b'],
    '--color-shadow': ['#1d1c111A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical — Blue (source: #5681FF, H=271.7)
    '--color-background-blue': ['#d8e2ff', '#303d8b'],
    '--color-border-blue': ['#b2c4ff', '#4556a7'],
    '--color-icon-blue': ['#303d8b', '#b2c4ff'],
    '--color-text-blue': ['#303d8b', '#b2c4ff'],

    // Categorical — Cyan (source: #60CFD3, H=206.8)
    '--color-background-cyan': ['#9bf3ff', '#00515b'],
    '--color-border-cyan': ['#7ad8e4', '#006c77'],
    '--color-icon-cyan': ['#00515b', '#7ad8e4'],
    '--color-text-cyan': ['#00515b', '#7ad8e4'],

    // Categorical — Gray (source: #868B99, H=281.1)
    '--color-background-gray': ['#e1e2e9', '#46464c'],
    '--color-border-gray': ['#c5c6cd', '#5d5e64'],
    '--color-icon-gray': ['#46464c', '#c5c6cd'],
    '--color-text-gray': ['#46464c', '#c5c6cd'],

    // Categorical — Green (source: #5DCE5F, H=141.5)
    '--color-background-green': ['#c1f2ba', '#275322'],
    '--color-border-green': ['#a6d69f', '#3f6b39'],
    '--color-icon-green': ['#275322', '#a6d69f'],
    '--color-text-green': ['#275322', '#a6d69f'],

    // Categorical — Orange (source: #FFA347, H=66.0)
    '--color-background-orange': ['#ffdbb8', '#693900'],
    '--color-border-orange': ['#ffb565', '#894e00'],
    '--color-icon-orange': ['#693900', '#ffb565'],
    '--color-text-orange': ['#693900', '#ffb565'],

    // Categorical — Pink (source: #F680E8, H=327.5)
    '--color-background-pink': ['#ffd1fe', '#69266a'],
    '--color-border-pink': ['#f4a8f2', '#843f83'],
    '--color-icon-pink': ['#69266a', '#f4a8f2'],
    '--color-text-pink': ['#69266a', '#f4a8f2'],

    // Categorical — Purple (source: #B780F6, H=303.0)
    '--color-background-purple': ['#e9dbff', '#56307f'],
    '--color-border-purple': ['#d4b6ff', '#6e489a'],
    '--color-icon-purple': ['#56307f', '#d4b6ff'],
    '--color-text-purple': ['#56307f', '#d4b6ff'],

    // Categorical — Red (source: #FF7553, H=35.4)
    '--color-background-red': ['#ffd8ce', '#7d2208'],
    '--color-border-red': ['#ffb09b', '#9a3d25'],
    '--color-icon-red': ['#7d2208', '#ffb09b'],
    '--color-text-red': ['#7d2208', '#ffb09b'],

    // Categorical — Teal (source: #6CD9A8, H=162.6)
    '--color-background-teal': ['#aff5d2', '#045439'],
    '--color-border-teal': ['#93d8b6', '#286d50'],
    '--color-icon-teal': ['#045439', '#93d8b6'],
    '--color-text-teal': ['#045439', '#93d8b6'],

    // Categorical — Yellow (source: #fdee8c, H=102.3)
    '--color-background-yellow': ['#f2e681', '#514800'],
    '--color-border-yellow': ['#d6ca65', '#6b6000'],
    '--color-icon-yellow': ['#514800', '#d6ca65'],
    '--color-text-yellow': ['#514800', '#d6ca65'],

    // =========================================================================
    // Radius — soft and rounded
    // =========================================================================
    '--radius-none': '0.125rem',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.625rem',
    '--radius-container': '1rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — warm neutral tint
    // =========================================================================
    '--shadow-low': '0 2px 4px #1d1c110D, 0 4px 8px #1d1c111A',
    '--shadow-med': '0 2px 4px #1d1c110D, 0 4px 12px #1d1c111A',
    '--shadow-high': '0 4px 6px #1d1c111A, 0 12px 24px #1d1c1126',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #79786a30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #79786a50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #59652430',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #725c0030',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #9a3b3030',
  },

  components: {
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
      'variant:secondary': {
        backgroundColor: 'transparent',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border-emphasized)',
        ':hover': {
          backgroundColor: 'var(--color-neutral)',
        },
      },
      'variant:destructive': {
        backgroundColor: 'light-dark(#ffd8ce, #ffb09b)',
        color: 'light-dark(#7d2208, #450000)',
      },
    },

    badge: {
      // Info uses accent (blue)
      'variant:info': {
        backgroundColor: 'light-dark(#d7e2ff, #283b96)',
        color: 'light-dark(#283b96, #afc5ff)',
      },
      'variant:neutral': {
        backgroundColor: 'light-dark(#e1e2e9, #46464c)',
        color: 'light-dark(#46464c, #c5c6cd)',
      },
      'variant:success': {
        backgroundColor: 'light-dark(#dbeca7, #424d04)',
        color: 'light-dark(#424d04, #bfcf8c)',
      },
      'variant:warning': {
        backgroundColor: 'light-dark(#fee17e, #574500)',
        color: 'light-dark(#574500, #e1c561)',
      },
      'variant:error': {
        backgroundColor: 'light-dark(#ffd8d1, #7e2018)',
        color: 'light-dark(#7e2018, #ffafa2)',
      },
    },

    banner: {
      // Info uses accent (blue)
      'status:info': {
        backgroundColor: 'light-dark(#d7e2ff, #283b96)',
        '--color-text-primary': 'light-dark(#283b96, #afc5ff)',
        '--color-text-secondary': 'light-dark(#283b96, #afc5ff)',
        '--color-accent': 'light-dark(#283b96, #afc5ff)',
      },
      'status:success': {
        backgroundColor: 'light-dark(#dbeca7, #424d04)',
        '--color-text-primary': 'light-dark(#424d04, #bfcf8c)',
        '--color-text-secondary': 'light-dark(#424d04, #bfcf8c)',
        '--color-success': 'light-dark(#424d04, #bfcf8c)',
      },
      'status:warning': {
        backgroundColor: 'light-dark(#fee17e, #574500)',
        '--color-text-primary': 'light-dark(#574500, #e1c561)',
        '--color-text-secondary': 'light-dark(#574500, #e1c561)',
        '--color-warning': 'light-dark(#574500, #e1c561)',
      },
      'status:error': {
        backgroundColor: 'light-dark(#ffd8d1, #7e2018)',
        '--color-text-primary': 'light-dark(#7e2018, #ffafa2)',
        '--color-text-secondary': 'light-dark(#7e2018, #ffafa2)',
        '--color-error': 'light-dark(#7e2018, #ffafa2)',
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
  },

  icons: butterIconRegistry,
});

/**
 * Raw tonal palettes — OKLCH-derived from brand source colors.
 * Each palette uses the brand hue with role-appropriate chroma.
 */
export const butterPalettes = {
  neutral: {
    hue: 102,
    chroma: 0.02,
    0: '#000000',
    5: '#131107',
    10: '#1d1c11',
    20: '#323125',
    30: '#49473b',
    40: '#605f52',
    50: '#79786a',
    60: '#939184',
    70: '#adac9e',
    80: '#c9c7b9',
    90: '#e5e3d4',
    95: '#f3f2e2',
    99: '#fffdee',
    100: '#ffffff',
  },
  accent: {
    hue: 269,
    chroma: 0.15,
    0: '#000000',
    5: '#080051',
    10: '#090060',
    20: '#15217a',
    30: '#283b96',
    40: '#3d55b2',
    50: '#536fcf',
    60: '#6c8aec',
    70: '#89a6ff',
    80: '#afc5ff',
    90: '#d7e2ff',
    95: '#ebf1ff',
    99: '#fbfcff',
    100: '#ffffff',
  },
  blue: {
    hue: 272,
    chroma: 0.13,
    0: '#000000',
    5: '#080048',
    10: '#0d0856',
    20: '#1c2470',
    30: '#303d8b',
    40: '#4556a7',
    50: '#5c70c3',
    60: '#758ae0',
    70: '#8ea5fd',
    80: '#b2c4ff',
    90: '#d8e2ff',
    95: '#ebf0ff',
    99: '#fbfcff',
    100: '#ffffff',
  },
  cyan: {
    hue: 207,
    chroma: 0.091,
    0: '#000000',
    5: '#00171e',
    10: '#002229',
    20: '#003940',
    30: '#00515b',
    40: '#006c77',
    50: '#1c8692',
    60: '#3fa0ad',
    70: '#5dbcc8',
    80: '#7ad8e4',
    90: '#9bf3ff',
    95: '#d0faff',
    99: '#f5feff',
    100: '#ffffff',
  },
  green: {
    hue: 142,
    chroma: 0.091,
    0: '#000000',
    5: '#001900',
    10: '#002500',
    20: '#0f3b09',
    30: '#275322',
    40: '#3f6b39',
    50: '#588552',
    60: '#719f6a',
    70: '#8bba84',
    80: '#a6d69f',
    90: '#c1f2ba',
    95: '#d2ffcc',
    99: '#f6fff4',
    100: '#ffffff',
  },
  teal: {
    hue: 163,
    chroma: 0.0845,
    0: '#000000',
    5: '#001a06',
    10: '#002511',
    20: '#003c24',
    30: '#045439',
    40: '#286d50',
    50: '#438768',
    60: '#5da181',
    70: '#78bc9c',
    80: '#93d8b6',
    90: '#aff5d2',
    95: '#c9ffe4',
    99: '#f4fff9',
    100: '#ffffff',
  },
  yellow: {
    hue: 102,
    chroma: 0.1235,
    0: '#000000',
    5: '#1d0e00',
    10: '#241b00',
    20: '#393100',
    30: '#514800',
    40: '#6b6000',
    50: '#867900',
    60: '#a09328',
    70: '#bbae48',
    80: '#d6ca65',
    90: '#f2e681',
    95: '#fff497',
    99: '#fffde8',
    100: '#ffffff',
  },
  orange: {
    hue: 66,
    chroma: 0.13,
    0: '#000000',
    5: '#310000',
    10: '#370b00',
    20: '#4d2400',
    30: '#693900',
    40: '#894e00',
    50: '#a96400',
    60: '#c67e29',
    70: '#e29948',
    80: '#ffb565',
    90: '#ffdbb8',
    95: '#ffeddc',
    99: '#fffbf7',
    100: '#ffffff',
  },
  red: {
    hue: 35,
    chroma: 0.13,
    0: '#000000',
    5: '#360000',
    10: '#460000',
    20: '#620100',
    30: '#7d2208',
    40: '#9a3d25',
    50: '#b6573e',
    60: '#d37158',
    70: '#f18c71',
    80: '#ffb09b',
    90: '#ffd8ce',
    95: '#ffece7',
    99: '#fffbfa',
    100: '#ffffff',
  },
  pink: {
    hue: 328,
    chroma: 0.13,
    0: '#000000',
    5: '#2a002c',
    10: '#370039',
    20: '#500a51',
    30: '#69266a',
    40: '#843f83',
    50: '#9f599e',
    60: '#ba72b9',
    70: '#d78dd5',
    80: '#f4a8f2',
    90: '#ffd1fe',
    95: '#ffe8fe',
    99: '#fffaff',
    100: '#ffffff',
  },
  purple: {
    hue: 303,
    chroma: 0.13,
    0: '#000000',
    5: '#1e003e',
    10: '#29004b',
    20: '#3f1665',
    30: '#56307f',
    40: '#6e489a',
    50: '#8762b5',
    60: '#a17cd2',
    70: '#bc96ef',
    80: '#d4b6ff',
    90: '#e9dbff',
    95: '#f4edff',
    99: '#fdfbff',
    100: '#ffffff',
  },
} as const;
