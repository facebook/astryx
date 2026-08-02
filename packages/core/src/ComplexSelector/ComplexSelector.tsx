// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ComplexSelector.tsx
 * @input Uses React, StyleX, Field, usePopover, useGridFocus
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
  useEffect,
  useId,
  useOptimistic,
  useTransition,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {Field, inputWrapperStyles, type FieldStatusVariant} from '../Field';
import {Icon} from '../Icon';
import {Spinner} from '../Spinner';
import {useGridFocus} from '../hooks/useGridFocus';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerPlacement} from '../Layer/useLayer';
import {usePopover} from '../Popover/usePopover';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  sizeVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useTranslator} from '../i18n';
import {mergeProps} from '../utils';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

const OPTION_SELECTOR = '[data-astryx-complex-selector-option]';

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
  popover: {
    minWidth: 'anchor-size(width)',
    marginBlockStart: spacingVars['--spacing-1'],
  },
  content: {
    boxSizing: 'border-box',
    maxHeight: 'min(480px, calc(100vh - 32px))',
    overflow: 'auto',
    padding: spacingVars['--spacing-3'],
    outline: 'none',
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
  focusRing: {
    ':focus-within': {
      outline: `2px solid ${colorVars['--color-accent']}`,
      outlineOffset: '2px',
    },
  },
});

export type ComplexSelectorSize = 'sm' | 'md' | 'lg';

export interface ComplexSelectorGridLayout {
  /** Use the WAI-ARIA grid pattern for a two-dimensional picker. */
  type: 'grid';
  /** Number of visual columns. ArrowUp/ArrowDown preserve the current column. */
  columns: number;
}

export type ComplexSelectorLayout = ComplexSelectorGridLayout;

export interface ComplexSelectorGetOptionPropsOptions<Value> {
  /** Zero-based DOM/grid index for the option. */
  index: number;
  /** Value to commit when the option is selected. */
  value: Value;
  /** Accessible label for this option. */
  label: string;
  /** Whether this option represents the current value. */
  isSelected?: boolean;
  /** Whether this option is visible but unavailable. */
  isDisabled?: boolean;
}

export interface ComplexSelectorOptionProps {
  id: string;
  role?: 'gridcell';
  'aria-label': string;
  'aria-selected'?: boolean;
  'aria-disabled'?: true;
  'data-astryx-complex-selector-option': string;
  tabIndex: 0 | -1;
  onClick: () => void;
}

export interface ComplexSelectorRenderProps<Value> {
  /** Current optimistic value. */
  value: Value;
  /** Commit a value through onChange/changeAction. */
  onChange: (value: Value) => void;
  /** Async action passed to ComplexSelector, exposed for composed content. */
  changeAction?: (value: Value) => void | Promise<void>;
  /** Close the selector surface. */
  close: () => void;
  /** Whether the selector surface is open. */
  isOpen: boolean;
  /** Whether changeAction/isLoading is pending. */
  isBusy: boolean;
  /** ID of the trigger button. */
  triggerId: string;
  /** ID of the popup content container. */
  contentId: string;
  /** Props for selectable options inside the custom content. */
  getOptionProps: (
    options: ComplexSelectorGetOptionPropsOptions<Value>,
  ) => ComplexSelectorOptionProps;
}

export interface ComplexSelectorTriggerRenderProps<Value> {
  /** Current optimistic value. */
  value: Value;
  /** Whether the selector surface is open. */
  isOpen: boolean;
  /** Whether changeAction/isLoading is pending. */
  isBusy: boolean;
}

export interface ComplexSelectorStatus {
  type: 'warning' | 'error' | 'success';
  message?: string;
}

export interface ComplexSelectorProps<Value> extends Omit<
  BaseProps<HTMLDivElement>,
  'children' | 'onChange'
> {
  /** Label text for accessibility and the field label. */
  label: string;
  /** Current controlled value. */
  value: Value;
  /** Called when custom content commits a new value. */
  onChange?: (value: Value) => void;
  /** Optional async action after onChange; drives optimistic UI. */
  changeAction?: (value: Value) => void | Promise<void>;
  /** Custom selector surface content. */
  children: (props: ComplexSelectorRenderProps<Value>) => ReactNode;
  /** Label/content shown in the closed trigger. */
  triggerLabel?: ReactNode;
  /** Custom trigger content rendered inside the selector trigger. */
  renderTrigger?: (
    props: ComplexSelectorTriggerRenderProps<Value>,
  ) => ReactNode;
  /** Placeholder shown when triggerLabel is omitted. */
  placeholder?: ReactNode;
  /** Popup layout behavior owned by ComplexSelector. */
  layout?: ComplexSelectorLayout;
  /** Whether to close the popup after a value is committed. */
  hasCloseOnChange?: boolean;
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
  placement?: LayerPlacement;
  /** HTML form field name. */
  htmlName?: string;
  /** Converts value for the hidden input. */
  getFormValue?: (value: Value) => string;
  /** StyleX styles for the popup content container. */
  contentXstyle?: StyleXStyles;
  /** Test ID for the trigger container. */
  'data-testid'?: string;
}

/**
 * A selector shell for rich, custom selection surfaces.
 *
 * ComplexSelector owns the field, trigger, popover, focus restore, async change
 * action, and optional grid keyboard behavior. Consumers provide the actual
 * content as a render function and spread `getOptionProps` onto each selectable
 * cell when using `layout={{type: 'grid'}}`.
 *
 * @example
 * ```
 * <ComplexSelector
 *   label="Fruit"
 *   value={value}
 *   onChange={setValue}
 *   triggerLabel={`${value.fruit} ${value.ripeness}`}
 *   layout={{type: 'grid', columns: 3}}>
 *   {({getOptionProps}) => fruits.flatMap((fruit, row) =>
 *     levels.map((level, column) => (
 *       <button
 *         {...getOptionProps({
 *           index: row * levels.length + column,
 *           value: {fruit, ripeness: level},
 *           label: `${fruit} ${level}`,
 *         })}>
 *         {fruit} {level}
 *       </button>
 *     )),
 *   )}
 * </ComplexSelector>
 * ```
 */
