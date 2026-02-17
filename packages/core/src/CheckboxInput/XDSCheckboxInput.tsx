/**
 * @file XDSCheckboxInput.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSFieldLabel, XDSIconType
 * @output Exports XDSCheckboxInput component, XDSCheckboxInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSCheckboxInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/CheckboxInput/XDSCheckboxInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/CheckboxInput/index.ts (exports if types change)
 * - /apps/storybook/stories/CheckboxInput.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  startTransition,
  useId,
  useOptimistic,
  type ChangeEvent,
  type FocusEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  textSizeVars,
} from '../theme/tokens.stylex';
import {XDSFieldLabel} from '../Field/XDSFieldLabel';
import type {XDSIconType} from '../Icon';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  // Default CSS variables for unchecked state
  containerUnchecked: {
    '--xds-checkbox-bg': colorVars['--color-surface'],
    '--xds-checkbox-border': colorVars['--color-divider-emphasized'],
  },
  // Default CSS variables for checked/indeterminate state
  containerChecked: {
    '--xds-checkbox-bg': colorVars['--color-accent'],
    '--xds-checkbox-border': colorVars['--color-accent'],
  },
  // Hover overrides for unchecked (only applied when not disabled)
  containerHoverUnchecked: {
    ':hover': {
      '--xds-checkbox-bg': `color-mix(in srgb, ${colorVars['--color-surface']}, ${colorVars['--color-hover-tint']} 5%)`,
      '--xds-checkbox-border': `color-mix(in srgb, ${colorVars['--color-divider-emphasized']}, ${colorVars['--color-hover-tint']} 20%)`,
    },
  },
  // Hover overrides for checked/indeterminate (only applied when not disabled)
  containerHoverChecked: {
    ':hover': {
      '--xds-checkbox-bg': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
      '--xds-checkbox-border': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
    },
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
    borderColor: 'var(--xds-checkbox-border)',
    borderRadius: radiusVars['--radius-content'],
    backgroundColor: 'var(--xds-checkbox-bg)',
    transitionProperty: 'background-color, border-color',
    transitionDuration: transitionVars['--transition-fast'],
  },
  checkboxFocused: {
    outline: `2px solid ${colorVars['--color-focus-outline']}`,
    outlineOffset: 2,
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

const spinnerKeyframes = stylex.keyframes({
  to: {transform: 'rotate(360deg)'},
});

const spinnerStyles = stylex.create({
  spinner: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animationName: spinnerKeyframes,
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  spinnerChecked: {
    color: colorVars['--color-icon-on-media'],
  },
  spinnerUnchecked: {
    color: colorVars['--color-text-secondary'],
  },
});

export type XDSCheckboxInputSize = keyof typeof wrapperSizeStyles;

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
   * Either onChange or onChangeAction must be provided.
   */
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Async action to perform on change. Wrapped in React transition.
   * Replaces onChange when provided - handle state updates inside this action.
   * Receives the same arguments as onChange.
   */
  onChangeAction?: (
    checked: boolean,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /**
   * Whether the checkbox is in a loading state.
   * Shows disabled state during async operations.
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
   * Whether the checkbox is required.
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
  startIcon?: XDSIconType;
}

/**
 * A checkbox input component for toggling boolean values.
 *
 * @example
 * ```tsx
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
      isRequired = false,
      size = 'md',
      onFocus,
      onBlur,
      startIcon,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();

    // Optimistic state for instant visual feedback during async actions
    const [optimisticValue, setOptimisticValue] = useOptimistic(value);
    // isBusy is for visual feedback only (reduced opacity, aria-busy)
    const isBusy = isLoading || optimisticValue !== value;

    const isIndeterminate = optimisticValue === 'indeterminate';
    const isChecked = optimisticValue === true;
    const isCheckedOrIndeterminate = isChecked || isIndeterminate;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;

      if (onChangeAction) {
        // Use action - optimistic update with transition for async support
        startTransition(() => {
          setOptimisticValue(newValue);
          onChangeAction(newValue, e);
        });
      } else if (onChange) {
        onChange(newValue, e);
      }
    };

    return (
      <div
        {...stylex.props(
          styles.container,
          isCheckedOrIndeterminate
            ? styles.containerChecked
            : styles.containerUnchecked,
          !isDisabled &&
            (isCheckedOrIndeterminate
              ? styles.containerHoverChecked
              : styles.containerHoverUnchecked),
        )}>
        <div {...stylex.props(styles.checkboxWrapper, wrapperSizeStyles[size])}>
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            required={isRequired}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-busy={isBusy || undefined}
            aria-describedby={description ? descriptionID : undefined}
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
              isDisabled && styles.checkboxDisabled,
              isDisabled &&
                !isCheckedOrIndeterminate &&
                styles.checkboxDisabledUnchecked,
            )}>
            {isBusy ? (
              <div
                {...stylex.props(
                  spinnerStyles.spinner,
                  checkmarkSizeStyles[size],
                  isCheckedOrIndeterminate
                    ? spinnerStyles.spinnerChecked
                    : spinnerStyles.spinnerUnchecked,
                )}
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
          {...stylex.props(styles.labelWrapper, labelWrapperSizeStyles[size])}>
          <XDSFieldLabel
            label={label}
            inputID={id}
            isLabelHidden={isLabelHidden}
            isDisabled={isDisabled}
            startIcon={startIcon}
          />
          {description && (
            <span id={descriptionID} {...stylex.props(styles.description)}>
              {description}
            </span>
          )}
        </div>
      </div>
    );
  },
);

XDSCheckboxInput.displayName = 'XDSCheckboxInput';
