// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createContext, useContext} from 'react';
import type {ChartContext} from './types';

const Ctx = createContext<ChartContext | null>(null);
Ctx.displayName = 'ChartContext';
export const ChartProvider = Ctx.Provider;

export function useChart(): ChartContext {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('Must be used inside <Chart>');
  }
  return ctx;
}
