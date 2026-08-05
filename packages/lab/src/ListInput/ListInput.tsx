// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListInput.tsx
 * @input React, StyleX, Astryx field/list/button/icon/tooltip/empty-state primitives, tokens, and shared Lab reorder styles
 * @output Exports ListInput and its controlled data, column, renderer, and change types
 * @position Lab experiment (RFC facebook/astryx#4531) for editing compact repeated records
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/ListInput/ListInput.doc.mjs
 * - /packages/lab/src/ListInput/ListInput.test.tsx
 * - /packages/lab/src/ListInput/index.ts
 * - /apps/storybook/stories/ListInput.stories.tsx
 */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Key,
  type ReactNode,
  type SVGProps,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {createPortal, flushSync} from 'react-dom';
import type {BaseProps} from '@astryxdesign/core';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field, type InputStatus} from '@astryxdesign/core/Field';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import type {ColumnWidth} from '@astryxdesign/core/Table';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {
  colorVars,
  fontWeightVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {reorderStyles} from '../reorderStyles';

export type ListInputChange<T> =
  | {type: 'add'; item: T; index: number}
  | {
      type: 'update';
      item: T;
      previousItem: T;
      index: number;
      columnKey?: string;
    }
  | {type: 'remove'; item: T; index: number}
  | {type: 'reorder'; item: T; fromIndex: number; toIndex: number};

export interface ListInputValueContext<T> {
  /** Current record. */
  item: T;
  /** Current visual position. */
  index: number;
  /** Accessible cell label, including the record position. */
  label: string;
  /** Whether the field label should be visually hidden. */
  isLabelHidden: boolean;
}

export interface ListInputRenderContext<T> extends ListInputValueContext<T> {
  /** Validation status scoped to this field. Its message is shown by ListInput. */
  status?: InputStatus;
  /** Whether the rendered control should be disabled. */
  isDisabled: boolean;
  /** Whether an asynchronous list operation is in progress. */
  isLoading: boolean;
  /** Replace this record in the controlled list. */
  updateItem: (nextItem: T, columnKey?: string) => void;
}

export interface ListInputColumn<T> {
  /** Stable column identifier, also passed to getFieldStatus. */
  key: string;
  /** Field label shown on the first record and repeated when rows stack. */
  header: string;
  /**
   * Column sizing. Use proportional() or pixel() from @astryxdesign/core/Table
   * to tune the width ratio. Defaults to a proportional column with a 140px floor.
   */
  width?: ColumnWidth;
  /** Renders the editable control for one cell. */
  renderInput: (context: ListInputRenderContext<T>) => ReactNode;
}

export interface ListInputProps<T> extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the outer field element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Visible and accessible label for the list. */
  label: string;
  /** Optional supporting text. */
  description?: string;
  /** Controlled records. */
  value: T[];
  /** Called for every record mutation with the next value and mutation detail. */
  onChange: (nextValue: T[], change: ListInputChange<T>) => void;
  /** Returns a stable key for focus preservation and reordering. */
  getItemKey: (item: T) => Key;
  /** Creates a new record when the Add action is used. */
  createItem: () => T;
  /** Column definitions and cell renderers. */
  columns: ListInputColumn<T>[];
  /** Singular name used in action labels and announcements. @default 'item' */
  itemName?: string;
  /** Validation status for the whole list. */
  status?: InputStatus;
  /** Returns a validation status displayed across one record. */
  getItemStatus?: (item: T, index: number) => InputStatus | undefined;
  /** Returns a validation status passed to one field renderer. */
  getFieldStatus?: (
    item: T,
    columnKey: string,
    index: number,
  ) => InputStatus | undefined;
  /** Enables handle-only pointer and keyboard reordering. @default false */
  isReorderable?: boolean;
  /** Disables fields and mutation controls. @default false */
  isDisabled?: boolean;
  /** Marks the list busy and prevents mutations. @default false */
  isLoading?: boolean;
  /** Maximum record count. Reaching it disables, but does not remove, Add. */
  maxItems?: number;
  /** Visually hides the list label while preserving its accessible name. */
  isLabelHidden?: boolean;
  /** Marks the list optional. */
  isOptional?: boolean;
  /** Marks the list required. */
  isRequired?: boolean;
}

interface ReorderState<T> {
  itemKey: Key;
  fromIndex: number;
  toIndex: number;
  originalValue: T[];
  mode: 'keyboard' | 'pointer';
  pointerId?: number;
  pointerStartX?: number;
  pointerStartY?: number;
  pointerOffsetX?: number;
  pointerOffsetY?: number;
  pointerClientX?: number;
  pointerClientY?: number;
  previewWidth?: number;
  hasPointerMoved?: boolean;
}

