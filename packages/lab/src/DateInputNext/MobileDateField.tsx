// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MobileDateField.tsx
 * @input Uses React, Field, BottomSheet, Button, Icon, Calendar hooks, MonthScroller, MonthYearWheels
 * @output Exports MobileDateField — the touch surface behind DateInputNext
 * @position Internal component; consumed by DateInputNext.tsx
 *
 * The touch half of `DateInputNext`, holding `DateInput`'s whole prop
 * contract so the two are interchangeable. Everything field-shaped —
 * `Field` wrapper, status treatment, optimistic `changeAction`, the
 * disabled-reason tooltip, `InputGroup` membership — behaves exactly as it
 * does on the desktop control; only the picker differs.
 *
 * ## The closed field is deliberately the same control
 *
 * It is a real `<input>`, not a button: same element, same `role="combobox"`,
 * same border, same clear button, so `ref` (typed `Ref<HTMLInputElement>` by
 * `DateInputProps`) is honestly a reference to an input, the label's `for`
 * names it natively, and the switch between surfaces moves nothing on screen.
 *
 * It just cannot be typed into: `readOnly` blocks entry, and `inputMode="none"`
 * stops the virtual keyboard from opening over the sheet. Text entry is the
 * one part of the desktop control that has no place here — the keyboard it
 * summons would cover the picker it is meant to fill in.
 *
 * ## Three ideas in the picker
 *
 * 1. One month per screen. Every pane is exactly the height of the scrollport
 *    and snaps to its start, so the picker is a fixed height and there is no
 *    resting position showing half of two months. See MonthScroller.
 * 2. Scrolling is the month control. No chevrons: the neighbouring months are
 *    a flick away in the direction you already think of them.
 * 3. The title is the escape hatch. Tap it and the same box becomes a month
 *    wheel and a year wheel — a flick each to reach 2019 instead of forty.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DateInputNext/DateInputNext.tsx
 * - /packages/lab/src/DateInputNext/DateInputNext.doc.mjs
 * - /packages/lab/src/DateInputNext/DateInputNext.test.tsx
 */

import {
  useCallback,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {
  useCalendarConstraints,
  useCalendarDays,
} from '@astryxdesign/core/Calendar';
import type {DateInputProps} from '@astryxdesign/core/DateInput';
import {
  Field,
  InputClearButton,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '@astryxdesign/core/Field';
import {
  useInputStatusIcon,
  useResolvedRequired,
} from '@astryxdesign/core/hooks';
import {Icon} from '@astryxdesign/core/Icon';
import {useTranslator} from '@astryxdesign/core/i18n';
import {groupStyles, useInputGroup} from '@astryxdesign/core/InputGroup';
import {stableClassName} from '@astryxdesign/core/naming';
import {useSize} from '@astryxdesign/core/SizeContext';
import {Spinner} from '@astryxdesign/core/Spinner';
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
  borderVars,
  fontWeightVars,
  typeScaleVars,
  typographyVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useTooltip} from '@astryxdesign/core/Tooltip';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {
  focusOutlineStyles,
  getInputARIA,
  mergeProps,
  mergeRefs,
  normalizeDayOfWeek,
  themeProps,
  formatSharedDate,
  plainDateFromISO,
  plainDateToday,
  plainDateFormat,
  DATE_FORMAT_MONTH_YEAR,
  type ISODateString,
} from '@astryxdesign/core/utils';
import {MonthScroller, type MonthScrollerHandle} from './MonthScroller';
import {MonthYearWheels} from './MonthYearWheels';
import {
  DEFAULT_MONTH_REACH,
  clampIndex,
  fromMonthIndex,
  monthIndexOf,
} from './monthGeometry';
import {dateInputNextVars, dateInputNextGeometry} from './tokens.stylex';

/**
 * The comfortable minimum tap target on both iOS and Android. Applied as a
 * FLOOR under the size prop rather than replacing it: `size` still means what
 * it means, it just cannot produce a control a thumb misses.
 */
const TOUCH_TARGET = dateInputNextVars['--date-input-next-day-size'];

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
    minWidth: 180,
    minBlockSize: {default: null, '@media (pointer: coarse)': TOUCH_TARGET},
  },
  md: {
    height: sizeVars['--size-element-md'],
    minWidth: 180,
    minBlockSize: {default: null, '@media (pointer: coarse)': TOUCH_TARGET},
  },
  lg: {
    height: sizeVars['--size-element-lg'],
    minWidth: 180,
    minBlockSize: {default: null, '@media (pointer: coarse)': TOUCH_TARGET},
  },
});

