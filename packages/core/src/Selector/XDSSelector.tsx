'use client';

/**
 * @file XDSSelector.tsx
 * @input Uses React, StyleX, useXDSLayer, XDSIcon
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
import {useXDSLayer} from '../Layer/useXDSLayer';
import {XDSIcon} from '../Icon';
import type {XDSIconName} from '../Icon';
import {
  XDSField,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
} from '../Field';
import {XDSDivider} from '../Divider';
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
  lineHeightVars,
  typeScaleVars,
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
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-border-strong'],
      },
    },
    borderRadius: radiusVars['--radius-2'],
    backgroundColor: colorVars['--color-surface'],
    fontFamily: typographyVars['--font-body'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    transitionProperty: 'border-color, outline, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': shadowVars['--inset-shadow-border-hover'],
      },
    },
    outline: {
      default: 'none',
      ':focus': `1px solid ${colorVars['--color-ring-focus']}`,
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

  // Dropdown container
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-2'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: `0 4px 12px ${colorVars['--color-shadow']}`,
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
    borderRadius: radiusVars['--radius-1'],
    fontFamily: typographyVars['--font-body'],
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
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
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

export interface XDSSelectorProps<
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

  /**
   * The currently selected value.
   */
  value?: string;

  /**
   * Callback when selection changes.
   */
  onChange?: (value: string) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  onChangeAction?: (value: string) => void | Promise<void>;

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
export function XDSSelector<T extends XDSSelectorOptionType>({
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
}: XDSSelectorProps<T>) {
  const triggerId = useId();
  const listboxId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

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

  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
    onHide: handleLayerHide,
  });

  // Calculate offset to position selected item over trigger
  const {offset: selectedItemOffset, isPositioned} = useSelectedItemOffset({
    isOpen: layer.isOpen,
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
    value,
    isDisabled,
    isOpen: layer.isOpen,
    onOpen: layer.show,
    onClose: layer.hide,
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

  // Render an individual item
  const renderItem = useCallback(
    (item: XDSSelectorOptionData, flatIndex: number) => {
      const isHighlighted = flatIndex === highlightedIndex;
      const isSelected = item.value === value;

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
          layer.ref(el);
        }}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={layer.isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          layer.isOpen && highlightedIndex >= 0
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
          xdsClassName('selector', {size}),
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
        <span>{selectedItem?.label ?? placeholder}</span>
        {isBusy && <XDSSpinner size="sm" />}
        <span
          {...stylex.props(
            styles.triggerIcon,
            !status && layer.isOpen && styles.triggerIconOpen,
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

      {layer.render(
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
          xstyle: styles.popover,
        },
      )}
    </XDSField>
  );
}

XDSSelector.displayName = 'XDSSelector';
