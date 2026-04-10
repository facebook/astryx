'use client';

/**
 * @file XDSChatComposer.tsx
 * @input Uses React, StyleX, XDSBaseProps
 * @output Exports XDSChatComposer layout shell component
 * @position Core implementation; consumed by index.ts
 *
 * Layout shell for a chat composer. Arranges slots (attachments, header,
 * input, footer actions, send button, status) in a vertical stack with
 * page-radius container, hover/focus shadows, and concentric inner radius.
 *
 * Component CSS vars (themeable via defineTheme):
 * - `--composer-radius` (default: --radius-page) — outer border radius
 * - `--composer-padding` (default: --spacing-3) — body padding
 * - Inner element radius = calc(--composer-radius - --composer-padding)
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/Chat.doc.mjs
 * - /packages/core/src/Chat/README.md
 * - /apps/storybook/stories/ChatComposer.stories.tsx
 */

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
  type MouseEvent,
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
import {XDSIcon} from '../Icon';
import {XDSChatComposerInput} from './XDSChatComposerInput';
import {XDSChatComposerContext} from './XDSChatContext';

// =============================================================================
// Types
// =============================================================================

export type XDSChatComposerStatus = {
  type: 'error' | 'warning';
  message?: string;
};

export type XDSChatComposerDensity = 'compact' | 'balanced' | 'spacious';

export interface XDSChatComposerProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange' | 'onSubmit'
> {
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
  /** Actions rendered on the left side of the header (e.g. attach, mention buttons). Use icon-only `size="sm"` buttons. */
  headerActions?: ReactNode;
  /** Contextual info rendered on the right side of the header (e.g. context window usage, XDSProgressBar). */
  headerContext?: ReactNode;
  /** Custom input element — replaces the default textarea */
  input?: ReactNode;
  /** Actions rendered on the left side of the footer. Use `size="md"` buttons to match the send button height. */
  footerActions?: ReactNode;
  /** Actions rendered to the left of the send button. Use `size="md"` buttons to match the send button height. */
  sendActions?: ReactNode;
  /** Custom send button — replaces the default */
  sendButton?: ReactNode;
  /** Status message rendered below the footer */
  status?: XDSChatComposerStatus;
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
    '--composer-radius': radiusVars['--radius-page'],
    '--composer-padding': spacingVars['--spacing-3'],
    // Concentric radius: buttons follow the outer shell's curvature.
    // Sets --button-radius (not --radius-element) so only buttons are
    // affected — other components in slots keep their own radius.
    // Default: 28px - 12px = 16px (fully rounds a 32px button).
    '--button-radius': `max(${radiusVars['--radius-element']}, calc(var(--composer-radius) - var(--composer-padding)))`,
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
    padding: 'var(--composer-padding)',
    gap: spacingVars['--spacing-2'],
    borderRadius: 'var(--composer-radius)',
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
  sendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--button-radius, var(--radius-full))',
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
    paddingBlockStart: 'var(--composer-padding)',
    paddingBlockEnd: 'calc(var(--composer-padding) + var(--composer-radius))',
    marginBlockEnd: 'calc(-1 * var(--composer-radius))',
    borderTopLeftRadius: 'var(--composer-radius)',
    borderTopRightRadius: 'var(--composer-radius)',
  },
  statusBottom: {
    paddingBlockStart: 'calc(var(--composer-padding) + var(--composer-radius))',
    paddingBlockEnd: 'var(--composer-padding)',
    marginBlockStart: 'calc(-1 * var(--composer-radius))',
    borderBottomLeftRadius: 'var(--composer-radius)',
    borderBottomRightRadius: 'var(--composer-radius)',
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
    if (!trimmed || isDisabled) return;
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
        'button, a, [role="button"], [contenteditable="true"], [data-xds-token]',
      )
    ) {
      return;
    }
    const editable = bodyRef.current?.querySelector<HTMLElement>(
      '[contenteditable="true"], textarea',
    );
    editable?.focus();
  }, []);

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
      )}>
      {isStreaming ? <StopIcon /> : <SendIcon />}
    </button>
  );

  const statusEl = status ? (
    <div
      role={status.type === 'error' ? 'alert' : 'status'}
      {...stylex.props(
        styles.statusBar,
        statusPosition === 'top' ? styles.statusTop : styles.statusBottom,
        status.type === 'error' && styles.statusError,
        status.type === 'warning' && styles.statusWarning,
      )}>
      <XDSIcon
        icon={status.type === 'error' ? 'xCircle' : 'warning'}
        size="md"
        color={status.type === 'error' ? 'negative' : 'warning'}
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
    }),
    [currentValue, updateValue, handleSubmit, placeholder, isDisabled],
  );

  return (
    <XDSChatComposerContext.Provider value={composerContext}>
      <div
        {...mergeProps(
          xdsClassName('chat-composer', {density}),
          stylex.props(styles.root, isDisabled && styles.rootDisabled, xstyle),
          className,
          style,
        )}
        {...rest}>
        {statusPosition === 'top' && statusEl}
        {attachments}

        <div
          ref={bodyRef}
          onClick={handleBodyClick}
          {...stylex.props(
            styles.body,
            density === 'compact' && styles.compact,
          )}>
          {(headerActions || headerContext) && (
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerLeft)}>{headerActions}</div>
              <div {...stylex.props(styles.headerRight)}>{headerContext}</div>
            </div>
          )}

          <div {...stylex.props(styles.inputArea)}>
            {input ?? <XDSChatComposerInput />}
          </div>

          <div {...stylex.props(styles.footer)}>
            <div {...stylex.props(styles.footerLeft)}>{footerActions}</div>
            <div {...stylex.props(styles.footerRight)}>
              {sendActions}
              {sendButton ?? defaultSendButton}
            </div>
          </div>
        </div>

        {statusPosition === 'bottom' && statusEl}
      </div>
    </XDSChatComposerContext.Provider>
  );
}

XDSChatComposer.displayName = 'XDSChatComposer';
