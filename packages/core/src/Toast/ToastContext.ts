// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext} from 'react';
import type {ToastEntry, ToastDismissReason} from './types';

/** Internal context value for toast state management. */
export interface ToastContextValue {
  /** Add a toast. */
  addToast: (entry: ToastEntry) => void;
  /** Remove a toast by ID with a reason. */
  removeToast: (id: string, reason: ToastDismissReason) => void;
  /** Find a toast by uniqueID. */
  findByUniqueID: (uniqueID: string) => ToastEntry | undefined;
}

/**
 * React context for toast state. Default is null — the hook
 * falls back to a self-mounting viewport when no provider exists.
 */
export const ToastContext = createContext<ToastContextValue | null>(null);
ToastContext.displayName = 'ToastContext';
