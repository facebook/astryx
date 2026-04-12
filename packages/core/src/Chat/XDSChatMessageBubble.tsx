'use client';

/**
 * @file XDSChatMessageBubble.tsx
 * @input Uses React, StyleX, XDSChatMessageContext, theme tokens
 * @output Exports XDSChatMessageBubble component and XDSChatMessageBubbleProps
 * @position Styled content container — the actual "chat bubble" with sender-aware styling
 *
 * Reads sender from parent XDSChatMessage context to auto-style background.
 * Optional — not all message content needs bubble treatment.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {useXDSChatMessageContext} from './XDSChatContext';
import {xdsClassName, mergeProps} from '../utils';

export type XDSChatMessageBubbleVariant = 'filled' | 'ghost' | 'transparent';

export interface XDSChatMessageBubbleProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Bubble content — text, XDSMarkdown, or any ReactNode.
   */
  children: ReactNode;

  /**
   * Visual variant.
   * - 'filled': background color based on sender (default)
   * - 'ghost': no background, but keeps padding for consistent alignment
   * - 'transparent': no background, no padding — just the content
   * @default 'filled'
   */
  variant?: XDSChatMessageBubbleVariant;

  /**
   * Header content rendered above the bubble with matching padding.
   * Use for sender name.
   */
  header?: ReactNode;

  /**
   * Metadata content rendered below the bubble with matching padding.
   * Use for timestamps, status, or other message metadata.
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

  /** StyleX overrides. */
  xstyle?: StyleXStyles;
  /** CSS class name(s). */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
  /** Test ID. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    borderRadius: radiusVars['--radius-page'],
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
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
  },
  paddingBalanced: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  paddingSpacious: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-5'],
  },
  paddingNone: {
    paddingBlock: 0,
    paddingInline: 0,
  },
  paddingBlockNone: {
    paddingBlock: 0,
  },
  // Footer padding — matches bubble's paddingInline per density
  metadataPaddingCompact: {
    paddingInline: spacingVars['--spacing-3'],
  },
  metadataPaddingBalanced: {
    paddingInline: spacingVars['--spacing-4'],
  },
  metadataPaddingSpacious: {
    paddingInline: spacingVars['--spacing-5'],
  },
  metadataPaddingNone: {
    paddingInline: 0,
  },
  metadataReducedGap: {
    marginBlockStart: `calc(-1 * ${spacingVars['--spacing-1']})`,
  },
  headerReducedGap: {
    marginBlockEnd: `calc(-1 * ${spacingVars['--spacing-1']})`,
  },
  assistant: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  user: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  system: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-secondary'],
  },
  transparent: {
    backgroundColor: 'transparent',
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
 * Reads sender from parent XDSChatMessage context to auto-style background.
 * Use `group` prop for multi-bubble corner grouping.
 *
 * @example
 * ```
 * <XDSChatMessage sender="user">
 *   <XDSChatMessageBubble group="first">Hey</XDSChatMessageBubble>
 *   <XDSChatMessageBubble group="last">What's up?</XDSChatMessageBubble>
 *   <XDSChatMessageMetadata timestamp="2:30 PM" status="read" />
 * </XDSChatMessage>
 * ```
 */
export function XDSChatMessageBubble({
  children,
  variant = 'filled',
  header,
  metadata,
  group,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: XDSChatMessageBubbleProps) {
  const msgContext = useXDSChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';
  const density = msgContext?.density ?? 'balanced';

  const paddingStyle =
    variant === 'transparent'
      ? styles.paddingNone
      : density === 'compact'
        ? styles.paddingCompact
        : density === 'spacious'
          ? styles.paddingSpacious
          : styles.paddingBalanced;

  const senderStyle =
    variant === 'transparent'
      ? styles.transparent
      : variant === 'ghost'
        ? styles.ghost
        : (styles[sender] ?? styles.assistant);

  const isUser = sender === 'user';
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
    variant === 'transparent'
      ? styles.metadataPaddingNone
      : density === 'compact'
        ? styles.metadataPaddingCompact
        : density === 'spacious'
          ? styles.metadataPaddingSpacious
          : styles.metadataPaddingBalanced;

  return (
    <>
      {header && (
        <div
          {...stylex.props(
            metadataPaddingStyle,
            variant !== 'transparent' && styles.headerReducedGap,
          )}>
          {header}
        </div>
      )}
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('chat-message-bubble', {sender, variant}),
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
            variant !== 'transparent' && styles.metadataReducedGap,
          )}>
          {metadata}
        </div>
      )}
    </>
  );
}

XDSChatMessageBubble.displayName = 'XDSChatMessageBubble';
