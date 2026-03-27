/**
 * Meta Theme for XDS
 *
 * Color tokens derived from CDS (Core Design System) — Meta's internal
 * design system platform. All color values map to the XMDS 3.0 palette
 * defined in CDSBaseColorDefinition.php.
 *
 * Semantic token assignments follow CDSDefaultThemeSource.php mappings:
 * - Accent: GRAY_1100/GRAY_50 (secondary brand accent)
 * - Brand blue: BLUE_650/BLUE_550 (primary brand accent, "BLUE_BADGE" in CDS)
 * - Surfaces: WHITE/GRAY_1050 (clean light, deep dark)
 * - Text: GRAY_1100/GRAY_50 primary, GRAY_650/GRAY_400 secondary
 * - Status: RED_650, GREEN_650, YELLOW_650 (light), RED/GREEN/YELLOW_400 (dark)
 *
 * Token values use [light, dark] tuples for automatic light-dark() conversion.
 *
 * Component overrides use xdsClassName class targeting (#763) and
 * the defineTheme variants field (#790) instead of CSS custom properties.
 *
 * @see fbsource/www/flib/intern/color_systems/design_systems/cds/CDSBaseColorDefinition.php
 * @see fbsource/www/flib/intern/design_systems_platform/design_systems/cds/themes/CDSDefaultThemeSource.php
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
    },
    // heading inherits from body
    code: {
      family: 'SF Mono',
      fallbacks: '"Cascadia Code", "Segoe UI Mono", Menlo, Consolas, monospace',
    },
  },

  // Motion — default Meta timing
  motion: {fast: 175, medium: 410, ratio: 0.75},

  tokens: {
    // =========================================================================
    // Colors — CDS XMDS 3.0 palette
    // =========================================================================

    // Core accent — CDS uses BLUE_650/BLUE_550 for BLUE_BADGE (primary brand accent)
    '--color-accent': ['#0064E0', '#0064E0'], // Meta Blue — same in light and dark
    '--color-accent-muted': ['#0064E033', '#0082FB3F'],

    // Surfaces — CDS: SURFACE_BACKGROUND, CARD_BACKGROUND, etc.
    '--color-background-surface': ['#FFFFFF', '#1F1F22'], // CDS: SURFACE_BACKGROUND (WHITE / GRAY_1050)
    '--color-background-body': ['#F2F4F6', '#111112'], // CDS: BACKGROUND_DEEMPHASIZED (GRAY_50 / GRAY_1100)
    '--color-background-card': ['#FFFFFF', '#1F1F20'], // CDS: CARD_BACKGROUND (WHITE / #1F1F20)
    '--color-background-popover': ['#FFFFFF', '#1F1F20'], // CDS: POPOVER_BACKGROUND (WHITE / #1F1F20)
    '--color-overlay': ['#1111121F', '#11111299'],
    '--color-overlay-hover': [
      'rgba(17, 17, 18, 0.05)',
      'rgba(242, 244, 246, 0.05)',
    ], // Derived from GRAY_1100/GRAY_50 at 5%
    '--color-overlay-pressed': [
      'rgba(17, 17, 18, 0.08)',
      'rgba(242, 244, 246, 0.08)',
    ], // Derived from GRAY_1100/GRAY_50 at 8%
    '--color-background-muted': ['#F2F4F6', '#28292C'], // CDS: CARD_BACKGROUND_FILLED (GRAY_50 / GRAY_1000)
    '--color-neutral': ['rgba(17, 17, 18, 0.06)', 'rgba(242, 244, 246, 0.1)'], // Subtle gray for secondary buttons

    // Text — CDS: PRIMARY_TEXT, SECONDARY_TEXT, etc.
    '--color-text-primary': ['#111112', '#F3F4F5'], // CDS: PRIMARY_TEXT (GRAY_1100 / GRAY_50)
    '--color-text-secondary': ['#5D6C7B', '#AAAFB5'],
    '--color-text-disabled': ['#96A6B4', '#6F747C'],
    '--color-text-accent': ['#0064E0', '#0064E0'], // Same as --color-accent (Meta Blue)
    '--color-on-dark': ['#FFFFFF', '#FFFFFF'], // CDS: PRIMARY_TEXT_ON_MEDIA (WHITE)

    // Icons — CDS: PRIMARY_ICON, SECONDARY_ICON, etc.
    '--color-icon-primary': ['#111112', '#F2F4F6'], // CDS: PRIMARY_ICON (GRAY_1100 / GRAY_50)
    '--color-icon-secondary': ['#5D6C7B', '#AAAFB5'],
    '--color-icon-disabled': ['#DDE2E8', '#6F747C'],
    '--color-on-dark': ['#FFFFFF', '#FFFFFF'], // CDS: PRIMARY_ICON_ON_MEDIA (WHITE)

    // Focus — derived from CDS BLUE_BADGE and status tokens
    '--color-accent': ['#0064E0', '#0064E0'], // Meta Blue — same in light and dark
    '--color-error': ['#D31130', '#F5394F'],
    '--color-success': ['#147B29', '#0D8626'],
    '--color-warning': ['#965E03', '#E9AF08'],

    // Dividers — CDS: DIVIDER / CONTAINER_BORDER
    '--color-border': ['#DDE2E8', '#F2F4F619'],
    '--color-border-emphasized': ['#666A72', '#9FA4AB'], // GRAY_650 / GRAY_400
    '--color-border-emphasized': ['#DDE2E8', '#494D53'],

    // Status colors — CDS: NEGATIVE, POSITIVE, WARNING
    '--color-success': ['#147B29', '#3CBC22'], // CDS: POSITIVE (GREEN_650 / GREEN_400)
    '--color-success-muted': [
      'rgba(20, 123, 41, 0.1)',
      'rgba(60, 188, 34, 0.15)',
    ],
    '--color-error': ['#D31130', '#FB7D87'], // CDS: NEGATIVE (RED_650 / RED_400)
    '--color-error-muted': [
      'rgba(211, 17, 48, 0.1)',
      'rgba(251, 125, 135, 0.15)',
    ],
    '--color-warning': ['#965E03', '#D69804'], // CDS: WARNING (YELLOW_650 / YELLOW_400)
    '--color-warning-muted': [
      'rgba(150, 94, 3, 0.1)',
      'rgba(214, 152, 4, 0.15)',
    ],
    '--color-accent': ['#0044A3', '#3087FF'], // BLUE_650 / BLUE_400
    '--color-accent-muted': ['rgba(0, 68, 163, 0.1)', 'rgba(48, 135, 255, 0.15)'],

    // Disabled — derived from CDS surface tokens
    '--color-skeleton': ['#E7EAED', '#28292C'], // CDS: GRAY_100 / GRAY_1000
    '--color-shadow': ['rgba(17, 17, 18, 0.12)', 'rgba(17, 17, 18, 0.12)'], // CDS: ELEVATED_SHADOW (GRAY_1100_A_12)
    '--color-tint-hover': ['black', 'white'],

    // Named palette — Blue (CDS XMDS 3.0 Blue ramp)
    '--color-background-blue': ['#D7E9FF', '#001F4C'], // BLUE_100 / BLUE_900
    '--color-border-blue': ['#0044A3', '#3087FF'], // BLUE_650 / BLUE_400
    '--color-icon-blue': ['#0044A3', '#3087FF'], // BLUE_650 / BLUE_400
    '--color-text-blue': ['#003B8E', '#4D99FF'], // BLUE_700 / BLUE_350

    // Gray (CDS XMDS 3.0 Gray ramp)
    '--color-background-gray': ['#F2F4F6', '#28292C'], // GRAY_50 / GRAY_1000
    '--color-border-gray': ['#DFE2E5', '#494D53'], // GRAY_150 / GRAY_800
    '--color-icon-gray': ['#666A72', '#9FA4AB'], // GRAY_650 / GRAY_400
    '--color-text-gray': ['#111112', '#F2F4F6'], // GRAY_1100 / GRAY_50

    // Green (CDS XMDS 3.0 Green ramp)
    '--color-background-green': ['#C4F8B9', '#053018'], // GREEN_100 / GREEN_1000
    '--color-border-green': ['#147B29', '#3CBC22'], // GREEN_650 / GREEN_400
    '--color-icon-green': ['#147B29', '#3CBC22'], // GREEN_650 / GREEN_400
    '--color-text-green': ['#076D29', '#4EC72A'], // GREEN_700 / GREEN_350

    // Red (CDS XMDS 3.0 Red ramp)
    '--color-background-red': ['#FEE4E6', '#5A0107'], // RED_100 / RED_1000
    '--color-border-red': ['#D31130', '#FB7D87'], // RED_650 / RED_400
    '--color-icon-red': ['#D31130', '#FB7D87'], // RED_650 / RED_400
    '--color-text-red': ['#BE0424', '#FD8E99'], // RED_700 / RED_350

    // Orange (CDS XMDS 3.0 Orange ramp)
    '--color-background-orange': ['#FFE6CF', '#4E1608'], // ORANGE_100 / ORANGE_1000
    '--color-border-orange': ['#B34A01', '#F88617'], // ORANGE_650 / ORANGE_400
    '--color-icon-orange': ['#B34A01', '#F88617'], // ORANGE_650 / ORANGE_400
    '--color-text-orange': ['#A13F04', '#FD9537'], // ORANGE_700 / ORANGE_350

    // Yellow (CDS XMDS 3.0 Yellow ramp)
    '--color-background-yellow': ['#FCEC85', '#451E03'], // YELLOW_100 / YELLOW_1000
    '--color-border-yellow': ['#965E03', '#D69804'], // YELLOW_650 / YELLOW_400
    '--color-icon-yellow': ['#965E03', '#D69804'], // YELLOW_650 / YELLOW_400
    '--color-text-yellow': ['#8A5001', '#E2A400'], // YELLOW_700 / YELLOW_350

    // Purple (CDS XMDS 3.0 Purple ramp)
    '--color-background-purple': ['#ECE2FF', '#140036'], // PURPLE_100 / PURPLE_1050
    '--color-border-purple': ['#5828CA', '#9B73FF'], // PURPLE_650 / PURPLE_400
    '--color-icon-purple': ['#5828CA', '#9B73FF'], // PURPLE_650 / PURPLE_400
    '--color-text-purple': ['#4D1EB6', '#A985FF'], // PURPLE_700 / PURPLE_350

    // Pink (CDS XMDS 3.0 Pink ramp)
    '--color-background-pink': ['#FFE1ED', '#520019'], // PINK_100 / PINK_1000
    '--color-border-pink': ['#C71050', '#FE73A1'], // PINK_650 / PINK_400
    '--color-icon-pink': ['#C71050', '#FE73A1'], // PINK_650 / PINK_400
    '--color-text-pink': ['#B30543', '#FF85B0'], // PINK_700 / PINK_350

    // Cyan (CDS XMDS 3.0 Cyan ramp)
    '--color-background-cyan': ['#C7F1FF', '#001B2A'], // CYAN_100 / CYAN_1050
    '--color-border-cyan': ['#006BA3', '#00AFFA'], // CYAN_650 / CYAN_400
    '--color-icon-cyan': ['#006BA3', '#00AFFA'], // CYAN_650 / CYAN_400
    '--color-text-cyan': ['#005F91', '#21BDFF'], // CYAN_700 / CYAN_350

    // Teal (CDS XMDS 3.0 Teal ramp)
    '--color-background-teal': ['#BCF5F0', '#062D38'], // TEAL_100 / TEAL_1000
    '--color-border-teal': ['#08767D', '#0DB7AF'], // TEAL_650 / TEAL_400
    '--color-icon-teal': ['#08767D', '#0DB7AF'], // TEAL_650 / TEAL_400
    '--color-text-teal': ['#0F686F', '#1DC3B9'], // TEAL_700 / TEAL_350

    // =========================================================================
    // Radius — Meta-style moderate rounding
    // =========================================================================
    '--radius-none': '4px',
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',
    '--radius-full': '9999px',

    // Typography font tokens are now handled by the `typography` config above.

    // =========================================================================
    // Text size overrides
    // =========================================================================
    '--font-size-2xl': '1.75rem', // 28px — heading 1
  },

  // ===========================================================================
  // Custom variants — declaration + styles together (#803)
  // Run `xds theme build` to generate TypeScript declarations for autocomplete.
  // ===========================================================================
  variants: {
    button: {
      'primary-muted': {
        backgroundColor: 'light-dark(#ECF5FF, #182849)',
        color: 'light-dark(#0457CB, #78BEFF)',
        fontWeight: '500',
        outline: 'none',
      },
      'destructive-muted': {
        backgroundColor: 'light-dark(#FFF0F2, #471B1A)',
        color: 'light-dark(var(--color-error), #FE9DA6)',
        fontWeight: '500',
        outline: 'none',
      },
      'primary-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-accent), #4BA9FE)',
        color: 'light-dark(var(--color-accent), #4BA9FE)',
        fontWeight: '500',
        outline: 'none',
      },
      'secondary-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-border), #525456)',
        color: 'light-dark(var(--color-text-primary), #F3F4F5)',
        fontWeight: '500',
        outline: 'none',
      },
      'destructive-outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(var(--color-error), #FB7D87)',
        color: 'light-dark(var(--color-error), #FB7D87)',
        fontWeight: '500',
        outline: 'none',
      },
    },
  },

  components: {
    // =========================================================================
    // Button — CDS: PRIMARY_BUTTON_BACKGROUND = BLUE_650
    // Pill shape, medium weight, custom muted/outline variants
    // =========================================================================
    button: {
      base: {
        borderRadius: '9999px !important',
      },
      'variant:primary': {
        color: 'light-dark(var(--color-on-dark), #F3F4F5)',
        fontWeight: '500',
      },
      'variant:secondary': {
        backgroundColor: 'light-dark(var(--color-neutral), #28292B)',
        color: 'light-dark(var(--color-text-primary), #B5B7BB)',
        fontWeight: '500',
      },
      'variant:destructive': {
        backgroundColor: 'light-dark(var(--color-error), #D31130)',
        fontWeight: '500',
      },
      'variant:ghost': {
        fontWeight: '500',
      },
    },

    // =========================================================================
    // Card — CDS spacing tokens
    // =========================================================================
    card: {
      base: {
        '--xds-card-padding': '20px',
        '--card-radius': '32px',
      },
    },

    // =========================================================================
    // Section
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
    // Text input — search variant has filled gray background
    // =========================================================================
    'text-input': {
      'variant:search': {
        backgroundColor: 'light-dark(#F3F4F5, #28292C)',
        borderColor: 'transparent',
        borderRadius: '9999px',
      },
    },

    // =========================================================================
    // Banner — card background, primary icon color, 32px radius
    // =========================================================================
    banner: {
      base: {
        '--banner-status-bg': 'var(--color-background-card)',
        '--banner-radius': '32px',
      },
    },
    'banner-icon': {
      base: {
        color: 'var(--color-icon-primary)',
      },
    },

    // =========================================================================
    // Badge — subtle Meta-style pastel badges
    // =========================================================================
    badge: {
      base: {
        fontWeight: '500',
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
    // Radio — ring style via xdsClassName sub-element targets (#763)
    // Blue border + white bg + blue dot when checked
    // CSS vars kept for border/bg because they participate in hover color-mix()
    // =========================================================================
    radio: {
      base: {
        '--radio-border-width': '2px',
        '--radio-border': '#8F9296',
        '--radio-checked-border': 'var(--color-accent)',
        '--radio-checked-bg': 'var(--color-background-surface)',
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
    // Checkbox — thicker border to match radio
    // CSS vars kept because they participate in hover color-mix()
    // =========================================================================
    checkbox: {
      base: {
        '--checkbox-border': '#8F9296',
        '--checkbox-border-width': '2px',
        borderRadius: '4px',
      },
    },

    // =========================================================================
    // Switch — gray track when off, oversized thumb with elevation
    // CSS var kept because it participates in hover color-mix()
    // =========================================================================
    switch: {
      base: {
        '--switch-off-bg': '#8F9296',
        '--switch-thumb-size-off': '22px',
        '--switch-thumb-size-on': '22px',
        '--switch-thumb-off-x': 'translateX(0px)',
        '--switch-thumb-on-x': 'translateX(16px)',
      },
    },
    'switch-thumb': {
      base: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)',
      },
    },

    // =========================================================================
    // Slider — custom track color via xdsClassName sub-element target (#763)
    // =========================================================================
    'slider-track': {
      base: {
        backgroundColor: '#8F9296',
      },
    },

    // =========================================================================
    // Calendar — selected date via xdsClassName state class (#763)
    // =========================================================================
    'calendar-day': {
      'selected:selected': {
        backgroundColor: 'var(--color-accent)',
      },
    },

    // =========================================================================
    // Empty state — title uses heading 1 size
    // =========================================================================
    'emptystate-title': {
      base: {
        fontSize: '1.75rem',
      },
    },

    // =========================================================================
    // Dialog — clean: custom bg, 32px radius, no header/footer borders
    // =========================================================================
    dialog: {
      base: {
        backgroundColor: 'light-dark(var(--color-background-surface), #1F1F20)',
        '--dialog-radius': '32px',
        '--xds-card-padding': '20px',
      },
    },

    // =========================================================================
    // Layout — dialog header/footer: no borders, no body top/bottom padding
    // =========================================================================
    'layout-header': {
      base: {
        borderBlockEndWidth: '0',
      },
    },
    'layout-content': {
      base: {
        paddingBlockStart: '0',
        paddingBlockEnd: '0',
      },
    },
    'layout-footer': {
      base: {
        borderBlockStartWidth: '0',
        '--size-element-md': '36px',
      },
    },

    // =========================================================================
    // Popover / Menu containers — 16px radius
    // =========================================================================
    popover: {
      base: {
        '--popover-radius': '16px',
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
      base: {
        borderRadius: '16px',
      },
    },

    // Heading and text component overrides are auto-generated by typography.scale.
  },

  icons: metaIconRegistry,
});
