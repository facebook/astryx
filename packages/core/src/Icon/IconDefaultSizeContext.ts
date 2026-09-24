// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IconDefaultSizeContext.ts
 * @input Uses React context and an optional Icon size prop
 * @output Supplies a component-owned default size to descendant Icon instances
 * @position Internal Icon sizing context; consumed by Icon and icon-slot owners
 */

import {createContext, use} from 'react';
import type {IconSize} from './IconSize.stylex';

const IconDefaultSizeContext = createContext<IconSize | null>(null);
IconDefaultSizeContext.displayName = 'IconDefaultSizeContext';

export const IconDefaultSizeProvider = IconDefaultSizeContext.Provider;

export function useIconSize(size: IconSize | undefined): IconSize {
  const contextualSize = use(IconDefaultSizeContext);
  return size ?? contextualSize ?? 'md';
}
