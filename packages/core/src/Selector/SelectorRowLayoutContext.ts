// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectorRowLayoutContext.ts
 * @input React createContext/use
 * @output Exports the row-layout context and useSelectorRowLayout hook
 * @position Internal to the Selector module; read by SelectorOption
 *
 * The trigger inside an InputGroup is height-pinned by the group
 * (groupStyles.inGroup sets height:100%), so a two-line value does not grow
 * the row — it spills through its own border. Rather than let the caller's
 * `renderValue` produce something that cannot fit, the trigger declares the
 * constraint and SelectorOption honours it.
 */

import {createContext, use} from 'react';

export type SelectorRowLayout = 'stacked' | 'inline';

export const SelectorRowLayoutContext =
  createContext<SelectorRowLayout>('stacked');
SelectorRowLayoutContext.displayName = 'SelectorRowLayoutContext';

/**
 * The row layout a host imposes on the options it renders. `stacked` outside
 * any height-pinned host.
 */
export function useSelectorRowLayout(): SelectorRowLayout {
  return use(SelectorRowLayoutContext);
}
