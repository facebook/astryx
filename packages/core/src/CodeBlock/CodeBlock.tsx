// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CodeBlock.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API, SyntaxTheme provider
 * @output Exports CodeBlock component and CodeBlockProps
 * @position Core implementation; read-only syntax-highlighted code display
 */

import {
  useInsertionEffect,
  useEffect,
  useId,
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
import {useAnnounce} from '../hooks/useAnnounce';
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
import {useTranslator} from '../i18n';
import {SyntaxTheme, type SyntaxThemeDefinition} from '../theme/syntax';

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
  // Width of the line-number column, sized to the widest number. `ch` is the
  // advance of "0" in the (monospace) code font, so N digits => N ch. Set on
  // <code>; `--_codeblock-gutter-width` is unregistered so it inherits (with its var()
  // substituted) down to the line divs that read it for their grid track.
  gutterWidth: (digits: number) => ({
    '--_codeblock-gutter-width': `${digits}ch`,
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
    // Restore a keyboard-only focus ring with the standard token/offset so this
    // disclosure control matches the rest of the system (Collapsible, TabMenu);
    // otherwise it falls back to the inconsistent UA default outline.
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
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
  // With line numbers on, the <code> element hosts the full-height divider
  // between the number gutter and the code. It spans the code's block padding
  // too (inset-block: 0), so the rule reaches the top and bottom edges the way
  // the old separate gutter column did. The numbers themselves are drawn per
  // line (see `lineNumbered`) — a separate column can't track wrap height.
  codeNumbered: {
    position: 'relative',
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: `calc(${spacingVars['--spacing-4']} + var(--_codeblock-gutter-width) + ${spacingVars['--spacing-3']})`,
      width: 0,
      borderInlineStartWidth: borderVars['--border-width'],
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: colorVars['--color-border'],
      pointerEvents: 'none',
    },
  },
  line: {
    lineHeight: typeScaleVars['--text-code-leading'],
  },
  // Per-line number gutter: a two-column grid ([number] [code]). The number is
  // a ::before generated from the data-line attribute. Because the number and
  // its code occupy one grid row, the row grows to fit wrapped code while the
  // number stays pinned to the row's first visual line (alignSelf: start) —
  // this is what keeps numbers aligned when isWrapped wraps a line.
  lineNumbered: {
    display: 'grid',
    gridTemplateColumns: 'var(--_codeblock-gutter-width) 1fr',
    columnGap: `calc(${spacingVars['--spacing-3']} + ${borderVars['--border-width']} + ${spacingVars['--spacing-4']})`,
    '::before': {
      content: 'attr(data-line)',
      gridColumn: '1',
      alignSelf: 'start',
      textAlign: 'end',
      color: 'var(--color-syntax-punctuation)',
      userSelect: 'none',
      fontFamily: typographyVars['--font-family-code'],
    },
  },
  // In span mode the tokens are wrapped in this element so they form a single
  // grid item in column 2 (otherwise each token span would flow into its own
  // grid cell). minWidth:0 lets it shrink so long lines wrap within the track.
  lineContent: {
    minWidth: 0,
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
  lineNumbers,
}: {
  lines: string[];
  startIndex: number;
  highlightSet: Set<number> | null;
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode;
  lineNumbers: boolean;
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
              lineNumbers && styles.lineNumbered,
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
  lineNumbers: boolean,
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
        lineNumbers={lineNumbers}
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
          lineNumbers={lineNumbers}
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
  /**
   * Per-instance syntax theme override. Shorthand for wrapping this block in
   * `<SyntaxTheme theme={...}>` — accepts a preset from
   * `@astryxdesign/core/theme/syntax` or a theme created with
   * `defineSyntaxTheme()`. Without it, the block uses the theme-level syntax
   * colors from the nearest SyntaxTheme ancestor or `defineTheme({ syntax })`.
   */
  syntaxTheme?: SyntaxThemeDefinition;
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
  hasLineNumbers,
  maxDigits,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightSet: Set<number> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
  hasLineNumbers: boolean;
  maxDigits: number;
}) {
  useInsertionEffect(() => {
    ensureHighlightStyles();
  }, []);

  const renderLineContent = useCallback(
    (line: string, lineIndex: number): React.ReactNode => {
      const tokens = tokenLines[lineIndex] ?? [];
      // Wrap tokens in a single element so they occupy one grid cell when line
      // numbers are on (see `lineNumbered`); an inline span is a no-op when off.
      return (
        <span {...stylex.props(styles.lineContent)}>
          {buildSpanLine(line, tokens)}
        </span>
      );
    },
    [tokenLines],
  );

  return (
    <code
      {...stylex.props(
        styles.code,
        sizeStyle,
        isWrapped && styles.codeWrapped,
        hasLineNumbers && styles.codeNumbered,
        hasLineNumbers && dynamicStyles.gutterWidth(maxDigits),
      )}>
      {renderLines(lines, highlightSet, renderLineContent, hasLineNumbers)}
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
  hasLineNumbers,
  maxDigits,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightSet: Set<number> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
  hasLineNumbers: boolean;
  maxDigits: number;
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

  // Range mode keeps the line's text as a bare text node (its firstChild) so
  // applyHighlightRangesChunked can map token offsets onto it \u2014 no wrapper. The
  // number ::before is a pseudo-element, so it never becomes a child node here.
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
        hasLineNumbers && styles.codeNumbered,
        hasLineNumbers && dynamicStyles.gutterWidth(maxDigits),
      )}>
      {renderLines(lines, highlightSet, renderLineContent, hasLineNumbers)}
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
  syntaxTheme,
  xstyle,
  className,
  style,
  ref,
  ...props
}: CodeBlockProps) {
  const t = useTranslator();
  const [copied, setCopied] = useState(false);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announce = useAnnounce();

  // Clear a pending "copied" reset when the block unmounts.
  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current != null) {
        clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

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
      // Swapping the button's aria-label alone isn't reliably announced by
      // screen readers, so confirm the copy via a polite live region.
      announce('Copied');
      onCopy?.();
      // Restart the reset timer on every copy — otherwise a rapid re-copy
      // is reverted early by the previous click's timer.
      if (copyResetTimerRef.current != null) {
        clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = setTimeout(() => {
        copyResetTimerRef.current = null;
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard failures leave the copied state unchanged.
    }
  }, [code, onCopy, announce]);

  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  // Digits in the largest line number — sizes the gutter column width.
  const maxLineDigits = String(lines.length).length;
  const languageLabel =
    hasLanguageLabel && language !== 'plaintext' ? language : null;
  const showHeader = title != null || languageLabel != null;

  const canCollapse = isCollapsible && lines.length >= collapsibleThreshold;
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Links the collapsible header to the code region it shows/hides so assistive
  // tech can move from the button to its controlled content (disclosure
  // pattern). The region stays mounted when collapsed (CSS grid animation), so
  // this is always a resolvable reference — aria-controls can be unconditional.
  const regionId = useId();

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
      aria-label={
        copied ? t('@astryx.codeBlock.copied') : t('@astryx.codeBlock.copyCode')
      }
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
        aria-controls={canCollapse ? regionId : undefined}
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
      aria-label={languageLabel ?? t('@astryx.codeBlock.code')}
      {...mergeProps(stylex.props(styles.scrollContainer), {
        style: scrollStyle,
      })}>
      <div
        {...stylex.props(
          styles.codeWrapper,
          showHeader && !hasLineNumbers && styles.codeWrapperCompact,
        )}>
        {useSpans ? (
          <SpanCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightSet={highlightSet}
            isWrapped={isWrapped}
            sizeStyle={sizeStyle}
            hasLineNumbers={hasLineNumbers}
            maxDigits={maxLineDigits}
          />
        ) : (
          <RangeCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightSet={highlightSet}
            isWrapped={isWrapped}
            sizeStyle={sizeStyle}
            hasLineNumbers={hasLineNumbers}
            maxDigits={maxLineDigits}
          />
        )}
      </div>
    </div>
  );

  const block = (
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
          id={regionId}
          // While collapsed, the region is only hidden visually (0fr grid
          // row); inert also removes it from the tab order and accessibility
          // tree so keyboard users cannot Tab into the invisible scroll
          // container (tabIndex=0). aria-controls pointing at an inert
          // element remains a valid, resolvable reference.
          inert={isCollapsed ? true : undefined}
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

  return syntaxTheme ? (
    <SyntaxTheme theme={syntaxTheme}>{block}</SyntaxTheme>
  ) : (
    block
  );
}

CodeBlock.displayName = 'CodeBlock';
