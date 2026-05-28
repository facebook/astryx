// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSInteractiveRoleContext.ts
 * @input React createContext, use
 * @output Exports XDSInteractiveRoleContext, useXDSInteractiveRoleContext
 * @position Context primitive; consumed by useXDSInteractiveRole hook
 *
 * Provides a role override to optionally-interactive child components.
 * When a parent (Popover, DropdownMenu, etc.) needs its child to render
 * as a button, it wraps the child in this context with role = 'button'.
 *
 * Components don't consume this directly — they use `useXDSInteractiveRole`
 * which checks this context as one of its decision inputs.
 *
 * Follows the same pattern as XDSSizeContext:
 *   XDSSizeContext provides size → useXDSSize resolves it
 *   XDSInteractiveRoleContext provides role → useXDSInteractiveRole resolves it
 *
 * SYNC: When modified, update:
 * - /packages/core/src/InteractiveRoleContext/index.ts
 */

import {createContext, use} from 'react';
import type {XDSInteractiveRole} from '../hooks/useXDSInteractiveRole';

/**
 * Context that provides a role override to child components.
 *
 * Provided by containers that need their child to be interactive:
 * - XDSPopover → 'button' (click to open popover)
 * - XDSDropdownMenu → 'button' (click to open menu)
 * - Any future component that wraps an optionally-interactive trigger
 *
 * `null` means no parent is overriding — resolve based on own props.
 */
export const XDSInteractiveRoleContext =
  createContext<XDSInteractiveRole | null>(null);
XDSInteractiveRoleContext.displayName = 'XDSInteractiveRoleContext';

/**
 * Read the role override from context, if any.
 *
 * Most components should use `useXDSInteractiveRole` instead of calling
 * this directly — it incorporates this signal alongside href/onClick.
 *
 * @returns The overridden role, or `null` if no parent is providing one.
 */
export function useXDSInteractiveRoleContext(): XDSInteractiveRole | null {
  return use(XDSInteractiveRoleContext);
}
