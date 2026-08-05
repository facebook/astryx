// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TransferList.tsx
 * @input Controlled option data, React DOM portals, and shared Lab reorder styles
 * @output Exports the generic TransferList component and its public prop types
 * @position Lab collection input; consumed by index.ts, docs, tests, and Storybook
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/TransferList/TransferList.doc.mjs
 * - /packages/lab/src/TransferList/TransferList.test.tsx
 * - /packages/lab/src/TransferList/index.ts
 * - /apps/storybook/stories/TransferList.stories.tsx
 */

import {
  Fragment,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {createPortal, flushSync} from 'react-dom';
import {GripVertical, Plus, X} from 'lucide-react';
import type {BaseProps} from '@astryxdesign/core';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Item} from '@astryxdesign/core/Item';
import {List} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {useAnnounce} from '@astryxdesign/core/hooks';
import {
  borderVars,
  colorVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, mergeRefs, themeProps} from '@astryxdesign/core/utils';
import {reorderStyles} from '../reorderStyles';
import {transferListVars} from './tokens.stylex';

export interface TransferListOption<T extends string = string> {
  /** Stable value written to the controlled value array. */
  value: T;
  /** Visible option name and the basis of action labels. */
  label: string;
  /** Optional searchable metadata. Not rendered in the default row. */
  description?: ReactNode;
  /** Optional group heading on the available side. */
  group?: string;
  /** Prevents transfer and reordering while retaining the option in value. */
  isDisabled?: boolean;
  /** Explains why the option cannot be changed. */
  disabledMessage?: string;
}

export interface TransferListProps<T extends string = string> extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the root group. */
  ref?: React.Ref<HTMLDivElement>;
  /** Accessible name for the complete control. */
  label: string;
  /** Visually hides the label while retaining its accessible name. */
  isLabelHidden?: boolean;
  /** Supporting guidance shown below the label. */
  description?: string;
  /** Complete option catalog. Option values must be unique. */
  options: readonly TransferListOption<T>[];
  /** Ordered selected values. This array is the single source of truth. */
  value: readonly T[];
  /** Called with the next ordered selection after a committed change. */
  onChange: (value: readonly T[]) => void;
  /** Heading for the selected panel. @default 'Selected' */
  selectedLabel?: string;
  /** Heading for the available panel. @default 'Available' */
  availableLabel?: string;
  /** Shows one search field that filters both panels. @default true */
  hasSearch?: boolean;
  /** Accessible label for search. Defaults to `Search ${label}`. */
  searchLabel?: string;
  /** Search input placeholder. @default 'Search…' */
  searchPlaceholder?: string;
  /** Enables pointer and keyboard ordering on selected options. @default true */
  isReorderable?: boolean;
  /** Shows an Add all action. @default false */
  hasSelectAll?: boolean;
  /** Shows a Clear action. Disabled selected options are retained. */
  hasClear?: boolean;
  /** Shows a Reset action; the consumer owns the reset target. */
  onReset?: () => void;
  /** Customizes primary row content without changing built-in behavior. */
  renderOption?: (option: TransferListOption<T>) => ReactNode;
  /** Empty copy for the selected panel. */
  selectedEmptyText?: string;
  /** Empty copy for the available panel. */
  availableEmptyText?: string;
  /** Empty copy while a search query is active. */
  noResultsText?: string;
}

