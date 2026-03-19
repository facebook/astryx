/**
 * @file XDSSegmentedControlContext.ts
 * @input React createContext, useContext
 * @output Exports XDSSegmentedControlContext, useXDSSegmentedControlContext
 * @position Context provider; consumed by XDSSegmentedControlItem.tsx
 *
 * SYNC: When modified, update /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 */

'use client';

import {createContext, useContext} from 'react';

export type XDSSegmentedControlSize = 'sm' | 'md' | 'lg';

export interface XDSSegmentedControlContextValue {
  value: string;
  onChange: (value: string) => void;
  size: XDSSegmentedControlSize;
  isDisabled: boolean;
}

export const XDSSegmentedControlContext =
  createContext<XDSSegmentedControlContextValue | null>(null);

export function useXDSSegmentedControlContext(): XDSSegmentedControlContextValue {
  const ctx = useContext(XDSSegmentedControlContext);
  if (ctx == null) {
    throw new Error(
      'useXDSSegmentedControlContext must be used within XDSSegmentedControl. ' +
        'Wrap your XDSSegmentedControlItem in <XDSSegmentedControl>.',
    );
  }
  return ctx;
}
