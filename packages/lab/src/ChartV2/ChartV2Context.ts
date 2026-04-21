/**
 * @file ChartV2Context.ts
 * @output React context for v2 chart — used by interaction children
 * @position Provided by XDSChart, consumed by tooltip/crosshair/brush
 */

import {createContext, useContext} from 'react';
import type {ChartV2Context} from './types';

const Ctx = createContext<ChartV2Context | null>(null);

export const ChartV2Provider = Ctx.Provider;

export function useChartV2(): ChartV2Context {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Must be used inside <XDSChart>');
  return ctx;
}
