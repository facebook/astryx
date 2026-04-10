'use client';

/**
 * @file XDSChatComposerInput.tsx
 * @input Uses React, StyleX, useTriggerMenu, XDSSearchSource
 * @output Exports XDSChatComposerInput rich input + trigger types
 * @position Core implementation; consumed by index.ts, XDSChatComposer
 *
 * ContentEditable-based rich input for the chat composer.
 * Supports trigger menus (@ mentions, / commands) via XDSSearchSource,
 * inline token rendering, serialization, Enter/Shift+Enter, message
 * history, paste/drop file handling.
 *
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts
 * - /apps/storybook/stories/ChatComposer.stories.tsx
 * - /apps/storybook/stories/ChatComposerTriggers.stories.tsx
 */

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  type ReactNode,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react';
import {createPortal} from 'react-dom';
import type {XDSBaseProps} from '../XDSBaseProps';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useTriggerMenu} from './useTriggerMenu';
import {XDSBadge, type XDSBadgeProps} from '../Badge';
import {useXDSChatComposerContext} from './XDSChatContext';

// =============================================================================
// Types
// =============================================================================

/** Imperative handle exposed by XDSChatComposerInput via ref */
export interface XDSChatComposerInputHandle {
  /** Insert a token (badge chip) at the current cursor position */
  insertToken: (token: XDSChatComposerToken) => void;
  /** Insert plain text at the current cursor position */
  insertText: (text: string) => void;
  /** Focus the input */
  focus: () => void;
  /** Get the current serialized value */
  getValue: () => string;
}

/** Badge config for the common case \u2014 structured, simple, autocomplete-friendly */
export type XDSChatComposerTokenBadge = {
  /** Serialized value \u2014 what this token becomes in the onSubmit string */
  value: string;
} & Omit<XDSBadgeProps, 'ref' | 'xstyle' | 'className' | 'style'>;

/** Custom render for the escape hatch \u2014 tooltips, hovercards, rich content */
export type XDSChatComposerTokenCustom = {
  /** Serialized value \u2014 what this token becomes in the onSubmit string */
  value: string;
  /** Full control over the token\u2019s rendered content */
  render: () => ReactNode;
};

/**
 * Token inserted into the contentEditable by a trigger menu.
 *
 * Two forms:
 * - **Badge config** (recommended): `{ value, label, variant?, icon? }` \u2014
 *   renders an XDSBadge. Structured, themeable, autocomplete-friendly.
 * - **Custom render**: `{ value, render }` \u2014 full control via ReactNode.
 *   Use for tooltips, hovercards, or any content beyond a badge.
 */
export type XDSChatComposerToken =
  | XDSChatComposerTokenBadge
  | XDSChatComposerTokenCustom;

export type XDSChatComposerTriggerItem = XDSSearchableItem;

export type XDSChatComposerTrigger = {
  /** Character that activates this trigger menu (e.g. '@', '/') */
  character: string;
  /**
   * Search source providing items for this trigger.
   * Reuses the same XDSSearchSource interface as XDSTypeahead \u2014
   * supports sync/async search, bootstrap, and cancel().
   *
   * Use `createStaticSource()` for static item lists,
   * or implement XDSSearchSource for API-backed search.
   *
   * @example
   * ```
   * import {createStaticSource} from '@xds/core/Typeahead';
   * const mentionTrigger = {
   *   character: '@',
   *   searchSource: createStaticSource(users),
   *   onSelect: (item) => ({ value: `@${item.id}`, render: () => ... }),
   * };
   * ```
   */
  searchSource: XDSSearchSource;
  /** How to render each item in the trigger menu */
  renderItem?: (item: XDSSearchableItem) => ReactNode;
  /**
   * What to insert when an item is selected.
   * Return a string for plain text, or a Token for an inline chip.
   */
  onSelect: (item: XDSSearchableItem) => string | XDSChatComposerToken;
  /**
   * Parse serialized tokens back into rendered tokens.
   * Used when loading a previous message for editing.
   */
  deserialize?: (value: string) => XDSChatComposerToken | null;
  /** Text shown when no results found. @default 'No results' */
  emptySearchResultsText?: string;
  /** Text shown during async search. @default 'Searching\u2026' */
  loadingText?: string;
  /** Accessible label for the menu. @default 'Suggestions' */
  menuLabel?: string;
};

