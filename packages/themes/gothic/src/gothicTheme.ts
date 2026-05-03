/**
 * Gothic Theme
 *
 * A dark-first theme with deep blue-gray tones and blackletter headings.
 * Core palette: #E8F1F6, #96A0AB, #495056, #24292D, #101314
 * Uses Manufacturing Consent for headings and Fustat for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {gothicIconRegistry} from './icons';

/** Gothic syntax palette — cool, muted tones for dark backgrounds. */
const gothicSyntax = defineSyntaxTheme({
  name: 'xds-gothic',
  tokens: {
    keyword: ['#7c3aed', '#a78bfa'],
    string: ['#16653a', '#6ee7a0'],
    comment: ['#495056', '#495056'],
    number: ['#b45309', '#fbbf24'],
    function: ['#2563eb', '#60a5fa'],
    type: ['#7c3aed', '#c4b5fd'],
    variable: ['#101314', '#E8F1F6'],
    operator: ['#495056', '#96A0AB'],
    constant: ['#b45309', '#fbbf24'],
    tag: ['#dc2626', '#fca5a5'],
    attribute: ['#a16207', '#fde68a'],
    property: ['#0d9488', '#5eead4'],
    punctuation: ['#96A0AB', '#495056'],
    background: ['#f8f9fa', '#101314'],
  },
});

