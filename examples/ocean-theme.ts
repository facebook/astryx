/**
 * Ocean Theme — sample defineTheme file
 */
import {defineTheme} from '@xds/core/theme';

export const oceanTheme = defineTheme({
  name: 'ocean',
  tokens: {
    '--color-accent': ['#0077B6', '#48CAE4'],
    '--color-accent-deemphasized': ['#0077B633', '#48CAE43F'],
    '--color-surface': ['#F0F8FF', '#0A1628'],
    '--color-wash': ['#E6F3FF', '#0D1B2A'],
    '--color-card': ['#F0F8FF', '#112240'],
    '--radius-container': '16px',
    '--radius-element': '12px',
  },
  components: {
    card: {
      base: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-divider)',
      },
    },
    button: {
      base: {fontWeight: '600'},
      'variant:secondary': {
        backgroundColor:
          'light-dark(rgba(0, 119, 182, 0.1), rgba(72, 202, 228, 0.15))',
      },
    },
    heading: {
      base: {fontFamily: '"Inter", system-ui, sans-serif'},
    },
  },
});
