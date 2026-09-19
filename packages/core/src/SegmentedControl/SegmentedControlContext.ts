// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SegmentedControlContext.ts
 * @input React createContext, use
 * @output Exports SegmentedControlContext, useSegmentedControlContext
 * @position Context provider; consumed by SegmentedControlItem.tsx
 *
 * SYNC: When modified, update /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 */

import {createContext, use} from 'react';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';
export type SegmentedControlLayout = 'hug' | 'fill';

export interface SegmentedControlContextValue {
  value: string;
  onChange: (value: string) => void;
  size: SegmentedControlSize;
  layout: SegmentedControlLayout;
  isDisabled: boolean;
  /**
   * True when the whole control is disabled *and* a `disabledMessage` is set.
   * In that mode the selected segment stays focusable (via `aria-disabled`
   * rather than being dropped from the tab order) so the group's disabled-reason
   * tooltip is keyboard-discoverable; selection is still blocked.
   */
  hasDisabledMessage?: boolean;
}

export const SegmentedControlContext =
  createContext<SegmentedControlContextValue | null>(null);
SegmentedControlContext.displayName = 'SegmentedControlContext';

export function useSegmentedControlContext(): SegmentedControlContextValue {
  const ctx = use(SegmentedControlContext);
  if (ctx == null) {
    throw new Error(
      'useSegmentedControlContext must be used within SegmentedControl. ' +
        'Wrap your SegmentedControlItem in <SegmentedControl>.',
    );
  }
  return ctx;
}
