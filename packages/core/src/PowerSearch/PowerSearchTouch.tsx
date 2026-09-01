// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PowerSearchTouch.tsx
 * @input PowerSearchConfig, filters, onChange — the PowerSearch props, unchanged
 * @output Private coarse-pointer surface: inline content search, in-field filter
 *   actions, and a bottom-sheet filter builder
 * @position Internal PowerSearch surface selected by PowerSearch on coarse pointers
 *
 * PowerSearch's desktop shape is a typeahead that drops a popover under the
 * field, and an edit popover that lays field / operator / value out in a row.
 * Neither survives a phone: the popover fights the on-screen keyboard, and the
 * row has nowhere to go at 390px. This variant keeps the same props, the same
 * filter model, and the same tokens. A configured content-search field remains
 * a direct input in the outer field, while structured filter building moves into
 * a bottom sheet that drills down field -> (operator) -> value.
 *
 * The sheets are pinned tall on purpose. The field list resizes as it is
 * searched and the editor's content changes with the operator, so a sheet that
 * sized itself to its content would jump on every keystroke and every step.
 * A tall sheet is also the only height that gives mobile-keyboard
 * accommodation, which the text and number value editors need.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/PowerSearch.doc.mjs
 * - /packages/core/src/PowerSearch/PowerSearchTouch.test.tsx
 * - /apps/storybook/stories/PowerSearch.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/PowerSearch/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BottomSheet, BottomSheetSwitcher} from '../BottomSheet';
