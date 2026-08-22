// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TouchTokenizerField.tsx
 * @input Uses React, Field, BottomSheet, List, TextInput, Token, Button,
 *   useTokenSelection
 * @output Exports TouchTokenizerField — the touch surface behind Tokenizer
 * @position Internal component; consumed by Tokenizer.tsx
 *
 * The touch half of `Tokenizer`, holding `Tokenizer`'s whole prop contract so
 * the two are interchangeable. Everything field-shaped — the `Field` wrapper,
 * the status treatment, the disabled-reason tooltip, `htmlName`'s hidden
 * inputs — behaves exactly as it does on the pointer control. What changes is
 * where you search and where the suggestions land.
 *
 * ## Why the pointer control cannot just be made bigger
 *
 * Its two core gestures both need a hardware keyboard. You type *between* the
 * tokens, in an input that shares a line with them; and you remove the last
 * one with Backspace on an empty input. On a phone, focusing that input raises
 * the virtual keyboard over the bottom half of the screen, which is where the
 * suggestion popover would open — and as each token is added the field grows a
 * line and pushes the page under your thumb.
 *
 * ## Three ideas in the surface
 *
 * 1. The tokens scroll sideways instead of wrapping. A row of chips that wraps
 *    reflows the whole form every time one is added or removed; a row that
 *    scrolls stays exactly one line tall forever, so nothing below it moves.
 * 2. Adding is a separate, fixed target. `Add` sits outside the scroller at the
 *    trailing edge, so it is in the same place with two tokens or twenty, and
 *    a tap on it can never be mistaken for the start of a sideways drag.
 * 3. The suggestions are a sheet, not a popover, and the sheet is pinned tall.
 *    Its search field is at the top where the keyboard cannot cover it, the
 *    results are full-width rows a thumb can hit, and `tall` is the one height
 *    BottomSheet keeps clear of the keyboard.
 *
 * ## The two props with no work to do here
 *
 * `tokenOverflowBehavior` describes what a WRAPPING row does when it runs out
 * of width; this row scrolls instead, so there is no overflow to summarise and
 * no focus state to expand into. `hasEntriesOnFocus` governs whether a popover
 * appears over the page before the user has typed — a sheet they just opened
 * on purpose is not unbidden, so the list always populates.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Tokenizer/Tokenizer.tsx
 * - /packages/core/src/Tokenizer/useTokenSelection.ts
 * - /packages/core/src/Tokenizer/Tokenizer.doc.mjs
 * - /packages/core/src/Tokenizer/TokenizerTouch.test.tsx
 */

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BottomSheet} from '../BottomSheet';
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
import {useAnnounce} from '../hooks/useAnnounce';
import {renderIconSlot} from '../Icon';
import {useTranslator} from '../i18n';
import {List, ListItem} from '../List';
import {useSize} from '../SizeContext/SizeContext';
import {Spinner} from '../Spinner';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {
  colorVars,
  spacingVars,
  sizeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Token} from '../Token';
import type {SearchableItem} from '../Typeahead/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import type {TokenizerProps} from './Tokenizer';
import {isCreatableItem, useTokenSelection} from './useTokenSelection';

/**
 * The comfortable minimum tap target on both iOS and Android. Applied as a
 * FLOOR under the size prop rather than replacing it: `size` still means what
 * it means, it just cannot produce a field a thumb misses.
 */
const TOUCH_TARGET = '44px';