interface PendingFocus {
  itemKey?: string;
  target: 'first-field' | 'remove' | 'add';
}

const styles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
    containerType: 'inline-size',
    containerName: 'list-input',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: {
      default: spacingVars['--spacing-1'],
      '@container list-input (max-width: 480px)': spacingVars['--spacing-4'],
    },
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    position: 'relative',
  },
  row: {
    display: 'grid',
    alignItems: 'end',
    columnGap: spacingVars['--spacing-1'],
    rowGap: {
      default: 0,
      '@container list-input (max-width: 480px)': spacingVars['--spacing-2'],
    },
    minWidth: 0,
  },
  rowFieldsOnly: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  rowWithReorder: {
    gridTemplateColumns: `minmax(0, 1fr) ${sizeVars['--size-element-sm']}`,
  },
  rowWithRemove: {
    gridTemplateColumns: `minmax(0, 1fr) ${sizeVars['--size-element-sm']}`,
  },
  rowWithBothControls: {
    gridTemplateColumns: `minmax(0, 1fr) ${sizeVars['--size-element-sm']} ${sizeVars['--size-element-sm']}`,
  },
  fields: {
    display: {
      default: 'grid',
      '@container list-input (max-width: 480px)': 'contents',
    },
    alignItems: 'end',
    gap: {
      default: spacingVars['--spacing-1'],
      '@container list-input (max-width: 480px)': spacingVars['--spacing-2'],
    },
    minWidth: 0,
  },
  fieldCell: {
    gridColumn: {
      default: 'auto',
      '@container list-input (max-width: 480px)': '1',
    },
  },
  contentOnly: {gridColumn: '1 / -1'},
  contentBeforeOneControl: {gridColumn: '1 / -2'},
  contentBeforeBothControls: {gridColumn: '1 / -3'},
  itemStatus: {
    gridRow: {
      default: '2',
      '@container list-input (max-width: 480px)': 'auto',
    },
    marginBlockStart: {
      default: spacingVars['--spacing-1'],
      '@container list-input (max-width: 480px)': 0,
    },
    minWidth: 0,
  },
  actionRow: {
    display: 'grid',
    alignItems: 'center',
    columnGap: spacingVars['--spacing-1'],
    marginBlockStart: spacingVars['--spacing-2'],
  },
  actionContent: {
    minWidth: 0,
  },
  primaryColumnLabel: {
    // FieldLabel uses the secondary text token by default. Scope its token to
    // the first record so these labels read as column labels without changing
    // labels elsewhere in the application.
    '--color-text-secondary': colorVars['--color-text-primary'],
  },
  cellContent: {minWidth: 0},
  controlCell: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'end',
    justifyContent: 'center',
    minHeight: sizeVars['--size-element-sm'],
  },
  removeControlCell: {
    gridColumn: {
      default: 'auto',
      '@container list-input (max-width: 480px)': '2',
    },
    gridRow: {
      default: 'auto',
      '@container list-input (max-width: 480px)': '1',
    },
  },
  reorderControlCell: {
    gridColumn: {
      default: 'auto',
      '@container list-input (max-width: 480px)': '3',
    },
    gridRow: {
      default: 'auto',
      '@container list-input (max-width: 480px)': '1',
    },
  },
  fieldStatusAnchor: {
    minWidth: 0,
  },
  responsiveColumnLabel: {
    display: {
      default: 'none',
      '@container list-input (max-width: 480px)': 'block',
    },
    marginBlockEnd: spacingVars['--spacing-1'],
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  emptyItem: {
    width: '100%',
  },
  dragPreviewContainer: {
    containerType: 'inline-size',
    containerName: 'list-input',
  },
});

const dynamicStyles = stylex.create({
  fields: (gridTemplateColumns: string) => ({
    gridTemplateColumns: {
      default: gridTemplateColumns,
      '@container list-input (max-width: 480px)': 'minmax(0, 1fr)',
    },
  }),
  dragPreview: (x: number, y: number, width: number) => ({
    width,
    transform: `translate3d(${x}px, ${y}px, 0)`,
  }),
  rowTransition: (name: string) => ({viewTransitionName: name}),
});

function GripVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="9" cy="6" r="1.5" fill="currentColor" />
      <circle cx="15" cy="6" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="18" r="1.5" fill="currentColor" />
      <circle cx="15" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function resolveColumnTrack(width?: ColumnWidth): string {
  if (width?.type === 'pixel') {
    return `${width.value}px`;
  }
  const proportion = width?.value ?? 1;
  const minWidth = width?.minWidth ?? 140;
  return `minmax(${minWidth}px, ${proportion}fr)`;
}

