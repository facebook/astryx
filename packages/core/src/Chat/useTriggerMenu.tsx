'use client';

/**
 * @file useTriggerMenu.tsx
 * @input Uses React, useXDSPopover
 * @output Exports useTriggerMenu hook for trigger-based menus in contentEditable
 * @position Internal hook; consumed by XDSChatComposerInput
 *
 * Detects trigger characters (@ / etc.) typed inside a contentEditable,
 * opens a popover at the cursor position with filtered items, handles
 * keyboard navigation, and inserts tokens or text on selection.
 */

import {
  useState,
  useCallback,
  useRef,
  useTransition,
  useId,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {
  XDSChatComposerTrigger,
  XDSChatComposerTriggerItem,
  XDSChatComposerToken,
} from './XDSChatComposerInput';

// =============================================================================
// Types
// =============================================================================

export interface TriggerMenuState {
  isActive: boolean;
  activeTrigger: XDSChatComposerTrigger | null;
  query: string;
  items: XDSChatComposerTriggerItem[];
  highlightedIndex: number;
  isLoading: boolean;
}

export interface UseTriggerMenuOptions {
  triggers?: XDSChatComposerTrigger[];
  editableRef: React.RefObject<HTMLDivElement | null>;
  onInsertToken: (token: XDSChatComposerToken) => void;
  onInsertText: (text: string) => void;
  onEmitChange: () => void;
}

export interface UseTriggerMenuReturn {
  state: TriggerMenuState;
  handleInput: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  renderMenu: () => ReactNode;
  reset: () => void;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '240px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    minWidth: '180px',
  },
  popoverSurface: {
    minWidth: '180px',
  },
  popoverGap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  itemLabel: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'center' as const,
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
  loadingState: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'center' as const,
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

// =============================================================================
// Helpers
// =============================================================================

function getTextBeforeCursor(editable: HTMLDivElement): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) return null;
  if (!editable.contains(range.startContainer)) return null;

  const node = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').slice(0, range.startOffset);
  }

  return null;
}

function findActiveTrigger(
  textBeforeCursor: string,
  triggers: XDSChatComposerTrigger[],
): {
  trigger: XDSChatComposerTrigger;
  query: string;
  triggerStart: number;
} | null {
  for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
    const char = textBeforeCursor[i];

    if (char === ' ' || char === '\n') {
      return null;
    }

    for (const trigger of triggers) {
      if (char === trigger.character) {
        const prevChar = i > 0 ? textBeforeCursor[i - 1] : null;
        if (prevChar === null || prevChar === ' ' || prevChar === '\n') {
          const query = textBeforeCursor.slice(i + 1);
          return {trigger, query, triggerStart: i};
        }
      }
    }
  }

  return null;
}

function deleteTriggerText(
  editable: HTMLDivElement,
  triggerStart: number,
): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return;

  const text = node.textContent ?? '';
  const cursorOffset = range.startOffset;

  const before = text.slice(0, triggerStart);
  const after = text.slice(cursorOffset);
  node.textContent = before + after;

  const newRange = document.createRange();
  newRange.setStart(node, triggerStart);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
}

// =============================================================================
// Hook
// =============================================================================

