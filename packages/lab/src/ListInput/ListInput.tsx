// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListInput.tsx
 * @input Uses React, StyleX, core Field/FieldStatus/Button/IconButton/Icon/
 *   VisuallyHidden, core theme tokens, useListInputReorder
 * @output Exports ListInput component and its prop/column/change/context types
 * @position Lab implementation (RFC facebook/astryx#4531); consumed by
 *   packages/lab/src/index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/ListInput/ListInput.doc.mjs (props table, features)
 * - /packages/lab/src/ListInput/ListInput.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/ListInput/useListInputReorder.ts (handle wiring)
 * - /packages/lab/src/ListInput/index.ts (exports if types change)
 * - /apps/storybook/stories/ListInput.stories.tsx (examples)
 */

import {Fragment, useCallback, useEffect, useId, useRef} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {Button} from '@astryxdesign/core/Button';
import {Field, FieldStatus} from '@astryxdesign/core/Field';
import type {InputStatus} from '@astryxdesign/core/Field';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {
  colorVars,
  fontWeightVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {themeProps} from '@astryxdesign/core/utils';
import {useListInputReorder} from './useListInputReorder';

const styles = stylex.create({
  scroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerCell: {
    textAlign: 'start',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    whiteSpace: 'nowrap',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  controlHeaderCell: {
    width: '1px',
  },
  cell: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    verticalAlign: 'top',
  },
  controlCell: {
    width: '1px',
    whiteSpace: 'nowrap',
    verticalAlign: 'top',
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
  },
  readOnlyCell: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
  },
  draggingRow: {
    opacity: 0.6,
  },
  statusCell: {
    paddingBlock: 0,
    paddingInline: spacingVars['--spacing-2'],
  },
  handle: {
    touchAction: 'none',
    cursor: 'grab',
  },
  addRow: {
    paddingBlock: spacingVars['--spacing-1'],
  },
});

const colStyles = stylex.create({
  width: (width: number | string) => ({width}),
});

/**
 * Context passed to a column's `renderValue` when the list is read-only.
 */
export interface ListInputValueContext<T> {
  /** The record this cell displays. */
  item: T;
  /** The record's current position in the collection (0-based). */
  index: number;
}

/**
 * Context passed to a column's `renderInput` for an editable cell.
 *
 * Destructure the named members and spread the rest onto the rendered input:
 * everything not named here is a prop every Astryx input accepts (currently
 * `isDisabled`).
 */
export interface ListInputRenderContext<T> {
  /** The record this cell edits. */
  item: T;
  /** The record's current position in the collection (0-based). */
  index: number;
  /** Replace this record in the collection (immutably). */
  updateItem: (next: T) => void;
  /**
   * Accessible label for the cell's input, combining the column header and
   * item position (e.g. "Email, guest 2"). Pass to the input's `label` with
   * `isLabelHidden`.
   */
  label: string;
  /** Field-scope validation status for this cell, from `getFieldStatus`. */
  status: InputStatus | undefined;
  /** Whether the input must render disabled (list disabled or loading). */
  isDisabled: boolean;
}

/**
 * A column of the repeated-record editor.
 */
export interface ListInputColumn<T> {
  /** Stable identifier for the column; reported in update changes. */
  key: string;
  /** Visible column header text; also part of every cell's input label. */
  header: string;
  /**
   * Column width. Numbers are pixels; strings are used as-is (e.g. '40%').
   * Unsized columns share the remaining space.
   */
  width?: number | string;
  /** Render the cell's editable control. */
  renderInput: (context: ListInputRenderContext<T>) => ReactNode;
  /**
   * Render the cell's read-only value (used when `isReadOnly`). Without it,
   * the read-only fallback shows `String(item[key])` for primitive values.
   */
  renderValue?: (context: ListInputValueContext<T>) => ReactNode;
}

/**
 * Discriminated description of a collection change, passed to `onChange`
 * alongside the next collection value.
 */
export type ListInputChange<T> =
  | {type: 'add'; item: T; key: React.Key; index: number}
  | {type: 'update'; item: T; key: React.Key; index: number; columnKey: string}
  | {type: 'remove'; item: T; key: React.Key; index: number}
  | {
      type: 'reorder';
      item: T;
      key: React.Key;
      fromIndex: number;
      toIndex: number;
    };

export interface ListInputProps<T> extends Omit<
  BaseProps<HTMLDivElement>,
  'children' | 'onChange'
> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Label for the collection (always rendered for accessibility). */
  label: string;
  /** The collection being edited. Controlled; ListInput never mutates it. */
  value: T[];
  /** Called with the next collection and a description of what changed. */
  onChange: (next: T[], change: ListInputChange<T>) => void;
  /** Stable key for a record; keeps DOM, focus, and errors with their item. */
  getItemKey: (item: T) => React.Key;
  /** Create the record appended by the Add action. */
  createItem: () => T;
  /** Column configuration; one entry per field of the record. */
  columns: Array<ListInputColumn<T>>;
  /**
   * Noun for one record (e.g. "guest"); used in control labels such as
   * "Add guest" and "Remove guest 2".
   * @default 'item'
   */
  itemName?: string;
  /** Description text displayed between the label and the rows. */
  description?: string;
  /** List-scope validation status, rendered after the rows and Add action. */
  status?: InputStatus;
  /** Item-scope validation status for a record (full-row message). */
  getItemStatus?: (item: T, index: number) => InputStatus | undefined;
  /** Field-scope validation status for one cell of a record. */
  getFieldStatus?: (
    item: T,
    columnKey: string,
    index: number,
  ) => InputStatus | undefined;
  /**
   * Allow reordering records via drag handle (pointer, touch, and keyboard).
   * @default false
   */
  isReorderable?: boolean;
  /**
   * Display values without any editing affordances.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Disable every control in the collection.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Mark the collection busy and disable every control while data loads.
   * @default false
   */
  isLoading?: boolean;
  /** Physical row limit; the Add action is disabled at the limit. */
  maxItems?: number;
}

