// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ComplexSelector.tsx
 * @input Uses React, StyleX, Field, usePopover, useTooltip, SizeContext
 * @output Exports ComplexSelector component for custom selector surfaces
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/ComplexSelector/ComplexSelector.doc.mjs
 * - /packages/core/src/ComplexSelector/ComplexSelector.test.tsx
 * - /packages/core/src/ComplexSelector/index.ts
 * - /apps/storybook/stories/ComplexSelector.stories.tsx
 */

import React, {
  useCallback,
  useId,
  useOptimistic,
  useTransition,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  Field,
  inputStatusBorderStyles,
  inputStatusFocusShadowStyles,
  inputWrapperStyles,
  type FieldStatusVariant,
} from '../Field';
import {Icon, type IconName} from '../Icon';
import {Spinner} from '../Spinner';
import {useTranslator} from '../i18n';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {usePopover} from '../Popover/usePopover';
import {useSize} from '../SizeContext/SizeContext';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  sizeVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useTooltip} from '../Tooltip';
import {mergeProps, mergeRefs} from '../utils';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  triggerContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-label-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-label-size']})`,
    },
    lineHeight: typeScaleVars['--text-label-leading'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    // The wrapper (inputWrapperStyles.base) renders the focus ring via
    // :focus-within when this button is focused, matching TextInput/NumberInput.
    // The button must not draw its own :focus-visible outline or the two stack
    // into a doubled ring over the trigger.
    outline: 'none',
    borderRadius: radiusVars['--radius-element'],
  },
  triggerText: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  placeholder: {
    color: colorVars['--color-text-secondary'],
  },
  triggerIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transformOrigin: 'center',
    color: colorVars['--color-icon-secondary'],
  },
  triggerIconOpen: {
    transform: 'rotate(180deg)',
  },
  triggerIconStatus: {
    // Disable rotation transition for status icons
    transition: 'none',
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    outline: {
      default: 'none',
      ':focus-visible': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 1,
  },
  popover: {
    minWidth: 'anchor-size(width)',
    marginBlockStart: spacingVars['--spacing-1'],
  },
  content: {
    boxSizing: 'border-box',
    maxHeight: 'min(480px, calc(100vh - 32px))',
    overflow: 'auto',
    padding: spacingVars['--spacing-3'],
  },
  sm: {
    minHeight: sizeVars['--size-element-sm'],
  },
  md: {
    minHeight: sizeVars['--size-element-md'],
  },
  lg: {
    minHeight: sizeVars['--size-element-lg'],
  },
  disabled: {
    cursor: 'not-allowed',
  },
});

export type ComplexSelectorSize = 'sm' | 'md' | 'lg';

export interface ComplexSelectorRenderState {
  /** Whether the selector surface is open. */
  isOpen: boolean;
  /** Whether changeAction/isLoading is pending. */
  isBusy: boolean;
  /** ID of the trigger button. */
  triggerId: string;
  /** ID of the popup content container. */
  contentId: string;
}

export interface ComplexSelectorStatus {
  type: 'warning' | 'error' | 'success';
  message?: string;
}

const STATUS_ICON_MAP: Record<ComplexSelectorStatus['type'], IconName> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const STATUS_ICON_COLOR_MAP: Record<
  ComplexSelectorStatus['type'],
  'warning' | 'error' | 'success'
> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const STATUS_BUTTON_LABEL_KEY: Record<ComplexSelectorStatus['type'], string> = {
  warning: '@astryx.input.statusButton.warning',
  error: '@astryx.input.statusButton.error',
  success: '@astryx.input.statusButton.success',
};

