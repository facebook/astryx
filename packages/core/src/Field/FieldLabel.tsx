// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file FieldLabel.tsx
 * @input Uses React, Icon, IconType, useTranslator
 * @output Exports FieldLabel component, FieldLabelProps
 * @position Core label implementation; used by Field, CheckboxInput, Switch
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/Field.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/index.ts (exports if types change)
 * - /packages/cli/templates/blocks/components/Field/ (showcase blocks)
 * - /packages/core/locales/en.json (@astryx.field.required / @astryx.field.optional)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';

import {
  colorVars,
  fontWeightVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {Tooltip} from '../Tooltip';
import {useTranslator} from '../i18n';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  label: {
    display: 'flex',
    // Wraps so the (optional) description, forced onto its own line via
    // descriptionNested's flexBasis: '100%' below, can be a real DOM child of
    // <label> rather than a sibling — a click anywhere in it then activates
    // the single control the label names, the same as clicking the label
    // text itself. columnGap keeps the row's icon/text/status/tooltip
    // spacing unchanged; rowGap matches the tighter spacing
    // CheckboxInput/Switch previously supplied via an external wrapper.
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacingVars['--spacing-1'],
    rowGap: spacingVars['--spacing-0-5'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
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
    insetInlineStart: 0,
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
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
  },
  description: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  // Forces the description onto its own line within the wrapping <label>
  // (see styles.label) instead of trailing the row on the same line.
  descriptionNested: {
    flexBasis: '100%',
  },
});

export interface FieldLabelProps extends BaseProps<HTMLLabelElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLabelElement>;
  /**
   * Label text (always rendered for accessibility).
   */
  label: string;
  /**
   * ID of the input element this label points AT (rendered as `htmlFor` on the
   * label). This is *not* the id of the label element itself — see
   * `labelID` for that.
   */
  inputID: string;
  /**
   * The `id` applied TO the label element itself (not the element it points
   * at — that's `inputID`). A grouping control (e.g. `role="radiogroup"`) can
   * reference this via `aria-labelledby` to take the label as its accessible
   * name.
   */
  labelID?: string;
  /**
   * When true, the field wraps a *group* of controls (e.g. a radiogroup)
   * rather than a single input. In that case the label is rendered as a
   * `<span>` instead of a `<label>` — a `<label>` semantically names one form
   * control and can't be associated with a group, so it must not be a literal
   * label element. The group takes the label as its name via
   * `labelID` + `aria-labelledby`.
   * @default false
   */
  isGroupLabel?: boolean;
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
  labelIcon?: ReactNode | IconType;
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
 * <FieldLabel label="Email" inputID={inputId} description="We won't share it" />
 * <FieldLabel label="Search" inputID={inputId} isLabelHidden />
 * ```
 */
export function FieldLabel({
  label,
  inputID,
  labelID,
  isGroupLabel = false,
  isLabelHidden = false,
  isDisabled = false,
  isOptional = false,
  isRequired = false,
  labelIcon,
  labelTooltip,
  description,
  descriptionID,
  className,
  style,
  xstyle,
  ref,
  ...rest
}: FieldLabelProps) {
  const t = useTranslator();
  const statusText = isOptional
    ? t('@astryx.field.optional')
    : isRequired
      ? t('@astryx.field.required')
      : null;

  // A group label (e.g. for a radiogroup) must not be a literal `<label>`
  // element: a `<label>` semantically names a single form control and can't be
  // associated with a group. Render it as a `<span>` instead, keeping all the
  // label styling and slots. The group references it via `aria-labelledby`.
  const LabelElement = isGroupLabel ? 'span' : 'label';

  const labelContent = (
    <>
      {labelIcon && renderIconSlot(labelIcon, {size: 'sm', color: 'inherit'})}
      {label}
      {statusText && (
        <span {...stylex.props(styles.optionalRequired)}>
          <span aria-hidden="true"> ∙ </span>
          {statusText}
        </span>
      )}
      {labelTooltip && (
        <Tooltip content={labelTooltip} placement="above">
          <Icon icon="info" size="sm" color="inherit" />
        </Tooltip>
      )}
    </>
  );

  const descriptionText = description && (
    <span
      id={descriptionID}
      {...stylex.props(
        styles.description,
        // Nested inside <label> (not isGroupLabel) so a click anywhere in the
        // description also activates the single control it names, matching
        // the label text's own hit area. flexBasis: '100%' (via
        // descriptionNested) forces it onto its own line within the
        // wrapping <label> instead of trailing the row. A group label has no
        // single input to activate, so its description stays a plain
        // sibling below, unaffected by the label's flex layout.
        !isGroupLabel && styles.descriptionNested,
        isLabelHidden && styles.srOnly,
      )}>
      {description}
    </span>
  );

  return (
    <>
      <LabelElement
        ref={ref}
        id={labelID}
        // `htmlFor` only applies to a real `<label>` associating with a single
        // control; a group label (span) has no `htmlFor`.
        htmlFor={isGroupLabel ? undefined : inputID}
        {...rest}
        {...mergeProps(
          themeProps('field-label'),
          stylex.props(
            styles.label,
            isDisabled && styles.labelDisabled,
            isLabelHidden && styles.srOnly,
            xstyle,
          ),
          className,
          style,
        )}>
        {labelContent}
        {!isGroupLabel && descriptionText}
      </LabelElement>
      {isGroupLabel && descriptionText}
    </>
  );
}

FieldLabel.displayName = 'FieldLabel';
