/**
 * @file PowerSearchEditPopover.tsx
 * @input InternalConfig, PartialFilter
 * @output Edit popover content with field/operator selectors and value editor
 * @position Sub-component; consumed by XDSPowerSearch
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

'use client';

import React, {useState, useCallback, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {XDSSelector} from '../Selector';
import {XDSHStack, XDSVStack} from '../Stack';
import {XDSIcon} from '../Icon';
import {
  spacingVars,
  colorVars,
  radiusVars,
  elevationVars,
} from '../theme/tokens.stylex';
import {PowerSearchValueEditor} from './PowerSearchValueEditor';
import type {InternalConfig} from './useInternalConfig';
import type {
  PowerSearchFilter,
  PartialFilter,
  FilterValue,
  OperatorValue,
} from './types';

const styles = stylex.create({
  container: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: elevationVars['--elevation-menu'],
    overflow: 'hidden',
  },
  content: {
    padding: spacingVars['--spacing-4'],
  },
  footer: {
    padding: spacingVars['--spacing-3'],
    paddingTop: 0,
  },
  fieldSelector: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  operatorSelector: {
    flexGrow: 1,
    flexShrink: 0,
  },
  valueEditor: {
    flexGrow: 2,
    minWidth: 0,
  },
  // Nested editor styles
  nestedRow: {
    width: '100%',
  },
  nestedRowValueEditor: {
    flexGrow: 2,
    flexShrink: 1,
    minWidth: 0,
  },
  removeButton: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-rounded'],
    color: colorVars['--color-text-secondary'],
    flexShrink: 0,
    opacity: {
      default: 0.6,
      ':hover': {
        '@media (hover: hover)': 1,
      },
    },
  },
});

export interface PowerSearchEditPopoverProps {
  config: InternalConfig;
  /** The filter being edited/created. */
  filter: PartialFilter;
  /** 'create' for new filters, 'edit' for existing. */
  mode: 'create' | 'edit';
  /** Called when save is clicked with a complete filter, or null to delete. */
  onSave: (filter: PowerSearchFilter | null) => void;
  /** Called when the popover is closed without saving. */
  onCancel: () => void;
  /** Label for the save button. @default 'Apply' */
  saveButtonLabel?: string;
  /** Whether the filter is read-only. */
  isReadOnly?: boolean;
}

// =============================================================================
// Nested sub-filter row
// =============================================================================

interface NestedSubFilterRowProps {
  config: InternalConfig;
  subFilter: PartialFilter;
  onChange: (subFilter: PartialFilter) => void;
  onRemove: () => void;
  isReadOnly: boolean;
}

