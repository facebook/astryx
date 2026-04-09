'use client';

/**
 * @file XDSLayerContext.ts
 * @input React context
 * @output Exports XDSLayerContext and related types
 * @position Context definition for XDSLayerProvider
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/index.ts
 * - /packages/core/src/Layer/XDSLayerProvider.tsx
 */

import {createContext, useContext} from 'react';

/**
 * Toast configuration passed through the layer provider.
 */
export interface LayerToastConfig {
  /** Position of the toast stack. @default 'bottomEnd' */
  position?: 'topEnd' | 'topStart' | 'bottomEnd' | 'bottomStart';
  /** Maximum visible toasts. @default 5 */
  maxVisible?: number;
  /** Inset from viewport edges. */
  inset?: {
    top?: number;
    bottom?: number;
    start?: number;
    end?: number;
  };
}

/**
 * Context value provided by XDSLayerProvider.
 */
export interface XDSLayerContextValue {
  /** Toast configuration from the provider. */
  toastConfig: LayerToastConfig;
  /** Whether this is a real provider (not fallback). */
  isProvider: true;
}

/**
 * React context for the layer provider.
 * Default value is null — hooks detect this and use the fallback.
 */
export const XDSLayerContext = createContext<XDSLayerContextValue | null>(null);

/**
 * Hook to access the layer context. Returns null if no provider exists.
 */
export function useXDSLayerContext(): XDSLayerContextValue | null {
  return useContext(XDSLayerContext);
}
