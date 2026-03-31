'use client';

/**
 * @file XDSMultiSelector.tsx
 * @input Uses React, StyleX, useXDSLayer, XDSCheckboxInput, XDSField, XDSBadge, XDSIcon
 * @output Exports XDSMultiSelector component
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/MultiSelector/MultiSelector.doc.mjs
 * - /packages/core/src/MultiSelector/index.ts
 */

import React, {
  useCallback,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
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
import {XDSCheckboxInput} from '../CheckboxInput';
import {XDSBadge} from '../Badge';
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
import type {
  XDSMultiSelectorOptionType,
  XDSMultiSelectorOptionData,
  XDSMultiSelectorStatus,
} from './types';
import {
  isOptionData,
  isDivider,
  isSection,
  normalizeOption,
  getSelectableOptions,
} from '../Selector/utils';
import {useMultiCombobox} from './hooks';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

// Theme module augmentation
declare module '../theme/types' {
  interface ComponentStyles {
    multiSelector?: {
      variants?: Partial<
        Record<string, import('@stylexjs/stylex').StyleXStyles>
      >;
    };
  }
}

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
  triggerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  triggerText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  triggerBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    alignItems: 'center',
  },
  triggerOverflow: {
    flexShrink: 0,
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-secondary'],
    fontWeight: fontWeightVars['--font-weight-medium'],
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
    transition: 'none',
  },

  // Dropdown container
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: shadowVars['--shadow-low'],
  },

  // Popover container (for anchor positioning)
  popover: {
    minWidth: 'anchor-size(width)',
  },

  // Search input
  searchWrapper: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  searchInput: {
    boxSizing: 'border-box',
    width: '100%',
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-surface'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    outline: {
      default: 'none',
      ':focus': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: '0',
  },

  // Select-all wrapper
  selectAllWrapper: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
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
    gap: spacingVars['--spacing-2'],
    width: '100%',
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // Empty state
  emptyState: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'center',
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
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

const STATUS_ICON_MAP: Record<XDSMultiSelectorStatusType, XDSIconName> = {
  warning: 'warning',
  error: 'xCircle',
  success: 'checkCircle',
};

const STATUS_ICON_COLOR_MAP: Record<
  XDSMultiSelectorStatusType,
  'warning' | 'negative' | 'positive'
> = {
  warning: 'warning',
  error: 'negative',
  success: 'positive',
};

export type XDSMultiSelectorSize = 'sm' | 'md' | 'lg';

export type XDSMultiSelectorStatusType = 'warning' | 'error' | 'success';

export type {XDSMultiSelectorStatus};

export interface XDSMultiSelectorProps<
  T extends XDSMultiSelectorOptionType = XDSMultiSelectorOptionType,