function moveItem<T>(value: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) {
    return value.slice();
  }
  const nextValue = value.slice();
  const [item] = nextValue.splice(fromIndex, 1);
  nextValue.splice(toIndex, 0, item);
  return nextValue;
}

function joinIDs(...ids: Array<string | undefined>): string | undefined {
  const resolved = ids.filter(Boolean);
  return resolved.length > 0 ? resolved.join(' ') : undefined;
}

function animateControlledUpdate(update: () => void): void {
  const prefersReducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (
    !prefersReducedMotion &&
    typeof document.startViewTransition === 'function'
  ) {
    document.startViewTransition(() => flushSync(update));
    return;
  }
  update();
}

function transitionName(scope: string, key: Key): string {
  return `${scope}-${String(key)}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * A compact editor for short collections of consistent, simple records.
 *
 * ListInput owns list semantics, add/remove controls, handle-only reordering,
 * focus restoration, announcements, and list/item/field validation placement.
 * Consumers keep ownership of the controlled data and render each field with
 * standard Astryx inputs.
 *
 * @example
 * ```
 * <ListInput
 *   label="Guests"
 *   value={guests}
 *   onChange={setGuests}
 *   getItemKey={guest => guest.id}
 *   createItem={() => ({id: crypto.randomUUID(), name: '', email: ''})}
 *   columns={columns}
 *   itemName="guest"
 *   isReorderable
 * />
 * ```
 */
export function ListInput<T>({
  label,
  description,
  value,
  onChange,
  getItemKey,
  createItem,
  columns,
  itemName = 'item',
  status,
  getItemStatus,
  getFieldStatus,
  isReorderable = false,
  isDisabled = false,
  isLoading = false,
  maxItems,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  ref,
  ...rest
}: ListInputProps<T>): ReactNode {
  const generatedID = useId();
  const groupID = `list-input-${generatedID}`;
  const labelID = `${groupID}-label`;
  const descriptionID = description ? `${groupID}-description` : undefined;
  const statusID = status?.message ? `${groupID}-status` : undefined;
  const reorderInstructionsID = `${groupID}-reorder-instructions`;
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocusRef = useRef<PendingFocus | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const reorderStateRef = useRef<ReorderState<T> | null>(null);
  const [reorderState, setReorderStateState] = useState<ReorderState<T> | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState('');

  const setReorderState = (nextState: ReorderState<T> | null) => {
    reorderStateRef.current = nextState;
    setReorderStateState(nextState);
  };

  const displayValue = useMemo(() => {
    if (reorderState == null) {
      return value;
    }
    if (reorderState.mode === 'pointer') {
      return reorderState.originalValue;
    }
    return moveItem(
      reorderState.originalValue,
      reorderState.fromIndex,
      reorderState.toIndex,
    );
  }, [reorderState, value]);
  const showReorderColumn = isReorderable;
  const showRemoveColumn = true;
  const fieldGridTemplate = useMemo(
    () => columns.map(column => resolveColumnTrack(column.width)).join(' '),
    [columns],
  );

  const pointerPlacement = useMemo(() => {
    if (
      reorderState?.mode !== 'pointer' ||
      !reorderState.hasPointerMoved ||
      reorderState.toIndex === reorderState.fromIndex
    ) {
      return null;
    }
    const remainingItems = reorderState.originalValue.filter(
      (_, index) => index !== reorderState.fromIndex,
    );
    const beforeItem = remainingItems[reorderState.toIndex];
    if (beforeItem != null) {
      return {
        position: 'before' as const,
        itemKey: String(getItemKey(beforeItem)),
      };
    }
    const afterItem = remainingItems.at(-1);
    return afterItem == null
      ? null
      : {
          position: 'after' as const,
          itemKey: String(getItemKey(afterItem)),
        };
  }, [getItemKey, reorderState]);
  const previewCloneKey =
    reorderState?.mode === 'pointer' ? String(reorderState.itemKey) : null;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const itemKeys = new Set<string>();
    for (const item of value) {
      const key = String(getItemKey(item));
      if (itemKeys.has(key)) {
        console.warn(
          `ListInput: getItemKey returned duplicate key "${key}". Keys must be unique and stable.`,
        );
        break;
      }
      itemKeys.add(key);
    }
    const columnKeys = new Set<string>();
    for (const column of columns) {
      if (columnKeys.has(column.key)) {
        console.warn(
          `ListInput: columns contains duplicate key "${column.key}". Column keys must be unique.`,
        );
        break;
      }
      columnKeys.add(column.key);
    }
  }, [columns, getItemKey, value]);

  useEffect(() => {
    if ((isDisabled || isLoading) && reorderStateRef.current) {
      setReorderState(null);
      setAnnouncement('Reordering cancelled.');
    }
  }, [isDisabled, isLoading]);

  useLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (pendingFocus == null) {
      return;
    }
    let target: HTMLElement | null = null;
    if (pendingFocus.target === 'add') {
      target = addButtonRef.current;
    } else if (pendingFocus.itemKey != null) {
      const row = rowRefs.current.get(pendingFocus.itemKey);
      const selector =
        pendingFocus.target === 'remove'
          ? '[data-list-input-remove]'
          : '[data-list-input-cell] input, [data-list-input-cell] select, [data-list-input-cell] textarea, [data-list-input-cell] button, [data-list-input-cell] [tabindex]:not([tabindex="-1"])';
      target = row?.querySelector<HTMLElement>(selector) ?? null;
    }
    if (target != null) {
      target.focus();
      pendingFocusRef.current = null;
    }
  }, [value]);

  useLayoutEffect(() => {
    const previewHost = dragPreviewRef.current;
    if (previewHost == null || previewCloneKey == null) {
      return;
    }
    const sourceRow = rowRefs.current.get(previewCloneKey);
    if (sourceRow == null) {
      return;
    }
    const clone = sourceRow.cloneNode(true) as HTMLElement;
    previewHost.style.direction = getComputedStyle(sourceRow).direction;
    clone.style.opacity = '1';
    clone.removeAttribute('data-list-input-reorder-source');
    clone.removeAttribute('data-list-input-drop-target');
    clone.removeAttribute('data-list-input-reorder');
    clone.removeAttribute('data-list-input-remove');
    clone.removeAttribute('data-list-input-row');
    clone.setAttribute('aria-hidden', 'true');
    const clonedElements = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
    for (const element of clonedElements) {
      element.removeAttribute('id');
      element.removeAttribute('aria-describedby');
      element.removeAttribute('aria-labelledby');
      element.removeAttribute('name');
      element.removeAttribute('data-list-input-reorder-source');
      element.removeAttribute('data-list-input-drop-target');
      element.removeAttribute('data-list-input-reorder');
      element.removeAttribute('data-list-input-remove');
      element.setAttribute('tabindex', '-1');
      element.style.viewTransitionName = 'none';
    }
    previewHost.replaceChildren(clone);
    return () => {
      previewHost.replaceChildren();
      previewHost.style.removeProperty('direction');
    };
  }, [previewCloneKey]);

  const mutationsDisabled = isDisabled || isLoading;
  const hasReachedMax = maxItems != null && value.length >= maxItems;

  const handleAdd = () => {
    if (mutationsDisabled || hasReachedMax) {
      return;
    }
    const item = createItem();
    const nextValue = [...value, item];
    pendingFocusRef.current = {
      itemKey: String(getItemKey(item)),
      target: 'first-field',
    };
    onChange(nextValue, {type: 'add', item, index: value.length});
    setAnnouncement(`Added ${itemName} ${value.length + 1}.`);
  };

  const handleUpdate = (
    item: T,
    index: number,
    nextItem: T,
    columnKey?: string,
  ) => {
    if (mutationsDisabled) {
      return;
    }
    const nextValue = value.slice();
    nextValue[index] = nextItem;
    onChange(nextValue, {
      type: 'update',
      item: nextItem,
      previousItem: item,
      index,
      columnKey,
    });
  };

  const handleRemove = (item: T, index: number) => {
    if (mutationsDisabled) {
      return;
    }
    const nextValue = value.filter((_, itemIndex) => itemIndex !== index);
    const nextFocusItem = nextValue[Math.min(index, nextValue.length - 1)];
    pendingFocusRef.current =
      nextFocusItem == null
        ? {target: 'add'}
        : {itemKey: String(getItemKey(nextFocusItem)), target: 'remove'};
    onChange(nextValue, {type: 'remove', item, index});
    setAnnouncement(`Removed ${itemName} ${index + 1}.`);
  };

  const startReorder = (
    item: T,
    index: number,
    mode: 'keyboard' | 'pointer',
    pointerId?: number,
    pointerGeometry?: Pick<
      ReorderState<T>,
      | 'pointerStartX'
      | 'pointerStartY'
      | 'pointerOffsetX'
      | 'pointerOffsetY'
      | 'pointerClientX'
      | 'pointerClientY'
      | 'previewWidth'
    >,
  ) => {
    if (mutationsDisabled || !isReorderable) {
      return;
    }
    setReorderState({
      itemKey: getItemKey(item),
      fromIndex: index,
      toIndex: index,
      originalValue: value.slice(),
      mode,
      pointerId,
      ...pointerGeometry,
      hasPointerMoved: false,
    });
    setAnnouncement(
      `${itemName} ${index + 1} grabbed. Use arrow keys to move, Space or Enter to drop, and Escape to cancel.`,
    );
  };

  const previewReorder = (toIndex: number) => {
    const currentState = reorderStateRef.current;
    if (currentState == null) {
      return;
    }
    const boundedIndex = Math.max(
      0,
      Math.min(toIndex, currentState.originalValue.length - 1),
    );
    if (boundedIndex === currentState.toIndex) {
      return;
    }
    setReorderState({...currentState, toIndex: boundedIndex});
    setAnnouncement(
      `${itemName} moved to position ${boundedIndex + 1} of ${currentState.originalValue.length}.`,
    );
  };

  const cancelReorder = () => {
    if (reorderStateRef.current == null) {
      return;
    }
    setReorderState(null);
    setAnnouncement('Reordering cancelled.');
  };

  const commitReorder = () => {
    const currentState = reorderStateRef.current;
    if (currentState == null) {
      return;
    }
    if (currentState.mode === 'pointer' && !currentState.hasPointerMoved) {
      setReorderState(null);
      return;
    }

    const nextValue = moveItem(
      currentState.originalValue,
      currentState.fromIndex,
      currentState.toIndex,
    );
    const item = currentState.originalValue[currentState.fromIndex];
    const hasChanged = currentState.fromIndex !== currentState.toIndex;
    if (currentState.mode === 'pointer') {
      flushSync(() => setReorderState(null));
    } else {
      setReorderState(null);
    }
    if (!hasChanged) {
      setAnnouncement(
        `${itemName} returned to position ${currentState.fromIndex + 1}.`,
      );
      return;
    }
    const commit = () =>
      onChange(nextValue, {
        type: 'reorder',
        item,
        fromIndex: currentState.fromIndex,
        toIndex: currentState.toIndex,
      });
    if (currentState.mode === 'pointer') {
      animateControlledUpdate(commit);
    } else {
      commit();
    }
    setAnnouncement(
      `${itemName} dropped at position ${currentState.toIndex + 1} of ${currentState.originalValue.length}.`,
    );
  };
  const moveWithArrowKey = (item: T, fromIndex: number, offset: -1 | 1) => {
    const toIndex = Math.max(0, Math.min(fromIndex + offset, value.length - 1));
    if (toIndex === fromIndex) {
      setAnnouncement(
        `This ${itemName} is already ${offset < 0 ? 'first' : 'last'}.`,
      );
      return;
    }
    const nextValue = moveItem(value, fromIndex, toIndex);
    animateControlledUpdate(() =>
      onChange(nextValue, {
        type: 'reorder',
        item,
        fromIndex,
        toIndex,
      }),
    );
    setAnnouncement(
      `${itemName} moved to position ${toIndex + 1} of ${value.length}.`,
    );
  };

  const handleReorderKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    item: T,
    index: number,
  ) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const activeState = reorderStateRef.current;
    const isActivationKey = event.key === ' ' || event.key === 'Enter';
    if (activeState == null) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveWithArrowKey(item, index, -1);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveWithArrowKey(item, index, 1);
        return;
      }
      if (isActivationKey) {
        event.preventDefault();
        startReorder(item, index, 'keyboard');
      }
      return;
    }
    if (String(activeState.itemKey) !== String(getItemKey(item))) {
      return;
    }
    if (isActivationKey) {
      event.preventDefault();
      commitReorder();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelReorder();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      previewReorder(activeState.toIndex - 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      previewReorder(activeState.toIndex + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      previewReorder(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      previewReorder(activeState.originalValue.length - 1);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const activeState = reorderStateRef.current;
    if (
      activeState == null ||
      activeState.mode !== 'pointer' ||
      activeState.pointerId !== event.pointerId
    ) {
      return;
    }
    const horizontalDistance =
      event.clientX - (activeState.pointerStartX ?? event.clientX);
    const verticalDistance =
      event.clientY - (activeState.pointerStartY ?? event.clientY);
    const hasCrossedThreshold =
      activeState.hasPointerMoved ||
      Math.hypot(horizontalDistance, verticalDistance) >= 5;
    const remainingItems = activeState.originalValue.filter(
      (_, index) => index !== activeState.fromIndex,
    );
    let targetIndex = activeState.fromIndex;
    if (hasCrossedThreshold) {
      event.preventDefault();
      targetIndex = remainingItems.length;
      for (let index = 0; index < remainingItems.length; index++) {
        const row = rowRefs.current.get(
          String(getItemKey(remainingItems[index])),
        );
        if (row == null) {
          continue;
        }
        const bounds = row.getBoundingClientRect();
        if (event.clientY < bounds.top + bounds.height / 2) {
          targetIndex = index;
          break;
        }
      }
    }
    const nextState = {
      ...activeState,
      pointerClientX: event.clientX,
      pointerClientY: event.clientY,
      hasPointerMoved: hasCrossedThreshold,
      toIndex: targetIndex,
    };
    if (
      activeState.pointerClientX === nextState.pointerClientX &&
      activeState.pointerClientY === nextState.pointerClientY &&
      activeState.hasPointerMoved === nextState.hasPointerMoved &&
      activeState.toIndex === nextState.toIndex
    ) {
      return;
    }
    setReorderState(nextState);
    if (hasCrossedThreshold && activeState.toIndex !== targetIndex) {
      setAnnouncement(
        `${itemName} moved to position ${targetIndex + 1} of ${activeState.originalValue.length}.`,
      );
    }
  };

  const rowLayoutStyle = showReorderColumn
    ? showRemoveColumn
      ? styles.rowWithBothControls
      : styles.rowWithReorder
    : showRemoveColumn
      ? styles.rowWithRemove
      : styles.rowFieldsOnly;
  const contentGridStyle = showReorderColumn
    ? styles.contentBeforeBothControls
    : showRemoveColumn
      ? styles.contentBeforeOneControl
      : styles.contentOnly;
  const dragPreviewPosition =
    reorderState?.mode === 'pointer' &&
    reorderState.pointerClientX != null &&
    reorderState.pointerClientY != null &&
    reorderState.pointerOffsetX != null &&
    reorderState.pointerOffsetY != null &&
    reorderState.previewWidth != null
      ? {
          x: reorderState.pointerClientX - reorderState.pointerOffsetX,
          y: reorderState.pointerClientY - reorderState.pointerOffsetY,
          width: reorderState.previewWidth,
        }
      : null;

  return (
    <>
      <Field
        ref={ref}
        label={label}
        description={description}
        inputID={groupID}
        labelID={labelID}
        descriptionID={descriptionID}
        isGroupLabel
        isLabelHidden={isLabelHidden}
        isOptional={isOptional}
        isRequired={isRequired}
        isDisabled={isDisabled}
        status={status == null ? undefined : {...status, messageID: statusID}}
        statusVariant="detached"
        {...rest}>
        <div
          id={groupID}
          role="group"
          aria-labelledby={labelID}
          aria-describedby={joinIDs(descriptionID, statusID)}
          aria-disabled={isDisabled || undefined}
          aria-required={isRequired || undefined}
          aria-busy={isLoading || undefined}
          {...mergeProps(
            themeProps('list-input', {
              state: isLoading
                ? 'loading'
                : isDisabled
                  ? 'disabled'
                  : undefined,
              reorderable: isReorderable ? 'true' : undefined,
            }),
            stylex.props(styles.group),
          )}>
          <ol
            role="list"
            aria-labelledby={labelID}
            aria-describedby={joinIDs(descriptionID, statusID)}
            {...stylex.props(styles.list)}>
            {displayValue.length === 0 ? (
              <li {...stylex.props(styles.emptyItem)}>
                <EmptyState
                  title={`No ${itemName}s yet`}
                  description={`Add a ${itemName} to get started.`}
                  isCompact
                />
              </li>
            ) : (
              displayValue.map((item, index) => {
                const itemKey = getItemKey(item);
                const itemKeyString = String(itemKey);
                const isActiveReorder =
                  reorderState != null &&
                  String(reorderState.itemKey) === itemKeyString;
                const dropPosition =
                  pointerPlacement?.itemKey === itemKeyString
                    ? pointerPlacement.position
                    : null;
                const isPointerReorderSource =
                  isActiveReorder && reorderState?.mode === 'pointer';
                const itemStatus = getItemStatus?.(item, index);
                const itemStatusID = itemStatus?.message
                  ? `${groupID}-item-${index}-status`
                  : undefined;
                return (
                  <li
                    key={itemKey}
                    data-list-input-drop-target={dropPosition ?? undefined}
                    aria-describedby={itemStatusID}
                    aria-invalid={itemStatus?.type === 'error' || undefined}
                    aria-posinset={index + 1}
                    aria-setsize={displayValue.length}
                    {...stylex.props(
                      styles.item,
                      dropPosition === 'before' && reorderStyles.dropBefore,
                      dropPosition === 'after' && reorderStyles.dropAfter,
                    )}>
                    <div
                      data-list-input-reorder-source={
                        isActiveReorder || undefined
                      }
                      ref={node => {
                        if (node == null) {
                          rowRefs.current.delete(itemKeyString);
                        } else {
                          rowRefs.current.set(itemKeyString, node);
                        }
                      }}
                      data-list-input-row={itemKeyString}
                      {...stylex.props(
                        styles.row,
                        rowLayoutStyle,
                        dynamicStyles.rowTransition(
                          transitionName(groupID, itemKey),
                        ),
                        isPointerReorderSource && reorderStyles.source,
                      )}>
                      <div
                        {...stylex.props(
                          styles.fields,
                          dynamicStyles.fields(fieldGridTemplate),
                        )}>
                        {columns.map((column, columnIndex) => {
                          const fieldStatus = getFieldStatus?.(
                            item,
                            column.key,
                            index,
                          );
                          const fieldStatusID = fieldStatus?.message
                            ? `${groupID}-item-${index}-field-${columnIndex}-status`
                            : undefined;
                          const isFieldLabelHidden = index !== 0;
                          const cellLabel = isFieldLabelHidden
                            ? `${column.header}, ${itemName} ${index + 1} of ${displayValue.length}`
                            : column.header;
                          const valueContext: ListInputValueContext<T> = {
                            item,
                            index,
                            label: cellLabel,
                            isLabelHidden: isFieldLabelHidden,
                          };
                          const content = column.renderInput({
                            ...valueContext,
                            status:
                              fieldStatus == null
                                ? undefined
                                : {type: fieldStatus.type},
                            isDisabled: isDisabled || isLoading,
                            isLoading,
                            updateItem: (nextItem, changeColumnKey) =>
                              handleUpdate(
                                item,
                                index,
                                nextItem,
                                changeColumnKey ?? column.key,
                              ),
                          });
                          const fieldContent = (
                            <div
                              role={fieldStatusID ? 'group' : undefined}
                              aria-describedby={fieldStatusID}
                              aria-invalid={
                                fieldStatus?.type === 'error' || undefined
                              }
                              {...stylex.props(styles.fieldStatusAnchor)}>
                              {isFieldLabelHidden ? (
                                <span
                                  aria-hidden="true"
                                  {...stylex.props(
                                    styles.responsiveColumnLabel,
                                  )}>
                                  {column.header}
                                </span>
                              ) : null}
                              <div {...stylex.props(styles.cellContent)}>
                                {content}
                              </div>
                            </div>
                          );
                          return (
                            <div
                              key={column.key}
                              data-list-input-cell={String(columnIndex)}
                              data-list-input-column-label={
                                isFieldLabelHidden ? undefined : 'primary'
                              }
                              {...stylex.props(
                                styles.cellContent,
                                styles.fieldCell,
                                !isFieldLabelHidden &&
                                  styles.primaryColumnLabel,
                              )}>
                              {fieldStatus?.message ? (
                                <>
                                  <Tooltip
                                    content={fieldStatus.message}
                                    placement="above"
                                    focusTrigger="always"
                                    hasHoverIndication={false}>
                                    {fieldContent}
                                  </Tooltip>
                                  <VisuallyHidden
                                    as="div"
                                    id={fieldStatusID}
                                    role={
                                      fieldStatus.type === 'error'
                                        ? 'alert'
                                        : 'status'
                                    }
                                    aria-live={
                                      fieldStatus.type === 'error'
                                        ? 'assertive'
                                        : 'polite'
                                    }>
                                    {fieldStatus.message}
                                  </VisuallyHidden>
                                </>
                              ) : (
                                fieldContent
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {showRemoveColumn ? (
                        <div
                          {...stylex.props(
                            styles.controlCell,
                            styles.removeControlCell,
                          )}>
                          <IconButton
                            label={`Remove ${itemName} ${index + 1}`}
                            tooltip={`Remove ${itemName} ${index + 1}`}
                            icon={<Icon icon="close" size="sm" />}
                            variant="ghost"
                            size="sm"
                            isDisabled={isDisabled || isLoading}
                            data-list-input-remove=""
                            onClick={() => handleRemove(item, index)}
                          />
                        </div>
                      ) : null}
                      {showReorderColumn ? (
                        <div
                          {...stylex.props(
                            styles.controlCell,
                            styles.reorderControlCell,
                          )}>
                          <IconButton
                            label={`Reorder ${itemName} ${index + 1}`}
                            icon={<Icon icon={GripVerticalIcon} size="sm" />}
                            variant="ghost"
                            size="sm"
                            isDisabled={isDisabled || isLoading}
                            aria-describedby={reorderInstructionsID}
                            aria-pressed={isActiveReorder || undefined}
                            data-list-input-reorder=""
                            xstyle={[
                              reorderStyles.handle,
                              isActiveReorder && reorderStyles.handleActive,
                            ]}
                            onKeyDown={event =>
                              handleReorderKeyDown(event, item, index)
                            }
                            onBlur={() => {
                              const activeState = reorderStateRef.current;
                              if (
                                activeState?.mode === 'keyboard' &&
                                String(activeState.itemKey) === itemKeyString
                              ) {
                                cancelReorder();
                              }
                            }}
                            onPointerDown={event => {
                              if (
                                event.button !== 0 ||
                                isDisabled ||
                                isLoading
                              ) {
                                return;
                              }
                              const sourceRow =
                                rowRefs.current.get(itemKeyString);
                              if (sourceRow == null) {
                                return;
                              }
                              const bounds = sourceRow.getBoundingClientRect();
                              event.currentTarget.setPointerCapture?.(
                                event.pointerId,
                              );
                              startReorder(
                                item,
                                index,
                                'pointer',
                                event.pointerId,
                                {
                                  pointerStartX: event.clientX,
                                  pointerStartY: event.clientY,
                                  pointerOffsetX: event.clientX - bounds.left,
                                  pointerOffsetY: event.clientY - bounds.top,
                                  pointerClientX: event.clientX,
                                  pointerClientY: event.clientY,
                                  previewWidth: bounds.width,
                                },
                              );
                            }}
                            onPointerMove={handlePointerMove}
                            onPointerUp={event => {
                              const activeState = reorderStateRef.current;
                              if (
                                activeState?.mode === 'pointer' &&
                                activeState.pointerId === event.pointerId
                              ) {
                                commitReorder();
                                if (
                                  event.currentTarget.hasPointerCapture?.(
                                    event.pointerId,
                                  )
                                ) {
                                  event.currentTarget.releasePointerCapture?.(
                                    event.pointerId,
                                  );
                                }
                              }
                            }}
                            onPointerCancel={event => {
                              const activeState = reorderStateRef.current;
                              if (
                                activeState?.mode === 'pointer' &&
                                activeState.pointerId === event.pointerId
                              ) {
                                cancelReorder();
                                if (
                                  event.currentTarget.hasPointerCapture?.(
                                    event.pointerId,
                                  )
                                ) {
                                  event.currentTarget.releasePointerCapture?.(
                                    event.pointerId,
                                  );
                                }
                              }
                            }}
                            onLostPointerCapture={event => {
                              const activeState = reorderStateRef.current;
                              if (
                                activeState?.mode === 'pointer' &&
                                activeState.pointerId === event.pointerId
                              ) {
                                cancelReorder();
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      {itemStatus?.message ? (
                        <FieldStatus
                          id={itemStatusID}
                          type={itemStatus.type}
                          message={itemStatus.message}
                          variant="detached"
                          data-list-input-item-status=""
                          xstyle={[styles.itemStatus, contentGridStyle]}
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ol>
          <div {...stylex.props(styles.actionRow, rowLayoutStyle)}>
            <div
              data-list-input-add-content=""
              {...stylex.props(styles.actionContent, contentGridStyle)}>
              <Button
                ref={addButtonRef}
                label={`Add ${itemName}`}
                variant="secondary"
                size="sm"
                width="100%"
                isDisabled={isDisabled || hasReachedMax}
                isLoading={isLoading}
                onClick={handleAdd}
              />
            </div>
          </div>
          {showReorderColumn ? (
            <VisuallyHidden as="div" id={reorderInstructionsID}>
              Use Arrow Up or Arrow Down to move this item one position. Press
              Space or Enter to pick it up for extended keyboard reordering.
            </VisuallyHidden>
          ) : null}
          <VisuallyHidden as="div" aria-live="polite" aria-atomic="true">
            {announcement}
          </VisuallyHidden>
        </div>
      </Field>
      {dragPreviewPosition != null && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={dragPreviewRef}
              aria-hidden="true"
              data-list-input-drag-preview=""
              {...stylex.props(
                reorderStyles.preview,
                styles.dragPreviewContainer,
                dynamicStyles.dragPreview(
                  dragPreviewPosition.x,
                  dragPreviewPosition.y,
                  dragPreviewPosition.width,
                ),
              )}
            />,
            document.body,
          )
        : null}
    </>
  );
}

ListInput.displayName = 'ListInput';