export function useTriggerMenu(
  options: UseTriggerMenuOptions,
): UseTriggerMenuReturn {
  const {triggers, editableRef, onInsertToken, onInsertText, onEmitChange} =
    options;

  const listboxId = useId();
  const [state, setState] = useState<TriggerMenuState>({
    isActive: false,
    activeTrigger: null,
    query: '',
    items: [],
    highlightedIndex: 0,
    isLoading: false,
  });

  const [, startTransition] = useTransition();
  const triggerStartRef = useRef<number>(-1);
  const virtualAnchorRef = useRef<HTMLSpanElement | null>(null);

  const popover = useXDSPopover({
    onHide: useCallback(() => {
      setState(prev => ({
        ...prev,
        isActive: false,
        activeTrigger: null,
        query: '',
        items: [],
        highlightedIndex: 0,
        isLoading: false,
      }));
      if (virtualAnchorRef.current?.parentNode) {
        virtualAnchorRef.current.parentNode.removeChild(
          virtualAnchorRef.current,
        );
        virtualAnchorRef.current = null;
      }
    }, []),
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  const reset = useCallback(() => {
    popover.hide();
    triggerStartRef.current = -1;
  }, [popover]);

  const placeVirtualAnchor = useCallback(() => {
    const editable = editableRef.current;
    if (!editable) return;

    if (virtualAnchorRef.current?.parentNode) {
      virtualAnchorRef.current.parentNode.removeChild(virtualAnchorRef.current);
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(true);

    const anchor = document.createElement('span');
    anchor.style.display = 'inline';
    anchor.style.width = '0';
    anchor.style.height = '0';
    anchor.style.overflow = 'hidden';
    anchor.setAttribute('data-xds-trigger-anchor', '');
    range.insertNode(anchor);
    virtualAnchorRef.current = anchor;

    range.setStartAfter(anchor);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    popover.triggerRef(anchor);
  }, [editableRef, popover]);

  const searchItems = useCallback(
    (trigger: XDSChatComposerTrigger, query: string) => {
      if (trigger.queryItemsAction) {
        setState(prev => ({...prev, isLoading: true}));
        startTransition(() => {
          trigger.queryItemsAction!(query).then(
            results => {
              setState(prev => ({
                ...prev,
                items: results,
                highlightedIndex: results.length > 0 ? 0 : -1,
                isLoading: false,
              }));
            },
            () => {
              setState(prev => ({
                ...prev,
                items: [],
                highlightedIndex: -1,
                isLoading: false,
              }));
            },
          );
        });
      } else if (trigger.items) {
        const lower = query.toLowerCase();
        const filtered = lower
          ? trigger.items.filter(item =>
              item.label.toLowerCase().includes(lower),
            )
          : trigger.items;
        setState(prev => ({
          ...prev,
          items: filtered,
          highlightedIndex: filtered.length > 0 ? 0 : -1,
          isLoading: false,
        }));
      }
    },
    [],
  );

  const selectItem = useCallback(
    (item: XDSChatComposerTriggerItem) => {
      const trigger = state.activeTrigger;
      if (!trigger) return;

      const editable = editableRef.current;
      if (!editable) return;

      if (virtualAnchorRef.current?.parentNode) {
        virtualAnchorRef.current.parentNode.removeChild(
          virtualAnchorRef.current,
        );
        virtualAnchorRef.current = null;
      }

      deleteTriggerText(editable, triggerStartRef.current);

      const result = trigger.onSelect(item);
      if (typeof result === 'string') {
        onInsertText(result);
      } else {
        onInsertToken(result);
      }

      onEmitChange();
      reset();
    },
    [
      state.activeTrigger,
      editableRef,
      onInsertText,
      onInsertToken,
      onEmitChange,
      reset,
    ],
  );

  const handleInput = useCallback(() => {
    if (!triggers || triggers.length === 0) return;

    const editable = editableRef.current;
    if (!editable) return;

    const textBefore = getTextBeforeCursor(editable);
    if (textBefore === null) {
      if (state.isActive) reset();
      return;
    }

    const found = findActiveTrigger(textBefore, triggers);
    if (!found) {
      if (state.isActive) reset();
      return;
    }

    const {trigger, query, triggerStart} = found;

    if (!state.isActive || state.activeTrigger !== trigger) {
      triggerStartRef.current = triggerStart;
      setState(prev => ({
        ...prev,
        isActive: true,
        activeTrigger: trigger,
        query,
        highlightedIndex: 0,
      }));
      placeVirtualAnchor();
      searchItems(trigger, query);
      popover.show();
    } else if (state.query !== query) {
      setState(prev => ({...prev, query}));
      searchItems(trigger, query);
    }
  }, [
    triggers,
    editableRef,
    state.isActive,
    state.activeTrigger,
    state.query,
    reset,
    placeVirtualAnchor,
    searchItems,
    popover,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!state.isActive || !popover.isOpen) return false;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setState(prev => ({
            ...prev,
            highlightedIndex:
              prev.highlightedIndex < prev.items.length - 1
                ? prev.highlightedIndex + 1
                : 0,
          }));
          return true;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setState(prev => ({
            ...prev,
            highlightedIndex:
              prev.highlightedIndex > 0
                ? prev.highlightedIndex - 1
                : prev.items.length - 1,
          }));
          return true;
        }
        case 'Enter':
        case 'Tab': {
          if (
            state.highlightedIndex >= 0 &&
            state.highlightedIndex < state.items.length
          ) {
            e.preventDefault();
            selectItem(state.items[state.highlightedIndex]);
            return true;
          }
          return false;
        }
        case 'Escape': {
          e.preventDefault();
          reset();
          return true;
        }
        default:
          return false;
      }
    },
    [
      state.isActive,
      state.highlightedIndex,
      state.items,
      popover.isOpen,
      selectItem,
      reset,
    ],
  );

  const renderMenu = useCallback((): ReactNode => {
    const getItemId = (index: number) => `${listboxId}-option-${index}`;
    const trigger = state.activeTrigger;

    return popover.render(
      <div
        id={listboxId}
        role="listbox"
        aria-label="Suggestions"
        {...mergeProps(
          xdsClassName('trigger-menu'),
          stylex.props(styles.dropdown),
        )}>
        {state.isLoading ? (
          <div {...stylex.props(styles.loadingState)}>Searching…</div>
        ) : state.items.length === 0 && state.isActive ? (
          <div {...stylex.props(styles.emptyState)}>No results</div>
        ) : (
          state.items.map((item, index) => (
            <div
              key={item.id}
              id={getItemId(index)}
              role="option"
              aria-selected={index === state.highlightedIndex}
              tabIndex={-1}
              onClick={() => selectItem(item)}
              onMouseEnter={() =>
                setState(prev => ({...prev, highlightedIndex: index}))
              }
              {...stylex.props(
                styles.item,
                index === state.highlightedIndex && styles.itemHighlighted,
              )}>
              {trigger?.renderItem ? (
                trigger.renderItem(item)
              ) : (
                <span {...stylex.props(styles.itemLabel)}>{item.label}</span>
              )}
            </div>
          ))
        )}
      </div>,
      {
        placement: 'above',
        alignment: 'start',
        xstyle: [styles.popoverSurface, styles.popoverGap],
      },
    );
  }, [popover, listboxId, state, selectItem]);

  return {
    state,
    handleInput,
    handleKeyDown,
    renderMenu,
    reset,
  };
}
