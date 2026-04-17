/**
 * @file RadialContext.ts
 * @output React context for radial chart components
 */

import {createContext, useContext} from 'react';
import type {RadialContext} from './types';

const RadialCtx = createContext<RadialContext | null>(null);

export const RadialProvider = RadialCtx.Provider;

/** Access the radial chart context. Throws if used outside XDSRadialChart. */
export function useRadial(): RadialContext {
  const ctx = useContext(RadialCtx);
  if (!ctx) {
    throw new Error('Radial components must be used inside <XDSRadialChart>');
  }
  return ctx;
}
