// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PowerSearch.tsx
 * @input PowerSearchConfig, filters, onChange; Tokenizer, Field parts, Token,
 *   useAdaptivePresentation, and PowerSearchBottomSheet (lazy)
 * @output Structured filter bar with token-based filter management
 * @position Main component; forwards DOM ref and exposes tokenizer control via
 *   handleRef. The experimental `presentation` option swaps the tokenizer
 *   field and editor popover for one trigger that opens PowerSearchBottomSheet.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 * - /packages/core/src/PowerSearch/PowerSearchBottomSheet.tsx (sheet presentation)
 * - /packages/cli/assets/templates/blocks/components/PowerSearch/ (showcase blocks)
 */

import React, {
  lazy,
  Suspense,
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
import type {BaseProps} from '../BaseProps';
import {
  Tokenizer,
  type TokenizerHandle,
  type TokenizerOverflowBehavior,
} from '../Tokenizer';
import {TypeaheadItem} from '../Typeahead/TypeaheadItem';
import {Token} from '../Token';
import {Avatar} from '../Avatar';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {Icon, renderIconSlot} from '../Icon';
import type {IconType} from '../Icon';
import type {IconName} from '../Icon/globalIconRegistry';
import {Field, type InputStatus, type FieldStatusVariant} from '../Field';
import {
  inputStatusBorderStyles,
  inputStatusFocusWithinStyles,
  inputStatusHoverShadowStyles,
  inputWrapperStyles,
} from '../Field/inputStyles.stylex';
import {usePopover} from '../Popover/usePopover';
import {useTooltip} from '../Tooltip';
import {layerViewportInset} from '../Layer/layerViewportInset.stylex';
import {useAnnounce} from '../hooks/useAnnounce';
import {useAdaptivePresentation} from '../hooks/useAdaptivePresentation';
import {useDevWarning} from '../hooks/useDevWarning';
import {useIsHydrating} from '../hooks/useIsHydrating';
import {
  spacingVars,
  colorVars,
  sizeVars,
  typeScaleVars,
  typographyVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {useSize} from '../SizeContext/SizeContext';
import {isRenderable} from '../utils';
import {useInternalConfig} from './useInternalConfig';
import {usePowerSearchSource} from './usePowerSearchSource';
import {formatFilterValue} from './formatFilterValue';
import {PowerSearchEditPopover} from './PowerSearchEditPopover';
import {resolveOperatorLabel} from './resolveOperatorLabel';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {useLocale} from '../i18n/useLocale';
import type {Locale} from '../i18n/types';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
  PartialFilter,
  PowerSearchItem,
  PowerSearchAuxData,
  PowerSearchChangeType,
  PowerSearchHandle,
  FilterValue,
  OperatorValue,
  PowerSearchComponents,
} from './types';
import type {PowerSearchBottomSheetProps} from './PowerSearchBottomSheet';
import {formatTokenValueText} from './formatTokenValue';

import {useMergedRefs} from '../hooks/useMergedRefs';
// =============================================================================
// Icon mapping for typeahead entries
// =============================================================================

// Ranked suggestions shown for a non-empty query. The field list itself is
// never capped -- see the maxSearchResults prop.
const DEFAULT_MAX_SEARCH_RESULTS = 10;

// Empty-query browsing gets a high safety ceiling, matching XDS. This shows
// every practical field list without allowing an accidental unbounded DOM.
const MAX_BROWSE_MENU_ITEMS = 1000;

const OPERATOR_VALUE_TYPE_TO_ICON: Record<string, IconName> = {
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
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
});

const popoverLayerStyles = stylex.create({
  layer: {
    width: 'anchor-size(width)',
    // Floor for comfortable editing, clamped by the layer runtime's viewport
    // cap (spec:AST-059 FR7) rather than by the room beside the anchor; the
    // runtime flips or slides the editor into view when it does not fit there
    // (#4761).
    minWidth: stylex.firstThatWorks(
      `min(400px, ${layerViewportInset.maxInlineSize})`,
      `min(400px, ${layerViewportInset.maxInlineSizeFallback})`,
    ),
  },
});

const resultCountStyles = stylex.create({
  text: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
  },
});

// The sheet presentation's trigger field: the same control box as the
// tokenizer field, with display-only tokens and one button as its only tab
// stop (`component:PowerSearch` FR11).
const sheetTriggerSizeStyles = stylex.create({
  sm: {minHeight: sizeVars['--size-element-sm']},
  md: {minHeight: sizeVars['--size-element-md']},
  lg: {minHeight: sizeVars['--size-element-lg']},
});

