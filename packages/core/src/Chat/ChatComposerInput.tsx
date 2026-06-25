// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatComposerInput.tsx
 * @input Uses React, StyleX, useTriggerMenu, SearchSource
 * @output Exports ChatComposerInput rich input + trigger types
 * @position Core implementation; consumed by index.ts, ChatComposer;
 *   forwards DOM ref and exposes editor control via handleRef
 *
 * ContentEditable-based rich input for the chat composer.
 * Supports trigger menus (@ mentions, / commands) via SearchSource,
 * inline token rendering, serialization, Enter/Shift+Enter, message
 * history, paste/drop file handling, and mobile-safe touch typography.
 *
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts
 * - /apps/storybook/stories/ChatComposer.stories.tsx
 * - /packages/cli/templates/blocks/components/ChatComposerInput/ (block examples)
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
import type {BaseProps} from '../BaseProps';
import type {SearchableItem, SearchSource} from '../Typeahead/types';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {useTriggerMenu} from './useTriggerMenu';
import {
  useChatComposerTokens,
  isCustomToken,
} from './useChatComposerTokens';
import {ensureCaretInside, insertTextAtCursor} from './chatComposerSelection';
import {ChatPastedTextToken} from './ChatPastedTextToken';
import {
  useChatPasteAsToken,
  type UseChatPasteAsTokenReturn,
} from './useChatPasteAsToken';
import {Badge, type BadgeProps} from '../Badge';
import {useChatComposerContext} from './ChatContext';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

/** Imperative handle exposed by ChatComposerInput via handleRef */
export interface ChatComposerInputHandle {
  /** Insert a token (badge chip) at the current cursor position */
  insertToken: (token: ChatComposerToken) => string | undefined;
  /** Expand a token — replace the token span with its serialized text value */
  expandToken: (id: string) => void;
  /** Insert plain text at the current cursor position */
  insertText: (text: string) => void;
  /** Focus the input */
  focus: () => void;
  /** Get the current serialized value */
  getValue: () => string;
}

/** Badge config for the common case \u2014 structured, simple, autocomplete-friendly */
export type ChatComposerTokenBadge = {
  /** Serialized value \u2014 what this token becomes in the onSubmit string */
  value: string;
} & Omit<BadgeProps, 'ref' | 'xstyle' | 'className' | 'style'>;

/** Custom render for the escape hatch \u2014 tooltips, hovercards, rich content */
export type ChatComposerTokenCustom = {
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
 *   renders an Badge. Structured, themeable, autocomplete-friendly.
 * - **Custom render**: `{ value, render }` \u2014 full control via ReactNode.
 *   Use for tooltips, hovercards, or any content beyond a badge.
 */
export type ChatComposerToken =
  | ChatComposerTokenBadge
  | ChatComposerTokenCustom;

export type ChatComposerTriggerItem = SearchableItem;

export type ChatComposerTrigger = {
  /** Character that activates this trigger menu (e.g. '@', '/') */
  character: string;
  /**
   * Search source providing items for this trigger.
   * Reuses the same SearchSource interface as Typeahead \u2014
   * supports sync/async search, bootstrap, and cancel().
   *
   * Use `createStaticSource()` for static item lists,
   * or implement SearchSource for API-backed search.
   *
   * @example
   * ```
   * import {createStaticSource} from '@astryxdesign/core/Typeahead';
   * const mentionTrigger = {
   *   character: '@',
   *   searchSource: createStaticSource(users),
   *   onSelect: (item) => ({ value: `@${item.id}`, render: () => ... }),
   * };
   * ```
   */
  searchSource: SearchSource;
  /** How to render each item in the trigger menu */
  renderItem?: (item: SearchableItem) => ReactNode;
  /**
   * What to insert when an item is selected.
   * Return a string for plain text, or a Token for an inline chip.
   */
  onSelect: (item: SearchableItem) => string | ChatComposerToken;
  /**
   * Parse serialized tokens back into rendered tokens.
   * Used when loading a previous message for editing.
   */
  deserialize?: (value: string) => ChatComposerToken | null;
  /** Text shown when no results found. @default 'No results' */
  emptySearchResultsText?: string;
  /** Text shown during async search. @default 'Searching\u2026' */
  loadingText?: string;
  /** Accessible label for the menu. @default 'Suggestions' */
  menuLabel?: string;
};

export interface ChatComposerInputProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange' | 'onPaste' | 'onSubmit'
> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Imperative handle ref for programmatic control. */
  handleRef?: React.Ref<ChatComposerInputHandle>;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text. @default 'Type a message\u2026' */
  placeholder?: string;
  /** Max rows before scrolling. @default 8 */
  maxRows?: number;
  /** Trigger definitions for @ menus, / commands, etc. */
  triggers?: ChatComposerTrigger[];
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
  /** Paste handler. Called with the plain text before insertion. Return true to handle the paste yourself (e.g. insert a token instead). */
  onPaste?: (
    event: ClipboardEvent<HTMLDivElement>,
    text: string,
  ) => boolean | void; // eslint-disable-line @typescript-eslint/no-invalid-void-type
  /**
   * Paste-as-token behavior. Defaults to converting pastes over 200 chars
   * into token chips. Pass a custom useChatPasteAsToken result to override,
   * or false to disable.
   */
  pasteAsToken?: UseChatPasteAsTokenReturn | false;
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
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
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
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
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

/** Select all text in a contentEditable element. */
function selectAll(el: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
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
      if (child.hasAttribute('data-astryx-token')) {
        result += child.getAttribute('data-astryx-token-value') ?? '';
      } else if (child.tagName === 'BR') {
        result += '\n';
      } else {
        result += serialize(child);
      }
    }
  }
  return result;
}

