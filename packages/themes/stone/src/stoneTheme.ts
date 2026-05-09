/**
 * Stone Theme
 *
 * A warm, earthy neutral theme inspired by natural stone and sandstone.
 * Core palette: #28282A, #84848B, #D8D8DB, #f3f3f5, #FFFFFF
 * Uses Montserrat for headings and Figtree for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {stoneIconRegistry} from './icons';

/** Stone syntax palette — warm, muted tones to match the earthy aesthetic. */
const stoneSyntax = defineSyntaxTheme({
  name: 'xds-stone',
  tokens: {
    keyword: ['#7c5e3a', '#c4a882'],
    string: ['#2e6b4a', '#7bc49e'],
    comment: ['#84848B', '#84848B'],
    number: ['#a16830', '#d4a06a'],
    function: ['#3a5e8c', '#7ba8d4'],
    type: ['#6b4a8c', '#b08ed4'],
    variable: ['#28282A', '#D8D8DB'],
    operator: ['#84848B', '#a1a1a6'],
    constant: ['#a16830', '#d4a06a'],
    tag: ['#b5463a', '#e08a82'],
    attribute: ['#8c6b30', '#d4b870'],
    property: ['#3a7c6b', '#70c4b0'],
    punctuation: ['#84848B', '#5a5a60'],
    background: ['#f3f3f5', '#1a1a1c'],
  },
});

export const stoneTheme = defineTheme({
  name: 'stone',

  typography: {
    scale: {base: 14, ratio: 1.2},
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

    // Core semantic
    '--color-accent': ['#28282A', '#f3f3f5'],
    '--color-accent-muted': ['#28282A14', '#f3f3f520'],
    '--color-neutral': ['#28282A0F', '#f3f3f51A'],
    '--color-background-surface': ['#FFFFFF', '#1a1a1c'],
    '--color-background-body': ['#f3f3f5', '#111113'],
    '--color-overlay': ['#28282A80', '#28282ACC'],
    '--color-overlay-hover': ['#28282A0D', '#f3f3f50D'],
    '--color-overlay-pressed': ['#28282A1A', '#f3f3f51A'],
    '--color-background-muted': ['#f3f3f5', '#28282A'],

    // Text
    '--color-text-primary': ['#28282A', '#f3f3f5'],
    '--color-text-secondary': ['#84848B', '#a1a1a6'],
    '--color-text-disabled': ['#D8D8DB', '#5a5a60'],
    '--color-text-accent': ['#28282A', '#f3f3f5'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#28282A',
    '--color-on-accent': ['#FFFFFF', '#28282A'],
    '--color-on-success': ['#374c36', '#b4cdb2'],
    '--color-on-error': ['#58413e', '#dcc0bc'],
    '--color-on-warning': ['#524622', '#d7c59c'],

    // Icon
    '--color-icon-accent': ['#28282A', '#f3f3f5'],
    '--color-icon-primary': ['#28282A', '#f3f3f5'],
    '--color-icon-secondary': ['#84848B', '#a1a1a6'],
    '--color-icon-disabled': ['#D8D8DB', '#5a5a60'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#1e1e20'],
    '--color-background-popover': ['#FFFFFF', '#28282A'],
    '--color-background-inverted': ['#28282A', '#f3f3f5'],

    // Status / Sentiment — T50 light (full chroma) / T80 dark for icons and borders
    '--color-success': ['#84848B', '#5a5a60'],
    '--color-success-muted': ['#d0e9ce', '#b4cdb2'],
    '--color-error': ['#84848B', '#5a5a60'],
    '--color-error-muted': ['#f9dcd7', '#dcc0bc'],
    '--color-warning': ['#84848B', '#5a5a60'],
    '--color-warning-muted': ['#f4e1b7', '#d7c59c'],

    // Border
    '--color-border': ['#dddcdf', '#f3f3f51A'],
    '--color-border-emphasized': ['#84848B', '#5a5a60'],

    // Effects
    '--color-skeleton': ['#D8D8DB', '#5a5a60'],
    '--color-shadow': ['#28282A1A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

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

    // Categorical — Gray H=291 C=3 (stone neutral)
    '--color-background-gray': ['#e2e2e8', '#ababb0'],
    '--color-border-gray': ['#d4d4da', '#9d9da3'],
    '--color-icon-gray': ['#46464b', '#25252a'],
    '--color-text-gray': ['#46464b', '#25252a'],

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
    '--shadow-inset-success': 'inset 0px 0px 0px 2px light-dark(#374c3650, #a7d1a650)',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px light-dark(#52462250, #dec47f50)',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px light-dark(#58413e50, #e9bcb550)',
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
        backgroundColor: 'light-dark(#f9dcd7, #e2beb9)',
        color: 'light-dark(#58413e, #503430)',
      },
    },

    badge: {
      'variant:info': {
        backgroundColor: 'light-dark(#d7e4f5, #bbc8d9)',
        color: 'light-dark(#3c4856, #313c4a)',
      },
      'variant:neutral': {
        backgroundColor: 'light-dark(#e2e2e8, #c6c6cc)',
        color: 'light-dark(#46464b, #3b3b3f)',
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
