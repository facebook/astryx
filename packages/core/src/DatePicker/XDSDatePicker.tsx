/**
 * @file XDSDatePicker.tsx
 * @input Uses React forwardRef, useId, useState, useEffect, useCallback, useRef, XDSField, XDSIcon, XDSCalendar, useXDSPopover
 * @output Exports XDSDatePicker component, XDSDatePickerProps
 * @position Core implementation; consumed by index.ts, tested by XDSDatePicker.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DatePicker/README.md (props table, features, implementation notes)
 * - /packages/core/src/DatePicker/XDSDatePicker.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DatePicker/index.ts (exports if types change)
 * - /apps/storybook/stories/DatePicker.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  useId,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {CalendarDaysIcon} from '@heroicons/react/24/outline';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  elevationVars,
} from '../theme/tokens.stylex';
import {XDSField} from '../Field';
import {XDSIcon} from '../Icon';
import {XDSCalendar, type ISODateString} from '../Calendar';
import {useXDSPopover} from '../Layer';
import {parseDateInput, formatDisplayDate} from '../utils';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-high-contrast'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '1px',
    },
  },
  wrapperDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: 1,
  },
  iconButtonDisabled: {
    cursor: 'not-allowed',
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-normal'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  popover: {
    backgroundColor: colorVars['--color-popover'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-menu'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: 18,
  },
  md: {
    height: 26,
  },
});

export type XDSDatePickerSize = keyof typeof sizeStyles;

export interface XDSDatePickerProps {
  /**
   * Label text for the input (required for accessibility).
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
   * The selected date in ISO format (YYYY-MM-DD).
   */
  value?: ISODateString;

  /**
   * Callback fired when the date changes.
   * Called with undefined when input is cleared.
   */
  onChange: (value: ISODateString | undefined) => void;

  /**
   * Minimum selectable date in ISO format.
   */
  min?: ISODateString;

  /**
   * Maximum selectable date in ISO format.
   */
  max?: ISODateString;

  /**
   * Custom date constraint functions. Date is disabled if ANY function returns false.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;

  /**
   * Placeholder text shown when no date is selected.
   * @default "Select a date"
   */
  placeholder?: string;

  /**
   * The size of the input.
   * - 'sm': Compact size (18px height)
   * - 'md': Default size (26px height)
   * @default 'md'
   */
  size?: XDSDatePickerSize;

  /**
   * Number of months to display in the calendar popover.
   * @default 1
   */
  numberOfMonths?: 1 | 2;
}

/**
 * A date picker component combining a text input with a calendar popover.
 *
 * @example
 * ```tsx
 * <XDSDatePicker
 *   label="Event date"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 */
export const XDSDatePicker = forwardRef<HTMLInputElement, XDSDatePickerProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      isOptional = false,
      isRequired = false,
      isDisabled = false,
      value,
      onChange,
      min,
      max,
      dateConstraints,
      placeholder = 'Select a date',
      size = 'md',
      numberOfMonths = 1,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Track input text separately from value for manual editing
    const [inputValue, setInputValue] = useState('');

    // Use XDSPopover for popover rendering, positioning, and focus trapping
    const popover = useXDSPopover({
      xstyle: styles.popover,
      dialogLabel: 'Choose date',
      closeButtonLabel: 'Close calendar',
      onHide: () => {
        // Return focus to input when popover closes
        inputRef.current?.focus();
      },
    });

    // Sync input value with controlled value
    useEffect(() => {
      if (value) {
        setInputValue(formatDisplayDate(value));
      } else {
        setInputValue('');
      }
    }, [value]);

    // Handle opening the popover
    const handleOpen = useCallback(() => {
      if (!isDisabled && !popover.isOpen) {
        popover.show();
      }
    }, [isDisabled, popover]);

    // Handle date selection from calendar
    const handleDateSelect = useCallback(
      (selectedDate: ISODateString) => {
        onChange(selectedDate);
        popover.hide();
      },
      [onChange, popover],
    );

    // Handle input text change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      },
      [],
    );

    // Handle blur - parse the input and validate
    const handleBlur = useCallback(() => {
      if (!inputValue.trim()) {
        // Empty input clears the value
        if (value !== undefined) {
          onChange(undefined);
        }
        return;
      }

      const parsed = parseDateInput(inputValue);
      if (parsed) {
        // Valid date - update if different
        if (parsed !== value) {
          onChange(parsed);
        }
      } else {
        // Invalid date - revert to previous value
        if (value) {
          setInputValue(formatDisplayDate(value));
        } else {
          setInputValue('');
        }
      }
    }, [inputValue, value, onChange]);

    // Handle keyboard events on input
    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && popover.isOpen) {
          e.preventDefault();
          popover.hide();
        }
      },
      [popover],
    );

    // Combine refs
    const setRefs = useCallback(
      (el: HTMLInputElement | null) => {
        inputRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      },
      [ref],
    );

    return (
      <XDSField
        label={label}
        isLabelHidden={isLabelHidden}
        description={description}
        inputID={id}
        descriptionID={description ? descriptionID : undefined}
        isOptional={isOptional}
        isRequired={isRequired}>
        <div
          ref={popover.triggerRef}
          {...stylex.props(
            styles.wrapper,
            isDisabled && styles.wrapperDisabled,
          )}>
          <button
            type="button"
            onClick={handleOpen}
            disabled={isDisabled}
            aria-label="Open calendar"
            {...popover.triggerProps}
            {...stylex.props(
              styles.iconButton,
              isDisabled && styles.iconButtonDisabled,
            )}>
            <XDSIcon icon={CalendarDaysIcon} size="sm" color="secondary" />
          </button>
          <input
            ref={setRefs}
            id={id}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onClick={handleOpen}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            aria-describedby={description ? descriptionID : undefined}
            aria-required={isRequired === true ? 'true' : undefined}
            {...stylex.props(
              styles.input,
              sizeStyles[size],
              isDisabled && styles.inputDisabled,
            )}
          />
        </div>
        {popover.render(
          <XDSCalendar
            mode="single"
            value={value}
            onChange={handleDateSelect}
            min={min}
            max={max}
            dateConstraints={dateConstraints}
            numberOfMonths={numberOfMonths}
            focusDate={value}
          />,
          {placement: 'below', alignment: 'start'},
        )}
      </XDSField>
    );
  },
);

XDSDatePicker.displayName = 'XDSDatePicker';
