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
    scale: {base: 14, ratio: 1.2},
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
    '--color-border-emphasized': ['#DDE2E8', '#494D53'],

    // =========================================================================
    // Effects
    // =========================================================================
    '--color-skeleton': ['#E7EAED', '#28292C'],
    '--color-shadow': ['rgba(17, 17, 18, 0.12)', 'rgba(17, 17, 18, 0.12)'],
    '--color-tint-hover': ['black', 'white'],

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
    '--font-size-2xl': '1.75rem', // 28px — heading 1
  },

  components: {
    // =========================================================================
    // Button — pill shape, medium weight, custom muted/outline variants
    // =========================================================================
    button: {
      base: {
        borderRadius: '9999px !important',
      },
      'variant:primary': {fontWeight: '500'},
      'variant:secondary': {fontWeight: '500'},
      'variant:destructive': {fontWeight: '500'},
      'variant:ghost': {fontWeight: '500'},
      'variant:primary-muted': {
        backgroundColor: 'light-dark(#ECF5FF, #182849)',
        color: 'light-dark(#0457CB, #78BEFF)',
        fontWeight: '500',
      },
      'variant:destructive-muted': {
        backgroundColor: 'light-dark(#FFF0F2, #471B1A)',
        color: 'light-dark(var(--color-error), #FE9DA6)',
        fontWeight: '500',
      },
      'variant:primary-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-accent), #4BA9FE)',
        color: 'light-dark(var(--color-accent), #4BA9FE)',
        fontWeight: '500',
      },
      'variant:secondary-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-border), #525456)',
        color: 'light-dark(var(--color-text-primary), #F3F4F5)',
        fontWeight: '500',
      },
      'variant:destructive-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-error), #FB7D87)',
        color: 'light-dark(var(--color-error), #FB7D87)',
        fontWeight: '500',
      },
    },

    // =========================================================================
    // Card — 20px padding, 32px radius
    // =========================================================================
    card: {
      base: {
        '--xds-card-padding': '20px',
        '--card-radius': '32px',
      },
    },

    // =========================================================================
    // Section — 20px padding
    // =========================================================================
    section: {
      base: {
        '--xds-section-padding': '20px',
      },
    },

    // =========================================================================
    // Field status — plain text (no background pill)
    // =========================================================================
    'field-status': {
      base: {
        backgroundColor: 'transparent',
        paddingBlock: '0',
        paddingInline: '0',
      },
    },

    // =========================================================================
    // Text input — search variant pill
    // =========================================================================
    'text-input': {
      'variant:search': {
        backgroundColor: 'light-dark(#F3F4F5, #28292C)',
        borderColor: 'transparent',
        borderRadius: '9999px',
      },
    },

    // =========================================================================
    // Banner — per-status card bg (#810), primary icon, 32px radius
    // =========================================================================
    banner: {
      base: {
        '--banner-radius': '32px',
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
      base: {fontWeight: '500'},
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
        borderColor: '#8F9296',
        borderWidth: '2px',
      },
      ':hover': {
        borderColor: 'color-mix(in srgb, #8F9296, black 20%)',
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
        borderColor: '#8F9296',
        borderWidth: '2px',
        borderRadius: '4px',
      },
      ':hover': {
        borderColor: 'color-mix(in srgb, #8F9296, black 20%)',
      },
    },

    // =========================================================================
    // Switch — gray track, pseudo-class hover (#811)
    // =========================================================================
    switch: {
      base: {backgroundColor: '#8F9296'},
      ':hover': {
        backgroundColor: 'color-mix(in srgb, #8F9296, black 5%)',
      },
    },
    'switch-thumb': {
      base: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)',
        width: '22px',
        height: '22px',
      },
    },

    // =========================================================================
    // Slider — custom track via sub-element target (#763)
    // =========================================================================
    'slider-track': {
      base: {backgroundColor: '#8F9296'},
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