export interface XDSChatComposerInputProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange' | 'onPaste' | 'onSubmit'
> {
  /** Imperative handle ref for programmatic control */
  ref?: React.Ref<XDSChatComposerInputHandle>;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text. @default 'Type a message\u2026' */
  placeholder?: string;
  /** Max rows before scrolling. @default 8 */
  maxRows?: number;
  /** Trigger definitions for @ menus, / commands, etc. */
  triggers?: XDSChatComposerTrigger[];
  /**
   * Debounce delay in ms before triggering async search.
   * Set to 0 for immediate search.
   * @default 150
   */
  debounceMs?: number;
  /** Enable message history recall. @default true */
  hasHistory?: boolean;
  /** Accessible label. @default 'Message input' */
  label?: string;
  /** Disabled state. @default false */
  isDisabled?: boolean;
  /** Paste handler */
  onPaste?: (event: ClipboardEvent<HTMLDivElement>, text: string) => void;
  /** File drop/paste handler */
  onFiles?: (files: File[]) => void;
  /** Submit handler (Enter without Shift) */
  onSubmit?: (value: string) => void;
}

// =============================================================================
// Styles
// =============================================================================

const LINE_HEIGHT_PX = 22;

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: `${LINE_HEIGHT_PX}px`,
  },
  editable: {
    outline: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowY: 'auto',
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: `${LINE_HEIGHT_PX}px`,
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    caretColor: colorVars['--color-accent'],
    padding: spacingVars['--spacing-1'],
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: `${LINE_HEIGHT_PX}px`,
    fontFamily: typographyVars['--font-family-body'],
    userSelect: 'none',
    padding: spacingVars['--spacing-1'],
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
});

// =============================================================================
// Helpers
// =============================================================================

/** Type guard: does this token use the custom render path? */
function isCustomToken(
  token: XDSChatComposerToken,
): token is XDSChatComposerTokenCustom {
  return 'render' in token && typeof token.render === 'function';
}

/** Select all text in a contentEditable element. */
function selectAll(el: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}

function serialize(node: Node): string {
  let result = '';
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent ?? '';
    } else if (child instanceof HTMLElement) {
      if (child.hasAttribute('data-xds-token')) {
        result += child.getAttribute('data-xds-token-value') ?? '';
      } else if (child.tagName === 'BR') {
        result += '\n';
      } else {
        result += serialize(child);
      }
    }
  }
  return result;
}

