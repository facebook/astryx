// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MultiSelector.tsx
 * @input Uses React, StyleX, usePopover, useTooltip, CheckboxInput, Field, Badge, Icon, InputGroupContext
 * @output Exports MultiSelector component
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/MultiSelector/MultiSelector.doc.mjs
 * - /packages/core/src/MultiSelector/MultiSelector.test.tsx
 * - /packages/core/src/MultiSelector/index.ts
 * - /apps/storybook/stories/InputGroup.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/MultiSelector/ (showcase blocks)
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
  type FieldStatusVariant,
} from '../Field';
import {Divider} from '../Divider';
import {Spinner} from '../Spinner';
import {TextInput} from '../TextInput';
import {CheckboxInput} from '../CheckboxInput';
import {Badge} from '../Badge';
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
import type {
  MultiSelectorOptionType,
  MultiSelectorOptionData,
  MultiSelectorStatus,
} from './types';
import {
  isOptionData,
  isDivider,
  isSection,
  normalizeOption,
  getSelectableOptions,
} from '../Selector/utils';
import {useMultiCombobox} from './hooks';
import {getInputARIA, mergeProps} from '../utils';
import {useAnnounce} from '../hooks/useAnnounce';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {useSize} from '../SizeContext/SizeContext';
import {themeProps} from '../utils/themeProps';
import {groupStyles} from '../InputGroup/groupStyles';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {VisuallyHidden} from '../VisuallyHidden';
import {useTranslator} from '../i18n';

