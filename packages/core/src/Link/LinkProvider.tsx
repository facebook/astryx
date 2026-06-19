// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LinkProvider.tsx
 * @input React, LinkContext, LinkComponentType
 * @output Exports LinkProvider component and LinkProviderProps
 * @position Provider component for polymorphic link support
 *
 * Sets the default link component for all XDS components in the subtree.
 * Individual components can still override via the `as` prop.
 *
 * @example
 * ```
 * import Link from 'next/link';
 * <LinkProvider component={Link}>
 *   <App />
 * </LinkProvider>
 * ```
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/Link.doc.mjs
 * - /packages/cli/templates/blocks/components/Link/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import {LinkContext} from './LinkContext';
import type {LinkComponentType} from './types';

export interface LinkProviderProps {
  /**
   * The component to use for all link elements in the subtree.
   * Must accept href, className, style, and children props.
   *
   * @example
   * ```
   * import Link from 'next/link';
   * <LinkProvider component={Link}>
   * ```
   */
  component: LinkComponentType;
  children: ReactNode;
}

/**
 * Provides a custom link component to all XDS components in the subtree.
 *
 * Wrap your app (or a section of it) in LinkProvider to replace
 * native `<a>` elements with your framework's link component
 * (e.g., Next.js Link, React Router Link).
 */
export function LinkProvider({component, children}: LinkProviderProps) {
  const value = useMemo(() => ({component}), [component]);
  return <LinkContext value={value}>{children}</LinkContext>;
}

LinkProvider.displayName = 'LinkProvider';
