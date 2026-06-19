// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CollapsibleGroupContext.tsx
 * @input Uses React createContext
 * @output Exports CollapsibleGroupContext and CollapsibleGroupContextValue type
 * @position Context definition for collapsible group coordination
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/CollapsibleGroup.tsx (provider)
 * - /packages/core/src/Collapsible/Collapsible.doc.mjs
 * - /packages/cli/templates/blocks/components/Collapsible/ (showcase blocks)
 */

import {createContext} from 'react';

/**
 * Context value provided by CollapsibleGroup to coordinate collapsible children.
 */
export interface CollapsibleGroupContextValue {
  /** Check if a given value is currently open. */
  isOpen: (value: string) => boolean;
  /** Toggle the open state of a given value. */
  toggle: (value: string) => void;
}

/**
 * Context for collapsible group coordination.
 * When present, collapsible components defer their open/close state to the group.
 */
export const CollapsibleGroupContext =
  createContext<CollapsibleGroupContextValue | null>(null);
CollapsibleGroupContext.displayName = 'CollapsibleGroupContext';
