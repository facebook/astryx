// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Butter Theme
 *
 * Warm, golden buttery theme with blue accents.
 * Sarina for display, Outfit for headings and body.
 *
 * Source palette (per design):
 *   Accent  #225BFF   Gray    #868B99   Red     #FF7553
 *   Orange  #FFA347   Yellow  #fdee8c   Green   #5DCE5F
 *   Cyan    #60CFD3   Teal    #6CD9A8   Blue    #5681FF
 *   Purple  #B780F6   Pink    #F680E8   Error   #FF5947
 *   Warning #F8C726   Success #91D143
 *
 * All tonal ramps derived in CIELab (matches the algorithm used by
 * ThemePalettePreview so card / badge / banner / strip render the
 * same values). Regen via scripts/butter-palette-gen.mjs if sources
 * change.
 */

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
import {butterIconRegistry} from './icons';

/** Butter syntax palette — T25 / T80 of each color's ramp. */
const butterSyntax = defineSyntaxTheme({
  name: 'xds-butter',
  tokens: {
    keyword: ['#52237b', '#ddb9f6'], // Purple
    string: ['#004800', '#a5d29d'], // Green
    comment: ['#605f52', '#adac9e'],
    number: ['#622e00', '#f2bd81'], // Orange
    function: ['#203a6c', '#bdc5eb'], // Blue
    type: ['#52237b', '#ddb9f6'], // Purple
    variable: ['#605f52', '#adac9e'],
    operator: ['#605f52', '#adac9e'],
    constant: ['#622e00', '#f2bd81'],
    tag: ['#6d211c', '#f4b8ae'], // Red
    attribute: ['#413e00', '#d6c957'], // Yellow
    property: ['#00482d', '#94d3bb'], // Teal
    punctuation: ['#605f52', '#adac9e'],
    background: ['#FDFBE4', '#131107'],
  },
});

