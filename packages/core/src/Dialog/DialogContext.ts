// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DialogContext.ts
 * @input React context
 * @output DialogContext, useDialogContext, and DialogContextValue for header integration
 * @position Dialog coordination; exposed through the Dialog/DialogContext
 *   subpath for composed headers, including the lab DialogHeroHeader
 */

import {createContext, use} from 'react';

export interface DialogContextValue {
  /** Whether the dialog is rendered inline for docs/showcases. */
  isInline: boolean;
  /**
   * Id the DialogHeader title should render with so the dialog can name
   * itself via aria-labelledby. The dialog detects the title element's
   * presence directly (via a callback ref), so it only emits aria-labelledby
   * when the title actually rendered — never pointing at a nonexistent id.
   */
  titleId?: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
