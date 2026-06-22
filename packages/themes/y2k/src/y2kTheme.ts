// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Y2K Theme
 *
 * A bubbly, playful pop theme inspired by early 2000s aesthetics.
 * Periwinkle body (#CCCFFA), charcoal accent, Poppins for body/headings, and
 * Crimson Text for display sizes.
 * Core neutral: H=75 C=8 (warm cream neutral derived from #FFF6ED)
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
    background: ['#FFF6ED', '#190f00'],
  },
});

export const y2kTheme = defineTheme({
  name: 'y2k',

  typography: {
    scale: {base: 16, ratio: 1.25},
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
    // Spacing — comfortable preset (base=6)
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

    // Size — comfortable preset
    '--size-element-sm': '32px',
    '--size-element-md': '40px',
    '--size-element-lg': '48px',

    // =========================================================================
    // Colors — Y2K pop palette
    // Neutral: H=75 C=8 (warm cream)
    // Accent: charcoal (#292427)
    // =========================================================================

    // Core semantic — neutral H=75 C=8 (cream)
    '--color-accent': ['#2d241b', '#EDEFFC'],
    '--color-accent-muted': ['#2d241b14', '#EDEFFC20'],
    '--color-neutral': ['#2d241b10', '#EDEFFC1A'],
    '--color-background-surface': ['#FFFFFF', '#16182b'],
    '--color-background-body': ['#CCCFFA', '#0e0f1a'],
    '--color-overlay': ['#2d241b80', '#0a0b14CC'],
    '--color-overlay-hover': ['#2d241b0D', '#EDEFFC0D'],
    '--color-overlay-pressed': ['#2d241b1A', '#EDEFFC1A'],
    '--color-background-muted': ['#ede0d4', '#1f2238'],

    // Text — neutral H=75 (cream)
    '--color-text-primary': ['#2d241b', '#EDEFFC'],
    '--color-text-secondary': ['#675d52', '#a6acd6'],
    '--color-text-disabled': ['#d1c5b8', '#4a4f6b'],
    '--color-text-accent': ['#2d241b', '#EDEFFC'],
    '--color-on-dark': '#FFFFFF',
    '--color-on-light': '#2d241b',
    '--color-on-accent': ['#FFFFFF', '#16182b'],
    '--color-on-success': ['#3a5500', '#1e3200'],
    '--color-on-error': ['#8b1d24', '#5c0008'],
    '--color-on-warning': ['#614400', '#3f2600'],

    // Icon — neutral H=75 (cream)
    '--color-icon-accent': ['#2d241b', '#EDEFFC'],
    '--color-icon-primary': ['#2d241b', '#EDEFFC'],
    '--color-icon-secondary': ['#675d52', '#a6acd6'],
    '--color-icon-disabled': ['#d1c5b8', '#4a4f6b'],

    // Surface variants — white cards, cream body
    '--color-background-card': ['#FFFFFF', '#16182b'],
    '--color-background-popover': ['#FFFFFF', '#1f2238'],
    '--color-background-inverted': ['#2d241b', '#EDEFFC'],

    // Status / Sentiment — same in light and dark
    '--color-success': ['#C5E17A', '#C5E17A'],
    '--color-success-muted': ['#C5E17A', '#C5E17A'],
    '--color-error': ['#FFC5C3', '#FFC5C3'],
    '--color-error-muted': ['#FFC5C3', '#FFC5C3'],
    '--color-warning': ['#FFE08A', '#FFE08A'],
    '--color-warning-muted': ['#FFE08A', '#FFE08A'],

    // Bold charcoal borders in light mode (default + card) for the heavy-outline
    // Y2K look. Dark mode unchanged.
    '--color-border': ['#2F292E', '#EDEFFC1A'],
    '--color-border-emphasized': ['#2F292E', '#3a3f5e'],

    // Effects
    '--color-skeleton': ['#d1c5b8', '#2a2e47'],
    '--color-shadow': ['#2d241b1A', '#0000004D'],
    '--color-tint-hover': ['#2d241b', '#EDEFFC'],

    // Typography override
    '--text-supporting-size': '12px',

    // Categorical — hand-tuned for equal optical brightness, same light/dark
    '--color-background-green': ['#C5E17A', '#C5E17A'],
    '--color-border-green': ['#B5D16A', '#B5D16A'],
    '--color-icon-green': ['#3a5500', '#1e3200'],
    '--color-text-green': ['#3a5500', '#1e3200'],

    '--color-background-red': ['#FFC5C3', '#FFC5C3'],
    '--color-border-red': ['#FF9E9A', '#FF9E9A'],
    '--color-icon-red': ['#8b1d24', '#5c0008'],
    '--color-text-red': ['#8b1d24', '#5c0008'],

    '--color-background-yellow': ['#FFE08A', '#FFE08A'],
    '--color-border-yellow': ['#FFCC55', '#FFCC55'],
    '--color-icon-yellow': ['#614400', '#3f2600'],
    '--color-text-yellow': ['#614400', '#3f2600'],

    '--color-background-blue': ['#B8E0FF', '#B8E0FF'],
    '--color-border-blue': ['#8ECFFF', '#8ECFFF'],
    '--color-icon-blue': ['#004e74', '#002c4d'],
    '--color-text-blue': ['#004e74', '#002c4d'],

    '--color-background-pink': ['#FFC8E0', '#FFC8E0'],
    '--color-border-pink': ['#FFA0C8', '#FFA0C8'],
    '--color-icon-pink': ['#822050', '#580030'],
    '--color-text-pink': ['#822050', '#580030'],

    '--color-background-purple': ['#DDD0FF', '#DDD0FF'],
    '--color-border-purple': ['#C0AAFF', '#C0AAFF'],
    '--color-icon-purple': ['#453080', '#201058'],
    '--color-text-purple': ['#453080', '#201058'],

    '--color-background-cyan': ['#A8F0E2', '#A8F0E2'],
    '--color-border-cyan': ['#70E8D0', '#70E8D0'],
    '--color-icon-cyan': ['#005548', '#003028'],
    '--color-text-cyan': ['#005548', '#003028'],

    '--color-background-orange': ['#FFCCA0', '#FFCCA0'],
    '--color-border-orange': ['#FFAA66', '#FFAA66'],
    '--color-icon-orange': ['#703500', '#4a1800'],
    '--color-text-orange': ['#703500', '#4a1800'],

    '--color-background-teal': ['#A8EED0', '#A8EED0'],
    '--color-border-teal': ['#78E0B0', '#78E0B0'],
    '--color-icon-teal': ['#005530', '#003018'],
    '--color-text-teal': ['#005530', '#003018'],

    // Gray (cream neutral H=75 C=8)
    '--color-background-gray': ['#ede0d4', '#ede0d4'],
    '--color-border-gray': ['#dfd2c6', '#dfd2c6'],
    '--color-icon-gray': ['#4f453b', '#2d241b'],
    '--color-text-gray': ['#4f453b', '#2d241b'],

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
    // Shadows — warm cream neutral
    // =========================================================================
    '--shadow-low': '0 2px 4px #2d241b0D, 0 4px 8px #2d241b1A',
    '--shadow-med': '0 2px 4px #2d241b0D, 0 4px 12px #2d241b1A',
    '--shadow-high': '0 4px 6px #2d241b1A, 0 12px 24px #2d241b26',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #2d241b30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #2d241b50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #3a550050',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #61440050',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #8b1d2450',
  },

  components: {
    // Display sizes use a Crimson Text serif, distinct from the Poppins
    // used for body/headings.
    text: {
      'type:display-1': {
        fontFamily: '"Crimson Text", Georgia, "Times New Roman", Times, serif',
      },
      'type:display-2': {
        fontFamily: '"Crimson Text", Georgia, "Times New Roman", Times, serif',
      },
      'type:display-3': {
        fontFamily: '"Crimson Text", Georgia, "Times New Roman", Times, serif',
      },
    },

    // TopNav items: drop the pill background on the selected state and rely on
    // weight + primary text color for emphasis. Hover/active keep the neutral
    // overlay from the base styles.
    'top-nav-item': {
      selected: {
        backgroundColor: 'transparent',
        ':hover': {
          backgroundColor: 'var(--color-overlay-hover)',
        },
        ':active': {
          backgroundColor: 'var(--color-overlay-pressed)',
        },
      },
    },
    button: {
      base: {
        borderRadius: '0px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      },
      'variant:primary': {
        backgroundColor: 'var(--color-text-primary)',
        color: 'var(--color-background-body)',
        borderColor: 'transparent',
      },
      'variant:secondary': {
        backgroundColor: 'var(--color-background-green)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-text-green)',
        color: 'var(--color-text-green)',
        ':hover': {
          backgroundColor: 'var(--color-border-green)',
        },
      },
      'variant:ghost': {
        borderColor: 'transparent',
      },
      'variant:destructive': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-text-red)',
      },
    },

    badge: {
      base: {
        borderRadius: '9999px',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: 'color-mix(in srgb, currentColor 30%, transparent)',
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
    hue: 75,
    chroma: 8,
    0: '#000000',
    5: '#190f00',
    10: '#221a10',
    15: '#2d241b',
    20: '#382f25',
    25: '#433a30',
    30: '#4f453b',
    35: '#5b5146',
    40: '#675d52',
    45: '#73695e',
    50: '#80756a',
    55: '#8d8276',
    60: '#9a8f83',
    65: '#a79c90',
    70: '#b5a99d',
    75: '#c3b7ab',
    80: '#d1c5b8',
    85: '#dfd2c6',
    90: '#ede0d4',
    95: '#fbefe2',
    100: '#ffffff',
  },
  green: {
    hue: 120,
    chroma: 60,
    0: '#000000',
    5: '#061800',
    10: '#132200',
    15: '#152d00',
    20: '#173900',
    25: '#1e4500',
    30: '#285100',
    35: '#355d00',
    40: '#426900',
    45: '#4f7600',
    50: '#5c830b',
    55: '#69901d',
    60: '#779d2c',
    65: '#84aa39',
    70: '#92b847',
    75: '#a0c654',
    80: '#aed461',
    85: '#bce26e',
    90: '#caf07b',
    95: '#d9fe89',
    100: '#ffffff',
  },
  red: {
    hue: 25,
    chroma: 55,
    0: '#000000',
    5: '#480000',
    10: '#540000',
    15: '#620002',
    20: '#700012',
    25: '#7f001b',
    30: '#8e1126',
    35: '#9c2330',
    40: '#ab313b',
    45: '#ba3f47',
    50: '#c94d52',
    55: '#d95b5e',
    60: '#e8686b',
    65: '#f87677',
    70: '#ff8787',
    75: '#ff9d9b',
    80: '#ffb2af',
    85: '#ffc6c3',
    90: '#ffd9d7',
    95: '#ffeceb',
    100: '#ffffff',
  },
  yellow: {
    hue: 85,
    chroma: 65,
    0: '#000000',
    5: '#270c00',
    10: '#301800',
    15: '#3b2200',
    20: '#472c00',
    25: '#533700',
    30: '#604200',
    35: '#6d4d00',
    40: '#7b5900',
    45: '#896500',
    50: '#977100',
    55: '#a67e00',
    60: '#b58b01',
    65: '#c39819',
    70: '#d2a52a',
    75: '#e2b239',
    80: '#f1c047',
    85: '#ffcd55',
    90: '#ffde9b',
    95: '#ffeecf',
    100: '#ffffff',
  },
  blue: {
    hue: 250,
    chroma: 40,
    0: '#000000',
    5: '#001939',
    10: '#002244',
    15: '#002c4d',
    20: '#003759',
    25: '#004266',
    30: '#004e74',
    35: '#005a83',
    40: '#006693',
    45: '#0073a3',
    50: '#0080b4',
    55: '#008ec4',
    60: '#0e9bd2',
    65: '#2fa8e0',
    70: '#45b6ef',
    75: '#57c3fd',
    80: '#7ed0ff',
    85: '#a3dbff',
    90: '#c4e7ff',
    95: '#e1f3ff',
    100: '#ffffff',
  },
  pink: {
    hue: 350,
    chroma: 45,
    0: '#000000',
    5: '#3d001d',
    10: '#490027',
    15: '#560032',
    20: '#64003d',
    25: '#711248',
    30: '#7f2154',
    35: '#8c2f60',
    40: '#9a3c6c',
    45: '#a84979',
    50: '#b75685',
    55: '#c56392',
    60: '#d371a0',
    65: '#e27ead',
    70: '#f18bbb',
    75: '#ff99c8',
    80: '#ffaed3',
    85: '#ffc3de',
    90: '#ffd7e9',
    95: '#ffebf4',
    100: '#ffffff',
  },
  purple: {
    hue: 300,
    chroma: 40,
    0: '#000000',
    5: '#020840',
    10: '#11144b',
    15: '#1f1e57',
    20: '#2c2864',
    25: '#393370',
    30: '#453e7d',
    35: '#524a8a',
    40: '#5f5697',
    45: '#6c62a4',
    50: '#796eb2',
    55: '#867bc0',
    60: '#9387ce',
    65: '#a194dc',
    70: '#afa2ea',
    75: '#bdaff8',
    80: '#cbbeff',
    85: '#d9ceff',
    90: '#e6deff',
    95: '#f3eeff',
    100: '#ffffff',
  },
  cyan: {
    hue: 185,
    chroma: 35,
    0: '#000000',
    5: '#001e14',
    10: '#00261f',
    15: '#003029',
    20: '#003b34',
    25: '#00473f',
    30: '#00534a',
    35: '#005f56',
    40: '#006c62',
    45: '#00796f',
    50: '#00867b',
    55: '#0f9488',
    60: '#29a195',
    65: '#3bafa2',
    70: '#4cbcb0',
    75: '#5bcabd',
    80: '#6ad8cb',
    85: '#79e7d9',
    90: '#87f5e7',
    95: '#a6fff5',
    100: '#ffffff',
  },
  orange: {
    hue: 60,
    chroma: 60,
    0: '#000000',
    5: '#340000',
    10: '#420500',
    15: '#520b00',
    20: '#601700',
    25: '#6d2400',
    30: '#7b3000',
    35: '#893c00',
    40: '#984800',
    45: '#a75409',
    50: '#b66019',
    55: '#c56d26',
    60: '#d47a33',
    65: '#e48740',
    70: '#f3944c',
    75: '#ffa25c',
    80: '#ffb682',
    85: '#ffc9a3',
    90: '#ffdbc3',
    95: '#ffede1',
    100: '#ffffff',
  },
  teal: {
    hue: 165,
    chroma: 30,
    0: '#000000',
    5: '#001d00',
    10: '#00240f',
    15: '#002f1a',
    20: '#003a24',
    25: '#00462f',
    30: '#00513a',
    35: '#115e45',
    40: '#226a51',
    45: '#30775d',
    50: '#3d8469',
    55: '#4a9175',
    60: '#589e82',
    65: '#65ab8f',
    70: '#72b99c',
    75: '#7fc7a9',
    80: '#8dd5b7',
    85: '#9be3c5',
    90: '#a9f2d3',
    95: '#b6ffe1',
    100: '#ffffff',
  },
} as const;