const styles = stylex.create({
  // ---- the closed field ----
  wrapper: {
    gap: spacingVars['--spacing-2'],
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
    fontFamily: typographyVars['--font-family-body'],
    // Below 16px iOS zooms the page on focus. The field is focusable even
    // though it is not typable, so it needs the same floor DateInput has.
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    // It opens a picker; it does not take text. The caret would say otherwise.
    caretColor: 'transparent',
    cursor: 'pointer',
    userSelect: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },

  // ---- the picker surface ----
  surface: {
    display: 'flex',
    flexDirection: 'column',
    inlineSize: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    blockSize: sizeVars['--size-element-lg'],
    paddingInline: spacingVars['--spacing-1'],
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    blockSize: '100%',
    paddingInline: spacingVars['--spacing-2'],
    marginInlineStart: `calc(-1 * ${spacingVars['--spacing-2']})`,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: {
      default: 'transparent',
      // Hover only on a real pointer, and never on a disabled control — a
      // browser suppresses a disabled element's events, not its hover styling.
      '@media (hover: hover)': {
        default: 'transparent',
        ':hover:where(:not(:disabled,[aria-disabled="true"]))':
          colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  titleChevron: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  titleChevronOpen: {
    transform: 'rotate(180deg)',
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    blockSize: sizeVars['--size-element-sm'],
    alignItems: 'center',
  },
  weekdaysHidden: {
    // Hidden, not unmounted: the row still owes the surface its height, or
    // opening the wheels would make the picker shorter.
    visibility: 'hidden',
  },
  weekday: {
    textAlign: 'center',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  body: {
    display: 'grid',
    blockSize: dateInputNextGeometry.paneBlockSize,
    position: 'relative',
  },
  panel: {
    gridArea: '1 / 1',
    minWidth: 0,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  panelHidden: {
    // visibility (not display) keeps the month scroller laid out while the
    // wheels are up, so its scroll offset survives the round trip and the
    // wheels can steer it before it is shown again.
    visibility: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-1'],
  },
  sheetBody: {
    paddingInline: spacingVars['--spacing-2'],
    // Clears the sheet's floating grab handle, which is out of flow and so
    // costs no layout space of its own — the content wrapper owes it.
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  divider: {
    blockSize: borderVars['--border-width'],
    backgroundColor: colorVars['--color-border'],
    marginBlockStart: spacingVars['--spacing-1'],
  },
});

/**
 * The touch surface. Takes `DateInput`'s props verbatim; see
 * {@link DateInputNext} for when it is chosen over the desktop control.
 */
export function MobileDateField({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  disabledMessage,
  value,
  onChange,
  changeAction,
  isLoading = false,
  min,
  max,
  dateConstraints,
  placeholder: placeholderFromProps,
  size: sizeProp,
  status,
  statusVariant = 'attached',
  labelTooltip,
  hasClear = false,
  // Desktop-only: the scroller is a single continuously paged column, so a
  // second month would be the month already one flick away. Accepted (the
  // prop types are shared) and ignored.
  numberOfMonths: _numberOfMonths,
  weekStartsOn: weekStartsOnProp = 0,
  format = 'date_long',
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DateInputProps) {
  const t = useTranslator();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const placeholder =
    placeholderFromProps ?? t('@astryx.dateInput.placeholder');
  const size = useSize(sizeProp, 'md');
  const weekStartsOn = normalizeDayOfWeek(weekStartsOnProp);

  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputGroup = useInputGroup();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isBusy;

  // Disabled-reason tooltip, same contract as DateInput: a disabled control
  // swallows pointer events, so the listeners attach to the wrapper and the
  // input stays focusable via aria-disabled rather than the disabled
  // attribute. Only the persistent disabled state surfaces a reason, never
  // the transient busy one.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status,
      statusVariant,
      isInGroup: !!inputGroup,
    });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      statusVariant !== 'tooltip' && status?.message ? statusMessageID : null,
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const scrollerHandle = useRef<MonthScrollerHandle | null>(null);

  const today = useMemo(() => plainDateToday(), []);
  const selectedDate = useMemo(
    () =>
      optimisticValue != null && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
        ? plainDateFromISO(optimisticValue)
        : null,
    [optimisticValue],
  );

  // The reachable range. Explicit bounds win; otherwise the scroller reaches a
  // century in each direction from wherever it opened. Anchored once, in a
  // state initializer: recomputing it as the selection moves would shift every
  // pane's scroll offset under the user mid-gesture.
  const [anchorMonthIndex] = useState(() =>
    monthIndexOf(
      value != null && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? plainDateFromISO(value)
        : plainDateToday(),
    ),
  );
  const minMonthIndex =
    min != null
      ? monthIndexOf(plainDateFromISO(min))
      : anchorMonthIndex - DEFAULT_MONTH_REACH;
  const maxMonthIndex =
    max != null
      ? monthIndexOf(plainDateFromISO(max))
      : anchorMonthIndex + DEFAULT_MONTH_REACH;

  const [monthIndex, setMonthIndex] = useState(() =>
    clampIndex(anchorMonthIndex, minMonthIndex, maxMonthIndex),
  );

  const {year, month} = fromMonthIndex(monthIndex);
  // Only the weekday names are wanted here; the panes build their own grids.
  // Taking them from the same hook keeps the header row and the columns
  // rotating together when weekStartsOn changes.
  const {dayNames} = useCalendarDays({year, month, weekStartsOn});
  const monthYearLabel = plainDateFormat(
    {year, month, day: 1},
    DATE_FORMAT_MONTH_YEAR,
  );

  // Formats the committed value only. A function format is called with the ISO
  // value; a named one reuses Timestamp's shared date mapping, so the same
  // literal renders the same shape here and on the desktop control.
  const displayValue =
    optimisticValue != null && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
      ? typeof format === 'function'
        ? format(optimisticValue)
        : formatSharedDate(plainDateFromISO(optimisticValue), format)
      : '';

  const fireChange = useCallback(
    (newValue: ISODateString | undefined) => {
      if (isBusy) {
        return;
      }
      onChange?.(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [isBusy, onChange, changeAction, startTransition, setOptimisticValue],
  );

  const openSheet = useCallback(() => {
    if (!isEffectivelyDisabled) {
      setIsSheetOpen(true);
    }
  }, [isEffectivelyDisabled]);

  const handleClear = useCallback(() => {
    fireChange(undefined);
    inputRef.current?.focus();
  }, [fireChange]);

  // Selection commits on the tap and leaves the sheet up, so a mistake can be
  // corrected in place and a nearby date reconsidered without reopening.
  // Dismissal is the footer's Done (and the handle, the scrim, Escape) — none
  // of which commit anything, because this already has.
  const handleSelect = useCallback(
    (next: ISODateString) => {
      fireChange(next);
    },
    [fireChange],
  );

  const handleToday = useCallback(() => {
    const target = clampIndex(
      monthIndexOf(today),
      minMonthIndex,
      maxMonthIndex,
    );
    setMonthIndex(target);
    scrollerHandle.current?.scrollToMonth(target, 'smooth');
  }, [today, minMonthIndex, maxMonthIndex]);

  // A wheel commit steers the scroller immediately, even though it is behind
  // the wheels: it keeps its layout box while hidden, so by the time the
  // wheels close it is already resting on the new month.
  const handleWheelChange = useCallback((next: number) => {
    setMonthIndex(next);
    scrollerHandle.current?.scrollToMonth(next, 'auto');
  }, []);

  // APG combobox keys. The field takes no text, so every printable key is
  // free — but only the documented openers are wired, so a stray keystroke
  // does not pop a sheet.
  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar'
      ) {
        event.preventDefault();
        openSheet();
      }
    },
    [openSheet],
  );

  const surface = (
    <div {...stylex.props(styles.surface)}>
      <div {...stylex.props(styles.header)}>
        <button
          type="button"
          onClick={() => setIsWheelOpen(open => !open)}
          aria-expanded={isWheelOpen}
          aria-label={`${monthYearLabel}, ${t('@astryx.dateInput.chooseMonthYear')}`}
          {...mergeProps(
            // mergeProps, not two spreads: both halves carry a className, and
            // the later spread would drop the theme target entirely.
            themeProps('date-input-next-title', {
              state: isWheelOpen ? 'expanded' : 'collapsed',
            }),
            stylex.props(styles.title, focusOutlineStyles.focusVisible),
          )}>
          <span>{monthYearLabel}</span>
          <span
            {...stylex.props(
              styles.titleChevron,
              isWheelOpen && styles.titleChevronOpen,
            )}>
            <Icon icon="chevronDown" size="sm" color="secondary" />
          </span>
        </button>
      </div>

      {/* Decorative: each day carries its weekday in its accessible name, so
          this row is not a header row for assistive technology — and it must
          live outside the scroller, or it would scroll away with the month. */}
      <div
        aria-hidden="true"
        {...stylex.props(
          styles.weekdays,
          isWheelOpen && styles.weekdaysHidden,
        )}>
        {dayNames.map(name => (
          <div key={name} {...stylex.props(styles.weekday)}>
            {name}
          </div>
        ))}
      </div>

      <div {...stylex.props(styles.body)}>
        <div
          data-panel="calendar"
          // `inert` as well as the hidden styling: the panel keeps its layout
          // box (so the scroller holds its position and the wheels can steer
          // it), which means without this it would still be tabbable and
          // hit-testable behind the panel on top.
          inert={isWheelOpen ? true : undefined}
          {...stylex.props(styles.panel, isWheelOpen && styles.panelHidden)}>
          <MonthScroller
            key={`${minMonthIndex}:${maxMonthIndex}`}
            handleRef={scrollerHandle}
            minMonthIndex={minMonthIndex}
            maxMonthIndex={maxMonthIndex}
            initialMonthIndex={monthIndex}
            onVisibleMonthChange={setMonthIndex}
            selectedDate={selectedDate}
            today={today}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            onSelect={handleSelect}
          />
        </div>
        <div
          data-panel="wheels"
          inert={isWheelOpen ? undefined : true}
          {...stylex.props(styles.panel, !isWheelOpen && styles.panelHidden)}>
          <MonthYearWheels
            monthIndex={monthIndex}
            minMonthIndex={minMonthIndex}
            maxMonthIndex={maxMonthIndex}
            onChange={handleWheelChange}
            monthLabel={t('@astryx.dateInput.monthWheel')}
            yearLabel={t('@astryx.dateInput.yearWheel')}
            isActive={isWheelOpen}
          />
        </div>
      </div>

      {/* Navigation on the left, dismissal on the right — the usual reading
          order for a sheet footer, and it keeps the destination-changing
          action away from the thumb's path to the one that closes.

          Done does NOT commit: a tap on a day has already fired onChange by
          the time it is reachable. It is a close button, exactly equivalent
          to the grab handle, the scrim and Escape — which is why it is safe
          for those to remain, and why there is no Cancel to pair it with. */}
      <div {...stylex.props(styles.footer)}>
        <Button
          variant="ghost"
          size="sm"
          label={t('@astryx.dateInput.today')}
          onClick={handleToday}
        />
        <Button
          variant="primary"
          size="sm"
          label={t('@astryx.dateInput.donePicking')}
          onClick={() => setIsSheetOpen(false)}
        />
      </div>
    </div>
  );

  const inputWrapper = (
    <div
      ref={el => {
        // Anchor + hover/focus listeners for the disabled-message tooltip.
        // Gated internally by isEnabled, so attaching unconditionally is safe.
        disabledMessageTooltip.ref(el);
      }}
      {...rest}
      {...mergeProps(
        themeProps('date-input', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          styles.wrapper,
          isEffectivelyDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status &&
            !isEffectivelyDisabled &&
            inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          inputGroup && groupStyles.inGroup,
          xstyle,
        ),
        className,
        style,
      )}>
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
      <button
        type="button"
        onClick={openSheet}
        disabled={isEffectivelyDisabled}
        aria-label={t('@astryx.dateInput.openCalendar')}
        tabIndex={-1}
        {...stylex.props(
          focusOutlineStyles.focusVisible,
          styles.iconButton,
          isEffectivelyDisabled && styles.iconButtonDisabled,
        )}>
        <Icon
          icon="calendar"
          size="sm"
          color="secondary"
          {...themeProps('date-input-toggle-icon', {
            state: isSheetOpen ? 'expanded' : 'collapsed',
          })}
        />
      </button>
      <input
        ref={mergeRefs(ref, inputRef)}
        id={id}
        type="text"
        role="combobox"
        value={displayValue}
        // No typing on this surface: the picker is the input method, and the
        // virtual keyboard would cover the sheet it is meant to fill in.
        // readOnly blocks entry; inputMode="none" is what actually keeps the
        // keyboard down when the field takes focus.
        readOnly
        inputMode="none"
        onChange={() => {}}
        onClick={openSheet}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        disabled={isEffectivelyDisabled && !showsDisabledMessage}
        aria-disabled={showsDisabledMessage ? 'true' : undefined}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-required={isEffectivelyRequired ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-busy={isBusy || undefined}
        aria-expanded={isSheetOpen}
        aria-haspopup="dialog"
        aria-autocomplete="none"
        autoComplete="off"
        {...stylex.props(
          styles.input,
          isEffectivelyDisabled && styles.inputDisabled,
        )}
      />
      {hasClear && value !== undefined && !isEffectivelyDisabled && (
        <InputClearButton
          label={t('@astryx.dateInput.clear', {label})}
          onClick={handleClear}
          iconClassName={stableClassName('date-input-clear-icon')}
        />
      )}
      {isBusy && <Spinner size="sm" />}
      {statusIcon}
      <BottomSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        label={t('@astryx.dateInput.dialogLabel')}
        // The picker is a fixed height by construction, so the sheet should be
        // exactly as tall as it is rather than claiming a viewport budget.
        height="hug">
        <div {...stylex.props(styles.sheetBody)}>{surface}</div>
      </BottomSheet>
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );

  if (inputGroup) {
    return inputWrapper;
  }

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
    </Field>
  );
}

MobileDateField.displayName = 'MobileDateField';
