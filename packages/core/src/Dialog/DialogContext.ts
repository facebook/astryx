// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DialogContext.ts
 * @input React context
 * @output Internal dialog context for child focus behavior
 * @position Dialog internals; consumed by focus-managing children
 */

import {createContext, use} from 'react';

export interface DialogContextValue {
  /** Whether the dialog is rendered inline for docs/showcases. */
  isInline: boolean;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
