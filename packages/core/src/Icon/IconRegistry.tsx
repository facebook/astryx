/**
 * @file IconRegistry.tsx
 * @input Uses React createContext, useContext
 * @output Exports IconRegistryContext, useXDSIcon hook (both deprecated)
 * @position Legacy client-side icon context. Kept for backward compatibility.
 *
 * @deprecated All icon resolution now uses getIcon() from globalIconRegistry.tsx.
 * Components should import { getIcon } from './globalIconRegistry' instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/globalIconRegistry.tsx (global registry, types)
 * - /packages/core/src/Icon/Icon.doc.mjs (features, usage)
 * - /packages/core/src/Icon/index.ts (exports)
 */

'use client';

import {createContext, useContext, type ReactNode} from 'react';
import {defaultIcons} from './defaultIcons';
import type {XDSIconName, XDSIconRegistry} from './globalIconRegistry';
import {getGlobalRegistry} from './globalIconRegistry';

// Re-export types so existing imports from this file still work
export type {XDSIconName, XDSIconRegistry} from './globalIconRegistry';

// =============================================================================
// Context
// =============================================================================

/**
 * Context for providing theme icons to components.
 * Accepts a full or partial registry. When null, components fall back
 * to the global registry, then to built-in lightweight SVGs.
 *
 * @deprecated Icons are now global via registerIcons(). Context is no longer needed.
 * Use registerIcons() from globalIconRegistry to set icons, and getIcon() to retrieve them.
 */
export const IconRegistryContext =
  createContext<Partial<XDSIconRegistry> | null>(null);

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to retrieve an icon by semantic name (client components only).
 *
 * Resolution order:
 * 1. Context registry (via XDSTheme's IconRegistryContext)
 * 2. Global registry (via registerIcons())
 * 3. Built-in lightweight SVG fallback
 *
 * @deprecated Use getIcon() from globalIconRegistry instead for RSC compatibility.
 * getIcon() works in both server and client environments without React Context.
 *
 * @example
 * ```
 * // Before (deprecated):
 * const closeIcon = useXDSIcon('close');
 *
 * // After (preferred):
 * import { getIcon } from '@xds/core';
 * const closeIcon = getIcon('close');
 * ```
 */
export function useXDSIcon(name: XDSIconName): ReactNode {
  const contextRegistry = useContext(IconRegistryContext);
  const globalRegistry = getGlobalRegistry();

  // Context wins (tree-scoped theme override)
  if (contextRegistry != null && contextRegistry[name] != null) {
    return contextRegistry[name];
  }

  // Global registry (module-level, works server-side too)
  if (globalRegistry[name] != null) {
    return globalRegistry[name];
  }

  // Built-in fallback
  return defaultIcons[name];
}
