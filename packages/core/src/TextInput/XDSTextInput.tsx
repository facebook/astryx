/**
 * @file XDSTextInput.tsx
 * @input Uses React useId, ChangeEvent, XDSField, XDSIcon
 * @output Exports XDSTextInput component, XDSTextInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTextInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/TextInput/XDSTextInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TextInput.stories.tsx (storybook stories)
 */

import {
  useContext,
  useId,
  useOptimistic,
  useTransition,
  type ChangeEvent,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSField, type XDSInputStatus, type XDSInputStatusType} from '../Field';
import {XDSIcon, type XDSIconType} from '../Icon';
import {XDSSpinner} from '../Spinner';

const styles = stylex.create({
  wrapper: {
    boxSizing: 'border-box',
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
      ':hover': {
        '@media (hover: hover)': colorVars['--color-divider-high-contrast'],
      },
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline, box-shadow',
    transitionDuration: transitionVars['--transition-fast'],
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': elevationVars['--elevation-input-hover'],
      },
    },
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: '0',
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
      color: colorVars['--color-text-placeholder'],
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

const statusHoverShadowStyles = stylex.create({
  warning: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)':
          elevationVars['--elevation-input-hover-warning'],
      },
    },
  },
  error: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': elevationVars['--elevation-input-hover-error'],
      },
    },
  },
  success: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)':
          elevationVars['--elevation-input-hover-success'],
      },
    },
  },
});

const statusFocusStyles = stylex.create({
  warning: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-warning']}`,
    },
  },
  error: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-error']}`,
    },
  },
  success: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-success']}`,
    },
  },
});

export type XDSTextInputSize = keyof typeof sizeStyles;

// Re-export shared types for convenience
export type {
  XDSInputStatus as XDSTextInputStatus,
  XDSInputStatusType as XDSTextInputStatusType,
} from '../Field';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

// =============================================================================
// Module Augmentation - Register component styles with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    textInput?: {
      /** Wrapper container styles */
      wrapper?: ThemeStyleXStyles;
      /** Input element styles */
      input?: ThemeStyleXStyles;
    };
  }
}
export interface XDSTextInputProps {
  /** Ref to the root element. */
  ref?: Ref<HTMLInputElement>;
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
   * - 'sm': Compact size (18px height)
   * - 'md': Default size (26px height)
   * @default 'md'
   */
  size?: XDSTextInputSize;
  /**
   * Callback fired when the input value changes.
   */
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  /** Async action on change. Fires after onChange if not prevented. */
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
}

/**
 * A text input component for collecting user input.
 *
 * @example
 * ```
 * <XDSTextInput label="Name" value={name} onChange={setName} />
 * <XDSTextInput label="Search" isLabelHidden value={query} onChange={setQuery} />
 * ```
 */
export function XDSTextInput({
  ref,
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
}: XDSTextInputProps) {
  const themeContext = useContext(ThemeContext);
  const wrapperOverride = themeContext?.theme.components?.textInput?.wrapper;
  const inputOverride = themeContext?.theme.components?.textInput?.input;

  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const statusIconMap: Record<XDSInputStatusType, XDSIconName> = {
    warning: 'warning',
    error: 'xCircle',
    success: 'checkCircle',
  };

  const statusIconColorMap: Record<
    XDSInputStatusType,
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
          sizeStyles[size],
          isDisabled && styles.wrapperDisabled,
          status && statusBorderStyles[status.type],
          status && statusHoverShadowStyles[status.type],
          status && statusFocusStyles[status.type],
          wrapperOverride,
        )}>
        {startIcon && <XDSIcon icon={startIcon} size="sm" color="primary" />}
        <input
          ref={ref}
          id={id}
          name={htmlName}
          type="text"
          value={String(optimisticValue)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isDisabled}
          autoFocus={hasAutoFocus}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired === true ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          {...stylex.props(
            styles.input,
            isDisabled && styles.inputDisabled,
            inputOverride,
          )}
        />
        {isBusy && <XDSSpinner size="sm" />}
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

XDSTextInput.displayName = 'XDSTextInput';
