// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSMetadataListContext.tsx
 * @input Uses React createContext
 * @output Exports XDSMetadataListContext for sharing config between XDSMetadataList and XDSMetadataListItem
 * @position Internal context; consumed by XDSMetadataList.tsx and XDSMetadataListItem.tsx
 */

import {createContext} from 'react';

export interface XDSMetadataListLabelConfig {
  position: 'start' | 'top';
  width?: number | string;
}

export interface XDSMetadataListContextValue {
  labelConfig: XDSMetadataListLabelConfig;
  orientation: 'vertical' | 'horizontal';
}

export const XDSMetadataListContext =
  createContext<XDSMetadataListContextValue | null>(null);
