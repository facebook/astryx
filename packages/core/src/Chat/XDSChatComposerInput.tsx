'use client';

/**
 * @file XDSChatComposerInput.tsx
 * ContentEditable-based rich input for the chat composer.
 * Supports trigger menus (@ mentions, / commands), inline token rendering,
 * serialization, Enter/Shift+Enter, message history, paste/drop file handling.
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
  /** Serialized value — what this token becomes in the onSubmit string */
  value: string;
  /** How this token renders inside the contentEditable */
  render: () => ReactNode;
};

export type XDSChatComposerTriggerItem = {
  id: string;
  label: string;
  [key: string]: unknown;
};

export type XDSChatComposerTrigger = {
  /** Character that activates this trigger menu (e.g. '@', '/') */
  character: string;
  /** Static items for the trigger menu. Use for small, known lists. */
  items?: XDSChatComposerTriggerItem[];
  /**
   * Async action to query items based on user input.
   * Use for dynamic lists (e.g. contact search, API-backed data).
   */
  queryItemsAction?: (query: string) => Promise<XDSChatComposerTriggerItem[]>;
  /** How to render each item in the trigger menu */
  renderItem?: (item: XDSChatComposerTriggerItem) => ReactNode;
  /**
   * What to insert when an item is selected.
   * Return a string for plain text, or a Token for an inline chip.
   */
  onSelect: (item: XDSChatComposerTriggerItem) => string | XDSChatComposerToken;
  /**
   * Parse serialized tokens back into rendered tokens.
   * Used when loading a previous message for editing.
   */
  deserialize?: (value: string) => XDSChatComposerToken | null;
};

export interface XDSChatComposerInputProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange' | 'onPaste' | 'onSubmit'
> {
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

// =============================================================================
// Component
// =============================================================================

export function XDSChatComposerInput(props: XDSChatComposerInputProps) {
  const {
    value: controlledValue,
    onChange,
    placeholder = 'Type a message\u2026',
    maxRows = 8,
    triggers,
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

    const span = document.createElement('span');
    span.setAttribute('data-xds-token', '');
    span.setAttribute('data-xds-token-value', token.value);
    span.contentEditable = 'false';
    span.textContent = token.value;

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
    document.execCommand('insertText', false, text);
  }, []);

  // --- Trigger menu ---
  const triggerMenu = useTriggerMenu({
    triggers,
    editableRef,
    onInsertToken: insertToken,
    onInsertText: insertText,
    onEmitChange: emitChange,
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
      document.execCommand('insertText', false, text);

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