export interface ComplexSelectorProps<Value> extends Omit<
  BaseProps<HTMLDivElement>,
  'children' | 'onChange'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Label text for accessibility and the field label. */
  label: string;
  /** Current controlled value. */
  value: Value;
  /** Called when custom content commits a new value. */
  onChange?: (value: Value) => void;
  /** Optional async action after onChange; drives optimistic UI. */
  changeAction?: (value: Value) => void | Promise<void>;
  /** Custom selector surface content rendered inside a dialog popover. */
  children: (
    value: Value,
    onChange: (value: Value) => void,
    close: () => void,
    state: ComplexSelectorRenderState,
  ) => ReactNode;
  /** Label/content shown in the closed trigger. */
  triggerLabel?: ReactNode;
  /** Placeholder shown when triggerLabel is omitted. */
  placeholder?: ReactNode;
  /** Whether to visually hide the field label. */
  isLabelHidden?: boolean;
  /** Helper text displayed below the label. */
  description?: string;
  /** Marks the field optional. */
  isOptional?: boolean;
  /** Marks the field required. */
  isRequired?: boolean;
  /** Disables the selector. */
  isDisabled?: boolean;
  /** Shows loading state on the trigger. */
  isLoading?: boolean;
  /** Validation status. */
  status?: ComplexSelectorStatus;
  /** Status placement. */
  statusVariant?: FieldStatusVariant;
  /** Tooltip text displayed next to the label. */
  labelTooltip?: string;
  /** Trigger and field size. */
  size?: ComplexSelectorSize;
  /** Width of the field. */
  width?: SizeValue;
  /** Popup placement. */
  placement?: 'above' | 'below' | 'start' | 'end';
  /** StyleX styles for the popup content container. */
  contentXstyle?: StyleXStyles;
  /** Test ID for the trigger container. */
  'data-testid'?: string;
}

/**
 * A selector shell for rich, custom selection surfaces.
 *
 * ComplexSelector owns the field, trigger, popover, focus restore, and async
 * change action flow. Consumers provide the dialog content as a render function,
 * using the supplied `value`, `onChange`, and `close` helpers to compose the
 * right accessible structure for the custom selector.
 *
 * @example
 * ```
 * <ComplexSelector
 *   label="Fruit"
 *   value={value}
 *   onChange={setValue}
 *   triggerLabel={`${value.fruit} ${value.ripeness}`}>
 *   {(value, onChange, close) => (
 *     <FruitGrid
 *       value={value}
 *       onChange={nextValue => {
 *         onChange(nextValue);
 *         close();
 *       }}
 *     />
 *   )}
 * </ComplexSelector>
 * ```
 */
