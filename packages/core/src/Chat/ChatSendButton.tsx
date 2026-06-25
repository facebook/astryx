// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatSendButton.tsx
 * @input Uses Button, ChatComposerContext, icon registry
 * @output Exports ChatSendButton — a circular send/stop toggle button
 * @position Standalone component; default send button for ChatComposer
 *
 * Reads composer state from ChatComposerContext by default so it "just
 * works" inside ChatComposer. All context-derived values can be
 * overridden via props for standalone usage.
 *
 * States:
 * - **Send** — accent/primary, arrowUp icon, disabled when nothing to send.
 * - **Stop** — neutral/secondary, stop icon, calls onStop.
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '../Button';
import {getIcon} from '../Icon/globalIconRegistry';
import {useChatComposerContext} from './ChatContext';

import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export interface ChatSendButtonProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Whether the stop button is shown instead of the send button. @default false */
  isStopShown?: boolean;
  /** Whether the send button is disabled. Defaults to `!canSend` from context. */
  isDisabled?: boolean;
  /** Called when the user clicks the send button. Defaults to context onSubmit. */
  onSend?: () => void;
  /** Called when the user clicks the stop button. */
  onStop?: () => void;
  /** Icon for the send state. Resolves from icon registry by default. */
  sendIcon?: ReactNode;
  /** Icon for the stop state. Resolves from icon registry by default. */
  stopIcon?: ReactNode;
  /** Button size. @default 'md' */
  size?: 'sm' | 'md';
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    borderRadius: 'var(--_button-radius, var(--radius-full))',
    flexShrink: 0,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Circular send/stop toggle button for the chat composer.
 *
 * Reads state from ChatComposerContext by default. Override any value
 * via props for standalone usage.
 *
 * @example
 * ```
 * <ChatComposer onSubmit={handleSubmit} sendButton={<ChatSendButton />} />
 * ```
 */
export function ChatSendButton(props: ChatSendButtonProps): ReactNode {
  const context = useChatComposerContext();

  const {
    isStopShown = context?.isStopShown ?? false,
    isDisabled = !(context?.canSend ?? false),
    onSend,
    onStop = context?.onStop,
    sendIcon,
    stopIcon,
    size = 'md',
    xstyle,
    ref,
  } = props;

  const handleSend = onSend ?? (() => context?.onSubmit(''));

  return (
    <Button
      ref={ref}
      label={isStopShown ? 'Stop' : 'Send'}
      variant={isStopShown ? 'secondary' : 'primary'}
      size={size}
      icon={
        isStopShown
          ? (stopIcon ?? getIcon('stop'))
          : (sendIcon ?? getIcon('arrowUp'))
      }
      isIconOnly
      isDisabled={!isStopShown && isDisabled}
      onClick={isStopShown ? onStop : handleSend}
      {...themeProps('chat-send-button')}
      xstyle={[styles.root, xstyle]}
    />
  );
}

ChatSendButton.displayName = 'ChatSendButton';
