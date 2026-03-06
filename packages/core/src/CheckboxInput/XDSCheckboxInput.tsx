/**
 * @file XDSCheckboxInput.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSFieldLabel, XDSFieldStatus, XDSIconType, XDSInputStatus
 * @output Exports XDSCheckboxInput component, XDSCheckboxInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSCheckboxInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/CheckboxInput/XDSCheckboxInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/CheckboxInput/index.ts (exports if types change)
 * - /apps/storybook/stories/CheckboxInput.stories.tsx (storybook stories)
 */

'use client';

import {
  forwardRef,
  useContext,
  useId,
  useOptimistic,
  useTransition,
  type ChangeEvent,
  type FocusEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  transitionVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {XDSFieldLabel} from '../Field/XDSFieldLabel';
import {XDSFieldStatus} from '../Field/XDSFieldStatus';
import type {XDSIconType} from '../Icon';
import type {XDSInputStatus} from '../Field/types';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';
import {XDSSpinner} from '../Spinner';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  containerLabelHidden: {
    gap: 0,
  },
  checkboxWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: radiusVars['--radius-content'],
    transitionProperty: 'background-color, border-color',
    transitionDuration: transitionVars['--transition-fast'],
  },
  checkboxFocused: {
    outline: `2px solid ${colorVars['--color-focus-outline']}`,
    outlineOffset: 2,
  },
  // State-dependent colors with ancestor hover behavior
  checkboxUnchecked: {
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-divider-emphasized']}, ${colorVars['--color-hover-tint']} 20%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-surface'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-surface']}, ${colorVars['--color-hover-tint']} 5%)`,
      },
    },
  },
  checkboxChecked: {
    borderColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
      },
    },
  },
  checkboxDisabled: {
    opacity: 0.5,
    borderColor: colorVars['--color-divider'],
  },
  checkboxDisabledUnchecked: {
    backgroundColor: colorVars['--color-deemphasized'],
  },
  checkmark: {
    display: 'none',
    color: colorVars['--color-icon-on-media'],
  },
  checkmarkVisible: {
    display: 'block',
  },
  indeterminateMark: {
    display: 'none',
    backgroundColor: colorVars['--color-icon-on-media'],
    borderRadius: 1,
  },
  indeterminateMarkVisible: {
    display: 'block',
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  description: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
});

const wrapperSizeStyles = stylex.create({
  sm: {
    width: 20,
    height: 20,
  },
  md: {
    width: 24,
    height: 24,
  },
});

const checkboxSizeStyles = stylex.create({
  sm: {
    width: 18,
    height: 18,
  },
  md: {
    width: 22,
    height: 22,
  },
});

const checkmarkSizeStyles = stylex.create({
  sm: {
    width: 12,
    height: 12,
  },
  md: {
    width: 14,
    height: 14,
  },
});

const indeterminateSizeStyles = stylex.create({
  sm: {
    width: 10,
    height: 2,
  },
  md: {
    width: 12,
    height: 2,
  },
});

const labelWrapperSizeStyles = stylex.create({
  sm: {
    marginTop: 1,
  },
  md: {
    marginTop: 3,
  },
});

export type XDSCheckboxInputSize = keyof typeof wrapperSizeStyles;

