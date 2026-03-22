'use client';

/**
 * @file XDSPowerSearch.tsx
 * @input PowerSearchConfig, filters, onChange
 * @output Structured filter bar with token-based filter management
 * @position Main component; composed from XDSTokenizer + edit popover
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 * - /packages/core/src/PowerSearch/XDSPowerSearch.doc.mjs
 */


import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSTokenizer, type XDSTokenizerHandle} from '../Tokenizer';
import {XDSTypeaheadItem} from '../Typeahead/XDSTypeaheadItem';
import {XDSToken} from '../Token';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import type {XDSIconName} from '../Icon/globalIconRegistry';
import type {XDSInputStatus} from '../Field';
import {useXDSLayer} from '../Layer';
import {
  spacingVars,
  colorVars,
  lineHeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useInternalConfig} from './useInternalConfig';
import {usePowerSearchSource} from './usePowerSearchSource';
import {formatFilterValue} from './formatFilterValue';
import {PowerSearchEditPopover} from './PowerSearchEditPopover';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
  PartialFilter,
  PowerSearchItem,
  PowerSearchAuxData,
  PowerSearchChangeType,
  XDSPowerSearchHandle,
  FilterValue,
  OperatorValue,
  EnumItem,
} from './types';

// =============================================================================
// Icon mapping for typeahead entries
// =============================================================================

const OPERATOR_VALUE_TYPE_TO_ICON: Record<string, XDSIconName> = {
  string: 'search',
  string_list: 'search',
  integer: 'search',
  float: 'search',
  date_absolute: 'calendar',
  date_range: 'calendar',
  date_relative: 'calendar',
  time: 'clock',
  enum: 'menu',
  enum_list: 'menu',
  entity_list: 'search',
  custom: 'search',
  empty: 'search',
  nested: 'search',
};

// =============================================================================
// Token value rendering
// =============================================================================

const tokenValueStyles = stylex.create({
  value: {
    fontWeight: 'bold',
  },
});

const popoverLayerStyles = stylex.create({
  layer: {
    width: 'anchor-size(width)',
    minWidth: 400,
    marginTop: spacingVars['--spacing-1'],
  },
});

const resultCountStyles = stylex.create({
  text: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
  },
});

function truncateString(value: string, limit: number): string {
  return value.length > limit + 3 ? value.slice(0, limit) + '...' : value;
}

function getEnumLabel(values: ReadonlyArray<EnumItem>, value: string): string {
  return values.find(v => v.value === value)?.label ?? value;
}

