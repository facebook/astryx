'use client';

/**
 * @file XDSChatMessageTokenizedText.tsx
 * @input Uses React, XDSBadge, XDSChatComposerToken
 * @output Exports XDSChatMessageTokenizedText component
 * @position Utility component for rendering tokenized text in message bubbles
 *
 * Parses a plain text string and replaces token values with inline badges.
 * Accepts the same XDSChatComposerToken type used by the input triggers,
 * so the same token definitions work for both input and display.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts
 */

import type {ReactNode} from 'react';
import {XDSBadge} from '../Badge';
import type {XDSChatComposerToken} from './XDSChatComposerInput';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatMessageTokenizedTextProps {
  /** The message text containing serialized token values */
  children: string;
  /**
   * Token definitions — same type returned by trigger onSelect.
   * Each token's `value` is matched against the text and replaced
   * with its badge representation (label, variant, icon).
   *
   * @example
   * ```
   * // Shared between input and display
   * const mentionTokens = contacts.map(c => ({
   *   value: `@${c.id}`,
   *   label: `@${c.label}`,
   *   variant: 'blue' as const,
   * }));
   *
   * // Input trigger
   * { character: '@', onSelect: (item) => mentionTokens.find(...) }
   *
   * // Display
   * <XDSChatMessageTokenizedText tokens={mentionTokens}>
   *   {message.text}
   * </XDSChatMessageTokenizedText>
   * ```
   */
  tokens?: XDSChatComposerToken[];
}

// =============================================================================
// Helpers
// =============================================================================

function isCustomToken(
  token: XDSChatComposerToken,
): token is {value: string; render: () => ReactNode} {
  return 'render' in token && typeof token.render === 'function';
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

// =============================================================================
// Component
// =============================================================================

/**
 * Renders text with token values replaced by inline badges.
 *
 * Accepts the same `XDSChatComposerToken` type used by input triggers,
 * so you can share a single token definition between input and display.
 */
export function XDSChatMessageTokenizedText({
  children,
  tokens,
}: XDSChatMessageTokenizedTextProps) {
  if (!tokens || tokens.length === 0) {
    return <span style={{display: 'inline'}}>{children}</span>;
  }

  const parts = renderTokens(children, tokens);
  return <span style={{display: 'inline'}}>{parts}</span>;
}

XDSChatMessageTokenizedText.displayName = 'XDSChatMessageTokenizedText';

// =============================================================================
// Render
// =============================================================================

function renderTokens(
  text: string,
  tokens: XDSChatComposerToken[],
): ReactNode[] {
  const pattern = tokens.map(t => escapeRegExp(t.value)).join('|');
  const regex = new RegExp(`(${pattern})`, 'g');

  const tokenMap = new Map<string, XDSChatComposerToken>();
  for (const t of tokens) {
    tokenMap.set(t.value, t);
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    const token = tokenMap.get(matched);
    if (token) {
      parts.push(
        isCustomToken(token) ? (
          <span key={`${matched}-${match.index}`}>{token.render()}</span>
        ) : (
          <XDSBadge
            key={`${matched}-${match.index}`}
            label={token.label}
            variant={token.variant}
            icon={token.icon}
          />
        ),
      );
    }

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
