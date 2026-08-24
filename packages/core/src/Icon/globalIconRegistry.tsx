// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalIconRegistry.tsx
 * @input None (pure module-level state)
 * @output Exports registerIcons, getIconRegistry, getIcon, resetIcons, IconName, IconRegistry
 * @position Global and theme-scoped icon registry; works in server and client environments
 *
 * This module has NO 'use client' directive — it's importable from RSC.
 * Components resolve semantic icons through getIcon() or the client useIcon() hook.
 */

import type {ReactNode} from 'react';
import {defaultIcons} from './defaultIcons';
import type {DefinedTheme} from '../theme/defineTheme';
import {getRegisteredTheme} from '../theme/themeRegistry';
import {warnOnce} from '../utils/devWarning';

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
 * Icon registry mapping semantic names to React nodes.
 */
export type IconRegistry = Record<IconName, ReactNode>;

export type IconRegistrySource = DefinedTheme | string | null | undefined;

// =============================================================================
// Global Registry
// =============================================================================

let globalRegistry: Record<string, ReactNode> = {};

function getThemeIconOverrides(
  source: IconRegistrySource,
): Partial<IconRegistry> | null {
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
): Readonly<IconRegistry> {
  const registry = {...defaultIcons};

  // Only surface built-in IconName keys here — extension keys registered by
  // libraries are resolved via getIcon/getExtendedIcon and intentionally kept
  // out of the typed IconRegistry snapshot.
  for (const name of Object.keys(defaultIcons) as IconName[]) {
    registry[name] = globalRegistry[name] ?? defaultIcons[name];
  }

  const themeIcons = getThemeIconOverrides(source);
  if (themeIcons != null) {
    for (const name of Object.keys(themeIcons) as IconName[]) {
      registry[name] = themeIcons[name] ?? registry[name];
    }
  }

  return registry;
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

/**
 * Reset the global registry. For testing only.
 * @internal
 */
export function resetIcons(): void {
  globalRegistry = {};
}