function PowerSearchTokenValue({
  operatorValue,
  filterValue,
  maxLength,
}: {
  operatorValue: OperatorValue;
  filterValue: FilterValue;
  maxLength: number;
}) {
  switch (filterValue.type) {
    case 'empty':
      return null;

    case 'string':
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {truncateString(filterValue.value, maxLength)}
        </span>
      );

    case 'integer':
    case 'float':
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {filterValue.value}
        </span>
      );

    case 'enum':
      if (operatorValue.type === 'enum') {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {truncateString(
              getEnumLabel(operatorValue.values, filterValue.value),
              maxLength,
            )}
          </span>
        );
      }
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {truncateString(filterValue.value, maxLength)}
        </span>
      );

    case 'string_list': {
      const items = filterValue.value;
      if (items.length === 0) return null;
      if (items.length === 1) {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {truncateString(items[0], maxLength)}
          </span>
        );
      }
      const totalLength = items.reduce((sum, s) => sum + s.length, 0);
      if (totalLength > maxLength) {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {items.length} items
          </span>
        );
      }
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {items.join(', ')}
        </span>
      );
    }

    case 'enum_list': {
      const items = filterValue.value;
      if (items.length === 0) return null;
      if (operatorValue.type === 'enum_list') {
        const labels = items.map(v => getEnumLabel(operatorValue.values, v));
        if (labels.length === 1) {
          return (
            <span {...stylex.props(tokenValueStyles.value)}>
              {truncateString(labels[0], maxLength)}
            </span>
          );
        }
        const totalLength = labels.reduce((sum, s) => sum + s.length, 0);
        if (totalLength > maxLength) {
          return (
            <span {...stylex.props(tokenValueStyles.value)}>
              {labels.length} items
            </span>
          );
        }
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {labels.join(', ')}
          </span>
        );
      }
      if (items.length === 1) {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {truncateString(items[0], maxLength)}
          </span>
        );
      }
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {items.length} items
        </span>
      );
    }

    case 'entity_list': {
      const entities = filterValue.value;
      if (entities.length === 0) return null;
      if (entities.length === 1) {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {truncateString(entities[0].label, maxLength)}
          </span>
        );
      }
      const totalLength = entities.reduce((sum, e) => sum + e.label.length, 0);
      if (totalLength > maxLength) {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {entities.length} items
          </span>
        );
      }
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {entities.map(e => e.label).join(', ')}
        </span>
      );
    }

    case 'time':
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {filterValue.value}
        </span>
      );

    case 'date_absolute': {
      const date = new Date(filterValue.unixSeconds * 1000);
      const formatted = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {truncateString(formatted, maxLength)}
        </span>
      );
    }

    case 'date_relative':
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {truncateString(filterValue.value, maxLength)}
        </span>
      );

    case 'date_range':
      return <span {...stylex.props(tokenValueStyles.value)}>date range</span>;

    case 'custom':
      if (operatorValue.type === 'custom') {
        return (
          <span {...stylex.props(tokenValueStyles.value)}>
            {truncateString(
              operatorValue.getString(filterValue.value),
              maxLength,
            )}
          </span>
        );
      }
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {filterValue.value}
        </span>
      );

    case 'nested': {
      const count = filterValue.value.length;
      return (
        <span {...stylex.props(tokenValueStyles.value)}>
          {count === 1 ? '1 filter' : `${count} filters`}
        </span>
      );
    }

    default:
      return null;
  }
}

// =============================================================================
// Types
// =============================================================================

