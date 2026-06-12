// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSField.tsx
 * @input Uses React, HTMLAttributes, ReactNode, XDSFieldLabel, XDSIconType
 * @output Exports XDSField component, XDSFieldProps
 * @position Core implementation; consumed by index.ts, tested by XDSField.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/Field.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/XDSField.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Field/index.ts (exports if types change)
 * - /apps/storybook/stories/Field.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Field/ (showcase blocks)
 */

import {type ReactNode, use} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {XDSFieldLabel} from './XDSFieldLabel';
import {XDSFieldStatus} from '../FieldStatus/XDSFieldStatus';
import {spacingVars, borderVars} from '../theme/tokens.stylex';
import type {XDSIconType} from '../Icon';
import {xdsClassName, mergeProps} from '../utils';
import {XDSFormLayoutContext} from '../FormLayout/XDSFormLayoutContext';
import {XDSText} from '../Text';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  containerGap: {
    gap: spacingVars['--spacing-1'],
  },
  horizontalLabels: {
    display: 'contents',
  },
  horizontalLabelAlign: {
    // Align label text with input text by matching the input wrapper's
    // top border + top padding. Works for both single-line inputs and
    // textareas (labels stay top-aligned, not vertically centered).
    paddingTop: `calc(${borderVars['--border-width']} + ${spacingVars['--spacing-1']})`,
  },
  inputStatusWrapper: {
    display: 'flex',
    flexDirection: 'column',
    isolation: 'isolate',
  },
});

export type XDSFieldStatusType = 'warning' | 'error' | 'success';

export interface XDSFieldStatusInput {
  /**
   * The type of status to display.
   */
  type: XDSFieldStatusType;
  /**
   * Optional message to display below the input.
   */
  message?: string;
  /**
   * ID for the status message element (use for aria-describedby on the input).
   */
  messageID?: string;
}

export interface XDSFieldProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'children'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Label text for the field (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label and description (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and input.
   * Hidden when isLabelHidden is true.
   */
  description?: string;
  /**
   * ID for the input element (used for label's htmlFor attribute).
   */
  inputID: string;
  /**
   * ID for the description element (use for aria-describedby on the input).
   */
  descriptionID?: string;
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
   * Whether the associated input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | XDSIconType;
  /**
   * Status indicator for the field.
   * When set with a message, displays a colored message box below the input.
   */
  status?: XDSFieldStatusInput;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * How the status message is rendered relative to the input.
   * - 'attached': Status sits directly below the input (default, for bordered inputs)
   * - 'detached': Status is a separate element below the field (for checkboxes, switches, sliders)
   * @default 'attached'
   */
  statusVariant?: 'attached' | 'detached';
  /**
   * The input or control to render inside the field.
   */
  children: ReactNode;
}

/**
 * A form field wrapper that provides label and description.
 *
 * @example
 * ```
 * const id = useId();
 * const descID = useId();
 * <XDSField label="Email" description="We'll never share your email" inputID={id} descriptionID={descID}>
 *   <input id={id} aria-describedby={descID} />
 * </XDSField>
 * ```
 */
export function XDSField({
  label,
  isLabelHidden = false,
  description,
  inputID,
  descriptionID,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  labelIcon,
  status,
  labelTooltip,
  statusVariant = 'attached',
  xstyle,
  children,
  className,
  style,
  ref,
  ...props
}: XDSFieldProps) {
  const {direction} = use(XDSFormLayoutContext);
  const isHorizontalLabels = direction === 'horizontal-labels';

  const resolvedDescriptionID =
    descriptionID ?? (description ? `${inputID}-desc` : undefined);
  const resolvedMessageID =
    status?.messageID ?? (status?.message ? `${inputID}-status` : undefined);

  if (isOptional && isRequired) {
    console.warn(
      'XDSField: isOptional and isRequired are mutually exclusive. isOptional takes precedence.',
    );
  }

  const labelNode = (
    <XDSFieldLabel
      label={label}
      inputID={inputID}
      isLabelHidden={isLabelHidden}
      isDisabled={isDisabled}
      isOptional={isOptional}
      isRequired={isRequired}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      description={isHorizontalLabels ? undefined : description}
      descriptionID={isHorizontalLabels ? undefined : resolvedDescriptionID}
    />
  );

  const statusNode = status?.message ? (
    <XDSFieldStatus
      type={status.type}
      message={status.message}
      id={resolvedMessageID}
      variant={statusVariant}
    />
  ) : null;

  // ─── Horizontal-labels mode ───────────────────────────────────────────
  // Use display:contents so the parent grid's `auto 1fr` columns place
  // the label in column 1 and the input group in column 2. Description
  // and status are grouped with the input in column 2.
  // The label wrapper gets top padding to align label text with input text.
  if (isHorizontalLabels) {
    return (
      <div
        ref={ref}
        {...mergeProps(
          xdsClassName('field', {layout: 'horizontal-labels'}),
          stylex.props(styles.horizontalLabels, xstyle),
          className,
          style,
        )}
        {...props}>
        <div {...stylex.props(styles.horizontalLabelAlign)}>{labelNode}</div>
        <div {...stylex.props(styles.inputStatusWrapper)}>
          {description && (
            <XDSText
              type="supporting"
              display="block"
              id={resolvedDescriptionID}>
              {description}
            </XDSText>
          )}
          {children}
          {statusNode}
        </div>
      </div>
    );
  }

  // ─── Default mode (vertical / horizontal) ─────────────────────────────
  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('field'),
        stylex.props(
          styles.container,
          !isLabelHidden && styles.containerGap,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {labelNode}
      {statusVariant === 'attached' ? (
        <div {...stylex.props(styles.inputStatusWrapper)}>
          {children}
          {statusNode}
        </div>
      ) : (
        <>
          {children}
          {statusNode}
        </>
      )}
    </div>
  );
}

XDSField.displayName = 'XDSField';
