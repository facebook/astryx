/**
 * @file XDSCodeEditor.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API
 * @output Exports XDSCodeEditor component and XDSCodeEditorProps
 * @position Lab implementation; editable code input
 *
 * Shares tokenization, span rendering, and highlight infrastructure
 * with XDSCodeBlock via codeShared utilities.
 */

'use client';

import {useEffect, useLayoutEffect, useRef, useCallback, useState} from 'react';
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '@xds/core/theme/tokens.stylex';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import type {TokenLine} from '@xds/core/CodeBlock';
import type {FlatTokenizer, LineTokenizer} from '@xds/core/CodeBlock';
import {
  ensureHighlightStyles,
  applyHighlightRangesChunked,
  hasHighlightAPI,
  useTokenLines,
  buildSpanLine,
} from '@xds/core/CodeBlock';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: 'var(--color-syntax-background)',
    border: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    overflow: 'hidden',
  },
  rootFocused: {
    borderColor: colorVars['--color-accent'],
    boxShadow: `0 0 0 1px ${colorVars['--color-accent']}`,
  },
  gutter: {
    flexShrink: 0,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-3'],
    textAlign: 'end',
    userSelect: 'none',
    color: 'var(--color-syntax-punctuation)',
    borderRight: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
  },
  gutterLine: {
    fontFamily: typographyVars['--font-family-code'],
    lineHeight: typeScaleVars['--text-code-leading'],
  },
  editorContainer: {
    flex: 1,
    overflow: 'auto',
  },
  editor: {
    display: 'block',
    minHeight: '3em',
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    margin: 0,
    fontFamily: typographyVars['--font-family-code'],
    color: 'var(--color-syntax-variable)',
    tabSize: 2,
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
    outline: 'none',
    caretColor: colorVars['--color-text-primary'],
    lineHeight: typeScaleVars['--text-code-leading'],
  },
  placeholder: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    left: spacingVars['--spacing-4'],
    color: colorVars['--color-text-disabled'],
    fontFamily: typographyVars['--font-family-code'],
    lineHeight: typeScaleVars['--text-code-leading'],
    pointerEvents: 'none',
    userSelect: 'none',
  },
  sizeSm: {
    fontSize: textSizeVars['--font-size-sm'],
  },
  sizeMd: {
    fontSize: typeScaleVars['--text-code-size'],
  },
  gutterSm: {
    fontSize: textSizeVars['--font-size-sm'],
  },
  gutterMd: {
    fontSize: typeScaleVars['--text-code-size'],
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface XDSCodeEditorProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Language for highlighting. @default "plaintext" */
  language?: string;
  /** Show line numbers. @default false */
  hasLineNumbers?: boolean;
  /** Read-only mode. @default false */
  isReadOnly?: boolean;
  /** Placeholder when empty */
  placeholder?: string;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Text size. @default "md" */
  size?: 'sm' | 'md';
  /** Custom tokenizer (flat or per-line) */
  tokenizer?: FlatTokenizer | LineTokenizer;
  /**
   * How to apply syntax highlighting.
   * - 'auto': Uses CSS Custom Highlight API when available, falls back to spans.
   * - 'ranges': Forces CSS Custom Highlight API (no-op if unavailable).
   * - 'spans': Renders colored `<span>` elements with transparent-text overlay.
   * @default 'auto'
   */
  highlightMode?: 'auto' | 'ranges' | 'spans';
}

// ---------------------------------------------------------------------------
// Editor behavior
// ---------------------------------------------------------------------------

const AUTO_CLOSE_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

// ---------------------------------------------------------------------------
// Span-mode overlay
// ---------------------------------------------------------------------------

