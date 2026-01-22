/**
 * @file XDSTextArea.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSField
 * @output Exports XDSTextArea component, XDSTextAreaProps
 * @position Core implementation; consumed by index.ts, tested by XDSTextArea.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextArea/README.md (props table, features, implementation notes)
 * - /packages/core/src/TextArea/XDSTextArea.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextArea/index.ts (exports if types change)
 * - /apps/storybook/stories/TextArea.stories.tsx (storybook stories)
 */

import {forwardRef, useId, type ChangeEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {XDSField} from '../Field';

const styles = stylex.create({
  textarea: {
    display: 'block',
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-high-contrast'],
    },
    borderRadius: radiusVars['--radius-element'],
    fontFamily: typographyVars['--font-body'],
    fontSize: '0.875rem',
    lineHeight: 1.429,
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: 'none',
      ':focus': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus': '1px',
    },
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
    },
    resize: 'vertical',
    minHeight: '80px',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-emphasized'],
    },
  },
});

export interface XDSTextAreaProps {
  /**
   * Label text for the textarea (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and textarea.
   */
  description?: string;
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
   * Callback fired when the textarea value changes.
   */
  onChange: (value: string, e: ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * The current value of the textarea.
   */
  value: string;
  /**
   * Placeholder text shown when the textarea is empty.
   */
  placeholder?: string;
  /**
   * The number of visible text rows.
   * @default 3
   */
  rows?: number;
  /**
   * Whether the textarea is disabled.
   * @default false
   */
  isDisabled?: boolean;
}

/**
 * A multi-line text input component for collecting longer user input.
 *
 * @example
 * ```tsx
 * <XDSTextArea label="Description" value={description} onChange={setDescription} />
 * <XDSTextArea label="Notes" rows={5} value={notes} onChange={setNotes} />
 * ```
 */
export const XDSTextArea = forwardRef<HTMLTextAreaElement, XDSTextAreaProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      isOptional = false,
      isRequired = false,
      onChange,
      value,
      placeholder,
      rows = 3,
      isDisabled = false,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();

    return (
      <XDSField
        label={label}
        isLabelHidden={isLabelHidden}
        description={description}
        inputID={id}
        descriptionID={description ? descriptionID : undefined}
        isOptional={isOptional}
        isRequired={isRequired}>
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={e => onChange(e.target.value, e)}
          placeholder={placeholder}
          rows={rows}
          disabled={isDisabled}
          aria-describedby={description ? descriptionID : undefined}
          aria-required={isRequired === true ? 'true' : undefined}
          {...stylex.props(styles.textarea, isDisabled && styles.disabled)}
        />
      </XDSField>
    );
  },
);

XDSTextArea.displayName = 'XDSTextArea';
