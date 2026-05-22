// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTextArea.tsx
 * @input Uses React, useId, ChangeEvent, ClipboardEvent, FocusEvent, XDSField, XDSIcon, XDSSpinner
 * @output Exports XDSTextArea component, XDSTextAreaProps, XDSTextAreaStatus, XDSTextAreaStatusType
 * @position Core implementation; consumed by index.ts, tested by XDSTextArea.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextArea/TextArea.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/TextArea/XDSTextArea.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextArea/index.ts (exports if types change)
 * - /apps/storybook/stories/TextArea.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/TextArea/ (showcase blocks)
 */

import {
  useId,
  useOptimistic,
  useTransition,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {
  XDSField,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {XDSIcon, renderIconSlot, type XDSIconType} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useInputContainer} from '../hooks/useInputContainer';

const COUNTER_WARNING_THRESHOLD = 0.8;

const styles = stylex.create({
  wrapper: {
    zIndex: 1,
    alignItems: 'flex-start',
    paddingBlock: spacingVars['--spacing-1'],
  },
  textarea: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
    resize: 'vertical',
  },
  textareaDisabled: {
    cursor: 'not-allowed',
  },
  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
  counterError: {
    color: colorVars['--color-error'],
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  statusIcon: {
    position: 'absolute',
    top: spacingVars['--spacing-2'],
    insetInlineEnd: spacingVars['--spacing-2'],
    pointerEvents: 'none',
    display: 'flex',
  },
  textareaWithStatus: {
    // Reserve space so text doesn't flow under the absolutely-positioned icon.
    // 20px (icon md) + 4px gap = 24px (--spacing-6)
    paddingInlineEnd: spacingVars['--spacing-6'],
  },
});

export type XDSTextAreaStatusType = 'warning' | 'error' | 'success';

export interface XDSTextAreaStatus {
  /**
   * The type of status to display.
   */
  type: XDSTextAreaStatusType;
  /**
   * Optional message to display below the textarea.
   */
  message?: string;
}

export interface XDSTextAreaProps extends Omit<
  XDSBaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLTextAreaElement>;
  /**
   * Label text for the textarea (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and textarea.
   */
  description?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Callback fired when the textarea value changes.
   */
  onChange?: (value: string, e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Async action on change. Fires after onChange if not prevented. */
  changeAction?: (
    value: string,
    e: ChangeEvent<HTMLTextAreaElement>,
  ) => void | Promise<void>;
  /** Whether the input is in a loading state. @default false */
  isLoading?: boolean;
  /**
   * The current value of the textarea.
   */
  value: string;
  /**
   * Placeholder text shown when the textarea is empty.
   */
  placeholder?: string;
  /**
   * The number of visible text rows.
   * @default 3
   */
  rows?: number;
  /**
   * Whether the textarea is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Status indicator for the textarea.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the textarea.
   */
  status?: XDSTextAreaStatus;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Icon to display at the start of the textarea.
   * Accepts a ReactNode (e.g. `<XDSIcon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | XDSIconType;
  /**
   * Whether to enable browser spell checking.
   * @default true
   */
  hasSpellCheck?: boolean;
  /**
   * Callback fired when content is pasted into the textarea.
   */
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Maximum number of characters allowed.
   * When set, displays a character counter below the textarea.
   * Does not enforce the limit natively — the counter shows error styling
   * when exceeded, and the consumer can validate via onChange.
   */
  maxLength?: number;
  /**
   * Whether to automatically focus the textarea on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * The HTML name attribute for the textarea.
   * Useful for form submissions.
   */
  htmlName?: string;
  /**
   * Callback fired when the textarea receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  /**
   * Callback fired when the textarea loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
}

/**
 * A multi-line text input component for collecting longer user input.
 *
 * @example
 * ```
 * <XDSTextArea label="Description" value={description} onChange={setDescription} />
 * <XDSTextArea label="Notes" rows={5} value={notes} onChange={setNotes} />
 * ```
 */
export function XDSTextArea({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  onChange,
  changeAction,
  isLoading = false,
  value = '',
  placeholder,
  rows = 3,
  isDisabled = false,
  status,
  labelTooltip,
  startIcon,
  hasSpellCheck = true,
  onPaste,
  maxLength,
  hasAutoFocus = false,
  htmlName,
  onFocus,
  onBlur,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: XDSTextAreaProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const counterID = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const statusIconMap: Record<XDSTextAreaStatusType, XDSIconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const statusIconColorMap: Record<
    XDSTextAreaStatusType,
    'warning' | 'error' | 'success'
  > = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
      maxLength != null ? counterID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue, e);
    if (changeAction && !e.defaultPrevented) {
      startTransition(async () => {
        setOptimisticValue(newValue);
        await changeAction(newValue, e);
      });
    }
  };

  const effectivelyDisabled = isDisabled || isBusy;

  // Focus textarea when clicking anywhere on the wrapper (icons, padding, etc.)
  const {onClick: handleWrapperClick, onMouseUp: handleWrapperMouseUp} =
    useInputContainer({
      containerRef,
      inputRef: textareaRef,
      disabled: effectivelyDisabled,
    });

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}>
      <div
        ref={containerRef}
        onClick={handleWrapperClick}
        onMouseUp={handleWrapperMouseUp}
        {...mergeProps(
          xdsClassName('textarea', {status: status?.type ?? null}),
          stylex.props(
            inputWrapperStyles.base,
            styles.wrapper,
            effectivelyDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        {startIcon &&
          renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
        <textarea
          {...rest}
          ref={mergeRefs(ref, textareaRef)}
          id={id}
          name={htmlName}
          value={String(optimisticValue)}
          onChange={handleChange}
          onPaste={onPaste}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={isDisabled}
          spellCheck={hasSpellCheck}
          autoFocus={hasAutoFocus}
          data-autofocus={hasAutoFocus || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired && !isOptional ? 'true' : undefined}
          aria-invalid={
            status?.type === 'error' ||
            (maxLength != null && optimisticValue.length > maxLength)
              ? 'true'
              : undefined
          }
          aria-busy={isBusy || undefined}
          {...stylex.props(
            styles.textarea,
            effectivelyDisabled && styles.textareaDisabled,
            status && styles.textareaWithStatus,
          )}
        />
        {isBusy && <XDSSpinner size="sm" />}
        {status && (
          <span {...stylex.props(styles.statusIcon)}>
            <XDSIcon
              icon={statusIconMap[status.type]}
              size="md"
              color={statusIconColorMap[status.type]}
            />
          </span>
        )}
      </div>
      {maxLength != null && (
        <div
          id={counterID}
          {...stylex.props(
            styles.counter,
            optimisticValue.length > maxLength && styles.counterError,
          )}>
          {optimisticValue.length}/{maxLength}
          <span aria-live="polite" {...stylex.props(styles.srOnly)}>
            {optimisticValue.length >= maxLength * COUNTER_WARNING_THRESHOLD
              ? optimisticValue.length > maxLength
                ? `${optimisticValue.length - maxLength} characters over limit`
                : `${maxLength - optimisticValue.length} characters remaining`
              : ''}
          </span>
        </div>
      )}
    </XDSField>
  );
}

XDSTextArea.displayName = 'XDSTextArea';
