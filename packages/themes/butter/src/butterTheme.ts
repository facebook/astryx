/**
 * Butter Theme
 *
 * A warm, golden theme inspired by fresh butter and sunlight.
 * Core palette: #4A3800, #8B7230, #C4A84D, #FDEE8C, #FFFDF5
 * Uses Nunito for headings and Inter for body text.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {butterIconRegistry} from './icons';

/** Butter syntax palette — warm golden tones for code highlighting. */
const butterSyntax = defineSyntaxTheme({
  name: 'xds-butter',
  tokens: {
    keyword: ['#7c5e00', '#e4c364'],       // Deep gold / light gold
    string: ['#2d6930', '#7bc47e'],        // Forest green / light green
    comment: ['#8b7a5e', '#b3a688'],       // Warm gray
    number: ['#9c4a00', '#e89850'],        // Burnt orange
    function: ['#2e5a8c', '#6da5d9'],      // Steel blue
    type: ['#7c5e00', '#e4c364'],          // Deep gold
    variable: ['#5c5040', '#a89880'],      // Warm neutral
    operator: ['#5c5040', '#a89880'],      // Warm neutral
    constant: ['#9c4a00', '#e89850'],      // Burnt orange
    tag: ['#8c2e2e', '#d97070'],           // Warm red
    attribute: ['#6b6b00', '#b8b84e'],     // Olive
    property: ['#2d6930', '#7bc47e'],      // Green
    punctuation: ['#5c5040', '#a89880'],   // Warm neutral
    background: ['#FFFDF5', '#1a1500'],
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
    // Colors — warm butter palette
    // Core: #4A3800, #8B7230, #C4A84D, #FDEE8C, #FFFDF5
    // Butter color: #FDEE8C
    // =========================================================================

    // Core semantic — warm golden hues
    '--color-accent': ['#4A3800', '#FDEE8C'],
    '--color-accent-muted': ['#4A380014', '#FDEE8C20'],
    '--color-neutral': ['#4A38000F', '#FDEE8C1A'],
    '--color-background-surface': ['#FFFFFF', '#211c00'],
    '--color-background-body': ['#FFFDF5', '#1a1500'],
    '--color-overlay': ['#4A380080', '#1a1500CC'],
    '--color-overlay-hover': ['#4A38000D', '#FDEE8C0D'],
    '--color-overlay-pressed': ['#4A38001A', '#FDEE8C1A'],
    '--color-background-muted': ['#FFF8E0', '#2a2200'],

    // Text
    '--color-text-primary': ['#2E2200', '#FFF9E6'],
    '--color-text-secondary': ['#8B7230', '#C4A84D'],
    '--color-text-disabled': ['#C4A84D80', '#8B723080'],
    '--color-text-accent': ['#4A3800', '#FDEE8C'],
    '--color-on-dark': '#FFFDF5',
    '--color-on-light': '#2E2200',
    '--color-on-accent': ['#FFFDF5', '#2E2200'],
    '--color-on-success': ['#1a4d1a', '#a8e6a8'],
    '--color-on-error': ['#6b1a1a', '#f5a8a8'],
    '--color-on-warning': ['#6b4d00', '#ffe066'],

    // Icon
    '--color-icon-accent': ['#4A3800', '#FDEE8C'],
    '--color-icon-primary': ['#2E2200', '#FFF9E6'],
    '--color-icon-secondary': ['#8B7230', '#C4A84D'],
    '--color-icon-disabled': ['#C4A84D80', '#8B723080'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#262000'],
    '--color-background-popover': ['#FFFFFF', '#2E2600'],
    '--color-background-inverted': ['#2E2200', '#FFF9E6'],

    // Status / Sentiment
    // Red = Error
    '--color-success': ['#1a6b1a', '#66d966'],
    '--color-success-muted': ['#d4f5d4', '#1a4d1a'],
    '--color-error': ['#8c1a1a', '#f58a8a'],
    '--color-error-muted': ['#fde0e0', '#4d1a1a'],
    '--color-warning': ['#8c6b00', '#ffd633'],
    '--color-warning-muted': ['#fff3cc', '#4d3d00'],

    // Border
    '--color-border': ['#E8DFC0', '#FDEE8C1A'],
    '--color-border-emphasized': ['#8B7230', '#C4A84D'],

    // Effects
    '--color-skeleton': ['#E8DFC0', '#3d3200'],
    '--color-shadow': ['#4A38001A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical — Blue
    '--color-background-blue': ['#dbe8f5', '#2a4060'],
    '--color-border-blue': ['#b8d1ea', '#3d5a7a'],
    '--color-icon-blue': ['#2e5a8c', '#6da5d9'],
    '--color-text-blue': ['#2e5a8c', '#6da5d9'],

    // Categorical — Cyan
    '--color-background-cyan': ['#d4f0ee', '#1a4d4a'],
    '--color-border-cyan': ['#a8e0dc', '#2d6662'],
    '--color-icon-cyan': ['#1a6b66', '#5cc4be'],
    '--color-text-cyan': ['#1a6b66', '#5cc4be'],

    // Categorical — Gray
    '--color-background-gray': ['#eae5dc', '#3d372e'],
    '--color-border-gray': ['#d4cec4', '#574f44'],
    '--color-icon-gray': ['#5c5040', '#a89880'],
    '--color-text-gray': ['#5c5040', '#a89880'],

    // Categorical — Green
    '--color-background-green': ['#d4f0d4', '#1a4d1a'],
    '--color-border-green': ['#a8e0a8', '#2d662d'],
    '--color-icon-green': ['#2d6930', '#7bc47e'],
    '--color-text-green': ['#2d6930', '#7bc47e'],

    // Categorical — Orange
    '--color-background-orange': ['#ffe8cc', '#4d2e00'],
    '--color-border-orange': ['#ffd199', '#664400'],
    '--color-icon-orange': ['#9c4a00', '#e89850'],
    '--color-text-orange': ['#9c4a00', '#e89850'],

    // Categorical — Pink
    '--color-background-pink': ['#f5ddf0', '#4d1a44'],
    '--color-border-pink': ['#eabbe0', '#662d5a'],
    '--color-icon-pink': ['#8c2e7a', '#d970c4'],
    '--color-text-pink': ['#8c2e7a', '#d970c4'],

    // Categorical — Purple
    '--color-background-purple': ['#e8ddf5', '#3a1a60'],
    '--color-border-purple': ['#d1bbea', '#523d7a'],
    '--color-icon-purple': ['#5e2e8c', '#a870d9'],
    '--color-text-purple': ['#5e2e8c', '#a870d9'],

    // Categorical — Red
    '--color-background-red': ['#fde0e0', '#4d1a1a'],
    '--color-border-red': ['#f5bbbb', '#662d2d'],
    '--color-icon-red': ['#8c2e2e', '#d97070'],
    '--color-text-red': ['#8c2e2e', '#d97070'],

    // Categorical — Teal
    '--color-background-teal': ['#d4ede4', '#1a4d3a'],
    '--color-border-teal': ['#a8dcc8', '#2d664d'],
    '--color-icon-teal': ['#1a6b4d', '#5cc4a0'],
    '--color-text-teal': ['#1a6b4d', '#5cc4a0'],

    // Categorical — Yellow
    '--color-background-yellow': ['#FFF3CC', '#4d3d00'],
    '--color-border-yellow': ['#FFE799', '#665200'],
    '--color-icon-yellow': ['#6b5500', '#d4aa00'],
    '--color-text-yellow': ['#6b5500', '#d4aa00'],

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
    // Shadows — warm golden tint
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #4A38000D, 0 4px 8px #4A380012',
    '--shadow-med':
      '0 2px 4px #4A38000D, 0 4px 12px #4A38001A',
    '--shadow-high':
      '0 4px 6px #4A38001A, 0 12px 24px #4A380026',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #C4A84D40',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #C4A84D70',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #1a6b1a40',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #8c6b0040',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #8c1a1a40',
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
        backgroundColor: 'light-dark(#fde0e0, #f58a8a)',
        color: 'light-dark(#8c1a1a, #4d1a1a)',
      },
    },

    badge: {
      'variant:info': {
        backgroundColor: 'light-dark(#dbe8f5, #2a4060)',
        color: 'light-dark(#2e5a8c, #6da5d9)',
      },
      'variant:neutral': {
        backgroundColor: 'light-dark(#eae5dc, #3d372e)',
        color: 'light-dark(#5c5040, #a89880)',
      },
      'variant:success': {
        backgroundColor: 'light-dark(#d4f0d4, #1a4d1a)',
        color: 'light-dark(#1a6b1a, #66d966)',
      },
      'variant:warning': {
        backgroundColor: 'light-dark(#fff3cc, #4d3d00)',
        color: 'light-dark(#8c6b00, #ffd633)',
      },
      'variant:error': {
        backgroundColor: 'light-dark(#fde0e0, #4d1a1a)',
        color: 'light-dark(#8c1a1a, #f58a8a)',
      },
    },

    banner: {
      'status:info': {
        backgroundColor: 'light-dark(#dbe8f5, #2a4060)',
        '--color-text-primary': 'light-dark(#2e5a8c, #6da5d9)',
        '--color-text-secondary': 'light-dark(#2e5a8c, #6da5d9)',
        '--color-accent': 'light-dark(#2e5a8c, #6da5d9)',
      },
      'status:success': {
        backgroundColor: 'light-dark(#d4f0d4, #1a4d1a)',
        '--color-text-primary': 'light-dark(#1a6b1a, #66d966)',
        '--color-text-secondary': 'light-dark(#1a6b1a, #66d966)',
        '--color-success': 'light-dark(#1a6b1a, #66d966)',
      },
      'status:warning': {
        backgroundColor: 'light-dark(#fff3cc, #4d3d00)',
        '--color-text-primary': 'light-dark(#8c6b00, #ffd633)',
        '--color-text-secondary': 'light-dark(#8c6b00, #ffd633)',
        '--color-warning': 'light-dark(#8c6b00, #ffd633)',
      },
      'status:error': {
        backgroundColor: 'light-dark(#fde0e0, #4d1a1a)',
        '--color-text-primary': 'light-dark(#8c1a1a, #f58a8a)',
        '--color-text-secondary': 'light-dark(#8c1a1a, #f58a8a)',
        '--color-error': 'light-dark(#8c1a1a, #f58a8a)',
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
 * Raw tonal palettes — every color at every tone step (0–100 in 5s).
 * Same hue and chroma used to derive all theme tokens.
 * Use these for custom components or data visualization.
 */
export const butterPalettes = {
  neutral: {
    hue: 45, chroma: 12,
    0: '#000000', 5: '#1a1200', 10: '#221a00', 15: '#2e2200', 20: '#3a2e0a',
    25: '#463a16', 30: '#524622', 35: '#5e522e', 40: '#6b5e3a', 45: '#786b46',
    50: '#857852', 55: '#92855e', 60: '#a0926b', 65: '#aea078', 70: '#bcae86',
    75: '#cabc94', 80: '#d8caa2', 85: '#e6d8b0', 90: '#f4e6be', 95: '#fff4cc',
    100: '#ffffff',
  },
  blue: {
    hue: 220, chroma: 25,
    0: '#000000', 5: '#0a1520', 10: '#152030', 15: '#1e2e44', 20: '#2a4060',
    25: '#334d70', 30: '#3d5a7a', 35: '#486888', 40: '#547698', 45: '#6084a8',
    50: '#6d93b8', 55: '#7aa2c8', 60: '#88b0d2', 65: '#96bedd', 70: '#a4cce8',
    75: '#b2daf2', 80: '#c0e4fa', 85: '#d0ecff', 90: '#dbe8f5', 95: '#eef6ff',
    100: '#ffffff',
  },
  cyan: {
    hue: 178, chroma: 20,
    0: '#000000', 5: '#001a18', 10: '#002622', 15: '#003330', 20: '#1a4d4a',
    25: '#2d6662', 30: '#3d7a76', 35: '#4d8e8a', 40: '#5da29e', 45: '#6db6b2',
    50: '#7dcac6', 55: '#8ddeda', 60: '#9df0ec', 65: '#a8f5f2', 70: '#b4faf7',
    75: '#c0fffc', 80: '#ccffff', 85: '#d4f0ee', 90: '#e0f8f6', 95: '#f0fcfb',
    100: '#ffffff',
  },
  green: {
    hue: 130, chroma: 30,
    0: '#000000', 5: '#001a00', 10: '#0a260a', 15: '#143314', 20: '#1a4d1a',
    25: '#226622', 30: '#2d6930', 35: '#388038', 40: '#449944', 45: '#50b050',
    50: '#5cc65c', 55: '#66d966', 70: '#7bc47e', 75: '#8ed98e', 80: '#a8e6a8',
    85: '#b8f0b8', 90: '#d4f0d4', 95: '#e8fae8', 100: '#ffffff',
  },
  teal: {
    hue: 158, chroma: 18,
    0: '#000000', 5: '#001510', 10: '#002018', 15: '#003322', 20: '#1a4d3a',
    25: '#2d664d', 30: '#3d7a60', 35: '#4d8e73', 40: '#5da286', 45: '#6db699',
    50: '#7dcaac', 55: '#8ddebf', 60: '#9df0d0', 65: '#a8f5dc', 70: '#b4fae6',
    75: '#c0ffee', 80: '#ccfff4', 85: '#d4ede4', 90: '#e0f5ec', 95: '#f0faf6',
    100: '#ffffff',
  },
  yellow: {
    hue: 50, chroma: 40,
    0: '#000000', 5: '#1a1200', 10: '#261a00', 15: '#332200', 20: '#4d3d00',
    25: '#665200', 30: '#6b5500', 35: '#806600', 40: '#997a00', 45: '#b38e00',
    50: '#cca300', 55: '#d4aa00', 60: '#e6b800', 65: '#f0c800', 70: '#ffd633',
    75: '#ffe066', 80: '#ffe999', 85: '#FFE799', 90: '#FFF3CC', 95: '#FFF9E6',
    100: '#ffffff',
  },
  orange: {
    hue: 30, chroma: 35,
    0: '#000000', 5: '#200a00', 10: '#301500', 15: '#401e00', 20: '#4d2e00',
    25: '#664400', 30: '#7a5500', 35: '#8e6600', 40: '#9c4a00', 45: '#b36600',
    50: '#cc7a00', 55: '#e08e1a', 60: '#e89850', 65: '#f0a860', 70: '#f5b878',
    75: '#fac890', 80: '#ffd8a8', 85: '#ffd199', 90: '#ffe8cc', 95: '#fff4e6',
    100: '#ffffff',
  },
  red: {
    hue: 0, chroma: 30,
    0: '#000000', 5: '#1a0000', 10: '#2e0a0a', 15: '#401515', 20: '#4d1a1a',
    25: '#662d2d', 30: '#7a3535', 35: '#8c2e2e', 40: '#a03838', 45: '#b34444',
    50: '#cc5555', 55: '#d96666', 60: '#e07777', 65: '#e88888', 70: '#f09a9a',
    75: '#f5abab', 80: '#f5bbbb', 85: '#f8cccc', 90: '#fde0e0', 95: '#fff0f0',
    100: '#ffffff',
  },
  pink: {
    hue: 310, chroma: 20,
    0: '#000000', 5: '#1a0015', 10: '#2e0a26', 15: '#401533', 20: '#4d1a44',
    25: '#662d5a', 30: '#7a3570', 35: '#8c2e7a', 40: '#a03888', 45: '#b34498',
    50: '#cc55aa', 55: '#d966bb', 60: '#e077c4', 65: '#e888d0', 70: '#f09adc',
    75: '#f5abe6', 80: '#f5bbee', 85: '#eabbe0', 90: '#f5ddf0', 95: '#faf0f7',
    100: '#ffffff',
  },
  purple: {
    hue: 270, chroma: 25,
    0: '#000000', 5: '#100020', 10: '#1a0a30', 15: '#261544', 20: '#3a1a60',
    25: '#4d2d7a', 30: '#5a358c', 35: '#5e2e8c', 40: '#7040a0', 45: '#8050b3',
    50: '#9060cc', 55: '#a070d9', 60: '#a870d9', 65: '#b888e0', 70: '#c8a0e8',
    75: '#d8b0f0', 80: '#e0c0f5', 85: '#d1bbea', 90: '#e8ddf5', 95: '#f5f0fa',
    100: '#ffffff',
  },
} as const;
