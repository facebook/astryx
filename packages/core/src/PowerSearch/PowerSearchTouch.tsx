// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PowerSearchTouch.tsx
 * @input PowerSearchConfig, filters, onChange — the PowerSearch props, unchanged
 * @output Private coarse-pointer surface: in-field filter actions plus a
 *   bottom-sheet filter builder
 * @position Internal PowerSearch surface selected by PowerSearch on coarse pointers
 *
 * PowerSearch's desktop shape is a typeahead that drops a popover under the
 * field, and an edit popover that lays field / operator / value out in a row.
 * Neither survives a phone: the popover fights the on-screen keyboard, and the
 * row has nowhere to go at 390px. This variant keeps the same props, the same
 * filter model, and the same tokens, and moves the building into a bottom sheet
 * that drills down field -> (operator) -> value.
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
  InputClearButton,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {Heading} from '../Heading';
import {Icon, renderIconSlot} from '../Icon';
import {List, ListItem} from '../List';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {useSize} from '../SizeContext/SizeContext';
import {useAnnounce} from '../hooks/useAnnounce';
import {useDevWarning} from '../hooks/useDevWarning';
import {useTooltip} from '../Tooltip';
import {useTranslator} from '../i18n';
import {
  borderVars,
  colorVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {isRenderable, mergeProps} from '../utils';
import {rtlStyles} from '../utils/rtlStyles';
import {themeProps} from '../utils/themeProps';
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
    flexWrap: 'wrap',
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
    rowGap: `calc(${spacingVars['--spacing-1']} - 1px)`,
  },
  startIconWithTokens: {
    marginInlineStart: `calc(${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px)`,
  },
  // The trigger grows to fill the row so the field's empty space is the tap
  // target, not dead pixels next to one.
  trigger: {
    appearance: 'none',
    flexGrow: 1,
    flexBasis: 0,
    minWidth: sizeVars['--size-element-lg'],
    display: 'flex',
    alignItems: 'center',
    minHeight: spacingVars['--spacing-11'],
    paddingBlock: 0,
    paddingInline: spacingVars['--spacing-1'],
    margin: 0,
    borderWidth: 0,
    borderRadius: 'var(--_field-radius)',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    // Matches the text size the fine-pointer input renders at, including the
    // coarse-pointer floor that prevents iOS Safari zoom.
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    textAlign: 'start',
    cursor: {default: 'pointer', ':disabled': 'not-allowed'},
    outline: 'none',
  },
  triggerReadOnly: {
    cursor: 'default',
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
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
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

type SheetStep = 'fields' | 'operator' | 'value';

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
  if (
    filters[draft.filterIndex] != null &&
    filterSignature(filters[draft.filterIndex]) === draft.sourceSignature
  ) {
    return draft.filterIndex;
  }
  const movedIdentityIndex = filters.indexOf(draft.sourceFilter);
  if (movedIdentityIndex >= 0) {
    return movedIdentityIndex;
  }
  const matchingIndices = filters.flatMap((filter, index) =>
    filterSignature(filter) === draft.sourceSignature ? [index] : [],
  );
  return matchingIndices.length === 1 ? matchingIndices[0] : null;
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
 * Private coarse-pointer surface for PowerSearch. Active filters stay in the
 * field as tokens, followed by an “Add filters…” button. A bottom sheet builds
 * or edits one filter at a time.
 *
 * Tapping the field opens a pinned-tall sheet listing the available fields.
 * Choosing one opens its value editor; a field with more than one operator
 * shows the operator as a row that drills into its own list. Tapping a token
 * reopens that filter's editor, where Delete removes it.
 */
export function PowerSearchTouchSurface({
  config: configProp,
  filters,
  onChange,
  label: labelFromProps,
  isLabelHidden = true,
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

  const label = labelFromProps ?? t('@astryx.powersearch.label');
  const saveButtonLabel =
    saveButtonLabelFromProps ?? t('@astryx.powersearch.editor.apply');
  const addFilterLabel = t('@astryx.powersearch.mobile.addFilter');

  const triggerId = useId();
  const labelId = useId();
  const statusMessageId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreTriggerAfterCloseRef = useRef(false);

  const [step, setStep] = useState<SheetStep | null>(null);
  // The draft outlives a step change on purpose: the switcher keeps the
  // outgoing sheet mounted while the incoming one enters, and clearing the
  // draft with the step would blank that sheet mid-transition.
  const [draft, setDraft] = useState<FilterDraft | null>(null);
  const [fieldQuery, setFieldQuery] = useState('');

  const isInteractive = !isDisabled && !isReadOnly;

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
        closeSheet();
        return;
      }
      if (next.mode === 'edit') {
        const filterIndex = resolveDraftFilterIndex(filters, next);
        if (filterIndex == null) {
          closeSheet();
          return;
        }
        const currentFilter = filters[filterIndex];
        if (currentFilter == null || currentFilter.isReadOnly) {
          closeSheet();
          return;
        }
        // Controlled parents may reorder after any edit, which remounts the
        // index-keyed opener before the sheet can restore focus. Always provide
        // the stable Add button as the post-close fallback.
        shouldRestoreTriggerAfterCloseRef.current = true;
        const updated = [...filters];
        updated[filterIndex] = filter;
        onChange(updated, 'edit', filterIndex);
      } else {
        onChange([...filters, filter], 'add', filters.length);
      }
      closeSheet();
    },
    [closeSheet, filters, isInteractive, onChange],
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

  // Choosing a field opens its editor. An `empty` operator (`is unassigned`)
  // has nothing to edit, so it lands as a filter straight away — the same
  // shortcut the desktop tokenizer takes.
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
      };
      if (operator.value.type === 'empty') {
        setDraft(next);
        commitFilter(next, {type: 'empty'});
        return;
      }
      setDraft(next);
      setStep('value');
    },
    [config, commitFilter],
  );

  const handleTokenClick = useCallback(
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
    (index: number, restoreFocus = true) => {
      const filter = filters[index];
      if (!isInteractive || filter == null || filter.isReadOnly) {
        return;
      }
      onChange(
        filters.filter((_, i) => i !== index),
        'remove',
        index,
      );
      if (restoreFocus) {
        requestAnimationFrame(() =>
          triggerRef.current?.focus({preventScroll: true}),
        );
      }
    },
    [filters, isInteractive, onChange],
  );

  const handleClearAll = useCallback(() => {
    // Read-only filters are the consumer's, not the user's, so a clear-all
    // leaves them in place — matching the desktop token, which has no remove.
    const kept = filters.filter(filter => filter.isReadOnly);
    if (kept.length === filters.length) {
      return;
    }
    onChange(kept, 'remove', kept.length);
    requestAnimationFrame(() =>
      triggerRef.current?.focus({preventScroll: true}),
    );
  }, [filters, onChange]);

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
        value: keepsValue ? draft.value : undefined,
      };
      setDraft(next);
      if (operator.value.type === 'empty') {
        commitFilter(next, {type: 'empty'});
        return;
      }
      setStep('value');
    },
    [commitFilter, draft],
  );

  const handleDraftValueChange = useCallback((value: FilterValue) => {
    setDraft(current => (current == null ? current : {...current, value}));
  }, []);

  const handleDraftValueCommit = useCallback(
    (value: FilterValue) => {
      if (draft == null) {
        return;
      }
      setDraft({...draft, value});
      commitFilter(draft, value);
    },
    [draft, commitFilter],
  );

  const handleApply = useCallback(() => {
    if (draft?.value == null) {
      return;
    }
    commitFilter(draft, draft.value);
  }, [draft, commitFilter]);

  const handleDelete = useCallback(() => {
    if (draft?.mode !== 'edit') {
      return;
    }
    const filterIndex = resolveDraftFilterIndex(filters, draft);
    if (filterIndex == null || filters[filterIndex]?.isReadOnly) {
      closeSheet();
      return;
    }
    shouldRestoreTriggerAfterCloseRef.current = true;
    handleRemoveFilter(filterIndex, false);
    closeSheet();
  }, [closeSheet, draft, filters, handleRemoveFilter]);

  const handleActiveSheetChange = useCallback((active: string | null) => {
    // The switcher only reports null, and only for a dismissal the active
    // sheet allows. Every step change goes through the handlers above.
    if (active == null) {
      setStep(null);
    }
  }, []);

  const handleSheetTransitionEnd = useCallback(() => {
    if (step != null || !shouldRestoreTriggerAfterCloseRef.current) {
      return;
    }
    shouldRestoreTriggerAfterCloseRef.current = false;
    requestAnimationFrame(() =>
      triggerRef.current?.focus({preventScroll: true}),
    );
  }, [step]);

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
    // There is no typeahead input to focus on this variant; the tap target is
    // the control the label names, so the handle moves focus there.
    focusTypeahead() {
      triggerRef.current?.focus();
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

  const announce = useAnnounce();
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

  const triggerDescribedBy =
    [
      status?.message ? statusMessageId : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // ---------------------------------------------------------------- render --

  const tokens = filters.map((filter, index) => {
    const field = config.getField(filter.field);
    const operator = config.getOperator(filter.field, filter.operator);
    if (!field || !operator) {
      return null;
    }
    const canInteract = isInteractive && !filter.isReadOnly;
    const onClick = canInteract ? () => handleTokenClick(index) : undefined;
    const onRemove = canInteract ? () => handleRemoveFilter(index) : undefined;
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
          onClick={onClick}
          onRemove={onRemove}
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
        onClick={onClick}
        onRemove={onRemove}
        isDisabled={isDisabled}
      />
    );
  });

  const hasRemovableFilter = filters.some(filter => !filter.isReadOnly);
  const isClearShown = hasClear && hasRemovableFilter && isInteractive;

  const EditorOverride =
    draftOperator != null
      ? componentOverrides?.[draftOperator.value.type]?.Editor
      : undefined;

  const editorTitle =
    draft?.mode === 'edit'
      ? t('@astryx.powersearch.mobile.editFilter')
      : (draftField?.label ?? addFilterLabel);

  // Only when the operator is not already spelled out by its own drill-down
  // row, so the sheet never says the same thing twice.
  const editorOperatorHint =
    draftOperator != null && draftOperators.length <= 1
      ? resolveOperatorLabel(draftOperator, t)
      : '';

  const isApplyDisabled = draft?.operator == null || draft.value == null;
  const isValueCommittedOnTap = draftOperator?.value.type === 'enum';
  const isEditorFooterShown =
    !isReadOnly && (draft?.mode === 'edit' || !isValueCommittedOnTap);

  return (
    <>
      <Field
        ref={ref}
        label={label}
        isLabelHidden={isLabelHidden}
        // The tap target is one control among the tokens rather than the only
        // control in the field, so the label names the GROUP (a `<label>` can
        // only name a single control, and pointing it at the button would
        // override the button's own visible text as its accessible name).
        inputID={triggerId}
        labelID={labelId}
        isGroupLabel
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
          ref={disabledMessageTooltip.ref}
          role="group"
          aria-labelledby={labelId}
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
            onClick={openFieldList}
            // A disabled button is unreachable, so the reason for it is too.
            // Keep it focusable and block the action instead, the way the
            // desktop field does.
            disabled={isDisabled && !showsDisabledMessage}
            aria-disabled={isDisabled || isReadOnly ? true : undefined}
            aria-haspopup="dialog"
            aria-expanded={step != null}
            aria-describedby={triggerDescribedBy}
            {...stylex.props(
              styles.trigger,
              isReadOnly && styles.triggerReadOnly,
            )}>
            {addFilterLabel}
          </button>
          {(endContent || isRenderable(resultCountText) || isClearShown) && (
            <div {...stylex.props(styles.endSection)}>
              {isRenderable(resultCountText) && (
                <span {...stylex.props(styles.resultCount)}>
                  {resultCountText}
                </span>
              )}
              {endContent}
              {isClearShown && (
                <InputClearButton
                  label={t('@astryx.tokenizer.clearAll')}
                  onClick={handleClearAll}
                />
              )}
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
        <BottomSheet sheetId="fields" label={addFilterLabel} height="tall">
          <div {...stylex.props(styles.sheet)}>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerRow)}>
                <div {...stylex.props(styles.headerText)}>
                  <Heading level={3}>{addFilterLabel}</Heading>
                </div>
                <Button
                  label={t('@astryx.powersearch.editor.cancel')}
                  variant="ghost"
                  size="sm"
                  onClick={closeSheet}
                />
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
                        field={field}
                        operatorLabel={fieldOperatorHint(config, field, t)}
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
          sheetId="operator"
          label={t('@astryx.powersearch.editor.operator')}
          height="tall"
          purpose="form">
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
                  onClick={() => setStep('value')}
                />
                <div {...stylex.props(styles.headerText)}>
                  <Heading level={3}>
                    {draftField?.label ??
                      t('@astryx.powersearch.editor.operator')}
                  </Heading>
                  <Text type="supporting" color="secondary">
                    {t('@astryx.powersearch.editor.operator')}
                  </Text>
                </div>
              </div>
            </div>
            <div {...stylex.props(styles.body)}>
              <List hasDividers density="spacious" xstyle={styles.flushList}>
                {draftOperators.map(operator => {
                  const isSelected = operator.key === draft?.operator;
                  return (
                    <ListItem
                      key={operator.key}
                      label={resolveOperatorLabel(operator, t)}
                      isSelected={isSelected}
                      endContent={
                        isSelected ? (
                          <Icon icon="check" size="sm" color="accent" />
                        ) : undefined
                      }
                      onClick={() => handleOperatorSelect(operator)}
                    />
                  );
                })}
              </List>
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
                {draft?.mode === 'create' && (
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
                    onClick={() => setStep('fields')}
                  />
                )}
                <div {...stylex.props(styles.headerText)}>
                  <Heading level={3}>{editorTitle}</Heading>
                  {/* With one operator there is no drill-down row to show it,
                      so the header carries it: the sheet reads "Author / is"
                      rather than naming a column and offering a bare input. */}
                  {editorOperatorHint !== '' && (
                    <Text type="supporting" color="secondary">
                      {editorOperatorHint}
                    </Text>
                  )}
                </div>
                {draft?.mode === 'edit' && (
                  <Button
                    label={t('@astryx.powersearch.editor.cancel')}
                    variant="ghost"
                    size="sm"
                    onClick={closeSheet}
                  />
                )}
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
                          closeSheet();
                        }
                        return;
                      }
                      commitSavedFilter(draft, saved);
                    }}
                    onCancel={closeSheet}
                    saveButtonLabel={saveButtonLabel}
                    isReadOnly={isReadOnly}
                    timezoneID={timezoneID}
                  />
                </div>
              ) : (
                <>
                  <div {...stylex.props(styles.body)}>
                    {draftOperators.length > 1 && (
                      <List
                        hasDividers
                        density="spacious"
                        xstyle={styles.flushList}>
                        <ListItem
                          label={t('@astryx.powersearch.editor.operator')}
                          description={resolveOperatorLabel(draftOperator, t)}
                          endContent={
                            <Icon
                              icon="chevronRight"
                              size="sm"
                              color="secondary"
                              xstyle={rtlStyles.mirror}
                            />
                          }
                          isDisabled={isReadOnly}
                          onClick={() => setStep('operator')}
                        />
                      </List>
                    )}
                    <PowerSearchTouchValueEditor
                      key={`${draft.field}-${draft.operator}`}
                      config={config}
                      operatorValue={draftOperator.value}
                      filterValue={draft.value}
                      onChange={handleDraftValueChange}
                      onCommit={handleDraftValueCommit}
                      isDisabled={isReadOnly}
                      maxMenuItems={maxOperatorMenuItems}
                      timezoneID={timezoneID}
                    />
                  </div>
                  {isEditorFooterShown && (
                    <div {...stylex.props(styles.footer)}>
                      {draft.mode === 'edit' && (
                        <Button
                          label={t('@astryx.powersearch.editor.delete')}
                          variant="ghost"
                          onClick={handleDelete}
                        />
                      )}
                      {!isValueCommittedOnTap && (
                        <div
                          {...stylex.props(
                            styles.footerActions,
                            draft.mode !== 'edit' && styles.footerSoleAction,
                          )}>
                          <Button
                            label={saveButtonLabel}
                            variant="primary"
                            isDisabled={isApplyDisabled}
                            onClick={handleApply}
                            width={draft.mode === 'edit' ? undefined : '100%'}
                          />
                        </div>
                      )}
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
  operatorLabel,
  onSelect,
}: {
  field: PowerSearchField;
  operatorLabel: string | undefined;
  onSelect: (field: PowerSearchField) => void;
}): ReactNode {
  return (
    <ListItem
      label={field.label}
      description={field.description ?? operatorLabel}
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

/**
 * The default operator's label, shown under a field name so the row says what
 * choosing it will produce ("Status" / "is") rather than just naming a column.
 */
function fieldOperatorHint(
  config: ReturnType<typeof useInternalConfig>,
  field: PowerSearchField,
  t: ReturnType<typeof useTranslator>,
): string | undefined {
  const preferred = config.getDefaultOperator(field.key);
  const operator =
    preferred && isSupportedOperator(preferred)
      ? preferred
      : field.operators.find(isSupportedOperator);
  if (operator == null) {
    return undefined;
  }
  return resolveOperatorLabel(operator, t) || undefined;
}