const styles = stylex.create({
  wrapper: {
    // One line, always. The tokens scroll within it.
    flexWrap: 'nowrap',
    gap: spacingVars['--spacing-1'],
    height: 'auto',
    // Border concentricity, as on the pointer field: a token's radius-1 (4px)
    // sits concentric inside the wrapper's radius-2 (8px) when the inset is
    // 8 - 4 - 1 = 3px.
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    paddingInline: `calc(${spacingVars['--spacing-1']} - 1px)`,
  },
  scroller: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: spacingVars['--spacing-1'],
    // Takes the row's spare width, and may be narrower than its content.
    flex: '1 1 auto',
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    // A scrollbar inside a 44px field would eat the tokens it is measuring.
    // Touch surfaces overlay their scrollbars anyway; this only removes the
    // classic one a hybrid device might draw.
    scrollbarWidth: 'none',
    // Deliberately no touch-action: the default lets this scroller take
    // horizontal pans while the page keeps vertical ones. Claiming `pan-x`
    // here would kill any drag steeper than about 45 degrees outright.
    overscrollBehaviorInline: 'contain',
    // Nudge the inline padding onto the scroller so the first and last token
    // clear the wrapper's rounded corners as they pass under them.
    scrollPaddingInline: spacingVars['--spacing-1'],
  },
  startIcon: {
    display: 'flex',
    flexShrink: 0,
    // Restores the default 8px inline-start inset: the wrapper's padding is
    // cut to 3px for border concentricity with the chips.
    marginInlineStart: `calc(${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px)`,
  },
  token: {
    display: 'flex',
    flexShrink: 0,
  },
  placeholder: {
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInlineStart: `calc(${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px)`,
    // Below 16px iOS zooms the page when a control is tapped. Matches the
    // floor every other input in the system uses on a coarse pointer.
    fontSize: `max(1rem, ${typeScaleVars['--text-body-size']})`,
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  endSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
  },
  plus: {
    width: '1em',
    height: '1em',
    flexShrink: 0,
  },
  plusAccent: {
    color: colorVars['--color-icon-accent'],
  },
  addButton: {
    flexShrink: 0,
    minBlockSize: TOUCH_TARGET,
    minInlineSize: TOUCH_TARGET,
  },
  // ---- the sheet ----
  // A stacking context of its own, so the header below can out-rank the list
  // WITHOUT out-ranking the sheet's grab handle.
  //
  // Both live in the sheet panel's stacking context otherwise: the handle is
  // z-index 1 there, and List's rows are position: relative, so a sticky
  // header needs a layer to cover the rows and must not have one to stay under
  // the handle. Isolating scopes the header's z-index to this subtree and
  // enters the panel's context as one unit at auto, below the handle.
  sheetContent: {
    isolation: 'isolate',
  },
  sheetHeader: {
    position: 'sticky',
    insetBlockStart: 0,
    // Scoped by sheetContent's isolation: it covers the rows scrolling under
    // it, and cannot reach the grab handle.
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    // Opaque: the list scrolls underneath this.
    backgroundColor: colorVars['--color-background-surface'],
    paddingInline: spacingVars['--spacing-4'],
    // The handle pill floats in the top ~14px of the sheet, over this header's
    // top padding; spacing-4 keeps the heading's text clear of it without
    // reserving a band of its own.
    paddingBlockStart: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  sheetBody: {
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  sheetMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-8'],
  },
});

// The size scale with the thumb floor folded in. It has to be one declaration:
// StyleX compiles minBlockSize to min-height, so a separate floor would be the
// same property and simply lose the merge.
const sizeStyles = stylex.create({
  sm: {minHeight: `max(${TOUCH_TARGET}, ${sizeVars['--size-element-sm']})`},
  md: {minHeight: `max(${TOUCH_TARGET}, ${sizeVars['--size-element-md']})`},
  lg: {minHeight: `max(${TOUCH_TARGET}, ${sizeVars['--size-element-lg']})`},
});

/**
 * The plus that marks both "open the picker" and "this row adds".
 *
 * Drawn here rather than taken from the icon registry, which has no plus: it
 * is structural, part of this control's anatomy the way CheckboxIndicator's
 * tick is part of a checkbox, not content an app would swap. Two strokes, so
 * it costs nothing next to registering a name every theme would then owe an
 * icon for.
 */
