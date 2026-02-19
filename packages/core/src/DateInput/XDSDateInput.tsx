/**
 * @file XDSDateInput.tsx
 * @input Uses React forwardRef, useId, useState, useEffect, useCallback, useRef, XDSField, XDSIcon, XDSCalendar, useXDSPopover
 * @output Exports XDSDateInput component, XDSDateInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSDateInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/DateInput/XDSDateInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DateInput/index.ts (exports if types change)
 * - /apps/storybook/stories/DateInput.stories.tsx (storybook stories)
 */

import {forwardRef, useId, useState, useCallback, useRef, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {CalendarDaysIcon} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  elevationVars,
} from '../theme/tokens.stylex';
import {XDSField, type XDSInputStatus, type XDSInputStatusType} from '../Field';
import {XDSIcon} from '../Icon';
import {
  XDSCalendar,
  type ISODateString,
  type XDSCalendarHandle,
} from '../Calendar';
import {useXDSPopover} from '../Layer';
import {parseDateInput, formatDisplayDate} from '../utils';

const styles = stylex.create({
  wrapper: {
    boxSizing: 'border-box',
    position: 'relative',
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
  inputInvalid: {
    color: colorVars['--color-text-secondary'],
  },
  popover: {
    backgroundColor: colorVars['--color-popover'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-menu'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
  },
});

const statusBorderStyles = stylex.create({
  warning: {
    borderColor: colorVars['--color-warning'],
  },
  error: {
    borderColor: colorVars['--color-negative'],
  },
  success: {
    borderColor: colorVars['--color-positive'],
  },
});

export type XDSDateInputSize = keyof typeof sizeStyles;

// Re-export shared types for convenience
export type {
  XDSInputStatus as XDSDateInputStatus,
  XDSInputStatusType as XDSDateInputStatusType,
} from '../Field';

export interface XDSDateInputProps {
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
  size?: XDSDateInputSize;

  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays below the input.
   */
  status?: XDSInputStatus;

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
 * <XDSDateInput
 *   label="Event date"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 */
export const XDSDateInput = forwardRef<HTMLInputElement, XDSDateInputProps>(
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
      status,
      numberOfMonths = 1,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();
    const statusMessageID = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const calendarRef = useRef<XDSCalendarHandle | null>(null);

    // Status icon mapping
    const statusIconMap: Record<XDSInputStatusType, typeof CalendarDaysIcon> = {
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      success: CheckCircleIcon,
    };

    const statusIconColorMap: Record<
      XDSInputStatusType,
      'warning' | 'negative' | 'positive'
    > = {
      warning: 'warning',
      error: 'negative',
      success: 'positive',
    };

    const ariaDescribedBy =
      [
        description ? descriptionID : null,
        status?.message ? statusMessageID : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    // Pending input while user is typing (null = show formatted value)
    const [pendingInput, setPendingInput] = useState<string | null>(null);

    // Display value: pending input if typing, otherwise formatted value
    const displayValue = useMemo(() => {
      if (pendingInput !== null) {
        return pendingInput;
      }
      return value ? formatDisplayDate(value) : '';
    }, [pendingInput, value]);

    // Check if current input is valid (for styling purposes)
    const isInputValid = useMemo(() => {
      // Only check pending input for validity styling
      if (pendingInput === null || !pendingInput.trim()) {
        return true;
      }
      return parseDateInput(pendingInput) !== null;
    }, [pendingInput]);

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

    // Handle opening the popover from button click (focus calendar)
    const handleOpen = useCallback(() => {
      if (!isDisabled && !popover.isOpen) {
        popover.show();
      }
    }, [isDisabled, popover]);

    // Handle opening the popover from input click (keep focus in input)
    const handleInputClick = useCallback(() => {
      if (!isDisabled && !popover.isOpen) {
        popover.show({skipAutoFocus: true});
      }
    }, [isDisabled, popover]);

    // Handle date selection from calendar
    const handleDateSelect = useCallback(
      (selectedDate: ISODateString) => {
        onChange(selectedDate);
        setPendingInput(null);
        popover.hide();
      },
      [onChange, popover],
    );

    // Handle input text change - update immediately if valid
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setPendingInput(newValue);

        // If the input is valid, update immediately (don't wait for blur)
        const parsed = parseDateInput(newValue);
        if (parsed && parsed !== value) {
          onChange(parsed);
          // Navigate calendar to show the parsed date's month
          calendarRef.current?.navigateTo(parsed);
        }
      },
      [value, onChange],
    );

    // Handle blur - validate and clear pending input
    const handleBlur = useCallback(() => {
      if (pendingInput === null) {
        return;
      }

      if (!pendingInput.trim()) {
        // Empty input clears the value
        if (value !== undefined) {
          onChange(undefined);
        }
        setPendingInput(null);
        return;
      }

      const parsed = parseDateInput(pendingInput);
      if (parsed) {
        // Valid date - update if different
        if (parsed !== value) {
          onChange(parsed);
        }
      }
      // Clear pending input - display will revert to formatted value
      setPendingInput(null);
    }, [pendingInput, value, onChange]);

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
        isRequired={isRequired}
        status={
          status
            ? {
                type: status.type,
                message: status.message,
                messageID: status.message ? statusMessageID : undefined,
              }
            : undefined
        }>
        <div
          ref={popover.triggerRef}
          {...stylex.props(
            styles.wrapper,
            sizeStyles[size],
            isDisabled && styles.wrapperDisabled,
            status && statusBorderStyles[status.type],
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
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onClick={handleInputClick}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={status?.type === 'error' ? 'true' : undefined}
            {...stylex.props(
              styles.input,
              isDisabled && styles.inputDisabled,
              !isInputValid && styles.inputInvalid,
            )}
          />
          {status && (
            <XDSIcon
              icon={statusIconMap[status.type]}
              size="md"
              color={statusIconColorMap[status.type]}
            />
          )}
        </div>
        {popover.render(
          <XDSCalendar
            ref={calendarRef}
            mode="single"
            value={value}
            onChange={handleDateSelect}
            min={min}
            max={max}
            dateConstraints={dateConstraints}
            numberOfMonths={numberOfMonths}
          />,
          {placement: 'below', alignment: 'start'},
        )}
      </XDSField>
    );
  },
);

XDSDateInput.displayName = 'XDSDateInput';
