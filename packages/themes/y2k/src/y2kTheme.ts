/**
 * Y2K Theme
 *
 * A bubbly, playful pop theme inspired by early 2000s aesthetics.
 * Hot pink body, lime green accents, Poppins + Crimson Text typography.
 * Core neutral: H=340 C=3 (warm rose-tinted neutral)
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {y2kIconRegistry} from './icons';

const y2kSyntax = defineSyntaxTheme({
  name: 'xds-y2k',
  tokens: {
    keyword: ['#615a7a', '#aea6ca'],
    string: ['#586242', '#a5af8b'],
    comment: ['#5e5e5e', '#ababab'],
    number: ['#775843', '#c8a48c'],
    function: ['#39637d', '#87b0cd'],
    type: ['#615a7a', '#aea6ca'],
    variable: ['#5e5e5e', '#ababab'],
    operator: ['#5e5e5e', '#ababab'],
    constant: ['#775843', '#c8a48c'],
    tag: ['#7f5351', '#d19f9d'],
    attribute: ['#6c5c3e', '#bca987'],
    property: ['#3c6755', '#87b5a1'],
    punctuation: ['#5e5e5e', '#ababab'],
    background: ['#FFF6ED', '#150f13'],
  },
});

export const y2kTheme = defineTheme({
  name: 'y2k',

  typography: {
    scale: {base: 14, ratio: 1.25},
    body: {
      family: 'Poppins',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Poppins',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  radius: {base: 4, multiplier: 0},

  motion: {fast: 100, medium: 250, slow: 600, ratio: 0.8},

  syntax: y2kSyntax,

  tokens: {
    // =========================================================================
    // Colors — Y2K pop palette
    // Neutral: H=340 C=3 (warm rose-tinted)
    // Accent: lime green (#7B9900)
    // =========================================================================

    // Core semantic — neutral H=340 C=3
    '--color-accent': ['#7B9900', '#d7eaa8'],
    '--color-accent-muted': ['#3a4d1314', '#d7eaa820'],
    '--color-neutral': ['#29242710', '#f5eff31A'],
    '--color-background-surface': ['#FFF6ED', '#1f1a1d'],
    '--color-background-body': ['#FFF6ED', '#150f13'],
    '--color-overlay': ['#29242780', '#292427CC'],
    '--color-overlay-hover': ['#2924270D', '#f5eff30D'],
    '--color-overlay-pressed': ['#2924271A', '#f5eff31A'],
    '--color-background-muted': ['#f5eff3', '#292427'],

    // Text — neutral H=340
    '--color-text-primary': ['#292427', '#f5eff3'],
    '--color-text-secondary': ['#625d60', '#a29ca0'],
    '--color-text-disabled': ['#d9d3d6', '#565154'],
    '--color-text-accent': ['#3a4d13', '#d7eaa8'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#292427',
    '--color-on-accent': ['#FFFFFF', '#292427'],
    '--color-on-success': ['#3a4d13', '#bbce8d'],
    '--color-on-error': ['#713434', '#ffb3b0'],
    '--color-on-warning': ['#5a4300', '#e5c27c'],

    // Icon — neutral H=340
    '--color-icon-accent': ['#3a4d13', '#d7eaa8'],
    '--color-icon-primary': ['#292427', '#f5eff3'],
    '--color-icon-secondary': ['#625d60', '#a29ca0'],
    '--color-icon-disabled': ['#d9d3d6', '#565154'],

    // Surface variants — neutral H=340
    '--color-background-card': ['#FFF6ED', '#242022'],
    '--color-background-popover': ['#FFF6ED', '#292427'],
    '--color-background-inverted': ['#292427', '#f5eff3'],

    // Status / Sentiment — T30 for borders/icons
    '--color-success': ['#3a4d13', '#bbce8d'],
    '--color-success-muted': ['#d7eaa8', '#bbce8d'],
    '--color-error': ['#713434', '#ffb3b0'],
    '--color-error-muted': ['#ffd9d7', '#ffb3b0'],
    '--color-warning': ['#5a4300', '#e5c27c'],
    '--color-warning-muted': ['#ffde9b', '#e5c27c'],

    // Border — neutral H=340
    '--color-border': ['#e7e1e4', '#f5eff31A'],
    '--color-border-emphasized': ['#625d60', '#565154'],

    // Effects
    '--color-skeleton': ['#d9d3d6', '#565154'],
    '--color-shadow': ['#2924271A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical — Green H=120 C=35
    '--color-background-green': ['#d7eaa8', '#9fb373'],
    '--color-border-green': ['#c9dc9a', '#92a566'],
    '--color-icon-green': ['#3a4d13', '#1b2b00'],
    '--color-text-green': ['#3a4d13', '#1b2b00'],

    // Categorical — Red H=25 C=30
    '--color-background-red': ['#ffd9d7', '#e19895'],
    '--color-border-red': ['#ffc6c3', '#d38b88'],
    '--color-icon-red': ['#713434', '#4a1115'],
    '--color-text-red': ['#713434', '#4a1115'],

    // Categorical — Yellow H=85 C=40
    '--color-background-yellow': ['#ffde9b', '#c8a762'],
    '--color-border-yellow': ['#f4d089', '#ba9a56'],
    '--color-icon-yellow': ['#5a4300', '#382300'],
    '--color-text-yellow': ['#5a4300', '#382300'],

    // Categorical — Blue H=250 C=20
    '--color-background-blue': ['#c4e7ff', '#87b0cd'],
    '--color-border-blue': ['#b0daf7', '#7aa3bf'],
    '--color-icon-blue': ['#1e4b64', '#002a40'],
    '--color-text-blue': ['#1e4b64', '#002a40'],

    // Categorical — Pink H=350 C=25
    '--color-background-pink': ['#ffd7e9', '#d39bb4'],
    '--color-border-pink': ['#ffc4dd', '#c58ea6'],
    '--color-icon-pink': ['#68374e', '#42152c'],
    '--color-text-pink': ['#68374e', '#42152c'],

    // Categorical — Purple H=300 C=20
    '--color-background-purple': ['#e6deff', '#aea6ca'],
    '--color-border-purple': ['#d8cff5', '#a199bd'],
    '--color-icon-purple': ['#484362', '#26223e'],
    '--color-text-purple': ['#484362', '#26223e'],

    // Categorical — Cyan H=185 C=18
    '--color-background-cyan': ['#b9ede5', '#83b5ad'],
    '--color-border-cyan': ['#abded7', '#76a7a0'],
    '--color-icon-cyan': ['#1e4e49', '#002c27'],
    '--color-text-cyan': ['#1e4e49', '#002c27'],

    // Categorical — Orange H=60 C=35
    '--color-background-orange': ['#ffdbc3', '#da9e75'],
    '--color-border-orange': ['#ffc9a3', '#cc9168'],
    '--color-icon-orange': ['#6a3b17', '#441a00'],
    '--color-text-orange': ['#6a3b17', '#441a00'],

    // Categorical — Teal H=165 C=15
    '--color-background-teal': ['#c7eada', '#91b3a4'],
    '--color-border-teal': ['#b9dccc', '#84a596'],
    '--color-icon-teal': ['#2f4d40', '#0d2b20'],
    '--color-text-teal': ['#2f4d40', '#0d2b20'],

    // Categorical — Gray (pure neutral C=0)
    '--color-background-gray': ['#e2e2e2', '#ababab'],
    '--color-border-gray': ['#d4d4d4', '#9e9e9e'],
    '--color-icon-gray': ['#474747', '#262626'],
    '--color-text-gray': ['#474747', '#262626'],

    // =========================================================================
    // Radius — sharp / brutalist (multiplier: 0 via radius config + explicit)
    // =========================================================================
    '--radius-none': '0px',
    '--radius-inner': '0px',
    '--radius-element': '0px',
    '--radius-container': '0px',
    '--radius-page': '0px',
    '--radius-full': '0px',

    // =========================================================================
    // Shadows — soft and playful
    // =========================================================================
    '--shadow-low':
      '0 2px 4px #2924270D, 0 4px 8px #2924271A',
    '--shadow-med':
      '0 2px 4px #2924270D, 0 4px 12px #2924271A',
    '--shadow-high':
      '0 4px 6px #2924271A, 0 12px 24px #29242726',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #29242730',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #29242750',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #3a4d1350',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #5a430050',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #71343450',
  },

  components: {
    button: {
      base: {
        borderRadius: '0px',
      },
      'variant:primary': {
        backgroundColor: '#2F292E',
        color: '#FFFFFF',
      },
      'variant:secondary': {
        backgroundColor: 'var(--color-background-green)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#2F292E',
        color: '#2F292E',
        ':hover': {
          backgroundColor: 'var(--color-border-green)',
        },
      },
      'variant:destructive': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
      },
    },

    badge: {
      base: {
        borderRadius: '0px',
      },
      'variant:info': {
        backgroundColor: 'var(--color-background-blue)',
        color: 'var(--color-text-blue)',
      },
      'variant:neutral': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
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
      base: {
        borderRadius: '0px',
      },
      'status:info': {
        backgroundColor: 'var(--color-background-blue)',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
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

    field: {
      base: {
        borderRadius: '0px',
      },
    },

    card: {
      base: {
        borderRadius: '0px',
        padding: 'var(--spacing-3)',
      },
    },

    section: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },
  },

  icons: y2kIconRegistry,
});

/**
 * Raw tonal palettes — every color at every tone step (0-100 in 5s).
 */
