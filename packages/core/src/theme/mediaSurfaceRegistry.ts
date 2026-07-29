// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Media-surface registry — declares which components render their
 * content on an inverted (media) surface by default, and the semantic
 * tokens that inversion re-points.
 *
 * @position Core theme infrastructure. Read by generateThemeRules to emit
 * per-component media-surface CSS, and mirrored by reset.css for the
 * theme-less default. The source of truth for *which* components invert and
 * *which* tokens they flip.
 *
 * ## Why a registry (and not a component prop / attribute)
 *
 * Components must stay surface-agnostic and RSC-safe: a Toast renders only
 * its stable `.astryx-toast` class, never a `data-astryx-media` attribute or
 * a `<MediaTheme>` wrapper. The surface decision lives entirely in generated
 * CSS keyed on that stable class, driven by:
 *   1. this internal default map (invert unless a theme says otherwise), and
 *   2. the public `surfaces` field on `defineTheme` (per-component opt-out).
 *
 * <!-- SYNC: packages/core/src/reset.css (Media Surface Baseline) -->
 */

/**
 * How a media-surface component's content should be themed.
 * - `inverted` — content renders on an inverted surface (the default):
 *   its `color-scheme` flips opposite to the ambient mode and the tokens
 *   below re-point to their on-surface values.
 * - `normal` — content uses the app's ordinary surface tokens: no flip,
 *   no token re-pointing. This is the consolidation opt-out.
 */
export type MediaSurface = 'inverted' | 'normal';

export interface MediaSurfaceEntry {
  /**
   * Semantic tokens re-pointed on an inverted surface. These are inherited
   * CSS custom properties, so the opt-out path resets them with `inherit`
   * to re-adopt the ambient value — no per-theme value knowledge needed.
   */
  invertedTokens: Record<string, string>;
  /**
   * Background applied to the component root when its content is inverted.
   * Resolves in the *ambient* color scheme (the flip is scoped to content,
   * not the root), so a `light-dark()` token yields a dark surface in a
   * light app and a light surface in a dark app.
   */
  invertedBackground: string;
  /**
   * Background applied to the component root when opted out to `normal`.
   */
  normalBackground: string;
  /**
   * When true, the component always renders its content on a dark surface
   * regardless of ambient mode (e.g. Toast error). Encoded via a variant
   * selector rather than ambient-keyed rules.
   */
  alwaysDarkVariant?: string;
}

/**
 * Default inverted-surface token set — mirrors defaultOnDarkTokens /
 * defaultOnLightTokens in onMediaTokens.ts. The concrete on-dark/on-light
 * value is chosen by the ambient-keyed rules that consume this list; here
 * we only enumerate *which* tokens participate so the opt-out path can
 * reset exactly the same keys.
 *
 * <!-- SYNC: packages/core/src/theme/onMediaTokens.ts -->
 */
export const INVERTED_SURFACE_TOKENS = [
  '--color-text-primary',
  '--color-icon-primary',
  '--color-accent',
] as const;

/**
 * Component → media-surface defaults.
 *
 * Keys are lowercase component names (matching defineTheme component keys
 * and the stable `.astryx-<name>` class).
 */
export const mediaSurfaceRegistry: Record<string, MediaSurfaceEntry> = {
  toast: {
    invertedTokens: {
      '--color-text-primary': 'var(--color-on-dark)',
      '--color-icon-primary': 'var(--color-on-dark)',
      '--color-accent': 'var(--color-on-dark)',
    },
    invertedBackground: 'var(--color-background-inverted)',
    normalBackground: 'var(--color-background-popover)',
    alwaysDarkVariant: 'error',
  },
  tooltip: {
    invertedTokens: {
      '--color-text-primary': 'var(--color-on-dark)',
      '--color-icon-primary': 'var(--color-on-dark)',
      '--color-accent': 'var(--color-on-dark)',
    },
    invertedBackground: 'var(--color-background-inverted)',
    normalBackground: 'var(--color-background-popover)',
  },
};

/** Component names that participate in media-surface theming. */
export function mediaSurfaceComponents(): string[] {
  return Object.keys(mediaSurfaceRegistry);
}

/** Look up the media-surface entry for a component, or undefined. */
export function getMediaSurface(
  component: string,
): MediaSurfaceEntry | undefined {
  return mediaSurfaceRegistry[component];
}