function PlusGlyph({isAccent = false}: {isAccent?: boolean}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      {...stylex.props(styles.plus, isAccent && styles.plusAccent)}>
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * The touch-driven field: a row of tokens that scrolls sideways, and an `Add`
 * button that opens a pinned-tall sheet of suggestions.
 */
export function TouchTokenizerField<T extends SearchableItem>({
  label,
  isLabelHidden = false,
  description,
  isRequired = false,
  isOptional = false,
  status,
  statusVariant = 'attached',
  startIcon,
  labelTooltip,
  searchSource,
  value,
  onChange,
  renderItem,
  renderToken,
  maxEntries,
  placeholder,
  maxMenuItems = 10,
  emptySearchResultsText: emptySearchResultsTextFromProps,
  isDisabled = false,
  htmlName,
  disabledMessage,
  hasClear = false,
  endContent,
  hasAutoFocus,
  size: sizeProp,
  debounceMs = 150,
  hasCreate = false,
  onChangeQuery,
  onFocus,
  onBlur,
  width,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  handleRef,
}: TokenizerProps<T>) {
  const t = useTranslator();
  const announce = useAnnounce();
  const size = useSize(sizeProp, 'md');
  const addButtonId = useId();
  const labelId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const emptySearchResultsText =
    emptySearchResultsTextFromProps ??
    t('@astryx.typeahead.emptySearchResults');

  // The disabled reason rides on the Add button rather than the field wrapper.
  // On the pointer surface the wrapper carries it because a disabled control
  // swallows the hover the tooltip needs; here the Add button is the only
  // focusable thing left when the field is disabled, and Button already knows
  // this trick — given a tooltip it keeps itself focusable under aria-disabled
  // and wires the description up itself.
  const showsDisabledMessage = isDisabled && !!disabledMessage;

  useImperativeHandle(handleRef, () => ({
    focus() {
      addButtonRef.current?.focus();
    },
    blur() {
      addButtonRef.current?.blur();
    },
  }));

  const {isAtMax, decorateResults, addItem, removeItem, clearAll} =
    useTokenSelection<T>({
      value,
      onChange,
      searchSource,
      hasCreate,
      maxEntries,
      onAfterRemove: () => addButtonRef.current?.focus(),
    });

  // hasAutoFocus puts the caret in the pointer field's input on mount. There
  // is no input here, so it takes the control that opens one instead — and
  // does NOT open the sheet, which would be a modal nobody asked for. The
  // latch makes it a once-per-mount effect, as autoFocus is, without lying to
  // the dependency array about what it reads.
  const didAutoFocusRef = useRef(false);
  useEffect(() => {
    if (hasAutoFocus && !didAutoFocusRef.current) {
      didAutoFocusRef.current = true;
      addButtonRef.current?.focus();
    }
  }, [hasAutoFocus]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rawResults, setRawResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openSheet = useCallback(() => {
    if (isDisabled || isAtMax) {
      return;
    }
    setQuery('');
    setIsSheetOpen(true);
  }, [isDisabled, isAtMax]);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      setIsSheetOpen(open);
      if (!open) {
        setQuery('');
        onChangeQuery?.('');
      }
    },
    [onChangeQuery],
  );

  const handleQueryChange = useCallback(
    (next: string) => {
      setQuery(next);
      onChangeQuery?.(next);
    },
    [onChangeQuery],
  );

  // Search whatever the sheet is currently asking for. Unlike the pointer
  // surface, an empty query BOOTSTRAPS rather than showing nothing: the list
  // is the sheet's whole content, and an empty sheet with a search box in it
  // is a dead end. `hasEntriesOnFocus` is therefore not consulted here — it
  // governs whether an unbidden popover appears over the page, and a sheet
  // the user has just opened on purpose is not unbidden.
  //
  // The raw source is searched, not the selection-filtered one: that source is
  // rebuilt on every add, which would re-issue a request per token. Selected
  // items and the "Create X" entry are applied to the results instead.
  const searchGenRef = useRef(0);
  useEffect(() => {
    if (!isSheetOpen) {
      return;
    }
    const gen = ++searchGenRef.current;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      setIsLoading(true);
      try {
        const found =
          query.length > 0
            ? await searchSource.search(query)
            : await searchSource.bootstrap();
        if (searchGenRef.current !== gen) {
          return;
        }
        setRawResults(found.slice(0, maxMenuItems));
      } catch {
        if (searchGenRef.current === gen) {
          setRawResults([]);
        }
      } finally {
        if (searchGenRef.current === gen) {
          setIsLoading(false);
        }
      }
    };

    // Only typing is debounced. The open is not: it would show an empty sheet
    // for a debounce interval every time.
    if (query.length === 0 || debounceMs <= 0) {
      void run();
    } else {
      timer = setTimeout(() => void run(), debounceMs);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      searchSource.cancel?.();
    };
  }, [isSheetOpen, query, searchSource, debounceMs, maxMenuItems]);

  // Selected items drop out of the list the instant they are picked, without
  // another round trip.
  const suggestions = useMemo(
    () => decorateResults(rawResults, query),
    [decorateResults, rawResults, query],
  );

  // Announce what a search turned up, as the pointer surface's menu does.
  const announcedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isSheetOpen || isLoading || query.length === 0) {
      announcedRef.current = null;
      return;
    }
    const message =
      suggestions.length === 0
        ? emptySearchResultsText
        : t('@astryx.typeahead.resultCount', {count: suggestions.length});
    if (announcedRef.current !== message) {
      announcedRef.current = message;
      announce(message);
    }
  }, [
    isSheetOpen,
    isLoading,
    query,
    suggestions.length,
    emptySearchResultsText,
    announce,
    t,
  ]);

  const handlePick = useCallback(
    (item: T) => {
      addItem(item);
      setQuery('');
      onChangeQuery?.('');
      // The last allowed token closes the sheet: there is nothing left to
      // offer, and leaving an empty list up reads as a failure.
      if (maxEntries != null && value.length + 1 >= maxEntries) {
        setIsSheetOpen(false);
      }
    },
    [addItem, maxEntries, value.length, onChangeQuery],
  );

  // Enter on a phone keyboard is the "done" key, so it commits free text the
  // same way it does on the pointer surface. Without hasCreate there is
  // nothing to commit and the top suggestion is NOT taken: on this surface
  // suggestions are tapped, and nothing is highlighted to take.
  const handleSearchEnter = useCallback(() => {
    if (!hasCreate) {
      return;
    }
    const creatable = suggestions.find(isCreatableItem);
    if (creatable) {
      handlePick(creatable);
    }
  }, [hasCreate, suggestions, handlePick]);

  // Focus reaching the field from outside, and leaving it entirely, is
  // reported the same way the pointer surface reports it.
  const handleFocusCapture = useCallback(
    (e: FocusEvent) => {
      if (!wrapperRef.current?.contains(e.relatedTarget)) {
        onFocus?.(e);
      }
    },
    [onFocus],
  );

  const handleBlurCapture = useCallback(
    (e: FocusEvent) => {
      if (!wrapperRef.current?.contains(e.relatedTarget)) {
        onBlur?.(e);
      }
    },
    [onBlur],
  );

  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const addAccessibleName = t('@astryx.tokenizer.addTokens', {label});
  const isAddBlocked = isDisabled || isAtMax;

  const tokens = value.map(item => {
    const onRemoveItem = () => removeItem(item);

    if (renderToken) {
      return (
        <span key={item.id} {...stylex.props(styles.token)}>
          {renderToken(item, onRemoveItem)}
        </span>
      );
    }

    return (
      <Token
        key={item.id}
        label={item.label}
        size={size}
        onRemove={isDisabled ? undefined : onRemoveItem}
        isDisabled={isDisabled}
        xstyle={styles.token}
      />
    );
  });

  // A sm control is 28px tall — under the thumb floor, and this one is inside
  // a sheet with room to spare. The field's own size is untouched.
  const sheetControlSize = size === 'sm' ? 'md' : size;

  return (
    <Field
      ref={ref}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      // The control here is a GROUP (chips, each with its own remove button,
      // plus Add), which a <label> cannot name. isGroupLabel renders the label
      // as a span and the group takes it via aria-labelledby.
      inputID={addButtonId}
      labelID={labelId}
      isGroupLabel
      descriptionID={description ? descriptionId : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
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
      labelTooltip={labelTooltip}
      width={width}
      xstyle={xstyle}
      className={className}
      style={style}>
      <div
        ref={wrapperRef}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={ariaDescribedBy}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
        data-testid={testId}
        {...mergeProps(
          themeProps('tokenizer', {
            size,
            status: status?.type,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            inputWrapperStyles.base,
            styles.wrapper,
            sizeStyles[size],
            isDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && !isDisabled && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
          ),
        )}>
        {startIcon && (
          <span {...stylex.props(styles.startIcon)}>
            {renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
          </span>
        )}
        <div data-astryx-token-row="" {...stylex.props(styles.scroller)}>
          {value.length > 0 ? (
            tokens
          ) : (
            <span {...stylex.props(styles.placeholder)}>{placeholder}</span>
          )}
        </div>
        {(endContent || (hasClear && value.length > 0 && !isDisabled)) && (
          <div {...stylex.props(styles.endSection)}>
            {endContent}
            {hasClear && value.length > 0 && !isDisabled && (
              <InputClearButton
                label={t('@astryx.tokenizer.clearAll')}
                onClick={clearAll}
              />
            )}
          </div>
        )}
        <Button
          ref={addButtonRef}
          id={addButtonId}
          label={t('@astryx.tokenizer.add')}
          icon={<PlusGlyph />}
          // "Add" alone is the visible text; the accessible name says what it
          // adds to, and contains the visible text (WCAG 2.5.3).
          aria-label={addAccessibleName}
          aria-haspopup="dialog"
          aria-expanded={isSheetOpen}
          variant="ghost"
          size={size}
          isDisabled={isAddBlocked}
          tooltip={showsDisabledMessage ? disabledMessage : undefined}
          onClick={openSheet}
          xstyle={styles.addButton}
        />
        {htmlName != null &&
          value.map(item => (
            <input
              key={item.id}
              type="hidden"
              name={htmlName}
              value={item.id}
              // Disabled native controls are excluded from form submission;
              // mirror that for the hidden carriers.
              disabled={isDisabled}
            />
          ))}
      </div>
      <BottomSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        label={addAccessibleName}
        // Tall, not hug: the list is as long as the source makes it, and tall
        // is the one height BottomSheet keeps clear of the mobile keyboard
        // the search field raises.
        height="tall">
        <div {...stylex.props(styles.sheetContent)}>
          <div {...stylex.props(styles.sheetHeader)}>
            <Heading level={3}>{addAccessibleName}</Heading>
            <TextInput
              label={t('@astryx.tokenizer.searchLabel')}
              isLabelHidden
              placeholder={
                placeholder ?? t('@astryx.typeahead.searchPlaceholder')
              }
              startIcon="search"
              value={query}
              onChange={handleQueryChange}
              onEnter={handleSearchEnter}
              size={sheetControlSize}
              hasClear
            />
          </div>
          <div {...stylex.props(styles.sheetBody)}>
            {suggestions.length > 0 ? (
              <List hasDividers density="spacious">
                {suggestions.map(item => (
                  <ListItem
                    key={item.id}
                    label={renderItem ? renderItem(item) : item.label}
                    startContent={<PlusGlyph isAccent />}
                    onClick={() => handlePick(item)}
                  />
                ))}
              </List>
            ) : (
              <div {...stylex.props(styles.sheetMessage)}>
                {isLoading ? (
                  <Spinner size="sm" label={t('@astryx.typeahead.loading')} />
                ) : (
                  <Text color="secondary">{emptySearchResultsText}</Text>
                )}
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    </Field>
  );
}

TouchTokenizerField.displayName = 'TouchTokenizerField';
