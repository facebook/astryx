/**
 * Brutalist theme for XDS
 *
 * Zero radius, monospace everything, hot pink accent, heavy borders.
 * Demonstrates the full power of defineTheme: typography roles,
 * component-level style overrides, and variant targeting.
 */

import {defineTheme} from '@xds/core/theme';

export const brutalistTheme = defineTheme({
  name: 'brutalist',

  // Monospace everything — body sets Courier, heading inherits
  typography: {
    body: {family: 'Courier New', fallbacks: '"Courier", monospace'},
  },

  // Zero radius everywhere — multiplier 0 makes all scalable radii 0px
  radius: {base: 4, multiplier: 0},

  // Motion: near-instant — brutalism doesn't wait.
  // Produces: fast-min=50ms, fast=65ms, fast-max=85ms,
  //           medium-min=115ms, medium=150ms, medium-max=200ms.
  // Linear easing — no curves, no polish, just movement.
  motion: {fast: 65, medium: 150, slow: 350, ratio: 0.75, easing: 'linear'},

  tokens: {
    // Colors — high contrast, no subtlety
    '--color-accent': ['#FF1493', '#FF69B4'],
    '--color-accent-muted': ['#FF149333', '#FF69B43F'],
    '--color-background-surface': ['#FFFFFF', '#000000'],
    '--color-background-body': ['#F5F5F5', '#111111'],
    '--color-background-card': ['#FFFFFF', '#000000'],
    // Contrast on hot pink accent — white in both modes
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],
    '--color-on-success': ['#FFFFFF', '#FFFFFF'],
    '--color-on-error': ['#FFFFFF', '#FFFFFF'],
    '--color-on-warning': ['#000000', '#000000'],
    '--color-on-light': ['#000000', '#000000'],
    '--color-on-dark': ['#FFFFFF', '#FFFFFF'],

    // Even pills are sharp in brutalist
    '--radius-full': '0px',
  },
  components: {
    // Custom banner status — danger
    banner: {
      'status:danger': {
        backgroundColor: '#FF0000',
        color: '#FFFFFF',
        fontWeight: '900',
        textTransform: 'uppercase',
      },
    },
    // Cards get heavy borders
    card: {
      base: {
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: 'var(--color-text-primary)',
      },
    },
    // Buttons are loud — 9999px radius override tests layer ordering.
    // Everything else in brutalist is 0px radius, but buttons are
    // deliberately pill-shaped. If this override works without !important,
    // CSS layers are doing their job.
    // (same pattern that needed !important in Meta theme #692)
    button: {
      base: {
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: '800',
      },
      'variant:ghost': {
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'var(--color-text-primary)',
      },
    },
    // Badges are blocky
    badge: {
      base: {
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    // Dividers are thick
    divider: {
      base: {
        borderTopWidth: '3px',
        borderTopColor: 'var(--color-text-primary)',
      },
    },
    // Headings are aggressive
    heading: {
      base: {
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    // Code gets a background
    text: {
      'type:code': {
        backgroundColor: 'var(--color-background-body)',
        padding: '2px 4px',
      },
    },
  },
});
