/**
 * Astryx Theme
 *
 * A warm, productivity-focused theme with earthy cream tones.
 * Core palette: #292724, #85817A, #E6E3DE, #F8F4ED, #FFFFFF
 * Uses PT Serif italic for display text and Figtree for headings/body.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {dailyIconRegistry} from './icons';

/** Astryx syntax palette — warm, muted tones to match the earthy aesthetic. */
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
    // Colors — warm astryx palette
    // Core: #292724, #85817A, #E6E3DE, #F8F4ED, #FFFFFF
    // =========================================================================

    // Core semantic
    '--color-accent': ['#292724', '#F8F4ED'],
    '--color-accent-muted': ['#1779FA40', '#1779FA40'],
    '--color-neutral': ['#2927240F', '#F8F4ED1A'],
    '--color-background-surface': ['#FFFFFF', '#1a1917'],
    '--color-background-body': ['#F8F4ED', '#121110'],
    '--color-overlay': ['#29272480', '#292724CC'],
    '--color-overlay-hover': ['#2927240D', '#F8F4ED0D'],
    '--color-overlay-pressed': ['#2927241A', '#F8F4ED1A'],
    '--color-background-muted': ['#E6E3DE', '#292724'],

    // Text
    '--color-text-primary': ['#292724', '#F8F4ED'],
    '--color-text-secondary': ['#85817A', '#a19d96'],
    '--color-text-disabled': ['#c9c6c1', '#5c5955'],
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
    '--color-icon-disabled': ['#c9c6c1', '#5c5955'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#1e1d1b'],
    '--color-background-popover': ['#FFFFFF', '#292724'],
    '--color-background-inverted': ['#292724', '#F8F4ED'],

    // Status / Sentiment
    '--color-success': ['#009936', '#34c265'],
    '--color-success-muted': ['#00993640', '#34c26540'],
    '--color-error': ['#FD0000', '#ff5c5c'],
    '--color-error-muted': ['#FD000040', '#ff5c5c40'],
    '--color-warning': ['#F8C722', '#ffd94d'],
    '--color-warning-muted': ['#F8C72240', '#ffd94d40'],

    // Border
    '--color-border': ['#E6E3DE', '#F8F4ED1A'],
    '--color-border-emphasized': ['#85817A', '#5c5955'],

    // Effects
    '--color-skeleton': ['#E6E3DE', '#5c5955'],
    '--color-shadow': ['#2927241A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical — Blue
    '--color-background-blue': ['#cee5ff', '#002840'],
    '--color-border-blue': ['#192973', '#BBDBFE'],
    '--color-icon-blue': ['#192973', '#BBDBFE'],
    '--color-text-blue': ['#192973', '#aacaec'],

    // Categorical — Cyan
    '--color-background-cyan': ['#b4ecf9', '#002a32'],
    '--color-border-cyan': ['#003C4F', '#ACE3F0'],
    '--color-icon-cyan': ['#003C4F', '#ACE3F0'],
    '--color-text-cyan': ['#003C4F', '#99cfdc'],

    // Categorical — Gray
    '--color-background-gray': ['#85817A33', '#5c595533'],
    '--color-border-gray': ['#85817A', '#85817A'],
    '--color-icon-gray': ['#85817A', '#a19d96'],
    '--color-text-gray': ['#292724', '#F8F4ED'],

    // Categorical — Green
    '--color-background-green': ['#c8ecc8', '#002d08'],
    '--color-border-green': ['#006410', '#C0E3C0'],
    '--color-icon-green': ['#006410', '#C0E3C0'],
    '--color-text-green': ['#006410', '#adcfad'],

    // Categorical — Orange
    '--color-background-orange': ['#ffdcc5', '#3d1e00'],
    '--color-border-orange': ['#590801', '#F8CEB2'],
    '--color-icon-orange': ['#590801', '#F8CEB2'],
    '--color-text-orange': ['#590801', '#e8bea3'],

    // Categorical — Pink
    '--color-background-pink': ['#ffd8e6', '#4f032c'],
    '--color-border-pink': ['#8E2149', '#F9C8DA'],
    '--color-icon-pink': ['#8E2149', '#F9C8DA'],
    '--color-text-pink': ['#8E2149', '#eab9cb'],

    // Categorical — Purple
    '--color-background-purple': ['#f7d8ff', '#3d114d'],
    '--color-border-purple': ['#6A218E', '#EACBF2'],
    '--color-icon-purple': ['#6A218E', '#EACBF2'],
    '--color-text-purple': ['#6A218E', '#dbbce3'],

    // Categorical — Red
    '--color-background-red': ['#ffdad8', '#500713'],
    '--color-border-red': ['#A1211D', '#FDC9C7'],
    '--color-icon-red': ['#A1211D', '#FDC9C7'],
    '--color-text-red': ['#A1211D', '#edbab8'],

    // Categorical — Teal
    '--color-background-teal': ['#b5eee1', '#002c25'],
    '--color-border-teal': ['#0D4C3E', '#ADE6D9'],
    '--color-icon-teal': ['#0D4C3E', '#ADE6D9'],
    '--color-text-teal': ['#0D4C3E', '#99d2c5'],

    // Categorical — Yellow
    '--color-background-yellow': ['#fbe098', '#2e2500'],
    '--color-border-yellow': ['#634F19', '#FDE29A'],
    '--color-icon-yellow': ['#634F19', '#FDE29A'],
    '--color-text-yellow': ['#634F19', '#dec47e'],

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
    '--shadow-low': '0 2px 4px #2927240D, 0 4px 8px #2927241A',
    '--shadow-med': '0 2px 4px #2927240D, 0 4px 12px #2927241A',
    '--shadow-high': '0 4px 6px #2927241A, 0 12px 24px #29272426',
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

    // Info badge uses blue instead of the theme accent
    badge: {
      'variant:info': {
        backgroundColor: '#1779FA',
        color: '#FFFFFF',
      },
    },

    // Banner text uses semantic colors for each status
    banner: {
      'status:info': {
        '--color-text-primary': 'light-dark(#1779FA, #79b8ff)',
        '--color-text-secondary': 'light-dark(#1779FA, #79b8ff)',
      },
      'status:success': {
        '--color-text-primary': 'light-dark(#009936, #34c265)',
        '--color-text-secondary': 'light-dark(#009936, #34c265)',
      },
      'status:error': {
        '--color-text-primary': 'light-dark(#FD0000, #ff5c5c)',
        '--color-text-secondary': 'light-dark(#FD0000, #ff5c5c)',
      },
      'status:warning': {
        '--color-text-primary': 'light-dark(#9a7800, #ffd94d)',
        '--color-text-secondary': 'light-dark(#9a7800, #ffd94d)',
      },
    },

    // Info banner icon uses blue — override --color-accent so the
    // child XDSIcon (which reads var(--color-accent)) picks it up
    'banner-icon': {
      'status:info': {
        '--color-accent': '#1779FA',
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