export function ComplexSelector<Value>({
  ref,
  label,
  value,
  onChange,
  changeAction,
  children,
  triggerLabel,
  placeholder: placeholderFromProps,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  status,
  statusVariant = 'attached',
  labelTooltip,
  size: sizeProp,
  width,
  placement = 'below',
  contentXstyle,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...props
}: ComplexSelectorProps<Value>) {
  const t = useTranslator();
  const placeholder =
    placeholderFromProps ?? t('@astryx.complexSelector.placeholder');
  const size = useSize(sizeProp, 'md');

  const triggerId = useId();
  const labelId = useId();
  const valueId = useId();
  const contentId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();

  const statusTooltip = useTooltip({
    placement: 'above',
    isEnabled: statusVariant === 'tooltip' && !!status?.message,
  });
  const showStatusIcon = status != null && statusVariant !== 'detached';
  const showStatusTooltip =
    status != null && statusVariant === 'tooltip' && !!status.message;

  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      statusVariant !== 'tooltip' && status?.message ? statusMessageId : null,
      showStatusTooltip ? statusTooltip.describedBy : null,
    ]
      .filter((id): id is string => id != null)
      .join(' ') || undefined;

  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || isPending;

  const popover = usePopover({
    dialogLabel: label,
    hasCloseButton: false,
    hasAutoFocus: true,
    onHide: () => {
      document.getElementById(triggerId)?.focus();
    },
  });

  const commitValue = useCallback(
    (nextValue: Value) => {
      onChange?.(nextValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(nextValue);
          await changeAction(nextValue);
        });
      }
    },
    [changeAction, onChange, setOptimisticValue, startTransition],
  );

  const triggerContent = triggerLabel ?? placeholder;

  const content = (
    <div id={contentId} {...stylex.props(styles.content, contentXstyle)}>
      {children(optimisticValue, commitValue, popover.hide, {
        isOpen: popover.isOpen,
        isBusy,
        triggerId,
        contentId,
      })}
    </div>
  );

  const selectorContent = (
    <>
      <div
        ref={mergeRefs(popover.triggerRef, ref)}
        data-testid={testId}
        {...props}
        onClick={() => {
          if (!isDisabled) {
            popover.toggle();
          }
        }}
        {...mergeProps(
          themeProps('complex-selector', {
            size,
            status: status?.type ?? null,
          }),
          stylex.props(
            inputWrapperStyles.base,
            styles.triggerContainer,
            styles[size],
            isDisabled && inputWrapperStyles.disabled,
            isDisabled && styles.disabled,
            triggerLabel == null && styles.placeholder,
            status && inputStatusBorderStyles[status.type],
            // Not inputStatusHoverShadowStyles: that map has no :focus-within
            // key, so it would wipe the base wrapper's focus ring and leave a
            // status'd trigger with no visible keyboard focus indicator.
            status && !isDisabled && inputStatusFocusShadowStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <button
          id={triggerId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={popover.isOpen}
          aria-controls={contentId}
          aria-describedby={ariaDescribedBy}
          // The label alone would override the button's content in the
          // accessible name, so the value span is referenced too — a plain
          // button has no combobox value slot for screen readers to read the
          // current selection from.
          aria-labelledby={`${labelId} ${valueId}`}
          aria-required={isRequired ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          disabled={isDisabled}
          onKeyDown={event => {
            if (
              (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
              !popover.isOpen &&
              !isDisabled
            ) {
              event.preventDefault();
              popover.show();
            }
          }}
          {...stylex.props(styles.trigger)}>
          <span id={valueId} {...stylex.props(styles.triggerText)}>
            {triggerContent}
          </span>
        </button>
        {isBusy && <Spinner size="sm" />}
        <span
          {...stylex.props(
            styles.triggerIcon,
            !showStatusIcon && popover.isOpen && styles.triggerIconOpen,
            showStatusIcon && styles.triggerIconStatus,
          )}>
          {showStatusIcon ? (
            showStatusTooltip ? (
              <button
                ref={statusTooltip.ref}
                type="button"
                aria-label={t(STATUS_BUTTON_LABEL_KEY[status.type])}
                aria-describedby={statusTooltip.describedBy}
                onClick={e => e.stopPropagation()}
                {...stylex.props(styles.statusButton)}>
                <Icon
                  icon={STATUS_ICON_MAP[status.type]}
                  size="sm"
                  color={STATUS_ICON_COLOR_MAP[status.type]}
                />
              </button>
            ) : (
              <Icon
                icon={STATUS_ICON_MAP[status.type]}
                size="sm"
                color={STATUS_ICON_COLOR_MAP[status.type]}
              />
            )
          ) : (
            <Icon
              icon="chevronDown"
              size="sm"
              color="inherit"
              {...themeProps('complex-selector-indicator-icon', {
                state: popover.isOpen ? 'expanded' : 'collapsed',
              })}
            />
          )}
        </span>
      </div>

      {popover.render(content, {
        placement,
        alignment: 'start',
        xstyle: [styles.popover, layerAnimations[placement]],
      })}

      {showStatusTooltip && statusTooltip.renderTooltip(status?.message ?? '')}
    </>
  );

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={triggerId}
      descriptionID={description ? descriptionId : undefined}
      labelID={labelId}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageId : undefined,
            }
          : undefined
      }
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {selectorContent}
    </Field>
  );
}

ComplexSelector.displayName = 'ComplexSelector';
