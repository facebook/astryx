/**
 * @file XDSTextInput.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSField, XDSIcon
 * @output Exports XDSTextInput component, XDSTextInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTextInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/TextInput/XDSTextInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TextInput.stories.tsx (storybook stories)
 */

import {forwardRef, useId, type ChangeEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {XDSField} from '../Field';
import {XDSIcon, type XDSIconType} from '../Icon';

const styles = stylex.create({
  wrapper: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-high-contrast'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '1px',
    },
  },
  wrapperDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    border: 0,
    padding: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: '0.875rem',
    lineHeight: 1.429,
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 0,
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: 18,
  },
  md: {
    height: 26,
  },
});

const statusBorderStyles = stylex.create({
  warning: {
    borderColor: colorVars['--color-warning'],
  },
  error: {
    borderColor: colorVars['--color-negative'],
  },
  success: {
    borderColor: colorVars['--color-positive'],
  },
});

export type XDSTextInputSize = keyof typeof sizeStyles;

export type XDSTextInputStatusType = 'warning' | 'error' | 'success';

export interface XDSTextInputStatus {
  /**
   * The type of status to display.
   */
  type: XDSTextInputStatusType;
  /**
   * Optional message to display below the input.
   */
  message?: string;
}

export interface XDSTextInputProps {
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
   * Import from @heroicons/react/24/outline or @heroicons/react/24/solid.
   */
  startIcon?: XDSIconType;
  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the input.
   */
  status?: XDSTextInputStatus;
  /**
   * The size of the input.
   * - 'sm': Compact size (18px height)
   * - 'md': Default size (26px height)
   * @default 'md'
   */
  size?: XDSTextInputSize;
  /**
   * Callback fired when the input value changes.
   */
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
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
}

/**
 * A text input component for collecting user input.
 *
 * @example
 * ```tsx
 * <XDSTextInput label="Name" value={name} onChange={setName} />
 * <XDSTextInput label="Search" isLabelHidden value={query} onChange={setQuery} />
 * ```
 */
export const XDSTextInput = forwardRef<HTMLInputElement, XDSTextInputProps>(
  (
    {
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
      value,
      placeholder,
      labelTooltip,
      hasAutoFocus = false,
      htmlName,
    },
    ref
  ) => {
    const id = useId();
    const descriptionID = useId();
    const statusMessageID = useId();

    const statusIconMap: Record<XDSTextInputStatusType, XDSIconType> = {
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      success: CheckCircleIcon,
    };

    const statusIconColorMap: Record<
      XDSTextInputStatusType,
      'warning' | 'negative' | 'positive'
    > = {
      warning: 'warning',
      error: 'negative',
      success: 'positive',
    };

    const ariaDescribedBy =
      [
        description ? descriptionID : null,
        status?.message ? statusMessageID : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

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
          {...stylex.props(
            styles.wrapper,
            isDisabled && styles.wrapperDisabled,
            status && statusBorderStyles[status.type]
          )}>
          {startIcon && <XDSIcon icon={startIcon} size="sm" color="primary" />}
          <input
            ref={ref}
            id={id}
            name={htmlName}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value, e)}
            placeholder={placeholder}
            disabled={isDisabled}
            autoFocus={hasAutoFocus}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={status?.type === 'error' ? 'true' : undefined}
            {...stylex.props(
              styles.input,
              sizeStyles[size],
              isDisabled && styles.inputDisabled
            )}
          />
          {status && (
            <XDSIcon
              icon={statusIconMap[status.type]}
              size="md"
              color={statusIconColorMap[status.type]}
            />
          )}
        </div>
      </XDSField>
    );
  }
);

XDSTextInput.displayName = 'XDSTextInput';
