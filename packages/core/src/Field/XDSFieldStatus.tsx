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
import {
  colorVars,
  lineHeightVars,
  radiusVars,
  spacingVars,
  textSizeVars,
  typographyVars,
} from '../theme/tokens.stylex';
import type {XDSInputStatusType} from './types';

const styles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  attached: {
    marginTop: -6,
    paddingBlockStart: 14,
    paddingBlockEnd: 8,
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
    backgroundColor: colorVars['--color-warning-deemphasized'],
    color: colorVars['--color-yellow-text'],
  },
  error: {
    backgroundColor: colorVars['--color-negative-deemphasized'],
    color: colorVars['--color-red-text'],
  },
  success: {
    backgroundColor: colorVars['--color-positive-deemphasized'],
    color: colorVars['--color-green-text'],
  },
});

export type XDSFieldStatusVariant = 'attached' | 'detached';

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
      {...stylex.props(
        styles.base,
        variant === 'attached' ? styles.attached : styles.detached,
        colorStyles[type],
      )}>
      {message}
    </div>
  );
}

XDSFieldStatus.displayName = 'XDSFieldStatus';
