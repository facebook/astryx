// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalIconRegistry.tsx
 * @input None (pure module-level state)
 * @output Exports registerIcons, getIconRegistry, getIcon, resetIcons, XDSIconName, XDSIconRegistry
 * @position Global icon registry; works in both server and client environments
 *
 * This module has NO 'use client' directive — it's importable from RSC.
 * All components use getIcon() to resolve icons from this global registry.
 */

import type {ReactNode} from 'react';
import {defaultIcons} from './defaultIcons';

// =============================================================================
// Types
// =============================================================================

/**
 * Semantic icon names used internally by XDS components.
 *
 * These represent the functional purpose of each icon, not a specific
 * visual representation. Themes provide the actual icon components.
 */
// SYNC: packages/cli/docs/icons.doc.mjs — update USAGE_HINTS when adding names
export type XDSIconName =
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
export type XDSIconRegistry = Record<XDSIconName, ReactNode>;

// =============================================================================
// Global Registry
// =============================================================================

let globalRegistry: Partial<XDSIconRegistry> = {};

/**
 * Register icons at the module level. Works in both server and client
 * environments. Call once at app initialization (e.g. root layout).
 *
 * Icons registered here are available to all components — including
 * server-rendered ones that can't access React Context.
 *
 * @example
 * ```
 * import { registerIcons } from '@xds/core';
 * import { brandIcons } from './brand-icons';
 * registerIcons(brandIcons);
 * ```
 */
export function registerIcons(icons: Partial<XDSIconRegistry>): void {
  globalRegistry = {...globalRegistry, ...icons};
}

/**
 * Get a snapshot of the full icon registry, with registered icons overriding
 * built-in defaults.
 *
 * Works in both server and client environments. Useful for tooling that needs
 * to derive valid semantic icon-name options from the same registry XDSIcon
 * resolves against.
 */
export function getIconRegistry(): Readonly<XDSIconRegistry> {
  const registry = {...defaultIcons};

  for (const name of Object.keys(globalRegistry) as XDSIconName[]) {
    registry[name] = globalRegistry[name] ?? defaultIcons[name];
  }

  return registry;
}

/**
 * Get an icon by name from the global registry, falling back to defaults.
 *
 * Works in both server and client environments.
 * Falls back to built-in default icons when no override is registered.
 */
export function getIcon(name: XDSIconName): ReactNode {
  return globalRegistry[name] ?? defaultIcons[name];
}

/**
 * Reset the global registry. For testing only.
 * @internal
 */
export function resetIcons(): void {
  globalRegistry = {};
}
