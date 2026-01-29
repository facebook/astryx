/**
 * @file XDSField.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode, XDSFieldLabel, XDSIconType
 * @output Exports XDSField component, XDSFieldProps
 * @position Core implementation; consumed by index.ts, tested by XDSField.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/README.md (props table, features, implementation notes)
 * - /packages/core/src/Field/XDSField.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Field/index.ts (exports if types change)
 * - /apps/storybook/stories/Field.stories.tsx (storybook stories)
 */

import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSFieldLabel} from './XDSFieldLabel';
import {
  colorVars,
  radiusVars,
  spacingVars,
  textSizeVars,
  typographyVars,
} from '../theme/tokens.stylex';
import type {XDSIconType} from '../Icon';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  labelRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  label: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: 500,
    color: colorVars['--color-text-primary'],
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
  description: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  optionalRequired: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
    marginInlineStart: spacingVars['--spacing-1'],
  },
  inputStatusWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  statusMessage: {
    marginTop: -6,
    paddingBlockStart: 14,
    paddingBlockEnd: 8,
    paddingInline: spacingVars['--spacing-2'],
    borderBottomLeftRadius: radiusVars['--radius-element'],
    borderBottomRightRadius: radiusVars['--radius-element'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: 1.333,
  },
});

const statusMessageColorStyles = stylex.create({
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

export type XDSFieldStatusType = 'warning' | 'error' | 'success';

export interface XDSFieldStatus {
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

export interface XDSFieldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Label text for the field (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and input.
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
   * Icon to display before the label text.
   */
  labelStartIcon?: XDSIconType;
  /**
   * Status indicator for the field.
   * When set with a message, displays a colored message box below the input.
   */
  status?: XDSFieldStatus;
  /**
   * The input or control to render inside the field.
   */
  children: ReactNode;
}

/**
 * A form field wrapper that provides label and description.
 *
 * @example
 * ```tsx
 * const id = useId();
 * const descID = useId();
 * <XDSField label="Email" description="We'll never share your email" inputID={id} descriptionID={descID}>
 *   <input id={id} aria-describedby={descID} />
 * </XDSField>
 * ```
 */
export const XDSField = forwardRef<HTMLDivElement, XDSFieldProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      inputID,
      descriptionID,
      isOptional = false,
      isRequired = false,
      labelStartIcon,
      status,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} {...stylex.props(styles.container)} {...props}>
        <XDSFieldLabel
          label={label}
          inputID={inputID}
          isLabelHidden={isLabelHidden}
          isOptional={isOptional}
          isRequired={isRequired}
          startIcon={labelStartIcon}
        />
        {description && (
          <span id={descriptionID} {...stylex.props(styles.description)}>
            {description}
          </span>
        )}
        <div {...stylex.props(styles.inputStatusWrapper)}>
          {children}
          {status?.message && (
            <div
              id={status.messageID}
              {...stylex.props(
                styles.statusMessage,
                statusMessageColorStyles[status.type]
              )}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    );
  }
);

XDSField.displayName = 'XDSField';
