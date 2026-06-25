// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageBubble.tsx
 * @input Uses React, StyleX, ChatMessageContext, theme tokens
 * @output Exports ChatMessageBubble component and ChatMessageBubbleProps
 * @position Styled content container — the actual "chat bubble" with sender-aware styling
 *
 * Reads sender from parent ChatMessage context to auto-style background.
 * Optional — not all message content needs bubble treatment.
 *
 * Usage guidance:
 * - If you use bubbles on one side (e.g. assistant), use them consistently
 *   for all messages on that side. Use `ghost` variant for content that
 *   needs alignment without a visual boundary.
 * - Put `name` on the first bubble in a message, `metadata` on the last.
 * - For unbubbled messages, use ChatMessage's `name` and `metadata`
 *   props instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 * - /packages/cli/templates/blocks/components/ChatMessageBubble/ (block examples)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {useChatMessageContext} from './ChatContext';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

export type ChatMessageBubbleVariant = 'filled' | 'ghost';

export interface ChatMessageBubbleProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Bubble content — text, Markdown, or any ReactNode.
   */
  children: ReactNode;

  /**
   * Visual variant.
   * - 'filled': background color based on sender (default)
   * - 'ghost': no background, but keeps padding for consistent alignment
   * @default 'filled'
   */
  variant?: ChatMessageBubbleVariant;

  /**
   * Sender name rendered above the bubble, aligned with bubble text padding.
   * Use when the first content in a message is a bubble.
   * If the first content is raw (no bubble), use ChatMessage's `name`
   * prop instead.
   */
  name?: ReactNode;

  /**
   * Metadata content rendered below the bubble, aligned with bubble text padding.
   * Use when the last content in a message is a bubble.
   * If the last content is raw (no bubble), use ChatMessage's `metadata`
   * prop instead.
   */
  metadata?: ReactNode;

  /**
   * Position within a multi-bubble group.
   * Controls corner radius reduction on the sender side.
   * - 'first': bottom sender-side corner tightened
   * - 'middle': both sender-side corners tightened
   * - 'last': top sender-side corner tightened
   * Leave unset for standalone bubbles (full radius).
   */
  group?: 'first' | 'middle' | 'last';
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'max(80%, 280px)',
    // Bubbles are intentionally rounder than cards in the same view, so they
    // use the dedicated chat radius rather than coupling to --radius-page. #2072
    borderRadius: radiusVars['--radius-chat'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
  radiusCompact: {
    borderRadius: radiusVars['--radius-container'],
  },
  paddingCompact: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  paddingBalanced: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  paddingSpacious: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-5'],
  },
  paddingBlockNone: {
    paddingBlock: 0,
  },
  // Slot padding — matches bubble's paddingInline per density
  metadataPaddingCompact: {
    paddingInline: spacingVars['--spacing-4'],
  },
  metadataPaddingBalanced: {
    paddingInline: spacingVars['--spacing-4'],
  },
  metadataPaddingSpacious: {
    paddingInline: spacingVars['--spacing-5'],
  },
  metadataReducedGap: {
    marginBlockStart: `calc(-1 * ${spacingVars['--spacing-1-5']})`,
  },
  headerReducedGap: {
    marginBlockEnd: `calc(-1 * ${spacingVars['--spacing-1-5']})`,
  },
  nameRow: {
    height: spacingVars['--spacing-5'],
    display: 'flex',
    alignItems: 'center',
  },
  alignEnd: {
    textAlign: 'end',
  },
  // Sender backgrounds — same default, but separate styles for theme overrides.
  // Themes can target sender via legacy classes (.user/.assistant) or the
  // reflected data-sender attribute under @scope.
  assistant: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  user: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
  },
  // Grouped bubble corners — assistant (left side tight)
  groupFirstAssistant: {
    borderBottomLeftRadius: radiusVars['--radius-inner'],
  },
  groupMiddleAssistant: {
    borderTopLeftRadius: radiusVars['--radius-inner'],
    borderBottomLeftRadius: radiusVars['--radius-inner'],
  },
  groupLastAssistant: {
    borderTopLeftRadius: radiusVars['--radius-inner'],
  },
  // Grouped bubble corners — user (right side tight)
  groupFirstUser: {
    borderBottomRightRadius: radiusVars['--radius-inner'],
  },
  groupMiddleUser: {
    borderTopRightRadius: radiusVars['--radius-inner'],
    borderBottomRightRadius: radiusVars['--radius-inner'],
  },
  groupLastUser: {
    borderTopRightRadius: radiusVars['--radius-inner'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Styled content container — the chat "bubble."
 *
 * Reads sender from parent ChatMessage context to auto-style background.
 * Use `group` prop for multi-bubble corner grouping.
 *
 * @example
 * ```
 * <ChatMessage sender="user">
 *   <ChatMessageBubble
 *     name="Cindy"
 *     metadata={<ChatMessageMetadata timestamp="2:30 PM" status="read" />}>
 *     Hey, how's it going?
 *   </ChatMessageBubble>
 * </ChatMessage>
 * ```
 */
export function ChatMessageBubble({
  children,
  variant = 'filled',
  name,
  metadata,
  group,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: ChatMessageBubbleProps) {
  const msgContext = useChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';
  const density = msgContext?.density ?? 'balanced';

  const paddingStyle =
    density === 'compact'
      ? styles.paddingCompact
      : density === 'spacious'
        ? styles.paddingSpacious
        : styles.paddingBalanced;

  const isUser = sender === 'user';

  const senderStyle =
    variant === 'ghost'
      ? styles.ghost
      : isUser
        ? styles.user
        : styles.assistant;

  const groupStyle =
    group === 'first'
      ? isUser
        ? styles.groupFirstUser
        : styles.groupFirstAssistant
      : group === 'middle'
        ? isUser
          ? styles.groupMiddleUser
          : styles.groupMiddleAssistant
        : group === 'last'
          ? isUser
            ? styles.groupLastUser
            : styles.groupLastAssistant
          : null;

  const metadataPaddingStyle =
    density === 'compact'
      ? styles.metadataPaddingCompact
      : density === 'spacious'
        ? styles.metadataPaddingSpacious
        : styles.metadataPaddingBalanced;

  return (
    <>
      {name && (
        <div
          data-chat-name
          {...stylex.props(
            metadataPaddingStyle,
            styles.nameRow,
            styles.headerReducedGap,
            isUser && styles.alignEnd,
          )}>
          {name}
        </div>
      )}
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          themeProps('chat-message-bubble', {sender, variant, density}),
          stylex.props(
            styles.content,
            density === 'compact' && styles.radiusCompact,
            senderStyle,
            paddingStyle,
            variant === 'ghost' && styles.paddingBlockNone,
            groupStyle,
            xstyle,
          ),
          className,
          styleProp,
        )}>
        {children}
      </div>
      {metadata && (
        <div
          {...stylex.props(
            metadataPaddingStyle,
            styles.metadataReducedGap,
            isUser && styles.alignEnd,
          )}>
          {metadata}
        </div>
      )}
    </>
  );
}

ChatMessageBubble.displayName = 'ChatMessageBubble';
