// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useXDSChatPasteAsToken.ts
 * @input Uses React refs, callbacks
 * @output Exports useXDSChatPasteAsToken hook
 * @position Utility hook — composable paste behavior for XDSChatComposerInput
 *
 * Intercepts paste events and converts long text into a token chip
 * instead of inserting raw text into the contentEditable. Short
 * pastes pass through normally.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 */

import {useCallback} from 'react';
import type {ClipboardEvent} from 'react';
import type {
  XDSChatComposerInputHandle,
  XDSChatComposerToken,
} from './XDSChatComposerInput';

// =============================================================================
// Types
// =============================================================================

export interface UseXDSChatPasteAsTokenOptions {
  /** Ref to the composer input handle for inserting tokens. */
  inputRef: React.RefObject<XDSChatComposerInputHandle | null>;

  /**
   * Character count threshold — pastes longer than this become tokens.
   * @default 200
   */
  threshold?: number;

  /**
   * Convert pasted text into a token. Return the token to insert.
   * @default Creates a neutral badge with character count label.
   */
  toToken?: (text: string) => XDSChatComposerToken;
}

export interface UseXDSChatPasteAsTokenReturn {
  /**
   * Pass as the onPaste prop on XDSChatComposerInput.
   * Returns true when the paste was converted to a token.
   */
  onPaste: (event: ClipboardEvent<HTMLDivElement>, text: string) => boolean;
}

// =============================================================================
// Default token factory
// =============================================================================

function defaultToToken(text: string): XDSChatComposerToken {
  const lines = text.split('\n').length;
  const chars = text.length;
  const label = lines > 1
    ? `${lines} lines, ${chars} chars`
    : `${chars} chars`;
  return {
    value: text,
    label,
    variant: 'neutral' as const,
  };
}

// =============================================================================
// Hook
// =============================================================================

export function useXDSChatPasteAsToken({
  inputRef,
  threshold = 200,
  toToken = defaultToToken,
}: UseXDSChatPasteAsTokenOptions): UseXDSChatPasteAsTokenReturn {
  const onPaste = useCallback(
    (_event: ClipboardEvent<HTMLDivElement>, text: string): boolean => {
      if (text.length <= threshold) return false;

      const token = toToken(text);
      inputRef.current?.insertToken(token);
      return true;
    },
    [inputRef, threshold, toToken],
  );

  return {onPaste};
}
