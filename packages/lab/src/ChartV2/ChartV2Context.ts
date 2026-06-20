// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createContext, useContext} from 'react';
import type {ChartV2Context} from './types';

const Ctx = createContext<ChartV2Context | null>(null);
export const ChartV2Provider = Ctx.Provider;

export function useChartV2(): ChartV2Context {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('Must be used inside <Chart>');
  }
  return ctx;
}
