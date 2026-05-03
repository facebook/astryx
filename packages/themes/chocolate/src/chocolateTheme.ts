/**
 * Chocolate Theme
 *
 * A warm, cozy theme inspired by rich chocolate and caramel tones.
 * Core palette: #8C5927, #B88859, #C4AC95, #EDE4D4, #FFFCF7
 * Uses Fraunces for headings and Albert Sans for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {chocolateIconRegistry} from './icons';

/** Chocolate syntax palette — warm browns and amber tones. */
const chocolateSyntax = defineSyntaxTheme({
  name: 'xds-chocolate',
  tokens: {
    keyword: ['#8C5927', '#d4a06a'],
    string: ['#2e6b4a', '#7bc49e'],
    comment: ['#B88859', '#B88859'],
    number: ['#a06018', '#d4b870'],
    function: ['#3a5e8c', '#7ba8d4'],
    type: ['#6b4a8c', '#b08ed4'],
    variable: ['#4a3520', '#EDE4D4'],
    operator: ['#B88859', '#c4a882'],
    constant: ['#a06018', '#d4b870'],
    tag: ['#8c3a3a', '#d47a7a'],
    attribute: ['#8C5927', '#d4a06a'],
    property: ['#3a7c6b', '#70c4b0'],
    punctuation: ['#B88859', '#6b5540'],
    background: ['#FFFCF7', '#1c1610'],
  },
});

export const chocolateTheme = defineTheme({
  name: 'chocolate',

  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Albert Sans',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Fraunces',
      fallbacks:
        'Georgia, "Times New Roman", Times, serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: chocolateSyntax,

  tokens: {
    // =========================================================================
    // Colors — warm chocolate palette
    // Core: #8C5927, #B88859, #C4AC95, #EDE4D4, #FFFCF7
    // =========================================================================

    // Core semantic
    '--color-accent': ['#8C5927', '#d4a06a'],
    '--color-accent-muted': ['#8C592714', '#d4a06a20'],
    '--color-neutral': ['#8C59270F', '#EDE4D41A'],
    '--color-background-surface': ['#FFFCF7', '#1c1610'],
    '--color-background-body': ['#FFFCF7', '#141010'],
    '--color-overlay': ['#4a352080', '#140e0aCC'],
    '--color-overlay-hover': ['#4a35200D', '#EDE4D40D'],
    '--color-overlay-pressed': ['#4a35201A', '#EDE4D41A'],
    '--color-background-muted': ['#EDE4D4', '#2a2018'],

    // Text
    '--color-text-primary': ['#4a3520', '#EDE4D4'],
    '--color-text-secondary': ['#B88859', '#c4a882'],
    '--color-text-disabled': ['#C4AC95', '#6b5540'],
    '--color-text-accent': ['#8C5927', '#d4a06a'],
    '--color-on-dark': '#FFFCF7',
    '--color-on-light': '#4a3520',
    '--color-on-accent': ['#FFFFFF', '#4a3520'],
    '--color-on-success': ['#FFFFFF', '#4a3520'],
    '--color-on-error': ['#FFFFFF', '#4a3520'],
    '--color-on-warning': ['#4a3520', '#4a3520'],

    // Icon
    '--color-icon-accent': ['#8C5927', '#d4a06a'],
    '--color-icon-primary': ['#4a3520', '#EDE4D4'],
    '--color-icon-secondary': ['#B88859', '#c4a882'],
    '--color-icon-disabled': ['#C4AC95', '#6b5540'],

    // Surface variants
    '--color-background-card': ['#EDE4D4', '#2a2018'],
    '--color-background-popover': ['#FFFCF7', '#2a2018'],
    '--color-background-inverted': ['#4a3520', '#EDE4D4'],

    // Status / Sentiment
    '--color-success': ['#709900', '#96bf2a'],
    '--color-success-muted': ['#70990020', '#96bf2a20'],
    '--color-error': ['#FD0000', '#ff5c5c'],
    '--color-error-muted': ['#FD000020', '#ff5c5c20'],
    '--color-warning': ['#FFB600', '#ffc940'],
    '--color-warning-muted': ['#FFB60020', '#ffc94020'],

    // Border
    '--color-border': ['#C4AC95', '#EDE4D41A'],
    '--color-border-emphasized': ['#B88859', '#6b5540'],

    // Effects
    '--color-skeleton': ['#C4AC95', '#6b5540'],
    '--color-shadow': ['#4a35201A', '#0000004D'],
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
    '--color-background-gray': ['#B8885933', '#6b554033'],
    '--color-border-gray': ['#B88859', '#B88859'],
    '--color-icon-gray': ['#B88859', '#c4a882'],
    '--color-text-gray': ['#4a3520', '#EDE4D4'],

    // Categorical — Green
    '--color-background-green': ['#70990033', '#96bf2a33'],
    '--color-border-green': ['#709900', '#96bf2a'],
    '--color-icon-green': ['#709900', '#96bf2a'],
    '--color-text-green': ['#5a7a00', '#a8d43a'],

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
    // Radius — soft and rounded
    // =========================================================================
    '--radius-none': '0.125rem',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.625rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — warm-toned
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #4a35200D, 0 4px 8px #4a35201A',
    '--shadow-med':
      '0 2px 4px #4a35200D, 0 4px 12px #4a35201A',
    '--shadow-high':
      '0 4px 6px #4a35201A, 0 12px 24px #4a352026',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #8C592730',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #8C592750',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #70990050',
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
        borderColor: 'var(--color-border-emphasized)',
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

  icons: chocolateIconRegistry,
});
