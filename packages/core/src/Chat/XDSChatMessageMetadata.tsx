// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSChatMessageMetadata.tsx
 * @input Uses React, StyleX, XDSChatContext, XDSIcon, theme tokens
 * @output Exports XDSChatMessageMetadata component
 * @position Shared metadata row used by composing inside XDSChatMessage
 *
 * Renders: <timestamp> · <footer> · <status>
 * Direction reverses for user sender.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {useXDSChatMessageContext} from './XDSChatContext';
import {XDSIcon} from '../Icon';
import type {XDSIconName} from '../Icon/globalIconRegistry';
import {mergeProps, xdsClassName} from '../utils';

export type XDSChatMessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'error';

const STATUS_CONFIG: Record<
  XDSChatMessageStatus,
  {icon: XDSIconName; label: string}
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

export interface XDSChatMessageMetadataProps {
  /** Timestamp content — ReactNode (e.g. XDSTimestamp) or string. */
  timestamp?: ReactNode;
  /** Footer content — model info, ratings, reactions. */
  footer?: ReactNode;
  /** Message delivery status. */
  status?: XDSChatMessageStatus;
}

/**
 * Composable metadata row for chat messages.
 *
 * Renders: timestamp · footer · status
 * Renders nothing if all props are null/undefined.
 *
 * @example
 * ```
 * <XDSChatMessage sender="user">
 *   <XDSChatMessageBubble>Hello!</XDSChatMessageBubble>
 *   <XDSChatMessageMetadata timestamp={<XDSTimestamp value="..." format="time" />} status="read" />
 * </XDSChatMessage>
 * ```
 */
export function XDSChatMessageMetadata({
  timestamp,
  footer,
  status,
}: XDSChatMessageMetadataProps) {
  const msgContext = useXDSChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';

  const statusConfig = status != null ? STATUS_CONFIG[status] : null;

  const hasContent =
    timestamp != null || footer != null || statusConfig != null;
  if (!hasContent) return null;

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-message-metadata'),
        stylex.props(
          styles.meta,
          sender === 'user' ? styles.metaUser : styles.metaAssistant,
        ),
      )}>
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
          <XDSIcon icon={statusConfig.icon} size="xsm" color="inherit" />
          <span>{statusConfig.label}</span>
        </span>
      )}
    </div>
  );
}

XDSChatMessageMetadata.displayName = 'XDSChatMessageMetadata';
