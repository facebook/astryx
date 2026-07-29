// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Media-surface registry — declares which components render their
 * content on an inverted (media) surface by default.
 *
 * @position Core theme infrastructure. Read by generateThemeRules to emit
 * per-theme, per-component media-surface CSS. The source of truth for *which*
 * components invert and how they opt out.
 *
 * ## Why a registry (and not a component prop / attribute)
 *
 * Components must stay surface-agnostic and RSC-safe: a Toast renders only its
 * stable `.astryx-toast` class, never a `data-astryx-media` attribute or a
 * `<MediaTheme>` wrapper. The surface decision lives entirely in generated CSS
 * keyed on that stable class, driven by:
 *   1. this internal default map (invert unless a theme says otherwise), and
 *   2. the public `surfaces` field on `defineTheme` (per-component opt-out).
 *
 * The inverted token values themselves are NOT stored here — they come from
 * the theme's resolved `onDark` / `onLight` sets (onMediaTokens.ts), so a
 * theme that customizes its media tokens gets a 1:1 reflection on its
 * toast/tooltip.
 */

/**
 * How a media-surface component's content should be themed.
 * - `inverted` — content renders on an inverted surface (the default): its
 *   `color-scheme` flips opposite to the ambient mode and the theme's on-dark
 *   / on-light tokens apply.
 * - `normal` — content uses the app's ordinary surface tokens: no flip, no
 *   token re-pointing. This is the consolidation opt-out.
 */
export type MediaSurface = 'inverted' | 'normal';

export interface MediaSurfaceEntry {
  /**
   * Stable class on the component's content wrapper — the element whose
   * color-scheme is flipped for the inverted surface. This is deliberately
   * NOT the component root: the root keeps the ambient scheme so its own
   * `light-dark()` background resolves to an inverted panel, while the
   * content inside flips. Components emit this class on that wrapper.
   *
   * <!-- SYNC: the component that renders `.<contentClass>` (e.g. Toast.tsx,
   * useTooltip.tsx) -->
   */
  contentClass: string;
  /**
   * Background applied to the component root when opted out to `normal`,
   * overriding the component's base inverted background.
   */
  normalBackground: string;
  /**
   * When set, the named variant always renders its content on a dark surface
   * regardless of ambient mode or opt-out (e.g. Toast `error`). Encoded via a
   * `data-type` selector on the root.
   */
  alwaysDarkVariant?: string;
}

/**
 * Component → media-surface defaults.
 *
 * Keys are lowercase component names (matching defineTheme component keys and
 * the stable `.astryx-<name>` class).
 */
export const mediaSurfaceRegistry: Record<string, MediaSurfaceEntry> = {
  toast: {
    contentClass: 'astryx-toast-content',
    normalBackground: 'var(--color-background-popover)',
    alwaysDarkVariant: 'error',
  },
  tooltip: {
    contentClass: 'astryx-tooltip-content',
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
