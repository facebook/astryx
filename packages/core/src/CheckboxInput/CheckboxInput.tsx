// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CheckboxInput.tsx
 * @input Uses React, useId, ChangeEvent, FieldLabel, FieldStatus, IconType, InputStatus
 * @output Exports CheckboxInput component, CheckboxInputProps
 * @position Core implementation; consumed by index.ts, tested by CheckboxInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxInput/CheckboxInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/CheckboxInput/CheckboxInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/CheckboxInput/index.ts (exports if types change)
 * - /apps/storybook/stories/CheckboxInput.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/CheckboxInput/ (showcase blocks)
 */

import {
  useId,
  useCallback,
  useOptimistic,
  useTransition,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
  fontWeightVars,
  borderVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {FieldLabel} from '../Field/FieldLabel';
import {FieldStatus} from '../FieldStatus/FieldStatus';
import type {IconType} from '../Icon';
import type {InputStatus} from '../Field/types';
import {Spinner} from '../Spinner';
import {mergeProps, mergeRefs} from '../utils';
import {checkboxScope} from './checkbox.markers.stylex';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
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
    isolation: 'isolate',
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
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: radiusVars['--radius-inner'],
    transitionProperty: 'background-color, border-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  checkboxFocus: {
    outline: {
      default: 'none',
      [stylex.when.ancestor(':has(:focus-visible)', checkboxScope)]:
        `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.ancestor(':has(:focus-visible)', checkboxScope)]: '2px',
    },
  },
  // State-dependent colors with ancestor hover behavior
  checkboxUnchecked: {
    // Foreground for the inherit-shade loading spinner (reads currentColor):
    // brand accent on the light surface fill.
    color: colorVars['--color-accent'],
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      [stylex.when.ancestor(':hover', checkboxScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-border-emphasized']}, ${colorVars['--color-tint-hover']} 20%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      [stylex.when.ancestor(':hover', checkboxScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-background-surface']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  checkboxChecked: {
    // Foreground for the inherit-shade loading spinner (reads currentColor):
    // on-accent color against the accent fill.
    color: colorVars['--color-on-accent'],
    borderColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', checkboxScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', checkboxScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  checkboxDisabled: {
    opacity: 0.5,
    borderColor: {
      default: colorVars['--color-border'],
      [stylex.when.ancestor(':hover', checkboxScope)]: {
        '@media (hover: hover)': colorVars['--color-border'],
      },
    },
  },
  checkboxDisabledUnchecked: {
    backgroundColor: {
      default: colorVars['--color-background-muted'],
      [stylex.when.ancestor(':hover', checkboxScope)]: {
        '@media (hover: hover)': colorVars['--color-background-muted'],
      },
    },
  },
  checkmark: {
    display: 'none',
    color: colorVars['--color-on-accent'],
  },
  checkmarkVisible: {
    display: 'block',
  },
  indeterminateMark: {
    display: 'none',
    backgroundColor: colorVars['--color-on-accent'],
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
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
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

export type CheckboxInputSize = keyof typeof wrapperSizeStyles;

export interface CheckboxInputProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the underlying `<input>` element */
  ref?: React.Ref<HTMLInputElement>;
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
  changeAction?: (
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
   * Whether the checkbox is read-only.
   * Displays the current state at full opacity but prevents interaction.
   * Unlike `isDisabled`, read-only checkboxes are not visually dimmed.
   * @default false
   */
  isReadOnly?: boolean;
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
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * The size of the checkbox.
   * - 'sm': Compact size (28px row height)
   * - 'md': Default size (36px row height)
   * @default 'md'
   */
  size?: CheckboxInputSize;
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
  labelIcon?: ReactNode | IconType;
  /**
   * Status indicator for the checkbox.
   * When set with a message, displays a colored message box below the checkbox.
   */
  status?: InputStatus;
}

// Dynamic field width (number -> px, string used as-is).
const dynamicWidthStyles = stylex.create({
  width: (width: SizeValue | null) => ({width}),
});

/**
 * A checkbox input component for toggling boolean values.
 *
 * @example
 * ```
 * <CheckboxInput
 *   label="Accept terms"
 *   value={accepted}
 *   onChange={setAccepted}
 * />
 * <CheckboxInput
 *   label="Subscribe"
 *   description="Receive weekly updates"
 *   value={subscribed}
 *   onChange={setSubscribed}
 * />
 * ```
 */
export function CheckboxInput({
  label,
  isLabelHidden = false,
  description,
  onChange,
  changeAction,
  isLoading = false,
  value,
  isDisabled = false,
  isReadOnly = false,
  isOptional = false,
  isRequired = false,
  size = 'md',
  onFocus,
  onBlur,
  labelIcon,
  status,
  width,
  xstyle,
  className,
  style,
  ref,
}: CheckboxInputProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const isIndeterminate = optimisticValue === 'indeterminate';
  const isChecked = optimisticValue === true;
  const isCheckedOrIndeterminate = isChecked || isIndeterminate;

  // Sync the native indeterminate DOM property (can't be set via JSX attribute)
  const indeterminateRef = useCallback(
    (el: HTMLInputElement | null) => {
      if (el) {
        el.indeterminate = isIndeterminate;
      }
    },
    [isIndeterminate],
  );

  // Build aria-describedby from description and status message
  // Only include descriptionID when the element actually renders
  const describedByParts: string[] = [];
  if (description && !isLabelHidden) {
    describedByParts.push(descriptionID);
  }
  if (status?.message) {
    describedByParts.push(statusMessageID);
  }
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  return (
    <div
      {...mergeProps(
        themeProps('checkbox-input', {size}),
        stylex.props(width != null && dynamicWidthStyles.width(width), xstyle),
        className,
        style,
      )}>
      <div
        {...stylex.props(
          styles.container,
          isLabelHidden && styles.containerLabelHidden,
          !isDisabled && checkboxScope,
        )}>
        <div {...stylex.props(styles.checkboxWrapper, wrapperSizeStyles[size])}>
          <input
            ref={mergeRefs(ref, indeterminateRef)}
            id={id}
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={isRequired}
            onChange={e => {
              if (isBusy || isReadOnly) {
                return;
              }
              const checked = e.target.checked;
              onChange?.(checked, e);
              if (changeAction && !e.defaultPrevented) {
                startTransition(async () => {
                  setOptimisticValue(checked);
                  await changeAction(checked, e);
                });
              }
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-checked={isIndeterminate ? 'mixed' : undefined}
            aria-readonly={isReadOnly || undefined}
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
            {...mergeProps(
              themeProps('checkbox', {
                size,
                checked: isChecked
                  ? 'checked'
                  : isIndeterminate
                    ? 'indeterminate'
                    : null,
                disabled: isDisabled ? 'disabled' : null,
              }),
              stylex.props(
                styles.checkbox,
                checkboxSizeStyles[size],
                !isDisabled && styles.checkboxFocus,
                isCheckedOrIndeterminate
                  ? styles.checkboxChecked
                  : styles.checkboxUnchecked,
                isDisabled && styles.checkboxDisabled,
                isDisabled &&
                  !isCheckedOrIndeterminate &&
                  styles.checkboxDisabledUnchecked,
              ),
            )}>
            {isBusy ? (
              <Spinner size="sm" shade="inherit" />
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
        <div {...stylex.props(styles.labelWrapper)}>
          <FieldLabel
            label={label}
            inputID={id}
            isLabelHidden={isLabelHidden}
            isDisabled={isDisabled}
            isOptional={isOptional}
            isRequired={isRequired}
            labelIcon={labelIcon}
            description={description}
            descriptionID={descriptionID}
          />
        </div>
      </div>
      {status?.message && (
        <FieldStatus
          type={status.type}
          message={status.message}
          id={statusMessageID}
          variant="detached"
        />
      )}
    </div>
  );
}

CheckboxInput.displayName = 'CheckboxInput';
