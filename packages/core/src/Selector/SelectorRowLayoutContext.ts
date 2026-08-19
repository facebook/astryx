// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectorRowLayoutContext.ts
 * @output Context telling a SelectorOption it is rendering somewhere that
 *   cannot grow, so it must keep the description on the label's line.
 * @position Internal to the Selector module.
 *
 * The trigger inside an InputGroup is height-pinned by the group
 * (groupStyles.inGroup sets height:100%), so a two-line value does not grow
 * the row — it spills through its own border. Rather than let the caller's
 * `renderValue` produce something that cannot fit, the trigger declares the
 * constraint and SelectorOption honours it.
 */

import {createContext, useContext} from 'react';

export const SelectorRowLayoutContext = createContext<'stacked' | 'inline'>(
  'stacked',
);
SelectorRowLayoutContext.displayName = "SelectorRowLayoutContext";

export function useSelectorRowLayout(): 'stacked' | 'inline' {
  return useContext(SelectorRowLayoutContext);
}
