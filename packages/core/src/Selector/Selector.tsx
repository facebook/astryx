// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Selector.tsx
 * @input Uses React, StyleX, usePopover, useTooltip, Icon, InputGroupContext
 * @output Exports Selector component
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Selector/Selector.doc.mjs
 * - /packages/core/src/Selector/Selector.test.tsx
 * - /packages/core/src/Selector/index.ts
 * - /apps/storybook/stories/InputGroup.stories.tsx
 * - /packages/cli/templates/blocks/components/Selector/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {usePopover} from '../Popover/usePopover';
import {useTooltip} from '../Tooltip';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import type {IconName} from '../Icon';
import {
  Field,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputWrapperStyles,
} from '../Field';
import {Divider} from '../Divider';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerPlacement} from '../Layer/useLayer';
import {Spinner} from '../Spinner';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import type {SelectorOptionType, SelectorOptionData} from './types';
import {
  isOptionData,
  isDivider,
  isSection,
  normalizeOption,
  getSelectableOptions,
} from './utils';
import {useCombobox, useSelectedItemOffset} from './hooks';
import {SelectorOption} from './SelectorOption';
import {getInputARIA, mergeProps} from '../utils';
import {useSize} from '../SizeContext/SizeContext';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {groupStyles} from '../InputGroup/groupStyles';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {VisuallyHidden} from '../VisuallyHidden';