function NestedSubFilterRow({
  config,
  subFilter,
  onChange,
  onRemove,
  isReadOnly,
}: NestedSubFilterRowProps) {
  // Exclude nested fields from sub-filter field options to avoid infinite nesting
  const fieldOptions = useMemo(
    () =>
      config
        .getVisibleFields()
        .filter(field => {
          const ops = config.getVisibleOperators(field.key);
          return !ops.every(op => op.value.type === 'nested');
        })
        .map(field => ({
          value: field.key,
          label: field.label,
        })),
    [config],
  );

  const operatorOptions = useMemo(() => {
    const operators = config.getVisibleOperators(subFilter.field);
    return operators
      .filter(op => op.value.type !== 'nested')
      .map(op => ({
        value: op.key,
        label: op.label,
      }));
  }, [config, subFilter.field]);

  const currentOperator = subFilter.operator
    ? config.getOperator(subFilter.field, subFilter.operator)
    : undefined;

  const operatorValue: OperatorValue | undefined = currentOperator?.value;
  const isEmptyType = operatorValue?.type === 'empty';

  const handleFieldChange = useCallback(
    (fieldKey: string) => {
      const defaultOp = config.getDefaultOperator(fieldKey);
      onChange({
        field: fieldKey,
        operator: defaultOp?.key,
        value: undefined,
      });
    },
    [config, onChange],
  );

  const handleOperatorChange = useCallback(
    (operatorKey: string) => {
      const newOp = config.getOperator(subFilter.field, operatorKey);
      const oldOp = currentOperator;
      const keepValue = newOp && oldOp && newOp.value.type === oldOp.value.type;
      onChange({
        ...subFilter,
        operator: operatorKey,
        value: keepValue ? subFilter.value : undefined,
      });
    },
    [config, subFilter, currentOperator, onChange],
  );

  const handleValueChange = useCallback(
    (value: FilterValue) => {
      onChange({...subFilter, value});
    },
    [subFilter, onChange],
  );

  return (
    <XDSHStack gap={2} vAlign="center">
      <div {...stylex.props(styles.fieldSelector)}>
        <XDSSelector
          label="Field"
          isLabelHidden
          options={fieldOptions}
          value={subFilter.field}
          onChange={handleFieldChange}
          isDisabled={isReadOnly}
          size="md"
        />
      </div>
      {operatorOptions.length > 0 && (
        <div {...stylex.props(styles.operatorSelector)}>
          <XDSSelector
            label="Operator"
            isLabelHidden
            options={operatorOptions}
            value={subFilter.operator}
            onChange={handleOperatorChange}
            isDisabled={isReadOnly}
            size="md"
          />
        </div>
      )}
      {operatorValue && !isEmptyType && (
        <div {...stylex.props(styles.nestedRowValueEditor)}>
          <PowerSearchValueEditor
            operatorValue={operatorValue}
            filterValue={subFilter.value}
            onChange={handleValueChange}
            config={config}
            isDisabled={isReadOnly}
          />
        </div>
      )}
      {!isReadOnly && (
        <button
          type="button"
          aria-label="Remove filter"
          onClick={onRemove}
          {...stylex.props(styles.removeButton)}>
          <XDSIcon icon="close" size="sm" />
        </button>
      )}
    </XDSHStack>
  );
}

// =============================================================================
// Nested editor
// =============================================================================

interface NestedEditorProps {
  config: InternalConfig;
  partialFilter: PartialFilter;
  operatorOptions: Array<{value: string; label: string}>;
  onOperatorChange: (operatorKey: string) => void;
  onPartialFilterChange: (filter: PartialFilter) => void;
  isReadOnly: boolean;
}

function NestedEditor({
  config,
  partialFilter,
  operatorOptions,
  onOperatorChange,
  onPartialFilterChange,
  isReadOnly,
}: NestedEditorProps) {
  // Local state for sub-filters — preserved even when some are incomplete
  const [subFilters, setSubFilters] = useState<PartialFilter[]>(() => {
    if (partialFilter.value && partialFilter.value.type === 'nested') {
      return partialFilter.value.value.map(f => ({
        field: f.field,
        operator: f.operator,
        value: f.value,
      }));
    }
    return [];
  });

  const syncToParent = useCallback(
    (newSubFilters: PartialFilter[]) => {
      // Build complete filters from all valid sub-filters
      const completeFilters: PowerSearchFilter[] = [];
      for (const sf of newSubFilters) {
        if (sf.field && sf.operator && sf.value) {
          completeFilters.push({
            field: sf.field,
            operator: sf.operator,
            value: sf.value,
          });
        }
      }

      // Only update parent value if all sub-filters are complete and there's at least one
      if (
        completeFilters.length === newSubFilters.length &&
        completeFilters.length > 0
      ) {
        onPartialFilterChange({
          ...partialFilter,
          value: {type: 'nested', value: completeFilters},
        });
      } else {
        onPartialFilterChange({
          ...partialFilter,
          value: undefined,
        });
      }
    },
    [partialFilter, onPartialFilterChange],
  );

  const handleSubFilterChange = useCallback(
    (index: number, updated: PartialFilter) => {
      setSubFilters(prev => {
        const next = [...prev];
        next[index] = updated;
        syncToParent(next);
        return next;
      });
    },
    [syncToParent],
  );

  const handleSubFilterRemove = useCallback(
    (index: number) => {
      setSubFilters(prev => {
        const next = prev.filter((_, i) => i !== index);
        syncToParent(next);
        return next;
      });
    },
    [syncToParent],
  );

  const handleAddSubFilter = useCallback(() => {
    // Pick the first non-nested field as default
    const nonNestedFields = config.getVisibleFields().filter(field => {
      const ops = config.getVisibleOperators(field.key);
      return !ops.every(op => op.value.type === 'nested');
    });
    const defaultField = nonNestedFields[0];
    if (!defaultField) return;

    const defaultOp = config.getDefaultOperator(defaultField.key);
    const newSubFilter: PartialFilter = {
      field: defaultField.key,
      operator: defaultOp?.key,
      value: undefined,
    };

    setSubFilters(prev => {
      const next = [...prev, newSubFilter];
      syncToParent(next);
      return next;
    });
  }, [config, syncToParent]);

  return (
    <XDSVStack gap={2}>
      {operatorOptions.length > 1 && (
        <div {...stylex.props(styles.operatorSelector)}>
          <XDSSelector
            label="Group operator"
            isLabelHidden
            options={operatorOptions}
            value={partialFilter.operator}
            onChange={onOperatorChange}
            isDisabled={isReadOnly}
            size="md"
          />
        </div>
      )}
      {subFilters.map((subFilter, idx) => (
        <NestedSubFilterRow
          key={idx}
          config={config}
          subFilter={subFilter}
          onChange={updated => handleSubFilterChange(idx, updated)}
          onRemove={() => handleSubFilterRemove(idx)}
          isReadOnly={isReadOnly}
        />
      ))}
      {!isReadOnly && (
        <XDSButton
          label="+ Add filter"
          onClick={handleAddSubFilter}
          variant="ghost"
          size="sm"
        />
      )}
    </XDSVStack>
  );
}