const sheetTriggerStyles = stylex.create({
  wrapper: {
    position: 'relative',
    flexWrap: 'nowrap',
    gap: spacingVars['--spacing-1'],
    height: 'auto',
    cursor: {
      default: 'pointer',
      ':is([aria-disabled="true"])': 'default',
    },
  },
  wrapperWithTokens: {
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    paddingInline: `calc(${spacingVars['--spacing-1']} - 1px)`,
  },
  contentSection: {
    position: 'relative',
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
  // The only tab stop in the field. It stays visually borderless while the
  // wrapper delegates taps on tokens and empty space to it.
  trigger: {
    appearance: 'none',
    flex: '1 1 40px',
    minWidth: '40px',
    alignSelf: 'stretch',
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
      ':is([aria-disabled="true"])': 'default',
    },
    outline: 'none',
  },
  // Once a token is present the empty trigger covers the token lane instead
  // of reserving 40px or wrapping onto an otherwise blank row.
  triggerWithTokens: {
    position: 'absolute',
    inset: 0,
    minWidth: 0,
    padding: 0,
  },
  endSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    paddingInlineEnd: spacingVars['--spacing-1'],
  },
});

// The sheet flow (BottomSheetSwitcher, three sheets, the sheet editors) only
// renders for the bottom-sheet presentation. Loading it on demand keeps it out
// of pages whose PowerSearch stays a tokenizer field (`component:PowerSearch`
// PR5).
const LazyPowerSearchBottomSheet = lazy(async () =>
  import('./PowerSearchBottomSheet').then(module => ({
    default: module.PowerSearchBottomSheet,
  })),
);

/**
 * Hosts the lazily loaded sheet flow. Renders nothing on the server or in the
 * render that hydrates server HTML: a lazy component that has not loaded yet
 * would leave server markup incomplete and abort hydration. The closed flow
 * has no visible markup, so it first renders right after hydration.
 */
function PowerSearchSheetHost(props: PowerSearchBottomSheetProps) {
  const isHydrating = useIsHydrating();
  if (isHydrating) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <LazyPowerSearchBottomSheet {...props} />
    </Suspense>
  );
}

function PowerSearchTokenValue({
  operatorValue,
  filterValue,
  maxLength,
  locale,
}: {
  operatorValue: OperatorValue;
  filterValue: FilterValue;
  maxLength: number;
  locale: Locale;
}) {
  const text = formatTokenValueText(
    operatorValue,
    filterValue,
    maxLength,
    locale,
  );
  if (text == null) {
    return null;
  }
  return <span {...stylex.props(tokenValueStyles.value)}>{text}</span>;
}

// =============================================================================
// Types
// =============================================================================

export type PowerSearchSize = 'sm' | 'md' | 'lg';

export interface PowerSearchProps extends Omit<
  BaseProps<HTMLElement>,
  'onChange'
