/**
 * Neutral Theme
 *
 * A grayscale theme with neutral colors and modern aesthetics.
 * Uses oklch color space for perceptually uniform colors.
 * Uses Geist font family for a clean, modern look.
 *
 * Only overrides tokens that differ from the defaults.
 * Spacing, size, textSize, lineHeight, fontWeight, and transition
 * use the built-in defaults automatically.
 */

import {defineTheme} from '@xds/core/theme';
import {neutralIconRegistry} from './icons';

export const neutralTheme = defineTheme({
  name: 'neutral',

  // Type scale: same as default (base=14, ratio=1.2).
  // Neutral uses bold weights on h3/h4 for stronger subsection hierarchy.
  typeScale: {
    base: 14,
    ratio: 1.2,
    weights: {
      heading: {
        3: 'var(--font-weight-bold)',
        4: 'var(--font-weight-bold)',
      },
    },
  },

  // Motion scale: snappier than default to match shadcn/Tailwind conventions.
  // Produces: fast-min=95ms, fast=125ms, fast-max=165ms,
  //           medium-min=225ms, medium=300ms, medium-max=400ms.
  motionScale: {fast: 125, medium: 300, ratio: 0.75},

  tokens: {
    // =========================================================================
    // Colors — neutral grayscale palette using oklch
    // =========================================================================

    // Core semantic
    '--color-accent': ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
    '--color-accent-deemphasized': ['oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
    '--color-accent-text': ['oklch(0.205 0 0)', 'oklch(0.985 0 0)'],
    '--color-surface': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],
    '--color-wash': ['oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
    '--color-overlay': ['oklch(0 0 0 / 50%)', 'oklch(0 0 0 / 80%)'],
    '--color-hover-overlay': ['oklch(0 0 0 / 5%)', 'oklch(1 0 0 / 5%)'],
    '--color-pressed-overlay': ['oklch(0 0 0 / 10%)', 'oklch(1 0 0 / 10%)'],
    '--color-focus-outline': ['oklch(0.708 0 0)', 'oklch(0.556 0 0)'],
    '--color-focus-outline-error': ['#E3193B', '#F5394F'],
    '--color-focus-outline-success': ['#0D8626', '#0D8626'],
    '--color-focus-outline-warning': ['#F2C00B', '#E9AF08'],
    '--color-deemphasized': ['oklch(0.97 0 0)', 'oklch(0.269 0 0)'],

    // Text
    '--color-text-primary': ['oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
    '--color-text-secondary': ['oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
    '--color-text-disabled': ['oklch(0.708 0 0)', 'oklch(0.439 0 0)'],
    '--color-text-link': ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
    '--color-text-placeholder': ['oklch(0.556 0 0)', 'oklch(0.556 0 0)'],
    '--color-text-on-media': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],

    // Icon
    '--color-icon-primary': ['oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
    '--color-icon-secondary': ['oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
    '--color-icon-tertiary': ['oklch(0.708 0 0)', 'oklch(0.556 0 0)'],
    '--color-icon-disabled': ['oklch(0.708 0 0)', 'oklch(0.439 0 0)'],
    '--color-icon-on-media': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],

    // Surface variants
    '--color-card': ['oklch(1 0 0)', 'oklch(0.205 0 0)'],
    '--color-popover': ['oklch(1 0 0)', 'oklch(0.269 0 0)'],

    // Status/Sentiment
    '--color-positive': ['oklch(0.6 0.15 145)', 'oklch(0.7 0.15 145)'],
    '--color-positive-deemphasized': [
      'oklch(0.6 0.15 145 / 20%)',
      'oklch(0.7 0.15 145 / 20%)',
    ],
    '--color-negative': [
      'oklch(0.577 0.245 27.325)',
      'oklch(0.704 0.191 22.216)',
    ],
    '--color-negative-deemphasized': [
      'oklch(0.577 0.245 27.325 / 20%)',
      'oklch(0.704 0.191 22.216 / 20%)',
    ],
    '--color-warning': [
      'oklch(0.828 0.189 84.429)',
      'oklch(0.769 0.188 70.08)',
    ],
    '--color-warning-deemphasized': [
      'oklch(0.828 0.189 84.429 / 20%)',
      'oklch(0.769 0.188 70.08 / 20%)',
    ],
    '--color-educational': [
      'oklch(0.488 0.243 264.376)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-educational-deemphasized': [
      'oklch(0.488 0.243 264.376 / 20%)',
      'oklch(0.627 0.265 303.9 / 20%)',
    ],

    // Divider
    '--color-divider': ['oklch(0.922 0 0)', 'oklch(1 0 0 / 10%)'],
    '--color-divider-high-contrast': ['oklch(0.708 0 0)', 'oklch(0.556 0 0)'],
    '--color-divider-emphasized': ['oklch(0.85 0 0)', 'oklch(0.371 0 0)'],

    // Effects
    '--color-glimmer': ['oklch(0.922 0 0)', 'oklch(0.371 0 0)'],
    '--color-glimmer-high-contrast': ['oklch(0.85 0 0)', 'oklch(0.439 0 0)'],
    '--color-shadow-elevation': ['oklch(0 0 0 / 10%)', 'oklch(0 0 0 / 30%)'],
    '--color-hover-tint': ['black', 'white'],

    // Blue
    '--color-blue-background': [
      'oklch(0.488 0.243 264.376 / 20%)',
      'oklch(0.488 0.243 264.376 / 20%)',
    ],
    '--color-blue-border': [
      'oklch(0.488 0.243 264.376)',
      'oklch(0.488 0.243 264.376)',
    ],
    '--color-blue-icon': [
      'oklch(0.488 0.243 264.376)',
      'oklch(0.488 0.243 264.376)',
    ],
    '--color-blue-text': ['oklch(0.398 0.2 264)', 'oklch(0.7 0.2 264)'],

    // Cyan
    '--color-cyan-background': [
      'oklch(0.6 0.118 184.704 / 20%)',
      'oklch(0.696 0.17 162.48 / 20%)',
    ],
    '--color-cyan-border': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-cyan-icon': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-cyan-text': ['oklch(0.398 0.07 184)', 'oklch(0.8 0.1 162)'],

    // Gray
    '--color-gray-background': [
      'oklch(0.922 0 0 / 50%)',
      'oklch(0.371 0 0 / 50%)',
    ],
    '--color-gray-border': ['oklch(0.708 0 0)', 'oklch(0.556 0 0)'],
    '--color-gray-icon': ['oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
    '--color-gray-text': ['oklch(0.145 0 0)', 'oklch(0.985 0 0)'],

    // Green
    '--color-green-background': [
      'oklch(0.6 0.118 184.704 / 20%)',
      'oklch(0.696 0.17 162.48 / 20%)',
    ],
    '--color-green-border': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-green-icon': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-green-text': ['oklch(0.398 0.07 184)', 'oklch(0.8 0.1 162)'],

    // Orange
    '--color-orange-background': [
      'oklch(0.646 0.222 41.116 / 20%)',
      'oklch(0.645 0.246 16.439 / 20%)',
    ],
    '--color-orange-border': [
      'oklch(0.646 0.222 41.116)',
      'oklch(0.645 0.246 16.439)',
    ],
    '--color-orange-icon': [
      'oklch(0.646 0.222 41.116)',
      'oklch(0.645 0.246 16.439)',
    ],
    '--color-orange-text': ['oklch(0.5 0.18 41)', 'oklch(0.8 0.2 16)'],

    // Pink
    '--color-pink-background': [
      'oklch(0.627 0.265 303.9 / 20%)',
      'oklch(0.627 0.265 303.9 / 20%)',
    ],
    '--color-pink-border': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-pink-icon': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-pink-text': ['oklch(0.5 0.2 303)', 'oklch(0.8 0.2 303)'],

    // Purple
    '--color-purple-background': [
      'oklch(0.627 0.265 303.9 / 20%)',
      'oklch(0.627 0.265 303.9 / 20%)',
    ],
    '--color-purple-border': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-purple-icon': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-purple-text': ['oklch(0.5 0.2 303)', 'oklch(0.8 0.2 303)'],

    // Red
    '--color-red-background': [
      'oklch(0.577 0.245 27.325 / 20%)',
      'oklch(0.704 0.191 22.216 / 20%)',
    ],
    '--color-red-border': [
      'oklch(0.577 0.245 27.325)',
      'oklch(0.704 0.191 22.216)',
    ],
    '--color-red-icon': [
      'oklch(0.577 0.245 27.325)',
      'oklch(0.704 0.191 22.216)',
    ],
    '--color-red-text': ['oklch(0.45 0.2 27)', 'oklch(0.85 0.15 22)'],

    // Teal
    '--color-teal-background': [
      'oklch(0.6 0.118 184.704 / 20%)',
      'oklch(0.696 0.17 162.48 / 20%)',
    ],
    '--color-teal-border': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-teal-icon': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-teal-text': ['oklch(0.398 0.07 184)', 'oklch(0.8 0.1 162)'],

    // Yellow
    '--color-yellow-background': [
      'oklch(0.828 0.189 84.429 / 20%)',
      'oklch(0.769 0.188 70.08 / 20%)',
    ],
    '--color-yellow-border': [
      'oklch(0.828 0.189 84.429)',
      'oklch(0.769 0.188 70.08)',
    ],
    '--color-yellow-icon': [
      'oklch(0.828 0.189 84.429)',
      'oklch(0.769 0.188 70.08)',
    ],
    '--color-yellow-text': ['oklch(0.6 0.15 84)', 'oklch(0.9 0.15 70)'],

    // =========================================================================
    // Radius — slightly larger than default
    // =========================================================================
    '--radius-0': '0.25rem',
    '--radius-1': '0.375rem',
    '--radius-2': '0.625rem',
    '--radius-3': '0.75rem',
    '--radius-rounded': '9999px',

    // =========================================================================
    // Elevation — oklch-based shadows
    // =========================================================================
    '--elevation-base':
      '0 1px 2px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 20%))',
    '--elevation-dialog':
      '0 4px 6px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 25%)), 0 12px 24px light-dark(oklch(0 0 0 / 15%), oklch(0 0 0 / 35%))',
    '--elevation-hover':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 15%)), 0 4px 12px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 20%))',
    '--elevation-menu':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 15%)), 0 4px 8px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 20%))',
    '--elevation-input-hover': 'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.3)',
    '--elevation-input-hover-success':
      'inset 0px 0px 0px 2px rgba(38, 167, 86, 0.3)',
    '--elevation-input-hover-warning':
      'inset 0px 0px 0px 2px rgba(226, 164, 0, 0.3)',
    '--elevation-input-hover-error':
      'inset 0px 0px 0px 2px rgba(227, 25, 59, 0.3)',

    // =========================================================================
    // Typography — Geist font family
    // =========================================================================
    '--font-body':
      'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    '--font-code': '"Geist Mono", "SF Mono", Monaco, Consolas, monospace',
    '--font-heading':
      'Geist, "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  components: {
    // =========================================================================
    // Button — primary gets white text, secondary gets a border
    // =========================================================================
    button: {
      'variant:primary': {
        color: 'light-dark(white, oklch(0.145 0 0))',
      },
      'variant:secondary': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-divider)',
      },
    },

    // =========================================================================
    // Card — tighter padding
    // =========================================================================
    card: {
      base: {
        '--layout-padding-inner-x': 'var(--spacing-3)',
        '--layout-padding-inner-y': 'var(--spacing-3)',
        '--layout-padding-outer-x': 'var(--spacing-3)',
        '--layout-padding-outer-y': 'var(--spacing-3)',
      },
    },

    // =========================================================================
    // Section — tighter padding
    // =========================================================================
    section: {
      base: {
        '--layout-padding-inner-x': 'var(--spacing-3)',
        '--layout-padding-inner-y': 'var(--spacing-3)',
        '--layout-padding-outer-x': 'var(--spacing-3)',
        '--layout-padding-outer-y': 'var(--spacing-3)',
      },
    },

    // Heading and text component overrides are auto-generated by typeScale.
    // h3/h4 bold weights come from typeScale.weights.heading above.
  },

  icons: neutralIconRegistry,
});