// =============================================================================
// Component
// =============================================================================

export function ChatComposerInput(props: ChatComposerInputProps) {
  const composerCtx = useChatComposerContext();

  const {
    ref,
    handleRef,
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
    pasteAsToken: pasteAsTokenProp,
    onFiles,
    onSubmit = composerCtx?.onSubmit,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const editableRef = useRef<HTMLDivElement>(null);
  const selfRef = useRef<ChatComposerInputHandle>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const currentDraftRef = useRef('');
  // One-shot marker: when set, holds the value we expect the parent
  // to echo back as `controlledValue` after our latest `onChange`
  // emission. We use it to skip a single `useEffect` resync, because
  // resyncing would (a) collapse the caret to offset 0 and (b)
  // discard any characters the user typed between the emit and the
  // resulting commit. Cleared on consumption — either when the echo
  // arrives or when a non-echoing external update overwrites it — so
  // a later external set back to the same string is never
  // incorrectly skipped.
  const pendingEchoValueRef = useRef<string | undefined>(undefined);

  // Stable refs for imperative handle callbacks (avoid re-creating handle on every render)
  const insertTokenRef = useRef<
    (token: ChatComposerToken) => string | undefined
  >(() => undefined);
  const insertTextRef = useRef<(text: string) => void>(() => {});

  // A single handle object shared between the forwarded ref (via
  // `useImperativeHandle`) and `selfRef` (used by internal consumers
  // like paste-as-token). We can't rely on `useImperativeHandle`'s
  // factory to populate `selfRef` because React only runs that factory
  // when a parent attaches a ref — without this, paste-as-token would
  // silently no-op whenever `ChatComposerInput` is rendered without
  // a forwarded ref (e.g. inside `ChatComposer`).
  const handle: ChatComposerInputHandle = {
    insertToken: (token: ChatComposerToken) => insertTokenRef.current(token),
    expandToken: (id: string) => tokens.expandToken(id),
    insertText: (text: string) => insertTextRef.current(text),
    focus: () => editableRef.current?.focus(),
    getValue: () =>
      serialize(editableRef.current ?? document.createElement('div')),
  };
  selfRef.current = handle;
  useImperativeHandle(handleRef, () => handle);

  useEffect(() => {
    if (controlledValue === undefined || !editableRef.current) {
      return;
    }
    // Skip exactly one echo of our most recent `onChange` emission:
    // the DOM is already authoritative for that value, and the user
    // may have typed more characters between the emit and this
    // effect running. Consume the marker so a later external set to
    // the same string is still applied.
    if (controlledValue === pendingEchoValueRef.current) {
      pendingEchoValueRef.current = undefined;
      return;
    }
    const editable = editableRef.current;
    if (serialize(editable) !== controlledValue) {
      // Genuine external override — invalidate any stale pending
      // echo before we rewrite the DOM.
      pendingEchoValueRef.current = undefined;
      const wasFocused = document.activeElement === editable;
      editable.textContent = controlledValue;
      // Setting `textContent` tears down the existing text node,
      // which collapses any Selection inside this editable to
      // offset 0. If the user was focused (e.g. a programmatic
      // insert from a slash-menu pick), restore the caret to the
      // end of the new content so the next keystroke appends rather
      // than prepends.
      if (wasFocused) {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(editable);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      setIsEmpty(controlledValue.length === 0);
    } else {
      pendingEchoValueRef.current = undefined;
    }
  }, [controlledValue]);

  const cleanupPortalsRef = useRef<(() => void) | null>(null);

  const emitChange = useCallback(() => {
    if (!editableRef.current) {
      return;
    }
    const text = serialize(editableRef.current);
    // Browsers may leave a trailing <br> when all content is deleted,
    // which serializes to "\n". Treat whitespace-only as empty.
    const hasTokens =
      editableRef.current.querySelector(
        '[data-astryx-token], [data-astryx-dictation-interim]',
      ) != null;
    const trimmedEmpty = text.trim().length === 0 && !hasTokens;
    const nextValue = trimmedEmpty ? '' : text;
    pendingEchoValueRef.current = nextValue;
    setIsEmpty(trimmedEmpty);
    onChange?.(nextValue);
    cleanupPortalsRef.current?.();
  }, [onChange]);

  // --- Token management (via hook) ---
  const tokens = useChatComposerTokens({
    editableRef,
    onEmitChange: emitChange,
  });
  cleanupPortalsRef.current = tokens.cleanupPortals;

  // --- Paste-as-token (internal default) ---
  const defaultPasteAsToken = useChatPasteAsToken({inputRef: selfRef});
  const pasteAsToken: UseChatPasteAsTokenReturn | null =
    pasteAsTokenProp === false
      ? null
      : (pasteAsTokenProp ?? defaultPasteAsToken);

  const insertText = useCallback((text: string) => {
    const editable = editableRef.current;
    if (!editable) {
      return;
    }
    insertTextAtCursor(editable, text);
  }, []);

  // Keep stable refs in sync for imperative handle
  insertTokenRef.current = tokens.insertToken;
  insertTextRef.current = insertText;

  // --- Trigger menu ---
  const triggerMenu = useTriggerMenu({
    triggers,
    editableRef,
    onInsertToken: tokens.insertToken,
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

      // Handle Backspace near tokens — prevent browser from creating
      // stray <br> elements or moving the cursor unexpectedly.
      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        if (selection && selection.isCollapsed && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const {startContainer, startOffset} = range;

          // Case 1: Cursor is in a text node right after a token.
          // If the text node is just the trailing NBSP, remove it
          // and place cursor after the token.
          if (
            startContainer.nodeType === Node.TEXT_NODE &&
            startOffset === 0 &&
            startContainer.previousSibling instanceof HTMLElement &&
            startContainer.previousSibling.hasAttribute('data-astryx-token')
          ) {
            // Cursor is at start of text node right after a token — let
            // the browser handle it normally (it will select/delete the token)
          } else if (
            startContainer.nodeType === Node.TEXT_NODE &&
            startContainer.textContent === ' ' &&
            startOffset <= 1 &&
            startContainer.previousSibling instanceof HTMLElement &&
            startContainer.previousSibling.hasAttribute('data-astryx-token')
          ) {
            // Cursor is in or after the trailing NBSP — remove the NBSP
            // and the token in one action
            e.preventDefault();
            const tokenSpan = startContainer.previousSibling;
            const parent = startContainer.parentNode;
            if (parent) {
              parent.removeChild(startContainer);
              parent.removeChild(tokenSpan);
            }
            emitChange();
            return;
          }
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!editableRef.current) {
          return;
        }
        const text = serialize(editableRef.current).trim();
        if (!text) {
          return;
        }

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
        if (!editableRef.current) {
          return;
        }
        const text = serialize(editableRef.current);
        const history = historyRef.current;
        if (history.length === 0) {
          return;
        }

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
            if (currentDraftRef.current) {
              selectAll(editableRef.current);
            }
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
      const editable = editableRef.current;
      if (!editable) {
        return;
      }

      // Place a caret at the end of the editable if the Selection has
      // no Range inside it — programmatic focus alone doesn't create
      // one in Chromium/Firefox.
      ensureCaretInside(editable);

      // Handle paste near/into tokens first
      if (tokens.handlePaste(e)) {
        return;
      }

      const files = Array.from(e.clipboardData.files);
      if (files.length > 0) {
        e.preventDefault();
        onFiles?.(files);
        return;
      }

      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');

      // Paste-as-token: convert long pastes to token chips
      if (pasteAsToken?.onPaste(e, text)) {
        emitChange();
        return;
      }

      // Consumer onPaste — return true to prevent default text insert
      const handled = onPasteProp?.(e, text);
      if (handled) {
        emitChange();
        return;
      }

      insertTextAtCursor(editable, text);
      emitChange();
    },
    [onFiles, onPasteProp, emitChange, tokens, pasteAsToken],
  );

  const maxHeight = maxRows * LINE_HEIGHT_PX;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('chat-composer-input'),
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
        {...mergeProps(stylex.props(styles.editable), {
          style: {maxHeight: `${maxHeight}px`},
        })}
      />
      {triggerMenu.renderMenu()}
      {tokens.tokenPortals
        .filter(({span}) => span.isConnected)
        .map(({id, span, token}) =>
          createPortal(
            isCustomToken(token) ? (
              <span key={id}>{token.render()}</span>
            ) : token.value.length >
              (pasteAsToken === null ? Infinity : 200) ? (
              <ChatPastedTextToken
                key={id}
                text={token.value}
                onExpand={() => tokens.expandToken(id)}
              />
            ) : (
              <Badge
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

ChatComposerInput.displayName = 'ChatComposerInput';

// =============================================================================
// Token element helper (for custom rendering in stories/consumers)
// =============================================================================

export function ChatComposerTokenElement({
  token,
}: {
  token: ChatComposerToken;
}) {
  return (
    <span
      data-astryx-token=""
      data-astryx-token-value={token.value}
      contentEditable={false}
      style={{display: 'inline-flex', verticalAlign: 'baseline'}}>
      {isCustomToken(token) ? (
        token.render()
      ) : (
        <Badge
          label={token.label}
          variant={token.variant}
          icon={token.icon}
        />
      )}
    </span>
  );
}

ChatComposerTokenElement.displayName = 'ChatComposerTokenElement';