/** Read-only fallback for columns without `renderValue`. */
function readOnlyFallback<T>(item: T, columnKey: string): ReactNode {
  const raw = (item as Record<string, unknown>)[columnKey];
  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    return String(raw);
  }
  return null;
}

/**
 * A compact editor for a short, ordered collection of consistent records
 * (guest lists, tag options, emergency contacts). Renders a semantic table
 * of per-field inputs with add, remove, and accessible reorder interactions,
 * and three independent validation scopes (field, item, list).
 *
 * Experimental (lab): see RFC facebook/astryx#4531.
 *
 * @example
 * ```
 * <ListInput
 *   label="Guests"
 *   itemName="guest"
 *   value={guests}
 *   onChange={setGuests}
 *   getItemKey={guest => guest.id}
 *   createItem={() => ({id: crypto.randomUUID(), name: ''})}
 *   columns={[
 *     {
 *       key: 'name',
 *       header: 'Name',
 *       renderInput: ({item, updateItem, label, status, ...state}) => (
 *         <TextInput
 *           label={label}
 *           isLabelHidden
 *           value={item.name}
 *           onChange={name => updateItem({...item, name})}
 *           status={status}
 *           {...state}
 *         />
 *       ),
 *     },
 *   ]}
 * />
 * ```
 */
