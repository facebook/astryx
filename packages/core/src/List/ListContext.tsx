// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListContext.tsx
 * @input Layer-scoped React context
 * @output Exports ListContext for sharing density, dividers, marker style,
 *   and optional inline edge compensation between List and ListItem, and
 *   ListMarkerScope, which sets the marker for the items inside it
 * @position Internal context; consumed by List.tsx and ListItem.tsx
 */

import {use, useMemo, type ReactNode} from 'react';
import {createLayerScopedContext as createContext} from '../Layer/layerScopedContext';

export type ListDensity = 'compact' | 'balanced' | 'spacious';
export type ListMarkerStyle = 'none' | 'disc' | 'decimal' | 'circle';

/**
 * Every marker ListItem draws: the public styles, and the square, letter,
 * and roman markers Markdown's nested lists use (spec:AST-061 DEC-6).
 */
export type ListMarker =
  'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'lower-roman';

export interface ListContextValue {
  density: ListDensity;
  hasDividers: boolean;
  listStyle: ListMarkerStyle;
  edgeCompensation?: 'inline';
  /**
   * The marker items draw instead of the one `listStyle` names, set by
   * ListMarkerScope; internal. Ignored when `listStyle` is `'none'`.
   */
  marker?: ListMarker;
}

export const ListContext = createContext<ListContextValue | null>(null);
ListContext.displayName = 'ListContext';

/**
 * Draws `marker` on the List items inside it, in place of the marker their
 * List's `listStyle` names; internal, for Markdown's nested lists. Outside a
 * List, or in a List without markers, it changes nothing.
 */
export function ListMarkerScope({
  marker,
  children,
}: {
  readonly marker: ListMarker;
  readonly children: ReactNode;
}): ReactNode {
  const context = use(ListContext);
  const value = useMemo(
    () => (context == null ? null : {...context, marker}),
    [context, marker],
  );
  return value == null ? (
    children
  ) : (
    <ListContext value={value}>{children}</ListContext>
  );
}
