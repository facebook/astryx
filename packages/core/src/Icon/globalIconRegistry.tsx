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
 * Icon registry mapping semantic names to React nodes.
 */
export type IconRegistry = Record<IconName, ReactNode>;

export type IconRegistrySource = DefinedTheme | string | null | undefined;

// =============================================================================
// Global Registry
// =============================================================================

let globalRegistry: Partial<IconRegistry> = {};

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
 */
export function registerIcons(icons: Partial<IconRegistry>): void {
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

  for (const name of Object.keys(globalRegistry) as IconName[]) {
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
 */
export function getIcon(
  name: IconName,
  source?: IconRegistrySource,
): ReactNode {
  const themeIcons = getThemeIconOverrides(source);
  return themeIcons?.[name] ?? globalRegistry[name] ?? defaultIcons[name];
}

/**
 * Reset the global registry. For testing only.
 * @internal
 */
export function resetIcons(): void {
  globalRegistry = {};
}