// =============================================================================
// Main popover
// =============================================================================

export function PowerSearchEditPopover({
  config,
  filter: initialFilter,
  mode,
  onSave,
  onCancel,
  saveButtonLabel = 'Apply',
  isReadOnly = false,
}: PowerSearchEditPopoverProps) {
  const [partialFilter, setPartialFilter] =
    useState<PartialFilter>(initialFilter);

  // Reset state when filter changes (new popover opened)
  React.useEffect(() => {
    setPartialFilter(initialFilter);
  }, [initialFilter]);

  const currentOperator = partialFilter.operator
    ? config.getOperator(partialFilter.field, partialFilter.operator)
    : undefined;

  // Build field options for the selector
  const fieldOptions = useMemo(
    () =>
      config.getVisibleFields().map(field => ({
        value: field.key,
        label: field.label,
      })),
    [config],
  );

  // Build operator options for the current field
  const operatorOptions = useMemo(() => {
    const operators = config.getVisibleOperators(partialFilter.field);
    return operators.map(op => ({
      value: op.key,
      label: op.label,
    }));
  }, [config, partialFilter.field]);

  const handleFieldChange = useCallback(
    (fieldKey: string) => {
      const defaultOp = config.getDefaultOperator(fieldKey);
      setPartialFilter({
        field: fieldKey,
        operator: defaultOp?.key,
        value: undefined,
      });
    },
    [config],
  );

  const handleOperatorChange = useCallback(
    (operatorKey: string) => {
      const newOp = config.getOperator(partialFilter.field, operatorKey);
      const oldOp = currentOperator;
      const keepValue = newOp && oldOp && newOp.value.type === oldOp.value.type;

      setPartialFilter(prev => ({
        ...prev,
        operator: operatorKey,
        value: keepValue ? prev.value : undefined,
      }));
    },
    [config, partialFilter.field, currentOperator],
  );

  const handleValueChange = useCallback(
    (value: FilterValue, shouldSave?: boolean) => {
      setPartialFilter(prev => {
        const updated = {...prev, value};
        if (shouldSave && updated.field && updated.operator && updated.value) {
          onSave({
            field: updated.field,
            operator: updated.operator,
            value: updated.value,
          });
        }
        return updated;
      });
    },
    [onSave],
  );

  const handleSave = useCallback(() => {
    if (partialFilter.field && partialFilter.operator && partialFilter.value) {
      onSave({
        field: partialFilter.field,
        operator: partialFilter.operator,
        value: partialFilter.value,
      });
    }
  }, [partialFilter, onSave]);

  const handleDelete = useCallback(() => {
    onSave(null);
  }, [onSave]);

  const isSaveDisabled = !partialFilter.operator || !partialFilter.value;

  const operatorValue: OperatorValue | undefined = currentOperator?.value;
  const isEmptyType = operatorValue?.type === 'empty';
  const isNestedType = operatorValue?.type === 'nested';

  // For empty type, auto-save on mount
  React.useEffect(() => {
    if (isEmptyType && partialFilter.field && partialFilter.operator) {
      onSave({
        field: partialFilter.field,
        operator: partialFilter.operator,
        value: {type: 'empty'},
      });
    }
  }, [isEmptyType, partialFilter.field, partialFilter.operator, onSave]);

  const showOperatorSelector = operatorOptions.length > 1 || !isEmptyType;

  // Nested filter editing
  if (isNestedType) {
    return (
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.content)}>
          <XDSVStack gap={2}>
            <XDSHStack gap={2}>
              <div {...stylex.props(styles.fieldSelector)}>
                <XDSSelector
                  label="Field"
                  isLabelHidden
                  options={fieldOptions}
                  value={partialFilter.field}
                  onChange={handleFieldChange}
                  isDisabled={isReadOnly}
                  size="md"
                />
              </div>
            </XDSHStack>
            <NestedEditor
              config={config}
              partialFilter={partialFilter}
              operatorOptions={operatorOptions}
              onOperatorChange={handleOperatorChange}
              onPartialFilterChange={setPartialFilter}
              isReadOnly={isReadOnly}
            />
          </XDSVStack>
        </div>
        <div {...stylex.props(styles.footer)}>
          <XDSHStack gap={2} hAlign="between">
            {!isReadOnly && mode === 'edit' ? (
              <XDSButton
                label="Delete"
                onClick={handleDelete}
                variant="ghost"
                size="sm"
              />
            ) : (
              <div />
            )}
            <XDSHStack gap={2}>
              <XDSButton
                label="Cancel"
                onClick={onCancel}
                variant="ghost"
                size="sm"
              />
              <XDSButton
                label={saveButtonLabel}
                onClick={handleSave}
                variant="primary"
                size="sm"
                isDisabled={isSaveDisabled}
              />
            </XDSHStack>
          </XDSHStack>
        </div>
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.content)}>
        <XDSHStack gap={2}>
          <div {...stylex.props(styles.fieldSelector)}>
            <XDSSelector
              label="Field"
              isLabelHidden
              options={fieldOptions}
              value={partialFilter.field}
              onChange={handleFieldChange}
              isDisabled={isReadOnly}
              size="md"
            />
          </div>
          {showOperatorSelector && operatorOptions.length > 0 && (
            <div {...stylex.props(styles.operatorSelector)}>
              <XDSSelector
                label="Operator"
                isLabelHidden
                options={operatorOptions}
                value={partialFilter.operator}
                onChange={handleOperatorChange}
                isDisabled={isReadOnly}
                size="md"
              />
            </div>
          )}
          {operatorValue && !isEmptyType && (
            <div {...stylex.props(styles.valueEditor)}>
              <PowerSearchValueEditor
                operatorValue={operatorValue}
                filterValue={partialFilter.value}
                onChange={handleValueChange}
                onEnter={handleSave}
                config={config}
                isDisabled={isReadOnly}
              />
            </div>
          )}
        </XDSHStack>
      </div>
      {!isEmptyType && (
        <div {...stylex.props(styles.footer)}>
          <XDSHStack gap={2} hAlign="between">
            {!isReadOnly && mode === 'edit' ? (
              <XDSButton
                label="Delete"
                onClick={handleDelete}
                variant="ghost"
                size="sm"
              />
            ) : (
              <div />
            )}
            <XDSHStack gap={2}>
              <XDSButton
                label="Cancel"
                onClick={onCancel}
                variant="ghost"
                size="sm"
              />
              <XDSButton
                label={saveButtonLabel}
                onClick={handleSave}
                variant="primary"
                size="sm"
                isDisabled={isSaveDisabled}
              />
            </XDSHStack>
          </XDSHStack>
        </div>
      )}
    </div>
  );
}