> extends Omit<XDSBaseProps, 'onChange' | 'defaultValue' | 'children'> {
  /**
   * Label text for the multi-selector (always rendered for accessibility).
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
   * The currently selected values.
   */
  value: string[];

  /**
   * Callback when selection changes.
   */
  onChange: (value: string[]) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  onChangeAction?: (value: string[]) => void | Promise<void>;

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
   * @default 'md'
   */
  size?: XDSMultiSelectorSize;

  /**
   * Status indicator for the selector.
   */
  status?: XDSMultiSelectorStatus;

  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;

  /**
   * Whether to show a "Select all" checkbox.
   * @default false
   */
  hasSelectAll?: boolean;

  /**
   * Label for the select-all checkbox.
   * @default 'Select all'
   */
  selectAllLabel?: string;

  /**
   * Whether to show a search input.
   * @default false
   */
  hasSearch?: boolean;

  /**
   * Placeholder text for the search input.
   * @default 'Search...'
   */
  searchPlaceholder?: string;

  /**
   * How to display selected items in the trigger.
   * - 'count': "3 selected"
   * - 'labels': "Name, Email, +3"
   * - 'badges': [Name] [Email] +2
   * @default 'count'
   */
  triggerDisplay?: 'count' | 'labels' | 'badges';

  /**
   * Maximum number of badges to show before showing "+N".
   * Only used when triggerDisplay is 'badges'.
   * @default 3
   */
  maxBadges?: number;

  /**
   * Custom render function for options.
   * Only called for selectable options (not dividers/sections).
   */
  children?: (option: XDSMultiSelectorOptionData) => ReactNode;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

/**
 * A multi-select dropdown component with checkboxes for choosing
 * multiple items from a list of options.
 *
 * @example
 * ```
 * <XDSMultiSelector
 *   label="Columns"
 *   options={['Name', 'Email', 'Role', 'Status']}
 *   value={selectedColumns}
 *   onChange={setSelectedColumns}
 *   hasSelectAll
 * />
 * ```
 */
export function XDSMultiSelector<T extends XDSMultiSelectorOptionType>({
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
  hasSelectAll = false,
  selectAllLabel = 'Select all',
  hasSearch = false,
  searchPlaceholder = 'Search...',
  triggerDisplay = 'count',
  maxBadges = 3,
  children,
  'data-testid': testId,
  xstyle,
  className,
  style,
}: XDSMultiSelectorProps<T>) {
  const triggerId = useId();
  const listboxId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const searchId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return selectableItems;
    const query = searchQuery.toLowerCase();
    return selectableItems.filter(item =>
      (item.label ?? item.value).toLowerCase().includes(query),
    );
  }, [selectableItems, searchQuery]);

  // Layer for dropdown positioning
  const handleLayerHide = useCallback(() => {
    setSearchQuery('');
    triggerRef.current?.focus();
  }, []);

  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
    onHide: handleLayerHide,
  });

  // Handle toggle
  const handleToggle = useCallback(
    (itemValue: string) => {
      const newValue = optimisticValue.includes(itemValue)
        ? optimisticValue.filter(v => v !== itemValue)
        : [...optimisticValue, itemValue];

      onChange(newValue);
      if (onChangeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await onChangeAction(newValue);
        });
      }
    },
    [
      optimisticValue,
      onChange,
      onChangeAction,
      startTransition,
      setOptimisticValue,
    ],
  );

  // Multi-select combobox behavior
  const {
    highlightedIndex,
    getItemId,
    onTriggerClick,
    onKeyDown,
    onItemMouseEnter,
  } = useMultiCombobox({
    selectableItems: filteredItems,
    isDisabled,
    isOpen: layer.isOpen,
    hasSearch,
    onOpen: useCallback(() => {
      layer.show();
      if (hasSearch) {
        // Focus search after layer opens
        requestAnimationFrame(() => {
          searchRef.current?.focus();
        });
      }
    }, [layer, hasSearch]),
    onClose: layer.hide,
    onToggle: handleToggle,
    listboxId,
  });

  // Select-all logic
  const enabledItems = useMemo(
    () => filteredItems.filter(item => !item.disabled),
    [filteredItems],
  );

  const allEnabledSelected = useMemo(
    () =>
      enabledItems.length > 0 &&
      enabledItems.every(item => optimisticValue.includes(item.value)),
    [enabledItems, optimisticValue],
  );

  const someSelected = useMemo(
    () => enabledItems.some(item => optimisticValue.includes(item.value)),
    [enabledItems, optimisticValue],
  );

  const selectAllState: boolean | 'indeterminate' = allEnabledSelected
    ? true
    : someSelected
      ? 'indeterminate'
      : false;

  const handleSelectAll = useCallback(() => {
    let newValue: string[];
    if (allEnabledSelected) {
      // Deselect all enabled items, keep disabled items that are selected
      const enabledValues = new Set(enabledItems.map(item => item.value));
      newValue = optimisticValue.filter(v => !enabledValues.has(v));
    } else {
      // Select all enabled items
      const currentSet = new Set(optimisticValue);
      newValue = [...optimisticValue];
      for (const item of enabledItems) {
        if (!currentSet.has(item.value)) {
          newValue.push(item.value);
        }
      }
    }

    onChange(newValue);
    if (onChangeAction) {
      startTransition(async () => {
        setOptimisticValue(newValue);
        await onChangeAction(newValue);
      });
    }
  }, [
    allEnabledSelected,
    enabledItems,
    optimisticValue,
    onChange,
    onChangeAction,
    startTransition,
    setOptimisticValue,
  ]);

  // Build trigger display content
  const selectedLabels = useMemo(() => {
    return optimisticValue.map(v => {
      const item = selectableItems.find(i => i.value === v);
      return item?.label ?? v;
    });
  }, [optimisticValue, selectableItems]);

  const renderTriggerContent = useCallback(() => {
    if (optimisticValue.length === 0) {
      return <span {...stylex.props(styles.triggerText)}>{placeholder}</span>;
    }

    switch (triggerDisplay) {
      case 'count':
        return (
          <span {...stylex.props(styles.triggerText)}>
            {optimisticValue.length} selected
          </span>
        );

      case 'labels': {
        const displayed = selectedLabels.slice(0, 3);
        const remaining = selectedLabels.length - displayed.length;
        const text =
          remaining > 0
            ? `${displayed.join(', ')}, +${remaining}`
            : displayed.join(', ');
        return <span {...stylex.props(styles.triggerText)}>{text}</span>;
      }

      case 'badges': {
        const displayed = selectedLabels.slice(0, maxBadges);
        const remaining = selectedLabels.length - displayed.length;
        return (
          <span {...stylex.props(styles.triggerBadges)}>
            {displayed.map(label => (
              <XDSBadge key={label} label={label} variant="neutral" />
            ))}
            {remaining > 0 && (
              <span {...stylex.props(styles.triggerOverflow)}>
                +{remaining}
              </span>
            )}
          </span>
        );
      }
    }
  }, [optimisticValue, triggerDisplay, selectedLabels, placeholder, maxBadges]);

  // Render search input
  const renderSearch = useCallback(() => {
    if (!hasSearch) return null;
    return (
      <div {...stylex.props(styles.searchWrapper)}>
        <input
          ref={searchRef}
          id={searchId}
          role="searchbox"
          aria-controls={listboxId}
          aria-label="Search options"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            // Let ArrowDown/Up/Escape propagate to parent handler
            if (
              e.key === 'ArrowDown' ||
              e.key === 'ArrowUp' ||
              e.key === 'Escape'
            ) {
              onKeyDown(e);
            }
          }}
          placeholder={searchPlaceholder}
          {...stylex.props(styles.searchInput)}
        />
      </div>
    );
  }, [
    hasSearch,
    searchId,
    listboxId,
    searchQuery,
    searchPlaceholder,
    onKeyDown,
  ]);

  // Render an individual item
  const renderItem = useCallback(
    (item: XDSMultiSelectorOptionData, flatIndex: number) => {
      const isHighlighted = flatIndex === highlightedIndex;
      const isSelected = optimisticValue.includes(item.value);

      return (
        <div
          key={item.value}
          id={getItemId(flatIndex)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              handleToggle(item.value);
            }
          }}
          onMouseEnter={() => onItemMouseEnter(item, flatIndex)}
          {...stylex.props(
            styles.item,
            isHighlighted && styles.itemHighlighted,
            item.disabled && styles.itemDisabled,
          )}>
          <XDSCheckboxInput
            label={children ? '' : (item.label ?? item.value)}
            isLabelHidden={!!children}
            value={isSelected}
            onChange={() => {
              if (!item.disabled) {
                handleToggle(item.value);
              }
            }}
            isDisabled={item.disabled}
            size="sm"
          />
          {children && children(item)}
        </div>
      );
    },
    [
      children,
      highlightedIndex,
      optimisticValue,
      getItemId,
      handleToggle,
      onItemMouseEnter,
    ],
  );

  // Render all options (handling sections/dividers and search filtering)
  const renderOptions = useCallback(() => {
    if (searchQuery) {
      // When searching, render flat filtered list
      if (filteredItems.length === 0) {
        return <div {...stylex.props(styles.emptyState)}>No results found</div>;
      }
      return filteredItems.map((item, index) => renderItem(item, index));
    }

    // Normal rendering with sections/dividers
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
  }, [options, renderItem, filteredItems, searchQuery]);

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
          xdsClassName('multi-selector', {size, status: status?.type ?? null}),
          stylex.props(
            styles.trigger,
            sizeStyles[size],
            isDisabled && styles.triggerDisabled,
            optimisticValue.length === 0 && styles.triggerPlaceholder,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <span {...stylex.props(styles.triggerContent)}>
          {renderTriggerContent()}
        </span>
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
        <div {...stylex.props(styles.dropdown)}>
          {renderSearch()}
          {hasSelectAll && (
            <>
              <div {...stylex.props(styles.selectAllWrapper)}>
                <XDSCheckboxInput
                  label={selectAllLabel}
                  value={selectAllState}
                  onChange={handleSelectAll}
                  size="sm"
                />
              </div>
              <XDSDivider xstyle={styles.divider} />
            </>
          )}
          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={triggerId}>
            {renderOptions()}
          </div>
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

XDSMultiSelector.displayName = 'XDSMultiSelector';
