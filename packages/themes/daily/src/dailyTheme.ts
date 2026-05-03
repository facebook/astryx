/**
 * Daily Theme
 *
 * A warm, productivity-focused theme with earthy cream tones.
 * Core palette: #292724, #85817A, #E6E3DE, #F8F4ED, #FFFFFF
 * Uses PT Serif for headings and Figtree for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {dailyIconRegistry} from './icons';

/** Daily syntax palette — warm, muted tones to match the earthy aesthetic. */
const dailySyntax = defineSyntaxTheme({
  name: 'xds-daily',
  tokens: {
    keyword: ['#7c5e3a', '#c4a882'],
    string: ['#2e6b4a', '#7bc49e'],
    comment: ['#85817A', '#85817A'],
    number: ['#a16830', '#d4a06a'],
    function: ['#3a5e8c', '#7ba8d4'],
    type: ['#6b4a8c', '#b08ed4'],
    variable: ['#292724', '#E6E3DE'],
    operator: ['#85817A', '#a19d96'],
    constant: ['#a16830', '#d4a06a'],
    tag: ['#b5463a', '#e08a82'],
    attribute: ['#8c6b30', '#d4b870'],
    property: ['#3a7c6b', '#70c4b0'],
    punctuation: ['#85817A', '#5c5955'],
    background: ['#F8F4ED', '#1a1917'],
  },
});

export const dailyTheme = defineTheme({
  name: 'daily',

  typography: {
    scale: {base: 16, ratio: 1.25},
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'PT Serif',
      fallbacks:
        'Georgia, "Times New Roman", Times, serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  motion: {fast: 150, medium: 350, slow: 800, ratio: 0.75},

  syntax: dailySyntax,

  tokens: {
    // =========================================================================
    // Colors — warm daily palette
    // Core: #292724, #85817A, #E6E3DE, #F8F4ED, #FFFFFF
    // =========================================================================

    // Core semantic
    '--color-accent': ['#292724', '#F8F4ED'],
    '--color-accent-muted': ['#29272414', '#F8F4ED20'],
    '--color-neutral': ['#2927240F', '#F8F4ED1A'],
    '--color-background-surface': ['#FFFFFF', '#1a1917'],
    '--color-background-body': ['#F8F4ED', '#121110'],
    '--color-overlay': ['#29272480', '#292724CC'],
    '--color-overlay-hover': ['#2927240D', '#F8F4ED0D'],
    '--color-overlay-pressed': ['#2927241A', '#F8F4ED1A'],
    '--color-background-muted': ['#F8F4ED', '#292724'],

    // Text
    '--color-text-primary': ['#292724', '#F8F4ED'],
    '--color-text-secondary': ['#85817A', '#a19d96'],
    '--color-text-disabled': ['#E6E3DE', '#5c5955'],
    '--color-text-accent': ['#292724', '#F8F4ED'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#292724',
    '--color-on-accent': ['#FFFFFF', '#292724'],
    '--color-on-success': ['#FFFFFF', '#292724'],
    '--color-on-error': ['#FFFFFF', '#292724'],
    '--color-on-warning': ['#292724', '#292724'],

    // Icon
    '--color-icon-accent': ['#292724', '#F8F4ED'],
    '--color-icon-primary': ['#292724', '#F8F4ED'],
    '--color-icon-secondary': ['#85817A', '#a19d96'],
    '--color-icon-disabled': ['#E6E3DE', '#5c5955'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#1e1d1b'],
    '--color-background-popover': ['#FFFFFF', '#292724'],
    '--color-background-inverted': ['#292724', '#F8F4ED'],

    // Status / Sentiment
    '--color-success': ['#009936', '#34c265'],
    '--color-success-muted': ['#00993620', '#34c26520'],
    '--color-error': ['#FD0000', '#ff5c5c'],
    '--color-error-muted': ['#FD000020', '#ff5c5c20'],
    '--color-warning': ['#FFB600', '#ffc940'],
    '--color-warning-muted': ['#FFB60020', '#ffc94020'],

    // Border
    '--color-border': ['#E6E3DE', '#F8F4ED1A'],
    '--color-border-emphasized': ['#85817A', '#5c5955'],

    // Effects
    '--color-skeleton': ['#E6E3DE', '#5c5955'],
    '--color-shadow': ['#2927241A', '#0000004D'],
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
    '--color-background-gray': ['#85817A33', '#5c595533'],
    '--color-border-gray': ['#85817A', '#85817A'],
    '--color-icon-gray': ['#85817A', '#a19d96'],
    '--color-text-gray': ['#292724', '#F8F4ED'],

    // Categorical — Green
    '--color-background-green': ['#00993633', '#34c26533'],
    '--color-border-green': ['#009936', '#34c265'],
    '--color-icon-green': ['#009936', '#34c265'],
    '--color-text-green': ['#007a2b', '#3fd672'],

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
    // Spacing
    // =========================================================================
    '--spacing-0-5': '3px',
    '--spacing-1': '6px',
    '--spacing-1-5': '9px',
    '--spacing-2': '12px',
    '--spacing-3': '18px',
    '--spacing-4': '24px',
    '--spacing-5': '30px',
    '--spacing-6': '36px',
    '--spacing-7': '42px',
    '--spacing-8': '48px',
    '--spacing-9': '54px',
    '--spacing-10': '60px',
    '--spacing-11': '66px',
    '--spacing-12': '72px',

    // =========================================================================
    // Radius — clean and rounded
    // =========================================================================
    '--radius-inner': '6px',
    '--radius-element': '12px',
    '--radius-container': '18px',
    '--radius-page': '42px',

    // =========================================================================
    // Font sizes
    // =========================================================================
    '--font-size-4xs': '0.3125rem',
    '--font-size-sm': '0.8125rem',
    '--font-size-base': '1rem',
    '--font-size-lg': '1.25rem',
    '--font-size-xl': '1.5625rem',
    '--font-size-2xl': '1.9375rem',
    '--font-size-3xl': '2.4375rem',
    '--font-size-4xl': '3.0625rem',
    '--font-size-5xl': '3.8125rem',

    // =========================================================================
    // Element sizes
    // =========================================================================
    '--size-element-sm': '34px',
    '--size-element-md': '40px',
    '--size-element-lg': '46px',

    // =========================================================================
    // Shadows
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #2927240D, 0 4px 8px #2927241A',
    '--shadow-med':
      '0 2px 4px #2927240D, 0 4px 12px #2927241A',
    '--shadow-high':
      '0 4px 6px #2927241A, 0 12px 24px #29272426',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #29272430',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #29272450',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #00993650',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #FFB60050',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #FD000050',
  },

  components: {
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
      'variant:primary': {
        backgroundColor: '#292724',
        color: '#FFFFFF',
      },
      'variant:secondary': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#292724',
        color: '#292724',
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

  icons: dailyIconRegistry,
});
