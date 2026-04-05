'use client';
/**
 * @file XDSCodeBlock.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API
 * @output Exports XDSCodeBlock component and XDSCodeBlockProps
 * @position Core implementation; read-only syntax-highlighted code display
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CodeBlock/index.ts (exports if types change)
 * - /packages/core/src/CodeBlock/tokenizer.ts (shared tokenizer)
 * - /packages/core/src/CodeBlock/highlightStyles.ts (::highlight rules)
 */

import {
  useLayoutEffect,
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {tokenize, tokenizeAsync, SYNC_TOKENIZE_THRESHOLD} from './tokenizer';
import type {Token} from './tokenizer';
import {ensureHighlightStyles, TOKEN_TYPES} from './highlightStyles';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    position: 'relative',
    margin: 0,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    border: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    borderBottom: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    backgroundColor: colorVars['--color-background-surface'],
  },
  headerTitle: {
    fontSize: textSizeVars['--font-size-sm'],
    fontFamily: typographyVars['--font-family-code'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    margin: 0,
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  scrollContainer: {
    overflowX: 'auto',
    overflowY: 'auto',
  },
  codeWrapper: {
    display: 'flex',
    minWidth: 'fit-content',
  },
  gutter: {
    flexShrink: 0,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-3'],
    textAlign: 'end',
    userSelect: 'none',
    color: colorVars['--color-text-disabled'],
    borderRight: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
  },
  gutterLine: {
    fontFamily: typographyVars['--font-family-code'],
    lineHeight: typeScaleVars['--text-code-leading'],
  },
  code: {
    display: 'block',
    flex: 1,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    margin: 0,
    fontFamily: typographyVars['--font-family-code'],
    color: colorVars['--color-text-primary'],
    tabSize: 2,
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
  },
  codeWrapped: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
  },
  line: {
    lineHeight: typeScaleVars['--text-code-leading'],
    contentVisibility: 'auto',
    containIntrinsicBlockSize: 'auto 1lh',
  },
  lineHighlighted: {
    backgroundColor: colorVars['--color-accent-muted'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
    paddingInline: spacingVars['--spacing-4'],
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
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-1'],
    border: 'none',
    borderRadius: radiusVars['--radius-inner'],
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-overlay-hover'],
    },
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    lineHeight: 0,
  },
  copyButtonAbsolute: {
    position: 'absolute',
    top: spacingVars['--spacing-2'],
    right: spacingVars['--spacing-2'],
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface XDSCodeBlockProps extends XDSBaseProps<HTMLPreElement> {
  /** Ref forwarded to the root <pre> element */
  ref?: React.Ref<HTMLPreElement>;
  /** The code string to display */
  code: string;
  /** Language for syntax highlighting. @default "plaintext" */
  language?: string;
  /** Filename/label in header bar */
  title?: string;
  /**
   * Show the language name in the header bar.
   * @default true
   */
  hasLanguageLabel?: boolean;
  /** Show line number gutter. @default false */
  hasLineNumbers?: boolean;
  /** 1-indexed lines to highlight. */
  highlightLines?: number[];
  /** Show copy-to-clipboard button. @default true */
  hasCopyButton?: boolean;
  /** Callback after copy */
  onCopy?: () => void;
  /** Wrap long lines vs horizontal scroll. @default false */
  isWrapped?: boolean;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Text size. @default "md" */
  size?: 'sm' | 'md';
  /** Custom tokenizer override */
  tokenizer?: (
    code: string,
    language: string,
  ) => Array<{type: string; start: number; end: number}>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if CSS Custom Highlight API is available.
 */
function hasHighlightAPI(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof Highlight !== 'undefined'
  );
}

/**
 * Build span-based highlighted line content from tokens.
 *
 * Splits a line into segments: plain text between tokens gets rendered
 * as bare text nodes, tokens get wrapped in <span className="xds-token-{type}">.
 */
function buildSpanLine(
  lineText: string,
  lineStart: number,
  tokens: Token[],
): React.ReactNode {
  if (tokens.length === 0) {
    return lineText || '\u200b';
  }

  const lineEnd = lineStart + lineText.length;

  // Filter tokens that overlap this line
  const lineTokens = tokens.filter(t => t.start < lineEnd && t.end > lineStart);

  if (lineTokens.length === 0) {
    return lineText || '\u200b';
  }

  const parts: React.ReactNode[] = [];
  let cursor = lineStart;

  for (const token of lineTokens) {
    const tStart = Math.max(token.start, lineStart);
    const tEnd = Math.min(token.end, lineEnd);

    // Plain text before this token
    if (tStart > cursor) {
      parts.push(lineText.slice(cursor - lineStart, tStart - lineStart));
    }

    // Token span
    parts.push(
      <span
        key={`${tStart}-${token.type}`}
        className={`xds-token-${token.type}`}>
        {lineText.slice(tStart - lineStart, tEnd - lineStart)}
      </span>,
    );

    cursor = tEnd;
  }

  // Remaining plain text after last token
  if (cursor < lineEnd) {
    parts.push(lineText.slice(cursor - lineStart));
  }

  return parts.length > 0 ? parts : '\u200b';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A read-only syntax-highlighted code block.
 *
 * Uses the CSS Custom Highlight API for zero-DOM-overhead syntax coloring.
 * Falls back to span-based rendering in browsers without support, or when
 * `highlightMode="spans"` is explicitly set.
 *
 * @example
 * ```tsx
 * <XDSCodeBlock
 *   code={`const x = 42;`}
 *   language="typescript"
 *   hasLineNumbers
 * />
 * ```
 */
export function XDSCodeBlock({
  code,
  language = 'plaintext',
  title,
  hasLanguageLabel = true,
  hasLineNumbers = false,
  highlightLines,
  hasCopyButton = true,
  onCopy,
  isWrapped = false,
  maxHeight,
  size = 'md',
  tokenizer: customTokenizer,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const instanceId = useId();
  const [copied, setCopied] = useState(false);

  // Auto-detect: use CSS Custom Highlight API when available, fall back to spans
  const useSpans = !hasHighlightAPI();

  // For span mode: we need tokens to render. Small code is tokenized sync,
  // large code is tokenized async.
  const [asyncTokens, setAsyncTokens] = useState<Token[] | null>(null);

  const lines = code.split('\n');
  // Remove trailing empty line from code that ends with newline
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  const highlightSet = highlightLines ? new Set(highlightLines) : null;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, onCopy]);

  // Compute tokens for span mode
  const syncTokens = useMemo(() => {
    if (!useSpans) return null;
    if (code.length >= SYNC_TOKENIZE_THRESHOLD) return null;
    const tok = customTokenizer ?? tokenize;
    return tok(code, language);
  }, [useSpans, code, language, customTokenizer]);

  // Async tokenization for span mode with large code
  useEffect(() => {
    if (!useSpans) return;
    if (code.length < SYNC_TOKENIZE_THRESHOLD) return;

    const abortController = new AbortController();

    tokenizeAsync(code, language, abortController.signal).then(tokens => {
      if (!abortController.signal.aborted) {
        setAsyncTokens(tokens);
      }
    });

    return () => {
      abortController.abort();
      setAsyncTokens(null);
    };
  }, [useSpans, code, language, customTokenizer]);

  const spanTokens = syncTokens ?? asyncTokens ?? [];

  // Apply CSS Custom Highlight API ranges — small code (sync, layout effect)
  useLayoutEffect(() => {
    if (useSpans) return;
    if (code.length >= SYNC_TOKENIZE_THRESHOLD) return;
    if (!hasHighlightAPI()) return;

    ensureHighlightStyles();

    const codeEl = codeRef.current;
    if (!codeEl) return;

    const tok = customTokenizer ?? tokenize;
    const tokens = tok(code, language);
    if (tokens.length === 0) return;

    return applyHighlightRanges(codeEl, tokens);
  }, [useSpans, code, language, customTokenizer, instanceId]);

  // Apply CSS Custom Highlight API ranges — large code (async, regular effect)
  useEffect(() => {
    if (useSpans) return;
    if (code.length < SYNC_TOKENIZE_THRESHOLD) return;
    if (!hasHighlightAPI()) return;

    ensureHighlightStyles();

    const codeEl = codeRef.current;
    if (!codeEl) return;

    const abortController = new AbortController();
    let cleanup: (() => void) | undefined;

    tokenizeAsync(code, language, abortController.signal).then(tokens => {
      if (abortController.signal.aborted) return;
      if (tokens.length === 0) return;
      cleanup = applyHighlightRanges(codeEl, tokens);
    });

    return () => {
      abortController.abort();
      cleanup?.();
    };
  }, [useSpans, code, language, customTokenizer, instanceId]);

  // Ensure styles are injected for span mode too
  useLayoutEffect(() => {
    if (useSpans) {
      ensureHighlightStyles();
    }
  }, [useSpans]);

  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const gutterSizeStyle = size === 'sm' ? styles.gutterSm : styles.gutterMd;
  const languageLabel =
    hasLanguageLabel && language !== 'plaintext' ? language : null;
  const showHeader = title != null || languageLabel != null;

  const scrollStyle: React.CSSProperties | undefined = maxHeight
    ? {maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight}
    : undefined;

  const copyIcon = copied ? (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" />
      <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" />
    </svg>
  );

  const copyButtonEl = hasCopyButton ? (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      {...stylex.props(
        styles.copyButton,
        !showHeader && styles.copyButtonAbsolute,
      )}>
      {copyIcon}
    </button>
  ) : null;

  // Build line content: spans mode renders tokens inline, highlight mode
  // renders plain text (CSS Highlight API colors it via ranges).
  function renderLineContent(line: string, lineIndex: number): React.ReactNode {
    if (!useSpans) {
      return line || '\u200b';
    }
    // Calculate the character offset of this line in the full code string.
    // Each previous line + 1 for the \n separator.
    let lineStart = 0;
    for (let i = 0; i < lineIndex; i++) {
      lineStart += lines[i].length + 1;
    }
    return buildSpanLine(line, lineStart, spanTokens);
  }

  return (
    <pre
      ref={ref}
      {...mergeProps(
        xdsClassName('codeblock', {size, language}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {showHeader && (
        <div {...stylex.props(styles.header)}>
          <span {...stylex.props(styles.headerTitle)}>
            {languageLabel}
            {languageLabel && title ? ' — ' : ''}
            {title}
          </span>
          {copyButtonEl}
        </div>
      )}
      <div {...stylex.props(styles.scrollContainer)} style={scrollStyle}>
        <div {...stylex.props(styles.codeWrapper)}>
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
          <code
            ref={codeRef}
            {...stylex.props(
              styles.code,
              sizeStyle,
              isWrapped && styles.codeWrapped,
            )}>
            {lines.map((line, i) => (
              <div
                key={i}
                data-line={i + 1}
                {...stylex.props(
                  styles.line,
                  highlightSet?.has(i + 1) && styles.lineHighlighted,
                )}>
                {renderLineContent(line, i)}
              </div>
            ))}
          </code>
        </div>
      </div>
      {!showHeader && copyButtonEl}
    </pre>
  );
}

XDSCodeBlock.displayName = 'XDSCodeBlock';

// ---------------------------------------------------------------------------
// Shared highlight range application
// ---------------------------------------------------------------------------

/**
 * Apply CSS Custom Highlight API ranges to a code element.
 * Returns a cleanup function that removes the ranges.
 */
function applyHighlightRanges(
  codeEl: HTMLElement,
  tokens: Token[],
): () => void {
  // Group tokens by type
  const tokensByType = new Map<string, Token[]>();
  for (const token of tokens) {
    const existing = tokensByType.get(token.type);
    if (existing) {
      existing.push(token);
    } else {
      tokensByType.set(token.type, [token]);
    }
  }

  // Build text node mapping using TreeWalker — same approach as CodeEditor.
  const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
  const textNodes: Array<{node: Text; start: number}> = [];
  let charOffset = 0;

  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode as Text;
    const content = text.textContent ?? '';
    if (content === '\u200b') {
      charOffset += 1;
    } else {
      textNodes.push({node: text, start: charOffset});
      charOffset += content.length + 1;
    }
    currentNode = walker.nextNode();
  }

  function findPosition(offset: number): {node: Text; offset: number} | null {
    for (let i = textNodes.length - 1; i >= 0; i--) {
      const entry = textNodes[i];
      if (offset >= entry.start) {
        const localOffset = offset - entry.start;
        if (localOffset <= (entry.node.textContent?.length ?? 0)) {
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