export function ComplexSelector<Value>({
  label,
  value,
  onChange,
  changeAction,
  children,
  triggerLabel,
  renderTrigger,
  placeholder: placeholderFromProps,
  layout,
  hasCloseOnChange = true,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  status,
  statusVariant = 'attached',
  labelTooltip,
  size = 'md',
  width,
  placement = 'below',
  htmlName,
  getFormValue,
  contentXstyle,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...props
}: ComplexSelectorProps<Value>) {
  const t = useTranslator();
  const placeholder = placeholderFromProps ?? t('@astryx.selector.placeholder');

  const triggerId = useId();
  const labelId = useId();
  const contentId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();

  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter((id): id is string => id != null)
      .join(' ') || undefined;

  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || isPending;

  const {
    gridRef,
    handleKeyDown: handleGridKeyDown,
    handleFocus: handleGridFocus,
    focusCell,
  } = useGridFocus<HTMLDivElement>({
    columns: layout?.type === 'grid' ? layout.columns : 1,
    cellSelector: OPTION_SELECTOR,
    isCellFocusable: cell => cell.getAttribute('aria-disabled') !== 'true',
    hasRovingTabIndex: layout?.type === 'grid',
  });

  const popover = usePopover({
    dialogLabel: label,
    hasCloseButton: false,
    hasAutoFocus: layout?.type !== 'grid',
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
      if (hasCloseOnChange) {
        popover.hide();
      }
    },
    [changeAction, hasCloseOnChange, onChange, popover, setOptimisticValue],
  );

  const getOptionProps = useCallback(
    ({
      index,
      value: optionValue,
      label: optionLabel,
      isSelected = false,
      isDisabled: optionDisabled = false,
    }: ComplexSelectorGetOptionPropsOptions<Value>): ComplexSelectorOptionProps => ({
      id: `${contentId}-option-${index}`,
      role: layout?.type === 'grid' ? 'gridcell' : undefined,
      'aria-label': optionLabel,
      'aria-selected': isSelected || undefined,
      'aria-disabled': optionDisabled ? true : undefined,
      'data-astryx-complex-selector-option': '',
      tabIndex: isSelected ? 0 : -1,
      onClick: () => {
        if (!optionDisabled) {
          commitValue(optionValue);
        }
      },
    }),
    [commitValue, contentId, layout?.type],
  );

  useEffect(() => {
    if (!popover.isOpen || layout?.type !== 'grid') {
      return;
    }

    requestAnimationFrame(() => {
      const grid = gridRef.current;
      if (!grid) {
        return;
      }
      const cells = Array.from(
        grid.querySelectorAll<HTMLElement>(OPTION_SELECTOR),
      );
      const selectedIndex = cells.findIndex(
        cell => cell.getAttribute('aria-selected') === 'true',
      );
      focusCell(selectedIndex >= 0 ? selectedIndex : 0);
    });
  }, [focusCell, gridRef, layout?.type, popover.isOpen]);

  const triggerContent = renderTrigger
    ? renderTrigger({value: optimisticValue, isOpen: popover.isOpen, isBusy})
    : (triggerLabel ?? placeholder);

  const content = (
    <div
      ref={gridRef}
      id={contentId}
      role={layout?.type === 'grid' ? 'grid' : undefined}
      aria-label={layout?.type === 'grid' ? label : undefined}
      aria-busy={isBusy || undefined}
      onKeyDown={layout?.type === 'grid' ? handleGridKeyDown : undefined}
      onFocus={layout?.type === 'grid' ? handleGridFocus : undefined}
      {...stylex.props(styles.content, contentXstyle)}>
      {children({
        value: optimisticValue,
        onChange: commitValue,
        changeAction,
        close: popover.hide,
        isOpen: popover.isOpen,
        isBusy,
        triggerId,
        contentId,
        getOptionProps,
      })}
    </div>
  );

  const selectorContent = (
    <>
      <div
        ref={popover.triggerRef}
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
            styles.focusRing,
            isDisabled && inputWrapperStyles.disabled,
            isDisabled && styles.disabled,
            triggerLabel == null && !renderTrigger && styles.placeholder,
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
          aria-labelledby={labelId}
          aria-required={isRequired ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          disabled={isDisabled}
          onKeyDown={event => {
            if (event.key === 'ArrowDown' && !popover.isOpen && !isDisabled) {
              event.preventDefault();
              popover.show();
            }
          }}
          {...stylex.props(styles.trigger)}>
          <span {...stylex.props(styles.triggerText)}>{triggerContent}</span>
        </button>
        {htmlName != null && (
          <input
            type="hidden"
            name={htmlName}
            value={getFormValue ? getFormValue(value) : String(value ?? '')}
            disabled={isDisabled}
          />
        )}
        {isBusy && <Spinner size="sm" />}
        <span
          {...stylex.props(
            styles.triggerIcon,
            popover.isOpen && styles.triggerIconOpen,
          )}>
          <Icon
            icon="chevronDown"
            size="sm"
            color="inherit"
            {...themeProps('complex-selector-indicator-icon', {
              state: popover.isOpen ? 'expanded' : 'collapsed',
            })}
          />
        </span>
      </div>

      {popover.render(content, {
        placement,
        alignment: 'start',
        xstyle: [styles.popover, layerAnimations[placement]],
      })}
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
