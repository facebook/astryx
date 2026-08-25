// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, type ReactNode} from 'react';
import {
  LayerContext,
  useLayerContext,
  type LayerContextValue,
  type LayerToastConfig,
} from './LayerContext';
import {ToastViewport} from '../Toast/ToastViewport';

export interface LayerProviderProps {
  children: ReactNode;
  /** Toast configuration. Omit to use defaults. */
  toast?: LayerToastConfig;
}

/**
 * App-level provider for layer systems (toast, sheet, imperative modals).
 *
 * Optional — hooks fall back to a lazy self-mounting viewport when no
 * provider exists. Nested providers are no-ops.
 *
 * @example
 * ```
 * <LayerProvider toast={{ position: 'topEnd', maxVisible: 3 }}>
 *   <App />
 * </LayerProvider>
 * ```
 */
const DEFAULT_TOAST_CONFIG = {};

export function LayerProvider({
  children,
  toast: toastConfig = DEFAULT_TOAST_CONFIG,
}: LayerProviderProps) {
  const existingContext = useLayerContext();

  const contextValue = useMemo<LayerContextValue>(
    () => ({toastConfig, isProvider: true}),
    [toastConfig],
  );

  // Nested provider — pass through
  if (existingContext) {
    return <>{children}</>;
  }

  return (
    <LayerContext value={contextValue}>
      <ToastViewport
        position={toastConfig.position}
        maxVisible={toastConfig.maxVisible}
        inset={toastConfig.inset}>
        {children}
      </ToastViewport>
    </LayerContext>
  );
}

LayerProvider.displayName = 'LayerProvider';