import {Button} from '../Button';
import {
  Field,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {Heading} from '../Heading';
import {Icon, renderIconSlot} from '../Icon';
import {IconButton} from '../IconButton';
import {List, ListItem} from '../List';
import {RadioList, RadioListItem} from '../RadioList';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {useSize} from '../SizeContext/SizeContext';
import {useAnnounce} from '../hooks/useAnnounce';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {useDevWarning} from '../hooks/useDevWarning';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useTooltip} from '../Tooltip';
import {useLocale, useTranslator} from '../i18n';
import {
  colorVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {isImeKeyEvent, isRenderable, mergeProps} from '../utils';
import {rtlStyles} from '../utils/rtlStyles';
import {themeProps} from '../utils/themeProps';
import {formatFilterValue} from './formatFilterValue';
import {PowerSearchTouchValueEditor} from './PowerSearchTouchValueEditor';
import {PowerSearchToken} from './PowerSearchToken';
import {resolveOperatorLabel} from './resolveOperatorLabel';
import {useInternalConfig} from './useInternalConfig';
import type {PowerSearchProps} from './PowerSearch';
import type {
  FilterValue,
  PowerSearchField,
  PowerSearchFilter,
  PowerSearchOperator,
} from './types';

// =============================================================================
// Props
// =============================================================================

/**
 * PowerSearch uses this component internally on coarse pointers. It keeps the
 * same props, filter model, and token rendering while replacing pointer-oriented
 * popovers with a bottom-sheet flow.
 */
type PowerSearchTouchProps = PowerSearchProps;

// =============================================================================
// Styles
// =============================================================================

const sizeStyles = stylex.create({
  sm: {
    minHeight: `max(${sizeVars['--size-element-sm']}, ${spacingVars['--spacing-11']})`,
  },
  md: {
    minHeight: `max(${sizeVars['--size-element-md']}, ${spacingVars['--spacing-11']})`,
  },
  lg: {
    minHeight: `max(${sizeVars['--size-element-lg']}, ${spacingVars['--spacing-11']})`,
  },
});

const styles = stylex.create({
  // Mirrors Tokenizer's wrapper so the tap target is visually the same field
  // the desktop variant renders, down to the concentric token inset.
  wrapper: {
    position: 'relative',
    flexWrap: 'nowrap',
    gap: spacingVars['--spacing-1'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    height: 'auto',
  },
  wrapperWithTokens: {
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    paddingInline: `calc(${spacingVars['--spacing-1']} - 1px)`,
  },
  contentSection: {
    minWidth: 0,
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacingVars['--spacing-1'],
    rowGap: `calc(${spacingVars['--spacing-1']} - 1px)`,
  },
  startIconWithTokens: {
    marginInlineStart: `calc(${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px)`,
  },
  // The only tab stop in the touch field. It stays visually borderless while
  // the wrapper delegates taps from tokens and empty space to it.
  trigger: {
    appearance: 'none',
    flex: '1 1 40px',
    minWidth: '40px',
    minHeight: spacingVars['--spacing-11'],
    display: 'flex',
    alignItems: 'center',
    paddingBlock: 0,
    paddingInline: spacingVars['--spacing-1'],
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    textAlign: 'start',
    whiteSpace: 'nowrap',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    outline: 'none',
  },
  rowActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  touchAction: {
    minHeight: spacingVars['--spacing-11'],
  },
  touchIconAction: {
    minWidth: spacingVars['--spacing-11'],
    minHeight: spacingVars['--spacing-11'],
  },
  endSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    paddingInlineEnd: spacingVars['--spacing-1'],
  },
  resultCount: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
  },
  // --- sheet shell ---------------------------------------------------------
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  header: {
    position: 'sticky',
    insetBlockStart: 0,
    // Deliberately 0, not a higher layer: the sheet's grab handle is an
    // absolutely positioned sibling at z-index 1, and anything above that
    // paints the pill out. 0 still lifts the header over the in-flow rows
    // scrolling beneath it.
    zIndex: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    // Clears the sheet's floating grab handle, which occupies the top 24px.
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  headerText: {
    minWidth: 0,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    // Separates the operator row from the value control below it, so the two
    // read as different questions rather than one long list.
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  footer: {
    position: 'sticky',
    insetBlockEnd: 0,
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
  },
  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    marginInlineStart: 'auto',
  },
  // Alone in the footer, the confirm button takes the whole row — the reach
  // target a thumb expects at the bottom of a sheet.
  footerSoleAction: {
    flexGrow: 1,
  },
  // Rows run edge to edge inside the sheet's padded body.
  flushList: {
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
  },
  empty: {
    paddingBlock: spacingVars['--spacing-6'],
    textAlign: 'center',
  },
});

// =============================================================================
// Draft state
// =============================================================================

type SheetStep = 'manage' | 'fields' | 'value';

type PendingSheetFocus =
  | {readonly type: 'manager-add'}
  | {
      readonly type: 'manager-filter';
      readonly sourceFilter: PowerSearchFilter;
      readonly sourceSignature: string;
      readonly preferredIndex: number;
    }
  | {readonly type: 'field'; readonly fieldKey: string};

interface FilterDraft {
  readonly mode: 'create' | 'edit';
  /** Index in `filters` when edit mode opened. */
  readonly filterIndex?: number;
  /** Original controlled filter identity, used to follow immutable reorders. */
  readonly sourceFilter?: PowerSearchFilter;
  /** Structural snapshot, used when controlled parents clone their values. */
  readonly sourceSignature?: string;
  readonly field: string;
  readonly operator?: string;
  readonly value?: FilterValue;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }
  if (value != null && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
}

function filterSignature(filter: PowerSearchFilter): string {
  return stableSerialize({
    field: filter.field,
    operator: filter.operator,
    value: filter.value,
    isReadOnly: filter.isReadOnly ?? false,
  });
}

function resolveFilterIdentityIndex(
  filters: ReadonlyArray<PowerSearchFilter>,
  sourceFilter: PowerSearchFilter,
  sourceSignature: string,
  preferredIndex: number,
): number | null {
  const identityIndex = filters.indexOf(sourceFilter);
  if (identityIndex >= 0) {
    return identityIndex;
  }
  if (
    filters[preferredIndex] != null &&
    filterSignature(filters[preferredIndex]) === sourceSignature
  ) {
    return preferredIndex;
  }
  const matchingIndices = filters.flatMap((filter, index) =>
    filterSignature(filter) === sourceSignature ? [index] : [],
  );
  return matchingIndices.length === 1 ? matchingIndices[0] : null;
}

function resolveDraftFilterIndex(
  filters: ReadonlyArray<PowerSearchFilter>,
  draft: FilterDraft,
): number | null {
  if (
    draft.mode !== 'edit' ||
    draft.filterIndex == null ||
    draft.sourceFilter == null ||
    draft.sourceSignature == null
  ) {
    return null;
  }
  return resolveFilterIdentityIndex(
    filters,
    draft.sourceFilter,
    draft.sourceSignature,
    draft.filterIndex,
  );
}

/** Operators the touch editor can render. */
function isSupportedOperator(operator: PowerSearchOperator): boolean {
  // Nested filter groups are a desktop-density affordance: the desktop editor
  // gives them a dedicated recursive row layout that has no touch equivalent
  // yet, and the shared value editor renders nothing for them. Offering the
  // field and then showing a blank sheet is worse than leaving it out.
  return operator.value.type !== 'nested';
}

function matchesQuery(field: PowerSearchField, query: string): boolean {
  if (query === '') {
    return true;
  }
  if (field.label.toLowerCase().includes(query)) {
    return true;
  }
  return (
    field.typeaheadAliases?.some(alias =>
      alias.toLowerCase().includes(query),
    ) ?? false
  );
}

// Below this many fields a search box is noise: the whole list is already on
// screen. It is the same threshold CheckboxList uses to send a long list to
// MultiSelector.
const SEARCHABLE_FIELD_COUNT = 8;
const DEFAULT_MAX_SEARCH_RESULTS = 10;

// =============================================================================
// Component
// =============================================================================

/**
 * Private coarse-pointer surface for PowerSearch. The outer field keeps active
 * filters as display-only capsules and acts as one sheet trigger. The first sheet
 * centralizes content search plus add, edit, clear, and per-filter removal.
 *
 * Each selected-filter row opens its value editor, while a separate remove
 * button leaves the management sheet open. Add filter drills into the field
 * picker and then the existing value editor. Save always returns to management.
 */
export function PowerSearchTouchSurface({
  config: configProp,
  filters,
  onChange,
  label: labelFromProps,
  isLabelHidden = true,
  placeholder: placeholderFromProps,
  hasAutoFocus = false,
  hasClear = true,
  isReadOnly = false,
  isDisabled = false,
  disabledMessage,
  startIcon,
  onFocus,
  onBlur,
  status,
  statusVariant = 'attached',
  maxTokenLength = 40,
  maxOperatorMenuItems,
  maxSearchResults = DEFAULT_MAX_SEARCH_RESULTS,
  popoverSaveButtonLabel: saveButtonLabelFromProps,
  timezoneID,
  endContent,
  resultCount,
  ref,
  handleRef,
  size: sizeProp,
  'data-testid': testId,
  xstyle,
  className,
  style,
  components: componentOverrides,
}: PowerSearchTouchProps) {
  const size = useSize(sizeProp, 'md');
  const config = useInternalConfig(configProp);
  const t = useTranslator();
  const locale = useLocale();

  const searchLabel = labelFromProps ?? t('@astryx.powersearch.label');
  const triggerLabel =
    labelFromProps ?? t('@astryx.powersearch.mobile.manageFiltersTrigger');
  const fieldPlaceholder =
    placeholderFromProps ??
    t('@astryx.powersearch.mobile.manageFiltersPlaceholder');
  const contentSearchPlaceholder =
    placeholderFromProps ?? t('@astryx.powersearch.placeholder');
  const saveButtonLabel =
    saveButtonLabelFromProps ?? t('@astryx.powersearch.mobile.save');
  const addFilterTitle = t('@astryx.powersearch.mobile.addFilterTitle');
  const manageFiltersTitle = t('@astryx.powersearch.mobile.manageFiltersTitle');
  const announce = useAnnounce();

  const contentSearchFieldKey = config.config.contentSearchFieldKey;
  const contentSearchField =
    contentSearchFieldKey == null
      ? undefined
      : config.getField(contentSearchFieldKey);
  const contentSearchOperator =
    contentSearchFieldKey == null
      ? undefined
      : config.getDefaultOperator(contentSearchFieldKey);
  const hasContentSearch = contentSearchOperator?.value.type === 'string';

  const triggerId = useId();
  const statusMessageId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const managerAddButtonRef = useRef<HTMLButtonElement>(null);
  const managerRowsRef = useRef(new Map<number, HTMLLIElement>());
  const fieldRowsRef = useRef(new Map<string, HTMLLIElement>());
  const latestFiltersRef = useRef(filters);
  const pendingSheetFocusRef = useRef<PendingSheetFocus | null>(null);
  const pendingMutationFocusRef = useRef(false);
  const shouldRestoreTriggerAfterCloseRef = useRef(false);

  const [step, setStep] = useState<SheetStep | null>(null);
  // The draft outlives a step change on purpose: the switcher keeps the
  // outgoing sheet mounted while the incoming one enters, and clearing the
  // draft with the step would blank that sheet mid-transition.
  const [draft, setDraft] = useState<FilterDraft | null>(null);
  const [fieldQuery, setFieldQuery] = useState('');
  const [contentQuery, setContentQuery] = useState('');

  const isInteractive = !isDisabled && !isReadOnly;

  const focusPrimaryControl = useCallback((preventScroll = false) => {
    triggerRef.current?.focus(
      preventScroll ? {preventScroll: true} : undefined,
    );
  }, []);

  const focusPendingSheetTarget = useCallback(() => {
    const target = pendingSheetFocusRef.current;
    if (target == null) {
      return;
    }
    pendingSheetFocusRef.current = null;
    requestAnimationFrame(() => {
      if (target.type === 'manager-add') {
        managerAddButtonRef.current?.focus({preventScroll: true});
        return;
      }
      if (target.type === 'field') {
        fieldRowsRef.current
          .get(target.fieldKey)
          ?.querySelector<HTMLButtonElement>('button')
          ?.focus({preventScroll: true});
        return;
      }
      const index = resolveFilterIdentityIndex(
        latestFiltersRef.current,
        target.sourceFilter,
        target.sourceSignature,
        target.preferredIndex,
      );
      const rowButton =
        index == null
          ? null
          : managerRowsRef.current
              .get(index)
              ?.querySelector<HTMLButtonElement>('button');
      (rowButton ?? managerAddButtonRef.current)?.focus({preventScroll: true});
    });
  }, []);

  useEffect(() => {
    latestFiltersRef.current = filters;
    if (step === 'manage' && pendingMutationFocusRef.current) {
      pendingMutationFocusRef.current = false;
      focusPendingSheetTarget();
    }
  }, [filters, focusPendingSheetTarget, step]);

  const queueManagerAddFocus = useCallback((afterMutation = false) => {
    pendingSheetFocusRef.current = {type: 'manager-add'};
    pendingMutationFocusRef.current = afterMutation;
  }, []);

  const submitContentSearch = useCallback((): boolean => {
    const value = contentQuery.trim();
    if (
      !isInteractive ||
      value === '' ||
      contentSearchField == null ||
      contentSearchOperator == null
    ) {
      return false;
    }
    const nextFilter: PowerSearchFilter = {
      field: contentSearchField.key,
      operator: contentSearchOperator.key,
      value: {type: 'string', value},
    };
    onChange([...filters, nextFilter], 'add', filters.length);
    setContentQuery('');
    announce(t('@astryx.tokenizer.tokenAdded', {label: value}));
    return true;
  }, [
    announce,
    contentQuery,
    contentSearchField,
    contentSearchOperator,
    filters,
    isInteractive,
    onChange,
    t,
  ]);

  const handleContentSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isImeKeyEvent(event.nativeEvent)) {
        return;
      }
      if (event.key === 'Enter' && submitContentSearch()) {
        event.preventDefault();
      }
    },
    [submitContentSearch],
  );

  // ---------------------------------------------------------------- fields --

  const fields = useMemo(
    () =>
      config
        .getVisibleFields()
        .filter(field => field.operators.some(isSupportedOperator)),
    [config],
  );

  const droppedFieldCount = config.getVisibleFields().length - fields.length;
  useDevWarning(
    'PowerSearch',
    `${droppedFieldCount} field(s) were left out of the touch filter list because every operator they define has a 'nested' value type, which the bottom-sheet editor cannot edit yet. Give those fields a non-nested operator to make them available on coarse pointers.`,
    droppedFieldCount > 0,
  );

  const normalizedQuery = fieldQuery.trim().toLowerCase();
  const matchingFields = useMemo(() => {
    const matches = fields.filter(field =>
      matchesQuery(field, normalizedQuery),
    );
    return normalizedQuery === ''
      ? matches
      : matches.slice(0, maxSearchResults);
  }, [fields, maxSearchResults, normalizedQuery]);

  const groupedFields = useMemo(() => {
    const groups = new Map<string, PowerSearchField[]>();
    for (const field of matchingFields) {
      const key = field.group ?? '';
      const existing = groups.get(key);
      if (existing) {
        existing.push(field);
      } else {
        groups.set(key, [field]);
      }
    }
    return [...groups.entries()];
  }, [matchingFields]);

  const isFieldSearchShown = fields.length >= SEARCHABLE_FIELD_COUNT;

  // ----------------------------------------------------------------- draft --

  const draftField = draft ? config.getField(draft.field) : undefined;
  const draftOperator =
    draft?.operator != null
      ? config.getOperator(draft.field, draft.operator)
      : undefined;
  const draftOperators = useMemo(
    () =>
      draft
        ? config.getVisibleOperators(draft.field).filter(isSupportedOperator)
        : [],
    [config, draft],
  );

  const closeSheet = useCallback(() => {
    setStep(null);
  }, []);

  const openManager = useCallback(() => {
    if (isDisabled) {
      return;
    }
    shouldRestoreTriggerAfterCloseRef.current = true;
    setStep('manage');
  }, [isDisabled]);

  const clickableWrapper = useClickableContainer({
    containerRef: wrapperRef,
    onClick: openManager,
    disabled: isDisabled,
  });

  const openFieldList = useCallback(() => {
    if (!isInteractive) {
      return;
    }
    setFieldQuery('');
    setStep('fields');
  }, [isInteractive]);

  const commitSavedFilter = useCallback(
    (next: FilterDraft, filter: PowerSearchFilter) => {
      if (!isInteractive) {
        pendingSheetFocusRef.current = {type: 'manager-add'};
        setStep('manage');
        return;
      }
      if (next.mode === 'edit') {
        const filterIndex = resolveDraftFilterIndex(filters, next);
        if (filterIndex == null) {
          pendingSheetFocusRef.current = {type: 'manager-add'};
          setStep('manage');
          return;
        }
        const currentFilter = filters[filterIndex];
        if (currentFilter == null || currentFilter.isReadOnly) {
          pendingSheetFocusRef.current = {type: 'manager-add'};
          setStep('manage');
          return;
        }
        pendingSheetFocusRef.current = {
          type: 'manager-filter',
          sourceFilter: filter,
          sourceSignature: filterSignature(filter),
          preferredIndex: filterIndex,
        };
        const updated = [...filters];
        updated[filterIndex] = filter;
        onChange(updated, 'edit', filterIndex);
      } else {
        pendingSheetFocusRef.current = {type: 'manager-add'};
        onChange([...filters, filter], 'add', filters.length);
      }
      setStep('manage');
    },
    [filters, isInteractive, onChange],
  );

  const commitFilter = useCallback(
    (next: FilterDraft, value: FilterValue) => {
      if (next.operator == null) {
        return;
      }
      commitSavedFilter(next, {
        field: next.field,
        operator: next.operator,
        value,
      });
    },
    [commitSavedFilter],
  );

  // Choosing a field opens its editor. Empty-value operators still stage their
  // sentinel value so every filter is confirmed through the same Save action.
  const handleFieldSelect = useCallback(
    (field: PowerSearchField) => {
      const operators = field.operators.filter(isSupportedOperator);
      const preferred = config.getDefaultOperator(field.key);
      const operator =
        preferred && isSupportedOperator(preferred) ? preferred : operators[0];
      if (operator == null) {
        return;
      }
      const next: FilterDraft = {
        mode: 'create',
        field: field.key,
        operator: operator.key,
        value: operator.value.type === 'empty' ? {type: 'empty'} : undefined,
      };
      setDraft(next);
      setStep('value');
    },
    [config],
  );

  const handleFilterEdit = useCallback(
    (index: number) => {
      if (!isInteractive) {
        return;
      }
      const filter = filters[index];
      if (filter.isReadOnly) {
        return;
      }
      setDraft({
        mode: 'edit',
        filterIndex: index,
        sourceFilter: filter,
        sourceSignature: filterSignature(filter),
        field: filter.field,
        operator: filter.operator,
        value: filter.value,
      });
      setStep('value');
    },
    [filters, isInteractive],
  );

  const handleRemoveFilter = useCallback(
    (index: number) => {
      const filter = filters[index];
      if (!isInteractive || filter == null || filter.isReadOnly) {
        return;
      }
      const nextFilters = filters.filter((_, i) => i !== index);
      const editableIndices = nextFilters.flatMap(
        (candidate, candidateIndex) =>
          candidate.isReadOnly ? [] : [candidateIndex],
      );
      const nextIndex =
        editableIndices.find(candidateIndex => candidateIndex >= index) ??
        editableIndices.at(-1);
      if (nextIndex == null) {
        pendingSheetFocusRef.current = {type: 'manager-add'};
      } else {
        const nextFilter = nextFilters[nextIndex];
        pendingSheetFocusRef.current = {
          type: 'manager-filter',
          sourceFilter: nextFilter,
          sourceSignature: filterSignature(nextFilter),
          preferredIndex: nextIndex,
        };
      }
      pendingMutationFocusRef.current = step === 'manage';
      onChange(nextFilters, 'remove', index);
    },
    [filters, isInteractive, onChange, step],
  );

  const handleClearAll = useCallback(() => {
    // Read-only filters are the consumer's, not the user's, so a clear-all
    // leaves them in place — matching the desktop token, which has no remove.
    const kept = filters.filter(filter => filter.isReadOnly);
    const firstRemovedIndex = filters.findIndex(filter => !filter.isReadOnly);
    if (firstRemovedIndex < 0) {
      return;
    }
    queueManagerAddFocus(true);
    onChange(kept, 'remove', firstRemovedIndex);
  }, [filters, onChange, queueManagerAddFocus]);

  const handleOperatorSelect = useCallback(
    (operator: PowerSearchOperator) => {
      if (draft == null) {
        return;
      }
      // A value only survives an operator change when the new operator reads
      // the same value type; otherwise the editor would receive a value it
      // cannot render.
      const keepsValue =
        draft.value != null && draft.value.type === operator.value.type;
      const next: FilterDraft = {
        ...draft,
        operator: operator.key,
        value:
          operator.value.type === 'empty'
            ? {type: 'empty'}
            : keepsValue
              ? draft.value
              : undefined,
      };
      setDraft(next);
    },
    [draft],
  );

  const handleDraftValueChange = useCallback((value: FilterValue) => {
    setDraft(current => (current == null ? current : {...current, value}));
  }, []);

  const handleSave = useCallback(() => {
    if (draft?.value == null) {
      return;
    }
    commitFilter(draft, draft.value);
  }, [draft, commitFilter]);

  const returnFromValue = useCallback(() => {
    if (draft == null) {
      return;
    }
    if (
      draft.mode === 'edit' &&
      draft.sourceFilter != null &&
      draft.sourceSignature != null &&
      draft.filterIndex != null
    ) {
      pendingSheetFocusRef.current = {
        type: 'manager-filter',
        sourceFilter: draft.sourceFilter,
        sourceSignature: draft.sourceSignature,
        preferredIndex:
          resolveDraftFilterIndex(filters, draft) ?? draft.filterIndex,
      };
      setStep('manage');
      return;
    }
    pendingSheetFocusRef.current = {type: 'field', fieldKey: draft.field};
    setStep('fields');
  }, [draft, filters]);

  const handleDelete = useCallback(() => {
    if (draft?.mode !== 'edit') {
      return;
    }
    const filterIndex = resolveDraftFilterIndex(filters, draft);
    if (filterIndex == null || filters[filterIndex]?.isReadOnly) {
      pendingSheetFocusRef.current = {type: 'manager-add'};
      setStep('manage');
      return;
    }
    handleRemoveFilter(filterIndex);
    setStep('manage');
  }, [draft, filters, handleRemoveFilter]);

  const handleActiveSheetChange = useCallback((active: string | null) => {
    // The switcher only reports null, and only for a dismissal the active
    // sheet allows. Every step change goes through the handlers above.
    if (active == null) {
      setStep(null);
    }
  }, []);

  const handleSheetTransitionEnd = useCallback(() => {
    if (step != null) {
      focusPendingSheetTarget();
      return;
    }
    if (!shouldRestoreTriggerAfterCloseRef.current) {
      return;
    }
    shouldRestoreTriggerAfterCloseRef.current = false;
    requestAnimationFrame(() => focusPrimaryControl(true));
  }, [focusPendingSheetTarget, focusPrimaryControl, step]);

  const handleFocusWithin = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !event.currentTarget.contains(event.relatedTarget)
      ) {
        onFocus?.(event);
      }
    },
    [onFocus],
  );
  const handleBlurWithin = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !event.currentTarget.contains(event.relatedTarget)
      ) {
        onBlur?.(event);
      }
    },
    [onBlur],
  );

  // ------------------------------------------------------------- imperative --

  useImperativeHandle(handleRef, () => ({
    focusTypeahead() {
      focusPrimaryControl();
    },
    blurTypeahead() {
      triggerRef.current?.blur();
    },
  }));

  // ----------------------------------------------------------- result count --

  const resultCountText = useMemo((): string | null => {
    if (resultCount == null) {
      return null;
    }
    if (typeof resultCount === 'number') {
      return t('@astryx.powersearch.resultCount', {count: resultCount});
    }
    return resultCount;
  }, [resultCount, t]);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (resultCountText != null) {
      announce(resultCountText);
    }
  }, [resultCountText, announce]);

  // --------------------------------------------------------------- tooltip --

  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });
  const mergedWrapperRef = useMergedRefs(
    wrapperRef,
    disabledMessageTooltip.ref,
  );

  const triggerDescribedBy =
    [
      status?.message ? statusMessageId : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // ---------------------------------------------------------------- render --

  const filterRows = filters.flatMap((filter, index) => {
    const field = config.getField(filter.field);
    const operator = config.getOperator(filter.field, filter.operator);
    if (!field || !operator) {
      return [];
    }
    const operatorLabel = resolveOperatorLabel(operator, t);
    const label = [field.label, operatorLabel].filter(Boolean).join(' ');
    const value = formatFilterValue(
      config,
      operator.value,
      filter.value,
      Number.MAX_SAFE_INTEGER,
      t,
      locale,
      timezoneID,
    );
    const accessibleLabel = [label, value].filter(Boolean).join(' ');
    return [
      {
        accessibleLabel,
        filter,
        index,
        key: `${index}-${filter.field}-${filter.operator}`,
      },
    ];
  });

  const tokens = filters.map((filter, index) => {
    const field = config.getField(filter.field);
    const operator = config.getOperator(filter.field, filter.operator);
    if (!field || !operator) {
      return null;
    }
    const TokenOverride = componentOverrides?.[operator.value.type]?.Token;
    const key = `${index}-${filter.field}-${filter.operator}`;

    if (TokenOverride) {
      return (
        <TokenOverride
          key={key}
          config={configProp}
          filter={filter}
          field={field}
          operator={operator}
          maxLength={maxTokenLength}
          size={size}
          onClick={undefined}
          onRemove={undefined}
          isDisabled={isDisabled}
        />
      );
    }
    return (
      <PowerSearchToken
        key={key}
        config={configProp}
        filter={filter}
        field={field}
        operator={operator}
        maxLength={maxTokenLength}
        size={size}
        onClick={undefined}
        onRemove={undefined}
        isDisabled={isDisabled}
      />
    );
  });

  const hasRemovableFilter = filters.some(filter => !filter.isReadOnly);
  const isClearAllShown = hasClear && hasRemovableFilter && isInteractive;

  const EditorOverride =
    draftOperator != null
      ? componentOverrides?.[draftOperator.value.type]?.Editor
      : undefined;

  const resolvedEditorOperatorLabel =
    draftOperator == null ? '' : resolveOperatorLabel(draftOperator, t);
  const editorTitle =
    draftField == null
      ? addFilterTitle
      : draftOperators.length <= 1 && resolvedEditorOperatorLabel !== ''
        ? t('@astryx.powersearch.mobile.filterTitle', {
            field: draftField.label,
            operator: resolvedEditorOperatorLabel,
          })
        : draftField.label;

  const isEditorDisabled = isDisabled || isReadOnly;
  const isSaveDisabled =
    isEditorDisabled || draft?.operator == null || draft.value == null;
  const isEditorFooterShown = !isReadOnly;

  return (
    <>
      <Field
        ref={ref}
        label={triggerLabel}
        isLabelHidden={isLabelHidden}
        inputID={triggerId}
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
        statusVariant={statusVariant}
        xstyle={xstyle}
        className={className}
        style={style}>
        <div
          ref={mergedWrapperRef}
          onClick={clickableWrapper.onClick}
          onMouseUp={clickableWrapper.onMouseUp}
          onFocus={handleFocusWithin}
          onBlur={handleBlurWithin}
          data-testid={testId}
          {...mergeProps(
            themeProps('power-search', {
              size,
              status: status?.type,
              disabled: isDisabled ? 'disabled' : null,
            }),
            stylex.props(
              inputWrapperStyles.base,
              styles.wrapper,
              filters.length > 0 && styles.wrapperWithTokens,
              sizeStyles[size],
              isDisabled && inputWrapperStyles.disabled,
              status && inputStatusBorderStyles[status.type],
              status &&
                !isDisabled &&
                inputStatusHoverShadowStyles[status.type],
              status && inputStatusFocusWithinStyles[status.type],
            ),
          )}>
          <div {...stylex.props(styles.contentSection)}>
            {startIcon && (
              <span
                {...stylex.props(
                  filters.length > 0 && styles.startIconWithTokens,
                )}>
                {renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
              </span>
            )}
            {tokens}
            <button
              type="button"
              id={triggerId}
              ref={triggerRef}
              autoFocus={hasAutoFocus}
              onClick={openManager}
              disabled={isDisabled && !showsDisabledMessage}
              aria-disabled={isDisabled ? true : undefined}
              aria-haspopup="dialog"
              aria-expanded={step != null}
              aria-describedby={triggerDescribedBy}
              {...stylex.props(styles.trigger)}>
              {filters.length === 0 ? fieldPlaceholder : null}
            </button>
          </div>
          {(endContent || isRenderable(resultCountText)) && (
            <div {...stylex.props(styles.endSection)}>
              {isRenderable(resultCountText) && (
                <span {...stylex.props(styles.resultCount)}>
                  {resultCountText}
                </span>
              )}
              {endContent}
            </div>
          )}
        </div>
        {showsDisabledMessage &&
          disabledMessageTooltip.renderTooltip(disabledMessage)}
      </Field>

      <BottomSheetSwitcher
        activeSheet={step}
        onActiveSheetChange={handleActiveSheetChange}
        onTransitionEnd={handleSheetTransitionEnd}>
        <BottomSheet sheetId="manage" label={manageFiltersTitle} height="tall">
          <div {...stylex.props(styles.sheet)}>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerRow)}>
                <div {...stylex.props(styles.headerText)}>
                  <Heading level={3}>{manageFiltersTitle}</Heading>
                </div>
                <Button
                  label={t('@astryx.powersearch.mobile.done')}
                  variant="ghost"
                  size="sm"
                  xstyle={styles.touchAction}
                  onClick={closeSheet}
                />
              </div>
              {hasContentSearch && isInteractive && (
                <TextInput
                  label={searchLabel}
                  isLabelHidden
                  placeholder={contentSearchPlaceholder}
                  value={contentQuery}
                  onChange={setContentQuery}
                  onKeyDown={handleContentSearchKeyDown}
                  startIcon={<Icon icon="search" size="sm" color="secondary" />}
                  hasClear
                  width="100%"
                />
              )}
            </div>
            <div {...stylex.props(styles.body)}>
              {filterRows.length === 0 ? (
                <div {...stylex.props(styles.empty)}>
                  <Text type="supporting" color="secondary">
                    {t('@astryx.powersearch.mobile.noSelectedFilters')}
                  </Text>
                </div>
              ) : (
                <List
                  hasDividers
                  density="spacious"
                  header={t('@astryx.powersearch.mobile.selectedFilters')}
                  xstyle={styles.flushList}>
                  {filterRows.map(row => {
                    const canEdit = isInteractive && !row.filter.isReadOnly;
                    const removeLabel = t(
                      '@astryx.powersearch.mobile.removeSelectedFilter',
                      {filter: row.accessibleLabel},
                    );
                    return (
                      <ListItem
                        key={row.key}
                        ref={node => {
                          if (node == null) {
                            managerRowsRef.current.delete(row.index);
                          } else {
                            managerRowsRef.current.set(row.index, node);
                          }
                        }}
                        label={row.accessibleLabel}
                        onClick={
                          canEdit
                            ? () => handleFilterEdit(row.index)
                            : undefined
                        }
                        endContent={
                          canEdit ? (
                            <span {...stylex.props(styles.rowActions)}>
                              <Icon
                                icon="chevronRight"
                                size="sm"
                                color="secondary"
                                xstyle={rtlStyles.mirror}
                              />
                              <IconButton
                                label={removeLabel}
                                tooltip={removeLabel}
                                icon={
                                  <Icon
                                    icon="close"
                                    size="sm"
                                    color="inherit"
                                  />
                                }
                                variant="ghost"
                                size="sm"
                                xstyle={styles.touchIconAction}
                                onClick={() => handleRemoveFilter(row.index)}
                              />
                            </span>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </List>
              )}
            </div>
            {isInteractive && (
              <div {...stylex.props(styles.footer)}>
                {isClearAllShown && (
                  <Button
                    label={t('@astryx.tokenizer.clearAll')}
                    variant="ghost"
                    xstyle={styles.touchAction}
                    onClick={handleClearAll}
                  />
                )}
                <div
                  {...stylex.props(
                    styles.footerActions,
                    !isClearAllShown && styles.footerSoleAction,
                  )}>
                  <Button
                    ref={managerAddButtonRef}
                    label={addFilterTitle}
                    variant="primary"
                    xstyle={styles.touchAction}
                    onClick={openFieldList}
                    width={isClearAllShown ? undefined : '100%'}
                  />
                </div>
              </div>
            )}
          </div>
        </BottomSheet>

        <BottomSheet sheetId="fields" label={addFilterTitle} height="tall">
          <div {...stylex.props(styles.sheet)}>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerRow)}>
                <Button
                  label={t('@astryx.powersearch.mobile.back')}
                  icon={
                    <Icon
                      icon="chevronLeft"
                      size="sm"
                      xstyle={rtlStyles.mirror}
                    />
                  }
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  xstyle={styles.touchIconAction}
                  onClick={() => {
                    pendingSheetFocusRef.current = {type: 'manager-add'};
                    setStep('manage');
                  }}
                />
                <div {...stylex.props(styles.headerText)}>
                  <Heading level={3}>{addFilterTitle}</Heading>
                </div>
              </div>
              {isFieldSearchShown && (
                <TextInput
                  label={t('@astryx.powersearch.mobile.searchFields')}
                  isLabelHidden
                  placeholder={t(
                    '@astryx.powersearch.mobile.searchFieldsPlaceholder',
                  )}
                  value={fieldQuery}
                  onChange={setFieldQuery}
                  startIcon={<Icon icon="search" size="sm" color="secondary" />}
                  width="100%"
                />
              )}
            </div>
            <div {...stylex.props(styles.body)}>
              {groupedFields.length === 0 ? (
                <div {...stylex.props(styles.empty)}>
                  <Text type="supporting" color="secondary">
                    {t('@astryx.powersearch.mobile.noFields')}
                  </Text>
                </div>
              ) : (
                groupedFields.map(([group, groupFields]) => (
                  <List
                    key={group}
                    hasDividers
                    density="spacious"
                    header={group === '' ? undefined : group}
                    xstyle={styles.flushList}>
                    {groupFields.map(field => (
                      <FieldRow
                        key={field.key}
                        itemRef={node => {
                          if (node == null) {
                            fieldRowsRef.current.delete(field.key);
                          } else {
                            fieldRowsRef.current.set(field.key, node);
                          }
                        }}
                        field={field}
                        onSelect={handleFieldSelect}
                      />
                    ))}
                  </List>
                ))
              )}
            </div>
          </div>
        </BottomSheet>

        <BottomSheet
          sheetId="value"
          label={editorTitle}
          height="tall"
          purpose="form">
          <div {...stylex.props(styles.sheet)}>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerRow)}>
                {draft != null && (
                  <Button
                    label={t('@astryx.powersearch.mobile.back')}
                    icon={
                      <Icon
                        icon="chevronLeft"
                        size="sm"
                        xstyle={rtlStyles.mirror}
                      />
                    }
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    xstyle={styles.touchIconAction}
                    onClick={returnFromValue}
                  />
                )}
                <div {...stylex.props(styles.headerText)}>
                  <Heading level={3} maxLines={1}>
                    {editorTitle}
                  </Heading>
                </div>
              </div>
            </div>
            {draft != null && draftField != null && draftOperator != null ? (
              EditorOverride != null ? (
                <div {...stylex.props(styles.body)}>
                  <EditorOverride
                    key={`${draft.mode}-${draft.filterIndex ?? 'new'}-${draft.field}`}
                    config={configProp}
                    filter={{
                      field: draft.field,
                      operator: draft.operator,
                      value: draft.value,
                    }}
                    mode={draft.mode}
                    onSave={saved => {
                      if (saved == null) {
                        if (draft.mode === 'edit') {
                          handleDelete();
                        } else {
                          pendingSheetFocusRef.current = {type: 'manager-add'};
                          setStep('manage');
                        }
                        return;
                      }
                      commitSavedFilter(draft, saved);
                    }}
                    onCancel={returnFromValue}
                    saveButtonLabel={saveButtonLabel}
                    isReadOnly={isEditorDisabled}
                    timezoneID={timezoneID}
                  />
                </div>
              ) : (
                <>
                  <div {...stylex.props(styles.body)}>
                    {draftOperators.length > 1 && (
                      <RadioList
                        label={t('@astryx.powersearch.editor.operator')}
                        isLabelHidden
                        value={draft.operator ?? ''}
                        onChange={operatorKey => {
                          const operator = draftOperators.find(
                            candidate => candidate.key === operatorKey,
                          );
                          if (operator != null) {
                            handleOperatorSelect(operator);
                          }
                        }}
                        isDisabled={isEditorDisabled}>
                        {draftOperators.map(operator => (
                          <RadioListItem
                            key={operator.key}
                            label={t('@astryx.powersearch.mobile.filterTitle', {
                              field: draftField.label,
                              operator: resolveOperatorLabel(operator, t),
                            })}
                            value={operator.key}
                          />
                        ))}
                      </RadioList>
                    )}
                    <PowerSearchTouchValueEditor
                      key={`${draft.field}-${draft.operator}`}
                      config={config}
                      operatorValue={draftOperator.value}
                      filterValue={draft.value}
                      onChange={handleDraftValueChange}
                      isDisabled={isEditorDisabled}
                      maxMenuItems={maxOperatorMenuItems}
                      timezoneID={timezoneID}
                    />
                  </div>
                  {isEditorFooterShown && (
                    <div {...stylex.props(styles.footer)}>
                      <div
                        {...stylex.props(
                          styles.footerActions,
                          styles.footerSoleAction,
                        )}>
                        <Button
                          label={saveButtonLabel}
                          variant="primary"
                          isDisabled={isSaveDisabled}
                          xstyle={styles.touchAction}
                          onClick={handleSave}
                          width="100%"
                        />
                      </div>
                    </div>
                  )}
                </>
              )
            ) : null}
          </div>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

PowerSearchTouchSurface.displayName = 'PowerSearchTouchSurface';

// =============================================================================
// Field row
// =============================================================================

function FieldRow({
  field,
  itemRef,
  onSelect,
}: {
  field: PowerSearchField;
  itemRef?: React.Ref<HTMLLIElement>;
  onSelect: (field: PowerSearchField) => void;
}): ReactNode {
  return (
    <ListItem
      ref={itemRef}
      label={field.label}
      startContent={field.icon}
      endContent={
        <Icon
          icon="chevronRight"
          size="sm"
          color="secondary"
          xstyle={rtlStyles.mirror}
        />
      }
      onClick={() => onSelect(field)}
    />
  );
}
