/**
 * Butter Theme
 *
 * A warm, golden theme inspired by fresh butter and sunlight.
 * Source color: #FDEE8C (OKLCH H=102, C=0.13, L=0.94)
 * Core palette derived from OKLCH tonal ramps.
 * Uses Inter for body and Nunito for headings.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {butterIconRegistry} from './icons';

/** Butter syntax palette — warm golden tones for code highlighting. */
const butterSyntax = defineSyntaxTheme({
  name: 'xds-butter',
  tokens: {
    keyword: ['#533181', '#d0b8ff'],       // Purple
    string: ['#225326', '#a2d7a2'],        // Green
    comment: ['#605f52', '#adac9e'],       // Neutral
    number: ['#723200', '#ffb37e'],        // Orange
    function: ['#17438b', '#a6c8ff'],      // Blue
    type: ['#533181', '#d0b8ff'],          // Purple
    variable: ['#605f52', '#adac9e'],      // Neutral
    operator: ['#605f52', '#adac9e'],      // Neutral
    constant: ['#723200', '#ffb37e'],      // Orange
    tag: ['#7e1f20', '#ffaea7'],           // Red
    attribute: ['#5a4300', '#e6c361'],     // Yellow
    property: ['#005444', '#89d9c3'],      // Teal
    punctuation: ['#605f52', '#adac9e'],   // Neutral
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
    // Colors — OKLCH-derived from source #FDEE8C (H=102.3)
    // Neutrals use same hue at C=0.02 for warm tint
    // =========================================================================

    // Accent — exact source color
    '--color-accent': ['#FDEE8C', '#d3c768'],
    '--color-accent-muted': ['#FDEE8C33', '#d3c76840'],
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
    '--color-text-accent': ['#1d1c11', '#f3f2e2'],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#1d1c11',
    '--color-on-accent': ['#1d1c11', '#1d1c11'],
    '--color-on-success': ['#f6fff5', '#002500'],
    '--color-on-error': ['#fffbfa', '#450000'],
    '--color-on-warning': ['#fffcf4', '#2e1500'],

    // Icon
    '--color-icon-accent': ['#1d1c11', '#f3f2e2'],
    '--color-icon-primary': ['#1d1c11', '#f3f2e2'],
    '--color-icon-secondary': ['#605f52', '#adac9e'],
    '--color-icon-disabled': ['#adac9e', '#605f52'],

    // Surface variants — warm neutral
    '--color-background-card': ['#FFFFFF', '#323125'],
    '--color-background-popover': ['#FFFFFF', '#323125'],
    '--color-background-inverted': ['#1d1c11', '#f3f2e2'],

    // Status — OKLCH-derived
    // Success (H=145, C=0.091): green
    '--color-success': ['#3b6c3d', '#6da06e'],
    '--color-success-muted': ['#3b6c3d33', '#6da06e40'],
    // Error (H=25, C=0.13): red
    '--color-error': ['#9a3a37', '#d46e68'],
    '--color-error-muted': ['#9a3a3733', '#d46e6840'],
    // Warning (H=85, C=0.1235): yellow
    '--color-warning': ['#795800', '#b38a22'],
    '--color-warning-muted': ['#79580033', '#b38a2240'],

    // Border — warm neutral
    '--color-border': ['#e5e3d4', '#f3f2e21A'],
    '--color-border-emphasized': ['#79786a', '#939184'],

    // Effects
    '--color-skeleton': ['#e5e3d4', '#49473b'],
    '--color-shadow': ['#1d1c111A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical — Blue (H=260, C=0.13)
    '--color-background-blue': ['#d2e4ff', '#17438b'],
    '--color-border-blue': ['#a6c8ff', '#2f5ca7'],
    '--color-icon-blue': ['#17438b', '#a6c8ff'],
    '--color-text-blue': ['#17438b', '#a6c8ff'],

    // Categorical — Cyan (H=200, C=0.091)
    '--color-background-cyan': ['#96f5fa', '#005256'],
    '--color-border-cyan': ['#79d9de', '#006d71'],
    '--color-icon-cyan': ['#005256', '#79d9de'],
    '--color-text-cyan': ['#005256', '#79d9de'],

    // Categorical — Gray (H=264, C=0.01)
    '--color-background-gray': ['#dfe3e9', '#44474c'],
    '--color-border-gray': ['#c3c7cd', '#5b5e64'],
    '--color-icon-gray': ['#44474c', '#c3c7cd'],
    '--color-text-gray': ['#44474c', '#c3c7cd'],

    // Categorical — Green (H=145, C=0.091)
    '--color-background-green': ['#bdf3be', '#225326'],
    '--color-border-green': ['#a2d7a2', '#3b6c3d'],
    '--color-icon-green': ['#225326', '#a2d7a2'],
    '--color-text-green': ['#225326', '#a2d7a2'],

    // Categorical — Orange (H=55, C=0.13)
    '--color-background-orange': ['#ffdac2', '#723200'],
    '--color-border-orange': ['#ffb37e', '#934600'],
    '--color-icon-orange': ['#723200', '#ffb37e'],
    '--color-text-orange': ['#723200', '#ffb37e'],

    // Categorical — Pink (H=350, C=0.13)
    '--color-background-pink': ['#ffd5e7', '#762050'],
    '--color-border-pink': ['#ffa7d1', '#923a69'],
    '--color-icon-pink': ['#762050', '#ffa7d1'],
    '--color-text-pink': ['#762050', '#ffa7d1'],

    // Categorical — Purple (H=300, C=0.13)
    '--color-background-purple': ['#e7dcff', '#533181'],
    '--color-border-purple': ['#d0b8ff', '#6b4a9c'],
    '--color-icon-purple': ['#533181', '#d0b8ff'],
    '--color-text-purple': ['#533181', '#d0b8ff'],

    // Categorical — Red (H=25, C=0.13)
    '--color-background-red': ['#ffd8d4', '#7e1f20'],
    '--color-border-red': ['#ffaea7', '#9a3a37'],
    '--color-icon-red': ['#7e1f20', '#ffaea7'],
    '--color-text-red': ['#7e1f20', '#ffaea7'],

    // Categorical — Teal (H=175, C=0.0845)
    '--color-background-teal': ['#a5f6df', '#005444'],
    '--color-border-teal': ['#89d9c3', '#156e5c'],
    '--color-icon-teal': ['#005444', '#89d9c3'],
    '--color-text-teal': ['#005444', '#89d9c3'],

    // Categorical — Yellow (H=90, C=0.1235)
    '--color-background-yellow': ['#ffe088', '#5a4300'],
    '--color-border-yellow': ['#e6c361', '#755b00'],
    '--color-icon-yellow': ['#5a4300', '#e6c361'],
    '--color-text-yellow': ['#5a4300', '#e6c361'],

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
    '--shadow-low':
      '0 2px 4px #1d1c110D, 0 4px 8px #1d1c111A',
    '--shadow-med':
      '0 2px 4px #1d1c110D, 0 4px 12px #1d1c111A',
    '--shadow-high':
      '0 4px 6px #1d1c111A, 0 12px 24px #1d1c1126',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #79786a30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #79786a50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #3b6c3d30',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #79580030',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #9a3a3730',
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
        backgroundColor: 'light-dark(#ffd8d4, #ffaea7)',
        color: 'light-dark(#7e1f20, #450000)',
      },
    },

    badge: {
      'variant:info': {
        backgroundColor: 'light-dark(#d2e4ff, #17438b)',
        color: 'light-dark(#17438b, #a6c8ff)',
      },
      'variant:neutral': {
        backgroundColor: 'light-dark(#dfe3e9, #44474c)',
        color: 'light-dark(#44474c, #c3c7cd)',
      },
      'variant:success': {
        backgroundColor: 'light-dark(#bdf3be, #225326)',
        color: 'light-dark(#225326, #a2d7a2)',
      },
      'variant:warning': {
        backgroundColor: 'light-dark(#ffe088, #5a4300)',
        color: 'light-dark(#5a4300, #e6c361)',
      },
      'variant:error': {
        backgroundColor: 'light-dark(#ffd8d4, #7e1f20)',
        color: 'light-dark(#7e1f20, #ffaea7)',
      },
    },

    banner: {
      'status:info': {
        backgroundColor: 'light-dark(#d2e4ff, #17438b)',
        '--color-text-primary': 'light-dark(#17438b, #a6c8ff)',
        '--color-text-secondary': 'light-dark(#17438b, #a6c8ff)',
        '--color-accent': 'light-dark(#17438b, #a6c8ff)',
      },
      'status:success': {
        backgroundColor: 'light-dark(#bdf3be, #225326)',
        '--color-text-primary': 'light-dark(#225326, #a2d7a2)',
        '--color-text-secondary': 'light-dark(#225326, #a2d7a2)',
        '--color-success': 'light-dark(#225326, #a2d7a2)',
      },
      'status:warning': {
        backgroundColor: 'light-dark(#ffe088, #5a4300)',
        '--color-text-primary': 'light-dark(#5a4300, #e6c361)',
        '--color-text-secondary': 'light-dark(#5a4300, #e6c361)',
        '--color-warning': 'light-dark(#5a4300, #e6c361)',
      },
      'status:error': {
        backgroundColor: 'light-dark(#ffd8d4, #7e1f20)',
        '--color-text-primary': 'light-dark(#7e1f20, #ffaea7)',
        '--color-text-secondary': 'light-dark(#7e1f20, #ffaea7)',
        '--color-error': 'light-dark(#7e1f20, #ffaea7)',
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
 * Raw tonal palettes — OKLCH-derived, every tone step.
 * Source: #FDEE8C (H=102.3, C=0.131)
 */
export const butterPalettes = {
  neutral: {
    hue: 102, chroma: 0.02,
    0: '#000000', 5: '#131107', 10: '#1d1c11', 20: '#323125', 30: '#49473b', 40: '#605f52', 50: '#79786a', 60: '#939184', 70: '#adac9e', 80: '#c9c7b9', 90: '#e5e3d4', 95: '#f3f2e2', 99: '#fffdee', 100: '#ffffff',
  },
  blue: {
    hue: 260, chroma: 0.13,
    0: '#000000', 5: '#000048', 10: '#000f56', 20: '#002a70', 30: '#17438b', 40: '#2f5ca7', 50: '#4776c3', 60: '#6090e0', 70: '#7aabfd', 80: '#a6c8ff', 90: '#d2e4ff', 95: '#e9f1ff', 99: '#fafcff', 100: '#ffffff',
  },
  cyan: {
    hue: 200, chroma: 0.091,
    0: '#000000', 5: '#00181b', 10: '#002326', 20: '#00393d', 30: '#005256', 40: '#006d71', 50: '#1a878c', 60: '#3ea1a7', 70: '#5cbdc2', 80: '#79d9de', 90: '#96f5fa', 95: '#c6fdff', 99: '#f3ffff', 100: '#ffffff',
  },
  green: {
    hue: 145, chroma: 0.091,
    0: '#000000', 5: '#001900', 10: '#002500', 20: '#063c0e', 30: '#225326', 40: '#3b6c3d', 50: '#538555', 60: '#6da06e', 70: '#87bb88', 80: '#a2d7a2', 90: '#bdf3be', 95: '#d1ffd1', 99: '#f6fff5', 100: '#ffffff',
  },
  teal: {
    hue: 175, chroma: 0.0845,
    0: '#000000', 5: '#00190f', 10: '#00241a', 20: '#003b2e', 30: '#005444', 40: '#156e5c', 50: '#368774', 60: '#53a28e', 70: '#6ebda8', 80: '#89d9c3', 90: '#a5f6df', 95: '#c4ffee', 99: '#f3fffc', 100: '#ffffff',
  },
  yellow: {
    hue: 90, chroma: 0.1235,
    0: '#000000', 5: '#250600', 10: '#2b1700', 20: '#402d00', 30: '#5a4300', 40: '#755b00', 50: '#937300', 60: '#ae8c22', 70: '#c9a743', 80: '#e6c361', 90: '#ffe088', 95: '#fff0c6', 99: '#fffcf3', 100: '#ffffff',
  },
  orange: {
    hue: 55, chroma: 0.13,
    0: '#000000', 5: '#350000', 10: '#3e0000', 20: '#541e00', 30: '#723200', 40: '#934600', 50: '#b05f1a', 60: '#cc7939', 70: '#ea9455', 80: '#ffb37e', 90: '#ffdac2', 95: '#ffede1', 99: '#fffbf9', 100: '#ffffff',
  },
  red: {
    hue: 25, chroma: 0.13,
    0: '#000000', 5: '#360000', 10: '#450000', 20: '#620008', 30: '#7e1f20', 40: '#9a3a37', 50: '#b7544f', 60: '#d46e68', 70: '#f28981', 80: '#ffaea7', 90: '#ffd8d4', 95: '#ffebe9', 99: '#fffbfa', 100: '#ffffff',
  },
  pink: {
    hue: 350, chroma: 0.13,
    0: '#000000', 5: '#320018', 10: '#400024', 20: '#5b0039', 30: '#762050', 40: '#923a69', 50: '#ae5382', 60: '#cb6d9c', 70: '#e887b7', 80: '#ffa7d1', 90: '#ffd5e7', 95: '#ffeaf3', 99: '#fffbfd', 100: '#ffffff',
  },
  purple: {
    hue: 300, chroma: 0.13,
    0: '#000000', 5: '#1d003f', 10: '#27004d', 20: '#3c1767', 30: '#533181', 40: '#6b4a9c', 50: '#8363b8', 60: '#9d7dd4', 70: '#b897f1', 80: '#d0b8ff', 90: '#e7dcff', 95: '#f3edff', 99: '#fdfbff', 100: '#ffffff',
  },
} as const;
