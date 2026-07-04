// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CodeBlock.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API
 * @output Exports CodeBlock component and CodeBlockProps
 * @position Core implementation; read-only syntax-highlighted code display
 */

import {
  useInsertionEffect,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
} from 'react';
import * as React from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {Icon} from '../Icon';
import {
  tokenize,
  tokenizeAsync,
  flatTokensToLines,
  SYNC_TOKENIZE_THRESHOLD,
} from './tokenizer';
import type {SyntaxToken, TokenLine} from './tokenizer';
import {ensureHighlightStyles} from './highlightStyles';
import {applyHighlightRangesChunked} from './highlightRanges';
import {themeProps} from '../utils/themeProps';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyles = stylex.create({
  card: {
    borderRadius: radiusVars['--radius-element'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
  },
  section: {
    borderRadius: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    // Transparent background so the block blends into the surface it's
    // embedded in (a card or panel) instead of painting its own muted layer,
    // which would compound with a muted parent into a darker grey. Override
    // the syntax-background var so both the root and the sticky header inherit
    // it. Consumers can still set an explicit background via xstyle.
    '--color-syntax-background': 'transparent',
  },
});

const dynamicStyles = stylex.create({
  width: (value: string) => ({
    width: value,
    minWidth: value === 'fit-content' ? 'min(100%, 400px)' : null,
    maxWidth: value === 'fit-content' ? '100%' : null,
  }),
});

const styles = stylex.create({
  root: {
    position: 'relative',
    isolation: 'isolate',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    backgroundColor: 'var(--color-syntax-background)',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: 'var(--color-syntax-background)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    // Reset default <button> appearance for the collapsible title control.
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
  },
  headerWithDivider: {
    paddingBlock: spacingVars['--spacing-2'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  headerCompact: {
    paddingBlock: spacingVars['--spacing-2'],
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-supporting-size'],
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
  codeWrapperCompact: {
    marginBlockStart: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  collapseGrid: {
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  collapseGridCollapsed: {
    gridTemplateRows: '0fr',
  },
  collapseInner: {
    overflow: 'hidden',
    minHeight: 0,
  },
  collapseChevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '14px',
    height: '14px',
    color: 'var(--color-syntax-comment)',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  collapseChevronCollapsed: {
    transform: 'rotate(180deg)',
  },
  headerCollapsible: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  gutter: {
    flexShrink: 0,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-3'],
    textAlign: 'end',
    userSelect: 'none',
    color: 'var(--color-syntax-punctuation)',
    borderRightWidth: borderVars['--border-width'],
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-border'],
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
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  sizeMd: {
    fontSize: typeScaleVars['--text-code-size'],
  },
  gutterSm: {
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  gutterMd: {
    fontSize: typeScaleVars['--text-code-size'],
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-1'],
    marginInlineEnd: `calc(-1 * ${spacingVars['--spacing-2']})`,
    border: 'none',
    borderRadius: radiusVars['--radius-inner'],
    backgroundColor: {
      default: 'transparent',
      '@media (hover: hover)': {
        ':hover': colorVars['--color-overlay-hover'],
      },
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
// Line rendering
// ---------------------------------------------------------------------------

const LINE_CHUNK_SIZE = 20;
const LINE_CHUNK_THRESHOLD = 100;

/**
 * Memoized chunk component — cheaper than memoizing every individual line.
 */
const CodeChunk = React.memo(function CodeChunk({
  lines,
  startIndex,
  highlightSet,
  renderLineContent,
}: {
  lines: string[];
  startIndex: number;
  highlightSet: Set<number> | null;
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode;
}) {
  return (
    <>
      {lines.map((line, j) => {
        const i = startIndex + j;
        return (
          <div
            key={i}
            data-line={i + 1}
            {...stylex.props(
              styles.line,
              (highlightSet?.has(i + 1) ?? false) && styles.lineHighlighted,
            )}>
            {renderLineContent(line, i)}
          </div>
        );
      })}
    </>
  );
});

function renderLines(
  lines: string[],
  highlightSet: Set<number> | null,
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode,
  chunkSize: number = LINE_CHUNK_SIZE,
): React.ReactNode {
  chunkSize = Math.max(1, Math.floor(chunkSize));

  if (lines.length < LINE_CHUNK_THRESHOLD) {
    return (
      <CodeChunk
        lines={lines}
        startIndex={0}
        highlightSet={highlightSet}
        renderLineContent={renderLineContent}
      />
    );
  }

  const chunks: React.ReactNode[] = [];
  for (let start = 0; start < lines.length; start += chunkSize) {
    const end = Math.min(start + chunkSize, lines.length);
    const chunkLines = lines.slice(start, end);
    const estimatedHeight = `${chunkLines.length}lh`;

    chunks.push(
      <div
        key={start}
        {...mergeProps(stylex.props(styles.lineChunk), {
          style: {containIntrinsicBlockSize: `auto ${estimatedHeight}`},
        })}>
        <CodeChunk
          lines={chunkLines}
          startIndex={start}
          highlightSet={highlightSet}
          renderLineContent={renderLineContent}
        />
      </div>,
    );
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CodeBlockProps extends BaseProps<HTMLPreElement> {
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
  isCollapsible?: boolean;
  collapsibleThreshold?: number;
  size?: 'sm' | 'md';
  /**
   * Width of the code block. Accepts any CSS width value.
   * - `'fit-content'` (default): shrinks to the width of the longest line (with a min-width floor).
   * - `'100%'`: stretches to fill the parent container width.
   * - Any valid CSS width string (e.g. `'600px'`, `'50vw'`).
   * @default 'fit-content'
   */
  width?: string;
  /**
   * Container presentation style.
   * - `'card'` (default): border-radius and border with the muted syntax
   *   background — standalone card look.
   * - `'section'`: no border-radius, no border, and a transparent background
   *   so the block blends into the card or panel it's embedded in. Set an
   *   explicit background via `xstyle` if you need one.
   * @default 'card'
   */
  container?: 'card' | 'section';
  tokenizer?: (
    code: string,
    language: string,
  ) => {type: string; start: number; end: number}[];
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

/**
 * Safari supports the Highlight API JS objects but has rendering issues
 * with ::highlight() in code blocks. Detect Safari (WebKit without Chrome)
 * so we can fall back to spans.
 */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  return ua.includes('AppleWebKit') && !ua.includes('Chrome');
}

/**
 * Hook: per-line tokens with sync/async + custom tokenizer compat.
 */
function useTokenLines(
  code: string,
  language: string,
  customTokenizer?: CodeBlockProps['tokenizer'],
): TokenLine[] {
  const [asyncTokenResult, setAsyncTokenResult] = useState<{
    code: string;
    language: string;
    tokens: TokenLine[];
  } | null>(null);

  const syncTokens = useMemo(() => {
    if (customTokenizer) {
      return flatTokensToLines(customTokenizer(code, language), code);
    }
    if (code.length >= SYNC_TOKENIZE_THRESHOLD) {
      return null;
    }
    return tokenize(code, language);
  }, [code, language, customTokenizer]);

  useEffect(() => {
    if (code.length < SYNC_TOKENIZE_THRESHOLD || customTokenizer) {
      return;
    }

    const abortController = new AbortController();

    async function tokenizeLargeCode() {
      try {
        const tokens = await tokenizeAsync(
          code,
          language,
          abortController.signal,
        );
        if (!abortController.signal.aborted) {
          setAsyncTokenResult({code, language, tokens});
        }
      } catch {
        if (!abortController.signal.aborted) {
          setAsyncTokenResult({code, language, tokens: []});
        }
      }
    }

    void tokenizeLargeCode();

    return () => {
      abortController.abort();
    };
  }, [code, language, customTokenizer]);

  if (syncTokens != null) {
    return syncTokens;
  }

  if (
    asyncTokenResult?.code === code &&
    asyncTokenResult.language === language
  ) {
    return asyncTokenResult.tokens;
  }

  return [];
}

// ---------------------------------------------------------------------------
// Span-mode code element
// ---------------------------------------------------------------------------

function buildSpanLine(
  lineText: string,
  tokens: SyntaxToken[],
): React.ReactNode {
  if (tokens.length === 0) {
    return lineText || '\u200b';
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const token of tokens) {
    if (token.start > cursor) {
      parts.push(lineText.slice(cursor, token.start));
    }
    const end = Math.min(token.end, lineText.length);
    parts.push(
      <span
        key={`${token.start}-${token.type}`}
        className={`astryx-token-${token.type} xds-token-${token.type}`}>
        {lineText.slice(token.start, end)}
      </span>,
    );
    cursor = end;
  }

  if (cursor < lineText.length) {
    parts.push(lineText.slice(cursor));
  }
  return parts.length > 0 ? parts : '\u200b';
}

function SpanCodeContent({
  lines,
  tokenLines,
  highlightSet,
  isWrapped,
  sizeStyle,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightSet: Set<number> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
}) {
  useInsertionEffect(() => {
    ensureHighlightStyles();
  }, []);

  const renderLineContent = useCallback(
    (line: string, lineIndex: number): React.ReactNode => {
      const tokens = tokenLines[lineIndex] ?? [];
      return buildSpanLine(line, tokens);
    },
    [tokenLines],
  );

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

function RangeCodeContent({
  lines,
  tokenLines,
  highlightSet,
  isWrapped,
  sizeStyle,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightSet: Set<number> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
}) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!hasHighlightAPI()) {
      return;
    }
    ensureHighlightStyles();

    const codeEl = codeRef.current;
    if (!codeEl || tokenLines.length === 0) {
      return;
    }

    return applyHighlightRangesChunked(codeEl, tokenLines);
  }, [tokenLines]);

  const renderLineContent = useCallback(
    (line: string): React.ReactNode => line || '\u200b',
    [],
  );

  return (
    <code
      ref={codeRef}
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
// Main component
// ---------------------------------------------------------------------------

/**
 * Read-only code display with syntax highlighting, line numbers,
 * and optional copy button.
 *
 * @example
 * ```
 * <CodeBlock code="const x = 42;" language="javascript" />
 * ```
 */
export function CodeBlock({
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
  isCollapsible = false,
  collapsibleThreshold = 10,
  size = 'md',
  width: widthProp = 'fit-content',
  container = 'card',
  tokenizer: customTokenizer,
  highlightMode = 'auto',
  xstyle,
  className,
  style,
  ref,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const useSpans =
    highlightMode === 'spans' ||
    (highlightMode === 'auto' && !hasHighlightAPI()) ||
    (highlightMode === 'auto' && isSafari());

  const lines = useMemo(() => {
    const l = code.split('\n');
    if (l.length > 1 && l[l.length - 1] === '') {
      l.pop();
    }
    return l;
  }, [code]);

  const tokenLines = useTokenLines(code, language, customTokenizer);

  const highlightSet = useMemo(
    () => (highlightLines ? new Set(highlightLines) : null),
    [highlightLines],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failures leave the copied state unchanged.
    }
  }, [code, onCopy]);

  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const gutterSizeStyle = size === 'sm' ? styles.gutterSm : styles.gutterMd;
  const languageLabel =
    hasLanguageLabel && language !== 'plaintext' ? language : null;
  const showHeader = title != null || languageLabel != null;

  const canCollapse = isCollapsible && lines.length >= collapsibleThreshold;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollStyle: CSSProperties | undefined = maxHeight
    ? {maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight}
    : undefined;

  const copyIcon = (
    <Icon icon={copied ? 'check' : 'copy'} size="sm" color="inherit" />
  );

  const copyButtonEl = hasCopyButton ? (
    <button
      type="button"
      onClick={e => {
        // Stop propagation so copying does not toggle the collapsible header.
        e.stopPropagation();
        void handleCopy();
      }}
      aria-label={copied ? 'Copied' : 'Copy code'}
      {...stylex.props(
        styles.copyButton,
        !showHeader && styles.copyButtonAbsolute,
      )}>
      {copyIcon}
    </button>
  ) : null;

  const headerEl = showHeader ? (
    <div
      {...stylex.props(
        styles.headerRow,
        hasLineNumbers ? styles.headerWithDivider : styles.headerCompact,
      )}>
      <div
        role={canCollapse ? 'button' : undefined}
        tabIndex={canCollapse ? 0 : undefined}
        aria-expanded={canCollapse ? !isCollapsed : undefined}
        onClick={canCollapse ? () => setIsCollapsed(prev => !prev) : undefined}
        onKeyDown={
          canCollapse
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsCollapsed(prev => !prev);
                }
              }
            : undefined
        }
        {...stylex.props(
          styles.header,
          canCollapse && styles.headerCollapsible,
        )}>
        <span {...stylex.props(styles.headerTitle)}>
          {title}
          {title && languageLabel ? ' — ' : ''}
          {languageLabel}
          {canCollapse && (
            <span
              {...stylex.props(
                styles.collapseChevron,
                isCollapsed && styles.collapseChevronCollapsed,
              )}>
              <Icon icon="chevronDown" size="xsm" color="inherit" />
            </span>
          )}
        </span>
      </div>
      {copyButtonEl}
    </div>
  ) : null;

  const codeBody = (
    <div
      ref={scrollContainerRef}
      // The scroll container is keyboard-focusable so keyboard users can
      // scroll long or wide code that overflows the viewport. Uses
      // role="group" (not "region") so multiple code blocks on a page don't
      // create duplicate same-named landmarks (axe: landmark-unique).
      tabIndex={0}
      role="group"
      aria-label={languageLabel ?? 'Code'}
      {...mergeProps(stylex.props(styles.scrollContainer), {
        style: scrollStyle,
      })}>
      <div
        {...stylex.props(
          styles.codeWrapper,
          showHeader && !hasLineNumbers && styles.codeWrapperCompact,
        )}>
        {hasLineNumbers && (
          <div
            {...stylex.props(styles.gutter, gutterSizeStyle)}
            aria-hidden="true">
            {lines.map((_, i) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- gutter line numbers are positional by definition
              <div key={i} {...stylex.props(styles.gutterLine)}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
        {useSpans ? (
          <SpanCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightSet={highlightSet}
            isWrapped={isWrapped}
            sizeStyle={sizeStyle}
          />
        ) : (
          <RangeCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightSet={highlightSet}
            isWrapped={isWrapped}
            sizeStyle={sizeStyle}
          />
        )}
      </div>
    </div>
  );

  return (
    <pre
      ref={ref}
      {...mergeProps(
        themeProps('codeblock', {size, language, container}),
        stylex.props(
          styles.root,
          dynamicStyles.width(widthProp),
          containerStyles[container],
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {headerEl}
      {canCollapse ? (
        <div
          {...stylex.props(
            styles.collapseGrid,
            isCollapsed && styles.collapseGridCollapsed,
          )}>
          <div {...stylex.props(styles.collapseInner)}>{codeBody}</div>
        </div>
      ) : (
        codeBody
      )}
      {!showHeader && copyButtonEl}
    </pre>
  );
}

CodeBlock.displayName = 'CodeBlock';
