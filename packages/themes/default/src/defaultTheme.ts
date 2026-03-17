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
 * Typography sizing is driven by type scale tokens (--heading-{n}-size, --text-{type}-size).
 * The default type scale is base=14, ratio=1.2 with h4 anchored to base.
 * To customize, pass a `typeScale` config to defineTheme.
 *
 * Component overrides use CSS class selectors:
 *   .xds-button.secondary { ... }
 *   .xds-heading.level-1 { ... }
 */

import {defineTheme} from '@xds/core/theme';
import {defaultIconRegistry} from './icons';

export const defaultTheme = defineTheme({
  name: 'default',

  // Type scale: base=14px, ratio=1.2, h4 anchored to base.
  // Generates all --heading-*-{size|weight|leading} and --text-*-{size|weight|leading} tokens.
  typeScale: {base: 14, ratio: 1.2},

  // The default theme uses the built-in token defaults from tokens.stylex.ts.
  // No additional token overrides needed.
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
    // Heading — sized by type scale tokens
    // =========================================================================
    heading: {
      'level:1': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--heading-1-size)',
        fontWeight: 'var(--heading-1-weight)',
        lineHeight: 'var(--heading-1-leading)',
        color: 'var(--color-text-primary)',
      },
      'level:2': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--heading-2-size)',
        fontWeight: 'var(--heading-2-weight)',
        lineHeight: 'var(--heading-2-leading)',
        color: 'var(--color-text-primary)',
      },
      'level:3': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--heading-3-size)',
        fontWeight: 'var(--heading-3-weight)',
        lineHeight: 'var(--heading-3-leading)',
        color: 'var(--color-text-primary)',
      },
      'level:4': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--heading-4-size)',
        fontWeight: 'var(--heading-4-weight)',
        lineHeight: 'var(--heading-4-leading)',
        color: 'var(--color-text-primary)',
      },
      'level:5': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--heading-5-size)',
        fontWeight: 'var(--heading-5-weight)',
        lineHeight: 'var(--heading-5-leading)',
        color: 'var(--color-text-primary)',
      },
      'level:6': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--heading-6-size)',
        fontWeight: 'var(--heading-6-weight)',
        lineHeight: 'var(--heading-6-leading)',
        color: 'var(--color-text-primary)',
      },
    },

    // =========================================================================
    // Text — semantic text styles, sized by type scale tokens
    // =========================================================================
    text: {
      'type:body': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-body-size)',
        fontWeight: 'var(--text-body-weight)',
        lineHeight: 'var(--text-body-leading)',
        color: 'var(--color-text-primary)',
      },
      'type:large': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-large-size)',
        fontWeight: 'var(--text-large-weight)',
        lineHeight: 'var(--text-large-leading)',
        color: 'var(--color-text-primary)',
      },
      'type:label': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-label-size)',
        fontWeight: 'var(--text-label-weight)',
        lineHeight: 'var(--text-label-leading)',
        color: 'var(--color-text-primary)',
      },
      'type:supporting': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-supporting-size)',
        fontWeight: 'var(--text-supporting-weight)',
        lineHeight: 'var(--text-supporting-leading)',
        color: 'var(--color-text-secondary)',
      },
      'type:code': {
        fontFamily: 'var(--font-code)',
        fontSize: 'var(--text-code-size)',
        fontWeight: 'var(--text-code-weight)',
        lineHeight: 'var(--text-code-leading)',
        color: 'var(--color-text-primary)',
      },
    },
  },

  icons: defaultIconRegistry,
});
