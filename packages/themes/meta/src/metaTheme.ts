/**
 * Meta Theme for XDS
 *
 * Color tokens derived from CDS (Core Design System) — Meta's internal
 * design system platform. All color values map to the XMDS 3.0 palette.
 *
 * Component overrides use xdsClassName class targeting (#763), pseudo-class
 * selectors (#811), and the defineTheme variants field (#790).
 * No core CSS custom properties needed — all theming is pure defineTheme.
 */

import {defineTheme} from '@xds/core/theme';
import {metaIconRegistry} from './icons';

export const metaTheme = defineTheme({
  name: 'meta',

  // Typography — Figtree font family, default scale
  typography: {
    scale: {base: 15, ratio: 1.2},
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap',
    },
    code: {
      family: 'SF Mono',
      fallbacks: '"Cascadia Code", "Segoe UI Mono", Menlo, Consolas, monospace',
    },
  },

  // Motion — default Meta timing
  motion: {fast: 175, medium: 410, ratio: 0.75},

  tokens: {
    // Type workaround: these tokens exist in core but aren't in XDSTokenName yet
    // @ts-expect-error — not in XDSTokenName
    '--color-focus-outline': ['#5D6C7B', '#8C939B'],
    '--elevation-input-hover': 'none',
    // =========================================================================
    // Core Accent — Meta Blue (CDS: PRIMARY_BUTTON_BACKGROUND = BLUE_500)
    // =========================================================================
    '--color-accent': ['#0064E0', '#0064E0'],
    '--color-accent-muted': ['#0064E033', '#0082FB3F'],
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],

    // =========================================================================
    // Surfaces
    // =========================================================================
    '--color-background-surface': ['#FFFFFF', '#1F1F22'],
    '--color-background-body': ['#F2F4F6', '#111112'],
    '--color-background-card': ['#FFFFFF', '#1F1F20'],
    '--color-background-popover': ['#FFFFFF', '#1F1F20'],
    '--color-background-muted': ['#F2F4F6', '#28292C'],
    '--color-overlay': ['#1111121F', '#11111299'],
    '--color-overlay-hover': [
      'rgba(17, 17, 18, 0.05)',
      'rgba(242, 244, 246, 0.05)',
    ],
    '--color-overlay-pressed': [
      'rgba(17, 17, 18, 0.08)',
      'rgba(242, 244, 246, 0.08)',
    ],
    '--color-neutral': ['rgba(17, 17, 18, 0.06)', 'rgba(242, 244, 246, 0.1)'],

    // =========================================================================
    // Text
    // =========================================================================
    '--color-text-primary': ['#111112', '#F3F4F5'],
    '--color-text-secondary': ['#5D6C7B', '#AAAFB5'],
    '--color-text-disabled': ['#96A6B4', '#6F747C'],
    '--color-text-accent': ['#0064E0', '#0064E0'],
    '--color-on-dark': ['#FFFFFF', '#FFFFFF'],
    '--color-on-light': ['#000000', '#000000'],

    // =========================================================================
    // Icons
    // =========================================================================
    '--color-icon-primary': ['#111112', '#F2F4F6'],
    '--color-icon-secondary': ['#5D6C7B', '#AAAFB5'],
    '--color-icon-disabled': ['#DDE2E8', '#6F747C'],
    '--color-icon-accent': ['#0064E0', '#0064E0'],

    // =========================================================================
    // Status — CDS: NEGATIVE, POSITIVE, WARNING
    // =========================================================================
    '--color-success': ['#147B29', '#3CBC22'],
    '--color-success-muted': [
      'rgba(20, 123, 41, 0.1)',
      'rgba(60, 188, 34, 0.15)',
    ],
    '--color-on-success': ['#FFFFFF', '#FFFFFF'],
    '--color-error': ['#D31130', '#FB7D87'],
    '--color-error-muted': [
      'rgba(211, 17, 48, 0.1)',
      'rgba(251, 125, 135, 0.15)',
    ],
    '--color-on-error': ['#FFFFFF', '#FFFFFF'],
    '--color-warning': ['#965E03', '#D69804'],
    '--color-warning-muted': [
      'rgba(150, 94, 3, 0.1)',
      'rgba(214, 152, 4, 0.15)',
    ],
    '--color-on-warning': ['#0A1317', '#0A1317'],

    // =========================================================================
    // Borders
    // =========================================================================
    '--color-border': ['#DDE2E8', '#F2F4F619'],
    '--color-border-emphasized': ['#CCD3DB', '#494D53'],

    // =========================================================================
    // Effects
    // =========================================================================
    '--color-skeleton': ['#E7EAED', '#28292C'],
    '--color-shadow': ['rgba(17, 17, 18, 0.12)', 'rgba(17, 17, 18, 0.12)'],
    '--shadow-inset-hover': 'none',
    '--color-tint-hover': ['black', 'white'],

    // =========================================================================
    // Divider / Focus / Elevation — CDS overrides
    // =========================================================================

    // =========================================================================
    // Named palette — CDS XMDS 3.0 color ramps
    // =========================================================================
    '--color-background-blue': ['#D7E9FF', '#001F4C'],
    '--color-border-blue': ['#0044A3', '#3087FF'],
    '--color-icon-blue': ['#0044A3', '#3087FF'],
    '--color-text-blue': ['#003B8E', '#4D99FF'],

    '--color-background-gray': ['#F2F4F6', '#28292C'],
    '--color-border-gray': ['#DFE2E5', '#494D53'],
    '--color-icon-gray': ['#666A72', '#9FA4AB'],
    '--color-text-gray': ['#111112', '#F2F4F6'],

    '--color-background-green': ['#C4F8B9', '#053018'],
    '--color-border-green': ['#147B29', '#3CBC22'],
    '--color-icon-green': ['#147B29', '#3CBC22'],
    '--color-text-green': ['#076D29', '#4EC72A'],

    '--color-background-red': ['#FEE4E6', '#5A0107'],
    '--color-border-red': ['#D31130', '#FB7D87'],
    '--color-icon-red': ['#D31130', '#FB7D87'],
    '--color-text-red': ['#BE0424', '#FD8E99'],

    '--color-background-orange': ['#FFE6CF', '#4E1608'],
    '--color-border-orange': ['#B34A01', '#F88617'],
    '--color-icon-orange': ['#B34A01', '#F88617'],
    '--color-text-orange': ['#A13F04', '#FD9537'],

    '--color-background-yellow': ['#FCEC85', '#451E03'],
    '--color-border-yellow': ['#965E03', '#D69804'],
    '--color-icon-yellow': ['#965E03', '#D69804'],
    '--color-text-yellow': ['#8A5001', '#E2A400'],

    '--color-background-purple': ['#ECE2FF', '#140036'],
    '--color-border-purple': ['#5828CA', '#9B73FF'],
    '--color-icon-purple': ['#5828CA', '#9B73FF'],
    '--color-text-purple': ['#4D1EB6', '#A985FF'],

    '--color-background-pink': ['#FFE1ED', '#520019'],
    '--color-border-pink': ['#C71050', '#FE73A1'],
    '--color-icon-pink': ['#C71050', '#FE73A1'],
    '--color-text-pink': ['#B30543', '#FF85B0'],

    '--color-background-cyan': ['#C7F1FF', '#001B2A'],
    '--color-border-cyan': ['#006BA3', '#00AFFA'],
    '--color-icon-cyan': ['#006BA3', '#00AFFA'],
    '--color-text-cyan': ['#005F91', '#21BDFF'],

    '--color-background-teal': ['#BCF5F0', '#062D38'],
    '--color-border-teal': ['#08767D', '#0DB7AF'],
    '--color-icon-teal': ['#08767D', '#0DB7AF'],
    '--color-text-teal': ['#0F686F', '#1DC3B9'],

    // =========================================================================
    // Radius — Meta-style generous rounding
    // =========================================================================
    '--radius-none': '4px',
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',
    '--radius-full': '9999px',

    // =========================================================================
    // Text size overrides
    // =========================================================================
    // =========================================================================
    // Element Sizes — aligned to XMDS (32/36/44 vs default 28/32/36)
    // =========================================================================
    '--size-element-sm': '32px',
    '--size-element-md': '36px',
    '--size-element-lg': '44px',

    // =========================================================================
    // Typography Scale — aligned to CDS/XMDS
    // CDS base = 15px, Display = 48px/600, H1/H2 = 24px, H3 = 17px
    // Body = 15px, Label = 15px, Supporting = 13px
    // =========================================================================

    // Font size scale (15px base × 1.2 ratio)
    '--font-size-xs': '0.6875rem', // 11px — CDS Tertiary Label
    '--font-size-sm': '0.8125rem', // 13px — CDS Secondary Label
    '--font-size-base': '0.9375rem', // 15px — CDS Body
    '--font-size-lg': '1.0625rem', // 17px — CDS Headline 3
    '--font-size-xl': '1.25rem', // 20px
    '--font-size-2xl': '1.5rem', // 24px — CDS Headline 1/2
    '--font-size-3xl': '1.8125rem', // 29px
    '--font-size-4xl': '2.1875rem', // 35px
    '--font-size-5xl': '3rem', // 48px — CDS Display

    // Display — CDS: 48px / semibold
    '--text-display-1-size': '3rem',
    '--text-display-1-weight': 'var(--font-weight-semibold)',
    '--text-display-1-leading': '1.1667',
    '--text-display-2-size': '2.1875rem',
    '--text-display-2-weight': 'var(--font-weight-semibold)',
    '--text-display-2-leading': '1.2571',
    '--text-display-3-size': '1.8125rem',
    '--text-display-3-weight': 'var(--font-weight-semibold)',
    '--text-display-3-leading': '1.2414',

    // Headings — CDS: H1/H2 = 24px, H3 = 17px
    '--text-heading-1-size': '1.5rem',
    '--text-heading-1-leading': '1.3333',
    '--text-heading-2-size': '1.5rem',
    '--text-heading-2-leading': '1.3333',

    // Body — CDS: 15px / 400
    '--text-body-size': '0.9375rem',
    '--text-body-leading': '1.4667',

    // Large text — CDS: 17px (Headline 3 size)
    '--text-large-size': '1.0625rem',
    '--text-large-leading': '1.4118',

    // Label — CDS: 15px / 500
    '--text-label-size': '0.9375rem',
    '--text-label-leading': '1.4667',

    // Supporting — CDS: 13px / 400
    '--text-supporting-size': '0.8125rem',
    '--text-supporting-leading': '1.5385'
  },

  components: {
    // =========================================================================
    // Button — pill shape, medium weight, custom muted/outline variants
    // =========================================================================
    button: {
      base: {
        borderRadius: '9999px !important',
        gap: '4px',
      },
      'size:sm': {
        paddingInline: '12px',
      },
      'size:md': {
        paddingInline: '16px',
      },
      'size:lg': {
        paddingInline: '20px',
      },
      'variant:primary': {fontWeight: '500'},
      'variant:secondary': {fontWeight: '500'},
      'variant:destructive': {fontWeight: '500'},
      'variant:ghost': {fontWeight: '500'},
      'variant:primary-muted': {
        backgroundColor: 'light-dark(#ECF5FF, #182849)',
        color: 'light-dark(#0457CB, #78BEFF)',
        fontWeight: '500',
        ':hover': {opacity: '0.85'},
        ':active': {opacity: '0.7'},
      },
      'variant:destructive-muted': {
        backgroundColor: 'light-dark(#FFF0F2, #471B1A)',
        color: 'light-dark(var(--color-error), #FE9DA6)',
        fontWeight: '500',
        ':hover': {opacity: '0.85'},
        ':active': {opacity: '0.7'},
      },
      'variant:primary-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-accent), #4BA9FE)',
        color: 'light-dark(var(--color-accent), #4BA9FE)',
        fontWeight: '500',
        ':hover': {backgroundColor: 'light-dark(rgba(0,100,224,0.06), rgba(75,169,254,0.1))'},
        ':active': {opacity: '0.7'},
      },
      'variant:secondary-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-border), #525456)',
        color: 'light-dark(var(--color-text-primary), #F3F4F5)',
        fontWeight: '500',
        ':hover': {backgroundColor: 'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.06))'},
        ':active': {opacity: '0.7'},
      },
      'variant:destructive-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-error), #FB7D87)',
        color: 'light-dark(var(--color-error), #FB7D87)',
        fontWeight: '500',
        ':hover': {backgroundColor: 'light-dark(rgba(211,17,48,0.06), rgba(251,125,135,0.1))'},
        ':active': {opacity: '0.7'},
      },
    },

    // =========================================================================
    // Card — 20px padding, 32px radius
    // =========================================================================
    card: {
      base: {
        '--card-radius': '32px',
        '--xds-card-padding': '20px',
      },
    },

    // =========================================================================
    // Section — 20px padding
    // =========================================================================


    // =========================================================================
    // Text input — CDS: 16px radius, 16px horizontal padding
    // =========================================================================
    'text-input': {
      base: {
        borderRadius: '8px !important',
        paddingInline: '12px !important',
        paddingBlock: '12px !important',
        minHeight: '44px',
        borderColor: 'light-dark(#CCD3DB, #494D53)',
      },
      'variant:search': {
        backgroundColor: 'light-dark(#F3F4F5, #28292C)',
        borderColor: 'transparent',
        borderRadius: '9999px !important',
      },
    },

    // =========================================================================
    // Field status — CDS: plain text below input, 12px gap, no pill bg
    // =========================================================================
    'field-status': {
      base: {
        backgroundColor: 'transparent !important',
        marginTop: '4px !important',
        paddingBlockStart: '0 !important',
        paddingBlockEnd: '0 !important',
        paddingInline: '0 !important',
        borderRadius: '0 !important',
      },
    },

    // =========================================================================
    // Selector — CDS: 16px radius to match text input
    // =========================================================================
    selector: {
      base: {
        borderRadius: '8px !important',
        paddingInline: '12px !important',
        paddingBlock: '12px !important',
        minHeight: '44px',
        '--color-accent-text': '#111112',
      },
    },

    // =========================================================================
    // Slider — CDS: 2px track, 24px active handle
    // =========================================================================
    'slider-track': {
      base: {
        backgroundColor: '#8F9296',
        height: '2px',
      },
    },

    // =========================================================================
    // Banner — per-status card bg (#810), primary icon, 32px radius
    // =========================================================================
    banner: {
      base: {
        '--banner-radius': '16px',
      },
      'status:info': {backgroundColor: 'var(--color-background-card)'},
      'status:warning': {backgroundColor: 'var(--color-background-card)'},
      'status:error': {backgroundColor: 'var(--color-background-card)'},
      'status:success': {backgroundColor: 'var(--color-background-card)'},
    },
    'banner-icon': {
      base: {color: 'var(--color-icon-primary)'},
    },

    // =========================================================================
    // Badge — subtle pastel backgrounds
    // =========================================================================
    badge: {
      base: {
        fontWeight: '500',
        borderRadius: '20px',
        paddingInline: '8px',
        paddingBlock: '6px',
      },
      'variant:info': {
        backgroundColor: 'light-dark(#DBECFF, #14367E)',
        color: 'var(--color-text-primary)',
      },
      'variant:success': {
        backgroundColor: 'light-dark(#DAF0D4, #154321)',
        color: 'var(--color-text-primary)',
      },
      'variant:warning': {
        backgroundColor: 'light-dark(#FAEBA4, #5B2F05)',
        color: 'var(--color-text-primary)',
      },
      'variant:error': {
        backgroundColor: 'light-dark(#FEE4E6, #73161A)',
        color: 'var(--color-text-primary)',
      },
    },

    // =========================================================================
    // Radio — ring style via pseudo-class overrides (#811)
    // =========================================================================
    radio: {
      base: {
        borderWidth: '1.5px',
        '--color-border-emphasized': '#8F9296',
      },
    },
    'radio-dot': {
      base: {
        backgroundColor: 'var(--color-accent)',
        width: '14px',
        height: '14px',
      },
    },

    // =========================================================================
    // Checkbox — thicker border, pseudo-class hover (#811)
    // =========================================================================
    checkbox: {
      base: {
        borderWidth: '2px',
        borderRadius: '7px',
        '--color-border-emphasized': '#8F9296',
      },
    },

    // =========================================================================
    // Switch — gray track, pseudo-class hover (#811)
    // =========================================================================

    switch: {
      base: {
        '--color-background-gray': '#8F9296',
      },
    },
    'switch-thumb': {
      base: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)',
      },
    },



    // =========================================================================
    // Divider — opaque gray instead of transparent blue-gray
    // =========================================================================
    divider: {
      base: {
        backgroundColor: 'light-dark(#DDE2E8, #3E4042)',
      },
    },

    // =========================================================================
    // Tabs — CDS: 1px underline, primary text when active, 12px padding
    // =========================================================================
    tab: {
      base: {
        paddingInline: '12px',
        '--color-accent': '#111112',
        '--color-accent-text': '#111112',
      },
    },

    // =========================================================================
    // Calendar — selected date via state class (#763)
    // =========================================================================
    'calendar-day': {
      selected: {backgroundColor: 'var(--color-accent)'},
    },

    // =========================================================================
    // Empty state — heading 1 size
    // =========================================================================
    'emptystate-title': {
      base: {fontSize: '1.75rem'},
    },

    // =========================================================================
    // Dialog — custom bg, 32px radius
    // =========================================================================
    dialog: {
      base: {
        backgroundColor: 'light-dark(var(--color-background-surface), #1F1F20)',
        '--dialog-radius': '32px',
        '--xds-card-padding': '20px',
      },
    },

    // =========================================================================
    // Layout — dialog internals: no borders, no body padding
    // =========================================================================
    'layout-header': {
      base: {borderBlockEndWidth: '0'},
    },
    'layout-content': {
      base: {paddingBlockStart: '0', paddingBlockEnd: '0'},
    },
    'layout-footer': {
      base: {borderBlockStartWidth: '0'},
    },

    // =========================================================================
    // Popover / Menu — generous radius
    // =========================================================================
    popover: {
      base: {
        borderRadius: '16px',
        padding: '16px !important',
      },
    },
    'dropdown-menu': {
      base: {
        '--dropdown-radius': '16px',
        '--dropdown-padding': '8px',
        padding: '8px !important',
      },
    },
    'more-menu': {
      base: {
        borderRadius: '16px',
        padding: '8px !important',
      },
    },
    tooltip: {
      base: {borderRadius: '16px'},
    },
  },

  icons: metaIconRegistry,
});
