/**
 * Brutalist theme for XDS
 *
 * Zero radius, monospace headings, hot pink accent, heavy borders.
 * Demonstrates the full power of defineTheme: token overrides,
 * component-level style overrides, and variant targeting.
 */

import {defineTheme} from '@xds/core/theme';

export const brutalistTheme = defineTheme({
  name: 'brutalist',
  tokens: {
    // Colors — high contrast, no subtlety
    '--color-accent': ['#FF1493', '#FF69B4'],
    '--color-accent-deemphasized': ['#FF149333', '#FF69B43F'],
    '--color-surface': ['#FFFFFF', '#000000'],
    '--color-wash': ['#F5F5F5', '#111111'],
    '--color-card': ['#FFFFFF', '#000000'],

    // Zero radius everywhere
    '--radius-container': '0px',
    '--radius-element': '0px',
    '--radius-content': '0px',
    '--radius-inner': '0px',
    '--radius-rounded': '0px',

    // Monospace headings
    '--font-heading': '"Courier New", "Courier", monospace',
  },
  components: {
    // Cards get heavy borders
    card: {
      base: {
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: 'var(--color-text-primary)',
      },
    },
    // Buttons are loud
    button: {
      base: {
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
    // Body text is monospace too
    text: {
      base: {
        fontFamily: '"Courier New", "Courier", monospace',
      },
      'type:code': {
        backgroundColor: 'var(--color-wash)',
        padding: '2px 4px',
      },
    },
  },
});
