/**
 * XDS Default Theme
 *
 * The reference theme — provides the standard XDS visual language.
 * Uses defineTheme for CSS-based theming (no StyleX build required for consumers).
 *
 * Token values use [light, dark] tuples for automatic light-dark() conversion.
 * Only tokens that differ from the built-in defaults need to be specified,
 * but the default theme is explicit as a reference.
 *
 * Component overrides use CSS class selectors:
 *   .xds-button.secondary { ... }
 *   .xds-heading.level-1 { ... }
 */

import {defineTheme} from '@xds/core/theme';
import {defaultIconRegistry} from './icons';

export const defaultTheme = defineTheme({
  name: 'default',

  // The default theme uses the built-in token defaults from tokens.stylex.ts.
  // No token overrides needed — defineTheme fills in defaults automatically.
  // See packages/core/src/theme/tokens.stylex.ts for all token values.
  tokens: {},

  components: {
    // =========================================================================
    // Button
    // =========================================================================
    button: {
      'variant:secondary': {
        backgroundColor:
          'light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))',
      },
    },

    // =========================================================================
    // Heading — default variant (dense scale for internal tools)
    // =========================================================================
    heading: {
      'level:1': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.2',
        color: 'var(--color-text-primary)',
      },
      'level:2': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.333',
        color: 'var(--color-text-primary)',
      },
      'level:3': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.25',
        color: 'var(--color-text-primary)',
      },
      'level:4': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      },
      'level:5': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      },
      'level:6': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xsm)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.333',
        color: 'var(--color-text-primary)',
      },
      // Editorial variant — larger scale for content-heavy pages
      'variant:editorial+level:1': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-4xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.5',
        color: 'var(--color-text-primary)',
      },
      'variant:editorial+level:2': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.333',
        color: 'var(--color-text-primary)',
      },
      'variant:editorial+level:3': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.4',
        color: 'var(--color-text-primary)',
      },
      'variant:editorial+level:4': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.5',
        color: 'var(--color-text-primary)',
      },
      'variant:editorial+level:5': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      },
      'variant:editorial+level:6': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xsm)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.333',
        color: 'var(--color-text-primary)',
      },
    },

    // =========================================================================
    // Text — semantic text styles
    // =========================================================================
    text: {
      'type:body': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      },
      'type:large': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.5',
        color: 'var(--color-text-primary)',
      },
      'type:label': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      },
      'type:supporting': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xsm)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: '1.333',
        color: 'var(--color-text-secondary)',
      },
      'type:code': {
        fontFamily: 'var(--font-code)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      },
    },
  },

  icons: defaultIconRegistry,
});
