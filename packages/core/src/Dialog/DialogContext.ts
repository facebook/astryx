// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DialogContext.ts
 * @input React context
 * @output Internal dialog context for child focus behavior and default labelling
 * @position Dialog internals; consumed by focus-managing children and DialogHeader
 */

import {createContext, use} from 'react';

export interface DialogContextValue {
  /** Whether the dialog is rendered inline for docs/showcases. */
  isInline: boolean;
  /**
   * Id the DialogHeader title should render with so the dialog can name
   * itself via aria-labelledby.
   */
  titleId?: string;
  /**
   * Called by DialogHeader on mount to signal that a title element exists.
   * Returns a cleanup function to call on unmount. The dialog only emits
   * aria-labelledby once a title has registered, so it never points at a
   * nonexistent id.
   */
  registerTitle?: () => () => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
