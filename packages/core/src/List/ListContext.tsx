// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListContext.tsx
 * @input Uses React createContext
 * @output Exports ListContext for sharing density between List and ListItem
 * @position Internal context; consumed by List.tsx and ListItem.tsx
 */

import {createContext} from 'react';

export type ListDensity = 'compact' | 'balanced' | 'spacious';
export type ListMarkerStyle = 'none' | 'disc' | 'decimal' | 'circle';

export interface ListContextValue {
  density: ListDensity;
  hasDividers: boolean;
  listStyle: ListMarkerStyle;
}

export const ListContext = createContext<ListContextValue | null>(null);
ListContext.displayName = 'ListContext';
