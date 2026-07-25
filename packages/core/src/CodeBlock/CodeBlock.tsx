// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CodeBlock.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API, SyntaxTheme provider
 * @output Exports CodeBlock, CodeBlockProps, CodeBlockHighlightLine, CodeBlockLineAccent
 * @position Core implementation; read-only syntax-highlighted code display with
 *   per-line accents (neutral highlight plus add/remove diff washes + markers)
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
  // Diff washes. Success/error-toned so an added line reads green and a removed
  // line red; the wash is paired with a +/- marker (below) so the distinction
  // never rests on colour alone (WCAG 2.1 SC 1.4.1).
  lineAdded: {
    backgroundColor: colorVars['--color-success-muted'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
    paddingInline: spacingVars['--spacing-4'],
  },
  lineRemoved: {
    backgroundColor: colorVars['--color-error-muted'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
    paddingInline: spacingVars['--spacing-4'],
  },
  // Diff metadata (hunk `@@` and file headers under `language="diff"`): dimmed,
  // not selectable, no marker — it is punctuation, not code.
  lineMeta: {
    color: 'var(--color-syntax-comment)',
    userSelect: 'none',
  },
  // Diff marker gutter. The +/- (or a blank cell, for alignment) is drawn as an
  // `::after` pseudo-element placed in a leading grid column — never a real
  // child node, so range mode's bare-text-node offset mapping is untouched (the
  // same reason the line number uses `::before`). The sign is the non-colour
  // affordance the wash pairs with, mirroring AvatarStatusDot's shape.
  lineMarkered: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    columnGap: spacingVars['--spacing-3'],
    '::after': {
      content: 'attr(data-diff-marker)',
      gridColumn: '1',
      gridRow: '1',
      alignSelf: 'start',
      textAlign: 'center',
      minWidth: '1ch',
      color: 'var(--color-syntax-punctuation)',
      userSelect: 'none',
      fontFamily: typographyVars['--font-family-code'],
    },
  },
  // Both gutters: marker (`::after`) in column 1, line number (`::before`) in
  // column 2, code in column 3. columnGap is 0 so each gutter controls its own
  // trailing space via marginInlineEnd (a single grid gap can't give the marker
  // a tight gap and the number the wider one the plain number gutter uses).
  lineNumberedMarkered: {
    display: 'grid',
    gridTemplateColumns: 'max-content var(--_codeblock-gutter-width) 1fr',
    '::after': {
      content: 'attr(data-diff-marker)',
      gridColumn: '1',
      gridRow: '1',
      alignSelf: 'start',
      textAlign: 'center',
      minWidth: '1ch',
      marginInlineEnd: spacingVars['--spacing-2'],
      color: 'var(--color-syntax-punctuation)',
      userSelect: 'none',
      fontFamily: typographyVars['--font-family-code'],
    },
    '::before': {
      content: 'attr(data-line)',
      gridColumn: '2',
      alignSelf: 'start',
      textAlign: 'end',
      marginInlineEnd: `calc(${spacingVars['--spacing-3']} + ${borderVars['--border-width']} + ${spacingVars['--spacing-4']})`,
      color: 'var(--color-syntax-punctuation)',
      userSelect: 'none',
      fontFamily: typographyVars['--font-family-code'],
    },
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

// The glyph shown in the marker gutter for each diff accent. A minus sign
// (U+2212), not a hyphen, so it optically balances the plus. Purely presentational
// (an `::after` pseudo), so it is never part of the copied text.
const DIFF_MARKERS: Record<'add' | 'remove', string> = {
  add: '+',
  remove: '−',
};

const accentLineStyles = {
  highlight: styles.lineHighlighted,
  add: styles.lineAdded,
  remove: styles.lineRemoved,
} as const;

/**
 * Memoized chunk component — cheaper than memoizing every individual line.
 */
const CodeChunk = React.memo(function CodeChunk({
  lines,
  startIndex,
  highlightMap,
  renderLineContent,
  lineNumbers,
  markerMode,
  metaLines,
}: {
  lines: string[];
  startIndex: number;
  highlightMap: ReadonlyMap<number, CodeBlockLineAccent> | null;
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode;
  lineNumbers: boolean;
  markerMode: boolean;
  metaLines: ReadonlySet<number> | null;
}) {
  return (
    <>
      {lines.map((line, j) => {
        const i = startIndex + j;
        const n = i + 1;
        const accent = highlightMap?.get(n) ?? null;
        const isMeta = metaLines?.has(n) ?? false;
        // In marker mode every line carries a marker cell (blank for context /
        // metadata) so the gutter stays aligned down the block.
        const marker =
          accent === 'add' || accent === 'remove' ? DIFF_MARKERS[accent] : '';
        return (
          <div
            key={i}
            data-line={n}
            data-line-type={accent ?? undefined}
            data-diff-marker={markerMode ? marker : undefined}
            {...stylex.props(
              styles.line,
              markerMode
                ? lineNumbers
                  ? styles.lineNumberedMarkered
                  : styles.lineMarkered
                : lineNumbers && styles.lineNumbered,
              accent != null && accentLineStyles[accent],
              isMeta && styles.lineMeta,
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
  highlightMap: ReadonlyMap<number, CodeBlockLineAccent> | null,
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode,
  lineNumbers: boolean,
  markerMode: boolean,
  metaLines: ReadonlySet<number> | null,
  chunkSize: number = LINE_CHUNK_SIZE,
): React.ReactNode {
  chunkSize = Math.max(1, Math.floor(chunkSize));

  if (lines.length < LINE_CHUNK_THRESHOLD) {
    return (
      <CodeChunk
        lines={lines}
        startIndex={0}
        highlightMap={highlightMap}
        renderLineContent={renderLineContent}
        lineNumbers={lineNumbers}
        markerMode={markerMode}
        metaLines={metaLines}
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
          highlightMap={highlightMap}
          renderLineContent={renderLineContent}
          lineNumbers={lineNumbers}
          markerMode={markerMode}
          metaLines={metaLines}
        />
      </div>,
    );
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Diff parsing
// ---------------------------------------------------------------------------

/**
 * Accent applied to a single line via `highlightLines`.
 * - `'highlight'`: neutral attention accent (same as a plain number entry).
 * - `'add'`: success-toned diff wash (+ marker) for added lines.
 * - `'remove'`: error-toned diff wash (− marker) for removed lines.
 */
export type CodeBlockLineAccent = 'add' | 'remove' | 'highlight';

/**
 * A `highlightLines` entry: a 1-indexed line number (neutral accent) or an
 * object selecting a specific accent for that line.
 */
export type CodeBlockHighlightLine =
  number | {line: number; type?: CodeBlockLineAccent};

interface ParsedDiff {
  // Display text for each line, with the leading +/-/space diff punctuation removed.
  lines: string[];
  // 1-indexed line → accent. Context lines are absent.
  accents: Map<number, CodeBlockLineAccent>;
  // 1-indexed lines that are diff metadata (`@@` hunk / file headers): dimmed,
  // no marker, and excluded from the copied text.
  meta: Set<number>;
  // The code with all diff punctuation removed — what the copy button yields.
  copyText: string;
}

function isDiffMeta(line: string): boolean {
  return (
    line === '@@' ||
    line.startsWith('@@ ') ||
    line === '---' ||
    line.startsWith('--- ') ||
    line === '+++' ||
    line.startsWith('+++ ') ||
    line.startsWith('diff ') ||
    line.startsWith('index ')
  );
}

/**
 * Parse a unified diff so `language="diff"` renders +/- washes and markers
 * without the caller pre-tagging lines, and Copy yields clean code (no +/-/@@).
 * File/hunk headers become dimmed, non-copyable metadata; `+`/`-` lines become
 * add/remove accents with their leading marker stripped from the display text.
 */
function parseUnifiedDiff(code: string): ParsedDiff {
  const raw = code.split('\n');
  if (raw.length > 1 && raw[raw.length - 1] === '') {
    raw.pop();
  }
  const lines: string[] = [];
  const accents = new Map<number, CodeBlockLineAccent>();
  const meta = new Set<number>();
  const copyParts: string[] = [];
  raw.forEach((line, i) => {
    const n = i + 1;
    if (isDiffMeta(line)) {
      meta.add(n);
      lines.push(line);
      return;
    }
    const first = line[0];
    if (first === '+') {
      accents.set(n, 'add');
      lines.push(line.slice(1));
      copyParts.push(line.slice(1));
    } else if (first === '-') {
      accents.set(n, 'remove');
      lines.push(line.slice(1));
      copyParts.push(line.slice(1));
    } else {
      // Context line: a single leading space is diff punctuation; strip it.
      const text = first === ' ' ? line.slice(1) : line;
      lines.push(text);
      copyParts.push(text);
    }
  });
  return {lines, accents, meta, copyText: copyParts.join('\n')};
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CodeBlockProps extends BaseProps<HTMLPreElement> {
  ref?: React.Ref<HTMLPreElement>;
  code: string;
  /**
   * Syntax language for highlighting. The special value `"diff"` treats `code`
   * as a unified diff: `+`/`-` lines render as add/remove washes with `+`/`−`
   * markers, `@@`/file headers dim as metadata, and Copy yields the code with
   * all diff punctuation stripped.
   */
  language?: string;
  title?: string;
  hasLanguageLabel?: boolean;
  hasLineNumbers?: boolean;
  /**
   * 1-indexed lines to accent. Plain numbers (and `type: 'highlight'`) use the
   * neutral attention accent; `'add'` / `'remove'` render theme-aware
   * success/error diff washes paired with a `+` / `−` gutter marker (so the
   * distinction is not colour-only — WCAG 2.1 SC 1.4.1). Entries outside the
   * code's line range are ignored. Ignored when `language="diff"`, which derives
   * the accents from the diff itself.
   *
   * @example
   * ```
   * <CodeBlock
   *   code={updatedConfig}
   *   language="json"
   *   highlightLines={[{line: 4, type: 'remove'}, {line: 5, type: 'add'}, 12]}
   * />
   * ```
   */
  highlightLines?: CodeBlockHighlightLine[];
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
  highlightMap,
  isWrapped,
  sizeStyle,
  hasLineNumbers,
  maxDigits,
  markerMode,
  metaLines,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightMap: ReadonlyMap<number, CodeBlockLineAccent> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
  hasLineNumbers: boolean;
  maxDigits: number;
  markerMode: boolean;
  metaLines: ReadonlySet<number> | null;
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
      {renderLines(
        lines,
        highlightMap,
        renderLineContent,
        hasLineNumbers,
        markerMode,
        metaLines,
      )}
    </code>
  );
}

// ---------------------------------------------------------------------------
// Range-mode code element
// ---------------------------------------------------------------------------

function RangeCodeContent({
  lines,
  tokenLines,
  highlightMap,
  isWrapped,
  sizeStyle,
  hasLineNumbers,
  maxDigits,
  markerMode,
  metaLines,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightMap: ReadonlyMap<number, CodeBlockLineAccent> | null;
  isWrapped: boolean;
  sizeStyle: stylex.StyleXStyles;
  hasLineNumbers: boolean;
  maxDigits: number;
  markerMode: boolean;
  metaLines: ReadonlySet<number> | null;
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
      {renderLines(
        lines,
        highlightMap,
        renderLineContent,
        hasLineNumbers,
        markerMode,
        metaLines,
      )}
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

  const isDiff = language === 'diff';

  // Under `language="diff"` the raw code is a unified diff: derive the display
  // lines (markers stripped), per-line add/remove accents, metadata lines, and
  // the clean copy text from it. Otherwise `code` is rendered as-is.
  const parsedDiff = useMemo(
    () => (isDiff ? parseUnifiedDiff(code) : null),
    [isDiff, code],
  );

  const lines = useMemo(() => {
    if (parsedDiff) {
      return parsedDiff.lines;
    }
    const l = code.split('\n');
    if (l.length > 1 && l[l.length - 1] === '') {
      l.pop();
    }
    return l;
  }, [parsedDiff, code]);

  // Diff display is plain text plus washes/markers — don't run the syntax
  // tokenizer over raw diff punctuation (its offsets wouldn't line up with the
  // marker-stripped display text).
  const tokenLines = useTokenLines(
    isDiff ? '' : code,
    language,
    customTokenizer,
  );

  const highlightMap = useMemo(() => {
    if (parsedDiff) {
      return parsedDiff.accents.size > 0 ? parsedDiff.accents : null;
    }
    if (!highlightLines || highlightLines.length === 0) {
      return null;
    }
    const map = new Map<number, CodeBlockLineAccent>();
    for (const entry of highlightLines) {
      if (typeof entry === 'number') {
        map.set(entry, 'highlight');
      } else {
        map.set(entry.line, entry.type ?? 'highlight');
      }
    }
    return map;
  }, [parsedDiff, highlightLines]);

  // The marker gutter turns on only when there are add/remove lines (from a diff
  // or explicit `{type}` entries) — a neutral highlight alone needs no marker.
  const markerMode = useMemo(() => {
    if (!highlightMap) {
      return false;
    }
    for (const accent of highlightMap.values()) {
      if (accent === 'add' || accent === 'remove') {
        return true;
      }
    }
    return false;
  }, [highlightMap]);

  const metaLines =
    parsedDiff && parsedDiff.meta.size > 0 ? parsedDiff.meta : null;

  // Copy yields the code without any diff punctuation.
  const copyText = parsedDiff ? parsedDiff.copyText : code;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
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
  }, [copyText, onCopy, announce]);

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
            highlightMap={highlightMap}
            isWrapped={isWrapped}
            sizeStyle={sizeStyle}
            hasLineNumbers={hasLineNumbers}
            maxDigits={maxLineDigits}
            markerMode={markerMode}
            metaLines={metaLines}
          />
        ) : (
          <RangeCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightMap={highlightMap}
            isWrapped={isWrapped}
            sizeStyle={sizeStyle}
            hasLineNumbers={hasLineNumbers}
            maxDigits={maxLineDigits}
            markerMode={markerMode}
            metaLines={metaLines}
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
