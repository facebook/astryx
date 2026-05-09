/**
 * Stone Theme
 *
 * A warm, earthy neutral theme inspired by natural stone and sandstone.
 * Core palette: #28282A, #84848B, #D8D8DB, #f3f3f5, #FFFFFF
 * Uses Montserrat for headings and Figtree for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {stoneIconRegistry} from './icons';

/** Stone syntax palette — derived from categorical hues at T40 (light) / T70 (dark). */
const stoneSyntax = defineSyntaxTheme({
  name: 'xds-stone',
  tokens: {
    keyword: ['#645a72', '#b2a7c1'],    // Purple H=307 C=15
    string: ['#50634f', '#9bb19a'],      // Green H=142 C=15
    comment: ['#5e5e63', '#ababb0'],     // Gray H=291 C=3
    number: ['#6f5b48', '#bea792'],      // Orange H=70 C=15
    function: ['#4d6076', '#99adc6'],    // Blue H=265 C=15
    type: ['#645a72', '#b2a7c1'],        // Purple H=307 C=15
    variable: ['#5e5e63', '#ababb0'],    // Gray H=291 C=3
    operator: ['#5e5e63', '#ababb0'],    // Gray H=291 C=3
    constant: ['#6f5b48', '#bea792'],    // Orange H=70 C=15
    tag: ['#775751', '#c7a39d'],         // Red H=33 C=15
    attribute: ['#675d46', '#b6aa90'],   // Yellow H=90 C=15
    property: ['#496455', '#94b2a0'],    // Teal H=158 C=15
    punctuation: ['#5e5e63', '#ababb0'], // Gray H=291 C=3
    background: ['#f3f3f5', '#171719'],
  },
});

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

  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: stoneSyntax,

  tokens: {
    // =========================================================================
    // Colors — warm stone palette
    // Core: #28282A, #84848B, #D8D8DB, #f3f3f5, #FFFFFF
    // =========================================================================

    // Core semantic — all neutrals H=291
    // Stone 900 T=16 C=1.4, Stone 500 T=55 C=4, Stone 300 T=86 C=1.6, Stone 100 T=96 C=1
    '--color-accent': ['#28282a', '#f3f3f5'],
    '--color-accent-muted': ['#28282a14', '#f3f3f520'],
    '--color-neutral': ['#28282a0F', '#f3f3f51A'],
    '--color-background-surface': ['#FFFFFF', '#1f1f21'],  // T12
    '--color-background-body': ['#f3f3f5', '#171719'],     // T8
    '--color-overlay': ['#28282a80', '#28282aCC'],
    '--color-overlay-hover': ['#28282a0D', '#f3f3f50D'],
    '--color-overlay-pressed': ['#28282a1A', '#f3f3f51A'],
    '--color-background-muted': ['#f3f3f5', '#28282a'],

    // Text — H=291
    '--color-text-primary': ['#28282a', '#f3f3f5'],        // T16 / T96
    '--color-text-secondary': ['#83838a', '#9d9da3'],      // T55 C=4 / T65 C=3
    '--color-text-disabled': ['#d7d7da', '#5e5e61'],       // T86 C=1.6 / T40 C=2
    '--color-text-accent': ['#28282a', '#f3f3f5'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#28282a',
    '--color-on-accent': ['#FFFFFF', '#28282a'],
    '--color-on-success': ['#374c36', '#b4cdb2'],          // Green T30 / T80
    '--color-on-error': ['#58413e', '#dcc0bc'],             // Red T30 / T80
    '--color-on-warning': ['#524622', '#d7c59c'],           // Yellow T30 / T80

    // Icon — H=291
    '--color-icon-accent': ['#28282a', '#f3f3f5'],
    '--color-icon-primary': ['#28282a', '#f3f3f5'],
    '--color-icon-secondary': ['#83838a', '#9d9da3'],      // T55 C=4 / T65 C=3
    '--color-icon-disabled': ['#d7d7da', '#5e5e61'],       // T86 C=1.6 / T40 C=2

    // Surface variants — H=291
    '--color-background-card': ['#FFFFFF', '#242325'],      // T14
    '--color-background-popover': ['#FFFFFF', '#28282a'],   // T16
    '--color-background-inverted': ['#28282a', '#f3f3f5'],

    // Status / Sentiment — T50 from palette for icons/borders (visible color)
    '--color-success': ['#374c36', '#b4cdb2'],              // Green T30 / T80
    '--color-success-muted': ['#d0e9ce', '#b4cdb2'],       // Green T90 / T80
    '--color-error': ['#58413e', '#dcc0bc'],                // Red T30 / T80
    '--color-error-muted': ['#f9dcd7', '#dcc0bc'],          // Red T90 / T80
    '--color-warning': ['#524622', '#d7c59c'],              // Yellow T30 / T80
    '--color-warning-muted': ['#f4e1b7', '#d7c59c'],       // Yellow T90 / T80

    // Border — H=291
    '--color-border': ['#dddcdf', '#f3f3f51A'],             // T88 C=1.5
    '--color-border-emphasized': ['#83838a', '#5e5e61'],    // T55 C=4 / T40 C=2

    // Effects — H=291
    '--color-skeleton': ['#d7d7da', '#5e5e61'],             // T86 C=1.6 / T40 C=2
    '--color-shadow': ['#28282a1A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical — Blue (indigo blue)
    // Categorical — Blue H=265 C=10
    '--color-background-blue': ['#d7e4f5', '#a0acbd'],
    '--color-border-blue': ['#c9d6e7', '#939faf'],
    '--color-icon-blue': ['#3c4856', '#1b2734'],
    '--color-text-blue': ['#3c4856', '#1b2734'],

    // Categorical — Cyan H=190 C=10
    '--color-background-cyan': ['#cce8e5', '#95b1ae'],
    '--color-border-cyan': ['#bedad7', '#88a3a0'],
    '--color-icon-cyan': ['#334b49', '#122a28'],
    '--color-text-cyan': ['#334b49', '#122a28'],

    // Categorical — Gray H=291 C=1 (near-neutral)
    '--color-background-gray': ['#e2e2e4', '#ababad'],
    '--color-border-gray': ['#d4d4d6', '#9e9e9f'],
    '--color-icon-gray': ['#474748', '#262627'],
    '--color-text-gray': ['#474748', '#262627'],

    // Categorical — Green H=142 C=17
    '--color-background-green': ['#d0e9ce', '#99b298'],
    '--color-border-green': ['#c2dbc0', '#8ca48b'],
    '--color-icon-green': ['#374c36', '#162a16'],
    '--color-text-green': ['#374c36', '#162a16'],

    // Categorical — Orange H=70 C=22
    '--color-background-orange': ['#ffdcbb', '#c6a586'],
    '--color-border-orange': ['#f1ceae', '#b89879'],
    '--color-icon-orange': ['#5b4227', '#372104'],
    '--color-text-orange': ['#5b4227', '#372104'],

    // Categorical — Pink H=340 C=9
    '--color-background-pink': ['#f0dde8', '#b8a6b1'],
    '--color-border-pink': ['#e2cfda', '#ab99a3'],
    '--color-icon-pink': ['#52424c', '#30222a'],
    '--color-text-pink': ['#52424c', '#30222a'],

    // Categorical — Purple H=307 C=11
    '--color-background-purple': ['#e8dff3', '#b0a8bb'],
    '--color-border-purple': ['#d9d1e5', '#a39aad'],
    '--color-icon-purple': ['#4b4454', '#292332'],
    '--color-text-purple': ['#4b4454', '#292332'],

    // Categorical — Red H=33 C=11
    '--color-background-red': ['#f9dcd7', '#c0a5a1'],
    '--color-border-red': ['#ebcec9', '#b39893'],
    '--color-icon-red': ['#58413e', '#35211e'],
    '--color-text-red': ['#58413e', '#35211e'],

    // Categorical — Teal H=158 C=9
    '--color-background-teal': ['#d4e7dc', '#9dafa5'],
    '--color-border-teal': ['#c6d9ce', '#90a297'],
    '--color-icon-teal': ['#3b4a41', '#1a2921'],
    '--color-text-teal': ['#3b4a41', '#1a2921'],

    // Categorical — Yellow H=90 C=23
    '--color-background-yellow': ['#f4e1b7', '#bbaa81'],
    '--color-border-yellow': ['#e5d3a9', '#ad9c75'],
    '--color-icon-yellow': ['#524622', '#2f2500'],
    '--color-text-yellow': ['#524622', '#2f2500'],

    // =========================================================================
    // Radius — clean and subtle
    // =========================================================================
    '--radius-none': '0.125rem',
    '--radius-inner': '0.25rem',
    '--radius-element': '0.5rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #28282A0D, 0 4px 8px #28282A1A',
    '--shadow-med':
      '0 2px 4px #28282A0D, 0 4px 12px #28282A1A',
    '--shadow-high':
      '0 4px 6px #28282A1A, 0 12px 24px #28282A26',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #28282A30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #28282A50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #83838a30',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #83838a30',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #83838a30',
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
        backgroundColor: 'light-dark(#f9dcd7, #dcc0bc)',
        color: 'light-dark(#58413e, #4c3633)',
      },
    },

    badge: {
      'variant:info': {
        backgroundColor: 'light-dark(#d7e4f5, #bbc8d9)',
        color: 'light-dark(#3c4856, #313c4a)',
      },
      'variant:neutral': {
        backgroundColor: 'light-dark(#e2e2e4, #c6c6c8)',
        color: 'light-dark(#474748, #3b3b3d)',
      },
      'variant:success': {
        backgroundColor: 'light-dark(#d0e9ce, #b4cdb2)',
        color: 'light-dark(#374c36, #2b402b)',
      },
      'variant:warning': {
        backgroundColor: 'light-dark(#f4e1b7, #d7c59c)',
        color: 'light-dark(#524622, #463a18)',
      },
      'variant:error': {
        backgroundColor: 'light-dark(#f9dcd7, #dcc0bc)',
        color: 'light-dark(#58413e, #4c3633)',
      },
    },

    banner: {
      'status:info': {
        backgroundColor: 'light-dark(#d7e4f5, #bbc8d9)',
        '--color-text-primary': 'light-dark(#3c4856, #313c4a)',
        '--color-text-secondary': 'light-dark(#3c4856, #313c4a)',
        '--color-accent': 'light-dark(#3c4856, #313c4a)',
      },
      'status:success': {
        backgroundColor: 'light-dark(#d0e9ce, #b4cdb2)',
        '--color-text-primary': 'light-dark(#374c36, #2b402b)',
        '--color-text-secondary': 'light-dark(#374c36, #2b402b)',
        '--color-success': 'light-dark(#374c36, #2b402b)',
      },
      'status:warning': {
        backgroundColor: 'light-dark(#f4e1b7, #d7c59c)',
        '--color-text-primary': 'light-dark(#524622, #463a18)',
        '--color-text-secondary': 'light-dark(#524622, #463a18)',
        '--color-warning': 'light-dark(#524622, #463a18)',
      },
      'status:error': {
        backgroundColor: 'light-dark(#f9dcd7, #dcc0bc)',
        '--color-text-primary': 'light-dark(#58413e, #4c3633)',
        '--color-text-secondary': 'light-dark(#58413e, #4c3633)',
        '--color-error': 'light-dark(#58413e, #4c3633)',
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

  icons: stoneIconRegistry,
});

/**
 * Raw tonal palettes — every color at every tone step (0–100 in 5s).
 * Same hue and chroma used to derive all theme tokens.
 * Use these for custom components or data visualization.
 */
export const stonePalettes = {
  neutral: {
    hue: 291, chroma: 3,
    0: '#000000', 5: '#111015', 10: '#1b1b1f', 15: '#25252a', 20: '#303034',
    25: '#3b3b3f', 30: '#46464b', 35: '#525257', 40: '#5e5e63', 45: '#6a6a6f',
    50: '#77777c', 55: '#838388', 60: '#909095', 65: '#9d9da3', 70: '#ababb0',
    75: '#b8b8be', 80: '#c6c6cc', 85: '#d4d4da', 90: '#e2e2e8', 95: '#f0f0f6',
    100: '#ffffff',
  },
  blue: {
    hue: 265, chroma: 10,
    0: '#000000', 5: '#04121e', 10: '#111c29', 15: '#1b2734', 20: '#26313f',
    25: '#313c4a', 30: '#3c4856', 35: '#485362', 40: '#545f6e', 45: '#606c7b',
    50: '#6c7888', 55: '#798595', 60: '#8692a2', 65: '#939faf', 70: '#a0acbd',
    75: '#adbacb', 80: '#bbc8d9', 85: '#c9d6e7', 90: '#d7e4f5', 95: '#e7f2ff',
    100: '#ffffff',
  },
  cyan: {
    hue: 190, chroma: 10,
    0: '#000000', 5: '#001613', 10: '#071f1e', 15: '#122a28', 20: '#1d3433',
    25: '#28403e', 30: '#334b49', 35: '#3e5755', 40: '#4a6361', 45: '#566f6d',
    50: '#627c7a', 55: '#6f8986', 60: '#7b9693', 65: '#88a3a0', 70: '#95b1ae',
    75: '#a3bebb', 80: '#b0ccc9', 85: '#bedad7', 90: '#cce8e5', 95: '#daf7f4',
    100: '#ffffff',
  },
  green: {
    hue: 142, chroma: 17,
    0: '#000000', 5: '#001700', 10: '#0c200a', 15: '#162a16', 20: '#213521',
    25: '#2b402b', 30: '#374c36', 35: '#425841', 40: '#4e644d', 45: '#5a7059',
    50: '#667d65', 55: '#728a71', 60: '#7f977e', 65: '#8ca48b', 70: '#99b298',
    75: '#a7bfa5', 80: '#b4cdb2', 85: '#c2dbc0', 90: '#d0e9ce', 95: '#def8dc',
    100: '#ffffff',
  },
  teal: {
    hue: 158, chroma: 9,
    0: '#000000', 5: '#00150a', 10: '#101e17', 15: '#1a2921', 20: '#25342b',
    25: '#303f36', 30: '#3b4a41', 35: '#46564d', 40: '#526259', 45: '#5e6e65',
    50: '#6a7b71', 55: '#77887e', 60: '#83958a', 65: '#90a297', 70: '#9dafa5',
    75: '#abbdb2', 80: '#b8cbc0', 85: '#c6d9ce', 90: '#d4e7dc', 95: '#e2f5ea',
    100: '#ffffff',
  },
  yellow: {
    hue: 90, chroma: 23,
    0: '#000000', 5: '#1f0f00', 10: '#261a00', 15: '#2f2500', 20: '#3a2f0d',
    25: '#463a18', 30: '#524622', 35: '#5e512d', 40: '#6b5d39', 45: '#786944',
    50: '#857650', 55: '#92825c', 60: '#9f8f68', 65: '#ad9c75', 70: '#bbaa81',
    75: '#c9b78e', 80: '#d7c59c', 85: '#e5d3a9', 90: '#f4e1b7', 95: '#ffefc7',
    100: '#ffffff',
  },
  orange: {
    hue: 70, chroma: 22,
    0: '#000000', 5: '#250a00', 10: '#2d1700', 15: '#372104', 20: '#432c12',
    25: '#4f361c', 30: '#5b4227', 35: '#684d32', 40: '#75593d', 45: '#826548',
    50: '#8f7154', 55: '#9d7e60', 60: '#aa8b6d', 65: '#b89879', 70: '#c6a586',
    75: '#d4b393', 80: '#e3c0a0', 85: '#f1ceae', 90: '#ffdcbb', 95: '#ffeddc',
    100: '#ffffff',
  },
  red: {
    hue: 33, chroma: 11,
    0: '#000000', 5: '#210a04', 10: '#2a1714', 15: '#35211e', 20: '#402b28',
    25: '#4c3633', 30: '#58413e', 35: '#644d49', 40: '#715955', 45: '#7e6561',
    50: '#8a716d', 55: '#987e7a', 60: '#a58b86', 65: '#b39893', 70: '#c0a5a1',
    75: '#ceb3ae', 80: '#dcc0bc', 85: '#ebcec9', 90: '#f9dcd7', 95: '#ffece9',
    100: '#ffffff',
  },
  pink: {
    hue: 340, chroma: 9,
    0: '#000000', 5: '#1b0c16', 10: '#251720', 15: '#30222a', 20: '#3b2c35',
    25: '#463740', 30: '#52424c', 35: '#5e4e57', 40: '#6a5a63', 45: '#776670',
    50: '#83727c', 55: '#907f89', 60: '#9d8c96', 65: '#ab99a3', 70: '#b8a6b1',
    75: '#c6b4be', 80: '#d4c1cc', 85: '#e2cfda', 90: '#f0dde8', 95: '#ffebf7',
    100: '#ffffff',
  },
  purple: {
    hue: 307, chroma: 11,
    0: '#000000', 5: '#150e1d', 10: '#1f1927', 15: '#292332', 20: '#342e3d',
    25: '#3f3949', 30: '#4b4454', 35: '#564f60', 40: '#635b6d', 45: '#6f6779',
    50: '#7b7486', 55: '#888193', 60: '#958da0', 65: '#a39aad', 70: '#b0a8bb',
    75: '#beb5c9', 80: '#cbc3d7', 85: '#d9d1e5', 90: '#e8dff3', 95: '#f6edff',
    100: '#ffffff',
  },
} as const;
