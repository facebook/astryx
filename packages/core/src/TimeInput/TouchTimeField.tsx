// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TouchTimeField.tsx
 * @input Uses React, Field, BottomSheet, TimeWheels, DateInput touch geometry
 *   tokens, and shared time utilities
 * @output Exports TouchTimeField — the bottom-sheet surface behind TimeInput
 * @position Internal component; consumed by TimeInput.tsx for `presentation`
 *   sheet surfaces (`spec:AST-043` DEC-3: the time half of DateTimeInput's sheet)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TimeInput/TimeInput.tsx
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx (both render
 *   TimeWheels)
 */

import {
  useCallback,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BottomSheet} from '../BottomSheet';
import {Button} from '../Button';
import {
  Field,
  InputClearButton,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {useFieldInputStyling} from '../Field/fieldParts';
import {joinAriaIDs} from '../utils/inputAria';
import {groupStyles} from '../InputGroup/groupStyles';
import {useInputStatusIcon} from '../hooks/useInputStatusIcon';
import {useBusyAnnouncement} from '../hooks/useBusyAnnouncement';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {Icon} from '../Icon';
import {useTranslator} from '../i18n';
import {colorVars, sizeVars, spacingVars} from '../theme/tokens.stylex';
import {useSize} from '../SizeContext/SizeContext';
import {Spinner} from '../Spinner';
import {useTooltip} from '../Tooltip';
import {dateInputTouchGeometry} from '../DateInput/tokens.stylex';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {themeProps} from '../utils/themeProps';
import {
  clampTime,
  formatDisplayTime12h,
  formatDisplayTime24h,
  formatISOTime,
  getInputARIA,
  isTimeInRange,
  mergeProps,
  parseISOTime,
  type ISOTimeString,
} from '../utils';
import {chainEventHandlers} from '../utils/chainEventHandlers';
import type {TimeInputProps} from './TimeInput';
import {TimeWheels} from './TimeWheels';
import {minuteIntervalOf, type TimeParts} from './timeWheelRules';

const sizeStyles = stylex.create({
  sm: {height: sizeVars['--size-element-sm'], minWidth: 120},
  md: {height: sizeVars['--size-element-md'], minWidth: 120},
  lg: {height: sizeVars['--size-element-lg'], minWidth: 120},
});

const styles = stylex.create({
  // Same as TimeInput's: the focus ring for a focused disabled field.
  disabledFocusRing: {
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      ':focus-within': colorVars['--color-accent'],
    },
    boxShadow: {
      default: 'none',
      ':focus-within': `inset 0px 0px 0px 2px ${colorVars['--color-accent-muted']}`,
    },
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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    flexShrink: 0,
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    backgroundColor: 'transparent',
    outline: 'none',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  // Sheet chrome mirrors TouchDateTimeField: `touchSheetBody` insets (the
  // BottomSheet handle floats over the panel, so the wrapper supplies the top
  // clearance and the side/bottom insets) flattened with `touchPanel`'s column
  // layout, which is the wheels' direct parent there and spaces the footer.
  sheetBody: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    inlineSize: '100%',
    minInlineSize: 0,
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  // The picker (UIPickerView's 216 px) centred in the pane.
  wheels: {
    display: 'flex',
    alignItems: 'center',
    inlineSize: '100%',
    minInlineSize: 0,
    blockSize: dateInputTouchGeometry.paneBlockSize,
  },
  footer: {
    display: 'flex',
    marginBlockStart: 'auto',
    paddingBlockStart: spacingVars['--spacing-1'],
  },
});

/**
 * The Astryx bottom-sheet time surface: a read-only closed field that opens
 * hour/minute(/second/meridiem) wheels in a BottomSheet. Wheels commit live,
 * clamped to `min`/`max`; the footer Save button only closes the sheet.
 */
export function TouchTimeField({
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
  hasSeconds = false,
  hasClear = false,
  hourFormat = '12h',
  // Typed-field only: the wheels step by their own options and the sheet
  // opens on tap, so neither reaches this surface.
  increment,
  hasAutoFocus: _hasAutoFocus,
  placeholder: placeholderFromProps,
  size: sizeProp,
  status,
  statusVariant = 'attached',
  labelTooltip,
  width,
  containerXstyle,
  containerClassName,
  containerStyle,
  controlXstyle,
  controlClassName,
  controlStyle,
  ref,
  ...restProps
}: TimeInputProps) {
  const {rest, container} = useFieldInputStyling('TimeInput', restProps, {
    containerXstyle,
    containerClassName,
    containerStyle,
  });
  const {
    id: idProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-labelledby': ariaLabelledByProp,
    onClick: onClickProp,
    ...controlProps
  } = rest;
  const t = useTranslator();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const placeholder =
    placeholderFromProps ?? t('@astryx.timeInput.placeholder');
  const size = useSize(sizeProp, 'md');
  const generatedID = useId();
  const id = idProp ?? generatedID;
  const fieldLabelID = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mergedInputRef = useMergedRefs(ref, inputRef);
  const inputGroup = useInputGroup();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const sheetBodyRef = useRef<HTMLDivElement | null>(null);
  // The busy Spinner is decorative; this control announces its busy start
  // (spec:AST-086 FR8). A change made in the open modal sheet starts it while
  // the sheet is open, so it is announced from inside the sheet.
  useBusyAnnouncement(
    isBusy,
    t('@astryx.spinner.loading'),
    isSheetOpen ? sheetBodyRef : inputRef,
  );
  const isEffectivelyDisabled = isDisabled || isLoading;

  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });
  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({status, statusVariant, isInGroup: !!inputGroup});
  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      statusVariant !== 'tooltip' && status?.message ? statusMessageID : null,
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
      ariaDescribedByProp,
    ],
    inputGroup,
  );

  const fireChange = useCallback(
    (newValue: ISOTimeString | undefined) => {
      if (isEffectivelyDisabled) {
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
    [changeAction, isEffectivelyDisabled, onChange, setOptimisticValue],
  );

  const formatDisplayTime =
    hourFormat === '12h' ? formatDisplayTime12h : formatDisplayTime24h;
  const displayValue = optimisticValue
    ? formatDisplayTime(optimisticValue, hasSeconds)
    : '';

  const fallbackTime = useMemo(() => {
    const now = new Date();
    return formatISOTime(
      {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      },
      hasSeconds,
    );
  }, [hasSeconds]);
  const parsedWheelTime = useMemo(
    () =>
      parseISOTime(optimisticValue ?? fallbackTime) ?? {
        hour: 0,
        minute: 0,
        second: 0,
      },
    [fallbackTime, optimisticValue],
  );

  const commitWheelTime = useCallback(
    (time: TimeParts) => {
      // The wheels already keep the time inside the bounds; clamp again so a
      // commit can never escape them.
      const next = clampTime(
        formatISOTime(time, hasSeconds),
        min,
        max,
        hasSeconds,
      );
      if (next !== optimisticValue && isTimeInRange(next, min, max)) {
        fireChange(next);
      }
    },
    [fireChange, hasSeconds, max, min, optimisticValue],
  );

  const openSheet = useCallback(() => {
    if (!isEffectivelyDisabled) {
      setIsSheetOpen(true);
    }
  }, [isEffectivelyDisabled]);

  const inputWrapper = (
    <div
      ref={el => {
        disabledMessageTooltip.ref(el);
      }}
      {...mergeProps(
        themeProps('time-input', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          isDisabled && inputWrapperStyles.disabled,
          isDisabled && styles.disabledFocusRing,
          status && inputStatusBorderStyles[status.type],
          status && !isDisabled && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          inputGroup && groupStyles.inGroup,
          controlXstyle,
        ),
        controlClassName,
        controlStyle,
      )}>
      <button
        type="button"
        onClick={openSheet}
        aria-disabled={isEffectivelyDisabled || undefined}
        aria-label={t('@astryx.timeInput.openPicker', {label})}
        tabIndex={-1}
        {...stylex.props(focusOutlineStyles.focusVisible, styles.iconButton)}>
        <Icon icon="clock" size="sm" color="secondary" />
      </button>
      <input
        {...controlProps}
        ref={mergedInputRef}
        id={id}
        type="text"
        role="combobox"
        value={displayValue}
        readOnly
        inputMode="none"
        onChange={() => {}}
        onClick={
          isEffectivelyDisabled
            ? undefined
            : chainEventHandlers(openSheet, onClickProp)
        }
        // Enter would submit a surrounding form while disabled (FR2).
        onKeyDown={chainEventHandlers((e: KeyboardEvent<HTMLInputElement>) => {
          if (isEffectivelyDisabled && e.key === 'Enter') {
            e.preventDefault();
          }
        }, controlProps.onKeyDown)}
        placeholder={placeholder}
        aria-disabled={isEffectivelyDisabled ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={isEffectivelyRequired ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-busy={isBusy || undefined}
        aria-expanded={isSheetOpen}
        aria-haspopup="dialog"
        aria-autocomplete="none"
        autoComplete="off"
        aria-labelledby={
          ariaLabelledByProp != null
            ? joinAriaIDs(ariaLabelledBy ?? fieldLabelID, ariaLabelledByProp)
            : ariaLabelledBy
        }
        {...stylex.props(styles.input)}
      />
      {isBusy && <Spinner size="sm" aria-hidden="true" />}
      {hasClear && optimisticValue && !isEffectivelyDisabled && (
        <InputClearButton
          label={t('@astryx.timeInput.clearLabel', {label})}
          onClick={() => fireChange(undefined)}
        />
      )}
      {statusIcon}
      <BottomSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        label={label}
        height="hug"
        // sheetBody owns the inset, including the band under the grab handle.
        padding={0}>
        <div ref={sheetBodyRef} {...stylex.props(styles.sheetBody)}>
          <div {...stylex.props(styles.wheels)}>
            <TimeWheels
              time={parsedWheelTime}
              hourFormat={hourFormat}
              hasSeconds={hasSeconds}
              minuteInterval={minuteIntervalOf(increment)}
              min={min}
              max={max}
              isActive={isSheetOpen}
              onCommit={commitWheelTime}
            />
          </div>
          <div {...stylex.props(styles.footer)}>
            <Button
              variant="primary"
              size="md"
              width="100%"
              label={t('@astryx.dateInput.savePicking')}
              onClick={() => setIsSheetOpen(false)}
            />
          </div>
        </div>
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
      {...container}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      labelID={ariaLabelledByProp != null ? fieldLabelID : undefined}
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

TouchTimeField.displayName = 'TouchTimeField';
