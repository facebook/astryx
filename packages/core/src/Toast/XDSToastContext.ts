'use client';

import {createContext} from 'react';
import type {XDSToastEntry, XDSToastDismissReason} from './types';

/** Internal context value for toast state management. */
export interface XDSToastContextValue {
  /** Add a toast. */
  addToast: (entry: XDSToastEntry) => void;
  /** Remove a toast by ID with a reason. */
  removeToast: (id: string, reason: XDSToastDismissReason) => void;
  /** Find a toast by uniqueID. */
  findByUniqueID: (uniqueID: string) => XDSToastEntry | undefined;
}

/**
 * React context for toast state. Default is null — the hook
 * falls back to a self-mounting viewport when no provider exists.
 */
export const XDSToastContext = createContext<XDSToastContextValue | null>(null);