// =============================================================================
// Module Augmentation - Register component styles with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    checkboxInput?: {
      /** Root container styles */
      root?: ThemeStyleXStyles;
      /** Visual checkbox styles */
      checkbox?: ThemeStyleXStyles;
    };
  }
}
export interface XDSCheckboxInputProps {
  /**
   * Label text for the checkbox (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Callback fired when the checkbox state changes.
   */
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Async action on change. Fires after onChange if not prevented.
   */
  onChangeAction?: (
    checked: boolean,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /**
   * Whether the checkbox is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the checkbox is checked, unchecked, or indeterminate.
   */
  value: boolean | 'indeterminate';
  /**
   * Whether the checkbox is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the checkbox is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * The size of the checkbox.
   * - 'sm': Compact size (28px row height)
   * - 'md': Default size (36px row height)
   * @default 'md'
   */
  size?: XDSCheckboxInputSize;
  /**
   * Callback fired when the checkbox receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the checkbox loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: XDSIconType;
  /**
   * Status indicator for the checkbox.
   * When set with a message, displays a colored message box below the checkbox.
   */
  status?: XDSInputStatus;
}

/**
 * A checkbox input component for toggling boolean values.
 *
 * @example
 * ```
 * <XDSCheckboxInput
 *   label="Accept terms"
 *   value={accepted}
 *   onChange={setAccepted}
 * />
 * <XDSCheckboxInput
 *   label="Subscribe"
 *   description="Receive weekly updates"
 *   value={subscribed}
 *   onChange={setSubscribed}
 * />
 * ```
 */
export const XDSCheckboxInput = forwardRef<
  HTMLInputElement,
  XDSCheckboxInputProps
>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      onChange,
      onChangeAction,
      isLoading = false,
      value,
      isDisabled = false,
      isOptional = false,
      isRequired = false,
      size = 'md',
      onFocus,
      onBlur,
      labelIcon,
      status,
    },
    ref,
  ) => {
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.checkboxInput?.root;
    const checkboxOverride =
      themeContext?.theme.components?.checkboxInput?.checkbox;

    const id = useId();
    const descriptionID = useId();
    const statusMessageID = useId();

    const [, startTransition] = useTransition();
    const [optimisticValue, setOptimisticValue] = useOptimistic(value);
    const isBusy = isLoading || optimisticValue !== value;

    const isIndeterminate = optimisticValue === 'indeterminate';
    const isChecked = optimisticValue === true;
    const isCheckedOrIndeterminate = isChecked || isIndeterminate;

    // Build aria-describedby from description and status message
    const describedByParts: string[] = [];
    if (description) describedByParts.push(descriptionID);
    if (status?.message) describedByParts.push(statusMessageID);
    const ariaDescribedBy =
      describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    return (
      <div>
        <div
          {...stylex.props(
            styles.container,
            isLabelHidden && styles.containerLabelHidden,
            rootOverride,
            !isDisabled && stylex.defaultMarker(),
          )}>
          <div
            {...stylex.props(styles.checkboxWrapper, wrapperSizeStyles[size])}>
            <input
              ref={ref}
              id={id}
              type="checkbox"
              checked={isChecked}
              disabled={isDisabled}
              required={isRequired}
              onChange={e => {
                const checked = e.target.checked;
                onChange?.(checked, e);
                if (onChangeAction && !e.defaultPrevented) {
                  startTransition(async () => {
                    setOptimisticValue(checked);
                    await onChangeAction(checked, e);
                  });
                }
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              aria-describedby={ariaDescribedBy}
              aria-invalid={status?.type === 'error' ? true : undefined}
              aria-busy={isBusy || undefined}
              {...stylex.props(
                styles.input,
                wrapperSizeStyles[size],
                isDisabled && styles.inputDisabled,
              )}
            />
            <div
              aria-hidden="true"
              {...stylex.props(
                styles.checkbox,
                checkboxSizeStyles[size],
                checkboxOverride,
                isCheckedOrIndeterminate
                  ? styles.checkboxChecked
                  : styles.checkboxUnchecked,
                isDisabled && styles.checkboxDisabled,
                isDisabled &&
                  !isCheckedOrIndeterminate &&
                  styles.checkboxDisabledUnchecked,
              )}>
              {isBusy ? (
                <XDSSpinner
                  size="sm"
                  shade={isCheckedOrIndeterminate ? 'onMedia' : 'default'}
                />
              ) : (
                <>
                  <svg
                    viewBox="0 0 10 10"
                    {...stylex.props(
                      styles.checkmark,
                      checkmarkSizeStyles[size],
                      isChecked && styles.checkmarkVisible,
                    )}>
                    <path
                      d="M8.5 2.5L4 7.5L1.5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div
                    {...stylex.props(
                      styles.indeterminateMark,
                      indeterminateSizeStyles[size],
                      isIndeterminate && styles.indeterminateMarkVisible,
                    )}
                  />
                </>
              )}
            </div>
          </div>
          <div
            {...stylex.props(
              styles.labelWrapper,
              labelWrapperSizeStyles[size],
            )}>
            <XDSFieldLabel
              label={label}
              inputID={id}
              isLabelHidden={isLabelHidden}
              isDisabled={isDisabled}
              isOptional={isOptional}
              isRequired={isRequired}
              labelIcon={labelIcon}
            />
            {description && !isLabelHidden && (
              <span id={descriptionID} {...stylex.props(styles.description)}>
                {description}
              </span>
            )}
          </div>
        </div>
        {status?.message && (
          <XDSFieldStatus
            type={status.type}
            message={status.message}
            id={statusMessageID}
            variant="detached"
          />
        )}
      </div>
    );
  },
);

XDSCheckboxInput.displayName = 'XDSCheckboxInput';
