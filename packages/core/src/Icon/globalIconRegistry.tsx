/**
 * @file globalIconRegistry.tsx
 * @input None (pure module-level state)
 * @output Exports registerIcons, getIcon, resetIcons, XDSIconName, XDSIconRegistry
 * @position Global icon registry; works in both server and client environments
 *
 * This module has NO 'use client' directive — it's importable from RSC.
 * Components that need icons in server components use getIcon() directly.
 * Client components use useXDSIcon() from IconRegistryContext.tsx which
 * checks context first, then falls back to this global registry.
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
  | 'search';

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
 * Use this in server components where hooks aren't available.
 * In client components, prefer useXDSIcon() which also checks
 * the React Context registry.
 */
export function getIcon(name: XDSIconName): ReactNode {
  return globalRegistry[name] ?? defaultIcons[name];
}

/**
 * Get the raw global registry (internal use by useXDSIcon).
 * @internal
 */
export function getGlobalRegistry(): Partial<XDSIconRegistry> {
  return globalRegistry;
}

/**
 * Reset the global registry. For testing only.
 * @internal
 */
export function resetIcons(): void {
  globalRegistry = {};
}