/** Insert plain text at the current selection using the Selection API. */
function insertTextAtCursor(text: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // Move cursor after inserted text
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

// =============================================================================
// Component
// =============================================================================

export function XDSChatComposerInput(props: XDSChatComposerInputProps) {
  const composerCtx = useXDSChatComposerContext();

  const {
    ref,
    value: controlledValue = composerCtx?.value,
    onChange = composerCtx?.onChange,
    placeholder = composerCtx?.placeholder ?? 'Type a message\u2026',
    maxRows = 8,
    triggers,
    debounceMs = 150,
    hasHistory = true,
    label = 'Message input',
    isDisabled = composerCtx?.isDisabled ?? false,
    onPaste: onPasteProp,
    onFiles,
    onSubmit = composerCtx?.onSubmit,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const editableRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const currentDraftRef = useRef('');

  // Stable refs for imperative handle callbacks (avoid re-creating handle on every render)
  const insertTokenRef = useRef<(token: XDSChatComposerToken) => void>(
    () => {},
  );
  const insertTextRef = useRef<(text: string) => void>(() => {});

  useImperativeHandle(ref, () => ({
    insertToken: (token: XDSChatComposerToken) => insertTokenRef.current(token),
    insertText: (text: string) => insertTextRef.current(text),
    focus: () => editableRef.current?.focus(),
    getValue: () =>
      serialize(editableRef.current ?? document.createElement('div')),
  }));

  useEffect(() => {
    if (controlledValue !== undefined && editableRef.current) {
      const current = serialize(editableRef.current);
      if (current !== controlledValue) {
        editableRef.current.textContent = controlledValue;
        setIsEmpty(controlledValue.length === 0);
      }
    }
  }, [controlledValue]);

  const emitChange = useCallback(() => {
    if (!editableRef.current) return;
    const text = serialize(editableRef.current);
    // Browsers may leave a trailing <br> when all content is deleted,
    // which serializes to "\n". Treat whitespace-only as empty.
    setIsEmpty(text.trim().length === 0);
    onChange?.(text);
    // Clean up portals for tokens no longer in the DOM
    setTokenPortals(prev =>
      prev.filter(p => editableRef.current?.contains(p.span)),
    );
  }, [onChange]);

  // --- Token insertion ---
  // Track inserted token spans for portal rendering
  const [tokenPortals, setTokenPortals] = useState<
    Array<{id: string; span: HTMLSpanElement; token: XDSChatComposerToken}>
  >([]);

  const insertToken = useCallback((token: XDSChatComposerToken) => {
    const editable = editableRef.current;
    if (!editable) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Create a non-editable container — React will portal the Badge into it
    const span = document.createElement('span');
    const id = `token-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    span.setAttribute('data-xds-token', '');
    span.setAttribute('data-xds-token-value', token.value);
    span.setAttribute('data-xds-token-id', id);
    span.contentEditable = 'false';
    span.style.display = 'inline-flex';
    span.style.verticalAlign = 'baseline';

    range.deleteContents();
    range.insertNode(span);

    // Add a non-breaking space after the token and move cursor there
    const space = document.createTextNode('\u00A0');
    span.after(space);

    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Register for portal rendering
    setTokenPortals(prev => [...prev, {id, span, token}]);
  }, []);

  const insertText = useCallback((text: string) => {
    insertTextAtCursor(text);
  }, []);

  // Keep stable refs in sync for imperative handle
  insertTokenRef.current = insertToken;
  insertTextRef.current = insertText;

  // --- Trigger menu ---
  const triggerMenu = useTriggerMenu({
    triggers,
    editableRef,
    onInsertToken: insertToken,
    onInsertText: insertText,
    onEmitChange: emitChange,
    debounceMs,
  });

  const handleInput = useCallback(() => {
    emitChange();
    triggerMenu.handleInput();
  }, [emitChange, triggerMenu]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // Let trigger menu consume the event first
      if (triggerMenu.handleKeyDown(e)) {
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!editableRef.current) return;
        const text = serialize(editableRef.current).trim();
        if (!text) return;

        if (hasHistory) {
          historyRef.current.push(text);
          historyIndexRef.current = -1;
          currentDraftRef.current = '';
        }

        onSubmit?.(text);
        editableRef.current.textContent = '';
        setIsEmpty(true);
        onChange?.('');
        return;
      }

      // History navigation (only when trigger menu is not active)
      if (hasHistory && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (!editableRef.current) return;
        const text = serialize(editableRef.current);
        const history = historyRef.current;
        if (history.length === 0) return;

        if (e.key === 'ArrowUp') {
          if (historyIndexRef.current === -1) {
            currentDraftRef.current = text;
          }
          const nextIndex =
            historyIndexRef.current === -1
              ? history.length - 1
              : Math.max(0, historyIndexRef.current - 1);
          historyIndexRef.current = nextIndex;
          editableRef.current.textContent = history[nextIndex];
          selectAll(editableRef.current);
          emitChange();
          e.preventDefault();
        } else if (e.key === 'ArrowDown' && historyIndexRef.current !== -1) {
          const nextIndex = historyIndexRef.current + 1;
          if (nextIndex >= history.length) {
            historyIndexRef.current = -1;
            editableRef.current.textContent = currentDraftRef.current;
            if (currentDraftRef.current) selectAll(editableRef.current);
          } else {
            historyIndexRef.current = nextIndex;
            editableRef.current.textContent = history[nextIndex];
            selectAll(editableRef.current);
          }
          emitChange();
          e.preventDefault();
        }
      }
    },
    [hasHistory, onSubmit, onChange, emitChange, triggerMenu],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      const files = Array.from(e.clipboardData.files);
      if (files.length > 0) {
        e.preventDefault();
        onFiles?.(files);
        return;
      }

      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      insertTextAtCursor(text);

      onPasteProp?.(e, text);
      emitChange();
    },
    [onFiles, onPasteProp, emitChange],
  );

  const maxHeight = maxRows * LINE_HEIGHT_PX;

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-composer-input'),
        stylex.props(styles.root, isDisabled && styles.disabled, xstyle),
        className,
        style,
      )}
      {...rest}>
      {isEmpty && (
        <div {...stylex.props(styles.placeholder)} aria-hidden="true">
          {placeholder}
        </div>
      )}
      <div
        ref={editableRef}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable={!isDisabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        {...triggerMenu.ariaProps}
        {...stylex.props(styles.editable)}
        style={{maxHeight: `${maxHeight}px`}}
      />
      {triggerMenu.renderMenu()}
      {tokenPortals.map(({id, span, token}) =>
        createPortal(
          isCustomToken(token) ? (
            <span key={id}>{token.render()}</span>
          ) : (
            <XDSBadge
              key={id}
              label={token.label}
              variant={token.variant}
              icon={token.icon}
            />
          ),
          span,
        ),
      )}
    </div>
  );
}

XDSChatComposerInput.displayName = 'XDSChatComposerInput';

// =============================================================================
// Token element helper (for custom rendering in stories/consumers)
// =============================================================================

export function XDSChatComposerTokenElement({
  token,
}: {
  token: XDSChatComposerToken;
}) {
  return (
    <span
      data-xds-token=""
      data-xds-token-value={token.value}
      contentEditable={false}
      style={{display: 'inline-flex', verticalAlign: 'baseline'}}>
      {isCustomToken(token) ? (
        token.render()
      ) : (
        <XDSBadge
          label={token.label}
          variant={token.variant}
          icon={token.icon}
        />
      )}
    </span>
  );
}

XDSChatComposerTokenElement.displayName = 'XDSChatComposerTokenElement';
