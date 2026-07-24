// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageContent.tsx
 * @input Uses React, StyleX, ChatMessageContext, theme tokens
 * @output Exports ChatMessageContent component and ChatMessageContentProps
 * @position Text-column wrapper for custom in-message content — insets
 *   non-bubble children (cards, attachments, citations) to the same inline
 *   padding the bubble applies to its text and name/metadata slots (#2574)
 *
 * Reads density from parent ChatMessage context so the inset always matches
 * the sibling bubble's padding. Also stretches to the full message column,
 * so children can take the full width available to the message instead of
 * shrinking to fit.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/ChatMessageBubble.tsx (inset must match bubble paddingInline)
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 * - /packages/cli/templates/blocks/components/ChatMessage/ (block examples)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {useChatMessageContext} from './ChatContext';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

export interface ChatMessageContentProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Custom message content — cards, attachment chips, inline citations,
   * or any ReactNode that should sit in the bubble's text column.
   */
  children: ReactNode;
}

const styles = stylex.create({
  root: {
    // Span the full message column so children can use its full width.
    // ChatMessage's children wrapper aligns items to the sender side,
    // which otherwise shrinks custom content to fit.
    alignSelf: 'stretch',
    minWidth: 0,
  },
  // Inline inset — matches bubble's paddingInline per density, the same
  // mapping the bubble uses for its name/metadata slots.
  // SYNC: ChatMessageBubble.tsx padding* / metadataPadding* styles.
  insetCompact: {
    paddingInline: spacingVars['--spacing-4'],
  },
  insetBalanced: {
    paddingInline: spacingVars['--spacing-4'],
  },
  insetSpacious: {
    paddingInline: spacingVars['--spacing-5'],
  },
});

/**
 * Text-column wrapper for custom in-message content.
 *
 * Non-bubble children of ChatMessage render flush with the message edge,
 * while bubble text (and the bubble's name/metadata slots) are inset by the
 * bubble's inline padding. Wrap custom content — cards, attachments,
 * citations, a standalone ChatMessageMetadata — in ChatMessageContent to
 * align it with the bubble's text column. The inset is density-aware, so it
 * always matches the sibling bubble.
 *
 * @example
 * ```
 * <ChatMessage sender="assistant">
 *   <ChatMessageBubble>Here is the report you asked for.</ChatMessageBubble>
 *   <ChatMessageContent>
 *     <ClickableCard label="Open report" onClick={openReport}>
 *       Q3 Performance Report
 *     </ClickableCard>
 *   </ChatMessageContent>
 * </ChatMessage>
 * ```
 */
export function ChatMessageContent({
  children,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: ChatMessageContentProps) {
  const msgContext = useChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';
  const density = msgContext?.density ?? 'balanced';

  const insetStyle =
    density === 'compact'
      ? styles.insetCompact
      : density === 'spacious'
        ? styles.insetSpacious
        : styles.insetBalanced;

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        themeProps('chat-message-content', {sender, density}),
        stylex.props(styles.root, insetStyle, xstyle),
        className,
        styleProp,
      )}>
      {children}
    </div>
  );
}

ChatMessageContent.displayName = 'ChatMessageContent';
