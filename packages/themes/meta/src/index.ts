/**
 * XDS Meta Theme
 *
 * Anchored to the CDS Default (XMDS) visual language.
 * Colors, typography scale, and radii are sourced directly from
 * CDSDefaultThemeSource.php and CDSInternalColor.php in fbsource.
 *
 * Key decisions (component-level, not blind token mapping):
 * - Primary button is #0064E0 in BOTH light and dark (CDS doesn't flip it)
 * - Secondary button uses stroke for definition, not background fill
 * - Radii are significantly larger than XDS defaults (card: 32px, btn: 16-22px)
 * - Typography scale bumped to match CDS: body 15px, h3 17px, h1/2 24px
 * - Font: Optimistic (Meta's brand font) with system fallbacks
 */

import {defineTheme} from '@xds/core/theme';

export const metaTheme = defineTheme({
  name: 'meta',

  tokens: {
    // =========================================================================
    // Typography — Optimistic font + CDS scale
    // CDS uses: body=15px, h3=17px, h1/2=24px, display=48px
    // =========================================================================
    '--font-body':
      '"Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    '--font-heading':
      '"Optimistic Display", "Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

    // Type scale — CDS values (overriding XDS defaults of 14/16/18/20px)
    '--text-sm': '0.8125rem', // 13px — secondary label, meta (unchanged)
    '--text-base': '0.9375rem', // 15px — body (CDS BODY token)
    '--text-lg': '1.0625rem', // 17px — headline 3 (CDS HEADLINE_3)
    '--text-xl': '1.25rem', // 20px — intermediate
    '--text-2xl': '1.5rem', // 24px — headline 1/2 (CDS HEADLINE_1/2)

    // =========================================================================
    // Colors — sourced from CDSDefaultThemeSource + CDSInternalColor hex values
    // =========================================================================

    // Accent / brand blue
    // Light: XMDS_3_BLUE_650 (#0064E0), Dark: XMDS_3_BLUE_550 (#0082FB)
    '--color-accent': ['#0064E0', '#0082FB'],
    '--color-accent-deemphasized': ['#0064E026', '#0082FB33'],
    '--color-accent-text': ['#0457CB', '#4BA9FE'],

    // Surfaces
    // SURFACE_BACKGROUND: XMDS_3_WHITE / XMDS_3_GRAY_1050
    '--color-surface': ['#FFFFFF', '#152127'],
    // Wash/page: XMDS_3_GRAY_50 / XMDS_3_GRAY_1100
    '--color-wash': ['#F1F4F7', '#0A1317'],
    '--color-card': ['#FFFFFF', '#152127'],
    '--color-popover': ['#FFFFFF', '#1C2B33'],
    '--color-navbar': ['#FFFFFF', '#152127'],

    // Text
    // PRIMARY_TEXT: XMDS_3_GRAY_1100 (#0A1317) / XMDS_3_GRAY_50 (#F1F4F7)
    '--color-text-primary': ['#0A1317', '#F1F4F7'],
    // SECONDARY_TEXT: XMDS_3_GRAY_650 (#5D6C7B) / XMDS_3_GRAY_400 (#96A6B4)
    '--color-text-secondary': ['#5D6C7B', '#96A6B4'],
    '--color-text-disabled': ['#A4B0BC', '#5D6C7B'],
    '--color-text-link': ['#0064E0', '#3E9EFB'],
    '--color-text-placeholder': ['#8494A3', '#748695'],

    // Icons (parallel to text)
    '--color-icon-primary': ['#0A1317', '#F1F4F7'],
    '--color-icon-secondary': ['#5D6C7B', '#96A6B4'],
    '--color-icon-tertiary': ['#748695', '#8494A3'],
    '--color-icon-disabled': ['#A4B0BC', '#5D6C7B'],

    // Divider
    // DIVIDER: XMDS_3_GRAY_150 (#DDE2E8) / XMDS_3_GRAY_800 (#3D4F5C)
    '--color-divider': ['#DDE2E8', '#3D4F5C'],
    '--color-divider-high-contrast': ['#8494A3', '#748695'],
    '--color-divider-emphasized': ['#CCD3DB', '#4E606F'],

    // Status
    // NEGATIVE: XMDS_3_RED_650 (#D31130) / XMDS_3_RED_400 (#FB7D87)
    '--color-negative': ['#D31130', '#FB7D87'],
    '--color-negative-deemphasized': ['#D3113026', '#FB7D8733'],
    // POSITIVE: XMDS_3_GREEN_650 (#147B29) / XMDS_3_GREEN_400 (#3CBC22)
    '--color-positive': ['#147B29', '#3CBC22'],
    '--color-positive-deemphasized': ['#147B2926', '#3CBC2233'],
    // WARNING: XMDS_3_YELLOW_650 (#965E03) / XMDS_3_YELLOW_400 (#D69804)
    '--color-warning': ['#965E03', '#D69804'],
    '--color-warning-deemphasized': ['#965E0326', '#D6980433'],

    // Effects
    '--color-shadow-elevation': [
      'rgba(10, 19, 23, 0.1)',
      'rgba(0, 0, 0, 0.35)',
    ],
    '--color-hover-overlay': ['rgba(10,19,23,0.05)', 'rgba(241,244,247,0.05)'],
    '--color-pressed-overlay': [
      'rgba(10,19,23,0.10)',
      'rgba(241,244,247,0.10)',
    ],
    '--color-focus-outline': ['#0064E0', '#0082FB'],

    // Glimmer / skeleton
    '--color-glimmer': ['#CCD3DB', '#3D4F5C'],

    // =========================================================================
    // Radii — CDS is significantly rounder than XDS defaults
    // CDSCornerRadiusTokenSource values from CDSDefaultThemeSource.php
    // =========================================================================

    // Card/dialog: CDSCornerRadiusTokenSource::CARD_CONTAINER_RADIUS = 32
    '--radius-container': '32px',
    // Input/list cell: CDSCornerRadiusTokenSource::INPUT = 16
    '--radius-element': '16px',
    // Chip: CDSCornerRadiusTokenSource::CHIP = 8
    '--radius-content': '8px',
    // Inner (tight): CDSCornerRadiusTokenSource::DEFAULT = 4
    '--radius-inner': '4px',
    // Pills stay full
    '--radius-rounded': '9999px',
  },

  components: {
    // =========================================================================
    // Button
    // CDS per-size radii: BUTTON_SMALL=16, BUTTON_MEDIUM=18, BUTTON_LARGE=22
    // PRIMARY_BUTTON_BACKGROUND = XMDS_3_BLUE_650 in BOTH light and dark
    // SECONDARY_BUTTON: transparent bg, SECONDARY_BUTTON_STROKE border
    // =========================================================================
    button: {
      // Primary: blue in both modes (CDS doesn't flip primary button color)
      'variant:primary': {
        backgroundColor: '#0064E0',
        color: '#FFFFFF',
      },
      // Secondary: transparent with stroke
      'variant:secondary': {
        backgroundColor: 'transparent',
        borderColor: 'light-dark(#CCD3DB, #445664)',
        color: 'light-dark(#0A1317, #F1F4F7)',
      },
      // Ghost: accent text, no border
      'variant:ghost': {
        backgroundColor: 'transparent',
        color: 'light-dark(#0064E0, #0082FB)',
      },
      // Sizes — match CDS button radii exactly
      'size:sm': {borderRadius: '16px'},
      'size:md': {borderRadius: '18px'},
      'size:lg': {borderRadius: '22px'},
    },

    // =========================================================================
    // Card — CARD_CONTAINER_RADIUS = 32px, subtle shadow
    // =========================================================================
    card: {
      base: {
        borderRadius: '32px',
        boxShadow:
          'light-dark(0 4px 12px rgba(10,19,23,0.10), 0 4px 16px rgba(0,0,0,0.35))',
        borderWidth: '0px',
      },
    },

    // =========================================================================
    // Heading — CDS typography scale
    // DISPLAY_1 = 48px, HEADLINE_1/2 = 24px, HEADLINE_3 = 17px
    // =========================================================================
    heading: {
      'level:1': {
        fontFamily:
          '"Optimistic Display", "Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '1.5rem', // 24px — CDS HEADLINE_1
        fontWeight: '600',
        lineHeight: '1.167',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      'level:2': {
        fontFamily:
          '"Optimistic Display", "Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '1.5rem', // 24px — CDS HEADLINE_2
        fontWeight: '600',
        lineHeight: '1.167',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      'level:3': {
        fontFamily:
          '"Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '1.0625rem', // 17px — CDS HEADLINE_3
        fontWeight: '600',
        lineHeight: '1.294',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      'level:4': {
        fontFamily:
          '"Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '0.9375rem', // 15px — CDS PRIMARY_LABEL
        fontWeight: '600',
        lineHeight: '1.267',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      'level:5': {
        fontFamily:
          '"Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '0.9375rem',
        fontWeight: '500',
        lineHeight: '1.267',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      'level:6': {
        fontFamily:
          '"Optimistic Text", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '0.8125rem', // 13px — CDS SECONDARY_LABEL
        fontWeight: '500',
        lineHeight: '1.308',
        color: 'var(--color-text-secondary)',
        margin: '0',
      },
    },

    // =========================================================================
    // Text — CDS type tokens
    // BODY = 15px/400, BODY_EMPHASIZED = 15px/700, META = 13px/400,
    // SECONDARY_LABEL = 13px/500, TERTIARY_LABEL = 11px/500
    // =========================================================================
    text: {
      'type:body': {
        fontSize: '0.9375rem', // 15px — CDS BODY
        fontWeight: '400',
        lineHeight: '1.267',
      },
      'type:label': {
        fontSize: '0.9375rem', // 15px — CDS PRIMARY_LABEL
        fontWeight: '500',
        lineHeight: '1.267',
      },
      'type:supporting': {
        fontSize: '0.8125rem', // 13px — CDS META / SECONDARY_LABEL
        fontWeight: '400',
        lineHeight: '1.308',
        color: 'var(--color-text-secondary)',
      },
      'type:code': {
        fontFamily: '"SF Mono", Monaco, Consolas, "Courier New", monospace',
        fontSize: '0.875rem',
        backgroundColor: 'var(--color-wash)',
        padding: '2px 5px',
        borderRadius: '4px',
      },
    },

    // =========================================================================
    // Badge — CDS: TEXT_BADGE corner radius = 20px
    // =========================================================================
    badge: {
      base: {
        borderRadius: '20px',
        fontWeight: '500',
        fontSize: '0.6875rem', // 11px — CDS TERTIARY_LABEL scale
      },
    },

    // =========================================================================
    // Divider — 1px, DIVIDER color token
    // =========================================================================
    divider: {
      base: {
        borderTopColor: 'var(--color-divider)',
        borderTopWidth: '1px',
      },
    },

    // =========================================================================
    // Section — SECTION_PADDING_VERTICAL = 14px
    // =========================================================================
    section: {
      base: {
        paddingTop: '14px',
        paddingBottom: '14px',
      },
    },
  },
});

export default metaTheme;
