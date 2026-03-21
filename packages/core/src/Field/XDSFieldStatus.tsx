/**
 * @file XDSFieldStatus.tsx
 * @input Uses React, stylex, theme tokens
 * @output Exports XDSFieldStatus component, XDSFieldStatusProps
 * @position Core implementation; consumed by index.ts, XDSField.tsx, XDSSwitch.tsx, XDSCheckboxInput.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/Field.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/index.ts (exports if types change)
 */

import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';
import {
  colorVars,
  lineHeightVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {XDSInputStatusType} from './types';

const styles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  attached: {
    marginTop: -6,
    paddingBlockStart: 14,
    paddingBlockEnd: 8,
    paddingInline: spacingVars['--spacing-2'],
    borderBottomLeftRadius: radiusVars['--radius-2'],
    borderBottomRightRadius: radiusVars['--radius-2'],
  },
  detached: {
    marginTop: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-2'],
  },
});

const colorStyles = stylex.create({
  warning: {
    backgroundColor: colorVars['--color-warning-muted'],
    color: colorVars['--color-yellow-text'],
  },
  error: {
    backgroundColor: colorVars['--color-error-muted'],
    color: colorVars['--color-red-text'],
  },
  success: {
    backgroundColor: colorVars['--color-success-muted'],
    color: colorVars['--color-green-text'],
  },
});

/**
 * Extensible variant map for XDSFieldStatus.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Field' {
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

export interface XDSFieldStatusProps {
  /**
   * The type of status to display.
   */
  type: XDSInputStatusType;
  /**
   * The status message to display.
   */
  message: string;
  /**
   * ID for the status message element (use for aria-describedby on the input).
   */
  id?: string;
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
  type,
  message,
  id,
  variant = 'attached',
}: XDSFieldStatusProps) {
  return (
    <div
      id={id}
      {...mergeProps(
        xdsClassName('field-status', {type, variant}),
        stylex.props(
          styles.base,
          variant === 'attached' ? styles.attached : styles.detached,
          colorStyles[type],
        ),
      )}>
      {message}
    </div>
  );
}

XDSFieldStatus.displayName = 'XDSFieldStatus';
