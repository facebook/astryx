// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PowerSearchBottomSheet.tsx
 * @input The field's InternalConfig, filters, onChange, the field typeahead
 *   source, and the sheet options PowerSearch forwards; BottomSheet,
 *   BottomSheetSwitcher, Button, Heading, Icon, Indicator, List, RadioList, Text,
 *   TextInput, PowerSearchValueEditor, i18n
 * @output Exports PowerSearchBottomSheet — the touch surface of
 *   `PowerSearch experimental.presentation="bottom-sheet"`: a Filters sheet
 *   with chevron rows, Add filter and sticky Clear all / Done, an Add filter
 *   sheet with grouped field rows or the content search with inline
 *   suggestions, and a value step that stages field → operator → value and
 *   confirms from its footer
 * @position Internal presentation surface of PowerSearch. Loaded on demand by
 *   PowerSearch.tsx so the popover presentation never carries it
 *   (`component:PowerSearch` PR5). The trigger lives in PowerSearch.tsx.
 *
 * The three steps are hosted in one BottomSheetSwitcher: a step change
 * replaces the active sheet in the same update, hands the scrim over, and
 * keeps focus inside the flow while the outgoing dialog fades. A standalone
 * BottomSheet's native close() would return focus to the opener after the
 * next step has already opened. A list value's Tokenizer opens its own
 * standalone sheet above the step; the switcher resets its context for the
 * step's children, so that sheet stays standalone.
 *
 * The sheets pad their own content (`padding={0}` on BottomSheet); each sheet
 * body publishes that padding as container padding so its `edge="bleed"` lists
 * run edge to edge with row text on the body's inset. The sheets are pinned
 * tall: the field list resizes as it is searched and the editor changes with
 * the operator, and only a fully expanded tall sheet gives mobile-keyboard
 * accommodation.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/PowerSearch.tsx (the trigger and the lazy host)
 * - /packages/core/src/PowerSearch/PowerSearch.spec.md (FR10–FR21, AR4–AR6, PR5)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BottomSheet} from '../BottomSheet/BottomSheet';
import {BottomSheetSwitcher} from '../BottomSheet/BottomSheetSwitcher';
import {Button} from '../Button/Button';
import {Heading} from '../Heading/Heading';
import {Icon} from '../Icon';
import {CheckboxIndicator} from '../Indicator/CheckboxIndicator';
import {RadioIndicator} from '../Indicator/RadioIndicator';
import {focusOutlineStyles, isRenderable} from '../utils';
import {containerPaddingInlineVarStyles} from '../Layout/padding.stylex';
import {List} from '../List/List';
import {ListItem} from '../List/ListItem';
import {RadioList} from '../RadioList/RadioList';
import {RadioListItem} from '../RadioList/RadioListItem';
import {Text} from '../Text/Text';
import {TextInput} from '../TextInput/TextInput';
import type {SearchSource} from '../Typeahead/types';
import {useAnnounce, type AnnounceFn} from '../hooks/useAnnounce';
import {useTranslator} from '../i18n';
import type {TranslatorFn} from '../i18n';
import {useLocale} from '../i18n/useLocale';
import {colorVars, fontWeightVars, spacingVars} from '../theme/tokens.stylex';
import {isImeKeyEvent, rtlStyles} from '../utils';
import {formatTokenValueText} from './formatTokenValue';

function resolveRelativeDateLabel(
  operatorValue: OperatorValue & {type: 'date_relative'},
  value: string,
  t: TranslatorFn,
): string {
  return (
    buildRelativeDateOptions(operatorValue, t).find(
      option => option.value === value,
    )?.label ?? value
  );
}

// A placeholder the Filters row formats `labelValue` with, then splits on, so
// the value segment can render bold inside the catalog's ordering. A private
// use code point: never part of a label or value.
const ROW_VALUE_SLOT = '\uE000';
import {
  buildRelativeDateOptions,
  PowerSearchValueEditor,
} from './PowerSearchValueEditor';
import {NestedEditor} from './PowerSearchEditPopover';
import {
  createSheetSuggestionSource,
  fieldMatchesQuery,
  filterSignature,
  isSupportedOperator,
  nearestEditableIndex,
  resolveFilterIdentityIndex,
} from './powerSearchSheetUtils';
import {resolveOperatorLabel} from './resolveOperatorLabel';
import type {InternalConfig} from './useInternalConfig';
import type {
  FilterValue,
  OperatorValue,
  PartialFilter,
  PowerSearchChangeType,
  PowerSearchComponents,
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchFilter,
  PowerSearchItem,
  PowerSearchOperator,
} from './types';

// =============================================================================
// Props
// =============================================================================

