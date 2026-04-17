/**
 * @file ThreeDContext.ts
 * @output React context for 3D chart components
 */

import {createContext, useContext} from 'react';
import type {ThreeDContext} from './types';

const ThreeDCtx = createContext<ThreeDContext | null>(null);

export const ThreeDProvider = ThreeDCtx.Provider;

/** Access the 3D chart context. Throws if used outside XDS3DChart. */
export function use3D(): ThreeDContext {
  const ctx = useContext(ThreeDCtx);
  if (!ctx) {
    throw new Error('3D components must be used inside <XDS3DChart>');
  }
  return ctx;
}
