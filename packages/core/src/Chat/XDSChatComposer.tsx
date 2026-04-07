'use client';

/**
 * @file XDSChatComposer.tsx
 * @input Uses React, StyleX, XDSBaseProps
 * @output Exports XDSChatComposer layout shell component
 * @position Core implementation; consumed by index.ts
 *
 * Layout shell for a chat composer. Arranges slots (attachments, toolbar,
 * input, footer actions, send button, status) in a vertical stack with
 * page-radius container, hover/focus shadows, and scoped pill-radius
 * override for child elements.
 */

import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
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
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export type XDSChatComposerStatus = {
  type: 'error' | 'warning';
  message?: string;
};

export type XDSChatComposerDensity = 'compact' | 'balanced' | 'spacious';

export interface XDSChatComposerProps
  extends Omit<XDSBaseProps<HTMLDivElement>, 'onChange' | 'onSubmit'> {
  /** Called when the user submits the message */
  onSubmit: (value: string) => void;
  /** Called when the user clicks stop during streaming */
  onStop?: () => void;
  /** Whether the assistant is currently streaming a response */
  isStreaming?: boolean;
  /** Controlled value of the input */
  value?: string;
  /** Called when the input value changes */
  onChange?: (value: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the composer is disabled */
  isDisabled?: boolean;
  /** Density variant */
  density?: XDSChatComposerDensity;

  // --- Slot props ---

  /** Attachment chips rendered above the input */
  attachments?: ReactNode;
  /** Toolbar rendered between attachments and input (e.g. context chips) */
  contextToolbar?: ReactNode;
  /** Custom input element — replaces the default textarea */
  input?: ReactNode;
  /** Actions rendered on the left side of the footer */
  footerActions?: ReactNode;
  /** Actions rendered to the left of the send button */
  sendActions?: ReactNode;
  /** Custom send button — replaces the default */
  sendButton?: ReactNode;
  /** Status message rendered below the footer */
  status?: XDSChatComposerStatus;
  /** Where to render the status. @default 'top' */
  statusPosition?: 'top' | 'bottom';
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: radiusVars['--radius-page'],
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: {
      default: shadowVars['--shadow-low'],
      ':hover': { '@media (hover: hover)': shadowVars['--shadow-med'] },
    },
    transition: `box-shadow ${durationVars['--duration-fast']} ${easeVars['--ease-standard']}`,
    // Scoped radius override: child buttons/tokens get pill shape
    [radiusVars['--radius-element'] as string]: radiusVars['--radius-full'],
    [radiusVars['--radius-container'] as string]: radiusVars['--radius-full'],
  },
  rootFocused: {
    boxShadow: shadowVars['--shadow-med'],
  },
  rootDisabled: {
    opacity: 0.6,
    pointerEvents: 'none' as const,
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacingVars['--spacing-3'],
    gap: spacingVars['--spacing-2'],
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '40px',
  },
  textarea: {
    all: 'unset',
    width: '100%',
    resize: 'none' as const,
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
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
  sendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: radiusVars['--radius-full'],
    border: 'none',
    cursor: 'pointer',
    transition: `opacity ${durationVars['--duration-fast']} ${easeVars['--ease-standard']}`,
    flexShrink: 0,
  },
  sendButtonSend: {
    backgroundColor: colorVars['--color-accent'],
    color: 'white',
  },
  sendButtonStop: {
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-primary'],
  },
  sendButtonDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
  },
  statusError: {
    color: colorVars['--color-error'],
  },
  statusWarning: {
    color: colorVars['--color-warning'],
  },
  compact: {
    padding: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Icons
// =============================================================================

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 3L8 13M8 3L4 7M8 3L12 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export function XDSChatComposer(props: XDSChatComposerProps) {
  const {
    onSubmit,
    onStop,
    isStreaming = false,
    value: controlledValue,
    onChange,
    placeholder = 'Type a message\u2026',
    isDisabled = false,
    density = 'balanced',
    attachments,
    contextToolbar,
    input,
    footerActions,
    sendActions,
    sendButton,
    status,
    statusPosition = 'top',
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!trimmed || isDisabled) return;
    onSubmit(trimmed);
    updateValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [currentValue, isDisabled, onSubmit, updateValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const el = e.target;
      updateValue(el.value);
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    },
    [updateValue],
  );

  const canSend = currentValue.trim().length > 0 && !isDisabled;

  const defaultSendButton = (
    <button
      type="button"
      aria-label={isStreaming ? 'Stop' : 'Send'}
      onClick={isStreaming ? onStop : handleSubmit}
      disabled={!isStreaming && !canSend}
      {...stylex.props(
        styles.sendButton,
        isStreaming ? styles.sendButtonStop : styles.sendButtonSend,
        !isStreaming && !canSend && styles.sendButtonDisabled,
      )}
    >
      {isStreaming ? <StopIcon /> : <SendIcon />}
    </button>
  );

  const statusEl = status ? (
    <div
      role={status.type === 'error' ? 'alert' : 'status'}
      {...stylex.props(
        styles.statusBar,
        status.type === 'error' && styles.statusError,
        status.type === 'warning' && styles.statusWarning,
      )}
    >
      {status.message}
    </div>
  ) : null;

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-composer', {density}),
        stylex.props(
          styles.root,
          isFocused && styles.rootFocused,
          isDisabled && styles.rootDisabled,
          xstyle,
        ),
        className,
        style,
      )}
      {...rest}
    >
      {statusPosition === 'top' && statusEl}
      <div
        {...stylex.props(
          styles.inner,
          density === 'compact' && styles.compact,
        )}
      >
        {attachments}

        {contextToolbar}

        <div {...stylex.props(styles.inputArea)}>
          {input ?? (
            <textarea
              ref={textareaRef}
              rows={1}
              value={currentValue}
              placeholder={placeholder}
              disabled={isDisabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              onChange={handleInput}
              {...stylex.props(styles.textarea)}
            />
          )}
        </div>

        <div {...stylex.props(styles.footer)}>
          <div {...stylex.props(styles.footerLeft)}>
            {footerActions}
          </div>
          <div {...stylex.props(styles.footerRight)}>
            {sendActions}
            {sendButton ?? defaultSendButton}
          </div>
        </div>
      </div>

      {statusPosition === 'bottom' && statusEl}
    </div>
  );
}

XDSChatComposer.displayName = 'XDSChatComposer';
