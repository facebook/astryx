/**
 * @file XDSCheckboxInput.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSFieldLabel
 * @output Exports XDSCheckboxInput component, XDSCheckboxInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSCheckboxInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/CheckboxInput/XDSCheckboxInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/CheckboxInput/index.ts (exports if types change)
 * - /apps/storybook/stories/CheckboxInput.stories.tsx (storybook stories)
 */

import {forwardRef, useId, type ChangeEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {XDSFieldLabel} from '../Field/XDSFieldLabel';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  checkboxWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 24,
    height: 24,
  },
  input: {
    position: 'absolute',
    width: 24,
    height: 24,
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-content'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'background-color, border-color',
    transitionDuration: transitionVars['--transition-fast'],
  },
  checkboxHover: {
    borderColor: colorVars['--color-divider-high-contrast'],
  },
  checkboxChecked: {
    backgroundColor: colorVars['--color-accent'],
    borderColor: colorVars['--color-accent'],
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
    width: 14,
    height: 14,
    fill: 'white',
  },
  checkmarkVisible: {
    display: 'block',
  },
  indeterminateMark: {
    display: 'none',
    width: 12,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  indeterminateMarkVisible: {
    display: 'block',
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    marginTop: 3,
  },
  description: {
    fontFamily: typographyVars['--font-body'],
    fontSize: '0.75rem',
    color: colorVars['--color-text-secondary'],
  },
});

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
  onChange: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Whether the checkbox is checked, unchecked, or indeterminate.
   */
  value: boolean | 'indeterminate';
  /**
   * Whether the checkbox is disabled.
   * @default false
   */
  isDisabled?: boolean;
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
      value,
      isDisabled = false,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();

    const isIndeterminate = value === 'indeterminate';
    const isChecked = value === true;

    return (
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.checkboxWrapper)}>
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            onChange={e => onChange(e.target.checked, e)}
            aria-describedby={description ? descriptionID : undefined}
            {...stylex.props(styles.input, isDisabled && styles.inputDisabled)}
          />
          <div
            aria-hidden="true"
            {...stylex.props(
              styles.checkbox,
              (isChecked || isIndeterminate) && styles.checkboxChecked,
              isDisabled && styles.checkboxDisabled,
              isDisabled &&
                !isChecked &&
                !isIndeterminate &&
                styles.checkboxDisabledUnchecked,
            )}>
            <svg
              viewBox="0 0 10 10"
              {...stylex.props(
                styles.checkmark,
                isChecked && styles.checkmarkVisible,
              )}>
              <path
                d="M8.5 2.5L4 7.5L1.5 5"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              {...stylex.props(
                styles.indeterminateMark,
                isIndeterminate && styles.indeterminateMarkVisible,
              )}
            />
          </div>
        </div>
        <div {...stylex.props(styles.labelWrapper)}>
          <XDSFieldLabel
            label={label}
            inputID={id}
            isLabelHidden={isLabelHidden}
            isDisabled={isDisabled}
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
