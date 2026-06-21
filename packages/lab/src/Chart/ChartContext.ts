// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartContext.ts
 * @output React context for sharing scales and dimensions between chart components
 * @position Consumed by Chart (provider) and all child components (consumers)
 */

import {createContext, useContext} from 'react';
import type {ChartContext} from './types';

const ChartCtx = createContext<ChartContext | null>(null);

export const ChartProvider = ChartCtx.Provider;

/** Access the chart context. Throws if used outside <Chart>. */
export function useChart(): ChartContext {
  const ctx = useContext(ChartCtx);
  if (!ctx) {
    throw new Error('Chart components must be used inside <Chart>');
  }
  return ctx;
}
