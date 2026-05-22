// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import type {XDSBaseProps} from '../XDSBaseProps';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useTriggerMenu} from './useTriggerMenu';
import {
  useXDSChatComposerTokens,
  isCustomToken,
} from './useXDSChatComposerTokens';
import {ensureCaretInside, insertTextAtCursor} from './chatComposerSelection';
import {XDSChatPastedTextToken} from './XDSChatPastedTextToken';
import {
  useXDSChatPasteAsToken,
  type UseXDSChatPasteAsTokenReturn,
} from './useXDSChatPasteAsToken';
import {XDSBadge, type XDSBadgeProps} from '../Badge';
import {useXDSChatComposerContext} from './XDSChatContext';

// =============================================================================
// Types
// =============================================================================

/** Imperative handle exposed by XDSChatComposerInput via ref */
export interface XDSChatComposerInputHandle {
  /** Insert a token (badge chip) at the current cursor position */
  insertToken: (token: XDSChatComposerToken) => string | undefined;
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
  /** Paste handler. Called with the plain text before insertion. Return true to handle the paste yourself (e.g. insert a token instead). */
  onPaste?: (
    event: ClipboardEvent<HTMLDivElement>,
    text: string,
  ) => boolean | void;
  /**
   * Paste-as-token behavior. Defaults to converting pastes over 200 chars
   * into token chips. Pass a custom useXDSChatPasteAsToken result to override,
   * or false to disable.
   */
  pasteAsToken?: UseXDSChatPasteAsTokenReturn | false;
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
    pasteAsToken: pasteAsTokenProp,
    onFiles,
    onSubmit = composerCtx?.onSubmit,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const editableRef = useRef<HTMLDivElement>(null);
  const selfRef = useRef<XDSChatComposerInputHandle>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const currentDraftRef = useRef('');

  // Stable refs for imperative handle callbacks (avoid re-creating handle on every render)
  const insertTokenRef = useRef<
    (token: XDSChatComposerToken) => string | undefined
  >(() => undefined);
  const insertTextRef = useRef<(text: string) => void>(() => {});

  // A single handle object shared between the forwarded ref (via
  // `useImperativeHandle`) and `selfRef` (used by internal consumers
  // like paste-as-token). We can't rely on `useImperativeHandle`'s
  // factory to populate `selfRef` because React only runs that factory
  // when a parent attaches a ref — without this, paste-as-token would
  // silently no-op whenever `XDSChatComposerInput` is rendered without
  // a forwarded ref (e.g. inside `XDSChatComposer`).
  const handle: XDSChatComposerInputHandle = {
    insertToken: (token: XDSChatComposerToken) => insertTokenRef.current(token),
    expandToken: (id: string) => tokens.expandToken(id),
    insertText: (text: string) => insertTextRef.current(text),
    focus: () => editableRef.current?.focus(),
    getValue: () =>
      serialize(editableRef.current ?? document.createElement('div')),
  };
  selfRef.current = handle;
  useImperativeHandle(ref, () => handle);

  useEffect(() => {
    if (controlledValue !== undefined && editableRef.current) {
      const current = serialize(editableRef.current);
      if (current !== controlledValue) {
        editableRef.current.textContent = controlledValue;
        setIsEmpty(controlledValue.length === 0);
      }
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
        '[data-xds-token], [data-xds-dictation-interim]',
      ) != null;
    const trimmedEmpty = text.trim().length === 0 && !hasTokens;
    setIsEmpty(trimmedEmpty);
    onChange?.(trimmedEmpty ? '' : text);
    cleanupPortalsRef.current?.();
  }, [onChange]);

  // --- Token management (via hook) ---
  const tokens = useXDSChatComposerTokens({
    editableRef,
    onEmitChange: emitChange,
  });
  cleanupPortalsRef.current = tokens.cleanupPortals;

  // --- Paste-as-token (internal default) ---
  const defaultPasteAsToken = useXDSChatPasteAsToken({inputRef: selfRef});
  const pasteAsToken: UseXDSChatPasteAsTokenReturn | null =
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
            startContainer.previousSibling.hasAttribute('data-xds-token')
          ) {
            // Cursor is at start of text node right after a token — let
            // the browser handle it normally (it will select/delete the token)
          } else if (
            startContainer.nodeType === Node.TEXT_NODE &&
            startContainer.textContent === ' ' &&
            startOffset <= 1 &&
            startContainer.previousSibling instanceof HTMLElement &&
            startContainer.previousSibling.hasAttribute('data-xds-token')
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
              <XDSChatPastedTextToken
                key={id}
                text={token.value}
                onExpand={() => tokens.expandToken(id)}
              />
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
