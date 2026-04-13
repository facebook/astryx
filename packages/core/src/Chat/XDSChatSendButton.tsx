'use client';

/**
 * @file XDSChatSendButton.tsx
 * @input Uses XDSButton, XDSChatComposerContext, icon registry
 * @output Exports XDSChatSendButton — a circular send/stop toggle button
 * @position Standalone component; default send button for XDSChatComposer
 *
 * Reads composer state from XDSChatComposerContext by default so it "just
 * works" inside XDSChatComposer. All context-derived values can be
 * overridden via props for standalone usage.
 *
 * States:
 * - **Send** — accent/primary, arrowUp icon, disabled when nothing to send.
 * - **Stop** — neutral/secondary, stop icon, calls onStop.
 */

import type {ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {getIcon} from '../Icon/globalIconRegistry';
import {useXDSChatComposerContext} from './XDSChatContext';
import {xdsClassName} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatSendButtonProps {
  /** Whether the assistant is currently streaming a response. */
  isStreaming?: boolean;
  /** Whether the send button is disabled. Defaults to `!canSend` from context. */
  isDisabled?: boolean;
  /** Called when the user clicks the send button. Defaults to context onSubmit. */
  onSend?: () => void;
  /** Called when the user clicks the stop button during streaming. */
  onStop?: () => void;
  /** Icon for the send state. Resolves from icon registry by default. */
  sendIcon?: ReactNode;
  /** Icon for the stop/streaming state. Resolves from icon registry by default. */
  stopIcon?: ReactNode;
  /** Button size. @default 'md' */
  size?: 'sm' | 'md';
  /** Additional StyleX styles. */
  xstyle?: StyleXStyles;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    borderRadius: 'var(--button-radius, var(--radius-full))',
    flexShrink: 0,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Circular send/stop toggle button for the chat composer.
 *
 * Reads state from XDSChatComposerContext by default. Override any value
 * via props for standalone usage.
 *
 * @example
 * ```
 * <XDSChatComposer onSubmit={handleSubmit} sendButton={<XDSChatSendButton />} />
 * ```
 */
export function XDSChatSendButton(props: XDSChatSendButtonProps): ReactNode {
  const context = useXDSChatComposerContext();

  const {
    isStreaming = context?.isStreaming ?? false,
    isDisabled = !(context?.canSend ?? false),
    onSend,
    onStop = context?.onStop,
    sendIcon,
    stopIcon,
    size = 'md',
    xstyle,
  } = props;

  const handleSend = onSend ?? (() => context?.onSubmit(''));

  return (
    <XDSButton
      label={isStreaming ? 'Stop' : 'Send'}
      variant={isStreaming ? 'secondary' : 'primary'}
      size={size}
      icon={
        isStreaming
          ? (stopIcon ?? getIcon('stop'))
          : (sendIcon ?? getIcon('arrowUp'))
      }
      isIconOnly
      isDisabled={!isStreaming && isDisabled}
      onClick={isStreaming ? onStop : handleSend}
      className={xdsClassName('chat-send-button')}
      xstyle={[styles.root, xstyle]}
    />
  );
}

XDSChatSendButton.displayName = 'XDSChatSendButton';