export const y2kPalettes = {
  neutral: {
    hue: 340, chroma: 3,
    0: '#000000', 5: '#150f13', 10: '#1f1a1d', 15: '#292427', 20: '#342f32',
    25: '#3f3a3d', 30: '#4a4548', 35: '#565154', 40: '#625d60', 45: '#6f696c',
    50: '#7b7579', 55: '#888285', 60: '#958f92', 65: '#a29ca0', 70: '#b0a9ad',
    75: '#bdb7bb', 80: '#cbc5c8', 85: '#d9d3d6', 90: '#e7e1e4', 95: '#f5eff3',
    100: '#ffffff',
  },
  green: {
    hue: 120, chroma: 35,
    0: '#000000', 5: '#071700', 10: '#152000', 15: '#1b2b00', 20: '#233600',
    25: '#2e4107', 30: '#3a4d13', 35: '#46591f', 40: '#52652a', 45: '#5e7136',
    50: '#6b7e42', 55: '#788b4e', 60: '#85985a', 65: '#92a566', 70: '#9fb373',
    75: '#adc080', 80: '#bbce8d', 85: '#c9dc9a', 90: '#d7eaa8', 95: '#e5f9b5',
    100: '#ffffff',
  },
  red: {
    hue: 25, chroma: 30,
    0: '#000000', 5: '#330000', 10: '#3e0407', 15: '#4a1115', 20: '#571d1f',
    25: '#64282a', 30: '#713434', 35: '#7f403f', 40: '#8d4c4b', 45: '#9a5857',
    50: '#a86463', 55: '#b6716f', 60: '#c57e7c', 65: '#d38b88', 70: '#e19895',
    75: '#f0a6a3', 80: '#ffb3b0', 85: '#ffc6c3', 90: '#ffd9d7', 95: '#ffeceb',
    100: '#ffffff',
  },
  yellow: {
    hue: 85, chroma: 40,
    0: '#000000', 5: '#270c00', 10: '#2f1800', 15: '#382300', 20: '#422d00',
    25: '#4e3800', 30: '#5a4300', 35: '#674f0b', 40: '#755b19', 45: '#826725',
    50: '#907331', 55: '#9e803d', 60: '#ac8d49', 65: '#ba9a56', 70: '#c8a762',
    75: '#d7b46f', 80: '#e5c27c', 85: '#f4d089', 90: '#ffde9b', 95: '#ffeecf',
    100: '#ffffff',
  },
  blue: {
    hue: 250, chroma: 20,
    0: '#000000', 5: '#00162a', 10: '#001f35', 15: '#002a40', 20: '#00354c',
    25: '#0e4057', 30: '#1e4b64', 35: '#2c5770', 40: '#39637d', 45: '#466f89',
    50: '#537c96', 55: '#6089a4', 60: '#6d96b1', 65: '#7aa3bf', 70: '#87b0cd',
    75: '#95bedb', 80: '#a3cce9', 85: '#b0daf7', 90: '#c4e7ff', 95: '#e1f3ff',
    100: '#ffffff',
  },
  pink: {
    hue: 350, chroma: 25,
    0: '#000000', 5: '#2b0018', 10: '#370a22', 15: '#42152c', 20: '#4f2137',
    25: '#5b2c42', 30: '#68374e', 35: '#74435a', 40: '#814f66', 45: '#8f5b72',
    50: '#9c687f', 55: '#aa748c', 60: '#b78199', 65: '#c58ea6', 70: '#d39bb4',
    75: '#e2a9c1', 80: '#f0b6cf', 85: '#ffc4dd', 90: '#ffd7e9', 95: '#ffebf4',
    100: '#ffffff',
  },
  purple: {
    hue: 300, chroma: 20,
    0: '#000000', 5: '#120c28', 10: '#1b1833', 15: '#26223e', 20: '#312c4a',
    25: '#3d3755', 30: '#484362', 35: '#544e6e', 40: '#615a7a', 45: '#6d6687',
    50: '#7a7394', 55: '#867fa2', 60: '#948caf', 65: '#a199bd', 70: '#aea6ca',
    75: '#bcb4d8', 80: '#cac2e7', 85: '#d8cff5', 90: '#e6deff', 95: '#f3eeff',
    100: '#ffffff',
  },
  cyan: {
    hue: 185, chroma: 18,
    0: '#000000', 5: '#001913', 10: '#00221d', 15: '#002c27', 20: '#013732',
    25: '#10433d', 30: '#1e4e49', 35: '#2a5a54', 40: '#376660', 45: '#43736d',
    50: '#508079', 55: '#5c8d86', 60: '#699a93', 65: '#76a7a0', 70: '#83b5ad',
    75: '#90c2bb', 80: '#9ed0c9', 85: '#abded7', 90: '#b9ede5', 95: '#c7fbf3',
    100: '#ffffff',
  },
  orange: {
    hue: 60, chroma: 35,
    0: '#000000', 5: '#300200', 10: '#390f00', 15: '#441a00', 20: '#502500',
    25: '#5c300c', 30: '#6a3b17', 35: '#774622', 40: '#85522d', 45: '#935e38',
    50: '#a16b44', 55: '#af7750', 60: '#bd845c', 65: '#cc9168', 70: '#da9e75',
    75: '#e9ac82', 80: '#f8b98f', 85: '#ffc9a3', 90: '#ffdbc3', 95: '#ffede1',
    100: '#ffffff',
  },
  teal: {
    hue: 165, chroma: 15,
    0: '#000000', 5: '#001808', 10: '#022016', 15: '#0d2b20', 20: '#18362a',
    25: '#234135', 30: '#2f4d40', 35: '#3a594c', 40: '#466558', 45: '#527164',
    50: '#5e7e70', 55: '#6a8b7d', 60: '#779889', 65: '#84a596', 70: '#91b3a4',
    75: '#9ec0b1', 80: '#accebf', 85: '#b9dccc', 90: '#c7eada', 95: '#d5f9e9',
    100: '#ffffff',
  },
} as const;
