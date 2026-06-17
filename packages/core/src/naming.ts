// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file naming.ts
 * @input None (pure constants/helpers)
 * @output Centralized namespace-prefix constants and helpers for all
 *   externally-observable XDS name surfaces: CSS classes, data attributes,
 *   CSS custom properties, and CSS layer names.
 * @position Single source of truth consumed by the runtime (components,
 *   theme generation) AND by build/CLI tooling (build-theme.mjs, discovery)
 *   via the `@xds/core/naming` subpath export.
 *
 * ## Why this module exists
 *
 * The literal string `xds` is part of several externally-observable contracts
 * (`.xds-button` classes, `data-xds-theme` attributes, `--xds-card-padding`
 * custom properties, `@layer xds-base`). Historically each of these was
 * hardcoded independently across the runtime, the theme build pipeline, and
 * discovery tooling, kept in sync only by `<!-- SYNC: ... -->` comments.
 *
 * The XDS-prefix migration (see P2380608025) removes the `XDS` prefix from
 * React identifiers and rebrands the DOM/CSS namespace `xds` -> `astryx`.
 * Centralizing the prefix here means the dual-emit compatibility layer and the
 * eventual cutover flip in ONE place instead of hundreds of literals.
 *
 * ## Surfaces and their migration policy (locked in P0)
 *
 * - CSS classes (`xds-button` -> `astryx-button`): REBRAND. Dual-emit during
 *   compat via {@link classPrefix} / {@link stableClassName}.
 * - data attributes (`data-xds-*` -> `data-astryx-*`): REBRAND. Only 3 of 15
 *   are consumer-observable and dual-emitted; the rest rename outright.
 * - CSS custom properties (`--xds-card-padding` -> `--astryx-card-padding`):
 *   REBRAND with an inverted read fallback so legacy overrides win during compat.
 * - CSS layers (`xds-base` / `xds-theme`): UNCHANGED through the compat window
 *   (a CSS layer cannot be aliased); renamed only at final cutover.
 *
 * SYNC: packages/core/src/utils/xdsThemeProps.ts (consumes classPrefix)
 * SYNC: packages/core/src/utils/parseStyleKey.ts
 * SYNC: packages/cli/src/commands/build-theme.mjs (imports @xds/core/naming)
 */

/**
 * The current (legacy) DOM/CSS namespace prefix.
 *
 * This is the prefix that ships TODAY and that all existing consumer code
 * targets (`.xds-button`, `data-xds-theme`, `--xds-card-padding`). It remains
 * the emitted prefix until the new prefix is introduced behind the compat
 * layer, and remains a *compat* prefix (dual-emitted / fallback-read) until the
 * final cutover removes it.
 */
export const LEGACY_NAMESPACE = 'xds';

/**
 * The new DOM/CSS namespace prefix introduced by the un-prefix migration.
 *
 * During the compatibility window the library emits BOTH {@link NAMESPACE} and
 * {@link LEGACY_NAMESPACE} forms for consumer-observable surfaces (classes,
 * theme/media data attributes). At final cutover the legacy form is removed.
 */
export const NAMESPACE = 'astryx';

/**
 * Class-name prefix for stable component classes, WITHOUT the trailing dash.
 *
 * Use {@link stableClassName} to build a full class token rather than
 * concatenating this directly.
 */
export const classPrefix = NAMESPACE;

/** Legacy class-name prefix (compat). */
export const legacyClassPrefix = LEGACY_NAMESPACE;

/**
 * data-attribute namespace segment (the part between `data-` and the rest).
 * e.g. `dataAttrNamespace` = 'astryx' -> `data-astryx-theme`.
 */
export const dataAttrNamespace = NAMESPACE;

/** Legacy data-attribute namespace segment (compat). */
export const legacyDataAttrNamespace = LEGACY_NAMESPACE;

/**
 * CSS custom-property namespace segment.
 * e.g. `--astryx-card-padding`.
 */
export const cssVarNamespace = NAMESPACE;

/** Legacy CSS custom-property namespace segment (compat). */
export const legacyCssVarNamespace = LEGACY_NAMESPACE;

/**
 * Build a stable component class token, e.g. `stableClassName('button')`
 * -> `'astryx-button'`.
 */
export function stableClassName(component: string): string {
  return `${classPrefix}-${component}`;
}

/**
 * Build the legacy stable component class token (compat), e.g.
 * `legacyStableClassName('button')` -> `'xds-button'`.
 */
export function legacyStableClassName(component: string): string {
  return `${legacyClassPrefix}-${component}`;
}

/**
 * Build a `data-*` attribute name in the current namespace, e.g.
 * `dataAttr('theme')` -> `'data-astryx-theme'`.
 */
export function dataAttr(name: string): `data-${string}` {
  return `data-${dataAttrNamespace}-${name}`;
}

/**
 * Build a legacy `data-*` attribute name (compat), e.g.
 * `legacyDataAttr('theme')` -> `'data-xds-theme'`.
 */
export function legacyDataAttr(name: string): `data-${string}` {
  return `data-${legacyDataAttrNamespace}-${name}`;
}

/**
 * Build a CSS custom-property name in the current namespace, e.g.
 * `cssVar('card-padding')` -> `'--astryx-card-padding'`.
 */
export function cssVar(name: string): string {
  return `--${cssVarNamespace}-${name}`;
}

/**
 * Build a legacy CSS custom-property name (compat), e.g.
 * `legacyCssVar('card-padding')` -> `'--xds-card-padding'`.
 */
export function legacyCssVar(name: string): string {
  return `--${legacyCssVarNamespace}-${name}`;
}

// ---------------------------------------------------------------------------
// Runtime theme-layer name (configurable)
//
// `XDSTheme` injects component overrides into a CSS cascade layer at runtime.
// Per the P0 decision, CSS layer names stay `xds-*` through the entire compat
// window (a layer cannot be aliased or dual-emitted), and are only rebranded
// to `astryx-*` at the final cutover (P10).
//
// To let a consumer adopt the rebranded `astryx-theme` layer BEFORE the
// cutover, the layer name is configurable. It must agree with the build-side
// `layers.theme` option of `@xds/build`'s Vite plugin — otherwise the declared
// layer order and the runtime-injected layer disagree (split brain). Default
// is `xds-theme`, so existing consumers are unaffected.
// ---------------------------------------------------------------------------

/** The default (legacy) runtime theme-override layer name. */
export const DEFAULT_THEME_LAYER = `${LEGACY_NAMESPACE}-theme`;

/** The rebranded runtime theme-override layer name (final cutover target). */
export const ASTRYX_THEME_LAYER = `${NAMESPACE}-theme`;

let themeLayerName = DEFAULT_THEME_LAYER;

/**
 * Get the CSS cascade-layer name that `XDSTheme` injects component overrides
 * into. Defaults to `xds-theme`.
 */
export function getThemeLayerName(): string {
  return themeLayerName;
}

/**
 * Set the CSS cascade-layer name that `XDSTheme` injects component overrides
 * into. Call once at app initialization, BEFORE any `XDSTheme` renders, and
 * keep it in sync with `@xds/build`'s `layers.theme` option.
 *
 * @example
 * ```ts
 * import {setThemeLayerName, ASTRYX_THEME_LAYER} from '@xds/core/naming';
 * setThemeLayerName(ASTRYX_THEME_LAYER); // opt into `astryx-theme`
 * ```
 */
export function setThemeLayerName(name: string): void {
  themeLayerName = name;
}
