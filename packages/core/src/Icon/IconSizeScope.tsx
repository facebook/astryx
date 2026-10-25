// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IconSizeScope.tsx
 * @input Uses IconDefaultSizeProvider
 * @output Exports IconSizeScope: sets the default size for the Icons inside it
 * @position Client part for server-rendered parents. A Server Component cannot
 *   render a context provider itself, so a parent that sizes its icon slot
 *   (Button's `icon`) renders this instead. It adds no DOM of its own: its
 *   server output is its children.
 *
 * SYNC: When modified, update /packages/core/src/Icon/IconDefaultSizeContext.ts
 * and /packages/core/src/__tests__/serverEntryClientParts.ts
 */

import type {ReactNode} from 'react';
import {IconDefaultSizeProvider} from './IconDefaultSizeContext';
import type {IconSize} from './IconSize.stylex';

export interface IconSizeScopeProps {
  /** Size an Icon inside renders at when it sets no size of its own. */
  size: IconSize;
  children?: ReactNode;
}

/** Sets the default Icon size for its children. */
export function IconSizeScope({size, children}: IconSizeScopeProps) {
  return (
    <IconDefaultSizeProvider value={size}>{children}</IconDefaultSizeProvider>
  );
}

IconSizeScope.displayName = 'IconSizeScope';
