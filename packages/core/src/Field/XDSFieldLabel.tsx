/**
 * @file XDSFieldLabel.tsx
 * @input Uses React, XDSIcon, XDSIconType
 * @output Exports XDSFieldLabel component, XDSFieldLabelProps
 * @position Core label implementation; used by XDSField, XDSCheckboxInput, XDSSwitch
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/Field.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/index.ts (exports if types change)
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

import {
  colorVars,
  fontWeightVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSIcon, type XDSIconType} from '../Icon';
import {XDSTooltip} from '../Tooltip';

const styles = stylex.create({
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
  },
  srOnly: {
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
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
  description: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
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
   * Whether to visually hide the label and description (still accessible
   * to screen readers). When hidden, the entire label group is rendered
   * with sr-only styles and takes up no layout space.
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
  /**
   * Description displayed below the label. Hidden along with the label
   * when isLabelHidden is true.
   */
  description?: ReactNode;
  /**
   * ID for the description element (for aria-describedby on the input).
   */
  descriptionID?: string;
}

/**
 * Label + description group for form fields. Handles sr-only hiding,
 * disabled styling, optional/required indicators, icons, and tooltips.
 *
 * When `isLabelHidden` is true the entire group uses sr-only positioning
 * so it takes up zero layout space — no wrapper div left in flow.
 *
 * @example
 * ```
 * <XDSFieldLabel label="Email" inputID={inputId} description="We won't share it" />
 * <XDSFieldLabel label="Search" inputID={inputId} isLabelHidden />
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
  description,
  descriptionID,
  ref,
}: XDSFieldLabelProps) {
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;

  return (
    <>
      <label
        ref={ref}
        htmlFor={inputID}
        {...mergeProps(
          xdsClassName('field-label'),
          stylex.props(
            styles.label,
            isDisabled && styles.labelDisabled,
            isLabelHidden && styles.srOnly,
          ),
        )}>
        {labelIcon && <XDSIcon icon={labelIcon} size="sm" color="inherit" />}
        {label}
        {statusText && (
          <span {...stylex.props(styles.optionalRequired)}>
            <span aria-hidden="true"> ∙ </span>
            {statusText}
          </span>
        )}
        {labelTooltip && (
          <XDSTooltip content={labelTooltip} placement="above">
            <XDSIcon icon="info" size="sm" color="inherit" />
          </XDSTooltip>
        )}
      </label>
      {description && (
        <span
          id={descriptionID}
          {...stylex.props(
            styles.description,
            isLabelHidden && styles.srOnly,
          )}>
          {description}
        </span>
      )}
    </>
  );
}

XDSFieldLabel.displayName = 'XDSFieldLabel';
