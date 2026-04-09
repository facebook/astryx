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

  // Typography: same scale as default (base=14, ratio=1.2).
  // Geist fonts for body/heading, Geist Mono for code.
  // Neutral uses bold weights on h3/h4 for stronger subsection hierarchy.
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Geist',
      fallbacks:
        '"Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'Geist Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },

  // Motion: snappier than default to match shadcn/Tailwind conventions.
  // Produces: fast-min=95ms, fast=125ms, fast-max=165ms,
  //           medium-min=225ms, medium=300ms, medium-max=400ms.
  motion: {fast: 125, medium: 300, ratio: 0.75},

  tokens: {
    // =========================================================================
    // Colors — neutral grayscale palette using oklch
    // =========================================================================

    // Core semantic
    '--color-accent': ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
    '--color-accent-muted': ['oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
    '--color-neutral': ['oklch(0 0 0 / 6%)', 'oklch(1 0 0 / 10%)'],
    '--color-background-surface': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],
    '--color-background-body': ['oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
    '--color-overlay': ['oklch(0 0 0 / 50%)', 'oklch(0 0 0 / 80%)'],
    '--color-overlay-hover': ['oklch(0 0 0 / 5%)', 'oklch(1 0 0 / 5%)'],
    '--color-overlay-pressed': ['oklch(0 0 0 / 10%)', 'oklch(1 0 0 / 10%)'],
    '--color-background-muted': ['oklch(0.97 0 0)', 'oklch(0.269 0 0)'],

    // Text
    '--color-text-primary': ['oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
    '--color-text-secondary': ['oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
    '--color-text-disabled': ['oklch(0.708 0 0)', 'oklch(0.439 0 0)'],
    '--color-text-accent': ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
    '--color-on-dark': 'oklch(1 0 0)',
    '--color-on-light': 'oklch(0.145 0 0)',
    // Contrast: neutral accent is near-black (L) / near-white (D)
    '--color-on-accent': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],
    '--color-on-success': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],
    '--color-on-error': ['oklch(1 0 0)', 'oklch(0.145 0 0)'],
    '--color-on-warning': ['oklch(0.145 0 0)', 'oklch(0.145 0 0)'],

    // Icon
    '--color-icon-accent': ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
    '--color-icon-primary': ['oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
    '--color-icon-secondary': ['oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
    '--color-icon-disabled': ['oklch(0.708 0 0)', 'oklch(0.439 0 0)'],

    // Surface variants
    '--color-background-card': ['oklch(1 0 0)', 'oklch(0.205 0 0)'],
    '--color-background-popover': ['oklch(1 0 0)', 'oklch(0.269 0 0)'],

    // Status/Sentiment
    '--color-success': ['oklch(0.6 0.15 145)', 'oklch(0.7 0.15 145)'],
    '--color-success-muted': [
      'oklch(0.6 0.15 145 / 20%)',
      'oklch(0.7 0.15 145 / 20%)',
    ],
    '--color-error': ['oklch(0.577 0.245 27.325)', 'oklch(0.704 0.191 22.216)'],
    '--color-error-muted': [
      'oklch(0.577 0.245 27.325 / 20%)',
      'oklch(0.704 0.191 22.216 / 20%)',
    ],
    '--color-warning': [
      'oklch(0.828 0.189 84.429)',
      'oklch(0.769 0.188 70.08)',
    ],
    '--color-warning-muted': [
      'oklch(0.828 0.189 84.429 / 20%)',
      'oklch(0.769 0.188 70.08 / 20%)',
    ],

    // Border
    '--color-border': ['oklch(0.922 0 0)', 'oklch(1 0 0 / 10%)'],
    '--color-border-emphasized': ['oklch(0.85 0 0)', 'oklch(0.371 0 0)'],

    // Effects
    '--color-skeleton': ['oklch(0.922 0 0)', 'oklch(0.371 0 0)'],
    '--color-shadow': ['oklch(0 0 0 / 10%)', 'oklch(0 0 0 / 30%)'],
    '--color-tint-hover': ['black', 'white'],

    // Blue
    '--color-background-blue': [
      'oklch(0.488 0.243 264.376 / 20%)',
      'oklch(0.488 0.243 264.376 / 20%)',
    ],
    '--color-border-blue': [
      'oklch(0.488 0.243 264.376)',
      'oklch(0.488 0.243 264.376)',
    ],
    '--color-icon-blue': [
      'oklch(0.488 0.243 264.376)',
      'oklch(0.488 0.243 264.376)',
    ],
    '--color-text-blue': ['oklch(0.398 0.2 264)', 'oklch(0.7 0.2 264)'],

    // Cyan
    '--color-background-cyan': [
      'oklch(0.6 0.118 184.704 / 20%)',
      'oklch(0.696 0.17 162.48 / 20%)',
    ],
    '--color-border-cyan': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-icon-cyan': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-text-cyan': ['oklch(0.398 0.07 184)', 'oklch(0.8 0.1 162)'],

    // Gray
    '--color-background-gray': [
      'oklch(0.922 0 0 / 50%)',
      'oklch(0.371 0 0 / 50%)',
    ],
    '--color-border-gray': ['oklch(0.708 0 0)', 'oklch(0.556 0 0)'],
    '--color-icon-gray': ['oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
    '--color-text-gray': ['oklch(0.145 0 0)', 'oklch(0.985 0 0)'],

    // Green
    '--color-background-green': [
      'oklch(0.6 0.118 184.704 / 20%)',
      'oklch(0.696 0.17 162.48 / 20%)',
    ],
    '--color-border-green': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-icon-green': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-text-green': ['oklch(0.398 0.07 184)', 'oklch(0.8 0.1 162)'],

    // Orange
    '--color-background-orange': [
      'oklch(0.646 0.222 41.116 / 20%)',
      'oklch(0.645 0.246 16.439 / 20%)',
    ],
    '--color-border-orange': [
      'oklch(0.646 0.222 41.116)',
      'oklch(0.645 0.246 16.439)',
    ],
    '--color-icon-orange': [
      'oklch(0.646 0.222 41.116)',
      'oklch(0.645 0.246 16.439)',
    ],
    '--color-text-orange': ['oklch(0.5 0.18 41)', 'oklch(0.8 0.2 16)'],

    // Pink
    '--color-background-pink': [
      'oklch(0.627 0.265 303.9 / 20%)',
      'oklch(0.627 0.265 303.9 / 20%)',
    ],
    '--color-border-pink': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-icon-pink': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-text-pink': ['oklch(0.5 0.2 303)', 'oklch(0.8 0.2 303)'],

    // Purple
    '--color-background-purple': [
      'oklch(0.627 0.265 303.9 / 20%)',
      'oklch(0.627 0.265 303.9 / 20%)',
    ],
    '--color-border-purple': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-icon-purple': [
      'oklch(0.627 0.265 303.9)',
      'oklch(0.627 0.265 303.9)',
    ],
    '--color-text-purple': ['oklch(0.5 0.2 303)', 'oklch(0.8 0.2 303)'],

    // Red
    '--color-background-red': [
      'oklch(0.577 0.245 27.325 / 20%)',
      'oklch(0.704 0.191 22.216 / 20%)',
    ],
    '--color-border-red': [
      'oklch(0.577 0.245 27.325)',
      'oklch(0.704 0.191 22.216)',
    ],
    '--color-icon-red': [
      'oklch(0.577 0.245 27.325)',
      'oklch(0.704 0.191 22.216)',
    ],
    '--color-text-red': ['oklch(0.45 0.2 27)', 'oklch(0.85 0.15 22)'],

    // Teal
    '--color-background-teal': [
      'oklch(0.6 0.118 184.704 / 20%)',
      'oklch(0.696 0.17 162.48 / 20%)',
    ],
    '--color-border-teal': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-icon-teal': [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.696 0.17 162.48)',
    ],
    '--color-text-teal': ['oklch(0.398 0.07 184)', 'oklch(0.8 0.1 162)'],

    // Yellow
    '--color-background-yellow': [
      'oklch(0.828 0.189 84.429 / 20%)',
      'oklch(0.769 0.188 70.08 / 20%)',
    ],
    '--color-border-yellow': [
      'oklch(0.828 0.189 84.429)',
      'oklch(0.769 0.188 70.08)',
    ],
    '--color-icon-yellow': [
      'oklch(0.828 0.189 84.429)',
      'oklch(0.769 0.188 70.08)',
    ],
    '--color-text-yellow': ['oklch(0.6 0.15 84)', 'oklch(0.9 0.15 70)'],

    // =========================================================================
    // Radius — slightly larger than default
    // =========================================================================
    '--radius-none': '0.25rem',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.625rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.75rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows — oklch-based
    // =========================================================================
    '--shadow-low':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 15%)), 0 4px 8px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 20%))',
    '--shadow-med':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 15%)), 0 4px 12px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 20%))',
    '--shadow-high':
      '0 4px 6px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 25%)), 0 12px 24px light-dark(oklch(0 0 0 / 15%), oklch(0 0 0 / 35%))',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.3)',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px rgba(1, 113, 227, 0.5)',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px rgba(38, 167, 86, 0.3)',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px rgba(226, 164, 0, 0.3)',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px rgba(227, 25, 59, 0.3)',
  },

  components: {
    // =========================================================================
    // Button — primary gets white text, secondary gets a border
    // =========================================================================
    button: {
      'variant:secondary': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      },
    },

    // =========================================================================
    // Card — tighter padding via public card padding token
    // =========================================================================
    card: {
      base: {
        '--xds-card-padding': 'var(--spacing-3)',
      },
    },

    // =========================================================================
    // Section — tighter padding via public section padding token
    // =========================================================================
    section: {
      base: {
        '--xds-section-padding': 'var(--spacing-3)',
      },
    },

    // Heading and text component overrides are auto-generated by typography.scale.
    // h3/h4 bold weights come from typography.heading.weights above.
  },

  icons: neutralIconRegistry,
});