function buildSpanContent(
  lines: string[],
  tokenLines: TokenLine[],
): React.ReactNode {
  return lines.map((line, i) => (
    <div key={i}>
      {buildSpanLine(line, tokenLines[i] ?? [])}
      {i < lines.length - 1 ? '\n' : null}
    </div>
  ));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * An editable code input using contentEditable="plaintext-only".
 *
 * Uses the same tokenization and highlight infrastructure as XDSCodeBlock.
 * Supports auto-indent, tab insertion, and bracket auto-closing.
 *
 * @example
 * ```tsx
 * const [code, setCode] = useState('');
 * <XDSCodeEditor
 *   value={code}
 *   onChange={setCode}
 *   language="typescript"
 *   hasLineNumbers
 * />
 * ```
 */
export function XDSCodeEditor({
  value,
  onChange,
  language = 'plaintext',
  hasLineNumbers = false,
  isReadOnly = false,
  placeholder,
  maxHeight,
  size = 'md',
  tokenizer: customTokenizer,
  highlightMode = 'auto',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const isComposingRef = useRef(false);

  const useSpans =
    highlightMode === 'spans' ||
    (highlightMode === 'auto' && !hasHighlightAPI());

  const lines = value.split('\n');
  const tokenLines = useTokenLines(value, language, customTokenizer);
  const hasTokens = tokenLines.some(line => line.length > 0);

  // Sync textContent with controlled value
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  // Ensure highlight styles are injected
  useLayoutEffect(() => {
    ensureHighlightStyles();
  }, []);

  // Apply CSS Custom Highlight API ranges
  useEffect(() => {
    if (useSpans) return;
    if (!hasHighlightAPI()) return;

    const el = editorRef.current;
    if (!el || tokenLines.length === 0) return;

    return applyHighlightRangesChunked(el, tokenLines);
  }, [useSpans, tokenLines]);

  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;
    const el = editorRef.current;
    if (!el) return;
    onChange(el.textContent ?? '');
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isReadOnly) return;

      // Tab key: insert 2 spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode('  ');
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        const el = editorRef.current;
        if (el) onChange(el.textContent ?? '');
        return;
      }

      // Enter key: preserve indentation
      if (e.key === 'Enter') {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const el = editorRef.current;
        if (!el) return;
        const fullText = el.textContent ?? '';

        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const cursorOffset = preCaretRange.toString().length;

        const beforeCursor = fullText.slice(0, cursorOffset);
        const lastNewline = beforeCursor.lastIndexOf('\n');
        const currentLine = beforeCursor.slice(lastNewline + 1);
        const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';

        const insertText = '\n' + indent;
        range.deleteContents();
        const textNode = document.createTextNode(insertText);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        onChange(el.textContent ?? '');
        return;
      }

      // Auto-close brackets and quotes
      const closeChar = AUTO_CLOSE_PAIRS[e.key];
      if (closeChar) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!range.collapsed) return;

        e.preventDefault();
        const textNode = document.createTextNode(e.key + closeChar);
        range.deleteContents();
        range.insertNode(textNode);
        range.setStart(textNode, 1);
        range.setEnd(textNode, 1);
        sel.removeAllRanges();
        sel.addRange(range);
        const el = editorRef.current;
        if (el) onChange(el.textContent ?? '');
      }
    },
    [isReadOnly, onChange],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);

  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const gutterSizeStyle = size === 'sm' ? styles.gutterSm : styles.gutterMd;
  const showPlaceholder = placeholder && value === '';

  const containerStyle: React.CSSProperties | undefined = maxHeight
    ? {
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      }
    : undefined;

  const spanOverlay =
    useSpans && hasTokens ? (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          whiteSpace: 'pre',
          wordBreak: 'normal',
          overflowWrap: 'normal',
        }}
        {...stylex.props(styles.editor, sizeStyle)}>
        {buildSpanContent(lines, tokenLines)}
      </div>
    ) : null;

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('codeeditor', {size, language}),
        stylex.props(styles.root, focused && styles.rootFocused, xstyle),
        className,
        style,
      )}
      {...props}>
      {hasLineNumbers && (
        <div
          {...stylex.props(styles.gutter, gutterSizeStyle)}
          aria-hidden="true">
          {lines.map((_, i) => (
            <div key={i} {...stylex.props(styles.gutterLine)}>
              {i + 1}
            </div>
          ))}
        </div>
      )}
      <div
        {...stylex.props(styles.editorContainer)}
        style={{...containerStyle, position: 'relative'}}>
        {showPlaceholder && (
          <div {...stylex.props(styles.placeholder, sizeStyle)}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contentEditable={isReadOnly ? false : ('plaintext-only' as any)}
          role="textbox"
          aria-multiline="true"
          aria-readonly={isReadOnly}
          spellCheck={false}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          {...stylex.props(styles.editor, sizeStyle)}
          style={
            useSpans && hasTokens
              ? {color: 'transparent', caretColor: 'inherit'}
              : undefined
          }
        />
        {spanOverlay}
      </div>
    </div>
  );
}

XDSCodeEditor.displayName = 'XDSCodeEditor';
