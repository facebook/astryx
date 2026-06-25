// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TextInput.tsx
 * @input Uses React, useId, ChangeEvent, Field, Icon
 * @output Exports TextInput component, TextInputProps
 * @position Core implementation; consumed by index.ts, tested by TextInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/TextInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/TextInput/TextInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TextInput.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/TextInput/ (showcase blocks)
 */

import {
  useId,
  useOptimistic,
  useTransition,
  useCallback,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {IconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {
  Field,
  type InputStatus,
  type InputStatusType,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {Spinner} from '../Spinner';

const styles = stylex.create({
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    outline: {
      default: 'none',
      ':focus-visible': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 1,
  },
  input: {
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
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

export type TextInputSize = keyof typeof sizeStyles;

import {groupStyles} from '../InputGroup/groupStyles';

// Re-export shared types for convenience

export type {
  InputStatus as TextInputStatus,
  InputStatusType as TextInputStatusType,
} from '../Field';
import {mergeProps, mergeRefs} from '../utils';
import {useSize} from '../SizeContext/SizeContext';
import {useInputContainer} from '../hooks/useInputContainer';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

export type TextInputType = 'text' | 'password' | 'email';

export interface TextInputProps extends Omit<
  BaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * The HTML input type.
   * @default 'text'
   */
  type?: TextInputType;
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
   * Accepts a ReactNode (e.g. `<Icon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | IconType;
  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the input.
   */
  status?: InputStatus;
  /**
   * The size of the input.
   * - 'sm': Compact size (18px height)
   * - 'md': Default size (26px height)
   * @default 'md'
   */
  size?: TextInputSize;
  /**
   * Callback fired when the input value changes.
   */
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  /** Async action on change. Fires after onChange if not prevented. */
  changeAction?: (
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
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Whether to show a clear button when a value is set.
   * When clicked, resets the value to an empty string and returns focus to the input.
   * @default false
   */
  hasClear?: boolean;
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
   * Callback fired when the user presses the Enter key.
   */
  onEnter?: () => void;
  /**
   * Callback fired on keydown events on the input.
   */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * A text input component for collecting user input.
 *
 * @example
 * ```
 * <TextInput label="Name" value={name} onChange={setName} />
 * <TextInput label="Search" isLabelHidden value={query} onChange={setQuery} />
 * ```
 */
export function TextInput({
  type = 'text',
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  startIcon,
  status,
  size: sizeProp,
  onChange,
  changeAction,
  isLoading = false,
  value,
  placeholder,
  labelTooltip,
  hasClear = false,
  hasAutoFocus = false,
  htmlName,
  onEnter,
  onKeyDown,
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: TextInputProps) {
  const size = useSize(sizeProp, 'md');

  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputGroup = useInputGroup();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const statusIconMap: Record<InputStatusType, IconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const statusIconColorMap: Record<
    InputStatusType,
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
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue, e);
    if (changeAction && !e.defaultPrevented) {
      startTransition(async () => {
        setOptimisticValue(newValue);
        await changeAction(newValue, e);
      });
    }
  };

  // Handle clear button click
  const handleClear = useCallback(() => {
    onChange?.('', null as unknown as ChangeEvent<HTMLInputElement>);
    inputRef.current?.focus();
  }, [onChange]);

  // Focus input when clicking anywhere on the wrapper (icons, padding, etc.)
  const {onClick: handleWrapperClick, onMouseUp: handleWrapperMouseUp} =
    useInputContainer({
      containerRef,
      inputRef,
      disabled: isDisabled,
    });

  const inputWrapper = (
    <div
      ref={containerRef}
      onClick={handleWrapperClick}
      onMouseUp={handleWrapperMouseUp}
      {...mergeProps(
        themeProps('text-input', {size, status: status?.type ?? null}),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          isDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          inputGroup && groupStyles.inGroup,
          xstyle,
        ),
        className,
        style,
      )}>
      {startIcon && renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
      <input
        {...rest}
        ref={mergeRefs(ref, inputRef)}
        id={id}
        name={htmlName}
        type={type}
        value={optimisticValue}
        onChange={handleChange}
        onKeyDown={
          onEnter || onKeyDown
            ? e => {
                if (e.key === 'Enter') {
                  onEnter?.();
                }
                onKeyDown?.(e);
              }
            : undefined
        }
        placeholder={placeholder}
        disabled={isDisabled}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired === true ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-busy={isBusy || undefined}
        aria-label={inputGroup ? label : undefined}
        {...stylex.props(styles.input, isDisabled && styles.inputDisabled)}
      />
      {hasClear && value !== '' && !isDisabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Clear ${label}`}
          {...stylex.props(styles.clearButton)}>
          <Icon icon="close" size="sm" color="secondary" />
        </button>
      )}
      {isBusy && <Spinner size="sm" />}
      {status && !inputGroup && (
        <Icon
          icon={statusIconMap[status.type]}
          size="md"
          color={statusIconColorMap[status.type]}
        />
      )}
    </div>
  );

  if (inputGroup) {
    return inputWrapper;
  }

  return (
    <Field
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
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
    </Field>
  );
}

TextInput.displayName = 'TextInput';
