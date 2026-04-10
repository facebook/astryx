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
import * as React from 'react';
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
import {ensureHighlightStyles} from './highlightStyles';
import {applyHighlightRangesChunked} from './highlightRanges';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: 'var(--color-syntax-background)',
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
    backgroundColor: 'var(--color-syntax-background)',
  },
  headerTitle: {
    fontSize: textSizeVars['--font-size-sm'],
    fontFamily: typographyVars['--font-family-code'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: 'var(--color-syntax-comment)',
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
    color: 'var(--color-syntax-punctuation)',
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
    color: 'var(--color-syntax-variable)',
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
  },
  lineChunk: {
    contentVisibility: 'auto',
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
    fontSize: typeScaleVars['--text-code-size'],
  },
  gutterSm: {
    fontSize: textSizeVars['--font-size-sm'],
  },
  gutterMd: {
    fontSize: typeScaleVars['--text-code-size'],
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
    color: 'var(--color-syntax-comment)',
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
// Line rendering (shared)
// ---------------------------------------------------------------------------

const LINE_CHUNK_SIZE = 20;
const LINE_CHUNK_THRESHOLD = 100;

/**
 * Memoized line component to avoid re-rendering unchanged lines.
 */
const CodeLine = React.memo(function CodeLine({
  lineIndex,
  isHighlighted,
  children,
}: {
  lineIndex: number;
  isHighlighted: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-line={lineIndex + 1}
      {...stylex.props(styles.line, isHighlighted && styles.lineHighlighted)}>
      {children}
    </div>
  );
});

function renderLines(
  lines: string[],
  highlightSet: Set<number> | null,
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode,
  chunkSize: number = LINE_CHUNK_SIZE,
): React.ReactNode {
  chunkSize = Math.max(1, Math.floor(chunkSize));

  const renderLine = (line: string, i: number) => (
    <CodeLine
      key={i}
      lineIndex={i}
      isHighlighted={highlightSet?.has(i + 1) ?? false}>
      {renderLineContent(line, i)}
    </CodeLine>
  );

  if (lines.length < LINE_CHUNK_THRESHOLD) {
    return lines.map(renderLine);
  }

  const chunks: React.ReactNode[] = [];
  for (let start = 0; start < lines.length; start += chunkSize) {
    const end = Math.min(start + chunkSize, lines.length);
    const chunkLines = lines.slice(start, end);
    const estimatedHeight = `${chunkLines.length}lh`;

    chunks.push(
      <div
        key={start}
        {...stylex.props(styles.lineChunk)}
        style={{containIntrinsicBlockSize: `auto ${estimatedHeight}`}}>
        {chunkLines.map((line, j) => renderLine(line, start + j))}
      </div>,
    );
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface XDSCodeBlockProps extends XDSBaseProps<HTMLPreElement> {
  ref?: React.Ref<HTMLPreElement>;
  code: string;
  language?: string;
  title?: string;
  hasLanguageLabel?: boolean;
  hasLineNumbers?: boolean;
  highlightLines?: number[];
  hasCopyButton?: boolean;
  onCopy?: () => void;
  isWrapped?: boolean;
  maxHeight?: number | string;
  size?: 'sm' | 'md';
  tokenizer?: (
    code: string,
    language: string,
  ) => Array<{type: string; start: number; end: number}>;
}

/**
 * Internal-only props for testing and performance tuning.
 * Not part of the public API — used by the sandbox perf page.
 * @internal
 */
interface XDSCodeBlockInternalProps extends XDSCodeBlockProps {
  /** @internal Force a specific highlighting strategy. */
  highlightMode?: 'auto' | 'ranges' | 'spans';
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

// ---------------------------------------------------------------------------
// Span-mode code element
// ---------------------------------------------------------------------------

function findFirstTokenIndex(tokens: Token[], lineStart: number): number {
  let lo = 0;
  let hi = tokens.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (tokens[mid].end <= lineStart) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

function buildSpanLine(
  lineText: string,
  lineStart: number,
  tokens: Token[],
  searchStart: number,
): React.ReactNode {
  if (tokens.length === 0) {
    return lineText || '\u200b';
  }

  const lineEnd = lineStart + lineText.length;
  const parts: React.ReactNode[] = [];
  let cursor = lineStart;
  let hasTokens = false;

  for (let i = searchStart; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.start >= lineEnd) break;
    if (token.end <= lineStart) continue;

    hasTokens = true;
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

  if (!hasTokens) return lineText || '\u200b';
  if (cursor < lineEnd) parts.push(lineText.slice(cursor - lineStart));
  return parts.length > 0 ? parts : '\u200b';
}

/**
 * Span-mode: tokenizes code and renders lines with <span> tokens.
 * Only mounts when highlightMode resolves to spans.
 */
function SpanCodeContent({
  code,
  language,
  lines,
  lineOffsets,
  highlightSet,
  isWrapped,
  sizeStyle,
  customTokenizer,
}: {
  code: string;
  language: string;
  lines: string[];
  lineOffsets: number[];
  highlightSet: Set<number> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
  customTokenizer?: XDSCodeBlockProps['tokenizer'];
}) {
  const [asyncTokens, setAsyncTokens] = useState<Token[] | null>(null);

  useLayoutEffect(() => {
    ensureHighlightStyles();
  }, []);

  const syncTokens = useMemo(() => {
    if (code.length >= SYNC_TOKENIZE_THRESHOLD) return null;
    const tok = customTokenizer ?? tokenize;
    return tok(code, language);
  }, [code, language, customTokenizer]);

  useEffect(() => {
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
  }, [code, language, customTokenizer]);

  const spanTokens = syncTokens ?? asyncTokens ?? [];

  const tokenSearchStarts = useMemo(() => {
    if (spanTokens.length === 0) return null;
    const starts = new Array<number>(lines.length);
    for (let i = 0; i < lines.length; i++) {
      starts[i] = findFirstTokenIndex(spanTokens, lineOffsets[i]);
    }
    return starts;
  }, [spanTokens, lines.length, lineOffsets]);

  function renderLineContent(line: string, lineIndex: number): React.ReactNode {
    return buildSpanLine(
      line,
      lineOffsets[lineIndex],
      spanTokens,
      tokenSearchStarts?.[lineIndex] ?? 0,
    );
  }

  return (
    <code
      {...stylex.props(
        styles.code,
        sizeStyle,
        isWrapped && styles.codeWrapped,
      )}>
      {renderLines(lines, highlightSet, renderLineContent)}
    </code>
  );
}

// ---------------------------------------------------------------------------
// Range-mode code element
// ---------------------------------------------------------------------------

/**
 * Range-mode: renders plain text lines, applies CSS Custom Highlight API
 * ranges in a non-blocking effect. Only mounts when highlightMode
 * resolves to ranges.
 */
function RangeCodeContent({
  code,
  language,
  lines,
  highlightSet,
  isWrapped,
  sizeStyle,
  customTokenizer,
}: {
  code: string;
  language: string;
  lines: string[];
  highlightSet: Set<number> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
  customTokenizer?: XDSCodeBlockProps['tokenizer'];
}) {
  const codeRef = useRef<HTMLElement>(null);
  const instanceId = useId();

  // Apply highlight ranges in a non-blocking effect so the code text
  // is visible and scrollable immediately. Colors appear a frame later.
  useEffect(() => {
    if (!hasHighlightAPI()) return;

    ensureHighlightStyles();

    const codeEl = codeRef.current;
    if (!codeEl) return;

    if (code.length < SYNC_TOKENIZE_THRESHOLD) {
      const tok = customTokenizer ?? tokenize;
      const tokens = tok(code, language);
      if (tokens.length === 0) return;
      return applyHighlightRangesChunked(codeEl, tokens);
    }

    const abortController = new AbortController();
    let cleanup: (() => void) | undefined;

    tokenizeAsync(code, language, abortController.signal).then(tokens => {
      if (abortController.signal.aborted) return;
      if (tokens.length === 0) return;
      cleanup = applyHighlightRangesChunked(codeEl, tokens);
    });

    return () => {
      abortController.abort();
      cleanup?.();
    };
  }, [code, language, customTokenizer, instanceId]);

  function renderLineContent(line: string): React.ReactNode {
    return line || '\u200b';
  }

  return (
    <code
      ref={codeRef}
      {...stylex.props(
        styles.code,
        sizeStyle,
        isWrapped && styles.codeWrapped,
      )}>
      {/* No content-visibility chunking in range mode — TreeWalker
          can't see text nodes inside content-visibility: auto divs,
          so highlight ranges would be missing for off-screen lines. */}
      {renderLines(lines, highlightSet, renderLineContent, Infinity)}
    </code>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * A read-only syntax-highlighted code block.
 *
 * Uses the CSS Custom Highlight API for zero-DOM-overhead syntax coloring.
 * Falls back to span-based rendering in browsers without support, or when
 * `highlightMode="spans"` is explicitly set.
 *
 * @example
 * ```
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
  highlightMode = 'auto',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCodeBlockInternalProps) {
  const [copied, setCopied] = useState(false);

  const useSpans =
    highlightMode === 'spans' ||
    (highlightMode === 'auto' && !hasHighlightAPI());

  const {lines, lineOffsets} = useMemo(() => {
    const l = code.split('\n');
    if (l.length > 1 && l[l.length - 1] === '') {
      l.pop();
    }
    const offsets = new Array<number>(l.length);
    let offset = 0;
    for (let i = 0; i < l.length; i++) {
      offsets[i] = offset;
      offset += l[i].length + 1;
    }
    return {lines: l, lineOffsets: offsets};
  }, [code]);

  const highlightSet = useMemo(
    () => (highlightLines ? new Set(highlightLines) : null),
    [highlightLines],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, onCopy]);

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
          {useSpans ? (
            <SpanCodeContent
              code={code}
              language={language}
              lines={lines}
              lineOffsets={lineOffsets}
              highlightSet={highlightSet}
              isWrapped={isWrapped}
              sizeStyle={sizeStyle}
              customTokenizer={customTokenizer}
            />
          ) : (
            <RangeCodeContent
              code={code}
              language={language}
              lines={lines}
              highlightSet={highlightSet}
              isWrapped={isWrapped}
              sizeStyle={sizeStyle}
              customTokenizer={customTokenizer}
            />
          )}
        </div>
      </div>
      {!showHeader && copyButtonEl}
    </pre>
  );
}

XDSCodeBlock.displayName = 'XDSCodeBlock';
