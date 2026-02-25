/**
 * @file IconRegistry.tsx
 * @input Uses React createContext, useContext, ReactNode
 * @output Exports IconRegistryContext, useXDSIcon hook, XDSIconName, XDSIconRegistry types
 * @position Core icon infrastructure; consumed by components that need internal icons
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/README.md (features, usage)
 * - /packages/core/src/Icon/index.ts (exports)
 * - /packages/core/src/Icon/defaultIcons.tsx (fallback icon set)
 */

'use client';

import {createContext, useContext, type ReactNode} from 'react';
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
  | 'menu';

/**
 * Icon registry mapping semantic names to React nodes.
 *
 * Themes provide this to override the built-in fallback icons.
 * Values can be any ReactNode: SVG components, font icon spans,
 * unicode characters, or any other renderable content.
 */
export type XDSIconRegistry = Record<XDSIconName, ReactNode>;

// =============================================================================
// Context
// =============================================================================

/**
 * Context for providing theme icons to components.
 * Accepts a full or partial registry. When null, components fall back
 * to built-in lightweight SVGs. Partial registries fall back per-icon.
 */
export const IconRegistryContext =
  createContext<Partial<XDSIconRegistry> | null>(null);

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to retrieve an icon by semantic name.
 *
 * Resolution order:
 * 1. Theme icon registry (via IconRegistryContext) — if the name exists
 * 2. Built-in lightweight SVG fallback
 *
 * @example
 * ```
 * const closeIcon = useXDSIcon('close');
 * // Returns the theme's close icon, or the built-in SVG fallback
 * ```
 */
export function useXDSIcon(name: XDSIconName): ReactNode {
  const registry = useContext(IconRegistryContext);

  if (registry != null && registry[name] != null) {
    return registry[name];
  }

  return defaultIcons[name];
}
