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
 * These defaults are used when a theme doesn't provide explicit onDark/onLight
 * overrides. They use CSS custom property references (var()) so they
 * compose with whatever base tokens the theme defines.
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
 * Uses var(--color-on-dark) as the base text/icon color, with
 * white-tinted overlays for hover/pressed states.
 */
export const defaultOnDarkTokens: Record<string, string> = {
  // Text
  '--color-text-primary': 'var(--color-on-dark)',
  '--color-text-secondary':
    'color-mix(in srgb, var(--color-on-dark) 70%, transparent)',
  '--color-text-disabled':
    'color-mix(in srgb, var(--color-on-dark) 40%, transparent)',
  '--color-text-accent': 'var(--color-on-dark)',

  // Icon
  '--color-icon-primary': 'var(--color-on-dark)',
  '--color-icon-secondary':
    'color-mix(in srgb, var(--color-on-dark) 70%, transparent)',
  '--color-icon-disabled':
    'color-mix(in srgb, var(--color-on-dark) 40%, transparent)',

  // Accent — collapses to on-color in inverted context
  '--color-accent': 'var(--color-on-dark)',

  // Neutral — white-tinted for dark surfaces
  '--color-neutral': 'color-mix(in srgb, white 20%, transparent)',

  // Overlay / interaction
  '--color-overlay-hover': 'color-mix(in srgb, white 12%, transparent)',
  '--color-overlay-pressed': 'color-mix(in srgb, white 24%, transparent)',

  // Border
  '--color-border': 'color-mix(in srgb, white 15%, transparent)',
  '--color-border-emphasized': 'color-mix(in srgb, white 30%, transparent)',

  // Tint
  '--color-tint-hover': 'white',
};

/**
 * Default token overrides for content on a light surface.
 *
 * Uses var(--color-on-light) as the base text/icon color, with
 * black-tinted overlays for hover/pressed states.
 */
export const defaultOnLightTokens: Record<string, string> = {
  // Text
  '--color-text-primary': 'var(--color-on-light)',
  '--color-text-secondary':
    'color-mix(in srgb, var(--color-on-light) 70%, transparent)',
  '--color-text-disabled':
    'color-mix(in srgb, var(--color-on-light) 40%, transparent)',
  '--color-text-accent': 'var(--color-on-light)',

  // Icon
  '--color-icon-primary': 'var(--color-on-light)',
  '--color-icon-secondary':
    'color-mix(in srgb, var(--color-on-light) 70%, transparent)',
  '--color-icon-disabled':
    'color-mix(in srgb, var(--color-on-light) 40%, transparent)',

  // Accent
  '--color-accent': 'var(--color-on-light)',

  // Neutral — black-tinted for light surfaces
  '--color-neutral': 'color-mix(in srgb, black 10%, transparent)',

  // Overlay / interaction
  '--color-overlay-hover': 'color-mix(in srgb, black 8%, transparent)',
  '--color-overlay-pressed': 'color-mix(in srgb, black 16%, transparent)',

  // Border
  '--color-border': 'color-mix(in srgb, black 10%, transparent)',
  '--color-border-emphasized': 'color-mix(in srgb, black 20%, transparent)',

  // Tint
  '--color-tint-hover': 'black',
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
