// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSLayoutDividerContext.ts
 * @input Uses React createContext
 * @output Exports XDSLayoutDividerContext and LayoutDividerContextValue type
 * @position Context for container-controlled default divider visibility;
 *   consumed by XDSLayoutHeader.tsx, XDSLayoutFooter.tsx, provided by XDSLayout.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /packages/core/src/Layout/XDSLayout.tsx
 * - /packages/core/src/Layout/XDSLayoutHeader.tsx
 * - /packages/core/src/Layout/XDSLayoutFooter.tsx
 */

import {createContext} from 'react';

export interface LayoutDividerContextValue {
  defaultHasDividers: boolean;
}

export const XDSLayoutDividerContext =
  createContext<LayoutDividerContextValue | null>(null);
