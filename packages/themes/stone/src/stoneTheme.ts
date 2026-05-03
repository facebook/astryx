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
    '--color-on-success': ['#FFFFFF', '#28282A'],
    '--color-on-error': ['#FFFFFF', '#28282A'],
    '--color-on-warning': ['#28282A', '#28282A'],

    // Icon
    '--color-icon-accent': ['#28282A', '#F5F5F3'],
    '--color-icon-primary': ['#28282A', '#F5F5F3'],
    '--color-icon-secondary': ['#84848B', '#a1a1a6'],
    '--color-icon-disabled': ['#D8D8DB', '#5a5a60'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#1e1e20'],
    '--color-background-popover': ['#FFFFFF', '#28282A'],
    '--color-background-inverted': ['#28282A', '#F5F5F3'],

    // Status / Sentiment
    '--color-success': ['#109936', '#34c265'],
    '--color-success-muted': ['#10993620', '#34c26520'],
    '--color-error': ['#FD0000', '#ff5c5c'],
    '--color-error-muted': ['#FD000020', '#ff5c5c20'],
    '--color-warning': ['#FFB600', '#ffc940'],
    '--color-warning-muted': ['#FFB60020', '#ffc94020'],

    // Border
    '--color-border': ['#D8D8DB', '#F5F5F31A'],
    '--color-border-emphasized': ['#84848B', '#5a5a60'],

    // Effects
    '--color-skeleton': ['#D8D8DB', '#5a5a60'],
    '--color-shadow': ['#28282A1A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical — Blue
    '--color-background-blue': ['#3a5e8c33', '#3a5e8c33'],
    '--color-border-blue': ['#3a5e8c', '#7ba8d4'],
    '--color-icon-blue': ['#3a5e8c', '#7ba8d4'],
    '--color-text-blue': ['#2e4a6e', '#8dbce0'],

    // Categorical — Cyan
    '--color-background-cyan': ['#3a7c7c33', '#3a7c7c33'],
    '--color-border-cyan': ['#3a7c7c', '#70c4c4'],
    '--color-icon-cyan': ['#3a7c7c', '#70c4c4'],
    '--color-text-cyan': ['#2e6060', '#82d4d4'],

    // Categorical — Gray
    '--color-background-gray': ['#84848B33', '#5a5a6033'],
    '--color-border-gray': ['#84848B', '#84848B'],
    '--color-icon-gray': ['#84848B', '#a1a1a6'],
    '--color-text-gray': ['#28282A', '#F5F5F3'],

    // Categorical — Green
    '--color-background-green': ['#10993633', '#34c26533'],
    '--color-border-green': ['#109936', '#34c265'],
    '--color-icon-green': ['#109936', '#34c265'],
    '--color-text-green': ['#0d7a2b', '#3fd672'],

    // Categorical — Orange
    '--color-background-orange': ['#c4762033', '#d4903a33'],
    '--color-border-orange': ['#c47620', '#d4903a'],
    '--color-icon-orange': ['#c47620', '#d4903a'],
    '--color-text-orange': ['#a06018', '#e0a04a'],

    // Categorical — Pink
    '--color-background-pink': ['#c44a7033', '#e07a9a33'],
    '--color-border-pink': ['#c44a70', '#e07a9a'],
    '--color-icon-pink': ['#c44a70', '#e07a9a'],
    '--color-text-pink': ['#a03a5a', '#f08aaa'],

    // Categorical — Purple
    '--color-background-purple': ['#6b4a8c33', '#b08ed433'],
    '--color-border-purple': ['#6b4a8c', '#b08ed4'],
    '--color-icon-purple': ['#6b4a8c', '#b08ed4'],
    '--color-text-purple': ['#553a70', '#c0a0e0'],

    // Categorical — Red
    '--color-background-red': ['#FD000033', '#ff5c5c33'],
    '--color-border-red': ['#FD0000', '#ff5c5c'],
    '--color-icon-red': ['#FD0000', '#ff5c5c'],
    '--color-text-red': ['#cc0000', '#ff7a7a'],

    // Categorical — Teal
    '--color-background-teal': ['#2e6b5a33', '#5ab89833'],
    '--color-border-teal': ['#2e6b5a', '#5ab898'],
    '--color-icon-teal': ['#2e6b5a', '#5ab898'],
    '--color-text-teal': ['#245546', '#6ccaaa'],

    // Categorical — Yellow
    '--color-background-yellow': ['#FFB60033', '#ffc94033'],
    '--color-border-yellow': ['#FFB600', '#ffc940'],
    '--color-icon-yellow': ['#FFB600', '#ffc940'],
    '--color-text-yellow': ['#cc9200', '#ffd960'],

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
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #10993650',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #FFB60050',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #FD000050',
  },

  components: {
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
      'variant:secondary': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
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
