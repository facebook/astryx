// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CollapsibleGroupContext.tsx
 * @input Uses React createContext
 * @output Exports CollapsibleGroupContext, CollapsibleGroupContextValue,
 *   CollapsibleGroupPresentationContext, CollapsibleGroupPresentationValue,
 *   and CollapsibleGroupDensity types
 * @position Context definitions for collapsible group coordination and presentation
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

/**
 * Row density for the items of a CollapsibleGroup, controlling trigger and
 * content block padding. Shares the repo-wide density vocabulary
 * (Table, List, Item).
 */
export type CollapsibleGroupDensity = 'compact' | 'balanced' | 'spacious';

/**
 * Presentation value provided by CollapsibleGroup so each Collapsible can
 * draw its own group chrome (StyleX has no child selectors, so the group
 * cannot style items from the outside).
 */
export interface CollapsibleGroupPresentationValue {
  /** Whether the group's items draw hairline dividers between one another. */
  hasDividers: boolean;
  /** Resolved row density, or null to keep the default (unpadded) look. */
  density: CollapsibleGroupDensity | null;
}

/**
 * Context for collapsible group presentation (dividers, density).
 * Kept separate from CollapsibleGroupContext so the public useCollapsible
 * state API is unaffected. Collapsible resets this context around its
 * children so nested collapsibles never inherit row chrome.
 */
export const CollapsibleGroupPresentationContext =
  createContext<CollapsibleGroupPresentationValue | null>(null);
CollapsibleGroupPresentationContext.displayName =
  'CollapsibleGroupPresentationContext';
