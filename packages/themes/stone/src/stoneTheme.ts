/**
 * Stone Theme
 *
 * A warm, earthy neutral theme inspired by natural stone and sandstone.
 * Core palette: #28282A, #84848B, #D8D8DB, #F5F5F3, #FFFFFF
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
    background: ['#F5F5F3', '#1a1a1c'],
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
    // Core: #28282A, #84848B, #D8D8DB, #F5F5F3, #FFFFFF
    // =========================================================================

    // Core semantic
    '--color-accent': ['#28282A', '#F5F5F3'],
    '--color-accent-muted': ['#28282A14', '#F5F5F320'],
    '--color-neutral': ['#28282A0F', '#F5F5F31A'],
    '--color-background-surface': ['#FFFFFF', '#1a1a1c'],
    '--color-background-body': ['#F5F5F3', '#111113'],
    '--color-overlay': ['#28282A80', '#28282ACC'],
    '--color-overlay-hover': ['#28282A0D', '#F5F5F30D'],
    '--color-overlay-pressed': ['#28282A1A', '#F5F5F31A'],
    '--color-background-muted': ['#F5F5F3', '#28282A'],

    // Text
    '--color-text-primary': ['#28282A', '#F5F5F3'],
    '--color-text-secondary': ['#84848B', '#a1a1a6'],
    '--color-text-disabled': ['#D8D8DB', '#5a5a60'],
    '--color-text-accent': ['#28282A', '#F5F5F3'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#28282A',
    '--color-on-accent': ['#FFFFFF', '#28282A'],
    '--color-on-success': ['#374c36', '#a7d1a6'],
    '--color-on-error': ['#58413e', '#e9bcb5'],
    '--color-on-warning': ['#524622', '#dec47f'],

    // Icon
    '--color-icon-accent': ['#28282A', '#F5F5F3'],
    '--color-icon-primary': ['#28282A', '#F5F5F3'],
    '--color-icon-secondary': ['#84848B', '#a1a1a6'],
    '--color-icon-disabled': ['#D8D8DB', '#5a5a60'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#1e1e20'],
    '--color-background-popover': ['#FFFFFF', '#28282A'],
    '--color-background-inverted': ['#28282A', '#F5F5F3'],

    // Status / Sentiment — uses default border for input borders
    '--color-success': ['#84848B', '#5a5a60'],
    '--color-success-muted': ['#d0e9ce', '#a7d1a6'],
    '--color-error': ['#84848B', '#5a5a60'],
    '--color-error-muted': ['#f9dcd7', '#e9bcb5'],
    '--color-warning': ['#84848B', '#5a5a60'],
    '--color-warning-muted': ['#f4e1b7', '#dec47f'],

    // Border
    '--color-border': ['#DCDCDB', '#F5F5F31A'],
    '--color-border-emphasized': ['#84848B', '#5a5a60'],

    // Effects
    '--color-skeleton': ['#D8D8DB', '#5a5a60'],
    '--color-shadow': ['#28282A1A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical — Blue (indigo blue)
    // H=265 | Light: C=10 BG=T90/T30/T85 | Dark: C=16 BG=T80/T20/T75
    '--color-background-blue': ['#d7e4f5', '#b3c8e4'],
    '--color-border-blue': ['#c9d6e7', '#a5bbd6'],
    '--color-icon-blue': ['#3c4856', '#1c3247'],
    '--color-text-blue': ['#3c4856', '#1c3247'],

    // Categorical — Cyan (aqua cyan)
    // H=190 | Light: C=10 BG=T90/T30/T85 | Dark: C=16 BG=T80/T20/T75
    '--color-background-cyan': ['#cce8e5', '#a2cfcb'],
    '--color-border-cyan': ['#bedad7', '#94c1bd'],
    '--color-icon-cyan': ['#334b49', '#083734'],
    '--color-text-cyan': ['#334b49', '#083734'],

    // Categorical — Gray (warm stone)
    // H=91 | Light: C=6 BG=T90/T30/T85 | Dark: C=10 BG=T80/T20/T75
    '--color-background-gray': ['#e7e2d7', '#cec6b4'],
    '--color-border-gray': ['#d9d4c9', '#c0b8a6'],
    '--color-icon-gray': ['#4a463d', '#353022'],
    '--color-text-gray': ['#4a463d', '#353022'],

    // Categorical — Green (sage green)
    // H=142 | Light: C=17 BG=T90/T30/T85 | Dark: C=28 BG=T80/T20/T75
    '--color-background-green': ['#d0e9ce', '#a7d1a6'],
    '--color-border-green': ['#c2dbc0', '#9ac398'],
    '--color-icon-green': ['#374c36', '#123816'],
    '--color-text-green': ['#374c36', '#123816'],

    // Categorical — Orange (warm amber)
    // H=70 | Light: C=22 BG=T90/T30/T85 | Dark: C=36 BG=T80/T20/T75
    '--color-background-orange': ['#ffdcbb', '#f1bd88'],
    '--color-border-orange': ['#f1ceae', '#e2af7b'],
    '--color-icon-orange': ['#5b4227', '#4b2800'],
    '--color-text-orange': ['#5b4227', '#4b2800'],

    // Categorical — Pink (dusty rose)
    // H=340 | Light: C=9 BG=T90/T30/T85 | Dark: C=15 BG=T80/T20/T75
    '--color-background-pink': ['#f0dde8', '#ddbed0'],
    '--color-border-pink': ['#e2cfda', '#cfb0c2'],
    '--color-icon-pink': ['#52424c', '#412938'],
    '--color-text-pink': ['#52424c', '#412938'],

    // Categorical — Purple (dusty lavender)
    // H=307 | Light: C=11 BG=T90/T30/T85 | Dark: C=18 BG=T80/T20/T75
    '--color-background-purple': ['#e8dff3', '#cec1e1'],
    '--color-border-purple': ['#d9d1e5', '#c1b3d3'],
    '--color-icon-purple': ['#4b4454', '#362c45'],
    '--color-text-purple': ['#4b4454', '#362c45'],

    // Categorical — Red (terracotta)
    // H=33 | Light: C=11 BG=T90/T30/T85 | Dark: C=18 BG=T80/T20/T75
    '--color-background-red': ['#f9dcd7', '#e9bcb5'],
    '--color-border-red': ['#ebcec9', '#dbaea7'],
    '--color-icon-red': ['#58413e', '#492723'],
    '--color-text-red': ['#58413e', '#492723'],

    // Categorical — Teal (sage-teal)
    // H=158 | Light: C=9 BG=T90/T30/T85 | Dark: C=15 BG=T80/T20/T75
    '--color-background-teal': ['#d4e7dc', '#afcebb'],
    '--color-border-teal': ['#c6d9ce', '#a1c0ae'],
    '--color-icon-teal': ['#3b4a41', '#1c3628'],
    '--color-text-teal': ['#3b4a41', '#1c3628'],

    // Categorical — Yellow (warm gold)
    // H=90 | Light: C=23 BG=T90/T30/T85 | Dark: C=38 BG=T80/T20/T75
    '--color-background-yellow': ['#f4e1b7', '#dec47f'],
    '--color-border-yellow': ['#e5d3a9', '#d0b672'],
    '--color-icon-yellow': ['#524622', '#3d2f00'],
    '--color-text-yellow': ['#524622', '#3d2f00'],

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
    },

    badge: {
      'variant:info': {
        backgroundColor: 'var(--color-background-blue)',
        color: 'var(--color-text-blue)',
      },
      'variant:neutral': {
        backgroundColor: 'var(--color-neutral)',
        color: 'var(--color-text-primary)',
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
        backgroundColor: 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
      },
      'status:success': {
        backgroundColor: 'var(--color-background-green)',
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
        '--color-success': 'var(--color-text-green)',
      },
      'status:warning': {
        backgroundColor: 'var(--color-background-yellow)',
        '--color-text-primary': 'var(--color-text-yellow)',
        '--color-text-secondary': 'var(--color-text-yellow)',
        '--color-warning': 'var(--color-text-yellow)',
      },
      'status:error': {
        backgroundColor: 'var(--color-background-red)',
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
        '--color-error': 'var(--color-text-red)',
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
