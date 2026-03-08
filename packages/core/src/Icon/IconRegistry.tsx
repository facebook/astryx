/**
 * @file IconRegistry.tsx
 * @input Uses React createContext, useContext
 * @output Exports IconRegistryContext, useXDSIcon hook
 * @position Client-side icon context; wraps the global registry with
 *   React Context support for tree-scoped overrides via XDSTheme.
 *
 * For server components, use getIcon() from globalIconRegistry.tsx instead.
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
 * For server components, use getIcon() from iconRegistry.ts instead.
 *
 * @example
 * ```
 * const closeIcon = useXDSIcon('close');
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