interface ReorderSession<T extends string> {
  value: T;
  label: string;
  mode: 'keyboard' | 'pointer';
  originalValue: readonly T[];
  fromIndex: number;
  toIndex: number;
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

type PointerGeometry = Required<
  Pick<
    ReorderSession<string>,
    | 'pointerId'
    | 'pointerStartX'
    | 'pointerStartY'
    | 'pointerOffsetX'
    | 'pointerOffsetY'
    | 'pointerClientX'
    | 'pointerClientY'
    | 'previewWidth'
  >
>;

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    minWidth: 0,
    containerType: 'inline-size',
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  controls: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
  search: {flex: 1, minWidth: 0},
  panels: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) minmax(0, 1fr)',
      '@container (max-width: 40rem)': 'minmax(0, 1fr)',
    },
    gap: 0,
    minWidth: 0,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: -2,
  },
  panelDivider: {
    borderInlineStartWidth: {
      default: borderVars['--border-width'],
      '@container (max-width: 40rem)': 0,
    },
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
    borderBlockStartWidth: {
      default: 0,
      '@container (max-width: 40rem)': borderVars['--border-width'],
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
  },
  headerAction: {
    height: 'auto',
    paddingBlock: 0,
    paddingInline: 0,
    borderRadius: 0,
    color: colorVars['--color-text-accent'],
    backgroundImage: {
      default: 'none',
      ':hover': 'none',
      ':active': 'none',
    },
  },
  panelBody: {
    minBlockSize: transferListVars['--transfer-list-panel-min-block-size'],
    maxBlockSize: transferListVars['--transfer-list-panel-max-block-size'],
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable',
    padding: 0,
  },
  groupHeading: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    marginBlockStart: spacingVars['--spacing-2'],
  },
  item: {minWidth: 0},
  draggingItem: {backgroundColor: colorVars['--color-accent-muted']},
  disabledReason: {maxWidth: '8rem'},
  dragPreviewContainer: {listStyleType: 'none'},
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minBlockSize: transferListVars['--transfer-list-panel-min-block-size'],
    padding: spacingVars['--spacing-4'],
    textAlign: 'center',
  },
});

const dynamicStyles = stylex.create({
  dragPreview: (x: number, y: number, width: number) => ({
    width,
    transform: `translate3d(${x}px, ${y}px, 0)`,
  }),
  rowTransition: (name: string) => ({viewTransitionName: name}),
});

