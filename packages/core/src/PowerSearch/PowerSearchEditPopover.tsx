'use client';

/**
 * @file PowerSearchEditPopover.tsx
 * @input InternalConfig, PartialFilter
 * @output Edit popover content with field/operator selectors and value editor
 * @position Sub-component; consumed by XDSPowerSearch
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {XDSSelector} from '../Selector';
import {XDSHStack, XDSVStack} from '../Stack';
import {XDSIcon} from '../Icon';
import {XDSTreeList, type XDSTreeListItemData} from '../TreeList';
import {
  spacingVars,
  colorVars,
  radiusVars,
  shadowVars,
  typeScaleVars,
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
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: shadowVars['--shadow-low'],
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
  nestedRootLabel: {
    fontSize: typeScaleVars['--text-label-size'],
  },
  nestedFieldSelector: {
    flexShrink: 0,
    width: 200,
  },
  nestedOperatorSelector: {
    flexShrink: 0,
    width: 180,
  },
  nestedRow: {
    width: '100%',
  },
  nestedRowValueEditor: {
    flexGrow: 2,
    flexShrink: 1,
    minWidth: 0,
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
// Editable filter state for recursive nesting
// =============================================================================

interface EditablePartialFilter {
  field: string;
  operator?: string;
  value?: FilterValue;
  _subFilters?: EditablePartialFilter[];
}

function initEditableFilter(
  config: InternalConfig,
  filter: PowerSearchFilter,
): EditablePartialFilter {
  const op = config.getOperator(filter.field, filter.operator);
  if (op?.value.type === 'nested' && filter.value?.type === 'nested') {
    return {
      field: filter.field,
      operator: filter.operator,
      value: filter.value,
      _subFilters: filter.value.value.map(f => initEditableFilter(config, f)),
    };
  }
  return {
    field: filter.field,
    operator: filter.operator,
    value: filter.value,
  };
}

function isEditableFilterComplete(
  config: InternalConfig,
  ef: EditablePartialFilter,
): boolean {
  if (!ef.field || !ef.operator) return false;
  const op = config.getOperator(ef.field, ef.operator);
  if (op?.value.type === 'nested') {
    const subs = ef._subFilters ?? [];
    return (
      subs.length > 0 && subs.every(s => isEditableFilterComplete(config, s))
    );
  }
  return ef.value != null;
}

function editableToCompleteFilter(
  config: InternalConfig,
  ef: EditablePartialFilter,
): PowerSearchFilter {
  const op = config.getOperator(ef.field, ef.operator!);
  if (op?.value.type === 'nested') {
    return {
      field: ef.field,
      operator: ef.operator!,
      value: {
        type: 'nested',
        value: (ef._subFilters ?? []).map(s =>
          editableToCompleteFilter(config, s),
        ),
      },
    };
  }
  return {
    field: ef.field,
    operator: ef.operator!,
    value: ef.value!,
  };
}

function updateAtPath(
  filters: EditablePartialFilter[],
  path: number[],
  updater: (filter: EditablePartialFilter) => EditablePartialFilter,
): EditablePartialFilter[] {
  const [idx, ...rest] = path;
  const next = [...filters];
  if (rest.length === 0) {
    next[idx] = updater(next[idx]);
  } else {
    const sf = next[idx];
    next[idx] = {
      ...sf,
      _subFilters: updateAtPath(sf._subFilters ?? [], rest, updater),
    };
  }
  return next;
}

function removeAtPath(
  filters: EditablePartialFilter[],
  path: number[],
): EditablePartialFilter[] {
  const [idx, ...rest] = path;
  if (rest.length === 0) {
    return filters.filter((_, i) => i !== idx);
  }
  const next = [...filters];
  const sf = next[idx];
  next[idx] = {
    ...sf,
    _subFilters: removeAtPath(sf._subFilters ?? [], rest),
  };
  return next;
}

function addAtPath(
  filters: EditablePartialFilter[],
  parentPath: number[],
  newFilter: EditablePartialFilter,
): EditablePartialFilter[] {
  if (parentPath.length === 0) {
    return [...filters, newFilter];
  }
  const [idx, ...rest] = parentPath;
  const next = [...filters];
  const sf = next[idx];
  next[idx] = {
    ...sf,
    _subFilters: addAtPath(sf._subFilters ?? [], rest, newFilter),
  };
  return next;
}

// =============================================================================
// Nested sub-filter row
// =============================================================================

interface NestedSubFilterRowProps {
  config: InternalConfig;
  subFilter: EditablePartialFilter;
  onChange: (subFilter: EditablePartialFilter) => void;
  isReadOnly: boolean;
}

function NestedSubFilterRow({
  config,
  subFilter,
  onChange,
  isReadOnly,
}: NestedSubFilterRowProps) {
  const fieldOptions = useMemo(
    () =>
      config.getVisibleFields().map(field => ({
        value: field.key,
        label: field.label,
      })),
    [config],
  );

  const operatorOptions = useMemo(() => {
    const operators = config.getVisibleOperators(subFilter.field);
    return operators.map(op => ({
      value: op.key,
      label: op.label,
    }));
  }, [config, subFilter.field]);

  const currentOperator = subFilter.operator
    ? config.getOperator(subFilter.field, subFilter.operator)
    : undefined;

  const operatorValue: OperatorValue | undefined = currentOperator?.value;
  const isEmptyType = operatorValue?.type === 'empty';
  const isNestedType = operatorValue?.type === 'nested';

  const handleFieldChange = useCallback(
    (fieldKey: string) => {
      const defaultOp = config.getDefaultOperator(fieldKey);
      const newOp = defaultOp
        ? config.getOperator(fieldKey, defaultOp.key)
        : undefined;
      onChange({
        field: fieldKey,
        operator: defaultOp?.key,
        value: undefined,
        _subFilters: newOp?.value.type === 'nested' ? [] : undefined,
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
        _subFilters:
          newOp?.value.type === 'nested'
            ? (subFilter._subFilters ?? [])
            : undefined,
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
      <div {...stylex.props(styles.nestedFieldSelector)}>
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
        <div {...stylex.props(styles.nestedOperatorSelector)}>
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
      {operatorValue && !isEmptyType && !isNestedType && (
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
  const [subFilters, setSubFilters] = useState<EditablePartialFilter[]>(() => {
    if (partialFilter.value && partialFilter.value.type === 'nested') {
      return partialFilter.value.value.map(f => initEditableFilter(config, f));
    }
    return [];
  });

  const syncToParent = useCallback(
    (newSubFilters: EditablePartialFilter[]) => {
      if (
        newSubFilters.length > 0 &&
        newSubFilters.every(sf => isEditableFilterComplete(config, sf))
      ) {
        onPartialFilterChange({
          ...partialFilter,
          value: {
            type: 'nested',
            value: newSubFilters.map(sf =>
              editableToCompleteFilter(config, sf),
            ),
          },
        });
      } else {
        onPartialFilterChange({
          ...partialFilter,
          value: undefined,
        });
      }
    },
    [config, partialFilter, onPartialFilterChange],
  );

  const handleUpdate = useCallback(
    (path: number[], updated: EditablePartialFilter) => {
      setSubFilters(prev => {
        const next = updateAtPath(prev, path, () => updated);
        syncToParent(next);
        return next;
      });
    },
    [syncToParent],
  );

  const handleRemove = useCallback(
    (path: number[]) => {
      setSubFilters(prev => {
        const next = removeAtPath(prev, path);
        syncToParent(next);
        return next;
      });
    },
    [syncToParent],
  );

  const handleAdd = useCallback(
    (parentPath: number[]) => {
      const fields = config.getVisibleFields();
      const defaultField = fields[0];
      if (!defaultField) return;

      const defaultOp = config.getDefaultOperator(defaultField.key);
      const op = defaultOp
        ? config.getOperator(defaultField.key, defaultOp.key)
        : undefined;

      const newSubFilter: EditablePartialFilter = {
        field: defaultField.key,
        operator: defaultOp?.key,
        value: undefined,
        _subFilters: op?.value.type === 'nested' ? [] : undefined,
      };

      setSubFilters(prev => {
        const next = addAtPath(prev, parentPath, newSubFilter);
        syncToParent(next);
        return next;
      });
    },
    [config, syncToParent],
  );

  function buildTreeItems(
    filters: EditablePartialFilter[],
    parentPath: number[],
  ): XDSTreeListItemData[] {
    const items: XDSTreeListItemData[] = filters.map((sf, idx) => {
      const itemPath = [...parentPath, idx];
      const op = sf.operator
        ? config.getOperator(sf.field, sf.operator)
        : undefined;
      const isNested = op?.value.type === 'nested';

      if (isNested) {
        const children = buildTreeItems(sf._subFilters ?? [], itemPath);

        if (!isReadOnly) {
          children.push({
            id: `${itemPath.join('-')}-add`,
            label: (
              <XDSButton
                label="+ Add filter"
                onClick={() => handleAdd(itemPath)}
                variant="ghost"
                size="sm"
              />
            ),
          });
        }

        return {
          id: `filter-${itemPath.join('-')}`,
          label: (
            <NestedSubFilterRow
              config={config}
              subFilter={sf}
              onChange={updated => handleUpdate(itemPath, updated)}
              isReadOnly={isReadOnly}
            />
          ),
          isExpanded: true,
          children,
          endContent: !isReadOnly ? (
            <XDSButton
              label="Remove filter"
              icon={<XDSIcon icon="close" size="sm" />}
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(itemPath)}
            />
          ) : undefined,
        };
      }

      return {
        id: `filter-${itemPath.join('-')}`,
        isExpanded: true,
        label: (
          <NestedSubFilterRow
            config={config}
            subFilter={sf}
            onChange={updated => handleUpdate(itemPath, updated)}
            isReadOnly={isReadOnly}
          />
        ),
        endContent: !isReadOnly ? (
          <XDSButton
            label="Remove filter"
            icon={<XDSIcon icon="close" size="sm" />}
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(itemPath)}
          />
        ) : undefined,
      };
    });

    return items;
  }

  const treeChildren = buildTreeItems(subFilters, []);

  if (!isReadOnly) {
    treeChildren.push({
      id: 'add-filter',
      label: (
        <XDSButton
          label="+ Add filter"
          onClick={() => handleAdd([])}
          variant="ghost"
          size="sm"
        />
      ),
    });
  }

  const rootLabel = (
    <div {...stylex.props(styles.nestedRootLabel)}>
      {operatorOptions.length > 1 ? (
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
      ) : (
        (operatorOptions[0]?.label ?? 'Group')
      )}
    </div>
  );

  const items: XDSTreeListItemData[] = [
    {
      id: 'nested-root',
      label: rootLabel,
      isExpanded: true,
      children: treeChildren,
    },
  ];

  return <XDSTreeList items={items} density="balanced" />;
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
  const valueEditorRef = useRef<HTMLDivElement>(null);

  // Reset state when filter changes (new popover opened)
  React.useEffect(() => {
    setPartialFilter(initialFilter);
  }, [initialFilter]);

  // Focus the first focusable element inside the value editor after mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = valueEditorRef.current;
      if (!container) return;
      const focusable = container.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });
    return () => cancelAnimationFrame(frame);
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

  // Handle Enter to save, Escape to cancel
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isSaveDisabled) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        onCancel();
      }
    },
    [isSaveDisabled, handleSave, onCancel],
  );

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
      <div {...stylex.props(styles.container)} onKeyDown={handleKeyDown}>
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
    <div {...stylex.props(styles.container)} onKeyDown={handleKeyDown}>
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
            <div ref={valueEditorRef} {...stylex.props(styles.valueEditor)}>
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