const styles = stylex.create({
  // Trigger container — the enhanced click target wrapping the combobox button and clear button as siblings
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
  // Trigger button — the actual combobox button, visually integrated with the container
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
    fontSize: {
      default: typeScaleVars['--text-label-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-label-size']})`,
    },
    color: colorVars['--color-text-primary'],
    outline: {
      default: 'none',
      ':focus': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: '0',
  },

  // Empty state
  emptyState: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'center',
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
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

/**
 * Size-specific overrides for dropdown list items.
 * Matches the pattern used by DropdownMenuItem so that
 * an `sm` selector renders compact list items, `md`/`lg` use
 * the base padding defined in `styles.item`.
 */
const itemSizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-1-5'],
  },
  lg: {},
});

const STATUS_ICON_MAP: Record<SelectorStatusType, IconName> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const STATUS_ICON_COLOR_MAP: Record<
  SelectorStatusType,
  'warning' | 'error' | 'success'
> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

export type SelectorSize = 'sm' | 'md' | 'lg';

export type SelectorStatusType = 'warning' | 'error' | 'success';

export interface SelectorStatus {
  /**
   * The type of status to display.
   */
  type: SelectorStatusType;
  /**
   * Optional message to display below the input.
   */
  message?: string;
}

interface SelectorPropsBase<
  T extends SelectorOptionType = SelectorOptionType,
> extends Omit<BaseProps, 'onChange' | 'defaultValue'> {
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
   * Explains why the selector is disabled. When set together with
   * `isDisabled`, the selector shows a tooltip with this text on hover and
   * keyboard focus, and the trigger stays focusable (via `aria-disabled`)
   * so the reason is discoverable by keyboard and assistive technology.
   * Activation stays blocked.
   *
   * Use this instead of wrapping a disabled selector in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Selector
   *   label="Owner"
   *   options={owners}
   *   isDisabled
   *   disabledMessage="You need the Editor role to change this"
   * />
   * ```
   */
  disabledMessage?: string;

  /**
   * The options to display in the selector.
   * Can be strings, objects, dividers, or sections.
   */
  options: T[];

  // value, onChange, changeAction, and hasClear are in the discriminated union below

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
  size?: SelectorSize;

  /**
   * Status indicator for the selector.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a message box below the selector.
   */
  status?: SelectorStatus;

  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;

  /**
   * Icon displayed at the start of the selector trigger.
   */
  startIcon?: ReactNode | IconType;

  /**
   * Custom render function for options.
   * Only called for selectable options (not dividers/sections).
   */
  renderOption?: (option: SelectorOptionData) => ReactNode;

  /**
   * Whether to show a search input for filtering options.
   * @default false
   */
  hasSearch?: boolean;

  /**
   * Placeholder text for the search input.
   * @default 'Search...'
   */
  searchPlaceholder?: string;

  /**
   * Position placement relative to the trigger.
   *
   * Omit to use the selector's default selected-item overlay behavior: the
   * selected item is positioned over the trigger and clamped to the viewport.
   * Set a placement to opt into explicit layer positioning (for example,
   * `placement="above"` for bottom-fixed toolbars).
   */
  placement?: LayerPlacement;

  /**
   * Whether the dropdown starts open on mount.
   * Useful for showcases and previews.
   * @default false
   */
  isDefaultOpen?: boolean;

  /**
   * The HTML name attribute for form submissions. When set, a hidden input
   * carries the selected value under this name, matching how a native
   * select serializes.
   */
  htmlName?: string;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

/**
 * Without `hasClear`, the selector always has a string value (or undefined for placeholder).
 * With `hasClear`, the value can be `null` and onChange receives `null` on clear.
 */
type SelectorPropsNonClearable<
  T extends SelectorOptionType = SelectorOptionType,
> = SelectorPropsBase<T> & {
  hasClear?: false;
  value?: string;
  onChange?: (value: string) => void;
  changeAction?: (value: string) => void | Promise<void>;
};

type SelectorPropsClearable<T extends SelectorOptionType = SelectorOptionType> =
  SelectorPropsBase<T> & {
    /**
     * Whether to show a clear button when a value is selected.
     * When clicked, resets the value to `null` and returns focus to the trigger.
     *
     * When enabled, `value` and `onChange` widen to include `null`.
     */
    hasClear: true;
    value: string | null;
    onChange?: (value: string | null) => void;
    changeAction?: (value: string | null) => void | Promise<void>;
  };

export type SelectorProps<T extends SelectorOptionType = SelectorOptionType> =
  | SelectorPropsNonClearable<T>
  | SelectorPropsClearable<T>;

/**
 * Default option renderer
 */
function DefaultOption({option}: {option: SelectorOptionData}) {
  return (
    <SelectorOption icon={option.icon} label={option.label ?? option.value} />
  );
}

/**
 * A selector/dropdown component for choosing from a list of options.
 *
 * @example
 * ```
 * <Selector
 *   label="Fruit"
 *   options={['Apple', 'Banana', 'Orange']}
 *   value={fruit}
 *   onChange={setFruit}
 *   placeholder="Select a fruit..."
 * />
 * ```
 */
export function Selector<T extends SelectorOptionType>(
  props: SelectorProps<T>,
) {
  const {
    label,
    isLabelHidden = false,
    description,
    isOptional = false,
    isRequired = false,
    isDisabled = false,
    disabledMessage,
    options,
    value,
    onChange,
    changeAction,
    isLoading = false,
    placeholder = 'Select...',
    size: sizeProp,
    status,
    labelTooltip,
    startIcon,
    htmlName,
    renderOption,
    hasSearch = false,
    searchPlaceholder = 'Search...',
    placement,
    isDefaultOpen = false,
    'data-testid': testId,
    width,
    xstyle,
    className,
    style,
    hasClear: hasClearProp,
    ...rest
  } = props as SelectorPropsClearable<T>;
  const hasClear = hasClearProp === true;
  const size = useSize(sizeProp, 'md');

  // Normalize null to undefined for internal use (null is the clear sentinel)
  const normalizedValue = value === null ? undefined : value;
  const triggerId = useId();
  const listboxId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const inputLabelId = useId();
  const searchId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const inputGroup = useInputGroup();

  const [searchQuery, setSearchQuery] = useState('');

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(normalizedValue);
  const isBusy = isLoading || optimisticValue !== normalizedValue;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the trigger container (which already exists)
  // and the trigger button stays perceivable via aria-disabled instead of the
  // disabled attribute. Activation is blocked by the isDisabled guards in
  // useCombobox (onTriggerClick / onKeyDown).
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container div is not naturally focusable; focusin bubbles up from
    // the trigger button, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelId,
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  // Flatten options for keyboard navigation
  const selectableItems = useMemo(
    () => getSelectableOptions(options),
    [options],
  );

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return selectableItems;
    }
    const query = searchQuery.toLowerCase();
    return selectableItems.filter(item =>
      (item.label ?? item.value).toLowerCase().includes(query),
    );
  }, [selectableItems, searchQuery]);

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
    setSearchQuery('');
    triggerRef.current?.focus();
  }, []);

  const popover = usePopover({
    onHide: handleLayerHide,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="listbox" is the exposed semantics; the trigger
    // keeps DOM focus, so wrapping it in a modal dialog would misrepresent it.
    role: 'none',
  });

  // Open dropdown on mount when isDefaultOpen is true
  useEffect(() => {
    if (isDefaultOpen) {
      popover.show();
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- mount-only: isDefaultOpen is not reactive
  }, []);

  // Calculate offset to position selected item over trigger. Explicit
  // placement opts out of the selector-specific overlay behavior and uses the
  // standard layer positioning API instead.
  const shouldOverlaySelectedItem = placement == null && !hasSearch;
  const {offset: rawOffset, isPositioned: rawIsPositioned} =
    useSelectedItemOffset({
      isOpen: popover.isOpen && shouldOverlaySelectedItem,
      selectedItemIndex,
      listboxId,
      listboxRef,
      triggerRef,
    });

  const selectedItemOffset = shouldOverlaySelectedItem ? rawOffset : 0;
  const isPositioned = shouldOverlaySelectedItem ? rawIsPositioned : true;
  const popoverPlacement = placement ?? 'below';
  const popoverOffsetStyle: React.CSSProperties | undefined =
    selectedItemOffset > 0
      ? {marginBlockStart: `-${selectedItemOffset}px`}
      : undefined;

  // Clear the current value. Shared by the clear button and the keyboard
  // Delete/Backspace path so clearing is reachable without a mouse.
  const clearValue = useCallback(() => {
    onChange?.(null);
    if (changeAction) {
      startTransition(async () => {
        setOptimisticValue(undefined);
        await changeAction(null);
      });
    }
  }, [onChange, changeAction, startTransition, setOptimisticValue]);

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
    selectableItems: filteredItems,
    value: normalizedValue,
    isDisabled,
    isOpen: popover.isOpen,
    hasSearch,
    onOpen: useCallback(() => {
      popover.show();
      if (hasSearch) {
        requestAnimationFrame(() => {
          searchRef.current?.focus();
        });
      }
    }, [popover, hasSearch]),
    onClose: popover.hide,
    onSelect: useCallback(
      (newValue: string) => {
        onChange?.(newValue);
        if (changeAction) {
          startTransition(async () => {
            setOptimisticValue(newValue);
            await changeAction(newValue);
          });
        }
      },
      [onChange, changeAction, startTransition, setOptimisticValue],
    ),
    onClear: hasClear ? clearValue : undefined,
    listboxId,
  });

  // Keep the highlighted option visible during keyboard navigation. The
  // listbox is a fixed-height scroll container, so without this the virtual
  // cursor walks off-screen once navigation passes the visible window. Mirrors
  // CommandPaletteItem's scrollIntoView({block: 'nearest'}) behavior.
  useEffect(() => {
    if (!popover.isOpen || highlightedIndex < 0) {
      return;
    }
    document
      .getElementById(getItemId(highlightedIndex))
      ?.scrollIntoView?.({block: 'nearest'});
  }, [popover.isOpen, highlightedIndex, getItemId]);

  // Handle clear button click
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Don't open dropdown
      clearValue();
    },
    [clearValue],
  );

  // Render search input
  const renderSearch = useCallback(() => {
    if (!hasSearch) {
      return null;
    }
    return (
      <div {...stylex.props(styles.searchWrapper)}>
        <input
          ref={searchRef}
          id={searchId}
          // When hasSearch is set, focus moves into this input on open, so it —
          // not the trigger — must be the combobox that reports the highlighted
          // option via aria-activedescendant (comboboxes-4). A bare searchbox
          // left the highlight silent to screen readers.
          role="combobox"
          aria-expanded={popover.isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            popover.isOpen && highlightedIndex >= 0
              ? getItemId(highlightedIndex)
              : undefined
          }
          aria-label="Search options"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            // Arrow keys navigate options; Enter selects; Escape/Tab close.
            // Home/End are left to the input for caret movement.
            if (
              e.key === 'ArrowDown' ||
              e.key === 'ArrowUp' ||
              e.key === 'Enter' ||
              e.key === 'Escape' ||
              e.key === 'Tab'
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
    popover.isOpen,
    highlightedIndex,
    getItemId,
  ]);

  // Render an individual item
  const renderItem = useCallback(
    (item: SelectorOptionData, flatIndex: number) => {
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
            itemSizeStyles[size],
            isHighlighted && styles.itemHighlighted,
            isSelected && styles.itemSelected,
            item.disabled && styles.itemDisabled,
          )}>
          <span {...stylex.props(styles.itemContent)}>
            {renderOption ? (
              renderOption(item)
            ) : (
              <DefaultOption option={item} />
            )}
          </span>
          {isSelected && <Icon icon="check" size="sm" color="accent" />}
        </div>
      );
    },
    [
      renderOption,
      highlightedIndex,
      size,
      normalizedValue,
      getItemId,
      onItemSelect,
      onItemMouseEnter,
    ],
  );

  // Render all options (handling sections/dividers)
  const renderOptions = useCallback(() => {
    // When search is active, render filtered items flat (no sections/dividers)
    if (hasSearch && searchQuery) {
      if (filteredItems.length === 0) {
        return [
          <div key="empty" {...stylex.props(styles.emptyState)}>
            No results found
          </div>,
        ];
      }
      return filteredItems.map((item, index) => renderItem(item, index));
    }

    let flatIndex = 0;
    const elements: ReactNode[] = [];

    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (isDivider(option)) {
        elements.push(<Divider key={`divider-${i}`} xstyle={styles.divider} />);
      } else if (isSection(option)) {
        const sectionItems: ReactNode[] = [];
        for (const opt of option.options) {
          sectionItems.push(renderItem(normalizeOption(opt), flatIndex));
          flatIndex++;
        }
        if (option.title) {
          elements.push(
            <Divider
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
  }, [options, renderItem, hasSearch, searchQuery, filteredItems]);

  const selectorContent = (
    <>
      <div
        ref={el => {
          popover.triggerRef(el);
          // Anchor + hover/focus listeners for the disabled-message tooltip.
          // Handlers are gated internally by isEnabled, and anchor names
          // compose, so attaching unconditionally is safe.
          disabledMessageTooltip.ref(el);
        }}
        onClick={onTriggerClick}
        data-testid={testId}
        {...mergeProps(
          themeProps('selector', {size, status: status?.type ?? null}),
          stylex.props(
            inputWrapperStyles.base,
            styles.triggerContainer,
            sizeStyles[size],
            isDisabled && inputWrapperStyles.disabled,
            !selectedItem && styles.triggerPlaceholder,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            inputGroup && groupStyles.inGroup,
            xstyle,
          ),
          className,
          style,
        )}>
        {startIcon &&
          renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
        {inputGroup && (
          <VisuallyHidden id={inputLabelId}>{label}</VisuallyHidden>
        )}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          // In hasSearch mode the popup's search input is the combobox (it owns
          // focus + aria-activedescendant, comboboxes-4), so the trigger is a
          // plain button that opens the listbox — not a second combobox.
          role={hasSearch ? undefined : 'combobox'}
          {...rest}
          aria-haspopup="listbox"
          aria-expanded={popover.isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            !hasSearch && popover.isOpen && highlightedIndex >= 0
              ? getItemId(highlightedIndex)
              : undefined
          }
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          aria-required={isRequired ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          // With a disabledMessage the trigger keeps focusability via
          // aria-disabled so the reason is focus-discoverable; activation is
          // still blocked by the isDisabled guards in useCombobox.
          disabled={isDisabled && !showsDisabledMessage}
          aria-disabled={showsDisabledMessage ? 'true' : undefined}
          onKeyDown={onKeyDown}
          tabIndex={isDisabled && !showsDisabledMessage ? -1 : 0}
          {...stylex.props(styles.trigger)}>
          <span {...stylex.props(styles.triggerLabel)}>
            {selectedItem?.label ?? placeholder}
          </span>
        </button>
        {htmlName != null && (
          <input
            type="hidden"
            name={htmlName}
            value={value ?? ''}
            // Disabled native controls are excluded from form submission;
            // mirror that for the hidden carrier.
            disabled={isDisabled}
          />
        )}
        {isBusy && <Spinner size="sm" />}
        {hasClear && value != null && !isDisabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={`Clear ${label}`}
            {...stylex.props(styles.clearButton)}>
            <Icon icon="close" size="sm" color="secondary" />
          </button>
        )}
        <span
          {...stylex.props(
            styles.triggerIcon,
            !status && popover.isOpen && styles.triggerIconOpen,
            status && styles.triggerIconStatus,
          )}>
          {status ? (
            <Icon
              icon={STATUS_ICON_MAP[status.type]}
              size="sm"
              color={STATUS_ICON_COLOR_MAP[status.type]}
            />
          ) : (
            <Icon icon="chevronDown" size="sm" color="inherit" />
          )}
        </span>
      </div>

      {popover.render(
        hasSearch ? (
          <div>
            {renderSearch()}
            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={triggerId}
              {...stylex.props(styles.dropdown)}>
              {renderOptions()}
            </div>
          </div>
        ) : (
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            {...stylex.props(
              styles.dropdown,
              !isPositioned && styles.dropdownHidden,
            )}>
            {renderOptions()}
          </div>
        ),
        {
          placement: popoverPlacement,
          alignment: 'start',
          xstyle: [styles.popover, layerAnimations[popoverPlacement]],
          style: popoverOffsetStyle,
        },
      )}

      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </>
  );

  if (inputGroup) {
    return selectorContent;
  }

  return (
    <Field
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
      labelTooltip={labelTooltip}
      width={width}>
      {selectorContent}
    </Field>
  );
}

Selector.displayName = 'Selector';
