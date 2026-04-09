/**
 * @file onMediaTokens.ts
 * @input Theme token values from defineTheme
 * @output Default on-dark / on-light token overrides for XDSMediaTheme
 * @position Theme system utility; consumed by defineTheme and generateThemeRules
 *
 * Generates semantic token overrides for content rendered on inverted surfaces.
 * "onDark" = content on a dark background (light text, white-tinted interactions)
 * "onLight" = content on a light background (dark text, black-tinted interactions)
 *
 * The primary mechanism is `color-scheme` — setting `color-scheme: dark` on the
 * media element makes all `light-dark()` tokens resolve to their dark-side values.
 * Only a small set of tokens need explicit overrides (text/icon primary use
 * `var(--color-on-dark)` instead of the dark-mode grey, accent collapses to
 * on-color, etc.).
 *
 * Themes can provide additional token and component overrides via the
 * `onDark`/`onLight` fields in `defineTheme()`.
 */

import type {XDSTokenValue, XDSComponentStyleMap} from './defineTheme';

/**
 * On-media theme overrides — same shape as the main theme but scoped
 * to a surface luminance context.
 */
export interface OnMediaOverrides {
  /** Token overrides for this surface context */
  tokens?: Partial<Record<string, XDSTokenValue>>;
  /** Component style overrides for this surface context */
  components?: XDSComponentStyleMap;
}

/**
 * Resolved on-media overrides stored on XDSDefinedTheme.
 * @internal
 */
export interface ResolvedOnMedia {
  /** Resolved token CSS values */
  tokens: Record<string, string>;
  /** Component style overrides (passthrough from input) */
  components?: XDSComponentStyleMap;
}

/**
 * Default token overrides for content on a dark surface.
 *
 * Most tokens work automatically via `color-scheme: dark` which flips
 * `light-dark()` values. These overrides handle the tokens that need
 * different values on an inverted surface vs a dark page background.
 */
export const defaultOnDarkTokens: Record<string, string> = {
  'color-scheme': 'dark',

  // Text/icon primary — pure on-color, not dark-mode grey
  '--color-text-primary': 'var(--color-on-dark)',
  '--color-icon-primary': 'var(--color-on-dark)',

  // Accent collapses to on-color in inverted context
  '--color-accent': 'var(--color-on-dark)',
};

/**
 * Default token overrides for content on a light surface.
 */
export const defaultOnLightTokens: Record<string, string> = {
  'color-scheme': 'light',

  // Text/icon primary — pure on-color, not light-mode dark
  '--color-text-primary': 'var(--color-on-light)',
  '--color-icon-primary': 'var(--color-on-light)',

  // Accent collapses to on-color
  '--color-accent': 'var(--color-on-light)',
};

/**
 * Resolve a token value to a CSS string.
 */
function resolveValue(value: XDSTokenValue): string {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

/**
 * Resolve on-media overrides: merge user tokens with defaults,
 * pass through component overrides.
 */
export function resolveOnMedia(
  surface: 'dark' | 'light',
  input?: OnMediaOverrides,
): ResolvedOnMedia {
  const defaults =
    surface === 'dark' ? defaultOnDarkTokens : defaultOnLightTokens;

  const tokens = {...defaults};

  if (input?.tokens) {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (value !== undefined) {
        tokens[key] = resolveValue(value);
      }
    }
  }

  return {
    tokens,
    components: input?.components,
  };
}
