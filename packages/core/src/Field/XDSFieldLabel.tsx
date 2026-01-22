/**
 * @file XDSFieldLabel.tsx
 * @input Uses React forwardRef
 * @output Exports XDSFieldLabel component, XDSFieldLabelProps
 * @position Core label implementation; used by XDSField, XDSCheckboxInput
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/README.md (props table, features, implementation notes)
 * - /packages/core/src/Field/index.ts (exports if types change)
 */

import {forwardRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, typographyVars} from '../theme/tokens.stylex';

const styles = stylex.create({
  label: {
    fontFamily: typographyVars['--font-body'],
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colorVars['--color-text-primary'],
  },
  labelClickable: {
    cursor: 'pointer',
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
  },
  labelHidden: {
    borderStyle: 'none',
    clip: 'rect(0, 0, 0, 0)',
    height: 1,
    left: 0,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: 1,
  },
  optionalRequired: {
    fontWeight: 400,
    fontSize: '0.75rem',
    color: colorVars['--color-text-secondary'],
  },
});

export interface XDSFieldLabelProps {
  /**
   * Label text (always rendered for accessibility).
   */
  label: string;
  /**
   * ID of the input element this label is for.
   */
  inputID: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the associated input is disabled.
   * @default false
   */
  isDisabled?: boolean;
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
}

/**
 * A label component for form fields with support for hidden and disabled states.
 *
 * @example
 * ```tsx
 * <XDSFieldLabel label="Email" inputID={inputId} />
 * <XDSFieldLabel label="Hidden label" inputID={inputId} isLabelHidden />
 * ```
 */
export const XDSFieldLabel = forwardRef<HTMLLabelElement, XDSFieldLabelProps>(
  (
    {
      label,
      inputID,
      isLabelHidden = false,
      isDisabled = false,
      isOptional = false,
      isRequired = false,
    },
    ref,
  ) => {
    const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;

    return (
      <label
        ref={ref}
        htmlFor={inputID}
        {...stylex.props(
          styles.label,
          !isDisabled && styles.labelClickable,
          isDisabled && styles.labelDisabled,
          isLabelHidden && styles.labelHidden,
        )}>
        {label}
        {statusText && (
          <span {...stylex.props(styles.optionalRequired)}>
            {' '}
            ∙ {statusText}
          </span>
        )}
      </label>
    );
  },
);

XDSFieldLabel.displayName = 'XDSFieldLabel';