// Sentinel value for the select-all item in keyboard navigation
const SELECT_ALL_VALUE = '__xds_select_all__';

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
    fontSize: typeScaleVars['--text-label-size'],
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
    // :focus-within when this button is focused, matching
    // TextInput/NumberInput/Selector. The button must not draw its own
    // :focus-visible outline or the two stack into a doubled ring over the
    // trigger.
    outline: 'none',
    borderRadius: radiusVars['--radius-element'],
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
  triggerGhost: {
    width: 'auto',
    borderWidth: 0,
    backgroundColor: 'transparent',
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within)': {
        '@media (hover: hover)': 'none',
      },
      ':focus-within': 'none',
    },
    fontWeight: fontWeightVars['--font-weight-medium'],
    outline: {
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '3px',
    },
    transitionProperty:
      'background-image, background-color, color, opacity, transform',
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.98)',
    },
  },
  triggerGhostDisabled: {
    backgroundImage: 'none',
    transform: {
      default: 'none',
      ':active': 'none',
    },
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

  // Dropdown container
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
  },

  // Popover container (for anchor positioning)
  popover: {
    minWidth: 'anchor-size(width)',
    marginBlockStart: spacingVars['--spacing-1'],
  },

  // Search field. The inner TextInput owns the border, focus ring, magnifier
  // (startIcon), and clear button (hasClear); this wrapper only supplies the
  // dropdown's inline/block padding around it.
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },

  // Select-all wrapper
  selectAllWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    cursor: 'pointer',
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

  // Decorative checkbox (non-interactive, purely visual)
  checkboxDecorative: {
    pointerEvents: 'none',
    display: 'flex',
    flexShrink: 0,
  },

  // Label text for items (rendered outside checkbox for correct click behavior)
  itemLabel: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemLabelDisabled: {
    color: colorVars['--color-text-disabled'],
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

const itemSizeStyles = stylex.create({
  sm: {
    padding: spacingVars['--spacing-1'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-2'],
  },
  lg: {
    padding: spacingVars['--spacing-2'],
  },
});

const selectAllSizeStyles = stylex.create({
  sm: {
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-0-5'],
  },
  md: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  lg: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
});

const STATUS_ICON_MAP: Record<MultiSelectorStatusType, IconName> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const STATUS_ICON_COLOR_MAP: Record<
  MultiSelectorStatusType,
  'warning' | 'error' | 'success'
> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const STATUS_BUTTON_LABEL_KEY: Record<MultiSelectorStatusType, string> = {
  warning: '@astryx.input.statusButton.warning',
  error: '@astryx.input.statusButton.error',
  success: '@astryx.input.statusButton.success',
};

export type MultiSelectorSize = 'sm' | 'md' | 'lg';

export type MultiSelectorVariant = 'input' | 'ghost';

export type MultiSelectorStatusType = 'warning' | 'error' | 'success';

export type {MultiSelectorStatus};

export interface MultiSelectorProps<
  T extends MultiSelectorOptionType = MultiSelectorOptionType,
> extends Omit<BaseProps, 'onChange' | 'defaultValue'> {
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
   * <MultiSelector
   *   label="Columns"
   *   options={columns}
   *   value={selected}
   *   onChange={setSelected}
   *   isDisabled
   *   disabledMessage="Select a table first"
   * />
   * ```
   */
  disabledMessage?: string;

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
   * The HTML name attribute for form submissions. When set, hidden inputs
   * carry one entry per selected value under this name, matching how a
   * native multi-select serializes.
   */
  htmlName?: string;

  /**
   * Callback when selection changes.
   */
  onChange: (value: string[]) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  changeAction?: (value: string[]) => void | Promise<void>;

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
  size?: MultiSelectorSize;

  /**
   * Visual style of the selector trigger.
   * - 'input': bordered input-style trigger for forms
   * - 'ghost': borderless trigger matching ghost buttons, for toolbars
   * @default 'input'
   */
  variant?: MultiSelectorVariant;

  /**
   * Status indicator for the selector.
   */
  status?: MultiSelectorStatus;
  /**
   * How the status message is placed relative to the input.
   * - 'attached': message overlaps directly below the bordered input (input variant only)
   * - 'detached': message floats below as a separate element with spacing
   * - 'tooltip': message is exposed from the on-field status icon
   * @default 'attached' for input selectors; 'detached' for ghost selectors
   */
  statusVariant?: FieldStatusVariant;

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
   * Whether to show a clear button when values are selected.
   * When clicked, resets the value to an empty array and returns focus to the trigger.
   * @default false
   */
  hasClear?: boolean;

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
   * Only called for selectable options (not dividers/sections or the select-all row).
   */
  renderOption?: (option: MultiSelectorOptionData) => ReactNode;

  /**
   * Whether the dropdown starts open on mount.
   * Useful for showcases and previews.
   * @default false
   */
  isDefaultOpen?: boolean;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// Case-insensitive substring match for a single option. The one predicate used
// by both the flat filter (count + keyboard nav) and the grouped renderer, so
// what is shown while searching stays in lockstep with the announced count.
function optionMatchesQuery(
  option: MultiSelectorOptionData,
  query: string,
): boolean {
  if (!query) {
    return true;
  }
  return (option.label ?? option.value)
    .toLowerCase()
    .includes(query.toLowerCase());
}

// Case-insensitive substring filter over the selectable options. Shared by the
// `filteredItems` memo (rendering) and the search-change handler, which needs
// the count for the *next* query synchronously to announce it exactly once per
// keystroke rather than reacting to state in an effect.
function filterOptionsByQuery(
  items: MultiSelectorOptionData[],
  query: string,
): MultiSelectorOptionData[] {
  if (!query) {
    return items;
  }
  return items.filter(item => optionMatchesQuery(item, query));
}

/**
 * A multi-select dropdown component with checkboxes for choosing
 * multiple items from a list of options.
 *
 * @example
 * ```
 * <MultiSelector
 *   label="Columns"
 *   options={['Name', 'Email', 'Role', 'Status']}
 *   value={selectedColumns}
 *   onChange={setSelectedColumns}
 *   hasSelectAll
 * />
 * ```
 */
export function MultiSelector<T extends MultiSelectorOptionType>({
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
  placeholder: placeholderFromProps,
  size: sizeProp,
  variant = 'input',
  status,
  statusVariant = 'attached',
  labelTooltip,
  startIcon,
  hasClear = false,
  hasSelectAll = false,
  selectAllLabel: selectAllLabelFromProps,
  hasSearch = false,
  searchPlaceholder: searchPlaceholderFromProps,
  triggerDisplay = 'count',
  maxBadges = 3,
  renderOption,
  isDefaultOpen = false,
  'data-testid': testId,
  htmlName,
  width,
  xstyle,
  className,
  style,
}: MultiSelectorProps<T>) {
  const t = useTranslator();
  const placeholder =
    placeholderFromProps ?? t('@astryx.multiSelector.selectPlaceholder');
  const selectAllLabel =
    selectAllLabelFromProps ?? t('@astryx.multiSelector.selectAll');
  const searchPlaceholder =
    searchPlaceholderFromProps ?? t('@astryx.multiSelector.searchPlaceholder');
  const size = useSize(sizeProp, 'md');
  const effectiveStatusVariant =
    variant === 'ghost' && statusVariant === 'attached'
      ? 'detached'
      : statusVariant;

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
  // A typed query shows TextInput's built-in clear (✕) button, which becomes
  // the next tab stop after the search input.
  const hasQuery = searchQuery.length > 0;

  // Snapshot of which values were selected when the dropdown opened.
  // Stored as state (not a ref) so sortedItems recomputes exactly once on open,
  // then stays frozen until the menu closes.
  const [selectedAtOpen, setSelectedAtOpen] = useState<Set<string> | null>(
    null,
  );

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the trigger container (which already exists)
  // and the trigger button stays perceivable via aria-disabled instead of the
  // disabled attribute. Activation is blocked by the isDisabled guards in
  // useMultiCombobox (onTriggerClick / onKeyDown).
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container div is not naturally focusable; focusin bubbles up from
    // the trigger button, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });
  const statusTooltip = useTooltip({
    placement: 'above',
    isEnabled: effectiveStatusVariant === 'tooltip' && !!status?.message,
  });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelId,
    [
      description ? descriptionId : null,
      !inputGroup && effectiveStatusVariant !== 'tooltip' && status?.message
        ? statusMessageId
        : null,
      effectiveStatusVariant === 'tooltip' && status?.message
        ? statusTooltip.describedBy
        : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  // Flatten options for keyboard navigation
  const selectableItems = useMemo(
    () => getSelectableOptions(options),
    [options],
  );

  // Announce selection-count changes politely (comboboxes-7 announce path).
  // Toggling options / select-all previously produced no audible feedback.
  const announce = useAnnounce();
  const announceSelection = useCallback(
    (nextValue: string[]) => {
      const total = selectableItems.length;
      const selectableSet = new Set(selectableItems.map(item => item.value));
      const selectedCount = nextValue.filter(v => selectableSet.has(v)).length;
      if (selectedCount === 0) {
        announce('Selection cleared');
      } else if (total > 0 && selectedCount === total) {
        announce('All selected');
      } else {
        announce(`${selectedCount} of ${total} selected`);
      }
    },
    [announce, selectableItems],
  );

  // Filter items by search query
  const filteredItems = useMemo(
    () => filterOptionsByQuery(selectableItems, searchQuery),
    [selectableItems, searchQuery],
  );

  // Single source of truth for item order. Both the hook (keyboard navigation)
  // and renderOptions (DOM rendering) consume this list — no independent sorting.
  // Selected-at-open items are placed first within each group/section, and the
  // same walk applies while searching so group structure survives filtering
  // (only matching items are kept; the query is empty in non-search mode).
  const sortedItems = useMemo(() => {
    const selectedSet = selectedAtOpen ?? new Set<string>();
    const result: MultiSelectorOptionData[] = [];
    let pendingFlat: MultiSelectorOptionData[] = [];

    const orderSelectedFirst = (items: MultiSelectorOptionData[]) => {
      const selected = items.filter(item => selectedSet.has(item.value));
      const unselected = items.filter(item => !selectedSet.has(item.value));
      return [...selected, ...unselected];
    };

    const flushFlat = () => {
      if (pendingFlat.length === 0) {
        return;
      }
      result.push(...orderSelectedFirst(pendingFlat));
      pendingFlat = [];
    };

    for (const option of options) {
      if (isDivider(option)) {
        flushFlat();
      } else if (isSection(option)) {
        flushFlat();
        const sectionOptions = option.options
          .map(opt => normalizeOption(opt))
          .filter(opt => optionMatchesQuery(opt, searchQuery));
        result.push(...orderSelectedFirst(sectionOptions));
      } else if (isOptionData(option)) {
        const normalized = normalizeOption(option);
        if (optionMatchesQuery(normalized, searchQuery)) {
          pendingFlat.push(normalized);
        }
      }
    }
    flushFlat();

    if (hasSelectAll) {
      return [{value: SELECT_ALL_VALUE, label: selectAllLabel}, ...result];
    }
    return result;
  }, [searchQuery, options, selectedAtOpen, hasSelectAll, selectAllLabel]);

  // Layer for dropdown positioning
  const handleLayerHide = useCallback(() => {
    setSearchQuery('');
    setSelectedAtOpen(null);
    // Clear any lingering result count when the popover closes so stale status
    // text does not linger in the a11y tree.
    announce('');
    triggerRef.current?.focus();
  }, [announce]);

  const popover = usePopover({
    hasLightDismiss: true,
    onHide: handleLayerHide,
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

  // Announce the filtered result count from the query-change handler (matching
  // BaseTypeahead) rather than a reactive effect: computing the count for the
  // next query here fires the announcement exactly once per keystroke and does
  // not re-speak on unrelated re-renders. Reuses the announce instance shared
  // with the selection-count announcements above.
  const handleSearchChange = useCallback(
    (nextQuery: string) => {
      setSearchQuery(nextQuery);
      if (nextQuery.length === 0) {
        // Emptying the query clears the region rather than announcing a count.
        announce('');
        return;
      }
      const count = filterOptionsByQuery(selectableItems, nextQuery).length;
      announce(
        count === 0
          ? 'No results found'
          : `${count} result${count === 1 ? '' : 's'}`,
      );
    },
    [announce, selectableItems],
  );

  // Handle toggle
  // Clear all selected values. Shared by the clear button and the keyboard
  // Delete/Backspace path so clearing is reachable without a mouse.
  const clearValues = useCallback(() => {
    onChange([]);
    announceSelection([]);
    if (changeAction) {
      startTransition(async () => {
        setOptimisticValue([]);
        await changeAction([]);
      });
    }
  }, [
    onChange,
    changeAction,
    startTransition,
    setOptimisticValue,
    announceSelection,
  ]);

  // Whether there is at least one selected value (clearing is meaningful).
  const hasValue = optimisticValue.length > 0;

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Don't open dropdown
      clearValues();
    },
    [clearValues],
  );

  const handleToggle = useCallback(
    (itemValue: string) => {
      const newValue = optimisticValue.includes(itemValue)
        ? optimisticValue.filter(v => v !== itemValue)
        : [...optimisticValue, itemValue];

      onChange(newValue);
      announceSelection(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [
      optimisticValue,
      onChange,
      changeAction,
      startTransition,
      setOptimisticValue,
      announceSelection,
    ],
  );

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
    announceSelection(newValue);
    if (changeAction) {
      startTransition(async () => {
        setOptimisticValue(newValue);
        await changeAction(newValue);
      });
    }
  }, [
    allEnabledSelected,
    enabledItems,
    optimisticValue,
    onChange,
    changeAction,
    startTransition,
    setOptimisticValue,
    announceSelection,
  ]);

  // Route toggle: select-all sentinel → handleSelectAll, everything else → handleToggle
  const handleNavigableToggle = useCallback(
    (itemValue: string) => {
      if (itemValue === SELECT_ALL_VALUE) {
        handleSelectAll();
      } else {
        handleToggle(itemValue);
      }
    },
    [handleSelectAll, handleToggle],
  );

  // Multi-select combobox behavior — index-based, matching useCombobox pattern.
  // sortedItems is the single source of truth for item order.
  const {
    highlightedIndex,
    getItemId,
    onTriggerClick,
    onKeyDown,
    onItemMouseEnter,
  } = useMultiCombobox({
    selectableItems: sortedItems,
    isDisabled,
    isOpen: popover.isOpen,
    hasSearch,
    onOpen: useCallback(() => {
      // Snapshot which items are selected at open time — sort is frozen until close
      setSelectedAtOpen(new Set(optimisticValue));

      popover.show();
      if (hasSearch) {
        // Focus search after popover opens
        requestAnimationFrame(() => {
          searchRef.current?.focus();
        });
      }
    }, [popover, hasSearch, optimisticValue]),
    onClose: popover.hide,
    onToggle: handleNavigableToggle,
    onClear: hasClear ? clearValues : undefined,
    hasValue,
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
              <Badge key={label} label={label} variant="neutral" />
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
    if (!hasSearch) {
      return null;
    }
    return (
      <div
        {...stylex.props(styles.searchWrapper)}
        onKeyDown={e => {
          // The clear (✕) button lives inside the TextInput, after the input in
          // DOM order. When it is focused and the user tabs forward there is
          // nothing else in the popup, so dismiss it (Shift+Tab returns to the
          // input natively). Key events originating on the input are handled on
          // the input below; ignore them here so we don't double-dismiss.
          if (e.target === searchRef.current) {
            return;
          }
          if (e.key === 'Tab' && !e.shiftKey) {
            onKeyDown(e);
          }
        }}>
        <TextInput
          ref={searchRef}
          id={searchId}
          // The search field IS a TextInput: the leading magnifier is its
          // `startIcon` and the trailing clear (✕) is its built-in `hasClear`
          // (which resets the value and refocuses the input). We add no bespoke
          // affordance chrome — the field just looks and behaves like every
          // other Astryx input.
          label={t('@astryx.multiSelector.searchOptions')}
          isLabelHidden
          startIcon="search"
          hasClear
          size="sm"
          // Fill the dropdown's width (minus the wrapper's inline padding) so
          // the field is flush end-to-end rather than sized to its content.
          width="100%"
          // When hasSearch is set, focus moves into this input on open, so it —
          // not the trigger — must be the combobox reporting the highlighted
          // option via aria-activedescendant (comboboxes-4). role + aria-* pass
          // through to the underlying <input> via BaseProps.
          role="combobox"
          aria-expanded={popover.isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            popover.isOpen && highlightedIndex >= 0
              ? getItemId(highlightedIndex)
              : undefined
          }
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={e => {
            // Arrow keys navigate options; Enter toggles; Escape closes.
            // Space and Home/End are left to the input (type a space / move
            // the caret) per the APG editable combobox; PageUp/PageDown are
            // the sanctioned substitute for jumping to the first/last option.
            if (
              e.key === 'ArrowDown' ||
              e.key === 'ArrowUp' ||
              e.key === 'PageUp' ||
              e.key === 'PageDown' ||
              e.key === 'Enter' ||
              e.key === 'Escape'
            ) {
              onKeyDown(e);
              return;
            }
            // Tab: when a query is showing the clear (✕) button, forward-tab
            // moves focus to it (keeping the popup open) so the affordance is
            // keyboard-reachable. Every other Tab dismisses the popup as usual.
            if (e.key === 'Tab' && (e.shiftKey || !hasQuery)) {
              onKeyDown(e);
            }
          }}
          placeholder={searchPlaceholder}
        />
      </div>
    );
  }, [
    hasSearch,
    searchId,
    listboxId,
    searchQuery,
    hasQuery,
    searchPlaceholder,
    handleSearchChange,
    onKeyDown,
    popover.isOpen,
    highlightedIndex,
    getItemId,
    t,
  ]);

  // Render an individual item (index-based)
  const renderItem = useCallback(
    (item: MultiSelectorOptionData, flatIndex: number) => {
      const isHighlighted = flatIndex === highlightedIndex;
      const isSelectAll = item.value === SELECT_ALL_VALUE;
      const isSelected = isSelectAll
        ? allEnabledSelected
        : optimisticValue.includes(item.value);
      const checkboxValue = isSelectAll ? selectAllState : isSelected;
      // aria-selected="mixed" is invalid on role="option", and the tri-state
      // checkbox is inert/decorative, so the indeterminate state must be
      // conveyed through the option's accessible name (WCAG 4.1.2).
      const isPartiallySelected =
        isSelectAll && selectAllState === 'indeterminate';

      return (
        <div
          key={item.value}
          id={getItemId(flatIndex)}
          role="option"
          aria-selected={isSelected}
          aria-label={
            isPartiallySelected
              ? t('@astryx.multiSelector.selectAllPartiallySelected', {
                  label: selectAllLabel,
                })
              : undefined
          }
          aria-disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              handleNavigableToggle(item.value);
            }
          }}
          onMouseEnter={() => onItemMouseEnter(item, flatIndex)}
          {...stylex.props(
            styles.item,
            isSelectAll ? selectAllSizeStyles[size] : itemSizeStyles[size],
            isSelectAll && styles.selectAllWrapper,
            isHighlighted && styles.itemHighlighted,
            item.disabled && styles.itemDisabled,
          )}>
          <div inert {...stylex.props(styles.checkboxDecorative)}>
            <CheckboxInput
              label=""
              isLabelHidden
              value={checkboxValue}
              onChange={() => {}}
              isDisabled={item.disabled}
              size={size === 'lg' ? 'md' : size}
            />
          </div>
          {renderOption && !isSelectAll ? (
            renderOption(item)
          ) : (
            <span
              {...stylex.props(
                styles.itemLabel,
                item.disabled && styles.itemLabelDisabled,
              )}>
              {item.label ?? item.value}
            </span>
          )}
        </div>
      );
    },
    [
      renderOption,
      highlightedIndex,
      optimisticValue,
      allEnabledSelected,
      selectAllState,
      selectAllLabel,
      getItemId,
      handleNavigableToggle,
      onItemMouseEnter,
      size,
      t,
    ],
  );

  // Render all options. Uses sortedItems as the single source of truth for
  // item order — no independent sorting here. Structural elements (dividers,
  // section headers) come from the original options prop.
  const renderOptions = useCallback(() => {
    const elements: ReactNode[] = [];
    let cursor = 0;

    // Number of real items (excluding the select-all sentinel)
    const realItemCount = hasSelectAll
      ? sortedItems.length - 1
      : sortedItems.length;

    // Show select-all only when there are real items to select
    if (hasSelectAll && realItemCount > 0) {
      elements.push(renderItem(sortedItems[0], 0));
      elements.push(
        <Divider key="select-all-divider" xstyle={styles.divider} />,
      );
      cursor = 1;
    } else if (hasSelectAll) {
      // Skip the select-all sentinel when there are no real items
      cursor = 1;
    }

    // Empty state — no real items to show. role="presentation" keeps the
    // message out of the listbox's accessibility tree (role="listbox" only
    // permits option/group children); the no-results outcome is announced
    // via the result-count live region instead.
    if (realItemCount === 0) {
      elements.push(
        <div
          key="empty"
          role="presentation"
          {...stylex.props(styles.emptyState)}>
          No results found
        </div>,
      );
      return elements;
    }

    // Consume items from sortedItems in order, interleaving structural elements
    // (dividers, section headers) from the options prop. While searching, only
    // matching items are present in sortedItems, so a section consumes just its
    // matches and is skipped entirely when none match — no header left standing
    // over nothing, and the cursor stays aligned with the combobox indices.
    const isSearching = Boolean(searchQuery);
    let pendingCount = 0;

    const flushPending = () => {
      for (let j = 0; j < pendingCount; j++) {
        elements.push(renderItem(sortedItems[cursor], cursor));
        cursor++;
      }
      pendingCount = 0;
    };

    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (isDivider(option)) {
        flushPending();
        // A standalone divider between groups would orphan itself once its
        // neighbors are filtered out, so skip it while searching.
        if (!isSearching) {
          elements.push(
            <Divider key={`divider-${i}`} xstyle={styles.divider} />,
          );
        }
      } else if (isSection(option)) {
        flushPending();
        const matchCount = isSearching
          ? option.options.filter(opt =>
              optionMatchesQuery(normalizeOption(opt), searchQuery),
            ).length
          : option.options.length;
        if (matchCount === 0) {
          continue;
        }
        const sectionItems: ReactNode[] = [];
        for (let j = 0; j < matchCount; j++) {
          sectionItems.push(renderItem(sortedItems[cursor], cursor));
          cursor++;
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
        if (
          !isSearching ||
          optionMatchesQuery(normalizeOption(option), searchQuery)
        ) {
          pendingCount++;
        }
      }
    }
    flushPending();

    return elements;
  }, [options, renderItem, sortedItems, searchQuery, hasSelectAll]);

  // The detached message box renders its own leading status icon, so the
  // on-field icon would duplicate it — keep the chevron indicator instead.
  const showStatusIcon =
    status != null && effectiveStatusVariant !== 'detached';
  const showStatusTooltip =
    status != null && effectiveStatusVariant === 'tooltip' && !!status.message;

  const multiSelectorContent = (
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
          themeProps('multi-selector', {
            variant,
            size,
            status: status?.type ?? null,
          }),
          stylex.props(
            inputWrapperStyles.base,
            styles.triggerContainer,
            sizeStyles[size],
            variant === 'ghost' && styles.triggerGhost,
            isDisabled && inputWrapperStyles.disabled,
            variant === 'ghost' && isDisabled && styles.triggerGhostDisabled,
            optimisticValue.length === 0 && styles.triggerPlaceholder,
            variant !== 'ghost' &&
              status &&
              inputStatusBorderStyles[status.type],
            variant !== 'ghost' &&
              status &&
              !isDisabled &&
              inputStatusHoverShadowStyles[status.type],
            variant !== 'ghost' && inputGroup && groupStyles.inGroup,
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
          // still blocked by the isDisabled guards in useMultiCombobox.
          disabled={isDisabled && !showsDisabledMessage}
          aria-disabled={showsDisabledMessage ? 'true' : undefined}
          onKeyDown={onKeyDown}
          tabIndex={isDisabled && !showsDisabledMessage ? -1 : 0}
          {...stylex.props(styles.trigger)}>
          <span {...stylex.props(styles.triggerContent)}>
            {renderTriggerContent()}
          </span>
        </button>
        {htmlName != null &&
          value.map(v => (
            <input
              key={v}
              type="hidden"
              name={htmlName}
              value={v}
              // Disabled native controls are excluded from form submission;
              // mirror that for the hidden carriers.
              disabled={isDisabled}
            />
          ))}
        {isBusy && <Spinner size="sm" />}
        {hasClear && value.length > 0 && !isDisabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('@astryx.multiSelector.clearAll', {label})}
            {...stylex.props(styles.clearButton)}>
            <Icon
              icon="close"
              size="sm"
              color="secondary"
              // Stable theme target on the clear glyph itself, so a theme can
              // restyle just this icon (color, size, hover) via `defineTheme`.
              // Same-element rules in @layer astryx-theme win over the icon's
              // own base color/size, which a button-level target could not
              // reach.
              {...themeProps('multi-selector-clear-icon')}
            />
          </button>
        )}
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
              // Stable theme target on the chevron glyph itself, so a theme can
              // restyle just this icon (color, size, hover) — and its
              // open/closed state — via `defineTheme`. Same-element rules in
              // @layer astryx-theme win over the icon's own base color/size,
              // which a button-level target could not reach.
              {...themeProps('multi-selector-indicator-icon', {
                state: popover.isOpen ? 'expanded' : 'collapsed',
              })}
            />
          )}
        </span>
      </div>

      {popover.render(
        <div {...stylex.props(styles.dropdown)}>
          {renderSearch()}
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

      {showStatusTooltip && statusTooltip.renderTooltip(status?.message ?? '')}

      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </>
  );

  if (inputGroup) {
    return multiSelectorContent;
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
      statusVariant={effectiveStatusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {multiSelectorContent}
    </Field>
  );
}

MultiSelector.displayName = 'MultiSelector';
