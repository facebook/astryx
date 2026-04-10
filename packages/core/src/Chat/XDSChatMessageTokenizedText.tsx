'use client';

/**
 * @file XDSChatMessageTokenizedText.tsx
 * @input Uses React, XDSBadge
 * @output Exports XDSChatMessageTokenizedText component
 * @position Utility component for rendering tokenized text in message bubbles
 *
 * Parses a plain text string and replaces token patterns (e.g. @cindy)
 * with inline XDSBadge components. Falls back to plain text when no
 * tokens match.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts
 */

import type {ReactNode} from 'react';
import {XDSBadge, type XDSBadgeVariant} from '../Badge';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatMessageTokenConfig {
  /** Pattern to match in the text (e.g. '@cindy') */
  pattern: string;
  /** Display label for the badge (e.g. '@Cindy Zhang') */
  label: string;
  /** Badge variant */
  variant?: XDSBadgeVariant;
}

export interface XDSChatMessageTokenizedTextProps {
  /** The message text containing token patterns */
  children: string;
  /** Token definitions to match and render as badges */
  tokens?: XDSChatMessageTokenConfig[];
}

// =============================================================================
// Component
// =============================================================================

/**
 * Renders text with token patterns replaced by inline badges.
 *
 * @example
 * ```
 * <XDSChatMessageTokenizedText
 *   tokens={[{pattern: '@cindy', label: '@Cindy Zhang', variant: 'blue'}]}
 * >
 *   Hey @cindy, can you review this?
 * </XDSChatMessageTokenizedText>
 * ```
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
// Helpers
// =============================================================================

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Parse text and replace token patterns with Badge elements */
function renderTokens(
  text: string,
  tokens: XDSChatMessageTokenConfig[],
): ReactNode[] {
  // Build a combined regex matching any token pattern
  const pattern = tokens.map(t => escapeRegExp(t.pattern)).join('|');
  const regex = new RegExp(`(${pattern})`, 'g');

  // Build a lookup map for O(1) access
  const tokenMap = new Map<string, XDSChatMessageTokenConfig>();
  for (const t of tokens) {
    tokenMap.set(t.pattern, t);
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    const config = tokenMap.get(matched);
    if (config) {
      parts.push(
        <XDSBadge
          key={`${matched}-${match.index}`}
          label={config.label}
          variant={config.variant}
        />,
      );
    }

    lastIndex = match.index + matched.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
