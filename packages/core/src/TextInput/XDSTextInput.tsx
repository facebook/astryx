/**
 * @file XDSTextInput.tsx
 * @input Uses React, useId, ChangeEvent, XDSField, XDSIcon
 * @output Exports XDSTextInput component, XDSTextInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTextInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/TextInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/TextInput/XDSTextInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TextInput.stories.tsx (storybook stories)
 */

'use client';

import {
  useId,
  useOptimistic,
  useTransition,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {
  XDSField,
  type XDSInputStatus,
  type XDSInputStatusType,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {XDSIcon, type XDSIconType} from '../Icon';
import {XDSSpinner} from '../Spinner';

const STATUS_ICON_MAP: Record<XDSInputStatusType, XDSIconName> = {
  warning: 'warning',
  error: 'xCircle',
  success: 'checkCircle',
};

const STATUS_ICON_COLOR_MAP: Record<
  XDSInputStatusType,
  'warning' | 'negative' | 'positive'
> = {
  warning: 'warning',
  error: 'negative',
  success: 'positive',
};

const styles = stylex.create({
  wrapper: {
    zIndex: 1,
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
  },
});

export type XDSTextInputSize = keyof typeof sizeStyles;

// Re-export shared types for convenience

export type {
  XDSInputStatus as XDSTextInputStatus,
  XDSInputStatusType as XDSTextInputStatusType,
} from '../Field';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

export interface XDSTextInputProps extends Omit<
  XDSBaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the `<input>` element (not the root wrapper div). */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the input (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and input.
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
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Icon to display at the start of the input.
   * Pass an SVG icon component (e.g. from heroicons, lucide, etc.).
   */
  startIcon?: XDSIconType;
  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the input.
   */
  status?: XDSInputStatus;
  /**
   * The size of the input.
   * - 'sm': Compact size (28px height)
   * - 'md': Default size (32px height)
   * - 'lg': Large size (36px height)
   * @default 'md'
   */
  size?: XDSTextInputSize;
  /**
   * Callback fired when the input value changes.
   */
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Async action fired after onChange. Only fires if `onChange` did not call
   * `e.preventDefault()` — this lets onChange suppress the async action
   * (e.g. to skip server validation for locally-invalid input).
   */
  onChangeAction?: (
    value: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /** Whether the input is in a loading state. @default false */
  isLoading?: boolean;
  /**
   * The current value of the input.
   */
  value: string;
  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Whether to automatically focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * The HTML name attribute for the input.
   * Useful for form submissions.
   */
  htmlName?: string;
  /**
   * The HTML autocomplete attribute for the input.
   */
  autoComplete?: string;
  /**
   * Callback fired when the input receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the input loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the user presses the Enter key.
   */
  onEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * A text input component for collecting user input.
 *
 * @example
 * ```
 * <XDSTextInput label="Name" value={name} onChange={(val) => setName(val)} />
 * <XDSTextInput label="Search" isLabelHidden value={query} onChange={(val) => setQuery(val)} />
 * ```
 */
export function XDSTextInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  startIcon,
  status,
  size = 'md',
  onChange,
  onChangeAction,
  isLoading = false,
  value,
  placeholder,
  labelTooltip,
  hasAutoFocus = false,
  htmlName,
  autoComplete,
  onFocus,
  onBlur,
  onEnter,
  xstyle,
  className,
  style,
  ref,
}: XDSTextInputProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const effectiveRequired = isRequired && !isOptional;

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue, e);
    if (onChangeAction && !e.defaultPrevented) {
      startTransition(async () => {
        setOptimisticValue(newValue);
        await onChangeAction(newValue, e);
      });
    }
  };

  const handleKeyDown = onEnter
    ? (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          onEnter(e);
        }
      }
    : undefined;

  const effectiveDisabled = isDisabled;
  const effectiveReadOnly = !isDisabled && isBusy;

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
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
        {...mergeProps(
          xdsClassName('text-input', {size}),
          stylex.props(
            inputWrapperStyles.base,
            styles.wrapper,
            sizeStyles[size],
            (effectiveDisabled || effectiveReadOnly) && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        {startIcon && <XDSIcon icon={startIcon} size="sm" color="primary" />}
        <input
          ref={ref}
          id={id}
          name={htmlName}
          type="text"
          value={String(optimisticValue)}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={effectiveDisabled}
          readOnly={effectiveReadOnly}
          autoFocus={hasAutoFocus}
          autoComplete={autoComplete}
          aria-describedby={ariaDescribedBy}
          aria-required={effectiveRequired ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-disabled={effectiveReadOnly ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          {...stylex.props(
            styles.input,
            (effectiveDisabled || effectiveReadOnly) && styles.inputDisabled,
          )}
        />
        {isBusy && <XDSSpinner size="sm" />}
        {!isBusy && status && (
          <XDSIcon
            icon={STATUS_ICON_MAP[status.type]}
            size="md"
            color={STATUS_ICON_COLOR_MAP[status.type]}
          />
        )}
      </div>
    </XDSField>
  );
}

XDSTextInput.displayName = 'XDSTextInput';
