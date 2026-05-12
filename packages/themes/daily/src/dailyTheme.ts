/**
 * Daily Theme
 *
 * A warm, productivity-focused theme with earthy cream tones.
 * Core palette: #292724, #85817A, #E6E3DE, #F8F4ED, #FFFFFF
 * Uses PT Serif italic for display text and Figtree for headings/body.
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
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
    '--color-background-blue': ['#d9dbe4', '#1e1f27'],
    '--color-border-blue': ['#2E3968', '#45569c'],
    '--color-icon-blue': ['#2E3968', '#45569c'],
    '--color-text-blue': ['#1e2544', '#4a5ba6'],

    // Categorical — Cyan
    '--color-background-cyan': ['#dcecee', '#203233'],
    '--color-border-cyan': ['#3a95a1', '#57e0f2'],
    '--color-icon-cyan': ['#3a95a1', '#57e0f2'],
    '--color-text-cyan': ['#266169', '#5deeff'],

    // Categorical — Gray
    '--color-background-gray': ['#85817A33', '#5c595533'],
    '--color-border-gray': ['#85817A', '#85817A'],
    '--color-icon-gray': ['#85817A', '#a19d96'],
    '--color-text-gray': ['#292724', '#F8F4ED'],

    // Categorical — Green
    '--color-background-green': ['#dee4d9', '#24291b'],
    '--color-border-green': ['#4a672d', '#6f9a44'],
    '--color-icon-green': ['#4a672d', '#6f9a44'],
    '--color-text-green': ['#30431d', '#76a548'],

    // Categorical — Orange
    '--color-background-orange': ['#f3e3d6', '#3b2818'],
    '--color-border-orange': ['#bf661d', '#ff992c'],
    '--color-icon-orange': ['#bf661d', '#ff992c'],
    '--color-text-orange': ['#7c4213', '#ffa32e'],

    // Categorical — Pink
    '--color-background-pink': ['#f3deec', '#3a2331'],
    '--color-border-pink': ['#bc4997', '#ff6ee2'],
    '--color-icon-pink': ['#bc4997', '#ff6ee2'],
    '--color-text-pink': ['#7a2f62', '#ff75f2'],

    // Categorical — Purple
    '--color-background-purple': ['#eadef3', '#312338'],
    '--color-border-purple': ['#8B49BC', '#d06eff'],
    '--color-icon-purple': ['#8B49BC', '#d06eff'],
    '--color-text-purple': ['#5a2f7a', '#de75ff'],

    // Categorical — Red
    '--color-background-red': ['#f3ded6', '#3b2318'],
    '--color-border-red': ['#BE491D', '#ff6e2c'],
    '--color-icon-red': ['#BE491D', '#ff6e2c'],
    '--color-text-red': ['#7c2f13', '#ff752e'],

    // Categorical — Teal
    '--color-background-teal': ['#dbe8e3', '#202d26'],
    '--color-border-teal': ['#367d62', '#51bc93'],
    '--color-icon-teal': ['#367d62', '#51bc93'],
    '--color-text-teal': ['#235140', '#56c89d'],

    // Categorical — Yellow
    '--color-background-yellow': ['#fff9e6', '#474129'],
    '--color-border-yellow': ['#fddf72', '#fce86a'],
    '--color-icon-yellow': ['#fddf72', '#fce86a'],
    '--color-text-yellow': ['#8a6d10', '#ffe94d'],

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
        backgroundColor: '#E6E3DE',
        color: '#292724',
      },
    },

    // Display text uses PT Serif italic — the signature editorial display face
    text: {
      'type:display-1': {
        fontFamily: '"PT Serif", Georgia, "Times New Roman", Times, serif',
        fontStyle: 'italic',
      },
      'type:display-2': {
        fontFamily: '"PT Serif", Georgia, "Times New Roman", Times, serif',
        fontStyle: 'italic',
      },
      'type:display-3': {
        fontFamily: '"PT Serif", Georgia, "Times New Roman", Times, serif',
        fontStyle: 'italic',
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