function moveItem<T>(
  value: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const nextValue = [...value];
  const [item] = nextValue.splice(fromIndex, 1);
  nextValue.splice(toIndex, 0, item);
  return nextValue;
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

function transitionName(scope: string, value: string): string {
  return `${scope}-${value}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function matchesQuery<T extends string>(
  option: TransferListOption<T>,
  query: string,
): boolean {
  if (query === '') {
    return true;
  }
  const description =
    typeof option.description === 'string' ? option.description : '';
  return [option.label, description, option.group ?? ''].some(part =>
    part.toLocaleLowerCase().includes(query),
  );
}

function itemCount(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

/**
 * A controlled dual-panel collection input for choosing and ordering values.
 * Selection, ordering, drafts, persistence, and saved views stay explicit in
 * the consumer; this component owns only search and active gesture state.
 *
 * @example
 * ```
 * const [columns, setColumns] = useState(['name', 'status']);
 * <TransferList
 *   label="Table columns"
 *   options={columnOptions}
 *   value={columns}
 *   onChange={setColumns}
 * />
 * ```
 */
export function TransferList<T extends string = string>({
  label,
  isLabelHidden = false,
  description,
  options,
  value,
  onChange,
  selectedLabel = 'Selected',
  availableLabel = 'Available',
  hasSearch = true,
  searchLabel,
  searchPlaceholder = 'Search…',
  isReorderable = true,
  hasSelectAll = false,
  hasClear = false,
  onReset,
  renderOption,
  selectedEmptyText = 'No selected options',
  availableEmptyText = 'No available options',
  noResultsText = 'No results',
  xstyle,
  className,
  style,
  ref,
  role,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}: TransferListProps<T>): ReactNode {
  const labelId = useId();
  const descriptionId = useId();
  const selectedHeadingId = useId();
  const availableHeadingId = useId();
  const reorderInstructionsId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const selectedPanelRef = useRef<HTMLDivElement | null>(null);
  const availablePanelRef = useRef<HTMLDivElement | null>(null);
  const selectedRowRefs = useRef(new Map<T, HTMLElement>());
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const currentValueRef = useRef<readonly T[]>(value);
  const reorderSessionRef = useRef<ReorderSession<T> | null>(null);
  const suppressClickRef = useRef(false);
  const [query, setQuery] = useState('');
  const [reorderSession, setReorderSessionState] =
    useState<ReorderSession<T> | null>(null);
  const announce = useAnnounce();

  currentValueRef.current = value;

  const setReorderSession = useCallback(
    (nextSession: ReorderSession<T> | null) => {
      reorderSessionRef.current = nextSession;
      setReorderSessionState(nextSession);
    },
    [],
  );

  const optionByValue = useMemo(() => {
    const map = new Map<T, TransferListOption<T>>();
    options.forEach(option => map.set(option.value, option));
    return map;
  }, [options]);
  const selectedValues = useMemo(() => new Set(value), [value]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const selectedOptions = useMemo(
    () =>
      value
        .map(optionValue => optionByValue.get(optionValue))
        .filter(
          (option): option is TransferListOption<T> =>
            option != null && matchesQuery(option, normalizedQuery),
        ),
    [normalizedQuery, optionByValue, value],
  );
  const availableOptions = useMemo(
    () =>
      options.filter(
        option =>
          !selectedValues.has(option.value) &&
          matchesQuery(option, normalizedQuery),
      ),
    [normalizedQuery, options, selectedValues],
  );
  const groupedAvailable = useMemo(() => {
    const groups = new Map<string, TransferListOption<T>[]>();
    availableOptions.forEach(option => {
      const group = option.group ?? '';
      const items = groups.get(group);
      if (items) {
        items.push(option);
      } else {
        groups.set(group, [option]);
      }
    });
    return Array.from(groups.entries());
  }, [availableOptions]);

  const pointerPlacement = useMemo(() => {
    if (
      reorderSession?.mode !== 'pointer' ||
      !reorderSession.hasPointerMoved ||
      reorderSession.toIndex === reorderSession.fromIndex
    ) {
      return null;
    }
    const remainingValues = reorderSession.originalValue.filter(
      optionValue => optionValue !== reorderSession.value,
    );
    const beforeValue = remainingValues[reorderSession.toIndex];
    if (beforeValue != null) {
      return {value: beforeValue, position: 'before' as const};
    }
    const afterValue = remainingValues.at(-1);
    return afterValue == null
      ? null
      : {value: afterValue, position: 'after' as const};
  }, [reorderSession]);

  const previewCloneValue =
    reorderSession?.mode === 'pointer' ? reorderSession.value : null;

  useLayoutEffect(() => {
    const previewHost = dragPreviewRef.current;
    if (previewHost == null || previewCloneValue == null) {
      return;
    }
    const sourceRow = selectedRowRefs.current.get(previewCloneValue);
    if (sourceRow == null) {
      return;
    }
    const clone = sourceRow.cloneNode(true) as HTMLElement;
    previewHost.style.direction = getComputedStyle(sourceRow).direction;
    clone.style.opacity = '1';
    clone.setAttribute('aria-hidden', 'true');
    const clonedElements = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
    for (const element of clonedElements) {
      element.removeAttribute('id');
      element.removeAttribute('aria-describedby');
      element.removeAttribute('aria-labelledby');
      element.removeAttribute('name');
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.startsWith('data-transfer-list-')) {
          element.removeAttribute(attribute.name);
        }
      }
      element.setAttribute('tabindex', '-1');
      element.style.viewTransitionName = 'none';
    }
    previewHost.replaceChildren(clone);
    return () => {
      previewHost.replaceChildren();
      previewHost.style.removeProperty('direction');
    };
  }, [previewCloneValue]);

  const commit = useCallback(
    (nextValue: readonly T[]) => {
      currentValueRef.current = nextValue;
      onChange(nextValue);
    },
    [onChange],
  );

  const focusAfterTransfer = useCallback(
    (side: 'selected' | 'available', index: number) => {
      const moveFocus = () => {
        const panel =
          side === 'selected'
            ? selectedPanelRef.current
            : availablePanelRef.current;
        const actions = panel?.querySelectorAll<HTMLButtonElement>(
          `[data-transfer-list-action="${side}"]:not([disabled])`,
        );
        if (actions && actions.length > 0) {
          actions[Math.min(index, actions.length - 1)]?.focus();
        } else if (hasSearch) {
          searchRef.current?.focus();
        } else {
          panel?.focus();
        }
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(moveFocus);
      } else {
        setTimeout(moveFocus, 0);
      }
    },
    [hasSearch],
  );

  const addOption = useCallback(
    (option: TransferListOption<T>, index: number) => {
      if (option.isDisabled || currentValueRef.current.includes(option.value)) {
        return;
      }
      commit([...currentValueRef.current, option.value]);
      announce(
        `${option.label} added. ${itemCount(currentValueRef.current.length)} selected.`,
      );
      focusAfterTransfer('available', index);
    },
    [announce, commit, focusAfterTransfer],
  );

  const removeOption = useCallback(
    (option: TransferListOption<T>, index: number) => {
      if (option.isDisabled) {
        return;
      }
      commit(currentValueRef.current.filter(item => item !== option.value));
      announce(
        `${option.label} removed. ${itemCount(currentValueRef.current.length)} selected.`,
      );
      focusAfterTransfer('selected', index);
    },
    [announce, commit, focusAfterTransfer],
  );

  const addAll = useCallback(() => {
    const additions = options
      .filter(
        option =>
          !option.isDisabled && !currentValueRef.current.includes(option.value),
      )
      .map(option => option.value);
    if (additions.length > 0) {
      commit([...currentValueRef.current, ...additions]);
      announce(`${itemCount(additions.length)} added.`);
    }
  }, [announce, commit, options]);

  const clearSelected = useCallback(() => {
    const nextValue = currentValueRef.current.filter(optionValue => {
      const option = optionByValue.get(optionValue);
      return option == null || option.isDisabled;
    });
    const removed = currentValueRef.current.length - nextValue.length;
    if (removed > 0) {
      commit(nextValue);
      announce(`${itemCount(removed)} removed.`);
    }
  }, [announce, commit, optionByValue]);

  const movableRange = useCallback(
    (optionValue: T, orderedValue: readonly T[]) => {
      const index = orderedValue.indexOf(optionValue);
      let start = 0;
      let end = orderedValue.length - 1;
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        const option = optionByValue.get(orderedValue[cursor] as T);
        if (option == null || option.isDisabled) {
          start = cursor + 1;
          break;
        }
      }
      for (let cursor = index + 1; cursor < orderedValue.length; cursor += 1) {
        const option = optionByValue.get(orderedValue[cursor] as T);
        if (option == null || option.isDisabled) {
          end = cursor - 1;
          break;
        }
      }
      return {index, start, end};
    },
    [optionByValue],
  );

  const moveOption = useCallback(
    (optionValue: T, requestedIndex: number) => {
      const nextValue = [...currentValueRef.current];
      const {index, start, end} = movableRange(optionValue, nextValue);
      if (index < 0) {
        return false;
      }
      const target = Math.max(start, Math.min(end, requestedIndex));
      if (target === index) {
        return false;
      }
      nextValue.splice(index, 1);
      nextValue.splice(target, 0, optionValue);
      commit(nextValue);
      return true;
    },
    [commit, movableRange],
  );

  const beginReorder = useCallback(
    (
      option: TransferListOption<T>,
      mode: 'keyboard' | 'pointer',
      pointerGeometry?: PointerGeometry,
    ) => {
      if (option.isDisabled || !isReorderable) {
        return;
      }
      const index = currentValueRef.current.indexOf(option.value);
      if (index < 0 || (mode === 'pointer' && pointerGeometry == null)) {
        return;
      }
      setReorderSession({
        value: option.value,
        label: option.label,
        mode,
        originalValue: [...currentValueRef.current],
        fromIndex: index,
        toIndex: index,
        ...pointerGeometry,
        hasPointerMoved: false,
      });
      if (mode === 'keyboard') {
        announce(
          `${option.label} picked up, position ${index + 1} of ${currentValueRef.current.length}. Use arrow keys to move, Space or Enter to drop, or Escape to cancel.`,
        );
      }
    },
    [announce, isReorderable, setReorderSession],
  );

  const finishReorder = useCallback(
    (cancelled: boolean) => {
      const session = reorderSessionRef.current;
      if (!session) {
        return;
      }
      if (session.mode === 'pointer') {
        if (cancelled || !session.hasPointerMoved) {
          setReorderSession(null);
          if (cancelled) {
            announce(`${session.label} move cancelled.`);
          }
          return;
        }
        const hasChanged = session.fromIndex !== session.toIndex;
        const nextValue = moveItem(
          session.originalValue,
          session.fromIndex,
          session.toIndex,
        );
        flushSync(() => setReorderSession(null));
        if (hasChanged) {
          animateControlledUpdate(() => commit(nextValue));
          announce(
            `${session.label} dropped at position ${session.toIndex + 1} of ${session.originalValue.length}.`,
          );
        } else {
          announce(
            `${session.label} returned to position ${session.fromIndex + 1}.`,
          );
        }
        return;
      }
      if (cancelled) {
        commit(session.originalValue);
        announce(`${session.label} move cancelled.`);
      } else {
        const index = currentValueRef.current.indexOf(session.value);
        announce(
          `${session.label} dropped at position ${index + 1} of ${currentValueRef.current.length}.`,
        );
      }
      setReorderSession(null);
    },
    [announce, commit, setReorderSession],
  );

  const handleReorderClick = useCallback(
    (option: TransferListOption<T>) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      if (reorderSessionRef.current?.value === option.value) {
        finishReorder(false);
      } else {
        beginReorder(option, 'keyboard');
      }
    },
    [beginReorder, finishReorder],
  );

  const handleReorderKeyDown = useCallback(
    (
      event: ReactKeyboardEvent<HTMLButtonElement>,
      option: TransferListOption<T>,
    ) => {
      const session = reorderSessionRef.current;
      if (session?.value !== option.value || session.mode !== 'keyboard') {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        finishReorder(true);
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        finishReorder(false);
        return;
      }
      const {index, start, end} = movableRange(
        option.value,
        currentValueRef.current,
      );
      const targets: Record<string, number> = {
        ArrowUp: index - 1,
        ArrowDown: index + 1,
        Home: start,
        End: end,
      };
      const target = targets[event.key];
      if (target == null) {
        return;
      }
      event.preventDefault();
      if (moveOption(option.value, target)) {
        const nextIndex = currentValueRef.current.indexOf(option.value);
        announce(
          `${option.label}, position ${nextIndex + 1} of ${currentValueRef.current.length}.`,
        );
      }
    },
    [announce, finishReorder, movableRange, moveOption],
  );

  const handlePointerDown = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      option: TransferListOption<T>,
    ) => {
      if (event.button !== 0) {
        return;
      }
      const sourceRow = selectedRowRefs.current.get(option.value);
      if (sourceRow == null) {
        return;
      }
      const bounds = sourceRow.getBoundingClientRect();
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      beginReorder(option, 'pointer', {
        pointerId: event.pointerId,
        pointerStartX: event.clientX,
        pointerStartY: event.clientY,
        pointerOffsetX: event.clientX - bounds.left,
        pointerOffsetY: event.clientY - bounds.top,
        pointerClientX: event.clientX,
        pointerClientY: event.clientY,
        previewWidth: bounds.width,
      });
    },
    [beginReorder],
  );

  const handlePointerMove = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      option: TransferListOption<T>,
    ) => {
      const session = reorderSessionRef.current;
      if (
        session?.value !== option.value ||
        session.mode !== 'pointer' ||
        session.pointerId !== event.pointerId
      ) {
        return;
      }
      const horizontalDistance =
        event.clientX - (session.pointerStartX ?? event.clientX);
      const verticalDistance =
        event.clientY - (session.pointerStartY ?? event.clientY);
      const hasCrossedThreshold =
        session.hasPointerMoved ||
        Math.hypot(horizontalDistance, verticalDistance) >= 5;
      let targetIndex = session.fromIndex;
      if (hasCrossedThreshold) {
        event.preventDefault();
        const {start, end} = movableRange(session.value, session.originalValue);
        const remainingValues = session.originalValue.filter(
          optionValue => optionValue !== session.value,
        );
        const candidates = session.originalValue
          .map((optionValue, originalIndex) => ({optionValue, originalIndex}))
          .filter(
            candidate =>
              candidate.optionValue !== session.value &&
              candidate.originalIndex >= start &&
              candidate.originalIndex <= end,
          )
          .map(candidate => ({
            row: selectedRowRefs.current.get(candidate.optionValue),
            targetIndex: remainingValues.indexOf(candidate.optionValue),
          }))
          .filter(
            (candidate): candidate is {row: HTMLElement; targetIndex: number} =>
              candidate.row != null,
          );
        if (candidates.length > 0) {
          targetIndex = candidates[candidates.length - 1].targetIndex + 1;
          for (const candidate of candidates) {
            const bounds = candidate.row.getBoundingClientRect();
            if (event.clientY < bounds.top + bounds.height / 2) {
              targetIndex = candidate.targetIndex;
              break;
            }
          }
          targetIndex = Math.max(start, Math.min(end, targetIndex));
        }
      }
      const nextSession = {
        ...session,
        pointerClientX: event.clientX,
        pointerClientY: event.clientY,
        hasPointerMoved: hasCrossedThreshold,
        toIndex: targetIndex,
      };
      setReorderSession(nextSession);
      if (hasCrossedThreshold && session.toIndex !== targetIndex) {
        announce(
          `${option.label}, position ${targetIndex + 1} of ${session.originalValue.length}.`,
        );
      }
    },
    [announce, movableRange, setReorderSession],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
      const session = reorderSessionRef.current;
      if (
        session?.mode !== 'pointer' ||
        session.pointerId !== event.pointerId
      ) {
        return;
      }
      if (cancelled) {
        suppressClickRef.current = false;
      } else {
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
      finishReorder(cancelled);
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
    },
    [finishReorder],
  );

  const handleSearch = useCallback(
    (nextQuery: string) => {
      setQuery(nextQuery);
      const normalized = nextQuery.trim().toLocaleLowerCase();
      if (normalized === '') {
        announce('');
      } else {
        const count = options.filter(option =>
          matchesQuery(option, normalized),
        ).length;
        announce(`${itemCount(count)} found.`);
      }
    },
    [announce, options],
  );

  const optionActions = (
    option: TransferListOption<T>,
    side: 'selected' | 'available',
    index: number,
  ) => {
    const disabledReason = option.disabledMessage ?? 'This item is locked';
    if (option.isDisabled) {
      return (
        <Text
          type="supporting"
          color="secondary"
          maxLines={1}
          xstyle={styles.disabledReason}>
          {disabledReason}
        </Text>
      );
    }
    if (side === 'available') {
      return (
        <IconButton
          label={`Add ${option.label}`}
          icon={<Plus size={16} strokeWidth={1.5} aria-hidden />}
          size="sm"
          variant="ghost"
          data-transfer-list-action="available"
          onClick={() => addOption(option, index)}
        />
      );
    }
    return (
      <IconButton
        label={`Remove ${option.label}`}
        icon={<X size={16} strokeWidth={1.5} aria-hidden />}
        size="sm"
        variant="ghost"
        data-transfer-list-action="selected"
        onClick={() => removeOption(option, index)}
      />
    );
  };

  const dragPreviewPosition =
    reorderSession?.mode === 'pointer' &&
    reorderSession.pointerClientX != null &&
    reorderSession.pointerClientY != null &&
    reorderSession.pointerOffsetX != null &&
    reorderSession.pointerOffsetY != null &&
    reorderSession.previewWidth != null
      ? {
          x: reorderSession.pointerClientX - reorderSession.pointerOffsetX,
          y: reorderSession.pointerClientY - reorderSession.pointerOffsetY,
          width: reorderSession.previewWidth,
        }
      : null;

  const reorderControl = (option: TransferListOption<T>) => {
    if (!isReorderable || option.isDisabled) {
      return undefined;
    }
    const active = reorderSession?.value === option.value;
    return (
      <IconButton
        label={`Reorder ${option.label}`}
        aria-describedby={reorderInstructionsId}
        aria-pressed={active}
        icon={<GripVertical size={16} strokeWidth={1.5} aria-hidden />}
        size="sm"
        variant="ghost"
        xstyle={[reorderStyles.handle, active && reorderStyles.handleActive]}
        onClick={() => handleReorderClick(option)}
        onKeyDown={event => handleReorderKeyDown(event, option)}
        onPointerDown={event => handlePointerDown(event, option)}
        onPointerMove={event => handlePointerMove(event, option)}
        onPointerUp={event => handlePointerEnd(event, false)}
        onPointerCancel={event => handlePointerEnd(event, true)}
        onLostPointerCapture={event => {
          const session = reorderSessionRef.current;
          if (
            session?.mode === 'pointer' &&
            session.pointerId === event.pointerId
          ) {
            suppressClickRef.current = false;
            finishReorder(true);
          }
        }}
      />
    );
  };

  const transferItem = (
    option: TransferListOption<T>,
    side: 'selected' | 'available',
    index: number,
  ) => {
    const active = reorderSession?.value === option.value;
    const isPointerSource = active && reorderSession?.mode === 'pointer';
    const dropPosition =
      pointerPlacement?.value === option.value
        ? pointerPlacement.position
        : null;
    const orderedIndex = currentValueRef.current.indexOf(option.value);
    return (
      <Item
        key={option.value}
        as="li"
        ref={node => {
          if (side !== 'selected') {
            return;
          }
          if (node == null) {
            selectedRowRefs.current.delete(option.value);
          } else {
            selectedRowRefs.current.set(option.value, node);
          }
        }}
        density="compact"
        startContent={side === 'selected' ? reorderControl(option) : undefined}
        label={renderOption?.(option) ?? option.label}
        endContent={optionActions(option, side, index)}
        xstyle={[
          styles.item,
          side === 'selected' &&
            dynamicStyles.rowTransition(transitionName(labelId, option.value)),
          active && reorderSession?.mode === 'keyboard' && styles.draggingItem,
          isPointerSource && reorderStyles.source,
          dropPosition === 'before' && reorderStyles.dropBefore,
          dropPosition === 'after' && reorderStyles.dropAfter,
        ]}
        data-transfer-list-row={side === 'selected' ? option.value : undefined}
        data-transfer-list-reorder-source={isPointerSource || undefined}
        data-transfer-list-drop-target={dropPosition ?? undefined}
        data-transfer-list-index={
          side === 'selected' ? String(orderedIndex) : undefined
        }
        {...themeProps('transfer-list-item', {
          side,
          state: option.isDisabled
            ? 'disabled'
            : active
              ? 'reordering'
              : 'enabled',
        })}
      />
    );
  };

  const describedBy =
    [ariaDescribedBy, description != null ? descriptionId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      {...restProps}
      {...mergeProps(
        themeProps('transfer-list'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      role={role ?? 'group'}
      aria-labelledby={ariaLabelledBy ?? labelId}
      aria-describedby={describedBy}>
      <div {...stylex.props(styles.heading)}>
        {isLabelHidden ? (
          <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
        ) : (
          <Text id={labelId} type="label" display="block">
            {label}
          </Text>
        )}
        {description != null && (
          <Text id={descriptionId} type="supporting" display="block">
            {description}
          </Text>
        )}
      </div>

      {(hasSearch || onReset != null) && (
        <div {...stylex.props(styles.controls)}>
          {hasSearch && (
            <TextInput
              ref={searchRef}
              role="searchbox"
              label={searchLabel ?? `Search ${label}`}
              isLabelHidden
              value={query}
              placeholder={searchPlaceholder}
              startIcon={<Icon icon="search" size="sm" color="secondary" />}
              hasClear
              width="100%"
              xstyle={styles.search}
              onChange={handleSearch}
            />
          )}
          {onReset != null && (
            <Button label="Reset" size="sm" variant="ghost" onClick={onReset} />
          )}
        </div>
      )}

      <VisuallyHidden id={reorderInstructionsId}>
        Press Space or Enter to pick up an item. Use Arrow Up, Arrow Down, Home,
        or End to move it. Press Space or Enter to drop, or Escape to cancel.
      </VisuallyHidden>

      <div
        {...mergeProps(
          themeProps('transfer-list-collection'),
          stylex.props(styles.panels),
        )}>
        <div
          ref={selectedPanelRef}
          role="group"
          aria-labelledby={selectedHeadingId}
          tabIndex={-1}
          {...mergeProps(
            themeProps('transfer-list-panel', {side: 'selected'}),
            stylex.props(styles.panel),
          )}>
          <div {...stylex.props(styles.panelHeader)}>
            <Text id={selectedHeadingId} type="label">
              {selectedLabel}
            </Text>
            {hasClear && (
              <Button
                label="Clear"
                size="sm"
                variant="ghost"
                xstyle={styles.headerAction}
                data-transfer-list-header-action="true"
                isDisabled={
                  !value.some(
                    optionValue => !optionByValue.get(optionValue)?.isDisabled,
                  )
                }
                onClick={clearSelected}
              />
            )}
          </div>
          <div {...stylex.props(styles.panelBody)}>
            {selectedOptions.length > 0 ? (
              <List
                density="compact"
                header={<VisuallyHidden>{selectedLabel}</VisuallyHidden>}>
                {selectedOptions.map((option, index) =>
                  transferItem(option, 'selected', index),
                )}
              </List>
            ) : (
              <div {...stylex.props(styles.empty)}>
                <Text type="supporting" color="secondary">
                  {normalizedQuery === '' ? selectedEmptyText : noResultsText}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div
          ref={availablePanelRef}
          role="group"
          aria-labelledby={availableHeadingId}
          tabIndex={-1}
          {...mergeProps(
            themeProps('transfer-list-panel', {side: 'available'}),
            stylex.props(styles.panel, styles.panelDivider),
          )}>
          <div {...stylex.props(styles.panelHeader)}>
            <Text id={availableHeadingId} type="label">
              {availableLabel}
            </Text>
            {hasSelectAll && (
              <Button
                label="Add all"
                size="sm"
                variant="ghost"
                xstyle={styles.headerAction}
                data-transfer-list-header-action="true"
                isDisabled={
                  !options.some(
                    option =>
                      !option.isDisabled &&
                      !currentValueRef.current.includes(option.value),
                  )
                }
                onClick={addAll}
              />
            )}
          </div>
          <div {...stylex.props(styles.panelBody)}>
            {availableOptions.length > 0 ? (
              <List
                density="compact"
                header={<VisuallyHidden>{availableLabel}</VisuallyHidden>}>
                {groupedAvailable.map(([group, groupOptions]) => (
                  <Fragment key={group || 'ungrouped'}>
                    {(group !== '' || groupedAvailable.length > 1) && (
                      <li
                        role="presentation"
                        {...stylex.props(styles.groupHeading)}>
                        <Text type="supporting" weight="semibold">
                          {group || 'Other'}
                        </Text>
                      </li>
                    )}
                    {groupOptions.map(option =>
                      transferItem(
                        option,
                        'available',
                        availableOptions.indexOf(option),
                      ),
                    )}
                  </Fragment>
                ))}
              </List>
            ) : (
              <div {...stylex.props(styles.empty)}>
                <Text type="supporting" color="secondary">
                  {normalizedQuery === '' ? availableEmptyText : noResultsText}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
      {dragPreviewPosition != null && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={dragPreviewRef}
              aria-hidden="true"
              data-transfer-list-drag-preview=""
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
    </div>
  );
}

TransferList.displayName = 'TransferList';
