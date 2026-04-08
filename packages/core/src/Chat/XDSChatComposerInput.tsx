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
  type ReactNode,
  type KeyboardEvent,
  type ClipboardEvent,
  type DragEvent,
} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useTriggerMenu} from './useTriggerMenu';

// =============================================================================
// Types
// =============================================================================

export type XDSChatComposerToken = {
  /** Serialized value \u2014 what this token becomes in the onSubmit string */
  value: string;
  /** How this token renders inside the contentEditable */
  render: () => ReactNode;
};

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
   *
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
  /** Ref to the root element */
  ref?: React.Ref<HTMLDivElement>;
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
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
    color: colorVars['--color-text-disabled'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: `${LINE_HEIGHT_PX}px`,
    fontFamily: typographyVars['--font-family-body'],
    userSelect: 'none',
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  token: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent-muted'],
    color: colorVars['--color-text-accent'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    paddingInline: spacingVars['--spacing-1-5'],
    paddingBlock: spacingVars['--spacing-0-5'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    verticalAlign: 'baseline',
    userSelect: 'all',
  },
});

// =============================================================================
// Helpers
// =============================================================================

function serialize(node: Node): string {
  let result = '';
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent ?? '';
    } else if (child instanceof HTMLElement) {
      if (child.hasAttribute('data-xds-trigger-anchor')) {
        continue;
      }
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
  const {
    ref,
    value: controlledValue,
    onChange,
    placeholder = 'Type a message\u2026',
    maxRows = 8,
    triggers,
    debounceMs = 150,
    hasHistory = true,
    label = 'Message input',
    isDisabled = false,
    onPaste: onPasteProp,
    onFiles,
    onSubmit,
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
    setIsEmpty(text.length === 0);
    onChange?.(text);
  }, [onChange]);

  // --- Token insertion ---
  const insertToken = useCallback((token: XDSChatComposerToken) => {
    const editable = editableRef.current;
    if (!editable) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Create token span with rendered content
    const span = document.createElement('span');
    span.setAttribute('data-xds-token', '');
    span.setAttribute('data-xds-token-value', token.value);
    span.contentEditable = 'false';
    // Render the token's visual representation
    const rendered = token.render();
    if (typeof rendered === 'string') {
      span.textContent = rendered;
    } else {
      // For ReactNode, fall back to the serialized value as text
      // (React rendering into imperative DOM isn't possible here \u2014
      // the token styling comes from the parent's CSS)
      span.textContent = token.value;
    }

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
  }, []);

  const insertText = useCallback((text: string) => {
    insertTextAtCursor(text);
  }, []);

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
          emitChange();
          e.preventDefault();
        } else if (e.key === 'ArrowDown' && historyIndexRef.current !== -1) {
          const nextIndex = historyIndexRef.current + 1;
          if (nextIndex >= history.length) {
            historyIndexRef.current = -1;
            editableRef.current.textContent = currentDraftRef.current;
          } else {
            historyIndexRef.current = nextIndex;
            editableRef.current.textContent = history[nextIndex];
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

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        e.preventDefault();
        onFiles?.(files);
      }
    },
    [onFiles],
  );

  const maxHeight = maxRows * LINE_HEIGHT_PX;

  return (
    <div
      ref={ref}
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
        onDrop={handleDrop}
        {...triggerMenu.ariaProps}
        {...stylex.props(styles.editable)}
        style={{maxHeight: `${maxHeight}px`}}
      />
      {triggerMenu.renderMenu()}
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
      {...stylex.props(styles.token)}>
      {token.render()}
    </span>
  );
}

XDSChatComposerTokenElement.displayName = 'XDSChatComposerTokenElement';
