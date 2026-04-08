'use client';

/**
 * @file XDSChatSystemMessage.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatSystemMessage component and XDSChatSystemMessageProps
 * @position Centered system/notice message in a chat thread
 *
 * Renders centered, muted system messages like "conversation started",
 * date separators, or status updates. Not a sender message — no avatar,
 * no bubble, no alignment. Think of it as the chat equivalent of a banner
 * or status line.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSDivider} from '../Divider';

export type XDSChatSystemMessageVariant = 'default' | 'divider';

export interface XDSChatSystemMessageProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * System message content — text or any ReactNode.
   */
  children: ReactNode;

  /**
   * Visual variant.
   * - 'default': plain centered text
   * - 'divider': text with horizontal lines on each side (date separator style)
   * @default 'default'
   */
  variant?: XDSChatSystemMessageVariant;

  /**
   * Optional icon rendered before the text.
   * Accepts any ReactNode — typically an XDSIcon.
   */
  icon?: ReactNode;

  /**
   * Timestamp displayed after the text.
   */
  timestamp?: Date | string;

  /** StyleX overrides. */
  xstyle?: StyleXStyles;
  /** CSS class name(s). */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
  /** Test ID. */
  'data-testid'?: string;
}

function formatTimestamp(ts: Date | string): string {
  if (typeof ts === 'string') return ts;
  return ts.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center',
    userSelect: 'none',
  },
  dividerWrap: {
    width: '100%',
  },
  // Icon
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  // Timestamp
  timestamp: {
    fontSize: typeScaleVars['--text-heading-6-size'],
    color: colorVars['--color-text-disabled'],
    whiteSpace: 'nowrap',
  },
  // Content wrapper (to keep text + icon + timestamp together)
  content: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1-5'],
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Centered system message for chat threads.
 *
 * Use for non-sender content: date separators, "conversation started",
 * "user joined", status changes. Supports a divider variant with horizontal
 * lines on each side of the text.
 *
 * @example
 * ```
 * <XDSChatSystemMessage>Conversation started</XDSChatSystemMessage>
 * <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>
 * <XDSChatSystemMessage variant="divider" timestamp={new Date()}>
 *   March 15, 2026
 * </XDSChatSystemMessage>
 * ```
 */
export function XDSChatSystemMessage({
  children,
  variant = 'default',
  icon,
  timestamp,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: XDSChatSystemMessageProps) {
  const formattedTimestamp =
    timestamp != null ? formatTimestamp(timestamp) : null;

  if (variant === 'divider') {
    return (
      <div
        ref={ref}
        role="status"
        data-testid={testId}
        {...mergeProps(
          xdsClassName('chat-system-message', {variant}),
          stylex.props(styles.dividerWrap, xstyle),
          className,
          styleProp,
        )}>
        <XDSDivider label={children} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="status"
      data-testid={testId}
      {...mergeProps(
        xdsClassName('chat-system-message', {variant}),
        stylex.props(styles.root, xstyle),
        className,
        styleProp,
      )}>
      <span {...stylex.props(styles.content)}>
        {icon != null && <span {...stylex.props(styles.icon)}>{icon}</span>}
        {children}
        {formattedTimestamp != null && (
          <span {...stylex.props(styles.timestamp)}>{formattedTimestamp}</span>
        )}
      </span>
    </div>
  );
}

XDSChatSystemMessage.displayName = 'XDSChatSystemMessage';