export interface XDSPowerSearchProps {
  /** PowerSearch configuration defining available fields and operators. */
  config: PowerSearchConfig;
  /** Currently active filters. */
  filters: ReadonlyArray<PowerSearchFilter>;
  /** Called when filters change. */
  onChange: (
    filters: ReadonlyArray<PowerSearchFilter>,
    changeType: PowerSearchChangeType,
    index: number,
  ) => void;
  /** Accessible label. @default 'Search' */
  label?: string;
  /** Visually hide the label. @default true */
  isLabelHidden?: boolean;
  /** Placeholder text. @default 'Search...' */
  placeholder?: string;
  /** Auto-focus on mount. @default false */
  hasAutoFocus?: boolean;
  /** Show clear button. @default true */
  hasClear?: boolean;
  /** Whether the input is read-only. @default false */
  isReadOnly?: boolean;
  /** Whether the input is disabled. @default false */
  isDisabled?: boolean;
  /**
   * Icon to display at the start of the input.
   * Pass an SVG icon component (e.g. from heroicons, lucide, etc.).
   */
  startIcon?: XDSIconType;
  /** Focus callback. */
  onFocus?: () => void;
  /** Blur callback. */
  onBlur?: () => void;
  /** Validation status. */
  status?: XDSInputStatus;
  /** Max width for dropdown menu. */
  menuWidth?: number;
  /** Max display length for filter token values. @default 40 */
  maxTokenLength?: number;
  /** Max items in operator dropdown. */
  maxOperatorMenuItems?: number;
  /** Label for the save button in edit popover. @default 'Apply' */
  popoverSaveButtonLabel?: string;
  /** Timezone ID for date formatting. */
  timezoneID?: string;
  /**
   * Content to display at the end of the input row.
   * Useful for action buttons or other controls.
   */
  endContent?: React.ReactNode;
  /**
   * Number of results matching the current filters.
   * When a number, formatted as "N results". When a string, displayed as-is.
   */
  resultCount?: number | string;
  /** Imperative handle ref. */
  ref?: React.Ref<XDSPowerSearchHandle>;
  /** Test ID. */
  'data-testid'?: string;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   */
  xstyle?: StyleXStyles;
  /** CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// =============================================================================
// State
// =============================================================================

type PopoverState =
  | {type: 'idle'}
  | {
      type: 'adding';
      partialFilter: PartialFilter;
    }
  | {
      type: 'editing';
      filterIndex: number;
      partialFilter: PartialFilter;
    };

// =============================================================================
// Component
// =============================================================================

/**
 * Structured filter bar where each token represents a filter (field + operator + value).
 *
 * Users select a field from a typeahead dropdown, then configure the operator
 * and value in an edit popover. Filters appear as tokens that can be clicked
 * to edit or removed individually.
 *
 * @example
 * ```
 * const config = {
 *   name: 'MySearch',
 *   fields: [
 *     {
 *       key: 'status',
 *       label: 'Status',
 *       operators: [
 *         {
 *           key: 'is',
 *           label: 'is',
 *           value: {
 *             type: 'enum',
 *             values: [
 *               { value: 'open', label: 'Open' },
 *               { value: 'closed', label: 'Closed' },
 *             ],
 *           },
 *         },
 *       ],
 *     },
 *   ],
 * };
 * const [filters, setFilters] = useState([]);
 * <XDSPowerSearch
 *   config={config}
 *   filters={filters}
 *   onChange={(newFilters) => setFilters(newFilters)}
 * />
 * ```
 */
export function XDSPowerSearch({
  config: configProp,
  filters,
  onChange,
  label = 'Search',
  isLabelHidden = true,
  placeholder = 'Search...',
  hasAutoFocus = false,
  hasClear = true,
  isReadOnly = false,
  isDisabled = false,
  startIcon,
  onFocus,
  onBlur,
  status,
  maxTokenLength = 40,
  popoverSaveButtonLabel = 'Apply',
  timezoneID,
  endContent,
  resultCount,
  ref,
  'data-testid': testId,
  xstyle,
  className,
  style,
}: XDSPowerSearchProps) {
  const config = useInternalConfig(configProp);
  const searchSource = usePowerSearchSource(config);
  const tokenizerRef = useRef<XDSTokenizerHandle>(null);

  const [popoverState, setPopoverStateRaw] = useState<PopoverState>({
    type: 'idle',
  });

  // Layer for positioning the edit popover anchored to the tokenizer
  const handleLayerHide = useCallback(() => {
    setPopoverStateRaw({type: 'idle'});
  }, []);

  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
    onHide: handleLayerHide,
  });

  // Wrapper that manages layer visibility and tokenizer focus alongside state
  const setPopoverState = useCallback(
    (state: PopoverState) => {
      setPopoverStateRaw(state);
      if (state.type !== 'idle') {
        // Schedule after the current frame so React can render the popover
        // content and the typeahead's synchronous focus() has completed
        requestAnimationFrame(() => {
          layer.show();
          tokenizerRef.current?.blur();
        });
      } else {
        layer.hide();
        tokenizerRef.current?.focus();
      }
    },
    [layer],
  );

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    focusTypeahead() {
      tokenizerRef.current?.focus();
    },
    blurTypeahead() {
      tokenizerRef.current?.blur();
    },
  }));

  // Convert filters to tokenizer items
  const tokenizerValue: PowerSearchItem[] = useMemo(() => {
    return filters.map((filter, index) => {
      const field = config.getField(filter.field);
      const operator = config.getOperator(filter.field, filter.operator);
      const operatorLabel = operator?.label ? `: ${operator.label}` : '';
      const valueStr = operator
        ? formatFilterValue(
            config,
            operator.value,
            filter.value,
            maxTokenLength,
            timezoneID,
          )
        : '';

      const displayLabel = valueStr
        ? `${field?.label ?? filter.field}${operatorLabel} ${valueStr}`
        : `${field?.label ?? filter.field}${operatorLabel}`;

      return {
        id: `filter-${index}-${filter.field}-${filter.operator}`,
        label: displayLabel,
        auxiliaryData: {
          fieldKey: filter.field,
          operatorKey: filter.operator,
          filterValue: filter.value,
          filterIndex: index,
        },
      };
    });
  }, [filters, config, maxTokenLength, timezoneID]);

  // Handle tokenizer onChange (field selected from typeahead)
  const handleTokenizerChange = useCallback(
    (
      _items: PowerSearchItem[],
      change: {item?: PowerSearchItem; type: string},
    ) => {
      if (change.type === 'add' && change.item) {
        const auxData = change.item.auxiliaryData as PowerSearchAuxData;
        if (!auxData) return;

        const field = config.getField(auxData.fieldKey);
        if (!field) return;

        const operator = auxData.operatorKey
          ? config.getOperator(auxData.fieldKey, auxData.operatorKey)
          : config.getDefaultOperator(auxData.fieldKey);

        // For "empty" type operators, add the filter immediately
        if (operator?.value.type === 'empty') {
          const newFilter: PowerSearchFilter = {
            field: auxData.fieldKey,
            operator: operator.key,
            value: {type: 'empty'},
          };
          onChange([...filters, newFilter], 'add', filters.length);
          return;
        }

        // Open the edit popover for the new filter
        setPopoverState({
          type: 'adding',
          partialFilter: {
            field: auxData.fieldKey,
            operator: operator?.key,
            value: undefined,
          },
        });
      } else if (change.type === 'remove' && change.item) {
        const auxData = change.item.auxiliaryData as PowerSearchAuxData;
        if (auxData?.filterIndex != null) {
          const newFilters = filters.filter(
            (_, i) => i !== auxData.filterIndex,
          );
          onChange(newFilters, 'remove', auxData.filterIndex);
        }
      }
    },
    [config, filters, onChange],
  );

  // Handle clicking a token to edit
  const handleTokenClick = useCallback(
    (index: number) => {
      if (isReadOnly || isDisabled) return;

      const filter = filters[index];
      if (filter.isReadOnly) return;

      setPopoverState({
        type: 'editing',
        filterIndex: index,
        partialFilter: {
          field: filter.field,
          operator: filter.operator,
          value: filter.value,
        },
      });
    },
    [filters, isReadOnly, isDisabled],
  );

  // Handle popover save
  const handlePopoverSave = useCallback(
    (savedFilter: PowerSearchFilter | null) => {
      if (popoverState.type === 'adding') {
        if (savedFilter) {
          onChange([...filters, savedFilter], 'add', filters.length);
        }
      } else if (popoverState.type === 'editing') {
        if (savedFilter) {
          const newFilters = [...filters];
          newFilters[popoverState.filterIndex] = savedFilter;
          onChange(newFilters, 'edit', popoverState.filterIndex);
        } else {
          // Delete
          const newFilters = filters.filter(
            (_, i) => i !== popoverState.filterIndex,
          );
          onChange(newFilters, 'remove', popoverState.filterIndex);
        }
      }
      setPopoverState({type: 'idle'});
    },
    [popoverState, filters, onChange, setPopoverState],
  );

  // Handle popover cancel
  const handlePopoverCancel = useCallback(() => {
    setPopoverState({type: 'idle'});
  }, [setPopoverState]);

  // Custom token renderer
  const renderToken = useCallback(
    (item: PowerSearchItem, onRemove: () => void) => {
      const auxData = item.auxiliaryData as PowerSearchAuxData | undefined;
      const filterIndex = auxData?.filterIndex ?? -1;
      const filter = filterIndex >= 0 ? filters[filterIndex] : undefined;

      const field = auxData ? config.getField(auxData.fieldKey) : undefined;
      const operator = auxData?.operatorKey
        ? config.getOperator(auxData.fieldKey, auxData.operatorKey)
        : undefined;

      const fieldLabel = field?.label ?? '';
      const operatorLabel = operator?.label ?? '';

      // Build the token label: "Field operator" (space-separated, like reference)
      const tokenLabel = `${fieldLabel} ${operatorLabel}`.trim();

      // Adjust maxTokenLength by subtracting label length (min 10, like reference)
      const adjustedMaxLength = Math.max(
        maxTokenLength - fieldLabel.length - operatorLabel.length,
        10,
      );

      // Render value as rich content with bold styling
      const valueContent =
        operator && filter ? (
          <PowerSearchTokenValue
            operatorValue={operator.value}
            filterValue={filter.value}
            maxLength={adjustedMaxLength}
          />
        ) : undefined;

      return (
        <XDSToken
          label={tokenLabel}
          endContent={valueContent}
          onClick={
            !isReadOnly && !isDisabled && !filter?.isReadOnly
              ? (e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleTokenClick(filterIndex);
                }
              : undefined
          }
          onRemove={
            !isReadOnly && !isDisabled && !filter?.isReadOnly
              ? onRemove
              : undefined
          }
          isDisabled={isDisabled}
        />
      );
    },
    [filters, config, maxTokenLength, isReadOnly, isDisabled, handleTokenClick],
  );

  // Custom typeahead item renderer — adds field icon and description
  const renderItem = useCallback(
    (item: PowerSearchItem) => {
      const auxData = item.auxiliaryData as PowerSearchAuxData | undefined;
      if (!auxData) return <XDSTypeaheadItem item={item} />;

      const field = config.getField(auxData.fieldKey);
      let icon: React.ReactNode = null;

      if (field?.icon) {
        icon = field.icon;
      } else if (field) {
        const operator = auxData.operatorKey
          ? config.getOperator(auxData.fieldKey, auxData.operatorKey)
          : config.getDefaultOperator(auxData.fieldKey);
        const iconName =
          OPERATOR_VALUE_TYPE_TO_ICON[operator?.value.type ?? ''] ?? 'search';
        icon = <XDSIcon icon={iconName} size="sm" color="secondary" />;
      }

      return (
        <XDSTypeaheadItem
          item={item}
          icon={icon}
          description={field?.description}
        />
      );
    },
    [config],
  );

  // The partial filter for the popover
  const popoverPartialFilter =
    popoverState.type !== 'idle' ? popoverState.partialFilter : null;

  // Build combined endContent from resultCount + endContent props
  const combinedEndContent = useMemo(() => {
    let resultCountNode: React.ReactNode = null;
    if (resultCount != null) {
      if (typeof resultCount === 'number') {
        const formatted = new Intl.NumberFormat().format(resultCount);
        resultCountNode = (
          <span {...stylex.props(resultCountStyles.text)}>
            {formatted} {resultCount === 1 ? 'result' : 'results'}
          </span>
        );
      } else {
        resultCountNode = (
          <span {...stylex.props(resultCountStyles.text)}>{resultCount}</span>
        );
      }
    }

    if (resultCountNode && endContent) {
      return (
        <>
          {resultCountNode}
          {endContent}
        </>
      );
    }
    return resultCountNode || endContent || undefined;
  }, [resultCount, endContent]);

  return (
    <>
      <div ref={layer.ref}>
        <XDSTokenizer
          ref={tokenizerRef}
          label={label}
          isLabelHidden={isLabelHidden}
          searchSource={searchSource}
          value={tokenizerValue}
          onChange={handleTokenizerChange}
          renderToken={renderToken}
          renderItem={renderItem}
          placeholder={filters.length === 0 ? placeholder : ''}
          hasAutoFocus={hasAutoFocus}
          hasClear={hasClear && !isReadOnly}
          startIcon={startIcon}
          endContent={combinedEndContent}
          isDisabled={isDisabled}
          hasEntriesOnFocus
          debounceMs={0}
          status={status}
          xstyle={xstyle}
          className={className}
          style={style}
          data-testid={testId}
        />
      </div>
      {layer.render(
        popoverPartialFilter ? (
          <PowerSearchEditPopover
            config={config}
            filter={popoverPartialFilter}
            mode={popoverState.type === 'editing' ? 'edit' : 'create'}
            onSave={handlePopoverSave}
            onCancel={handlePopoverCancel}
            saveButtonLabel={popoverSaveButtonLabel}
            isReadOnly={isReadOnly}
          />
        ) : null,
        {
          placement: 'below',
          alignment: 'start',
          xstyle: popoverLayerStyles.layer,
        },
      )}
    </>
  );
}

XDSPowerSearch.displayName = 'XDSPowerSearch';
