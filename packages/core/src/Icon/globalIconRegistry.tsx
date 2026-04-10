/**
 * @file globalIconRegistry.tsx
 * @input None (pure module-level state)
 * @output Exports registerIcons, getIcon, resetIcons, XDSIconName, XDSIconRegistry
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
export type XDSIconName =
  | 'close'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'check'
  | 'checkCircle'
  | 'xCircle'
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
  | 'wrench';

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
 * ```ts
 * // app/layout.tsx (RSC-compatible)
 * import { registerIcons } from '@xds/core';
 * import { brandIcons } from './brand-icons';
 *
 * registerIcons(brandIcons);
 * ```
 */
export function registerIcons(icons: Partial<XDSIconRegistry>): void {
  globalRegistry = {...globalRegistry, ...icons};
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