export const gothicTheme = defineTheme({
  name: 'gothic',

  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Fustat',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Manufacturing Consent',
      fallbacks:
        '"UnifrakturMaguntia", "Old English Text MT", serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: gothicSyntax,

  tokens: {
    // =========================================================================
    // Colors — dark gothic palette
    // Core: #E8F1F6, #96A0AB, #495056, #24292D, #101314
    // =========================================================================

    // Core semantic
    '--color-accent': ['#24292D', '#E8F1F6'],
    '--color-accent-muted': ['#24292D14', '#E8F1F620'],
    '--color-neutral': ['#24292D0F', '#E8F1F61A'],
    '--color-background-surface': ['#FFFFFF', '#101314'],
    '--color-background-body': ['#f0f3f5', '#101314'],
    '--color-overlay': ['#10131480', '#101314CC'],
    '--color-overlay-hover': ['#1013140D', '#E8F1F60D'],
    '--color-overlay-pressed': ['#1013141A', '#E8F1F61A'],
    '--color-background-muted': ['#f0f3f5', '#24292D'],

    // Text
    '--color-text-primary': ['#101314', '#E8F1F6'],
    '--color-text-secondary': ['#495056', '#96A0AB'],
    '--color-text-disabled': ['#96A0AB', '#495056'],
    '--color-text-accent': ['#24292D', '#E8F1F6'],
    '--color-on-dark': '#E8F1F6',
    '--color-on-light': '#101314',
    '--color-on-accent': ['#FFFFFF', '#101314'],
    '--color-on-success': ['#FFFFFF', '#101314'],
    '--color-on-error': ['#FFFFFF', '#101314'],
    '--color-on-warning': ['#101314', '#101314'],

    // Icon
    '--color-icon-accent': ['#24292D', '#E8F1F6'],
    '--color-icon-primary': ['#101314', '#E8F1F6'],
    '--color-icon-secondary': ['#495056', '#96A0AB'],
    '--color-icon-disabled': ['#96A0AB', '#495056'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#24292D'],
    '--color-background-popover': ['#FFFFFF', '#24292D'],
    '--color-background-inverted': ['#101314', '#E8F1F6'],

    // Status / Sentiment
    '--color-success': ['#4D9900', '#6dbf2a'],
    '--color-success-muted': ['#4D990020', '#6dbf2a20'],
    '--color-error': ['#FD0000', '#ff5c5c'],
    '--color-error-muted': ['#FD000020', '#ff5c5c20'],
    '--color-warning': ['#FFB600', '#ffc940'],
    '--color-warning-muted': ['#FFB60020', '#ffc94020'],

    // Border
    '--color-border': ['#E8F1F6', '#E8F1F61A'],
    '--color-border-emphasized': ['#96A0AB', '#495056'],

    // Effects
    '--color-skeleton': ['#96A0AB', '#495056'],
    '--color-shadow': ['#1013141A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical — Blue
    '--color-background-blue': ['#2563eb33', '#60a5fa33'],
    '--color-border-blue': ['#2563eb', '#60a5fa'],
    '--color-icon-blue': ['#2563eb', '#60a5fa'],
    '--color-text-blue': ['#1d4ed8', '#93c5fd'],

    // Categorical — Cyan
    '--color-background-cyan': ['#0891b233', '#22d3ee33'],
    '--color-border-cyan': ['#0891b2', '#22d3ee'],
    '--color-icon-cyan': ['#0891b2', '#22d3ee'],
    '--color-text-cyan': ['#0e7490', '#67e8f9'],

    // Categorical — Gray
    '--color-background-gray': ['#49505633', '#49505633'],
    '--color-border-gray': ['#495056', '#96A0AB'],
    '--color-icon-gray': ['#495056', '#96A0AB'],
    '--color-text-gray': ['#101314', '#E8F1F6'],

    // Categorical — Green
    '--color-background-green': ['#4D990033', '#6dbf2a33'],
    '--color-border-green': ['#4D9900', '#6dbf2a'],
    '--color-icon-green': ['#4D9900', '#6dbf2a'],
    '--color-text-green': ['#3d7a00', '#80d43a'],

    // Categorical — Orange
    '--color-background-orange': ['#ea580c33', '#fb923c33'],
    '--color-border-orange': ['#ea580c', '#fb923c'],
    '--color-icon-orange': ['#ea580c', '#fb923c'],
    '--color-text-orange': ['#c2410c', '#fdba74'],

    // Categorical — Pink
    '--color-background-pink': ['#db277833', '#f472b633'],
    '--color-border-pink': ['#db2778', '#f472b6'],
    '--color-icon-pink': ['#db2778', '#f472b6'],
    '--color-text-pink': ['#be185d', '#f9a8d4'],

    // Categorical — Purple
    '--color-background-purple': ['#7c3aed33', '#a78bfa33'],
    '--color-border-purple': ['#7c3aed', '#a78bfa'],
    '--color-icon-purple': ['#7c3aed', '#a78bfa'],
    '--color-text-purple': ['#6d28d9', '#c4b5fd'],

    // Categorical — Red
    '--color-background-red': ['#FD000033', '#ff5c5c33'],
    '--color-border-red': ['#FD0000', '#ff5c5c'],
    '--color-icon-red': ['#FD0000', '#ff5c5c'],
    '--color-text-red': ['#cc0000', '#ff7a7a'],

    // Categorical — Teal
    '--color-background-teal': ['#0d948833', '#5eead433'],
    '--color-border-teal': ['#0d9488', '#5eead4'],
    '--color-icon-teal': ['#0d9488', '#5eead4'],
    '--color-text-teal': ['#0f766e', '#99f6e4'],

    // Categorical — Yellow
    '--color-background-yellow': ['#FFB60033', '#ffc94033'],
    '--color-border-yellow': ['#FFB600', '#ffc940'],
    '--color-icon-yellow': ['#FFB600', '#ffc940'],
    '--color-text-yellow': ['#cc9200', '#ffd960'],

    // =========================================================================
    // Radius — subtle rounding
    // =========================================================================
    '--radius-none': '0.125rem',
    '--radius-inner': '0.25rem',
    '--radius-element': '0.5rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — cool-toned
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #1013140D, 0 4px 8px #1013141A',
    '--shadow-med':
      '0 2px 4px #1013140D, 0 4px 12px #1013141A',
    '--shadow-high':
      '0 4px 6px #1013141A, 0 12px 24px #10131426',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #96A0AB30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #96A0AB50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #4D990050',
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

  icons: gothicIconRegistry,
});
