// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatComposer.tsx
 * @input Uses React, StyleX, BaseProps
 * @output Exports ChatComposer layout shell component
 * @position Core implementation; consumed by index.ts
 *
 * Layout shell for a chat composer. Arranges slots (drawer, header,
 * input, footer actions, send button, status) in a vertical stack with
 * page-radius container, hover/focus shadows, and concentric inner radius.
 *
 * Component CSS vars (themeable via defineTheme):
 * - `--_chat-composer-radius` (default: --radius-chat) — outer border radius
 * - `--_chat-composer-padding` (default: --spacing-3) — body padding
 * - Inner element radius = calc(--_chat-composer-radius - --_chat-composer-padding)
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/Chat.doc.mjs
 * - /apps/storybook/stories/ChatComposer.stories.tsx
 * - /packages/cli/templates/blocks/components/ChatComposer/ (block examples)
 */

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
  type MouseEvent,
} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
  durationVars,
  easeVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {Icon} from '../Icon';
import {ChatComposerInput} from './ChatComposerInput';
import {ChatComposerContext} from './ChatContext';
import {ChatSendButton} from './ChatSendButton';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export type ChatComposerStatus = {
  type: 'error' | 'warning';
  message?: string;
};

export type ChatComposerDensity = 'compact' | 'balanced' | 'spacious';

