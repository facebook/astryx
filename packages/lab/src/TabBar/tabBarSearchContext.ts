// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file tabBarSearchContext.ts
 * @input React
 * @output Exports TabBarSearchContext: what a TabBar's search tab hands the
 *   field inside it (its host element, where it is, whether it is active)
 * @position Internal to the lab TabBar (TabBar.tsx provides it); kept apart
 *   from the touch layer (TabBarTouch.ts) because the field reads it under
 *   every pointer
 */

import {createContext, type RefObject} from 'react';

/**
 * What a TabBar's search tab gives the field inside it: the element that
 * holds the field, where it is, and whether it is active.
 */
export interface TabBarSearchContextValue {
  readonly host: RefObject<HTMLElement | null>;
  readonly placement: 'tab';
  readonly isActive: boolean;
}

export const TabBarSearchContext =
  createContext<TabBarSearchContextValue | null>(null);
