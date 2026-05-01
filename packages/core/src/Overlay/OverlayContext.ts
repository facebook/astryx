import {createContext, useContext} from 'react';

/**
 * Internal context for overlay touch-toggle state.
 * When on a touch device with a full-cover hover scrim,
 * XDSOverlay provides this so XDSOverlayScrim can read
 * the tap-toggled open state.
 */
export interface OverlayContextValue {
  /** Touch-toggled open state. undefined = not touch-controlled. */
  touchOpen: boolean | undefined;
}

export const OverlayContext = createContext<OverlayContextValue>({
  touchOpen: undefined,
});

export function useOverlayContext(): OverlayContextValue {
  return useContext(OverlayContext);
}