export interface ChatComposerProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange' | 'onSubmit'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Called when the user submits the message */
  onSubmit: (value: string) => void;
  /** Called when the user clicks the stop button */
  onStop?: () => void;
  /** Whether the stop button is shown instead of the send button. @default false */
  isStopShown?: boolean;
  /** Controlled value of the input */
  value?: string;
  /** Called when the input value changes */
  onChange?: (value: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the composer is disabled */
  isDisabled?: boolean;
  /** Density variant */
  density?: ChatComposerDensity;

  // --- Slot props ---

  /** Collapsible drawer rendered above the input — attachments, context chips, etc. Use ChatComposerDrawer. */
  drawer?: ReactNode;
  /** Actions rendered on the left side of the header (e.g. attach, mention buttons). Use icon-only `size="sm"` buttons. */
  headerActions?: ReactNode;
  /** Contextual info rendered on the right side of the header (e.g. context window usage, ProgressBar). */
  headerContext?: ReactNode;
  /** Custom input element — replaces the default textarea */
  input?: ReactNode;
  /** Actions rendered on the left side of the footer. Use `size="md"` buttons to match the send button height. */
  footerActions?: ReactNode;
  /** Actions rendered to the left of the send button. Use `size="md"` buttons to match the send button height. */
  sendActions?: ReactNode;
  /** Custom send button — replaces the default */
  sendButton?: ReactNode;
  /** Status message rendered below (or above) the composer body */
  status?: ChatComposerStatus;
  /** Where to render the status. @default 'bottom' */
  statusPosition?: 'top' | 'bottom';
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
    zIndex: 0,
    isolation: 'isolate',
    display: 'flex',
    flexDirection: 'column',
    // Component CSS vars — themeable via defineTheme({ components: { 'chat-composer': { base: {...} } } })
    // Uses the dedicated chat radius (28px) rather than --radius-page, so chat
    // rounding is decoupled from page-level containers but unchanged today. #2072
    '--_chat-composer-radius': radiusVars['--radius-chat'],
    '--_chat-composer-padding': spacingVars['--spacing-3'],
    // Concentric radius: buttons follow the outer shell's curvature.
    // Sets --_button-radius (not --radius-element) so only buttons are
    // affected — other components in slots keep their own radius.
    // Default: 28px - 12px = 16px (fully rounds a 32px button).
    '--_button-radius': `max(${radiusVars['--radius-element']}, calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))`,
  },

  rootDisabled: {
    opacity: 0.6,
    pointerEvents: 'none' as const,
  },
  body: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--_chat-composer-padding)',
    gap: spacingVars['--spacing-2'],
    borderRadius: 'var(--_chat-composer-radius)',
    backgroundColor: colorVars['--color-background-popover'],
    cursor: 'text',
    boxShadow: {
      default: shadowVars['--shadow-low'],
      ':hover': {'@media (hover: hover)': shadowVars['--shadow-med']},
    },
    transition: `box-shadow ${durationVars['--duration-fast']} ${easeVars['--ease-standard']}`,
    ':focus-within': {
      boxShadow: shadowVars['--shadow-med'],
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    minHeight: '28px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    marginInlineStart: 'auto',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    all: 'unset',
    width: '100%',
    resize: 'none' as const,
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    caretColor: colorVars['--color-accent'],
    overflowY: 'auto' as const,
    maxHeight: '176px',
    '::placeholder': {
      color: colorVars['--color-text-disabled'],
    },
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    // Footer buttons should use size="md" to match 32px send button height
    minHeight: '32px',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  statusBar: {
    position: 'relative',
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
  },
  statusTop: {
    paddingBlockStart: 'var(--_chat-composer-padding)',
    paddingBlockEnd:
      'calc(var(--_chat-composer-padding) + var(--_chat-composer-radius))',
    marginBlockEnd: 'calc(-1 * var(--_chat-composer-radius))',
    borderTopLeftRadius: 'var(--_chat-composer-radius)',
    borderTopRightRadius: 'var(--_chat-composer-radius)',
  },
  statusBottom: {
    paddingBlockStart:
      'calc(var(--_chat-composer-padding) + var(--_chat-composer-radius))',
    paddingBlockEnd: 'var(--_chat-composer-padding)',
    marginBlockStart: 'calc(-1 * var(--_chat-composer-radius))',
    borderBottomLeftRadius: 'var(--_chat-composer-radius)',
    borderBottomRightRadius: 'var(--_chat-composer-radius)',
  },
  statusError: {
    backgroundColor: colorVars['--color-error-muted'],
    color: colorVars['--color-text-red'],
  },
  statusWarning: {
    backgroundColor: colorVars['--color-warning-muted'],
    color: colorVars['--color-text-yellow'],
  },
  compact: {
    padding: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Layout shell for a chat composer with slots for drawer, input,
 * actions, and a send button.
 *
 * @example
 * ```
 * <ChatComposer
 *   onSubmit={(value) => console.log(value)}
 *   placeholder="Type a message..."
 * />
 * ```
 */
export function ChatComposer(props: ChatComposerProps) {
  const {
    ref,
    onSubmit,
    onStop,
    isStopShown = false,
    value: controlledValue,
    onChange,
    placeholder = 'Type a message\u2026',
    isDisabled = false,
    density = 'balanced',
    drawer,
    headerActions,
    headerContext,
    input,
    footerActions,
    sendActions,
    sendButton,
    status,
    statusPosition = 'bottom',
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const [internalValue, setInternalValue] = useState('');

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const updateValue = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const handleSubmit = useCallback(() => {
    const trimmed = currentValue.trim();
    if (!trimmed || isDisabled) {
      return;
    }
    onSubmit(trimmed);
    updateValue('');
  }, [currentValue, isDisabled, onSubmit, updateValue]);

  const canSend = currentValue.trim().length > 0 && !isDisabled;

  const bodyRef = useRef<HTMLDivElement>(null);

  const handleBodyClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // Focus the input when clicking empty space in the body.
    // Skip if the click target is a button, link, or interactive element.
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'button, a, [role="button"], [contenteditable="true"], [data-astryx-token]',
      )
    ) {
      return;
    }
    const editable = bodyRef.current?.querySelector<HTMLElement>(
      '[contenteditable="true"], textarea',
    );
    editable?.focus();
  }, []);

  const statusEl = status ? (
    <div
      role={status.type === 'error' ? 'alert' : 'status'}
      {...stylex.props(
        styles.statusBar,
        statusPosition === 'top' ? styles.statusTop : styles.statusBottom,
        status.type === 'error' && styles.statusError,
        status.type === 'warning' && styles.statusWarning,
      )}>
      <Icon
        icon={status.type === 'error' ? 'error' : 'warning'}
        size="md"
        color={status.type === 'error' ? 'error' : 'warning'}
      />
      {status.message}
    </div>
  ) : null;

  const composerContext = useMemo(
    () => ({
      value: currentValue,
      onChange: updateValue,
      onSubmit: handleSubmit,
      placeholder,
      isDisabled,
      isStopShown,
      canSend,
      onStop,
    }),
    [
      currentValue,
      updateValue,
      handleSubmit,
      placeholder,
      isDisabled,
      isStopShown,
      canSend,
      onStop,
    ],
  );

  return (
    <ChatComposerContext value={composerContext}>
      <div
        ref={ref}
        {...mergeProps(
          themeProps('chat-composer', {density}),
          stylex.props(styles.root, isDisabled && styles.rootDisabled),
          className,
          style,
        )}
        {...rest}>
        {statusPosition === 'top' && statusEl}
        {drawer}

        <div
          ref={bodyRef}
          onClick={handleBodyClick}
          {...stylex.props(
            styles.body,
            density === 'compact' && styles.compact,
            xstyle,
          )}>
          {(headerActions || headerContext) && (
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerLeft)}>{headerActions}</div>
              <div {...stylex.props(styles.headerRight)}>{headerContext}</div>
            </div>
          )}

          <div {...stylex.props(styles.inputArea)}>
            {input ?? <ChatComposerInput />}
          </div>

          <div {...stylex.props(styles.footer)}>
            <div {...stylex.props(styles.footerLeft)}>{footerActions}</div>
            <div {...stylex.props(styles.footerRight)}>
              {sendActions}
              {sendButton ?? <ChatSendButton />}
            </div>
          </div>
        </div>

        {statusPosition === 'bottom' && statusEl}
      </div>
    </ChatComposerContext>
  );
}

ChatComposer.displayName = 'ChatComposer';
