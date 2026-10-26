// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioListOrientationContext.ts
 * @input Uses React createContext
 * @output Exports RadioListOrientationContext: how a RadioList lays out its
 *   options, for its own items
 * @position Internal to RadioList: RadioList provides it and RadioListItem
 *   reads it. Not exported from the package, so the released
 *   RadioListContextValue keeps its shape.
 */

import {createContext} from 'react';

/**
 * The options' layout. Under a coarse pointer a vertical list's rows share
 * its gap as their touch target; an item outside a RadioList reads vertical,
 * RadioList's default.
 */
export const RadioListOrientationContext = createContext<
  'vertical' | 'horizontal'
>('vertical');
RadioListOrientationContext.displayName = 'RadioListOrientationContext';
