/**
 * @file XDSField.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSField component, XDSFieldProps
 * @position Core implementation; consumed by index.ts, tested by XDSField.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/README.md (props table, features, implementation notes)
 * - /packages/core/src/Field/XDSField.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Field/index.ts (exports if types change)
 * - /apps/storybook/stories/Field.stories.tsx (storybook stories)
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { color, spacing, typography } from '../theme/tokens.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.space1,
  },
  label: {
    fontFamily: typography.fontFamilyBody,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: color.textPrimary,
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
    fontFamily: typography.fontFamilyBody,
    fontSize: '0.75rem',
    color: color.textSecondary,
  },
});

export interface XDSFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
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
   * ID for the label's htmlFor attribute (should match the input's id).
   */
  labelID: string;
  /**
   * ID for the description element (use for aria-describedby on the input).
   */
  descriptionID?: string;
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
 * <XDSField label="Email" description="We'll never share your email" labelID={id} descriptionID={descID}>
 *   <input id={id} aria-describedby={descID} />
 * </XDSField>
 * ```
 */
export const XDSField = forwardRef<HTMLDivElement, XDSFieldProps>(
  ({ label, isLabelHidden = false, description, labelID, descriptionID, children, ...props }, ref) => {
    return (
      <div ref={ref} {...stylex.props(styles.container)} {...props}>
        <label
          htmlFor={labelID}
          {...stylex.props(styles.label, isLabelHidden && styles.labelHidden)}
        >
          {label}
        </label>
        {description && (
          <span id={descriptionID} {...stylex.props(styles.description)}>
            {description}
          </span>
        )}
        {children}
      </div>
    );
  }
);

XDSField.displayName = 'XDSField';
