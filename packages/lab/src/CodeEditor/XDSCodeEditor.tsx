/**
 * @file XDSCodeEditor.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API
 * @output Exports XDSCodeEditor component and XDSCodeEditorProps
 * @position Core implementation; editable code input (lab/experimental)
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/CodeEditor/index.ts (exports if types change)
 * - /packages/lab/src/CodeBlock/tokenizer.ts (shared tokenizer)
 * - /packages/lab/src/CodeBlock/highlightStyles.ts (::highlight rules)
 */

'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  typographyVars,
  lineHeightVars,
} from '@xds/core/theme/tokens.stylex';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {
  tokenize,
  tokenizeAsync,
  SYNC_TOKENIZE_THRESHOLD,
} from '../CodeBlock/tokenizer';
import type {Token} from '../CodeBlock/tokenizer';
import {ensureHighlightStyles, TOKEN_TYPES} from '../CodeBlock/highlightStyles';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    border: `1px solid ${colorVars['--color-border']}`,
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
    color: colorVars['--color-text-disabled'],
    borderRight: `1px solid ${colorVars['--color-border']}`,
  },
  gutterLine: {
    fontFamily: typographyVars['--font-family-code'],
    lineHeight: lineHeightVars['--leading-normal'],
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
    color: colorVars['--color-text-primary'],
    tabSize: 2,
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
    outline: 'none',
    caretColor: colorVars['--color-text-primary'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
  placeholder: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    left: spacingVars['--spacing-4'],
    color: colorVars['--color-text-disabled'],
    fontFamily: typographyVars['--font-family-code'],
    lineHeight: lineHeightVars['--leading-normal'],
    pointerEvents: 'none',
    userSelect: 'none',
  },
  sizeSm: {
    fontSize: textSizeVars['--font-size-sm'],
  },
  sizeMd: {
    fontSize: textSizeVars['--font-size-base'],
  },
  gutterSm: {
    fontSize: textSizeVars['--font-size-sm'],
  },
  gutterMd: {
    fontSize: textSizeVars['--font-size-base'],
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface XDSCodeEditorProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the root element */
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
  /** Custom tokenizer */
  tokenizer?: (
    code: string,
    language: string,
  ) => Array<{type: string; start: number; end: number}>;
  /**
   * How to apply syntax highlighting.
   * - 'css-highlight': Uses CSS Custom Highlight API (zero DOM overhead).
   *   Falls back to 'spans' if the API is not available.
   * - 'spans': Renders `<span>` elements with CSS classes per token.
   *   In the editor, uses a transparent-text overlay approach.
   * @default 'css-highlight'
   */
  highlightMode?: 'css-highlight' | 'spans';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasHighlightAPI(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof Highlight !== 'undefined'
  );
}

const AUTO_CLOSE_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

let editorInstanceCounter = 0;

// ---------------------------------------------------------------------------
// Span-based rendering helpers
// ---------------------------------------------------------------------------

/**
 * Build span-based highlighted line content from tokens.
 */
function buildSpanLine(
  lineText: string,
  lineStart: number,
  tokens: Token[],
): React.ReactNode {
  if (!lineText) return '\u200b';

  const lineEnd = lineStart + lineText.length;
  const lineTokens = tokens.filter(t => t.start < lineEnd && t.end > lineStart);

  if (lineTokens.length === 0) return lineText;

  const parts: React.ReactNode[] = [];
  let cursor = lineStart;

  for (const token of lineTokens) {
    const tStart = Math.max(token.start, lineStart);
    const tEnd = Math.min(token.end, lineEnd);

    if (tStart > cursor) {
      parts.push(lineText.slice(cursor - lineStart, tStart - lineStart));
    }

    parts.push(
      <span
        key={`${tStart}-${token.type}`}
        className={`xds-token-${token.type}`}>
        {lineText.slice(tStart - lineStart, tEnd - lineStart)}
      </span>,
    );

    cursor = tEnd;
  }

  if (cursor < lineEnd) {
    parts.push(lineText.slice(cursor - lineStart));
  }

  return parts.length > 0 ? parts : lineText;
}

/**
 * Build span-based content for all lines.
 */
function buildSpanContent(lines: string[], tokens: Token[]): React.ReactNode {
  return lines.map((line, i) => {
    let lineStart = 0;
    for (let j = 0; j < i; j++) {
      lineStart += lines[j].length + 1;
    }
    return (
      <div key={i}>
        {buildSpanLine(line, lineStart, tokens)}
        {i < lines.length - 1 ? '\n' : null}
      </div>
    );
  });
}

// ---------------------------------------------------------------------------
// Shared highlight range application
// ---------------------------------------------------------------------------

function applyEditorHighlightRanges(
  el: HTMLElement,
  tokens: Token[],
): () => void {
  const tokensByType = new Map<string, Token[]>();
  for (const token of tokens) {
    const existing = tokensByType.get(token.type);
    if (existing) {
      existing.push(token);
    } else {
      tokensByType.set(token.type, [token]);
    }
  }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Array<{node: Text; start: number}> = [];
  let totalOffset = 0;

  let node = walker.nextNode();
  while (node) {
    textNodes.push({node: node as Text, start: totalOffset});
    totalOffset += (node as Text).length;
    node = walker.nextNode();
  }

  function findPosition(offset: number): {node: Text; offset: number} | null {
    for (let i = textNodes.length - 1; i >= 0; i--) {
      const entry = textNodes[i];
      if (offset >= entry.start) {
        const localOffset = offset - entry.start;
        if (localOffset <= entry.node.length) {
          return {node: entry.node, offset: localOffset};
        }
        return null;
      }
    }
    return null;
  }

  const myRanges: Range[] = [];

  for (const tokenType of TOKEN_TYPES) {
    const typedTokens = tokensByType.get(tokenType);
    if (!typedTokens || typedTokens.length === 0) continue;

    const name = `xds-${tokenType}`;
    let highlight = CSS.highlights.get(name);
    if (!highlight) {
      highlight = new Highlight();
      CSS.highlights.set(name, highlight);
    }

    for (const token of typedTokens) {
      const startPos = findPosition(token.start);
      const endPos = findPosition(token.end);
      if (!startPos || !endPos) continue;

      try {
        const range = new Range();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        highlight.add(range);
        myRanges.push(range);
      } catch {
        // Skip invalid ranges
      }
    }
  }

  return () => {
    for (const range of myRanges) {
      for (const tokenType of TOKEN_TYPES) {
        const highlight = CSS.highlights.get(`xds-${tokenType}`);
        if (highlight) {
          highlight.delete(range);
        }
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * An editable code input using contentEditable="plaintext-only".
 *
 * Uses CSS Custom Highlight API for syntax coloring. Supports
 * auto-indent, tab insertion, and bracket auto-closing.
 * Falls back to span-based rendering when the API is unavailable
 * or `highlightMode="spans"` is set.
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
  highlightMode: highlightModeProp = 'css-highlight',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [instanceId] = useState(() => ++editorInstanceCounter);
  const [focused, setFocused] = useState(false);
  const isComposingRef = useRef(false);

  // Resolve effective highlight mode
  const useSpans = highlightModeProp === 'spans' || !hasHighlightAPI();

  // Async tokens for span mode overlay
  const [asyncTokens, setAsyncTokens] = useState<Token[] | null>(null);

  const lines = value.split('\n');

  // Sync textContent with controlled value
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  // Compute sync tokens for span mode (small code)
  const syncTokens = useMemo(() => {
    if (!useSpans) return null;
    if (value.length >= SYNC_TOKENIZE_THRESHOLD) return null;
    const tok = customTokenizer ?? tokenize;
    return tok(value, language);
  }, [useSpans, value, language, customTokenizer]);

  // Async tokenization for span mode with large code
  useEffect(() => {
    if (!useSpans) return;
    if (value.length < SYNC_TOKENIZE_THRESHOLD) return;

    const abortController = new AbortController();

    tokenizeAsync(value, language, abortController.signal).then(tokens => {
      if (!abortController.signal.aborted) {
        setAsyncTokens(tokens);
      }
    });

    return () => {
      abortController.abort();
      setAsyncTokens(null);
    };
  }, [useSpans, value, language, customTokenizer]);

  const spanTokens = syncTokens ?? asyncTokens ?? [];

  // Ensure styles are always injected
  useLayoutEffect(() => {
    ensureHighlightStyles();
  }, []);

  // Apply CSS Custom Highlight API ranges — small code
  useLayoutEffect(() => {
    if (useSpans) return;
    if (value.length >= SYNC_TOKENIZE_THRESHOLD) return;
    if (!hasHighlightAPI()) return;

    const el = editorRef.current;
    if (!el) return;

    const tok = customTokenizer ?? tokenize;
    const tokens = tok(value, language);
    if (tokens.length === 0) return;

    return applyEditorHighlightRanges(el, tokens);
  }, [useSpans, value, language, customTokenizer, instanceId]);

  // Apply CSS Custom Highlight API ranges — large code (async)
  useEffect(() => {
    if (useSpans) return;
    if (value.length < SYNC_TOKENIZE_THRESHOLD) return;
    if (!hasHighlightAPI()) return;

    const el = editorRef.current;
    if (!el) return;

    const abortController = new AbortController();
    let cleanup: (() => void) | undefined;

    tokenizeAsync(value, language, abortController.signal).then(tokens => {
      if (abortController.signal.aborted) return;
      if (tokens.length === 0) return;
      cleanup = applyEditorHighlightRanges(el, tokens);
    });

    return () => {
      abortController.abort();
      cleanup?.();
    };
  }, [useSpans, value, language, customTokenizer, instanceId]);

  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;
    const el = editorRef.current;
    if (!el) return;
    const newValue = el.textContent ?? '';
    onChange(newValue);
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

        // Find cursor offset
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const cursorOffset = preCaretRange.toString().length;

        // Find current line and its indentation
        const beforeCursor = fullText.slice(0, cursorOffset);
        const lastNewline = beforeCursor.lastIndexOf('\n');
        const currentLine = beforeCursor.slice(lastNewline + 1);
        const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';

        // Insert newline + indent
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

        // Only auto-close if no text is selected
        if (!range.collapsed) return;

        e.preventDefault();
        const textNode = document.createTextNode(e.key + closeChar);
        range.deleteContents();
        range.insertNode(textNode);
        // Place cursor between the pair
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
    ? {maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight}
    : undefined;

  // For span mode in the editor, we render a non-interactive overlay with
  // colored spans on top of the contentEditable. The contentEditable text
  // is made transparent so the overlay provides the visual coloring while
  // the contentEditable handles input/caret.
  const spanOverlay =
    useSpans && spanTokens.length > 0 ? (
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
        {buildSpanContent(lines, spanTokens)}
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
            useSpans && spanTokens.length > 0
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