export function ListInput<T>({
  label,
  value,
  onChange,
  getItemKey,
  createItem,
  columns,
  itemName = 'item',
  description,
  status,
  getItemStatus,
  getFieldStatus,
  isReorderable = false,
  isReadOnly = false,
  isDisabled = false,
  isLoading = false,
  maxItems,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ListInputProps<T>): ReactNode {
  const baseID = useId();
  const labelID = `${baseID}-label`;
  const descriptionID = description ? `${baseID}-description` : undefined;
  const listStatusID = status?.message ? `${baseID}-status` : undefined;

  const controlsDisabled = isDisabled || isLoading;
  const showControls = !isReadOnly;
  const showHandles = isReorderable && showControls;

  const rowElementsRef = useRef(new Map<React.Key, HTMLTableRowElement>());
  const addWrapperRef = useRef<HTMLDivElement | null>(null);
  const getRowElement = useCallback(
    (key: React.Key) => rowElementsRef.current.get(key) ?? null,
    [],
  );

  const {displayedItems, grabbedKey, getHandleProps} = useListInputReorder({
    value,
    getItemKey,
    itemName,
    isEnabled: showHandles && !controlsDisabled,
    getRowElement,
    onCommit: onChange,
  });

  // ─── Add / remove focus policy ─────────────────────────────────────────
  // Focus intents are recorded when the change is dispatched and applied on
  // the render where the controlled value reflects it (RFC: after Add, focus
  // the new row's first control; after Remove, the equivalent next action).
  const pendingFocusRef = useRef<
    | {kind: 'add'; expectedLength: number}
    | {kind: 'remove'; index: number}
    | null
  >(null);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }
    previousValueRef.current = value;
    const pending = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (!pending) {
      return;
    }
    if (pending.kind === 'add') {
      if (value.length !== pending.expectedLength) {
        return;
      }
      const lastKey = getItemKey(value[value.length - 1]);
      rowElementsRef.current
        .get(lastKey)
        ?.querySelector<HTMLElement>(
          '[data-listinput-cell] input, [data-listinput-cell] select, ' +
            '[data-listinput-cell] textarea, [data-listinput-cell] button, ' +
            '[data-listinput-cell] [tabindex]',
        )
        ?.focus();
      return;
    }
    if (value.length === 0) {
      addWrapperRef.current?.querySelector('button')?.focus();
      return;
    }
    const focusIndex = Math.min(pending.index, value.length - 1);
    const focusKey = getItemKey(value[focusIndex]);
    rowElementsRef.current
      .get(focusKey)
      ?.querySelector<HTMLButtonElement>('button[data-listinput-remove]')
      ?.focus();
  }, [value, getItemKey]);

  // ─── Collection changes ────────────────────────────────────────────────

  const handleAdd = () => {
    const item = createItem();
    pendingFocusRef.current = {kind: 'add', expectedLength: value.length + 1};
    onChange([...value, item], {
      type: 'add',
      item,
      key: getItemKey(item),
      index: value.length,
    });
  };

  const handleRemove = (key: React.Key) => {
    const index = value.findIndex(item => getItemKey(item) === key);
    if (index === -1) {
      return;
    }
    const next = value.slice();
    const [item] = next.splice(index, 1);
    pendingFocusRef.current = {kind: 'remove', index};
    onChange(next, {type: 'remove', item, key, index});
  };

  const handleUpdate = (key: React.Key, columnKey: string, nextItem: T) => {
    const index = value.findIndex(item => getItemKey(item) === key);
    if (index === -1) {
      return;
    }
    const next = value.map((existing, i) =>
      i === index ? nextItem : existing,
    );
    onChange(next, {type: 'update', item: nextItem, key, index, columnKey});
  };

  // ─── Render ────────────────────────────────────────────────────────────

  const columnCount =
    columns.length + (showHandles ? 1 : 0) + (showControls ? 1 : 0);
  const hasColumnWidths = columns.some(column => column.width != null);
  const addDisabled =
    controlsDisabled || (maxItems != null && value.length >= maxItems);
  const tableDescribedBy =
    [descriptionID, listStatusID].filter(Boolean).join(' ') || undefined;

  return (
    <Field
      ref={ref}
      label={label}
      inputID={baseID}
      labelID={labelID}
      isGroupLabel
      description={description}
      descriptionID={descriptionID}
      isDisabled={isDisabled}
      status={
        status?.message != null ? {...status, messageID: listStatusID} : status
      }
      statusVariant="detached"
      xstyle={xstyle}
      className={className}
      style={style}
      {...props}>
      <div {...themeProps('list-input')} {...stylex.props(styles.scroll)}>
        <table
          aria-labelledby={labelID}
          aria-describedby={tableDescribedBy}
          aria-busy={isLoading || undefined}
          {...stylex.props(styles.table)}>
          {hasColumnWidths && (
            <colgroup>
              {showHandles && <col />}
              {columns.map(column => (
                <col
                  key={column.key}
                  {...stylex.props(
                    column.width != null && colStyles.width(column.width),
                  )}
                />
              ))}
              {showControls && <col />}
            </colgroup>
          )}
          <thead>
            <tr>
              {showHandles && (
                <th
                  scope="col"
                  {...stylex.props(
                    styles.headerCell,
                    styles.controlHeaderCell,
                  )}>
                  <VisuallyHidden>Reorder</VisuallyHidden>
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  scope="col"
                  {...stylex.props(styles.headerCell)}>
                  {column.header}
                </th>
              ))}
              {showControls && (
                <th
                  scope="col"
                  {...stylex.props(
                    styles.headerCell,
                    styles.controlHeaderCell,
                  )}>
                  <VisuallyHidden>Remove</VisuallyHidden>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((item, index) => {
              const key = getItemKey(item);
              const position = `${itemName} ${index + 1}`;
              const itemStatus = getItemStatus?.(item, index);
              // Index-based id: item keys are arbitrary strings and could
              // break the id/aria-describedby token syntax. The row and its
              // message re-render together, so a positional id stays paired.
              const itemStatusID =
                itemStatus?.message != null
                  ? `${baseID}-item-${index}-status`
                  : undefined;
              return (
                <Fragment key={String(key)}>
                  <tr
                    ref={element => {
                      if (element) {
                        rowElementsRef.current.set(key, element);
                      } else {
                        rowElementsRef.current.delete(key);
                      }
                    }}
                    aria-describedby={itemStatusID}
                    {...stylex.props(grabbedKey === key && styles.draggingRow)}>
                    {showHandles && (
                      <td {...stylex.props(styles.controlCell)}>
                        <IconButton
                          icon={
                            <Icon
                              icon="arrowsUpDown"
                              size="sm"
                              color="inherit"
                            />
                          }
                          label={`Reorder ${position}`}
                          variant="ghost"
                          size="sm"
                          type="button"
                          isDisabled={controlsDisabled}
                          xstyle={styles.handle}
                          {...{'data-listinput-handle': true}}
                          {...getHandleProps(key)}
                        />
                      </td>
                    )}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        data-listinput-cell
                        {...stylex.props(
                          styles.cell,
                          isReadOnly && styles.readOnlyCell,
                        )}>
                        {isReadOnly
                          ? column.renderValue
                            ? column.renderValue({item, index})
                            : readOnlyFallback(item, column.key)
                          : column.renderInput({
                              item,
                              index,
                              updateItem: nextItem =>
                                handleUpdate(key, column.key, nextItem),
                              label: `${column.header}, ${position}`,
                              status: getFieldStatus?.(item, column.key, index),
                              isDisabled: controlsDisabled,
                            })}
                      </td>
                    ))}
                    {showControls && (
                      <td {...stylex.props(styles.controlCell)}>
                        <IconButton
                          icon={<Icon icon="close" size="sm" color="inherit" />}
                          label={`Remove ${position}`}
                          variant="ghost"
                          size="sm"
                          type="button"
                          isDisabled={controlsDisabled}
                          {...{'data-listinput-remove': true}}
                          onClick={() => handleRemove(key)}
                        />
                      </td>
                    )}
                  </tr>
                  {itemStatus?.message != null && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        {...stylex.props(styles.statusCell)}>
                        <FieldStatus
                          type={itemStatus.type}
                          message={itemStatus.message}
                          id={itemStatusID}
                          variant="detached"
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {showControls && (
        <div ref={addWrapperRef} {...stylex.props(styles.addRow)}>
          <Button
            label={`Add ${itemName}`}
            variant="secondary"
            size="sm"
            type="button"
            isDisabled={addDisabled}
            onClick={handleAdd}
          />
        </div>
      )}
    </Field>
  );
}

ListInput.displayName = 'ListInput';
