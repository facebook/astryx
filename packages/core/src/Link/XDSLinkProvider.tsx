'use client';

/**
 * @file XDSLinkProvider.tsx
 * @input React, XDSLinkContext, XDSLinkComponentType
 * @output Exports XDSLinkProvider component and XDSLinkProviderProps
 * @position Provider component for polymorphic link support
 *
 * Sets the default link component for all XDS components in the subtree.
 * Individual components can still override via the `as` prop.
 *
 * @example
 * ```
 * import Link from 'next/link';
 * <XDSLinkProvider component={Link}>
 *   <App />
 * </XDSLinkProvider>
 * ```
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/Link.doc.mjs
 */


import {useMemo, type ReactNode} from 'react';
import {XDSLinkContext} from './XDSLinkContext';
import type {XDSLinkComponentType} from './types';

export interface XDSLinkProviderProps {
  /**
   * The component to use for all link elements in the subtree.
   * Must accept href, className, style, and children props.
   *
   * @example
   * ```
   * import Link from 'next/link';
   * <XDSLinkProvider component={Link}>
   * ```
   */
  component: XDSLinkComponentType;
  children: ReactNode;
}

/**
 * Provides a custom link component to all XDS components in the subtree.
 *
 * Wrap your app (or a section of it) in XDSLinkProvider to replace
 * native `<a>` elements with your framework's link component
 * (e.g., Next.js Link, React Router Link).
 */
export function XDSLinkProvider({component, children}: XDSLinkProviderProps) {
  const value = useMemo(() => ({component}), [component]);
  return (
    <XDSLinkContext.Provider value={value}>{children}</XDSLinkContext.Provider>
  );
}
