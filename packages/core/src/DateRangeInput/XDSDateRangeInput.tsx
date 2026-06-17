// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSDateRangeInput.tsx
 * @input Uses React, XDSField, XDSCalendar (range mode), useXDSPopover
 * @output Exports XDSDateRangeInput component, XDSDateRangeInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSDateRangeInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateRangeInput/DateRangeInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/DateRangeInput/XDSDateRangeInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DateRangeInput/index.ts (exports if types change)
 * - /apps/storybook/stories/DateRangeInput.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/DateRangeInput/ (showcase blocks)
 */

import {useId, useCallback, useMemo, useOptimistic, useTransition} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  plainDateFromISO,
  plainDateToday,
  plainDateFormat,
  DATE_FORMAT_SHORT,
  DATE_FORMAT_SHORT_WITH_YEAR,
} from '../utils/plainDate';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {
  XDSField,
  type XDSInputStatus,
  type XDSInputStatusType,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {XDSIcon} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {XDSCalendar, type ISODateString, type DateRange} from '../Calendar';
import {useXDSPopover} from '../Popover';
import {mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import {xdsThemeProps} from '../utils/xdsThemeProps';

export type {DateRange as XDSDateRange} from '../Calendar';

export interface XDSDateRangePreset {
  label: string;
  getRange: () => DateRange;
}

export type XDSDateRangeInputSize = 'sm' | 'md' | 'lg';

export type {
  XDSInputStatus as XDSDateRangeInputStatus,
  XDSInputStatusType as XDSDateRangeInputStatusType,
} from '../Field';

const styles = stylex.create({
  trigger: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    cursor: 'pointer',
    textAlign: 'start',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  triggerPlaceholder: {
    color: colorVars['--color-text-secondary'],
  },
  triggerDisabled: {
    cursor: 'not-allowed',
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
      ':focus-visible': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 1,
  },
  iconButtonDisabled: {
    cursor: 'not-allowed',
  },
  popoverLayout: {
    display: 'flex',
  },
  presetSidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-3'],
    borderRightWidth: borderVars['--border-width'],
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-border-emphasized'],
    minWidth: 140,
  },
  presetButton: {
    display: 'block',
    width: '100%',
    padding: `${spacingVars['--spacing-1']} ${spacingVars['--spacing-2']}`,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    textAlign: 'start',
    outline: {
      default: 'none',
      ':focus-visible': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
  },
  presetButtonActive: {
    backgroundColor: colorVars['--color-accent-muted'],
    color: colorVars['--color-accent'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
    minWidth: 180,
  },
  md: {
    height: sizeVars['--size-element-md'],
    minWidth: 180,
  },
  lg: {
    height: sizeVars['--size-element-lg'],
    minWidth: 180,
  },
});

function formatRangeDisplay(range: DateRange | null): string {
  if (!range) {
    return '';
  }
  const start = plainDateFromISO(range.start);
  const end = plainDateFromISO(range.end);
  const currentYear = plainDateToday().year;
  const sameYear = start.year === end.year && start.year === currentYear;

  const fmt = sameYear ? DATE_FORMAT_SHORT : DATE_FORMAT_SHORT_WITH_YEAR;
  return `${plainDateFormat(start, fmt)} – ${plainDateFormat(end, fmt)}`;
}

function isRangeEqual(a: DateRange | null, b: DateRange | null): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.start === b.start && a.end === b.end;
}

export interface XDSDateRangeInputProps extends Omit<
  XDSBaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the trigger button */
  ref?: React.Ref<HTMLButtonElement>;

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
   * The selected date range, or null if no range is selected.
   */
  value: DateRange | null;

  /**
   * Callback fired when the date range changes.
   * Called with null when the range is cleared.
   */
  onChange: (value: DateRange | null) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  changeAction?: (value: DateRange | null) => void | Promise<void>;

  /**
   * Whether the input is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Minimum selectable date in ISO format.
   */
  min?: ISODateString;

  /**
   * Maximum selectable date in ISO format.
   */
  max?: ISODateString;

  /**
   * Custom date constraint functions.
   * A date is disabled if ANY function returns false.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;

  /**
   * Preset date ranges shown as quick-select options beside the calendar.
   */
  presets?: ReadonlyArray<XDSDateRangePreset>;

  /**
   * Whether to show a clear button when a range is selected.
   * @default true
   */
  hasClear?: boolean;

  /**
   * Placeholder text shown when no range is selected.
   * @default "Select date range"
   */
  placeholder?: string;

  /**
   * The size of the trigger.
   * @default 'md'
   */
  size?: XDSDateRangeInputSize;

  /**
   * Status indicator for the input.
   */
  status?: XDSInputStatus;

  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;

  /**
   * Number of months to display in the calendar.
   * @default 2
   */
  numberOfMonths?: 1 | 2;
}

/**
 * A date range picker with a button trigger that opens a popover
 * containing a dual-month calendar and optional preset ranges.
 *
 * @example
 * ```
 * <XDSDateRangeInput
 *   label="Date range"
 *   value={range}
 *   onChange={setRange}
 *   presets={[
 *     { label: "Last 7 days", getRange: () => ({start: "...", end: "..."}) },
 *   ]}
 * />
 * ```
 */
export function XDSDateRangeInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  value,
  onChange,
  changeAction,
  isLoading = false,
  min,
  max,
  dateConstraints,
  presets,
  hasClear = true,
  placeholder = 'Select date range',
  size: sizeProp,
  status,
  labelTooltip,
  numberOfMonths = 2,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: XDSDateRangeInputProps) {
  const size = useXDSSize(sizeProp, 'md');
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isBusy;

  const statusIconMap: Record<XDSInputStatusType, XDSIconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const statusIconColorMap: Record<
    XDSInputStatusType,
    'warning' | 'error' | 'success'
  > = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const displayValue = useMemo(
    () => formatRangeDisplay(optimisticValue),
    [optimisticValue],
  );

  const popover = useXDSPopover({
    dialogLabel: 'Choose date range',
    closeButtonLabel: 'Close calendar',
  });

  const fireChange = useCallback(
    (newValue: DateRange | null) => {
      if (isBusy) {
        return;
      }
      onChange(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [isBusy, onChange, changeAction, startTransition, setOptimisticValue],
  );

  const handleToggle = useCallback(() => {
    if (!isEffectivelyDisabled) {
      if (popover.isOpen) {
        popover.hide();
      } else {
        popover.show();
      }
    }
  }, [isEffectivelyDisabled, popover]);

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      fireChange(range);
      popover.hide();
    },
    [fireChange, popover],
  );

  const handlePresetClick = useCallback(
    (preset: XDSDateRangePreset) => {
      fireChange(preset.getRange());
      popover.hide();
    },
    [fireChange, popover],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      fireChange(null);
    },
    [fireChange],
  );

  const triggerAriaLabel = value
    ? `${label}: ${displayValue}`
    : `${label}: ${placeholder}`;

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isEffectivelyDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}>
      <div
        ref={popover.triggerRef}
        {...rest}
        {...mergeProps(
          xdsThemeProps('date-range-input', {
            size,
            status: status?.type ?? null,
          }),
          stylex.props(
            inputWrapperStyles.base,
            sizeStyles[size],
            isEffectivelyDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isEffectivelyDisabled}
          aria-label={popover.isOpen ? 'Close calendar' : 'Open calendar'}
          tabIndex={-1}
          {...stylex.props(
            styles.iconButton,
            isEffectivelyDisabled && styles.iconButtonDisabled,
          )}>
          <XDSIcon icon="calendar" size="sm" color="secondary" />
        </button>
        <button
          ref={ref}
          id={id}
          type="button"
          onClick={handleToggle}
          disabled={isEffectivelyDisabled}
          aria-label={triggerAriaLabel}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired === true ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          aria-expanded={popover.isOpen}
          aria-haspopup="dialog"
          aria-controls={popover.isOpen ? popover.id : undefined}
          {...stylex.props(
            styles.trigger,
            !displayValue && styles.triggerPlaceholder,
            isEffectivelyDisabled && styles.triggerDisabled,
          )}>
          {displayValue || placeholder}
        </button>
        {hasClear && value !== null && !isEffectivelyDisabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={`Clear ${label}`}
            {...stylex.props(styles.iconButton)}>
            <XDSIcon icon="close" size="sm" color="secondary" />
          </button>
        )}
        {isBusy && <XDSSpinner size="sm" />}
        {status && (
          <XDSIcon
            icon={statusIconMap[status.type]}
            size="md"
            color={statusIconColorMap[status.type]}
          />
        )}
      </div>
      {popover.render(
        <div {...stylex.props(styles.popoverLayout)}>
          {presets && presets.length > 0 && (
            <div
              role="listbox"
              aria-label="Preset date ranges"
              {...stylex.props(styles.presetSidebar)}>
              {presets.map(preset => {
                const presetRange = preset.getRange();
                const isActive = isRangeEqual(value, presetRange);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handlePresetClick(preset)}
                    {...stylex.props(
                      styles.presetButton,
                      isActive && styles.presetButtonActive,
                    )}>
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
          <XDSCalendar
            mode="range"
            value={value ?? undefined}
            onChange={handleRangeSelect}
            min={min}
            max={max}
            dateConstraints={dateConstraints}
            numberOfMonths={numberOfMonths}
          />
        </div>,
        {placement: 'below', alignment: 'start'},
      )}
    </XDSField>
  );
}

XDSDateRangeInput.displayName = 'XDSDateRangeInput';
