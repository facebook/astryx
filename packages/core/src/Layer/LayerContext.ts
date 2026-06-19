// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LayerContext.ts
 * @input React context
 * @output Exports LayerContext and related types
 * @position Context definition for LayerProvider
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/index.ts
 * - /packages/core/src/Layer/LayerProvider.tsx
 */

import {createContext, use} from 'react';

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
 * Context value provided by LayerProvider.
 */
export interface LayerContextValue {
  /** Toast configuration from the provider. */
  toastConfig: LayerToastConfig;
  /** Whether this is a real provider (not fallback). */
  isProvider: true;
}

/**
 * React context for the layer provider.
 * Default value is null — hooks detect this and use the fallback.
 */
export const LayerContext = createContext<LayerContextValue | null>(null);
LayerContext.displayName = 'LayerContext';

/**
 * Hook to access the layer context. Returns null if no provider exists.
 */
export function useLayerContext(): LayerContextValue | null {
  return use(LayerContext);
}
