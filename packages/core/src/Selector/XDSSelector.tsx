'use client';

/**
 * @file XDSSelector.tsx
 * @input Uses React, StyleX, useXDSPopover, XDSIcon
 * @output Exports XDSSelector component
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Selector/Selector.doc.mjs
 * - /packages/core/src/Selector/index.ts
 */

import React, {
  useCallback,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useTransition,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSIcon} from '../Icon';
import type {XDSIconName} from '../Icon';
import {
  XDSField,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
} from '../Field';
import {XDSDivider} from '../Divider';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {XDSSpinner} from '../Spinner';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  shadowVars,
  durationVars,
  easeVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {type XDSSelectorOptionType, type XDSSelectorOptionData} from './types';
import {
  isOptionData,
  isDivider,
  isSection,
  normalizeOption,
  getSelectableOptions,
} from './utils';
import {useCombobox, useSelectedItemOffset} from './hooks';
import {XDSSelectorOption} from './XDSSelectorOption';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

const styles = stylex.create({
  // Trigger button
  trigger: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-border-emphasized'],
      },
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-surface'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    transitionProperty: 'border-color, outline, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': shadowVars['--shadow-inset-hover'],
      },
    },
    outline: {
      default: 'none',
      ':focus': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: '0',
  },
  triggerDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-border-emphasized'],
  },
  triggerPlaceholder: {
    color: colorVars['--color-text-secondary'],
  },
  triggerLabel: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
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

  // Clear button
  clearButton: {
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

  // Dropdown container
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    opacity: 1,
    transition: `opacity ${durationVars['--duration-fast']}`,
  },
  dropdownHidden: {
    opacity: 0,
    transition: 'none',
  },
  dropdownOffset: (offset: number) => ({
    marginTop: offset,
  }),

  // Popover container (for anchor positioning)
  popover: {
    minWidth: 'anchor-size(width)',
  },

  // Section divider with label
  sectionDivider: {
    marginBlock: spacingVars['--spacing-1'],
  },

  // Divider
  divider: {
    marginBlock: spacingVars['--spacing-1'],
  },

  // Individual item
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
  },
  itemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flex: 1,
    minWidth: 0,
  },
  itemCheckmark: {
    flexShrink: 0,
    width: 16,
    height: 16,
    color: colorVars['--color-icon-primary'],
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  itemSelected: {
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

const STATUS_ICON_MAP: Record<XDSSelectorStatusType, XDSIconName> = {
  warning: 'warning',
  error: 'xCircle',
  success: 'checkCircle',
};

const STATUS_ICON_COLOR_MAP: Record<
  XDSSelectorStatusType,
  'warning' | 'negative' | 'positive'
> = {
  warning: 'warning',
  error: 'negative',
  success: 'positive',
};

export type XDSSelectorSize = 'sm' | 'md' | 'lg';

export type XDSSelectorStatusType = 'warning' | 'error' | 'success';

export interface XDSSelectorStatus {
  /**
   * The type of status to display.
   */
  type: XDSSelectorStatusType;
  /**
   * Optional message to display below the input.
   */
  message?: string;
}

interface XDSSelectorPropsBase<
  T extends XDSSelectorOptionType = XDSSelectorOptionType,
> extends Omit<XDSBaseProps, 'onChange' | 'defaultValue' | 'children'> {
  /**
   * Label text for the selector (always rendered for accessibility).
   */
  label: string;

  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;

  /**
   * Description text displayed between the label and selector.
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
   * Whether the selector is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * The options to display in the selector.
   * Can be strings, objects, dividers, or sections.
   */
  options: T[];

  // value, onChange, onChangeAction, and hasClear are in the discriminated union below

  /**
   * Whether the selector is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Placeholder text when no value is selected.
   * @default 'Select...'
   */
  placeholder?: string;

  /**
   * The size of the selector.
   * - 'sm': Compact size
   * - 'md': Default size
   * @default 'md'
   */
  size?: XDSSelectorSize;

  /**
   * Status indicator for the selector.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a message box below the selector.
   */
  status?: XDSSelectorStatus;

  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;

  /**
   * Custom render function for options.
   * Only called for selectable options (not dividers/sections).
   */
  children?: (option: XDSSelectorOptionData) => ReactNode;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

/**
 * Without `hasClear`, the selector always has a string value (or undefined for placeholder).
 * With `hasClear`, the value can be `null` and onChange receives `null` on clear.
 */
type XDSSelectorPropsNonClearable<
  T extends XDSSelectorOptionType = XDSSelectorOptionType,
> = XDSSelectorPropsBase<T> & {
  hasClear?: false;
  value?: string;
  onChange?: (value: string) => void;
  onChangeAction?: (value: string) => void | Promise<void>;
};

type XDSSelectorPropsClearable<
  T extends XDSSelectorOptionType = XDSSelectorOptionType,
> = XDSSelectorPropsBase<T> & {
  /**
   * Whether to show a clear button when a value is selected.
   * When clicked, resets the value to `null` and returns focus to the trigger.
   *
   * When enabled, `value` and `onChange` widen to include `null`.
   */
  hasClear: true;
  value: string | null;
  onChange?: (value: string | null) => void;
  onChangeAction?: (value: string | null) => void | Promise<void>;
};

export type XDSSelectorProps<
  T extends XDSSelectorOptionType = XDSSelectorOptionType,
> = XDSSelectorPropsNonClearable<T> | XDSSelectorPropsClearable<T>;

/**
 * Default option renderer
 */
function DefaultOption({option}: {option: XDSSelectorOptionData}) {
  return (
    <XDSSelectorOption
      icon={option.icon}
      label={option.label ?? option.value}
    />
  );
}

/**
 * A selector/dropdown component for choosing from a list of options.
 *
 * @example
 * ```
 * <XDSSelector
 *   label="Fruit"
 *   options={['Apple', 'Banana', 'Orange']}
 *   value={fruit}
 *   onChange={setFruit}
 *   placeholder="Select a fruit..."
 * />
 * ```
 */
export function XDSSelector<T extends XDSSelectorOptionType>(
  props: XDSSelectorProps<T>,
) {
  const {
    label,
    isLabelHidden = false,
    description,
    isOptional = false,
    isRequired = false,
    isDisabled = false,
    options,
    value,
    onChange,
    onChangeAction,
    isLoading = false,
    placeholder = 'Select...',
    size = 'md',
    status,
    labelTooltip,
    children,
    'data-testid': testId,
    xstyle,
    className,
    style,
  } = props;
  const hasClear = 'hasClear' in props && props.hasClear === true;

  // Normalize null to undefined for internal use (null is the clear sentinel)
  const normalizedValue = value === null ? undefined : value;
  const triggerId = useId();
  const listboxId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(normalizedValue);
  const isBusy = isLoading || optimisticValue !== normalizedValue;

  // Build aria-describedby
  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // Flatten options for keyboard navigation
  const selectableItems = useMemo(
    () => getSelectableOptions(options),
    [options],
  );

  // Find selected item and its index for positioning
  const selectedItemIndex = useMemo(() => {
    return selectableItems.findIndex(item => item.value === optimisticValue);
  }, [selectableItems, optimisticValue]);

  const selectedItem = useMemo(() => {
    return selectedItemIndex >= 0
      ? selectableItems[selectedItemIndex]
      : undefined;
  }, [selectableItems, selectedItemIndex]);

  // Ref for listbox to measure selected item position
  const listboxRef = useRef<HTMLDivElement>(null);

  // Layer for dropdown positioning
  const handleLayerHide = useCallback(() => {
    triggerRef.current?.focus();
  }, []);

  const popover = useXDSPopover({
    onHide: handleLayerHide,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  // Calculate offset to position selected item over trigger
  const {offset: selectedItemOffset, isPositioned} = useSelectedItemOffset({
    isOpen: popover.isOpen,
    selectedItemIndex,
    listboxId,
    listboxRef,
    triggerRef,
  });

  // Selector behavior (keyboard nav, typeahead, selection)
  const {
    highlightedIndex,
    setHighlightedIndex: _setHighlightedIndex,
    getItemId,
    onTriggerClick,
    onKeyDown,
    onItemSelect,
    onItemMouseEnter,
  } = useCombobox({
    selectableItems,
    value: normalizedValue,
    isDisabled,
    isOpen: popover.isOpen,
    onOpen: popover.show,
    onClose: popover.hide,
    onSelect: useCallback(
      (newValue: string) => {
        onChange?.(newValue);
        if (onChangeAction) {
          startTransition(async () => {
            setOptimisticValue(newValue);
            await onChangeAction(newValue);
          });
        }
      },
      [onChange, onChangeAction, startTransition, setOptimisticValue],
    ),
    listboxId,
  });

  // Handle clear button click
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Don't open dropdown
      (onChange as ((value: string | null) => void) | undefined)?.(null);
      if (onChangeAction) {
        startTransition(async () => {
          setOptimisticValue(undefined as unknown as string);
          await (
            onChangeAction as (value: string | null) => void | Promise<void>
          )(null);
        });
      }
    },
    [onChange, onChangeAction, startTransition, setOptimisticValue],
  );

  // Render an individual item
  const renderItem = useCallback(
    (item: XDSSelectorOptionData, flatIndex: number) => {
      const isHighlighted = flatIndex === highlightedIndex;
      const isSelected = item.value === normalizedValue;

      return (
        <div
          key={item.value}
          id={getItemId(flatIndex)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={item.disabled}
          onClick={() => onItemSelect(item)}
          onMouseEnter={() => onItemMouseEnter(item, flatIndex)}
          {...stylex.props(
            styles.item,
            isHighlighted && styles.itemHighlighted,
            isSelected && styles.itemSelected,
            item.disabled && styles.itemDisabled,
          )}>
          <span {...stylex.props(styles.itemContent)}>
            {children ? children(item) : <DefaultOption option={item} />}
          </span>
          {isSelected && <XDSIcon icon="check" size="sm" color="accent" />}
        </div>
      );
    },
    [
      children,
      highlightedIndex,
      value,
      getItemId,
      onItemSelect,
      onItemMouseEnter,
    ],
  );

  // Render all options (handling sections/dividers)
  const renderOptions = useCallback(() => {
    let flatIndex = 0;
    const elements: ReactNode[] = [];

    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (isDivider(option)) {
        elements.push(
          <XDSDivider key={`divider-${i}`} xstyle={styles.divider} />,
        );
      } else if (isSection(option)) {
        const sectionItems: ReactNode[] = [];
        for (const opt of option.options) {
          sectionItems.push(renderItem(normalizeOption(opt), flatIndex));
          flatIndex++;
        }
        // Render divider with label before the group
        if (option.title) {
          elements.push(
            <XDSDivider
              key={`section-divider-${i}`}
              label={option.title}
              xstyle={styles.sectionDivider}
            />,
          );
        }
        elements.push(
          <div key={`section-${i}`} role="group" aria-label={option.title}>
            {sectionItems}
          </div>,
        );
      } else if (isOptionData(option)) {
        elements.push(renderItem(normalizeOption(option), flatIndex));
        flatIndex++;
      }
    }

    return elements;
  }, [options, renderItem, listboxId]);

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={triggerId}
      descriptionID={description ? descriptionId : undefined}
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
      labelTooltip={labelTooltip}>
      <button
        ref={el => {
          (
            triggerRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = el;
          popover.triggerRef(el);
        }}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={popover.isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          popover.isOpen && highlightedIndex >= 0
            ? getItemId(highlightedIndex)
            : undefined
        }
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-busy={isBusy || undefined}
        disabled={isDisabled}
        onClick={onTriggerClick}
        onKeyDown={onKeyDown}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('selector', {size, status: status?.type ?? null}),
          stylex.props(
            styles.trigger,
            sizeStyles[size],
            isDisabled && styles.triggerDisabled,
            !selectedItem && styles.triggerPlaceholder,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <span {...stylex.props(styles.triggerLabel)}>
          {selectedItem?.label ?? placeholder}
        </span>
        {hasClear && value != null && !isDisabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            aria-label={`Clear ${label}`}
            {...stylex.props(styles.clearButton)}>
            <XDSIcon icon="close" size="sm" color="secondary" />
          </button>
        )}
        {isBusy && <XDSSpinner size="sm" />}
        <span
          {...stylex.props(
            styles.triggerIcon,
            !status && popover.isOpen && styles.triggerIconOpen,
            status && styles.triggerIconStatus,
          )}>
          {status ? (
            <XDSIcon
              icon={STATUS_ICON_MAP[status.type]}
              size="sm"
              color={STATUS_ICON_COLOR_MAP[status.type]}
            />
          ) : (
            <XDSIcon icon="chevronDown" size="sm" color="inherit" />
          )}
        </span>
      </button>

      {popover.render(
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          {...stylex.props(
            styles.dropdown,
            !isPositioned && styles.dropdownHidden,
            styles.dropdownOffset(-selectedItemOffset),
          )}>
          {renderOptions()}
        </div>,
        {
          placement: 'below',
          alignment: 'start',
          xstyle: [styles.popover, layerAnimations.below],
        },
      )}
    </XDSField>
  );
}

XDSSelector.displayName = 'XDSSelector';
