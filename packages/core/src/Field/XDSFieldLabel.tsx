/**
 * @file XDSFieldLabel.tsx
 * @input Uses React, XDSIcon, XDSIconType
 * @output Exports XDSFieldLabel component, XDSFieldLabelProps
 * @position Core label implementation; used by XDSField, XDSCheckboxInput
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/Field.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/index.ts (exports if types change)
 */

import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

import {
  colorVars,
  fontWeightVars,
  spacingVars,
  textSizeVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {XDSIcon, type XDSIconType} from '../Icon';
import {XDSTooltip} from '../Tooltip';

const styles = stylex.create({
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
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
    fontWeight: fontWeightVars['--font-weight-normal'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
});

export interface XDSFieldLabelProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLabelElement>;
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
  /**
   * Icon to display before the label text.
   */
  labelIcon?: XDSIconType;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
}

/**
 * A label component for form fields with support for hidden and disabled states.
 *
 * @example
 * ```
 * <XDSFieldLabel label="Email" inputID={inputId} />
 * <XDSFieldLabel label="Hidden label" inputID={inputId} isLabelHidden />
 * ```
 */
export function XDSFieldLabel({
  label,
  inputID,
  isLabelHidden = false,
  isDisabled = false,
  isOptional = false,
  isRequired = false,
  labelIcon,
  labelTooltip,
  ref,
}: XDSFieldLabelProps) {
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;

  return (
    <label
      ref={ref}
      htmlFor={inputID}
      {...mergeProps(
        xdsClassName('field-label'),
        stylex.props(
          styles.label,
          !isDisabled && styles.labelClickable,
          isDisabled && styles.labelDisabled,
          isLabelHidden && styles.labelHidden,
        ),
      )}>
      {labelIcon && (
        <XDSIcon
          icon={labelIcon}
          size="sm"
          color={isDisabled ? 'disabled' : 'primary'}
        />
      )}
      {label}
      {statusText && (
        <span {...stylex.props(styles.optionalRequired)}> ∙ {statusText}</span>
      )}
      {labelTooltip && (
        <XDSTooltip content={labelTooltip} placement="above">
          <XDSIcon
            icon="info"
            size="sm"
            color={isDisabled ? 'disabled' : 'secondary'}
          />
        </XDSTooltip>
      )}
    </label>
  );
}

XDSFieldLabel.displayName = 'XDSFieldLabel';
