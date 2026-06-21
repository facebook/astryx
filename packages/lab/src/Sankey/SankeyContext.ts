// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyContext.ts
 * @output React context for sharing Sankey layout between components
 * @position Consumed by SankeyChart (provider) and all child components (consumers)
 */

import {createContext, useContext} from 'react';
import type {SankeyContext} from './types';

const SankeyCtx = createContext<SankeyContext | null>(null);

export const SankeyProvider = SankeyCtx.Provider;

/** Access the sankey context. Throws if used outside <SankeyChart>. */
export function useSankey(): SankeyContext {
  const ctx = useContext(SankeyCtx);
  if (!ctx) {
    throw new Error('Sankey components must be used inside <SankeyChart>');
  }
  return ctx;
}
