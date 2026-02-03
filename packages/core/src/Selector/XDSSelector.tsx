/**
 * @file XDSSelector.tsx
 * @input Uses React, StyleX, useXDSLayer, XDSIcon
 * @output Exports XDSSelector component
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Selector/README.md
 * - /packages/core/src/Selector/index.ts
 */

import React, {
  useCallback,
  useId,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSLayer} from '../Layer/useXDSLayer';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {CheckIcon, ChevronDownIcon} from '@heroicons/react/16/solid';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import {XDSField} from '../Field';
import {XDSDivider} from '../Divider';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {type XDSSelectorOption, type XDSSelectorItemData} from './types';
import {
  isItemData,
  isDivider,
  isSection,
  normalizeItem,
  getSelectableItems,
} from './utils';
import {useCombobox, useSelectedItemOffset} from './hooks';
import {XDSSelectorItem} from './XDSSelectorItem';

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
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-high-contrast'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: 1.429,
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
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
  },
  triggerDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
  triggerPlaceholder: {
    color: colorVars['--color-text-placeholder'],
  },
  triggerIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    transition: `transform ${transitionVars['--transition-fast']}`,
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
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: `0 4px 12px ${colorVars['--color-shadow-elevation']}`,
    opacity: 1,
    transition: `opacity ${transitionVars['--transition-fast']}`,
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
    borderRadius: radiusVars['--radius-content'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
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
    backgroundColor: colorVars['--color-hover-overlay'],
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
    paddingBlock: spacingVars['--spacing-1'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-2'],
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

const STATUS_ICON_MAP: Record<XDSSelectorStatusType, XDSIconType> = {
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
};

const STATUS_ICON_COLOR_MAP: Record<
  XDSSelectorStatusType,
  'warning' | 'negative' | 'positive'
> = {
  warning: 'warning',
  error: 'negative',
  success: 'positive',
};

export type XDSSelectorSize = 'sm' | 'md';

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
  T extends XDSSelectorOption = XDSSelectorOption,
> {
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
   * The items to display in the selector.
   * Can be strings, objects, dividers, or sections.
   */
  items: T[];

  /**
   * The currently selected value.
   */
  value?: string;

  /**
   * Callback when selection changes.
   */
  onChange?: (value: string) => void;

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
   * Custom render function for items.
   * Only called for selectable items (not dividers/sections).
   */
  children?: (item: XDSSelectorItemData) => ReactNode;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

/**
 * Default item renderer
 */
function DefaultItem({item}: {item: XDSSelectorItemData}) {
  return <XDSSelectorItem icon={item.icon} label={item.label ?? item.value} />;
}

/**
 * A selector/dropdown component for choosing from a list of options.
 *
 * @example
 * ```tsx
 * <XDSSelector
 *   label="Fruit"
 *   items={['Apple', 'Banana', 'Orange']}
 *   value={fruit}
 *   onChange={setFruit}
 *   placeholder="Select a fruit..."
 * />
 * ```
 */
export function XDSSelector<T extends XDSSelectorOption>({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  items,
  value,
  onChange,
  placeholder = 'Select...',
  size = 'md',
  status,
  labelTooltip,
  children,
  'data-testid': testId,
}: XDSSelectorProps<T>) {
  const triggerId = useId();
  const listboxId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Build aria-describedby
  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // Flatten items for keyboard navigation
  const selectableItems = useMemo(() => getSelectableItems(items), [items]);

  // Find selected item and its index for positioning
  const selectedItemIndex = useMemo(() => {
    return selectableItems.findIndex(item => item.value === value);
  }, [selectableItems, value]);

  const selectedItem = useMemo(() => {
    return selectedItemIndex >= 0
      ? selectableItems[selectedItemIndex]
      : undefined;
  }, [selectableItems, selectedItemIndex]);

  // Ref for listbox to measure selected item position
  const listboxRef = useRef<HTMLDivElement>(null);

  // Layer for dropdown positioning
  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
    onHide: () => {
      triggerRef.current?.focus();
    },
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
    setHighlightedIndex: _,
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
    onSelect: onChange,
    listboxId,
  });

  // Render an individual item
  const renderItem = useCallback(
    (item: XDSSelectorItemData, flatIndex: number) => {
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
            {children ? children(item) : <DefaultItem item={item} />}
          </span>
          {isSelected && <CheckIcon {...stylex.props(styles.itemCheckmark)} />}
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

    for (let i = 0; i < items.length; i++) {
      const option = items[i];

      if (isDivider(option)) {
        elements.push(
          <XDSDivider key={`divider-${i}`} xstyle={styles.divider} />,
        );
      } else if (isSection(option)) {
        const sectionItems: ReactNode[] = [];
        for (const item of option.items) {
          sectionItems.push(renderItem(normalizeItem(item), flatIndex));
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
      } else if (isItemData(option)) {
        elements.push(renderItem(normalizeItem(option), flatIndex));
        flatIndex++;
      }
    }

    return elements;
  }, [items, renderItem, listboxId]);

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
        disabled={isDisabled}
        onClick={onTriggerClick}
        onKeyDown={onKeyDown}
        data-testid={testId}
        {...stylex.props(
          styles.trigger,
          sizeStyles[size],
          isDisabled && styles.triggerDisabled,
          !selectedItem && styles.triggerPlaceholder,
          status && statusBorderStyles[status.type],
        )}>
        <span>{selectedItem?.label ?? placeholder}</span>
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
            <ChevronDownIcon />
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
