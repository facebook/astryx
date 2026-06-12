// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSFieldStatus.tsx
 * @input Uses React, stylex, theme tokens
 * @output Exports XDSFieldStatus component, XDSFieldStatusProps
 * @position Core implementation; consumed by Field, Switch, CheckboxInput, and the FieldStatus entrypoint
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FieldStatus/FieldStatus.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/Field.doc.mjs (compat docs when public API changes)
 * - /packages/core/src/FieldStatus/index.ts (exports if types change)
 * - /packages/core/src/Field/index.ts (compat re-export if public API changes)
 * - /packages/cli/templates/blocks/components/FieldStatus/ (showcase blocks)
 */

'use client';

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {XDSInputStatusType} from '../Field/types';
import {useEntryAnimation} from '../hooks/useEntryAnimation';

const styles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  attached: {
    marginTop: `calc(-1 * ${spacingVars['--spacing-1-5']})`,
    paddingBlockStart: `calc(${spacingVars['--spacing-1-5']} + ${spacingVars['--spacing-2']})`,
    paddingBlockEnd: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderBottomLeftRadius: radiusVars['--radius-element'],
    borderBottomRightRadius: radiusVars['--radius-element'],
  },
  detached: {
    marginTop: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
  },
});

const colorStyles = stylex.create({
  warning: {
    backgroundColor: colorVars['--color-warning-muted'],
    color: colorVars['--color-text-yellow'],
  },
  error: {
    backgroundColor: colorVars['--color-error-muted'],
    color: colorVars['--color-text-red'],
  },
  success: {
    backgroundColor: colorVars['--color-success-muted'],
    color: colorVars['--color-text-green'],
  },
});

/**
 * Extensible variant map for XDSFieldStatus.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/FieldStatus' {
 *   interface XDSFieldStatusVariantMap {
 *     'inline': true;
 *   }
 * }
 * ```
 */
export interface XDSFieldStatusVariantMap {
  attached: true;
  detached: true;
}

/**
 * FieldStatus variant type. Extensible via module augmentation of XDSFieldStatusVariantMap.
 */
export type XDSFieldStatusVariant = keyof XDSFieldStatusVariantMap;

export interface XDSFieldStatusProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The type of status to display.
   */
  type: XDSInputStatusType;
  /**
   * The status message to display.
   */
  message: string;
  /**
   * Visual variant of the status message.
   * - 'attached': Overlaps with input above (used in XDSField)
   * - 'detached': Floats below with spacing (used in XDSSwitch, XDSCheckboxInput)
   * @default 'attached'
   */
  variant?: XDSFieldStatusVariant;
}

/**
 * A status message component for form fields.
 *
 * @example
 * ```
 * <XDSFieldStatus
 *   type="error"
 *   message="This field is required"
 * />
 * <XDSFieldStatus
 *   type="warning"
 *   message="This will be visible to others"
 *   variant="detached"
 * />
 * ```
 */
export function XDSFieldStatus({
  ref,
  type,
  message,
  id,
  variant = 'attached',
}: XDSFieldStatusProps) {
  const entryStyle = useEntryAnimation('slideDown');

  return (
    <div
      ref={ref}
      id={id}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      {...mergeProps(
        xdsClassName('field-status', {type, variant}),
        stylex.props(
          styles.base,
          entryStyle,
          variant === 'attached' ? styles.attached : styles.detached,
          colorStyles[type],
        ),
      )}>
      {message}
    </div>
  );
}

XDSFieldStatus.displayName = 'XDSFieldStatus';
