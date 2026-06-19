// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InputGroupContext.ts
 * @input None (pure context definition)
 * @output Exports InputGroup context and useInputGroup hook
 * @position Shared context; consumed by input components for group-aware styling
 */

import {createContext, use} from 'react';

export interface InputGroupContextValue {
  isInGroup: true;
}

export const InputGroupContext =
  createContext<InputGroupContextValue | null>(null);
InputGroupContext.displayName = 'InputGroupContext';

/**
 * Hook for input components to detect when inside an InputGroup.
 * Returns null when used outside a group.
 */
export function useInputGroup(): InputGroupContextValue | null {
  return use(InputGroupContext);
}
