/**
 * @file BrushContext.ts
 * @output React context for active brush range
 * @position Provided by XDSChart; written by XDSChartBrush, read by marks via useBrush()
 */

import {createContext, useContext} from 'react';
import type {BrushState} from './types';

const BrushCtx = createContext<BrushState>({
  range: null,
  setRange: () => {},
});

export const BrushProvider = BrushCtx.Provider;

/**
 * Read the active brush state.
 * When range is null, no brush is active — nothing should be muted.
 */
export function useBrush(): BrushState {
  return useContext(BrushCtx);
}
