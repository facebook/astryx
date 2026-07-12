// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageMetadata.tsx
 * @input Uses React, StyleX, ChatContext, Icon, theme tokens
 * @output Exports ChatMessageMetadata component
 * @position Shared metadata row used by composing inside ChatMessage
 *
 * Renders: <timestamp> · <footer> · <status>
 * Direction reverses for user sender.
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {useChatMessageContext} from './ChatContext';
import {Icon} from '../Icon';
import type {IconName} from '../Icon/globalIconRegistry';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

export type ChatMessageStatus =
  'sending' | 'sent' | 'delivered' | 'read' | 'error';

const STATUS_CONFIG: Record<
  ChatMessageStatus,
  {icon: IconName; label: string}
> = {
  sending: {icon: 'clock', label: 'Sending'},
  sent: {icon: 'check', label: 'Sent'},
  delivered: {icon: 'checkDouble', label: 'Delivered'},
  read: {icon: 'checkDouble', label: 'Read'},
  error: {icon: 'error', label: 'Failed'},
};

const pulseKeyframes = stylex.keyframes({
  '0%, 100%': {opacity: 1},
  '50%': {opacity: 0.5},
});

const styles = stylex.create({
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginBlockStart: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
  },
  metaUser: {
    flexDirection: 'row-reverse',
  },
  metaAssistant: {
    flexDirection: 'row',
  },
  statusRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  statusError: {
    color: colorVars['--color-error'],
  },
  statusPulse: {
    animationName: pulseKeyframes,
    animationDuration: '1.5s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
});

export interface ChatMessageMetadataProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Timestamp content — ReactNode (e.g. Timestamp) or string. */
  timestamp?: ReactNode;
  /** Footer content — model info, ratings, reactions. */
  footer?: ReactNode;
  /** Message delivery status. */
  status?: ChatMessageStatus;
}

/**
 * Composable metadata row for chat messages.
 *
 * Renders: timestamp · footer · status
 * Renders nothing if all props are null/undefined.
 *
 * @example
 * ```
 * <ChatMessage sender="user">
 *   <ChatMessageBubble>Hello!</ChatMessageBubble>
 *   <ChatMessageMetadata timestamp={<Timestamp value="..." format="time" />} status="read" />
 * </ChatMessage>
 * ```
 */
export function ChatMessageMetadata({
  ref,
  timestamp,
  footer,
  status,
  xstyle,
  className,
  style,
  ...rest
}: ChatMessageMetadataProps) {
  const msgContext = useChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';

  const statusConfig = status != null ? STATUS_CONFIG[status] : null;

  const hasContent =
    timestamp != null || footer != null || statusConfig != null;
  if (!hasContent) {
    return null;
  }

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('chat-message-metadata'),
        stylex.props(
          styles.meta,
          sender === 'user' ? styles.metaUser : styles.metaAssistant,
          xstyle,
        ),
        className,
        style,
      )}
      {...rest}>
      {timestamp != null && <span>{timestamp}</span>}
      {timestamp != null && (footer != null || statusConfig != null) && (
        <span>·</span>
      )}
      {footer != null && footer}
      {footer != null && statusConfig != null && <span>·</span>}
      {statusConfig != null && (
        <span
          title={statusConfig.label}
          aria-label={'Message ' + statusConfig.label.toLowerCase()}
          {...stylex.props(
            styles.statusRow,
            status === 'error' && styles.statusError,
            status === 'sending' && styles.statusPulse,
          )}>
          <Icon icon={statusConfig.icon} size="xsm" color="inherit" />
          <span>{statusConfig.label}</span>
        </span>
      )}
    </div>
  );
}

ChatMessageMetadata.displayName = 'ChatMessageMetadata';
