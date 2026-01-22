/**
 * @file XDSTextInput.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSField
 * @output Exports XDSTextInput component, XDSTextInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTextInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/TextInput/XDSTextInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TextInput.stories.tsx (storybook stories)
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
  input: {
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
    borderRadius: radiusVars['--radius-content'],
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
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
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
   * Description text displayed between the label and input.
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
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
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
  (
    {
      label,
      isLabelHidden = false,
      description,
      isOptional = false,
      isRequired = false,
      isDisabled = false,
      onChange,
      value,
      placeholder,
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
        <input
          ref={ref}
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value, e)}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-describedby={description ? descriptionID : undefined}
          aria-required={isRequired === true ? 'true' : undefined}
          {...stylex.props(styles.input, isDisabled && styles.disabled)}
        />
      </XDSField>
    );
  },
);

XDSTextInput.displayName = 'XDSTextInput';
