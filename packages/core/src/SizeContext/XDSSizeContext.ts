// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSSizeContext.ts
 * @input React createContext, useContext
 * @output Exports XDSSizeContext, useXDSSize, XDSElementSize, XDSSizeProvider
 * @position Context provider; consumed by Button, TextInput, TabList, Selector, etc.
 *
 * Generic size context that lets container components (Toolbar, TopNav, Card headers)
 * cascade a default size to interactive children. Children use the context as a
 * fallback — an explicit `size` prop always wins.
 */

import {createContext, useContext} from 'react';

/**
 * Standard element sizes used across interactive components.
 */
export type XDSElementSize = 'sm' | 'md' | 'lg';

/**
 * Context for cascading a default size from container to children.
 *
 * `null` means no container is providing a size — components use their own default.
 */
export const XDSSizeContext = createContext<XDSElementSize | null>(null);

/**
 * Resolve the effective size from an explicit prop, inherited context, or default.
 *
 * @param sizeProp - Explicit size prop from the component (wins if set)
 * @param defaultSize - Fallback when neither prop nor context provides a size
 * @returns The resolved size
 *
 * @example
 * ```ts
 * // In a component:
 * const size = useXDSSize(sizeProp, 'md');
 * ```
 */
export function useXDSSize<T extends string = XDSElementSize>(
  sizeProp?: T,
  defaultSize: T = 'md' as T,
): T {
  const inherited = useContext(XDSSizeContext);
  return sizeProp ?? (inherited as T | null) ?? defaultSize;
}

export const XDSSizeProvider = XDSSizeContext.Provider;
