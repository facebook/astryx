// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalIconRegistry.tsx
 * @input Theme sources (DefinedTheme or registered theme name); component icon
 *   slot types from the public ./index module
 * @output Exports registerIcons, getIconRegistry, getIcon, getExtendedIcon,
 *   getComponentIconName, getComponentIcon, resetIcons, IconName, IconRegistry
 * @position Global and theme-scoped icon registry; works in server and client environments
 *
 * This module has NO 'use client' directive — it's importable from RSC.
 * Components resolve semantic icons through getIcon() or the client useIcon()
 * hook, and component icon slots through getComponentIcon() or the client
 * useComponentIcon() hook.
 *
 * SYNC: Component icon slot resolution is mirrored by useComponentIcon in
 * /packages/core/src/Icon/useIcon.ts.
 */

import type {ReactNode} from 'react';
import {defaultIcons} from './defaultIcons';
import type {DefinedTheme} from '../theme/defineTheme';
import {getRegisteredTheme} from '../theme/themeRegistry';
import {warnOnce} from '../utils/devWarning';
import type {ComponentIconSlotName} from './index';

// =============================================================================
// Types
// =============================================================================

/**
 * Semantic icon names used internally by Astryx components.
 *
 * These represent the functional purpose of each icon, not a specific
 * visual representation. Themes provide the actual icon components.
 */
// SYNC: packages/cli/assets/docs/icons.doc.mjs — update USAGE_HINTS when adding names
export type IconName =
  | 'close'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronsLeft'
  | 'chevronsRight'
  | 'check'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'calendar'
  | 'clock'
  | 'externalLink'
  | 'menu'
  | 'moreHorizontal'
  | 'search'
  | 'upload'
  | 'arrowUp'
  | 'arrowDown'
  | 'arrowsUpDown'
  | 'funnel'
  | 'eyeSlash'
  | 'viewColumns'
  | 'copy'
  | 'checkDouble'
  | 'wrench'
  | 'stop'
  | 'microphone';

/**
 * A namespaced extension key, `'<namespace>:<name>'`.
 *
 * This is the tier for a glyph that belongs to one component or library rather
 * than to the system: `'richtext:bold'`, `'numberInput:stepperDown'`. A theme
 * overrides it by key through `registerIcons` or `defineTheme({icons})`,
 * exactly as it overrides a built-in name, and the core {@link IconName} union
 * stays reserved for glyphs the whole system shares.
 *
 * Accepted anywhere a built-in name is, including `<Icon icon>` — which is
 * what lets a namespaced glyph keep `size`, `color` and `xstyle`.
 */
export type NamespacedIconName = `${string}:${string}`;

/**
 * A semantic icon name — either one of the built-in {@link IconName}s or an
 * arbitrary string key contributed by a library/app.
 *
 * The `(string & {})` intersection keeps the built-in names available for
 * autocomplete while still allowing any string, so downstream libraries can
 * register and resolve their own keys (e.g. `'richtext:bold'`) without having
 * to widen the core `IconName` union.
 */
export type ExtendedIconName = IconName | (string & {});

/**
 * A complete icon registry: every semantic name mapped to a React node.
 *
 * `upload` is the one name a complete registry may still omit. Requiring it
 * would break registries written before it existed, so it becomes required in
 * the next scheduled minor (`spec:AST-032` FR6). An omitted `upload` resolves
 * the default artwork, so resolved registry snapshots are always complete.
 */
export type IconRegistry = Record<Exclude<IconName, 'upload'>, ReactNode> &
  Partial<Record<'upload', ReactNode>>;

export type IconRegistrySource = DefinedTheme | string | null | undefined;

// =============================================================================
// Global Registry
// =============================================================================

let globalRegistry: Record<string, ReactNode> = {};

/**
 * A key is namespaced when it carries a `<namespace>:` prefix — the runtime
 * form of {@link NamespacedIconName}, which is how the typed
 * {@link getIconRegistry} snapshot tells a built-in name from a component- or
 * library-owned one.
 */
function isNamespacedKey(name: string): boolean {
  return name.includes(':');
}

function getThemeIconOverrides(
  source: IconRegistrySource,
): Partial<Record<IconName | NamespacedIconName, ReactNode>> | null {
  if (source == null) {
    return null;
  }

  if (typeof source === 'string') {
    return getRegisteredTheme(source)?.icons ?? null;
  }

  return source.icons ?? null;
}

/**
 * Register icons at the module level. Works in both server and client
 * environments. Call once at app initialization (e.g. root layout).
 *
 * Icons registered here are available to all components — including
 * server-rendered ones that can't access React Context.
 *
 * @example
 * ```
 * import { registerIcons } from '@astryxdesign/core';
 * import { brandIcons } from './brand-icons';
 * registerIcons(brandIcons);
 * ```
 *
 * Libraries may also register their own extension keys (any string), so a
 * theme can override them the same way it overrides built-in icons. A library
 * that ships its own icons registers them by key, then resolves with
 * `getIcon('richtext:bold')`.
 * @example
 * ```
 * registerIcons({ 'richtext:bold': <MyBoldIcon /> });
 * ```
 */
