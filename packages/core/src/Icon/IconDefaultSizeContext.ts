// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IconDefaultSizeContext.ts
 * @input Explicit Icon size or a component-owned legacy sizing context
 * @output Distinct explicit/context intent plus the released size fallback
 * @position Internal Icon sizing context; consumed by Icon and icon-slot owners
 */

import {use} from 'react';
import {createLayerScopedContext as createContext} from '../Layer/layerScopedContext';
import type {IconSize} from './IconSize.stylex';

const IconDefaultSizeContext = createContext<IconSize | null>(null);
IconDefaultSizeContext.displayName = 'IconDefaultSizeContext';

export const IconDefaultSizeProvider = IconDefaultSizeContext.Provider;

export function useIconContextSize(): IconSize | null {
  return use(IconDefaultSizeContext);
}

export function useIconSize(size: IconSize | undefined): IconSize {
  const contextualSize = useIconContextSize();
  return size ?? contextualSize ?? 'md';
}