export const butterTheme = defineTheme({
  name: 'butter',

  typography: {
    scale: {base: 14, ratio: 1.25},
    body: {
      family: 'Outfit',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Outfit',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
    // Core semantic — accent is the exact brand #225BFF
    // =========================================================================
    '--color-accent': ['#225BFF', '#FDEE8C'],
    '--color-accent-muted': ['#225BFF33', '#FDEE8C40'],
    '--color-neutral': ['#1d1c110F', '#f3f2e21A'],
    '--color-background-surface': ['#FFFFFF', '#2E2117'],
    '--color-background-body': ['#FDFBE4', '#261A13'],
    '--color-overlay': ['#1d1c1180', '#261A13cc'],
    '--color-overlay-hover': ['#1d1c110D', '#f3f2e20D'],
    '--color-overlay-pressed': ['#1d1c111A', '#f3f2e21A'],
    '--color-background-muted': ['#f3f2e2', '#3A2A1F'],

    // Text — warm neutral
    '--color-text-primary': ['#1d1c11', '#f3f2e2'],
    '--color-text-secondary': ['#605f52', '#adac9e'],
    '--color-text-disabled': ['#adac9e', '#605f52'],
    '--color-text-accent': ['#225BFF', '#FDEE8C'],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#1d1c11',
    '--color-on-accent': ['#ffffff', '#1d1c11'],
    // T95 of each ramp for use on the vivid semantic surfaces.
    '--color-on-success': ['#ccff88', '#0b2e00'],
    '--color-on-error': ['#ffe3de', '#600000'],
    '--color-on-warning': ['#ffeec3', '#3b2200'],

    // Icon
    '--color-icon-accent': ['#225BFF', '#FDEE8C'],
    '--color-icon-primary': ['#1d1c11', '#f3f2e2'],
    '--color-icon-secondary': ['#605f52', '#adac9e'],
    '--color-icon-disabled': ['#adac9e', '#605f52'],

    // Surface variants
    '--color-background-card': ['#FFFFFF', '#3A2A1F'],
    '--color-background-popover': ['#FFFFFF', '#3A2A1F'],
    '--color-background-inverted': ['#1d1c11', '#FDFBE4'],

    // Status semantics — T25 light / T80 dark from each status palette.
    '--color-error': ['#771210', '#ffb4a6'],
    '--color-error-muted': ['#77121033', '#ffb4a640'],
    '--color-warning': ['#543700', '#f7be00'],
    '--color-warning-muted': ['#54370033', '#f7be0040'],
    '--color-success': ['#004700', '#99d94b'],
    '--color-success-muted': ['#00470033', '#99d94b40'],

    // Border — softer taupe card outline (emphasized) in light mode.
    '--color-border': ['#e5e3d4', '#f3f2e21A'],
    '--color-border-emphasized': ['#C7C4B2', '#939184'],

    // Effects
    '--color-skeleton': ['#e5e3d4', '#49473b'],
    '--color-shadow': ['#1d1c111A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Typography override
    '--text-supporting-size': '12px',

    // Element sizes — slightly taller defaults so the new input padding
    // (--spacing-2 block) has room to breathe.
    '--size-element-sm': '32px',
    '--size-element-md': '40px',
    '--size-element-lg': '48px',

    // =========================================================================
    // Categorical — same values in light and dark mode (curated dark mode
    // keeps the same pastel backgrounds + dark text as light mode).
    // =========================================================================

    // Blue
    '--color-background-blue': ['#dbe1ff', '#dbe1ff'],
    '--color-border-blue': ['#bdc5eb', '#bdc5eb'],
    '--color-icon-blue': ['#203a6c', '#203a6c'],
    '--color-text-blue': ['#203a6c', '#203a6c'],

    // Cyan
    '--color-background-cyan': ['#a9eff0', '#a9eff0'],
    '--color-border-cyan': ['#8dd2d3', '#8dd2d3'],
    '--color-icon-cyan': ['#004649', '#004649'],
    '--color-text-cyan': ['#004649', '#004649'],

    // Gray (uses the neutral palette)
    '--color-background-gray': ['#f0edd4', '#f0edd4'],
    '--color-border-gray': ['#d6d3b8', '#d6d3b8'],
    '--color-icon-gray': ['#4a4732', '#4a4732'],
    '--color-text-gray': ['#4a4732', '#4a4732'],

    // Green
    '--color-background-green': ['#c1efb8', '#c1efb8'],
    '--color-border-green': ['#a5d29d', '#a5d29d'],
    '--color-icon-green': ['#004800', '#004800'],
    '--color-text-green': ['#004800', '#004800'],

    // Orange
    '--color-background-orange': ['#ffdcb6', '#ffdcb6'],
    '--color-border-orange': ['#f2bd81', '#f2bd81'],
    '--color-icon-orange': ['#622e00', '#622e00'],
    '--color-text-orange': ['#622e00', '#622e00'],

    // Pink
    '--color-background-pink': ['#ffd5fb', '#ffd5fb'],
    '--color-border-pink': ['#f0b3e8', '#f0b3e8'],
    '--color-icon-pink': ['#6c0a68', '#6c0a68'],
    '--color-text-pink': ['#6c0a68', '#6c0a68'],

    // Purple
    '--color-background-purple': ['#f2daff', '#f2daff'],
    '--color-border-purple': ['#ddb9f6', '#ddb9f6'],
    '--color-icon-purple': ['#52237b', '#52237b'],
    '--color-text-purple': ['#52237b', '#52237b'],

    // Red
    '--color-background-red': ['#ffdad3', '#ffdad3'],
    '--color-border-red': ['#f4b8ae', '#f4b8ae'],
    '--color-icon-red': ['#6d211c', '#6d211c'],
    '--color-text-red': ['#6d211c', '#6d211c'],

    // Teal
    '--color-background-teal': ['#b0f0d7', '#b0f0d7'],
    '--color-border-teal': ['#94d3bb', '#94d3bb'],
    '--color-icon-teal': ['#00482d', '#00482d'],
    '--color-text-teal': ['#00482d', '#00482d'],

    // Yellow
    '--color-background-yellow': ['#feee7b', '#feee7b'],
    '--color-border-yellow': ['#d6c957', '#d6c957'],
    '--color-icon-yellow': ['#413e00', '#413e00'],
    '--color-text-yellow': ['#413e00', '#413e00'],

    // =========================================================================
    // Radius
    //   --radius-element drives buttons, badges, inputs — 8px per design
    //   --radius-container drives cards, banners, popovers — 12px per design
    // =========================================================================
    '--radius-none': '0.125rem',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.5rem', // 8px
    '--radius-container': '0.75rem', // 12px
    '--radius-page': '1.5rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — warm neutral tint
    // =========================================================================
    '--shadow-low': '0 2px 4px #1d1c110D, 0 4px 8px #1d1c111A',
    '--shadow-med': '0 2px 4px #1d1c110D, 0 4px 12px #1d1c111A',
    '--shadow-high': '0 4px 6px #1d1c111A, 0 12px 24px #1d1c1126',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #79786a30',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #79786a50',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #00470030',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #54370030',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #77121030',
  },

  components: {
    button: {
      // Radius intentionally not pinned, so buttons keep core's
      // `var(--_button-radius, --radius-element)`: standalone buttons stay 8px,
      // while the chat composer (which sets --_button-radius) rounds them fully.
      base: {
        paddingBlock: 'var(--spacing-3)',
        paddingInline: 'var(--spacing-4)',
      },
      // Secondary: blue outline + label in light, butter yellow in dark.
      'variant:secondary': {
        backgroundColor: 'transparent',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: 'light-dark(#225BFF, #FDEE8C)',
        color: 'light-dark(#225BFF, #FDEE8C)',
        ':hover': {
          backgroundColor: 'light-dark(#225BFF14, #FDEE8C14)',
        },
      },
      // Ghost: same accent color as secondary, no background.
      'variant:ghost': {
        color: 'light-dark(#225BFF, #FDEE8C)',
      },
      'variant:destructive': {
        backgroundColor: 'light-dark(#ffdad3, #f4b8ae)',
        color: 'light-dark(#550000, #6d211c)',
      },
    },

    badge: {
      // Match astryx/daily badge sizing: 30px tall with 12px horizontal pad.
      // Use explicit values because butter inherits the standard spacing
      // scale (where --spacing-3 = 12px), unlike astryx which redefines it.
      base: {
        height: '30px',
        paddingBlock: '0',
        paddingInline: 'var(--spacing-3)',
      },
      // Vivid semantic badges — pinned to the brand colors from the spec.
      // Info uses the Blue palette source (NOT the brand accent #225BFF).
      'variant:info': {
        backgroundColor: '#4883fd',
        color: '#ffffff',
      },
      'variant:neutral': {
        backgroundColor: '#ffee7b',
        color: '#225BFF',
      },
      'variant:success': {
        backgroundColor: '#91D143',
        color: '#1d1c11',
      },
      'variant:warning': {
        backgroundColor: '#ffc502',
        color: '#1d1c11',
      },
      'variant:error': {
        backgroundColor: '#fc473b',
        color: '#ffffff',
      },
    },

    // Banner backgrounds match the semantic badge fills.
    // Banner status colors — override the muted tokens locally so the
    // header (which reads --color-*-muted via StyleX) renders vivid fills
    // matching the badge palette. Scoped to the banner root, doesn't leak.
    banner: {
      'status:info': {
        '--color-accent-muted': '#4883fd',
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#ffffff',
        '--color-accent': '#ffffff',
      },
      'status:success': {
        '--color-success-muted': '#91D143',
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#1d1c11',
        '--color-success': '#1d1c11',
      },
      'status:warning': {
        '--color-warning-muted': '#ffc502',
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#1d1c11',
        '--color-warning': '#1d1c11',
      },
      'status:error': {
        '--color-error-muted': '#fc473b',
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#ffffff',
        '--color-error': '#ffffff',
      },
    },

    card: {
      base: {
        borderRadius: 'var(--radius-container)',
        padding: 'var(--spacing-4)',
      },
      'variant:info': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:success': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:warning': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:error': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:blue': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:cyan': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:gray': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:green': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:orange': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:pink': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:purple': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:red': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:teal': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:yellow': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
      'variant:muted': {
        '--color-text-primary': '#1d1c11',
        '--color-text-secondary': '#605f52',
      },
    },

    section: {
      base: {
        padding: 'var(--spacing-4)',
      },
    },

    // Progress bar — white track in light, warm brown in dark. Vivid
    // semantic fills match the banner colors (Success / Warning / Error).
    'progressbar-track': {
      base: {
        backgroundColor: 'light-dark(#e5e3d4, #725538)',
      },
    },
    'progressbar-fill': {
      'variant:success': {
        backgroundColor: '#91D143',
      },
      'variant:warning': {
        backgroundColor: '#ffc502',
      },
      'variant:error': {
        backgroundColor: '#fc473b',
      },
    },

    // Field status bubble — match the corresponding banner colors so the
    // helper text below an input reads as the same "this is a warning /
    // error / success" surface as the standalone banner.
    'field-status': {
      'type:success': {
        backgroundColor: '#91D143',
        color: '#1d1c11',
      },
      'type:warning': {
        backgroundColor: '#ffc502',
        color: '#1d1c11',
      },
      'type:error': {
        backgroundColor: '#fc473b',
        color: '#ffffff',
      },
    },

    // Inputs — softer border than default, more vertical breathing room.
    // Status modifiers also remap the semantic tokens locally so the
    // status icon + border read as the same vivid hue as the banner
    // (icons inherit from --color-{success,warning,error}).
    'text-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    textarea: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    'number-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    'date-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    'time-input': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    selector: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    'multi-selector': {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    typeahead: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },
    tokenizer: {
      base: {
        paddingBlock: 'var(--spacing-2)',
        paddingInline: 'var(--spacing-3)',
        borderColor: 'var(--color-border)',
      },
      'status:success': {'--color-success': '#91D143'},
      'status:warning': {'--color-warning': '#ffc502'},
      'status:error': {'--color-error': '#fc473b'},
    },

    // Display sizes use Sarina — the signature buttery display
    // cursive, reserved for hero/marketing-scale text only.
    // Headings (h1–h6) and body still use Outfit (configured above
    // under typography.heading / typography.body). Same pattern
    // Gothic uses for its Manufacturing Consent display family.
    text: {
      'type:display-1': {
        fontFamily: 'Sarina, "Brush Script MT", "Snell Roundhand", cursive',
      },
      'type:display-2': {
        fontFamily: 'Sarina, "Brush Script MT", "Snell Roundhand", cursive',
      },
      'type:display-3': {
        fontFamily: 'Sarina, "Brush Script MT", "Snell Roundhand", cursive',
      },
    },
  },

  icons: butterIconRegistry,
});

/**
 * Raw tonal palettes — generated from design-spec source hexes via the
 * same CIELab algorithm `ThemePalettePreview` uses for the displayed
 * strip, so the rendered ramp and the consumed token values are 1:1.
 *
 * Source colors:
 *   accent  #225BFF   neutral #868B99
 *   red     #ffc3b8   orange  #ffc98d   yellow  #feee7b
 *   green   #bdebb4   cyan    #abf1f1   teal    #aeefd6
 *   blue    #cdd5fc   purple  #e6c2ff   pink    #fec0f5
 *   error   #fc473b   warning #ffc502   success #91D143
 *
 * Categorical sources are the pastel pill hexes from the design spec so
 * each ramp's T85 lands directly on the card / badge background color.
 * Semantic sources are vivid so the ramp anchors near the badge fill.
 *
 * Regenerate with: node packages/themes/butter/scripts/generate-palettes.mjs
 */
export const butterPalettes = {
  blue: {
    0: '#000000',
    5: '#001041',
    10: '#001b4c',
    15: '#002558',
    20: '#062f63',
    25: '#203a6c',
    30: '#324575',
    35: '#41517d',
    40: '#505d86',
    45: '#5f698f',
    50: '#6d7698',
    55: '#7a82a6',
    60: '#878fb3',
    65: '#949cc1',
    70: '#a2aacf',
    75: '#afb7dd',
    80: '#bdc5eb',
    85: '#cbd3f9',
    90: '#dbe1ff',
    95: '#edf0ff',
    100: '#ffffff',
  },
  cyan: {
    0: '#000000',
    5: '#001d1e',
    10: '#00262a',
    15: '#003034',
    20: '#003a3e',
    25: '#004649',
    30: '#005255',
    35: '#005e61',
    40: '#006a6d',
    45: '#1f7678',
    50: '#3c8183',
    55: '#4a8e90',
    60: '#579c9d',
    65: '#65a9aa',
    70: '#72b7b8',
    75: '#80c4c5',
    80: '#8dd2d3',
    85: '#9be0e1',
    90: '#a9eff0',
    95: '#b7fdfe',
    100: '#ffffff',
  },
  green: {
    0: '#000000',
    5: '#001f00',
    10: '#002800',
    15: '#003100',
    20: '#003c00',
    25: '#004800',
    30: '#01530d',
    35: '#1f5f1f',
    40: '#346a30',
    45: '#467640',
    50: '#578151',
    55: '#648e5d',
    60: '#709c6a',
    65: '#7da976',
    70: '#8ab783',
    75: '#98c490',
    80: '#a5d29d',
    85: '#b3e0ab',
    90: '#c1efb8',
    95: '#cffdc6',
    100: '#ffffff',
  },
  orange: {
    0: '#000000',
    5: '#2d0600',
    10: '#381200',
    15: '#461b00',
    20: '#542400',
    25: '#622e00',
    30: '#6d3a00',
    35: '#794700',
    40: '#845406',
    45: '#906121',
    50: '#9b6e36',
    55: '#a97b42',
    60: '#b7874e',
    65: '#c6945b',
    70: '#d4a267',
    75: '#e3af74',
    80: '#f2bd81',
    85: '#ffcb8e',
    90: '#ffdcb6',
    95: '#ffedda',
    100: '#ffffff',
  },
  pink: {
    0: '#000000',
    5: '#3c003d',
    10: '#490048',
    15: '#560054',
    20: '#62005f',
    25: '#6c0a68',
    30: '#762371',
    35: '#80357a',
    40: '#894583',
    45: '#93558c',
    50: '#9c6496',
    55: '#aa71a3',
    60: '#b77eb0',
    65: '#c58bbe',
    70: '#d398cc',
    75: '#e2a6da',
    80: '#f0b3e8',
    85: '#ffc1f6',
    90: '#ffd5fb',
    95: '#ffeafd',
    100: '#ffffff',
  },
  purple: {
    0: '#000000',
    5: '#1e004f',
    10: '#2b005c',
    15: '#390268',
    20: '#461373',
    25: '#52237b',
    30: '#5d3283',
    35: '#69408b',
    40: '#744e92',
    45: '#7f5c9a',
    50: '#8b6aa2',
    55: '#9877b0',
    60: '#a584bd',
    65: '#b391cb',
    70: '#c19ed9',
    75: '#cfabe8',
    80: '#ddb9f6',
    85: '#eac8ff',
    90: '#f2daff',
    95: '#f9ecff',
    100: '#ffffff',
  },
  red: {
    0: '#000000',
    5: '#3e0000',
    10: '#490000',
    15: '#550000',
    20: '#62100f',
    25: '#6d211c',
    30: '#773029',
    35: '#823f36',
    40: '#8c4d44',
    45: '#955b52',
    50: '#9f6961',
    55: '#ad766d',
    60: '#bb837a',
    65: '#c99087',
    70: '#d79d94',
    75: '#e6aba1',
    80: '#f4b8ae',
    85: '#ffc7bd',
    90: '#ffdad3',
    95: '#ffece8',
    100: '#ffffff',
  },
  teal: {
    0: '#000000',
    5: '#001f00',
    10: '#00280b',
    15: '#003216',
    20: '#003d22',
    25: '#00482d',
    30: '#005439',
    35: '#005f45',
    40: '#136b52',
    45: '#30775f',
    50: '#46826d',
    55: '#528f79',
    60: '#5f9d86',
    65: '#6caa93',
    70: '#7ab8a0',
    75: '#87c5ae',
    80: '#94d3bb',
    85: '#a2e1c9',
    90: '#b0f0d7',
    95: '#befee5',
    100: '#ffffff',
  },
  yellow: {
    0: '#000000',
    5: '#1e1200',
    10: '#271c00',
    15: '#2e2700',
    20: '#373200',
    25: '#413e00',
    30: '#4c4a00',
    35: '#575600',
    40: '#646200',
    45: '#726e00',
    50: '#817a00',
    55: '#8e860e',
    60: '#9c9320',
    65: '#aba02f',
    70: '#b9ae3d',
    75: '#c7bb4a',
    80: '#d6c957',
    85: '#e5d765',
    90: '#f4e572',
    95: '#fff294',
    100: '#ffffff',
  },
  neutral: {
    0: '#000000',
    5: '#051124',
    10: '#101c2f',
    15: '#1b263a',
    20: '#273045',
    25: '#333b4f',
    30: '#3f4759',
    35: '#4b5264',
    40: '#585e6f',
    45: '#656a79',
    50: '#727784',
    55: '#7f8491',
    60: '#8c909f',
    65: '#999eac',
    70: '#a6abba',
    75: '#b4b9c7',
    80: '#c1c6d5',
    85: '#cfd4e3',
    90: '#dde2f2',
    95: '#ebf0ff',
    100: '#ffffff',
  },
  accent: {
    0: '#000000',
    5: '#00085e',
    10: '#00136c',
    15: '#001c7e',
    20: '#002592',
    25: '#002fa7',
    30: '#0039be',
    35: '#0043d7',
    40: '#004df0',
    45: '#0759ff',
    50: '#4a67ff',
    55: '#6875ff',
    60: '#8083ff',
    65: '#9492ff',
    70: '#a6a1ff',
    75: '#b6b0ff',
    80: '#c6bfff',
    85: '#d5cfff',
    90: '#e3dfff',
    95: '#f1efff',
    100: '#ffffff',
  },
  error: {
    0: '#000000',
    5: '#470000',
    10: '#530000',
    15: '#600000',
    20: '#6d0000',
    25: '#771210',
    30: '#82261e',
    35: '#8c372c',
    40: '#96463b',
    45: '#a0564a',
    50: '#a96559',
    55: '#b77265',
    60: '#c57e72',
    65: '#d48b7e',
    70: '#e2998b',
    75: '#f1a698',
    80: '#ffb4a6',
    85: '#ffc7bc',
    90: '#ffdad2',
    95: '#ffece8',
    100: '#ffffff',
  },
  warning: {
    0: '#000000',
    5: '#270c00',
    10: '#301800',
    15: '#3b2200',
    20: '#472c00',
    25: '#543700',
    30: '#614200',
    35: '#6f4d00',
    40: '#7d5800',
    45: '#8b6400',
    50: '#9a7000',
    55: '#a97d00',
    60: '#b88900',
    65: '#c89600',
    70: '#d8a300',
    75: '#e7b100',
    80: '#f7be00',
    85: '#ffcd51',
    90: '#ffde9c',
    95: '#ffeed0',
    100: '#ffffff',
  },
  success: {
    0: '#000000',
    5: '#001a00',
    10: '#092300',
    15: '#0b2e00',
    20: '#043b00',
    25: '#004700',
    30: '#005400',
    35: '#036100',
    40: '#136e00',
    45: '#277b00',
    50: '#448700',
    55: '#529400',
    60: '#60a105',
    65: '#6eaf1d',
    70: '#7cbd2e',
    75: '#8bcb3c',
    80: '#99d94b',
    85: '#a7e758',
    90: '#b5f566',
    95: '#ccff88',
    100: '#ffffff',
  },
} as const;