export interface PowerSearchBottomSheetProps {
  /** Whether the flow is open; the trigger in PowerSearch.tsx owns it. */
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /**
   * The field's formatted result count, announced from inside the open
   * sheet's dialog when it changes while the flow is open (AR6; `spec:AST-086`
   * FR14 routes a message by where its caller is, so the owner above the
   * sheets could not reach the dialog's region).
   */
  resultCountText?: string | null;
  /**
   * Clear all removed every filter and is closing the flow. The owner
   * announces it once the flow has fully closed and focus is back on the
   * trigger: the closing dialog stays modal through its exit, so neither its
   * region nor the page-body channel would be heard before then (AR6).
   */
  onFiltersCleared?: () => void;
  config: InternalConfig;
  /** The caller's config, handed to Editor overrides as they expect it. */
  configProp: PowerSearchConfig;
  filters: ReadonlyArray<PowerSearchFilter>;
  onChange: (
    filters: ReadonlyArray<PowerSearchFilter>,
    changeType: PowerSearchChangeType,
    index: number,
  ) => void;
  /** The field typeahead source; the content search lists its suggestions. */
  searchSource: SearchSource<PowerSearchItem>;
  /** Placeholder of the content search. */
  placeholder: string;
  isReadOnly: boolean;
  isDisabled: boolean;
  hasClear: boolean;
  maxOperatorMenuItems?: number;
  maxSearchResults: number;
  /** The caller's confirm label; the step picks a default per mode. */
  saveButtonLabel?: string;
  components?: PowerSearchComponents;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // 44px touch targets for every sheet action, without resizing inputs.
  touchAction: {
    minHeight: 44,
  },
  touchIconAction: {
    minWidth: 44,
    minHeight: 44,
  },
  // Scopes the sticky header's and footer's layer to this sheet's content:
  // the List rows are `position: relative` and come after the header, so
  // without a layer of its own the header is painted under the rows that
  // scroll beneath it. Isolating the content keeps that z-index inside it, so
  // the sheet's grab handle (z-index 1 on the panel, outside this wrapper)
  // still paints above.
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    isolation: 'isolate',
  },
  header: {
    position: 'sticky',
    insetBlockStart: 0,
    // Above the rows that scroll under it, within the isolated sheet content.
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    // Clears the sheet's floating grab handle.
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
  // The body pads the sheet's content and publishes that inline padding as
  // the container padding its lists read: with `edge="bleed"` their rows run
  // edge to edge (full-bleed dividers) while row text keeps this inset, so
  // row text, group headings and the sheet title share one edge.
  body: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  footer: {
    position: 'sticky',
    insetBlockEnd: 0,
    zIndex: 1,
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
  footerSoleAction: {
    flexGrow: 1,
  },
  empty: {
    paddingBlock: spacingVars['--spacing-6'],
    textAlign: 'center',
  },
  // The built-in nested editor's sub-filter rows collapse from one line to
  // wrapped lines under a container query on the popover's own container;
  // the sheet renders no such container, so the editor's tree root is the
  // query container here, and at phone widths the rows wrap instead of
  // running past the sheet's edge.
  nestedEditorContainer: {
    containerType: 'inline-size',
    overflow: 'hidden',
  },
  rowValue: {
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
  // Choice rows run edge to edge on the body's inset, as the List rows do
  // with `edge="bleed"`: the group reaches into the body's padding and each
  // row pads back out to it (FR17).
  choiceList: {
    display: 'flex',
    flexDirection: 'column',
    marginInlineStart: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    marginInlineEnd: 'calc(-1 * var(--container-padding-inline-end, 0px))',
    width:
      'calc(100% + var(--container-padding-inline-start, 0px) + var(--container-padding-inline-end, 0px))',
  },
  choiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    width: '100%',
    minHeight: 44,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInlineStart: 'var(--container-padding-inline-start, 0px)',
    paddingInlineEnd: 'var(--container-padding-inline-end, 0px)',
    borderWidth: 0,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: 'inherit',
    textAlign: 'start',
    cursor: {
      default: 'pointer',
      ':is([aria-disabled="true"])': 'default',
    },
  },
  // An aria-disabled row gets no system disabled paint in forced colors;
  // GrayText is the platform's disabled affordance there.
  choiceRowDisabled: {
    color: {
      default: colorVars['--color-text-secondary'],
      '@media (forced-colors: active)': 'GrayText',
    },
  },
  choiceIcon: {
    display: 'inline-flex',
    flexShrink: 0,
  },
  choiceLabel: {
    flexGrow: 1,
    minWidth: 0,
  },
  editorInput: {
    paddingBlockStart: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Draft state
// =============================================================================

type SheetStep = 'manage' | 'fields' | 'value';

type PendingSheetFocus =
  | {readonly type: 'manager-add'}
  | {readonly type: 'content-search'}
  | {
      readonly type: 'manager-filter';
      readonly sourceFilter: PowerSearchFilter;
      readonly sourceSignature: string;
      readonly preferredIndex: number;
    }
  | {readonly type: 'field'; readonly fieldKey: string};

interface FilterDraft {
  readonly mode: 'create' | 'edit';
  /** Control within the Add filter sheet that launched this draft. */
  readonly returnFocus?: 'field' | 'content-search';
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

// Below this many fields a search box is noise: the whole list is on screen.
const SEARCHABLE_FIELD_COUNT = 8;
// Empty-query browsing keeps the popover presentation's safety ceiling.
const MAX_BROWSE_MENU_ITEMS = 1000;

// =============================================================================
// Choice rows (enum, enum_list, date_relative)
// =============================================================================

/**
 * Rendered inside a step's BottomSheet so that `useAnnounce` resolves the
 * sheet's dialog as the enclosing modal (`spec:AST-086` FR14); publishes that
 * dialog's `announce` to the flow above through `onAnnounceChange` while
 * mounted. Renders nothing.
 */
function SheetAnnouncer({
  onAnnounceChange,
}: {
  onAnnounceChange: (announce: AnnounceFn | null) => void;
}) {
  const announce = useAnnounce();
  // Hands this dialog's announce function up; the cleanup withdraws it when
  // the step changes or the flow closes.
  useEffect(() => {
    onAnnounceChange(announce);
    return () => {
      onAnnounceChange(null);
    };
  }, [announce, onAnnounceChange]);
  return null;
}

interface ChoiceItem {
  readonly value: string;
  readonly label: string;
  readonly icon?: ReactNode;
}

/**
 * Closed vocabularies render as full-width rows with a trailing check instead
 * of the popover presentation's Selector or Tokenizer: a dropdown layer inside
 * a sheet stacks a second overlay on a surface the person is already inside.
 */
function ChoiceRows({
  items,
  selected,
  isDisabled,
  isMultiple,
  label,
  onToggle,
}: {
  items: ReadonlyArray<ChoiceItem>;
  selected: ReadonlySet<string>;
  isDisabled?: boolean;
  /** `enum_list`: checkbox rows that toggle. Otherwise radio rows. */
  isMultiple: boolean;
  /** The group's accessible name: the field label. */
  label: string;
  onToggle: (value: string, isSelected: boolean) => void;
}) {
  // The rows carry their state as state, not as a name suffix: `radio` rows
  // in a `radiogroup` for a single choice, `checkbox` rows in a `group` for
  // `enum_list`, each with `aria-checked`, as the Tokenizer's sheet rows do
  // (`component:PowerSearch` FR17, AR5). Disabled rows stay focusable with
  // `aria-disabled` (`spec:AST-085` FR1).
  //
  // Keyboard: a radio group is one tab stop — the checked row, else the
  // first — and the arrow keys move focus and check the row they land on,
  // wrapping; Home and End move to and check the first and last row. Space
  // and Enter check the focused radio row and toggle a checkbox row: each row
  // is a native `button`, whose activation fires `onClick` for both keys
  // (`spec:AST-020` FR15).
  const groupRef = useRef<HTMLDivElement>(null);
  const checkedIndex = items.findIndex(item => selected.has(item.value));
  const tabStopIndex = checkedIndex === -1 ? 0 : checkedIndex;
  const handleRadioKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const nextIndexFor = (key: string): number | null => {
      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          return (index + 1) % items.length;
        case 'ArrowUp':
        case 'ArrowLeft':
          return (index - 1 + items.length) % items.length;
        case 'Home':
          return 0;
        case 'End':
          return items.length - 1;
        default:
          return null;
      }
    };
    const next = nextIndexFor(event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    const rows =
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    rows?.[next]?.focus();
    if (!isDisabled) {
      const target = items[next];
      onToggle(target.value, selected.has(target.value));
    }
  };
  return (
    <div
      ref={groupRef}
      role={isMultiple ? 'group' : 'radiogroup'}
      aria-label={label}
      {...stylex.props(styles.choiceList)}>
      {items.map((item, index) => {
        const isSelected = selected.has(item.value);
        return (
          <button
            key={item.value}
            type="button"
            role={isMultiple ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            aria-disabled={isDisabled || undefined}
            tabIndex={isMultiple || index === tabStopIndex ? 0 : -1}
            onKeyDown={
              isMultiple ? undefined : event => handleRadioKeyDown(event, index)
            }
            onClick={() => {
              if (!isDisabled) {
                onToggle(item.value, isSelected);
              }
            }}
            {...stylex.props(
              focusOutlineStyles.focusVisible,
              styles.choiceRow,
              isDisabled && styles.choiceRowDisabled,
            )}>
            {isRenderable(item.icon) && (
              <span aria-hidden="true" {...stylex.props(styles.choiceIcon)}>
                {item.icon}
              </span>
            )}
            <Text
              type="body"
              color={isDisabled ? 'inherit' : undefined}
              xstyle={styles.choiceLabel}>
              {item.label}
            </Text>
            {isMultiple ? (
              <CheckboxIndicator
                state={isSelected ? 'checked' : 'unchecked'}
                size="md"
                isDisabled={isDisabled}
              />
            ) : (
              <RadioIndicator
                state={isSelected ? 'checked' : 'unchecked'}
                size="md"
                isDisabled={isDisabled}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The value control for one filter inside the value step. Closed vocabularies
 * are rows here; every other type is the popover presentation's own editor in
 * its sheet presentation (`component:PowerSearch` FR17).
 */
function SheetValueEditor({
  operatorValue,
  filterValue,
  onChange,
  onUnstage,
  config,
  fieldLabel,
  isDisabled,
  maxMenuItems,
}: {
  operatorValue: OperatorValue;
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  onUnstage: () => void;
  config: InternalConfig;
  fieldLabel: string;
  isDisabled: boolean;
  maxMenuItems?: number;
}) {
  const t = useTranslator();
  const selectedValues = useMemo<ReadonlySet<string>>(() => {
    if (filterValue?.type === 'enum' || filterValue?.type === 'date_relative') {
      return new Set([filterValue.value]);
    }
    if (filterValue?.type === 'enum_list') {
      return new Set(filterValue.value);
    }
    return new Set();
  }, [filterValue]);

  switch (operatorValue.type) {
    case 'empty':
    case 'nested':
      return null;
    case 'enum':
      return (
        <ChoiceRows
          items={operatorValue.values}
          selected={selectedValues}
          isDisabled={isDisabled}
          isMultiple={false}
          label={fieldLabel}
          onToggle={value => onChange({type: 'enum', value})}
        />
      );
    case 'enum_list':
      return (
        <ChoiceRows
          items={operatorValue.values}
          selected={selectedValues}
          isDisabled={isDisabled}
          isMultiple
          label={fieldLabel}
          onToggle={(value, isSelected) => {
            const existing =
              filterValue?.type === 'enum_list' ? filterValue.value : [];
            onChange({
              type: 'enum_list',
              value: isSelected
                ? existing.filter(v => v !== value)
                : [...existing, value],
            });
          }}
        />
      );
    case 'date_relative':
      return (
        <ChoiceRows
          items={buildRelativeDateOptions(operatorValue, t)}
          selected={selectedValues}
          isDisabled={isDisabled}
          isMultiple={false}
          label={fieldLabel}
          onToggle={value => onChange({type: 'date_relative', value})}
        />
      );
    case 'string':
    case 'string_list':
    case 'integer':
    case 'float':
    case 'time':
    case 'date_absolute':
    case 'date_range':
    case 'entity_list':
    case 'custom':
      return (
        <div {...stylex.props(styles.editorInput)}>
          <PowerSearchValueEditor
            operatorValue={operatorValue}
            filterValue={filterValue}
            onChange={onChange}
            onUnstage={onUnstage}
            config={config}
            maxMenuItems={maxMenuItems}
            isDisabled={isDisabled}
            presentation="bottom-sheet"
            fieldLabel={fieldLabel}
          />
        </div>
      );
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * The sheet flow of PowerSearch's touch presentation: Filters, Add filter,
 * and the value step, in one BottomSheetSwitcher.
 */
export function PowerSearchBottomSheet({
  isOpen,
  onOpenChange,
  resultCountText,
  onFiltersCleared,
  config,
  configProp,
  filters,
  onChange,
  searchSource,
  placeholder,
  isReadOnly,
  isDisabled,
  hasClear,
  maxOperatorMenuItems,
  maxSearchResults,
  saveButtonLabel: saveButtonLabelFromProps,
  components: componentOverrides,
}: PowerSearchBottomSheetProps) {
  const t = useTranslator();
  const locale = useLocale();
  const isInteractive = !isDisabled && !isReadOnly;

  const contentSearchFieldKey = config.config.contentSearchFieldKey;
  const contentSearchOperator =
    contentSearchFieldKey == null
      ? undefined
      : config.getDefaultOperator(contentSearchFieldKey);
  const hasContentSearch = contentSearchOperator?.value.type === 'string';
  const suggestionSource = useMemo(
    () => createSheetSuggestionSource(config, searchSource),
    [config, searchSource],
  );

  const contentResultsId = useId();
  const managerAddButtonRef = useRef<HTMLButtonElement>(null);
  const contentSearchRef = useRef<HTMLDivElement>(null);
  const contentSuggestionListRef = useRef<HTMLUListElement>(null);
  const managerRowsRef = useRef(new Map<number, HTMLLIElement>());
  const fieldRowsRef = useRef(new Map<string, HTMLLIElement>());
  const fieldPickerOriginRef = useRef<'manage' | 'trigger'>('manage');
  const latestFiltersRef = useRef(filters);
  const pendingSheetFocusRef = useRef<PendingSheetFocus | null>(null);
  const pendingMutationFocusRef = useRef(false);

  // The step an open starts on: Add filter directly when an interactive field
  // has nothing to manage yet, otherwise Filters (`component:PowerSearch`
  // FR12, FR13).
  const entryStep = useCallback((): SheetStep => {
    if (filters.length === 0 && isInteractive) {
      fieldPickerOriginRef.current = 'trigger';
      pendingSheetFocusRef.current = hasContentSearch
        ? {type: 'content-search'}
        : null;
      return 'fields';
    }
    fieldPickerOriginRef.current = 'manage';
    return 'manage';
  }, [filters.length, hasContentSearch, isInteractive]);

  const [step, setStep] = useState<SheetStep | null>(() =>
    isOpen ? entryStep() : null,
  );
  // The draft outlives a step change on purpose: the switcher keeps the
  // outgoing sheet mounted while the incoming one enters, and clearing the
  // draft with the step would blank that sheet mid-transition.
  const [draft, setDraft] = useState<FilterDraft | null>(null);
  const [fieldQuery, setFieldQuery] = useState('');
  const [contentQuery, setContentQuery] = useState('');

  // `useAnnounce` delivers inside the open Astryx modal that encloses its
  // caller (`spec:AST-086` FR14), and this component renders above the
  // sheets, so it cannot call the hook itself. Each step's body renders a
  // `SheetAnnouncer` inside its BottomSheet, which publishes the dialog's own
  // `announce` here while that step is the active one; the effects below
  // speak through it, so every message about a sheet's content is delivered
  // in that sheet's dialog (AR6).
  const announceRef = useRef<AnnounceFn | null>(null);
  const handleAnnounceChange = useCallback((next: AnnounceFn | null) => {
    announceRef.current = next;
  }, []);
  const announce = useCallback((message: string) => {
    announceRef.current?.(message);
  }, []);
  const pendingAnnouncementRef = useRef<string | null>(null);

  // The controlled `isOpen` opens and closes the flow; the step follows it in
  // the render that sees the change, not an effect, so the switcher receives
  // the entry step in the same commit as the open (React's adjust-state-on-
  // prop-change pattern). Closing from outside — the field became disabled —
  // ends the flow wherever it was.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setFieldQuery('');
      setContentQuery('');
      setStep(entryStep());
    } else {
      setStep(null);
    }
  }

  const closeFlow = useCallback(() => {
    setStep(null);
    onOpenChange(false);
  }, [onOpenChange]);

  // ------------------------------------------------------------------ focus --

  const focusPendingSheetTarget = useCallback(() => {
    const target = pendingSheetFocusRef.current;
    if (target == null) {
      return;
    }
    pendingSheetFocusRef.current = null;
    if (target.type === 'manager-add') {
      managerAddButtonRef.current?.focus({preventScroll: true});
      return;
    }
    if (target.type === 'content-search') {
      contentSearchRef.current
        ?.querySelector<HTMLInputElement>('input')
        ?.focus({preventScroll: true});
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
  }, []);

  // Both Effects move focus inside the entering sheet — the external system
  // is the document's focus — to the control the step named
  // (`component:PowerSearch` FR16). They run after the entering sheet's own
  // panel focus (child effects commit first), so the intended control wins,
  // and they acquire nothing, so they need no cleanup. The filters effect is
  // declared first so a mutation that lands in the same commit as the step
  // change resolves its row against the new filters.
  useEffect(() => {
    latestFiltersRef.current = filters;
    if (step === 'manage' && pendingMutationFocusRef.current) {
      pendingMutationFocusRef.current = false;
      focusPendingSheetTarget();
    }
  }, [filters, focusPendingSheetTarget, step]);

  useEffect(() => {
    if (step != null) {
      focusPendingSheetTarget();
    }
  }, [focusPendingSheetTarget, step]);

  // An announcement queued by a step change — a suggestion or a removal that
  // changed the filters — is spoken in the commit that shows the next step,
  // so it lands in that step's dialog region rather than the one about to
  // close. It synchronizes the live region named above and acquires nothing.
  useEffect(() => {
    const message = pendingAnnouncementRef.current;
    if (step != null && message != null) {
      pendingAnnouncementRef.current = null;
      announce(message);
    }
  }, [announce, step]);

  // ----------------------------------------------------------------- fields --

  // Every visible field lists: the value step edits every operator's value,
  // `nested` through the popover's built-in editor (FR13, FR14).
  const fields = useMemo(() => config.getVisibleFields(), [config]);

  const normalizedFieldQuery = fieldQuery.trim().toLowerCase();
  const matchingFields = useMemo(() => {
    const matches = fields.filter(field =>
      fieldMatchesQuery(field, normalizedFieldQuery),
    );
    return normalizedFieldQuery === ''
      ? matches
      : matches.slice(0, maxSearchResults);
  }, [fields, maxSearchResults, normalizedFieldQuery]);

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

  // The suggestions derive synchronously from the config, so a list never
  // waits on a request: an empty list means an empty result, not a pending
  // one (`component:PowerSearch` FR18).
  const contentResults = useMemo(() => {
    if (step !== 'fields' || !hasContentSearch || !isInteractive) {
      return [];
    }
    const results =
      contentQuery.trim() === ''
        ? suggestionSource.bootstrap()
        : suggestionSource.search(contentQuery);
    return results.slice(0, MAX_BROWSE_MENU_ITEMS);
  }, [contentQuery, hasContentSearch, isInteractive, step, suggestionSource]);

  // The Add filter sheet's empty-result messages render as plain text; this
  // Effect delivers each one through the same in-dialog polite region, once
  // per settle — when the list first becomes empty for a query, not on every
  // keystroke that keeps it empty (`component:PowerSearch` AR6). It
  // synchronizes that live region and acquires nothing.
  const emptyResultMessage =
    step !== 'fields'
      ? null
      : hasContentSearch
        ? contentQuery.trim() !== '' && contentResults.length === 0
          ? t('@astryx.powersearch.sheet.noResults')
          : null
        : normalizedFieldQuery !== '' && groupedFields.length === 0
          ? t('@astryx.powersearch.sheet.noMatchingFields')
          : null;
  // The field's result count, while a sheet is open: the owner's own Effect
  // is quiet then, so the change is spoken here, inside the dialog (AR6,
  // FR19). Only a change after the flow opened is spoken.
  const announcedResultCountRef = useRef(resultCountText);
  useEffect(() => {
    if (resultCountText === announcedResultCountRef.current) {
      return;
    }
    announcedResultCountRef.current = resultCountText;
    if (step != null && resultCountText != null) {
      announce(resultCountText);
    }
  }, [announce, resultCountText, step]);
  const announcedEmptyResultRef = useRef<string | null>(null);
  useEffect(() => {
    if (emptyResultMessage === announcedEmptyResultRef.current) {
      return;
    }
    announcedEmptyResultRef.current = emptyResultMessage;
    if (emptyResultMessage != null) {
      announce(emptyResultMessage);
    }
  }, [announce, emptyResultMessage]);

  // ------------------------------------------------------------------ draft --

  const draftField = draft ? config.getField(draft.field) : undefined;
  const draftOperator =
    draft?.operator != null
      ? config.getOperator(draft.field, draft.operator)
      : undefined;
  const draftOperators = useMemo(
    () => (draft ? config.getVisibleOperators(draft.field) : []),
    [config, draft],
  );

  const openFieldList = useCallback(() => {
    if (!isInteractive) {
      return;
    }
    fieldPickerOriginRef.current = 'manage';
    setFieldQuery('');
    setContentQuery('');
    pendingSheetFocusRef.current = hasContentSearch
      ? {type: 'content-search'}
      : null;
    setStep('fields');
  }, [hasContentSearch, isInteractive]);

  const queueManagerAddFocus = useCallback(() => {
    pendingSheetFocusRef.current = {type: 'manager-add'};
  }, []);

  const commitSavedFilter = useCallback(
    (next: FilterDraft, filter: PowerSearchFilter) => {
      if (!isInteractive) {
        queueManagerAddFocus();
        setStep('manage');
        return;
      }
      if (next.mode === 'edit') {
        const filterIndex = resolveDraftFilterIndex(filters, next);
        const currentFilter =
          filterIndex == null ? undefined : filters[filterIndex];
        if (
          filterIndex == null ||
          currentFilter == null ||
          currentFilter.isReadOnly
        ) {
          queueManagerAddFocus();
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
        queueManagerAddFocus();
        onChange([...filters, filter], 'add', filters.length);
      }
      setStep('manage');
    },
    [filters, isInteractive, onChange, queueManagerAddFocus],
  );

  // Opening a new filter can come from a field row or a content-search
  // suggestion. The origin is kept so Cancel returns to the control the person
  // came from.
  const openCreateEditor = useCallback(
    (
      field: PowerSearchField,
      operator: PowerSearchOperator,
      returnFocus: 'field' | 'content-search' = 'field',
    ) => {
      setDraft({
        mode: 'create',
        returnFocus,
        field: field.key,
        operator: operator.key,
        value: operator.value.type === 'empty' ? {type: 'empty'} : undefined,
      });
      pendingSheetFocusRef.current = null;
      setStep('value');
    },
    [],
  );

  const handleFieldSelect = useCallback(
    (field: PowerSearchField) => {
      if (!isInteractive) {
        return;
      }
      const operator =
        config.getDefaultOperator(field.key) ?? field.operators[0];
      if (operator == null) {
        return;
      }
      openCreateEditor(field, operator);
    },
    [config, isInteractive, openCreateEditor],
  );

  const handleContentSuggestionSelect = useCallback(
    (item: PowerSearchItem | null) => {
      if (!isInteractive || item?.auxiliaryData == null) {
        return;
      }
      const {fieldKey, filterValue, operatorKey} = item.auxiliaryData;
      const field = config.getField(fieldKey);
      const operator =
        operatorKey == null
          ? config.getDefaultOperator(fieldKey)
          : config.getOperator(fieldKey, operatorKey);
      if (field == null || operator == null) {
        return;
      }
      setContentQuery('');
      if (filterValue != null) {
        const nextFilter: PowerSearchFilter = {
          field: field.key,
          operator: operator.key,
          value: filterValue,
        };
        pendingSheetFocusRef.current = {
          type: 'manager-filter',
          sourceFilter: nextFilter,
          sourceSignature: filterSignature(nextFilter),
          preferredIndex: filters.length,
        };
        pendingMutationFocusRef.current = true;
        onChange([...filters, nextFilter], 'add', filters.length);
        // The same announcement the popover presentation's typeahead add
        // makes, so assistive technology hears one phrase for one outcome;
        // spoken once the Filters sheet is the open dialog.
        pendingAnnouncementRef.current = t('@astryx.tokenizer.tokenAdded', {
          label: item.label,
        });
        setStep('manage');
        return;
      }
      openCreateEditor(field, operator, 'content-search');
    },
    [config, filters, isInteractive, onChange, openCreateEditor, t],
  );

  const handleFilterEdit = useCallback(
    (index: number) => {
      const filter = filters[index];
      if (!isInteractive || filter == null || filter.isReadOnly) {
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
      pendingSheetFocusRef.current = null;
      setStep('value');
    },
    [filters, isInteractive],
  );

  // The two parts of a Filters row's text for `filter`: "{field} {operator}"
  // as one catalog message, and the value as the popover presentation's
  // token shows it — the same function, so the same words and the same zone
  // handling, before the token's width budget. The rows render these, and
  // the removal announcement joins them (AR6), so the three can never
  // disagree.
  const describeFilterParts = useCallback(
    (filter: PowerSearchFilter): {label: string; value: string | null} => {
      const field = config.getField(filter.field);
      const operator = config.getOperator(filter.field, filter.operator);
      // A filter whose field or operator the config no longer has still
      // lists, by its raw keys, as its token does on the trigger; its row
      // opens the unavailable step, whose Remove is the way out (FR12).
      const fieldLabel = field?.label ?? filter.field;
      const operatorLabel =
        operator == null ? filter.operator : resolveOperatorLabel(operator, t);
      const label = operatorLabel
        ? t('@astryx.powersearch.sheet.fieldOperator', {
            field: fieldLabel,
            operator: operatorLabel,
          })
        : fieldLabel;
      if (operator == null) {
        return {label, value: null};
      }
      // A relative-date value is stored as a key (`3d_ago`); the row reads it
      // as the value step's choice row does ("3 days ago"), through FR20's
      // catalog messages, so the sheet agrees with itself. The popover token
      // shows the stored key (a known gap of the record).
      const value =
        operator.value.type === 'date_relative' &&
        filter.value.type === 'date_relative'
          ? resolveRelativeDateLabel(operator.value, filter.value.value, t)
          : formatTokenValueText(
              operator.value,
              filter.value,
              Number.MAX_SAFE_INTEGER,
              locale,
              t,
            );
      return {label, value};
    },
    [config, locale, t],
  );
  const describeFilter = useCallback(
    (filter: PowerSearchFilter): string => {
      const parts = describeFilterParts(filter);
      return parts.value
        ? t('@astryx.powersearch.sheet.labelValue', {
            label: parts.label,
            value: parts.value,
          })
        : parts.label;
    },
    [describeFilterParts, t],
  );

  // Whether a Filters row is a button (FR12): the field interactive and the
  // filter not read-only. An editable operator's row opens the value step;
  // a `nested` operator's row, and the row of a filter the config no longer
  // knows, open the step's no-editor state, whose Remove is the way out — as
  // the popover's token has its × for the same filter.
  const isRowButton = useCallback(
    (filter: PowerSearchFilter): boolean => !filter.isReadOnly && isInteractive,
    [isInteractive],
  );

  const handleRemoveFilter = useCallback(
    (index: number) => {
      const filter = filters[index];
      if (!isInteractive || filter == null || filter.isReadOnly) {
        return;
      }
      const nextFilters = filters.filter((_, i) => i !== index);
      const nextIndex = nearestEditableIndex(nextFilters, index, isRowButton);
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
      pendingMutationFocusRef.current = true;
      onChange(nextFilters, 'remove', index);
      // The popover presentation's token × announces the same phrase;
      // spoken once the Filters sheet is the open dialog (AR6).
      pendingAnnouncementRef.current = t('@astryx.tokenizer.tokenRemoved', {
        label: describeFilter(filter),
      });
    },
    [describeFilter, filters, isInteractive, isRowButton, onChange, t],
  );

  // Clear all keeps the popover presentation's semantics: every filter goes,
  // read-only ones included, reported as a `remove` at the last index — the
  // change the field's clear control commits there (`component:PowerSearch`
  // FR12).
  const handleClearAll = useCallback(() => {
    if (filters.length === 0) {
      return;
    }
    onChange([], 'remove', filters.length - 1);
    // Clear all closes the flow. The Filters dialog stays modal through its
    // exit, hiding both its own region and the page-body channel, so the
    // owner speaks the outcome once the dialog has gone and focus is back on
    // the trigger (AR6).
    onFiltersCleared?.();
    closeFlow();
  }, [closeFlow, filters, onFiltersCleared, onChange]);

  const handleOperatorSelect = useCallback((operator: PowerSearchOperator) => {
    setDraft(current => {
      if (current == null) {
        return current;
      }
      // A value survives an operator change only when the new operator
      // reads the same value type.
      const keepsValue =
        current.value != null && current.value.type === operator.value.type;
      return {
        ...current,
        operator: operator.key,
        value:
          operator.value.type === 'empty'
            ? {type: 'empty'}
            : keepsValue
              ? current.value
              : undefined,
      };
    });
  }, []);

  const handleDraftValueChange = useCallback((value: FilterValue) => {
    setDraft(current => (current == null ? current : {...current, value}));
  }, []);
  // The number input's draft was cleared or stopped parsing: nothing stands
  // to confirm, so the confirm action disables again (FR14, FR17).
  const handleDraftUnstage = useCallback(() => {
    setDraft(current =>
      current == null ? current : {...current, value: undefined},
    );
  }, []);

  const handleSave = useCallback(() => {
    if (draft?.value == null || draft.operator == null) {
      return;
    }
    commitSavedFilter(draft, {
      field: draft.field,
      operator: draft.operator,
      value: draft.value,
    });
  }, [commitSavedFilter, draft]);

  const returnFromValue = useCallback(() => {
    if (draft == null) {
      queueManagerAddFocus();
      setStep('manage');
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
    if (draft.returnFocus === 'content-search') {
      pendingSheetFocusRef.current = {type: 'content-search'};
      setStep('fields');
      return;
    }
    pendingSheetFocusRef.current = {type: 'field', fieldKey: draft.field};
    setStep('fields');
  }, [draft, filters, queueManagerAddFocus]);

  const handleRemove = useCallback(() => {
    if (draft?.mode !== 'edit') {
      return;
    }
    const filterIndex = resolveDraftFilterIndex(filters, draft);
    if (filterIndex == null || filters[filterIndex]?.isReadOnly) {
      queueManagerAddFocus();
      setStep('manage');
      return;
    }
    handleRemoveFilter(filterIndex);
    setStep('manage');
  }, [draft, filters, handleRemoveFilter, queueManagerAddFocus]);

  const handleActiveSheetChange = useCallback(
    (active: string | null) => {
      // The switcher only reports null, for a dismissal the active sheet
      // allows. Every step change goes through the handlers above.
      if (active == null) {
        closeFlow();
      }
    },
    [closeFlow],
  );

  const handleBack = useCallback(() => {
    if (fieldPickerOriginRef.current === 'trigger') {
      closeFlow();
      return;
    }
    queueManagerAddFocus();
    setStep('manage');
  }, [closeFlow, queueManagerAddFocus]);

  // ---------------------------------------------------------------- render --

  const filterRows = filters.map((filter, index) => {
    const {label, value} = describeFilterParts(filter);
    const isEditable = isRowButton(filter);
    // The row reads from the same catalog message the removal announcement
    // uses (`labelValue`), so a locale that reorders it reorders both: the
    // message is formatted with a placeholder for the value, and the text
    // either side of that placeholder wraps the bold value.
    let displayLabel: ReactNode = label;
    if (value) {
      const [before, after] = t('@astryx.powersearch.sheet.labelValue', {
        label,
        value: ROW_VALUE_SLOT,
      }).split(ROW_VALUE_SLOT);
      displayLabel = (
        <>
          {before}
          <span {...stylex.props(styles.rowValue)}>{value}</span>
          {after}
        </>
      );
    }
    return {
      displayLabel,
      filter,
      index,
      isEditable,
      key: `${index}-${filter.field}-${filter.operator}`,
    };
  });

  const isClearAllShown = hasClear && isInteractive && filters.length > 0;

  const EditorOverride =
    draftOperator != null
      ? componentOverrides?.[draftOperator.value.type]?.Editor
      : undefined;

  const draftOperatorLabel =
    draftOperator == null ? '' : resolveOperatorLabel(draftOperator, t);
  // The title names the filter's own operator when the step offers no
  // Operator group — one editable operator, or an operator the group does not
  // list (a `nested` one with no Editor override) — so a nested filter's step
  // never shows some other operator's name (FR14).
  const showsOperatorGroup =
    draftOperators.length > 1 &&
    draftOperator != null &&
    draftOperators.includes(draftOperator);
  const editorTitle =
    draftField == null
      ? draft?.mode === 'edit'
        ? t('@astryx.powersearch.sheet.editFilter')
        : t('@astryx.powersearch.sheet.addFilter')
      : !showsOperatorGroup && draftOperatorLabel !== ''
        ? t('@astryx.powersearch.sheet.fieldOperator', {
            field: draftField.label,
            operator: draftOperatorLabel,
          })
        : draftField.label;
  const saveButtonLabel =
    saveButtonLabelFromProps ??
    (draft?.mode === 'edit'
      ? t('@astryx.powersearch.editor.apply')
      : t('@astryx.powersearch.sheet.addFilter'));

  // Every sheet body: padded, and publishing that padding to its lists.
  const bodyProps = stylex.props(
    styles.body,
    containerPaddingInlineVarStyles[4],
  );

  const isEditorDisabled = isDisabled || isReadOnly;
  const isSaveDisabled =
    isEditorDisabled || draft?.operator == null || draft.value == null;
  // The step has something to edit when the field and operator still exist
  // (a controlled config update can remove either). A caller's `Editor`
  // override replaces the body for its value type with the props the popover
  // hands it; otherwise a `nested` value takes the popover's built-in
  // NestedEditor and every other type the sheet's own control (FR14).
  const isDraftRenderable =
    draft != null && draftField != null && draftOperator != null;
  const isDraftNested =
    isDraftRenderable && !isSupportedOperator(draftOperator);
  // The operator group stays outside either editor, so switching operators
  // swaps the body — a `nested` operator beside a plain one included (FR14).
  const operatorGroup = isDraftRenderable && showsOperatorGroup && (
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
          label={t('@astryx.powersearch.sheet.fieldOperator', {
            field: draftField.label,
            operator: resolveOperatorLabel(operator, t),
          })}
          value={operator.key}
        />
      ))}
    </RadioList>
  );
  // The built-in nested editor shows its own operator control only when it
  // is handed several options; the group above owns that choice here, so it
  // is handed the one operator and shows its label.
  const nestedOperatorOptions = useMemo(
    () =>
      draftOperator == null
        ? []
        : [
            {
              value: draftOperator.key,
              label: resolveOperatorLabel(draftOperator, t),
            },
          ],
    [draftOperator, t],
  );
  const handleNestedDraftChange = useCallback((next: PartialFilter) => {
    setDraft(current =>
      current == null ? current : {...current, value: next.value},
    );
  }, []);

  return (
    <BottomSheetSwitcher
      activeSheet={step}
      onActiveSheetChange={handleActiveSheetChange}>
      <BottomSheet
        sheetId="manage"
        label={t('@astryx.powersearch.sheet.filtersTitle')}
        height="tall"
        padding={0}>
        <div {...stylex.props(styles.sheet)}>
          <div {...stylex.props(styles.header)}>
            <div {...stylex.props(styles.headerRow)}>
              <div {...stylex.props(styles.headerText)}>
                <Heading level={3}>
                  {t('@astryx.powersearch.sheet.filtersTitle')}
                </Heading>
              </div>
              {isInteractive && (
                <Button
                  ref={managerAddButtonRef}
                  label={t('@astryx.powersearch.sheet.addFilter')}
                  variant="ghost"
                  xstyle={styles.touchAction}
                  onClick={openFieldList}
                />
              )}
            </div>
          </div>
          <div {...bodyProps}>
            {step === 'manage' && (
              <SheetAnnouncer onAnnounceChange={handleAnnounceChange} />
            )}
            {filterRows.length === 0 ? (
              <div {...stylex.props(styles.empty)}>
                <Text type="supporting" color="secondary">
                  {t('@astryx.powersearch.sheet.noFilters')}
                </Text>
              </div>
            ) : (
              <List hasDividers density="spacious" edge="bleed">
                {filterRows.map(row => {
                  const canEdit = row.isEditable;
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
                      label={row.displayLabel}
                      onClick={
                        canEdit ? () => handleFilterEdit(row.index) : undefined
                      }
                      endContent={
                        canEdit ? (
                          <Icon
                            icon="chevronRight"
                            size="sm"
                            color="secondary"
                            xstyle={rtlStyles.mirror}
                          />
                        ) : undefined
                      }
                    />
                  );
                })}
              </List>
            )}
          </div>
          <div {...stylex.props(styles.footer)}>
            {isClearAllShown && (
              <Button
                label={t('@astryx.powersearch.sheet.clearAll')}
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
                label={t('@astryx.powersearch.sheet.done')}
                variant="primary"
                xstyle={styles.touchAction}
                onClick={closeFlow}
                width={isClearAllShown ? undefined : '100%'}
              />
            </div>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        sheetId="fields"
        label={t('@astryx.powersearch.sheet.addFilter')}
        height="tall"
        padding={0}>
        <div {...stylex.props(styles.sheet)}>
          <div {...stylex.props(styles.header)}>
            <div {...stylex.props(styles.headerRow)}>
              <Button
                label={t('@astryx.powersearch.sheet.back')}
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
                onClick={handleBack}
              />
              <div {...stylex.props(styles.headerText)}>
                <Heading level={3}>
                  {t('@astryx.powersearch.sheet.addFilter')}
                </Heading>
              </div>
            </div>
            {hasContentSearch ? (
              <div ref={contentSearchRef}>
                <TextInput
                  label={t('@astryx.powersearch.sheet.search')}
                  isLabelHidden
                  role="searchbox"
                  aria-controls={contentResultsId}
                  value={contentQuery}
                  onChange={setContentQuery}
                  onKeyDown={event => {
                    if (isImeKeyEvent(event.nativeEvent)) {
                      return;
                    }
                    if (event.key === 'Enter' && contentResults[0] != null) {
                      event.preventDefault();
                      handleContentSuggestionSelect(contentResults[0]);
                      return;
                    }
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      contentSuggestionListRef.current
                        ?.querySelector<HTMLButtonElement>('button')
                        ?.focus();
                    }
                  }}
                  placeholder={placeholder}
                  hasClear
                  startIcon={<Icon icon="search" size="sm" color="secondary" />}
                  isDisabled={!isInteractive}
                  width="100%"
                />
              </div>
            ) : isFieldSearchShown ? (
              <TextInput
                label={t('@astryx.powersearch.sheet.searchFields')}
                isLabelHidden
                placeholder={t(
                  '@astryx.powersearch.sheet.searchFieldsPlaceholder',
                )}
                value={fieldQuery}
                onChange={setFieldQuery}
                startIcon={<Icon icon="search" size="sm" color="secondary" />}
                isDisabled={!isInteractive}
                width="100%"
              />
            ) : null}
          </div>
          <div {...bodyProps}>
            {step === 'fields' && (
              <SheetAnnouncer onAnnounceChange={handleAnnounceChange} />
            )}
            {hasContentSearch ? (
              contentResults.length > 0 ? (
                <List
                  ref={contentSuggestionListRef}
                  id={contentResultsId}
                  aria-label={t('@astryx.powersearch.sheet.searchResults')}
                  hasDividers
                  density="spacious"
                  edge="bleed">
                  {contentResults.map((item, index) => (
                    <ListItem
                      key={item.id}
                      label={item.label}
                      isDisabled={!isInteractive}
                      onClick={() => handleContentSuggestionSelect(item)}
                      onKeyDown={event => {
                        if (
                          isImeKeyEvent(event.nativeEvent) ||
                          (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
                        ) {
                          return;
                        }
                        event.preventDefault();
                        const buttons = [
                          ...(contentSuggestionListRef.current?.querySelectorAll<HTMLButtonElement>(
                            'button',
                          ) ?? []),
                        ];
                        const nextIndex =
                          event.key === 'ArrowDown'
                            ? Math.min(index + 1, buttons.length - 1)
                            : index - 1;
                        if (nextIndex < 0) {
                          contentSearchRef.current
                            ?.querySelector<HTMLInputElement>('input')
                            ?.focus();
                        } else {
                          buttons[nextIndex]?.focus();
                        }
                      }}
                    />
                  ))}
                </List>
              ) : (
                contentQuery.trim() !== '' && (
                  <div {...stylex.props(styles.empty)}>
                    <Text type="supporting" color="secondary">
                      {t('@astryx.powersearch.sheet.noResults')}
                    </Text>
                  </div>
                )
              )
            ) : groupedFields.length === 0 ? (
              <div {...stylex.props(styles.empty)}>
                <Text type="supporting" color="secondary">
                  {t('@astryx.powersearch.sheet.noMatchingFields')}
                </Text>
              </div>
            ) : (
              groupedFields.map(([group, groupFields]) => (
                <List
                  key={group}
                  hasDividers
                  density="spacious"
                  header={group === '' ? undefined : group}
                  edge="bleed">
                  {groupFields.map(field => (
                    <ListItem
                      key={field.key}
                      ref={node => {
                        if (node == null) {
                          fieldRowsRef.current.delete(field.key);
                        } else {
                          fieldRowsRef.current.set(field.key, node);
                        }
                      }}
                      label={field.label}
                      isDisabled={!isInteractive}
                      startContent={field.icon}
                      endContent={
                        <Icon
                          icon="chevronRight"
                          size="sm"
                          color="secondary"
                          xstyle={rtlStyles.mirror}
                        />
                      }
                      onClick={() => handleFieldSelect(field)}
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
        padding={0}
        purpose="form">
        <div {...stylex.props(styles.sheet)}>
          <div {...stylex.props(styles.header)}>
            <div {...stylex.props(styles.headerRow)}>
              <div {...stylex.props(styles.headerText)}>
                <Heading level={3} maxLines={1}>
                  {editorTitle}
                </Heading>
              </div>
            </div>
          </div>
          {isDraftRenderable && EditorOverride != null ? (
            <div {...bodyProps}>
              {step === 'value' && (
                <SheetAnnouncer onAnnounceChange={handleAnnounceChange} />
              )}
              {operatorGroup}
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
                      handleRemove();
                    } else {
                      queueManagerAddFocus();
                      setStep('manage');
                    }
                    return;
                  }
                  commitSavedFilter(draft, saved);
                }}
                onCancel={returnFromValue}
                saveButtonLabel={saveButtonLabel}
                isReadOnly={isEditorDisabled}
              />
            </div>
          ) : (
            <>
              <div {...bodyProps}>
                {step === 'value' && (
                  <SheetAnnouncer onAnnounceChange={handleAnnounceChange} />
                )}
                {isDraftRenderable ? (
                  <>
                    {operatorGroup}
                    {isDraftNested ? (
                      <NestedEditor
                        key={`${draft.field}-${draft.operator}`}
                        config={config}
                        partialFilter={{
                          field: draft.field,
                          operator: draft.operator,
                          value: draft.value,
                        }}
                        operatorOptions={nestedOperatorOptions}
                        onOperatorChange={() => {}}
                        onPartialFilterChange={handleNestedDraftChange}
                        maxMenuItems={maxOperatorMenuItems}
                        isReadOnly={isEditorDisabled}
                        xstyle={styles.nestedEditorContainer}
                      />
                    ) : (
                      <SheetValueEditor
                        key={`${draft.field}-${draft.operator}`}
                        operatorValue={draftOperator.value}
                        filterValue={draft.value}
                        onChange={handleDraftValueChange}
                        onUnstage={handleDraftUnstage}
                        config={config}
                        fieldLabel={draftField.label}
                        isDisabled={isEditorDisabled}
                        maxMenuItems={maxOperatorMenuItems}
                      />
                    )}
                  </>
                ) : (
                  // A controlled config update removed the field or operator
                  // being edited: say so and keep a way out.
                  draft != null && (
                    <div {...stylex.props(styles.empty)}>
                      <Text type="supporting" color="secondary">
                        {t('@astryx.powersearch.sheet.filterUnavailable')}
                      </Text>
                    </div>
                  )
                )}
              </div>
              <div {...stylex.props(styles.footer)}>
                {draft?.mode === 'edit' && !isReadOnly && (
                  <Button
                    label={t('@astryx.powersearch.sheet.remove')}
                    variant="ghost"
                    isDisabled={isEditorDisabled}
                    xstyle={styles.touchAction}
                    onClick={handleRemove}
                  />
                )}
                <div
                  {...stylex.props(
                    styles.footerActions,
                    isReadOnly && styles.footerSoleAction,
                  )}>
                  <Button
                    label={t('@astryx.powersearch.editor.cancel')}
                    variant="ghost"
                    xstyle={styles.touchAction}
                    onClick={returnFromValue}
                    width={isReadOnly ? '100%' : undefined}
                  />
                  {!isReadOnly && isDraftRenderable && (
                    <Button
                      label={saveButtonLabel}
                      variant="primary"
                      isDisabled={isSaveDisabled}
                      xstyle={styles.touchAction}
                      onClick={handleSave}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </BottomSheetSwitcher>
  );
}

PowerSearchBottomSheet.displayName = 'PowerSearchBottomSheet';
