'use client';

import {useMemo, type ReactNode} from 'react';
import {
  XDSLayerContext,
  useXDSLayerContext,
  type XDSLayerContextValue,
  type LayerToastConfig,
} from './XDSLayerContext';
import {XDSToastViewport} from '../Toast/XDSToastViewport';

export interface XDSLayerProviderProps {
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
 * <XDSLayerProvider toast={{ position: 'topEnd', maxVisible: 3 }}>
 *   <App />
 * </XDSLayerProvider>
 * ```
 */
export function XDSLayerProvider({
  children,
  toast: toastConfig = {},
}: XDSLayerProviderProps) {
  const existingContext = useXDSLayerContext();

  const contextValue = useMemo<XDSLayerContextValue>(
    () => ({toastConfig, isProvider: true}),
    [toastConfig],
  );

  // Nested provider — pass through
  if (existingContext) {
    return <>{children}</>;
  }

  return (
    <XDSLayerContext.Provider value={contextValue}>
      <XDSToastViewport
        position={toastConfig.position}
        maxVisible={toastConfig.maxVisible}
        inset={toastConfig.inset}>
        {children}
      </XDSToastViewport>
    </XDSLayerContext.Provider>
  );
}

XDSLayerProvider.displayName = 'XDSLayerProvider';
