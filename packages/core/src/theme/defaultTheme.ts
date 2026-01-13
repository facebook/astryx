/**
 * XDS Default Theme
 *
 * Pre-configured theme using the built-in light and dark mode values.
 * Uses the pre-compiled StyleX themes without any overrides.
 */

import { createTheme } from './createTheme';

/**
 * Default theme with built-in light/dark mode support
 *
 * This theme uses the standard XDS color palette.
 * For custom themes, use createTheme() with your own token overrides:
 *
 * ```ts
 * const myTheme = createTheme({
 *   name: 'my-brand',
 *   tokens: {
 *     color: {
 *       accent: ['#0066cc', '#66b3ff'],  // [light, dark]
 *     },
 *   },
 * });
 * ```
 */
export const defaultTheme = createTheme({
  name: 'default',
  // No token overrides - uses the pre-compiled StyleX themes
});