> {
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
   * Explains why the search is disabled. When set together with `isDisabled`,
   * the search shows a tooltip with this text on hover and keyboard focus, and
   * the input stays focusable (via `aria-disabled`) so the reason is
   * discoverable by keyboard and assistive technology. Input stays blocked.
   *
   * Use this instead of wrapping a disabled PowerSearch in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   */
  disabledMessage?: string;
  /**
   * Icon to display at the start of the input.
   * Accepts a ReactNode (e.g. `<Icon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | IconType;
  /** Fires when focus enters the search input from outside. */
  onFocus?: (e: React.FocusEvent) => void;
  /** Fires when focus leaves the search input entirely. */
  onBlur?: (e: React.FocusEvent) => void;
  /** Validation status. */
  status?: InputStatus;
  /**
   * How the status message is placed relative to the input.
   * - 'attached': message overlaps directly below the input (bordered treatment)
   * - 'detached': message floats below as a separate element with spacing
   * @default 'attached'
   */
  statusVariant?: FieldStatusVariant;
  /** Max width for dropdown menu. */
  menuWidth?: number;
  /** Max display length for filter token values. @default 40 */
  maxTokenLength?: number;
  /** Max suggestions in string and entity value typeaheads. @default 10 */
  maxOperatorMenuItems?: number;
  /**
   * Max ranked results shown for a non-empty query. This does not affect the
   * value editor shown after selecting a field. Browsing the field list with
   * an empty query shows up to 1,000 fields. @default 10
   */
  maxSearchResults?: number;
  /** Label for the save button in edit popover. @default 'Apply' */
  popoverSaveButtonLabel?: string;
  /** Timezone ID for date formatting. */
  timezoneID?: string;
  /**
   * Controls how tokens overflow when the container is too narrow.
   * Forwarded to Tokenizer.
   * @default 'none'
   */
  tokenOverflowBehavior?: TokenizerOverflowBehavior;
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
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Imperative handle ref. */
  handleRef?: React.Ref<PowerSearchHandle>;
  /**
   * Size of the search input.
   * @default 'md'
   */
  size?: PowerSearchSize;
  /**
   * Per-type component overrides for token and editor rendering.
   * Keys are operator value types (e.g. 'string', 'enum', 'date_absolute').
   */
  components?: PowerSearchComponents;

  /**
   * Experimental options, outside the stable compatibility promise: anything
   * in this object may change or be removed in a patch release. Omit it for
   * the stable behavior.
   * @experimental
   */
  experimental?: {
    /**
     * How the field presents filter editing.
     * - `'popover'`: the tokenizer field with its typeahead and the editor
     *   popover — the stable behavior.
     * - `'bottom-sheet'`: the whole field is one trigger showing display-only
     *   filter tokens; it opens a Filters sheet listing the filters as rows
     *   with Add filter, Done, and Clear all, an Add filter sheet with the
     *   fields (or the content search with inline suggestions), and a value
     *   step that stages field → operator → value and confirms from its
     *   footer. Suited to compact touch screens, where the editor popover
     *   competes with the software keyboard.
     * - `'adaptive'`: the bottom sheet on compact coarse-pointer screens,
     *   otherwise the popover — the same resolution Selector uses.
     *
     * In the sheet presentation `menuWidth` and `tokenOverflowBehavior` have
     * no surface to act on and warn in development.
     * @experimental
     * @default 'popover'
     */
    presentation?: 'popover' | 'bottom-sheet' | 'adaptive';
  };
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
 * <PowerSearch
 *   config={config}
 *   filters={filters}
 *   onChange={(newFilters) => setFilters(newFilters)}
 * />
 * ```
 *
 * Use contentSearchFieldKey to designate a field for free-text search.
 * When set, unstructured text input is routed to that field.
 *
 * @example
 * ```
 * const config = {
 *   name: 'IssueSearch',
 *   contentSearchFieldKey: 'title',
 *   fields: [
 *     {
 *       key: 'title',
 *       label: 'Title',
 *       operators: [
 *         { key: 'contains', label: 'contains', value: { type: 'string' } },
 *       ],
 *     },
 *     {
 *       key: 'status',
 *       label: 'Status',
 *       operators: [
 *         { key: 'is', label: 'is', value: { type: 'enum', values: [...] } },
 *       ],
 *     },
 *   ],
 * };
 * ```
 */
export function PowerSearch({
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
  menuWidth,
  maxTokenLength = 40,
  maxOperatorMenuItems,
  maxSearchResults = DEFAULT_MAX_SEARCH_RESULTS,
  popoverSaveButtonLabel: popoverSaveButtonLabelFromProps,
  timezoneID,
  tokenOverflowBehavior,
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
  experimental,
}: PowerSearchProps) {
  const size = useSize(sizeProp, 'md');
  const config = useInternalConfig(configProp);
  const searchSource = usePowerSearchSource(config, maxSearchResults);
  const t = useTranslator();
  const locale = useLocale();
  const label = labelFromProps ?? t('@astryx.powersearch.label');
  const placeholder =
    placeholderFromProps ?? t('@astryx.powersearch.placeholder');
  const popoverSaveButtonLabel =
    popoverSaveButtonLabelFromProps ?? t('@astryx.powersearch.editor.apply');
  const tokenizerRef = useRef<TokenizerHandle>(null);

  // Experimental presentation (`component:PowerSearch` DEC-3). `adaptive`
  // resolves through the policy the selection controls share; an open flow
  // keeps its presentation until it closes, so a resolution change mid-task
  // cannot pull the surface out from under the person (FR10).
  const presentation = experimental?.presentation ?? 'popover';
  const resolvedPresentation = useAdaptivePresentation(presentation);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Latched for the flow's lifetime: the flow stays presented after it closes
  // until the sheets have run their exit and handed focus back to the trigger.
  // Without the latch, `adaptive` resolving to `popover` mid-session (a phone
  // turned to landscape) would unmount the sheets and the trigger they return
  // focus to in the same render, dropping focus to the page body (FR10).
  const [isSheetPresented, setIsSheetPresented] = useState(false);
  const isSheetPresentation =
    isSheetOpen || isSheetPresented || resolvedPresentation === 'bottom-sheet';
  const triggerRef = useRef<HTMLButtonElement>(null);
  // When the latch releases into the popover presentation, the trigger that
  // just took focus is replaced by the tokenizer field; focus follows it once
  // the input has mounted. A ref, not state: the hand-off is a one-shot side
  // effect of that commit, not something to render.
  const isInlineFocusPendingRef = useRef(false);
  // Whether focus is anywhere inside the closed field — the trigger, the
  // tokenizer's input, a token or its remove button, the clear button, or an
  // interactive `endContent`. When `adaptive` flips while it is (a phone
  // rotated, a mouse attached), the focused control may be replaced by the
  // other presentation's; focus then moves to that presentation's primary
  // control, unless the focused element survived the switch, so it never
  // lands on the page body (FR10). A removed element fires no blur, so the
  // flag is what the Effect below reads after the swap.
  const hasFieldFocusRef = useRef(false);
  const lastPresentationRef = useRef(isSheetPresentation);
  const rootElementRef = useRef<HTMLDivElement>(null);
  // Synchronizes the document's focus with the presentation swap: when the
  // control that held focus is gone, the other presentation's primary control
  // takes it. Nothing is acquired, so there is no cleanup.
  useEffect(() => {
    const swapped = lastPresentationRef.current !== isSheetPresentation;
    lastPresentationRef.current = isSheetPresentation;
    const focusSurvived =
      rootElementRef.current?.contains(document.activeElement) ?? false;
    const needsPrimaryControl =
      swapped && hasFieldFocusRef.current && !focusSurvived;
    if (!isSheetPresentation) {
      if (isInlineFocusPendingRef.current || needsPrimaryControl) {
        isInlineFocusPendingRef.current = false;
        tokenizerRef.current?.focus();
      }
    } else if (needsPrimaryControl) {
      triggerRef.current?.focus();
    }
  }, [isSheetPresentation]);
  const handleFieldFocus = useCallback(
    (event: React.FocusEvent) => {
      hasFieldFocusRef.current = true;
      onFocus?.(event);
    },
    [onFocus],
  );
  const handleFieldBlur = useCallback(
    (event: React.FocusEvent) => {
      hasFieldFocusRef.current = false;
      onBlur?.(event);
    },
    [onBlur],
  );
  // While the flow is open, the sheet announces its own content from inside
  // its dialog; this component announces only with the flow closed, and
  // `useAnnounce` routes those messages by where the field is — into a Dialog
  // or modal Drawer that holds it, or the shared channel when no modal does
  // (`spec:AST-086` FR14).
  // What to speak once the flow has fully closed and focus is back on the
  // trigger (AR6): that Clear all removed every filter, and a result count
  // that changed during the exit. The closing dialog stays modal through its
  // exit, so neither its region nor the page-body channel is heard before.
  // Both together are one catalog message, so a locale orders and punctuates
  // the pair.
  const afterCloseRef = useRef<{
    isCleared: boolean;
    resultCount: string | null;
  }>({isCleared: false, resultCount: null});
  const handleFiltersCleared = useCallback(() => {
    afterCloseRef.current.isCleared = true;
  }, []);
  const triggerId = useId();
  const triggerLabelId = useId();
  const triggerContentId = useId();
  const statusMessageId = useId();
  // A field that becomes disabled cannot keep its flow open, and must not
  // reopen it when re-enabled (`spec:AST-085` FR2, FR11). Adjusted in the
  // render that sees the change, not an effect, so no frame shows both.
  const [wasDisabled, setWasDisabled] = useState(isDisabled);
  if (isDisabled !== wasDisabled) {
    setWasDisabled(isDisabled);
    if (isDisabled && isSheetOpen) {
      setIsSheetOpen(false);
    }
  }
  useDevWarning(
    'PowerSearch',
    '`menuWidth` has no surface in the bottom-sheet presentation: the sheet flow has no typeahead popover to size. Scope it to the popover presentation or leave it out.',
    isSheetPresentation && menuWidth != null,
  );
  useDevWarning(
    'PowerSearch',
    '`tokenOverflowBehavior` has no surface in the bottom-sheet presentation: the trigger wraps its display-only tokens. Scope it to the popover presentation or leave it out.',
    isSheetPresentation && tokenOverflowBehavior != null,
  );

  const [popoverState, setPopoverStateRaw] = useState<PopoverState>({
    type: 'idle',
  });

  // Layer for positioning the edit popover anchored to the tokenizer
  const handleLayerHide = useCallback(() => {
    setPopoverStateRaw({type: 'idle'});
  }, []);

  const popover = usePopover({
    onHide: handleLayerHide,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own listbox/menu content is the exposed semantics; focus
    // stays on the tokenizer input, so a modal dialog wrapper is incorrect.
    role: 'none',
  });

  // The editor popover is portaled, so focus inside it is neither inside the
  // field's root nor reported by the field's focus events. When `adaptive`
  // flips to the sheet while the popover is open (a phone rotated), the
  // popover and its focused control unmount with the tokenizer field and
  // focus would fall to the body; the trigger — the other presentation's
  // primary control — takes it instead (FR10). The editing itself ends with
  // the popover: its state returns to idle (through the raw setter, since the
  // tokenizer input is gone) and its layer is hidden, so a later switch back
  // neither reopens a stale editor nor leaves an open, empty layer for the
  // next Escape to close. The ref holds the popover's state from the render
  // before the swap: this Effect runs on the swap and reads it before the
  // mirror below overwrites it for the next render.
  const wasPopoverOpenRef = useRef(false);
  useEffect(() => {
    if (isSheetPresentation && wasPopoverOpenRef.current) {
      setPopoverStateRaw({type: 'idle'});
      popover.hide();
      triggerRef.current?.focus();
    }
    wasPopoverOpenRef.current = popoverState.type !== 'idle';
  }, [isSheetPresentation, popover, popoverState]);

  // Wrapper that manages layer visibility and tokenizer focus alongside state
  const setPopoverState = useCallback(
    (state: PopoverState) => {
      setPopoverStateRaw(state);
      if (state.type !== 'idle') {
        // Schedule after the current frame so React can render the popover
        // content and the typeahead's synchronous focus() has completed
        requestAnimationFrame(() => {
          popover.show();
          tokenizerRef.current?.blur();
        });
      } else {
        popover.hide();
        tokenizerRef.current?.focus();
      }
    },
    [popover],
  );

  // Expose imperative handle; in the sheet presentation the trigger is the
  // field's focusable control.
  useImperativeHandle(handleRef, () => ({
    focusTypeahead() {
      if (isSheetPresentation) {
        triggerRef.current?.focus();
      } else {
        tokenizerRef.current?.focus();
      }
    },
    blurTypeahead() {
      if (isSheetPresentation) {
        triggerRef.current?.blur();
      } else {
        tokenizerRef.current?.blur();
      }
    },
  }));

  // Convert filters to tokenizer items
  const tokenizerValue: PowerSearchItem[] = useMemo(() => {
    return filters.map((filter, index) => {
      const field = config.getField(filter.field);
      const operator = config.getOperator(filter.field, filter.operator);
      const resolvedOp = operator ? resolveOperatorLabel(operator, t) : '';
      const operatorLabel = resolvedOp ? `: ${resolvedOp}` : '';
      const valueStr = operator
        ? formatFilterValue(
            config,
            operator.value,
            filter.value,
            maxTokenLength,
            t,
            locale,
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
  }, [filters, config, maxTokenLength, timezoneID, t, locale]);

  // Handle tokenizer onChange (field selected from typeahead)
  const handleTokenizerChange = useCallback(
    (
      _items: PowerSearchItem[],
      change: {item?: PowerSearchItem; type: string},
    ) => {
      if (change.type === 'add' && change.item) {
        const auxData = change.item.auxiliaryData as PowerSearchAuxData;
        if (!auxData) {
          return;
        }

        const field = config.getField(auxData.fieldKey);
        if (!field) {
          return;
        }

        const operator = auxData.operatorKey
          ? config.getOperator(auxData.fieldKey, auxData.operatorKey)
          : config.getDefaultOperator(auxData.fieldKey);

        // If the item already has a filter value (e.g. content search), add immediately
        if (auxData.filterValue && operator) {
          const newFilter: PowerSearchFilter = {
            field: auxData.fieldKey,
            operator: operator.key,
            value: auxData.filterValue,
          };
          onChange([...filters, newFilter], 'add', filters.length);
          return;
        }

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
          const newFilters = filters.filter((_, i) =>
            _items.some(item => item.auxiliaryData?.filterIndex === i),
          );
          onChange(newFilters, 'remove', auxData.filterIndex);
        }
      }
    },
    [config, filters, onChange, setPopoverState],
  );

  // Handle clicking a token to edit
  const handleTokenClick = useCallback(
    (index: number) => {
      if (isReadOnly || isDisabled) {
        return;
      }

      const filter = filters[index];
      if (filter.isReadOnly) {
        return;
      }

      // An "empty" operator filter has no value for the built-in editor to
      // edit: commit it as that editor's save would, the way adding one does,
      // instead of opening it. A consumer's `empty` Editor override still opens.
      const operator = config.getOperator(filter.field, filter.operator);
      if (
        operator?.value.type === 'empty' &&
        componentOverrides?.empty?.Editor == null
      ) {
        const newFilters = [...filters];
        newFilters[index] = {
          field: filter.field,
          operator: filter.operator,
          value: {type: 'empty'},
        };
        onChange(newFilters, 'edit', index);
        setPopoverState({type: 'idle'});
        return;
      }

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
    [
      filters,
      isReadOnly,
      isDisabled,
      config,
      componentOverrides,
      onChange,
      setPopoverState,
    ],
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

  // Token renderer for both presentations. Given `onRemove`, the token is
  // the tokenizer field's: click edits, × removes. Without it (the sheet
  // presentation's trigger) the token is display-only; the field as a whole
  // opens the flow.
  const renderFilterToken = useCallback(
    (item: PowerSearchItem, onRemove: (() => void) | undefined) => {
      const auxData = item.auxiliaryData;
      const filterIndex = auxData?.filterIndex ?? -1;
      const filter = filterIndex >= 0 ? filters[filterIndex] : undefined;

      const field = auxData ? config.getField(auxData.fieldKey) : undefined;
      const operator = auxData?.operatorKey
        ? config.getOperator(auxData.fieldKey, auxData.operatorKey)
        : undefined;

      const canInteract =
        onRemove != null && !isReadOnly && !isDisabled && !filter?.isReadOnly;
      const handleClick = canInteract
        ? () => handleTokenClick(filterIndex)
        : undefined;
      const handleRemove = canInteract ? onRemove : undefined;

      // Check for full Token override
      const TokenOverride = operator
        ? componentOverrides?.[operator.value.type]?.Token
        : undefined;

      if (TokenOverride && filter && field && operator) {
        return (
          <TokenOverride
            config={configProp}
            filter={filter}
            field={field}
            operator={operator}
            maxLength={maxTokenLength}
            onClick={handleClick}
            onRemove={handleRemove}
            isDisabled={isDisabled}
          />
        );
      }

      // Default token rendering
      const fieldLabel = field?.label ?? '';
      const operatorLabel = operator ? resolveOperatorLabel(operator, t) : '';
      const tokenLabel = `${fieldLabel}: ${operatorLabel}`.trim();
      const adjustedMaxLength = Math.max(
        maxTokenLength - fieldLabel.length - operatorLabel.length,
        10,
      );

      const valueContent =
        operator && filter ? (
          <PowerSearchTokenValue
            operatorValue={operator.value}
            filterValue={filter.value}
            maxLength={adjustedMaxLength}
            locale={locale}
          />
        ) : undefined;

      // Show entity photo as token icon for single-entity filters
      let tokenIcon: ReactNode | undefined;
      if (
        filter?.value.type === 'entity_list' &&
        filter.value.value.length === 1 &&
        filter.value.value[0].photo
      ) {
        const entity = filter.value.value[0];
        tokenIcon = <Avatar src={entity.photo} name={entity.label} size={16} />;
      }

      return (
        <Token
          label={tokenLabel}
          size={size}
          icon={tokenIcon}
          endContent={valueContent}
          onMouseDown={
            handleClick
              ? e => {
                  // Keep a token press from entering Tokenizer's input-focus
                  // redirect. Click still edits/removes; Tab entry is unchanged.
                  e.preventDefault();
                }
              : undefined
          }
          onClick={
            handleClick
              ? (e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleClick();
                }
              : undefined
          }
          onRemove={handleRemove}
          isDisabled={isDisabled}
        />
      );
    },
    [
      filters,
      config,
      configProp,
      maxTokenLength,
      locale,
      size,
      isReadOnly,
      isDisabled,
      handleTokenClick,
      componentOverrides,
      t,
    ],
  );

  const renderToken = useCallback(
    (item: PowerSearchItem, onRemove: () => void) =>
      renderFilterToken(item, onRemove),
    [renderFilterToken],
  );

  // Custom typeahead item renderer — adds field icon and description
  const renderItem = useCallback(
    (item: PowerSearchItem) => {
      const auxData = item.auxiliaryData;
      if (!auxData) {
        return <TypeaheadItem item={item} />;
      }

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
        icon = <Icon icon={iconName} size="sm" color="secondary" />;
      }

      return (
        <TypeaheadItem
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

  // Resolve custom Editor override for the current popover filter
  const EditorOverride = useMemo(() => {
    if (!popoverPartialFilter?.field || !popoverPartialFilter?.operator) {
      return undefined;
    }
    const op = config.getOperator(
      popoverPartialFilter.field,
      popoverPartialFilter.operator,
    );
    return op ? componentOverrides?.[op.value.type]?.Editor : undefined;
  }, [popoverPartialFilter, config, componentOverrides]);

  // Render popover content — either custom Editor or default
  const popoverContent = useMemo(() => {
    if (!popoverPartialFilter) {
      return null;
    }

    const mode = popoverState.type === 'editing' ? 'edit' : 'create';

    const popoverKey =
      popoverState.type === 'editing'
        ? `edit-${popoverState.filterIndex}-${popoverPartialFilter.field}`
        : `add-${popoverPartialFilter.field}`;

    if (EditorOverride) {
      return (
        <EditorOverride
          key={popoverKey}
          config={configProp}
          filter={popoverPartialFilter}
          mode={mode}
          onSave={handlePopoverSave}
          onCancel={handlePopoverCancel}
          saveButtonLabel={popoverSaveButtonLabel}
          isReadOnly={isReadOnly}
        />
      );
    }

    return (
      <PowerSearchEditPopover
        key={popoverKey}
        config={config}
        filter={popoverPartialFilter}
        mode={mode}
        onSave={handlePopoverSave}
        onCancel={handlePopoverCancel}
        saveButtonLabel={popoverSaveButtonLabel}
        maxMenuItems={maxOperatorMenuItems}
        isReadOnly={isReadOnly}
      />
    );
  }, [
    popoverPartialFilter,
    popoverState,
    EditorOverride,
    configProp,
    config,
    handlePopoverSave,
    handlePopoverCancel,
    popoverSaveButtonLabel,
    maxOperatorMenuItems,
    isReadOnly,
  ]);

  // Plain-text form of the result count, shared by the visible label and the
  // screen-reader announcement so the two never drift. The ICU plural handles
  // the number formatting + `result` vs `results` in one message so translators
  // can match the locale's plural rules.
  const resultCountText = useMemo((): string | null => {
    if (resultCount == null) {
      return null;
    }
    if (typeof resultCount === 'number') {
      return t('@astryx.powersearch.resultCount', {count: resultCount});
    }
    return resultCount;
  }, [resultCount, t]);

  // This Effect synchronizes a polite live region with the result count,
  // mirroring the way Typeahead announces its dropdown result count: the count
  // is otherwise only shown visually and stays silent to assistive tech. The
  // region is the one `spec:AST-086` FR14 names for where the owner is: the
  // modal that holds the field (a Dialog, a modal Drawer), else the shared
  // channel. While a sheet of the flow is open the sheet itself announces the
  // count from inside its dialog (AR6), and this Effect stays quiet. Only a change after mount is spoken — the count present on mount
  // is not announced unprompted — and the guard compares against the last
  // announced text rather than a mounted flag, so StrictMode's effect replay
  // announces nothing either (`component:PowerSearch` FR19). A change that
  // lands while the flow is closing — Clear all's, whose commit also sets the
  // step to null and detaches the sheet body — waits for the trigger focus
  // with the other after-close messages, since the dialog is still modal
  // through its exit (AR6). The announcement acquires no resource, so there
  // is no cleanup.
  const announce = useAnnounce();
  const announcedResultCountRef = useRef(resultCountText);
  const isSheetExiting = isSheetPresented && !isSheetOpen;
  useEffect(() => {
    if (resultCountText === announcedResultCountRef.current) {
      return;
    }
    announcedResultCountRef.current = resultCountText;
    if (resultCountText != null) {
      if (isSheetExiting) {
        afterCloseRef.current.resultCount = resultCountText;
      } else if (!isSheetOpen) {
        announce(resultCountText);
      }
    }
  }, [resultCountText, announce, isSheetExiting, isSheetOpen]);

  // Build combined endContent from resultCount + endContent props
  const combinedEndContent = useMemo((): React.ReactNode => {
    const resultCountNode =
      resultCountText != null ? (
        <span {...stylex.props(resultCountStyles.text)}>{resultCountText}</span>
      ) : null;

    if (resultCountNode && endContent) {
      return (
        <>
          {resultCountNode}
          {endContent}
        </>
      );
    }
    return resultCountNode || endContent || undefined;
  }, [resultCountText, endContent]);

  // ------------------------------------------------------- sheet trigger --

  // Disabled-reason tooltip for the sheet trigger. Disabled controls swallow
  // pointer events, so the listeners attach to the field's control box; the
  // trigger stays perceivable through aria-disabled (`spec:AST-085` FR1).
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: isSheetPresentation && showsDisabledMessage,
  });
  const rootRef = useMergedRefs(
    ref,
    rootElementRef,
    popover.triggerRef as React.Ref<HTMLDivElement>,
  );

  const openSheet = useCallback(() => {
    if (isDisabled) {
      return;
    }
    // The flow restores focus to the element that was active when it opened;
    // make sure that is the trigger even for a tap on a token.
    triggerRef.current?.focus({preventScroll: true});
    setIsSheetPresented(true);
    setIsSheetOpen(true);
  }, [isDisabled]);

  // The field's end lane — the result count and `endContent` — sits outside
  // the trigger button: a caller's action button there keeps its own tab stop
  // and taps (FR11; `spec:AST-055` FR3 forbids nesting it in a component
  // button), so a tap on it must not open the flow.
  const endLaneRef = useRef<HTMLDivElement>(null);
  const handleTriggerWrapperClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Tokens are display-only; a tap on them or the empty space around them
      // opens the flow. The trigger button handles its own click, and the end
      // lane handles its own.
      if (
        event.target instanceof Node &&
        (triggerRef.current?.contains(event.target) ||
          endLaneRef.current?.contains(event.target))
      ) {
        return;
      }
      openSheet();
    },
    [openSheet],
  );

  const handleTriggerFocusWithin = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // The flow focuses the trigger only after its exit completes; that focus
      // is the signal that the retained sheets can leave. If the resolution
      // moved to the popover meanwhile, the tokenizer input takes over the
      // focus once it mounts.
      if (!isSheetOpen && isSheetPresented) {
        setIsSheetPresented(false);
        if (resolvedPresentation === 'popover') {
          isInlineFocusPendingRef.current = true;
        }
        // The dialogs have closed: the page-body channel is exposed again.
        // One announcement — two in one tick would replace each other in the
        // single polite region.
        const {isCleared, resultCount} = afterCloseRef.current;
        afterCloseRef.current = {isCleared: false, resultCount: null};
        if (isCleared && resultCount != null) {
          announce(
            t('@astryx.powersearch.sheet.filtersClearedWithCount', {
              resultCount,
            }),
          );
        } else if (isCleared) {
          announce(t('@astryx.powersearch.sheet.filtersCleared'));
        } else if (resultCount != null) {
          announce(resultCount);
        }
      }
      if (
        !(event.relatedTarget instanceof Node) ||
        !event.currentTarget.contains(event.relatedTarget)
      ) {
        handleFieldFocus(event);
      }
    },
    [
      announce,
      handleFieldFocus,
      isSheetOpen,
      isSheetPresented,
      resolvedPresentation,
      t,
    ],
  );
  const handleTriggerBlurWithin = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !event.currentTarget.contains(event.relatedTarget)
      ) {
        handleFieldBlur(event);
      }
    },
    [handleFieldBlur],
  );

  if (isSheetPresentation) {
    const triggerDescribedBy =
      [
        status?.message ? statusMessageId : null,
        showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div ref={rootRef} {...themeProps('power-search')}>
        <Field
          label={label}
          isLabelHidden={isLabelHidden}
          inputID={triggerId}
          labelID={triggerLabelId}
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
            onClick={handleTriggerWrapperClick}
            onFocus={handleTriggerFocusWithin}
            onBlur={handleTriggerBlurWithin}
            aria-disabled={isDisabled ? true : undefined}
            {...stylex.props(
              inputWrapperStyles.base,
              sheetTriggerStyles.wrapper,
              filters.length > 0 && sheetTriggerStyles.wrapperWithTokens,
              sheetTriggerSizeStyles[size],
              isDisabled && inputWrapperStyles.disabled,
              status && inputStatusBorderStyles[status.type],
              status &&
                !isDisabled &&
                inputStatusHoverShadowStyles[status.type],
              status && inputStatusFocusWithinStyles[status.type],
            )}>
            {/* The trigger's name is the label plus everything visible here:
                the placeholder, or the tokens, so speech input can say what
                it sees and assistive technology hears the selected filters
                (FR11, WCAG 2.5.3). */}
            <div
              id={triggerContentId}
              {...stylex.props(sheetTriggerStyles.contentSection)}>
              {startIcon && (
                <span
                  {...stylex.props(
                    filters.length > 0 &&
                      sheetTriggerStyles.startIconWithTokens,
                  )}>
                  {renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
                </span>
              )}
              {tokenizerValue.map(item => (
                <React.Fragment key={item.id}>
                  {renderFilterToken(item, undefined)}
                </React.Fragment>
              ))}
              <button
                type="button"
                id={triggerId}
                ref={triggerRef}
                // The field's primary control: `data-testid` lands here, as it
                // lands on the combobox input in the popover presentation.
                data-testid={testId}
                autoFocus={hasAutoFocus}
                onClick={openSheet}
                aria-disabled={isDisabled ? true : undefined}
                aria-haspopup="dialog"
                aria-expanded={isSheetOpen}
                aria-labelledby={`${triggerLabelId} ${triggerContentId}`}
                aria-describedby={triggerDescribedBy}
                {...stylex.props(
                  sheetTriggerStyles.trigger,
                  filters.length > 0 && sheetTriggerStyles.triggerWithTokens,
                )}>
                {filters.length === 0 ? placeholder : null}
              </button>
            </div>
            {(endContent || isRenderable(resultCountText)) && (
              <div
                ref={endLaneRef}
                {...stylex.props(sheetTriggerStyles.endSection)}>
                {isRenderable(resultCountText) && (
                  <span {...stylex.props(resultCountStyles.text)}>
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
        <PowerSearchSheetHost
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          resultCountText={resultCountText}
          onFiltersCleared={handleFiltersCleared}
          config={config}
          configProp={configProp}
          filters={filters}
          onChange={onChange}
          searchSource={searchSource}
          placeholder={placeholder}
          isReadOnly={isReadOnly}
          isDisabled={isDisabled}
          hasClear={hasClear}
          maxOperatorMenuItems={maxOperatorMenuItems}
          maxSearchResults={maxSearchResults}
          saveButtonLabel={popoverSaveButtonLabelFromProps}
          components={componentOverrides}
        />
      </div>
    );
  }

  return (
    <>
      <div ref={rootRef} {...themeProps('power-search')}>
        <Tokenizer
          handleRef={tokenizerRef}
          label={label}
          isLabelHidden={isLabelHidden}
          searchSource={searchSource}
          value={tokenizerValue}
          onChange={handleTokenizerChange}
          renderToken={renderToken}
          renderItem={renderItem}
          maxMenuItems={MAX_BROWSE_MENU_ITEMS}
          menuWidth={menuWidth}
          placeholder={filters.length === 0 ? placeholder : ''}
          hasAutoFocus={hasAutoFocus}
          hasClear={hasClear && !isReadOnly}
          startIcon={startIcon}
          endContent={combinedEndContent}
          isDisabled={isDisabled}
          disabledMessage={disabledMessage}
          size={size}
          tokenOverflowBehavior={tokenOverflowBehavior}
          hasEntriesOnFocus
          debounceMs={0}
          status={status}
          statusVariant={statusVariant}
          onFocus={handleFieldFocus}
          onBlur={handleFieldBlur}
          containerXstyle={xstyle}
          containerClassName={className}
          containerStyle={style}
          data-testid={testId}
        />
      </div>
      {popover.render(popoverContent, {
        placement: 'below',
        alignment: 'start',
        offset: spacingVars['--spacing-1'],
        xstyle: [popoverLayerStyles.layer, layerAnimations.below],
      })}
    </>
  );
}

PowerSearch.displayName = 'PowerSearch';
