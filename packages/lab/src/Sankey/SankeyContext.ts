// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyContext.ts
 * @output React context for sharing Sankey layout between components
 * @position Consumed by XDSSankeyChart (provider) and all child components (consumers)
 */

import {createContext, useContext} from 'react';
import type {SankeyContext} from './types';

const SankeyCtx = createContext<SankeyContext | null>(null);

export const SankeyProvider = SankeyCtx.Provider;

/** Access the sankey context. Throws if used outside <XDSSankeyChart>. */
export function useSankey(): SankeyContext {
  const ctx = useContext(SankeyCtx);
  if (!ctx) {
    throw new Error('Sankey components must be used inside <XDSSankeyChart>');
  }
  return ctx;
}
