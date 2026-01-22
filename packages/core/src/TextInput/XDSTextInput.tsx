/**
 * @file XDSTextInput.tsx
 * @input Uses React forwardRef, ChangeEvent
 * @output Exports XDSTextInput component, XDSTextInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTextInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/TextInput/XDSTextInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TextInput.stories.tsx (storybook stories)
 */

import { forwardRef, useId, type ChangeEvent } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  color,
  spacing,
  radius,
  transition,
  typography,
} from '../theme/tokens.stylex';

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
  input: {
    display: 'block',
    width: '100%',
    paddingBlock: spacing.space2,
    paddingInline: spacing.space3,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: color.dividerEmphasized,
      ':hover': color.dividerHighContrast,
    },
    borderRadius: radius.content,
    fontFamily: typography.fontFamilyBody,
    fontSize: '0.875rem',
    lineHeight: 1.429,
    color: color.textPrimary,
    backgroundColor: color.surface,
    transitionProperty: 'border-color, outline',
    transitionDuration: transition.fast,
    outline: {
      default: 'none',
      ':focus': `2px solid ${color.focusOutline}`,
    },
    outlineOffset: {
      default: '0',
      ':focus': '1px',
    },
    '::placeholder': {
      color: color.textPlaceholder,
    },
  },
});

export interface XDSTextInputProps {
  /**
   * Label text for the input (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Callback fired when the input value changes.
   */
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * The current value of the input.
   */
  value: string;
  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string;
}

/**
 * A text input component for collecting user input.
 *
 * @example
 * ```tsx
 * <XDSTextInput label="Name" value={name} onChange={setName} />
 * <XDSTextInput label="Search" isLabelHidden value={query} onChange={setQuery} />
 * ```
 */
export const XDSTextInput = forwardRef<HTMLInputElement, XDSTextInputProps>(
  ({ label, isLabelHidden = false, onChange, value, placeholder }, ref) => {
    const id = useId();

    return (
      <div {...stylex.props(styles.container)}>
        <label
          htmlFor={id}
          {...stylex.props(styles.label, isLabelHidden && styles.labelHidden)}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value, e)}
          placeholder={placeholder}
          {...stylex.props(styles.input)}
        />
      </div>
    );
  }
);

XDSTextInput.displayName = 'XDSTextInput';