export function registerIcons(
  icons: Partial<Record<ExtendedIconName, ReactNode>>,
): void {
  warnOnce(
    'icon-registry:global-register-icons',
    'Icon',
    '`registerIcons()` applies icon overrides globally. Prefer `defineTheme({ icons })` for theme-scoped icon overrides.',
  );
  globalRegistry = {...globalRegistry, ...icons};
}

/**
 * Get a snapshot of the full icon registry, with registered icons overriding
 * built-in defaults.
 *
 * Works in both server and client environments. Useful for tooling that needs
 * to derive valid semantic icon-name options from the same registry Icon
 * resolves against.
 */
export function getIconRegistry(
  source?: IconRegistrySource,
): Readonly<Record<IconName, ReactNode>> {
  const registry: Record<string, ReactNode> = {};

  // Only surface built-in IconName keys here — namespaced keys, whether
  // contributed by a library or shipped as a component's own default, are
  // resolved via getIcon/getExtendedIcon and intentionally kept out of the
  // typed IconRegistry snapshot.
  for (const name of Object.keys(defaultIcons) as IconName[]) {
    if (isNamespacedKey(name)) {
      continue;
    }
    registry[name] = globalRegistry[name] ?? defaultIcons[name];
  }

  const themeIcons = getThemeIconOverrides(source);
  if (themeIcons != null) {
    for (const name of Object.keys(themeIcons) as IconName[]) {
      if (isNamespacedKey(name)) {
        continue;
      }
      registry[name] = themeIcons[name] ?? registry[name];
    }
  }

  return registry as Record<IconName, ReactNode>;
}

/**
 * Get an icon by name from the global registry, falling back to defaults.
 *
 * Works in both server and client environments.
 * Falls back to built-in default icons when no override is registered.
 *
 * Accepts extension keys (any string) in addition to the built-in
 * {@link IconName}s — useful for library-contributed icons. For a
 * caller-supplied fallback when a key isn't registered, use
 * {@link getExtendedIcon}.
 */
export function getIcon(
  name: ExtendedIconName,
  source?: IconRegistrySource,
): ReactNode {
  const themeIcons = getThemeIconOverrides(source);
  return (
    themeIcons?.[name as IconName] ??
    globalRegistry[name] ??
    defaultIcons[name as IconName]
  );
}

/**
 * Resolve an extension icon by an arbitrary string key, falling back to a
 * caller-supplied default when nothing is registered.
 *
 * This is the seam libraries use to make their own icons themeable: ship the
 * inline SVG as `fallback`, resolve through this function, and a theme can
 * override the key via {@link registerIcons} without the library having to
 * widen the core {@link IconName} union.
 *
 * The `fallback` is the library default, overridable by a theme registering the
 * same key (for example `'richtext:bold'`).
 * @example
 * ```
 * getExtendedIcon('richtext:bold', <BoldGlyph />)
 * ```
 */
export function getExtendedIcon(
  name: ExtendedIconName,
  fallback?: ReactNode,
  source?: IconRegistrySource,
): ReactNode {
  const themeIcons = getThemeIconOverrides(source);
  return (
    themeIcons?.[name as IconName] ??
    globalRegistry[name] ??
    defaultIcons[name as IconName] ??
    fallback
  );
}

// =============================================================================
// Component icon slots
// =============================================================================

function getThemeComponentIcons(
  source: IconRegistrySource,
): Readonly<Partial<Record<string, IconName | null>>> | null {
  if (source == null) {
    return null;
  }

  if (typeof source === 'string') {
    return getRegisteredTheme(source)?.componentIcons ?? null;
  }

  return source.componentIcons ?? null;
}

/**
 * Resolve a component icon slot to the shared icon name it renders.
 *
 * The theme's `componentIcons[slot]` entry wins: a mapped {@link IconName} is
 * returned as-is and `null` means the slot renders no icon. A slot the theme
 * does not map — including one mapped to `undefined` — returns the
 * component's `fallback`. `source` selects the theme exactly as it does for
 * {@link getIcon}; without one, the fallback is returned.
 *
 * A consumer-provided instance icon, when the component exposes one, wins
 * before this is called; the component owns that check.
 * @example
 * ```
 * getComponentIconName('brand-card-status', 'info', theme); // 'info' unless mapped
 * ```
 */
export function getComponentIconName(
  slot: ComponentIconSlotName,
  fallback: IconName | null,
  source?: IconRegistrySource,
): IconName | null {
  const componentIcons = getThemeComponentIcons(source);
  if (
    componentIcons == null ||
    !Object.prototype.hasOwnProperty.call(componentIcons, slot)
  ) {
    return fallback;
  }

  const mapped = componentIcons[slot];
  return mapped === undefined ? fallback : mapped;
}

/**
 * Resolve a component icon slot to artwork.
 *
 * Chooses the shared name with {@link getComponentIconName}, then draws it
 * through {@link getIcon} against the same `source`, so the theme's `icons`
 * entry, `registerIcons()`, and the built-in defaults apply in their usual
 * order. Returns `null` when the slot resolves to `null`.
 */
export function getComponentIcon(
  slot: ComponentIconSlotName,
  fallback: IconName | null,
  source?: IconRegistrySource,
): ReactNode {
  const name = getComponentIconName(slot, fallback, source);
  return name === null ? null : getIcon(name, source);
}

/**
 * Reset the global registry. For testing only.
 * @internal
 */
export function resetIcons(): void {
  globalRegistry = {};
}
