// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Markdown.tsx
 * @input Markdown string, parser AST types
 * @output Exports Markdown component and MarkdownProps
 * @position Core implementation; renders markdown as Astryx components
 */

import {useMemo, useRef} from 'react';
import type React from 'react';
import {Fragment} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  typographyVars,
  fontWeightVars,
  borderVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import type {TextDisplay} from '../theme/types';
import {CodeBlock, Code} from '../CodeBlock';
import {CheckboxList} from '../CheckboxList/CheckboxList';
import {CheckboxListItem} from '../CheckboxList/CheckboxListItem';
import {Blockquote} from '../Blockquote/Blockquote';
import {List} from '../List/List';
import {ListItem} from '../List/ListItem';
import {Table} from '../Table/Table';
import {TableRow} from '../Table/TableRow';
import {TableCell} from '../Table/TableCell';
import {TableHeaderCell} from '../Table/TableHeaderCell';
import {TableHeader} from '../Table/TableHeader';
import {TableBody} from '../Table/TableBody';
import {mergeProps} from '../utils';
import {useStreamingText} from '../hooks/useStreamingText';
import {computeBoundaries, computeSegments} from './streaming';
import type {BaseProps} from '../BaseProps';
import {useTheme} from '../theme/useTheme';
import {Citation} from '../Citation/Citation';
import type {CitationSource} from '../Citation/Citation';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {
  parseInline,
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';
import type {BlockNode, InlineNode, IncrementalState} from './parser';
import {themeProps} from '../utils/themeProps';

type SyncReactNode = Exclude<React.ReactNode, Promise<unknown>>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * A plugin that transforms text patterns into custom React elements
 * inside Markdown. Applied to parsed text nodes only — code blocks,
 * inline code, and other non-prose contexts are unaffected.
 *
 * Follows Lexical's TextMatchTransformer architecture:
 * - `pattern` for initial regex matching
 * - `getEndIndex` for programmatic boundary refinement
 * - `render` for producing the replacement element
 */
export interface MarkdownInlinePlugin {
  /** Regex with global flag. Matched against text nodes only. */
  pattern: RegExp;

  /**
   * Optional: refine the match boundary after the regex hits.
   * Return the end index, or false to reject the match.
   * Default: match.index + match[0].length
   */
  getEndIndex?: (text: string, match: RegExpMatchArray) => number | false;

  /** Render the match as a React element. */
  render: (match: RegExpMatchArray, key: string) => React.ReactNode;
}

/**
 * A citation source referenced inline in the markdown via `[id]` or `【id】`.
 * When `sources` is provided, bracket content matching a source key is rendered
 * as a compact superscript citation pill instead of plain text.
 */
export type MarkdownSource = CitationSource;

export interface MarkdownComponents {
  code?: React.ComponentType<{code: string; language?: string}>;
  inlineCode?: React.ComponentType<{children: string}>;
  citation?: React.ComponentType<{
    source: CitationSource;
    number: number;
    variant: 'label' | 'number';
  }>;
  link?: React.ComponentType<{href: string; children: React.ReactNode}>;
  heading?: React.ComponentType<{
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: React.ReactNode;
  }>;
  paragraph?: React.ComponentType<{children: React.ReactNode}>;
  image?: React.ComponentType<{src: string; alt: string}>;
  blockquote?: React.ComponentType<{children: React.ReactNode}>;
  hr?: React.ComponentType<object>;
}

export interface MarkdownProps extends BaseProps<HTMLElement> {
  ref?: React.Ref<HTMLDivElement> | React.Ref<HTMLSpanElement>;
  children: string;
  /**
   * Display type. Markdown defaults to block.
   * Use 'inline' for markdown spans embedded inside surrounding text.
   * @default 'block'
   */
  display?: TextDisplay;
  density?: 'default' | 'compact';
  /**
   * The HTML heading level that markdown `#` maps to.
   * Shifts all heading levels down to fit the surrounding page hierarchy.
   * E.g. headingLevelStart={3} renders `#` as h3, `##` as h4, `###` as h5.
   * Levels that would exceed h6 are clamped to h6.
   * @default 1
   */
  headingLevelStart?: 1 | 2 | 3 | 4 | 5 | 6;
  isStreaming?: boolean;
  onLinkClick?: (
    href: string,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void | false; // eslint-disable-line @typescript-eslint/no-invalid-void-type
  /**
   * Citation sources keyed by ID. When provided, `[id]` and `【id】` markers
   * in the markdown that match a key are rendered as citation chips.
   */
  sources?: Record<string, MarkdownSource>;
  /**
   * How citations are displayed inline.
   * - `'label'` (default) — chip with source title text, icon, and border
   * - `'number'` — compact numbered badge (1, 2, 3…)
   * @default 'label'
   */
  citationStyle?: 'label' | 'number';
  /**
   * Max width for prose content (paragraphs, headings, lists, blockquotes).
   * Tables and code blocks are unconstrained and can expand to the full
   * container width. Use for readable line lengths in wide layouts.
   *
   * @example
   * ```
   * <Markdown contentWidth={640}>{text}</Markdown>
   * ```
   */
  contentWidth?: number | string;
  /**
   * Alignment of prose content within the container when `contentWidth`
   * is narrower than the available space.
   * - 'start': left-aligned (default)
   * - 'center': centered
   * @default 'start'
   */
  contentAlign?: 'start' | 'center';
  components?: Partial<MarkdownComponents>;
  /**
   * Plugins that transform text patterns into custom React elements.
   * Applied to text nodes after parsing — code blocks and inline code
   * are unaffected. Patterns are matched in order; first match wins
   * for overlapping ranges.
   */
  inlinePlugins?: MarkdownInlinePlugin[];
  /**
   * Opt-in autolinking of bare URLs and emails inside text.
   * - `'gfm'` — GitHub-Flavored Markdown autolink-literal rules:
   *   `https?://…`, `www.…`, `<scheme:url>`, `<email>`, and bare
   *   `user@host` all become `<a>` links. Trailing sentence punctuation
   *   (`?!.,:*_~`) and unbalanced trailing `)` are excluded; matches inside
   *   code spans, code blocks, existing links, and image alt text are
   *   skipped.
   *
   * Default behavior (option unset) is unchanged — bare URLs render as
   * literal text.
   */
  autolink?: 'gfm';
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ALIGN_MARGIN: Record<string, string> = {
  start: '0',
  center: 'auto',
};

const BLOCK_ALIGN_MARGIN: Record<string, string | null> = {
  start: null,
  center: 'auto',
};

const dynamicStyles = stylex.create({
  proseWidth: (maxWidth: string) => ({
    maxWidth,
  }),
  proseAlign: (marginInline: string) => ({
    marginInline,
  }),
  blockWidth: (minWidth: string) => ({
    minWidth: `min(${minWidth}, 100%)`,
  }),
  blockAlign: (marginInline: string) => ({
    marginInline,
  }),
  cellMinWidth: (minWidth: string) => ({
    minWidth,
  }),
});

const cellAlignStyles = stylex.create({
  center: {textAlign: 'center'},
  right: {textAlign: 'right'},
});

const styles = stylex.create({
  root: {
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontSize: typeScaleVars['--text-body-size'],
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflowWrap: 'break-word',
  },
  inlineRoot: {
    display: 'inline',
    width: 'auto',
    maxWidth: 'none',
    fontFamily: 'inherit',
    color: 'inherit',
    lineHeight: 'inherit',
    fontSize: 'inherit',
  },
  // Headings
  headingBase: {
    fontFamily: typographyVars['--font-family-heading'],
    color: colorVars['--color-text-primary'],
  },
  h1: {
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
  },
  h2: {
    fontSize: typeScaleVars['--text-heading-2-size'],
    fontWeight: typeScaleVars['--text-heading-2-weight'],
    lineHeight: typeScaleVars['--text-heading-2-leading'],
  },
  h3: {
    fontSize: typeScaleVars['--text-heading-3-size'],
    fontWeight: typeScaleVars['--text-heading-3-weight'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
  },
  h4: {
    fontSize: typeScaleVars['--text-heading-4-size'],
    fontWeight: typeScaleVars['--text-heading-4-weight'],
    lineHeight: typeScaleVars['--text-heading-4-leading'],
  },
  h5: {
    fontSize: typeScaleVars['--text-heading-5-size'],
    fontWeight: typeScaleVars['--text-heading-5-weight'],
    lineHeight: typeScaleVars['--text-heading-5-leading'],
  },
  h6: {
    fontSize: typeScaleVars['--text-heading-6-size'],
    fontWeight: typeScaleVars['--text-heading-6-weight'],
    lineHeight: typeScaleVars['--text-heading-6-leading'],
  },
  // Block spacing — per element type, default density
  spacingHeadingMajorDefault: {
    marginBlockStart: spacingVars['--spacing-6'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  spacingHeadingMinorDefault: {
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  spacingParagraphDefault: {
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  spacingCodeblockDefault: {
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-4'],
  },
  spacingBlockquoteDefault: {
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-4'],
  },
  spacingListDefault: {
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  spacingTableDefault: {
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-4'],
  },
  spacingHrDefault: {
    marginBlockStart: spacingVars['--spacing-6'],
    marginBlockEnd: spacingVars['--spacing-6'],
  },
  spacingImageDefault: {
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  // Block spacing — per element type, compact density
  spacingHeadingMajorCompact: {
    marginBlockStart: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  spacingHeadingMinorCompact: {
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  spacingParagraphCompact: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  spacingCodeblockCompact: {
    marginBlockStart: spacingVars['--spacing-2'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  spacingBlockquoteCompact: {
    marginBlockStart: spacingVars['--spacing-2'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  spacingListCompact: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  spacingTableCompact: {
    marginBlockStart: spacingVars['--spacing-2'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  spacingHrCompact: {
    marginBlockStart: spacingVars['--spacing-3'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  spacingImageCompact: {
    marginBlockStart: spacingVars['--spacing-2'],
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  noMarginBlockStart: {
    marginBlockStart: 0,
  },
  noMarginBlockEnd: {
    marginBlockEnd: 0,
  },
  // Table
  codeBlockWrapper: {
    maxWidth: '100%',
  },
  tableWrapper: {
    overflowX: 'auto',
    maxWidth: '100%',
    '--container-padding-inline-start': '0px',
    '--container-padding-inline-end': '0px',
    '--container-padding-block-start': '0px',
    '--container-padding-block-end': '0px',
  },
  blockIndent: {
    marginInline: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  // HR
  hr: {
    borderWidth: 0,
    borderTopWidth: borderVars['--border-width'],
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border'],
  },
  // Image
  image: {
    maxWidth: '100%',
    borderRadius: radiusVars['--radius-element'],
  },
  // Inline
  bold: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  strikethrough: {
    color: colorVars['--color-text-secondary'],
  },
  link: {
    color: colorVars['--color-text-accent'],
    textDecoration: 'underline',
  },
});

// ---------------------------------------------------------------------------
// Streaming fade-in animation

// Parse a CSS duration string (e.g. "175ms", "0.15s") to milliseconds.
function parseDuration(value: string): number | null {
  const ms = value.match(/^([\d.]+)ms$/);
  if (ms) {
    return parseFloat(ms[1]);
  }
  const s = value.match(/^([\d.]+)s$/);
  if (s) {
    return parseFloat(s[1]) * 1000;
  }
  return null;
}

// ---------------------------------------------------------------------------

const streamingStyles = stylex.create({
  fadeIn: {
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@starting-style': {
      opacity: 0,
    },
  },
});

/**
 * Mutable cursor threaded through the render tree during streaming.
 * Tracks how many text characters we've visited so far. When `offset`
 * crosses `boundary`, newly rendered content is wrapped in a fade-in span.
 */
interface StreamingCursor {
  /** Characters visited so far in this render pass */
  offset: number;
  /** Recent boundary positions (up to 3), oldest first.
   *  Text before boundaries[0] is fully visible (no animation).
   *  Text between boundaries[i] and boundaries[i+1] gets its own fade span.
   *  Text after the last boundary is the newest chunk. */
  boundaries: number[];
  /** Whether streaming fade is active */
  active: boolean;
}

/**
 * Count the total text characters in inline nodes without rendering.
 * Used to advance the cursor past a block that will be faded as a whole unit.
 */
function countInlineTextLength(nodes: InlineNode[]): number {
  let len = 0;
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        len += node.content.length;
        break;
      case 'code':
        len += node.content.length;
        break;
      case 'image':
        len += node.alt.length;
        break;
      case 'bold':
      case 'italic':
      case 'strikethrough':
      case 'link':
        len += countInlineTextLength(node.children);
        break;
      case 'break':
        len += 1;
        break;
      case 'citation':
        len += 1;
        break;
    }
  }
  return len;
}

/**
 * Count total text characters in a block node tree.
 */
function countBlockTextLength(nodes: BlockNode[]): number {
  let len = 0;
  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
      case 'paragraph':
        len += countInlineTextLength(node.children);
        break;
      case 'codeblock':
        len += node.content.length;
        break;
      case 'blockquote':
        len += countBlockTextLength(node.children);
        break;
      case 'list':
        for (const item of node.items) {
          len += countBlockTextLength(item.children);
        }
        break;
      case 'table':
        for (const h of node.headers) {
          len += countInlineTextLength(h.children);
        }
        for (const row of node.rows) {
          for (const cell of row) {
            len += countInlineTextLength(cell.children);
          }
        }
        break;
      case 'hr':
        break;
      case 'image':
        len += node.alt.length;
        break;
    }
  }
  return len;
}

const headingStyles = {
  1: styles.h1,
  2: styles.h2,
  3: styles.h3,
  4: styles.h4,
  5: styles.h5,
  6: styles.h6,
} as const;

// ---------------------------------------------------------------------------
// URL sanitization — block dangerous protocols
// ---------------------------------------------------------------------------

const DANGEROUS_URL_PATTERN = /^(javascript|data|vbscript):/i;

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (DANGEROUS_URL_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// Inline plugin matching
// ---------------------------------------------------------------------------

type InlinePluginSegment =
  | {type: 'text'; content: string}
  | {type: 'plugin'; element: React.ReactNode; matchLength: number};

/**
 * Find all plugin matches in a text string and split it into segments
 * of plain text and plugin-rendered elements.
 *
 * Algorithm mirrors `findMatches` in `useLinkify`:
 * 1. Run each plugin's regex against the text
 * 2. Check getEndIndex if provided (default: match.index + match[0].length)
 * 3. If getEndIndex returns false, skip the match
 * 4. Collect all non-overlapping matches, sorted by start (first match wins)
 * 5. Split into text/plugin segments
 */
function applyInlinePlugins(
  text: string,
  plugins: MarkdownInlinePlugin[],
): InlinePluginSegment[] {
  interface RawMatch {
    start: number;
    end: number;
    match: RegExpMatchArray;
    plugin: MarkdownInlinePlugin;
  }

  const allMatches: RawMatch[] = [];

  for (const plugin of plugins) {
    // Reset lastIndex instead of cloning — avoids allocation per call.
    // Safe because text nodes are processed sequentially (no interleaving).
    plugin.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = plugin.pattern.exec(text)) !== null) {
      let end: number;
      if (plugin.getEndIndex) {
        const result = plugin.getEndIndex(text, m);
        if (result === false) {
          continue;
        }
        end = result;
      } else {
        end = m.index + m[0].length;
      }

      allMatches.push({
        start: m.index,
        end,
        match: m,
        plugin,
      });
    }
  }

  // Sort by start position (stable sort preserves plugin order for same position)
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (first wins)
  const resolved: RawMatch[] = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      resolved.push(m);
      lastEnd = m.end;
    }
  }

  if (resolved.length === 0) {
    return [{type: 'text', content: text}];
  }

  const segments: InlinePluginSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < resolved.length; i++) {
    const m = resolved[i];

    // Text before this match
    if (m.start > cursor) {
      segments.push({type: 'text', content: text.slice(cursor, m.start)});
    }

    // Plugin element
    segments.push({
      type: 'plugin',
      element: m.plugin.render(m.match, `plugin-${i}`),
      matchLength: m.end - m.start,
    });

    cursor = m.end;
  }

  // Remaining text
  if (cursor < text.length) {
    segments.push({type: 'text', content: text.slice(cursor)});
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Inline renderer
// ---------------------------------------------------------------------------

/**
 * Wrap a text string with a fade-in span for the portion that is "new".
 * If the entire string is old, returns it as-is. If partially new, splits
 * into [old, <span fade>new</span>]. If entirely new, wraps the whole thing.
 */
/** Check if a cursor offset is in the "new" (animating) region */
function wrapTextWithFade(
  content: string,
  cursor: StreamingCursor,
  key: string | number,
): SyncReactNode {
  const startOffset = cursor.offset;
  cursor.offset += content.length;

  if (!cursor.active) {
    return content;
  }

  const segments = computeSegments(
    content,
    startOffset,
    cursor.boundaries,
    key,
  );

  if (segments == null) {
    return content;
  }

  const nodes = segments.map(seg =>
    seg.fading ? (
      <span key={seg.key} {...stylex.props(streamingStyles.fadeIn)}>
        {seg.text}
      </span>
    ) : (
      <span key={seg.key}>{seg.text}</span>
    ),
  );

  return <span key={`wrap-${key}`}>{nodes}</span>;
}

/**
 * Context for citation rendering, threaded through the inline/block render tree.
 * Tracks which sources have been cited and assigns sequential display numbers.
 */
interface CitationContext {
  sources: Record<string, MarkdownSource>;
  numberMap: Map<string, number>;
  nextNumber: number;
  style: 'label' | 'number';
}

function getCitationNumber(ctx: CitationContext, sourceId: string): number {
  let num = ctx.numberMap.get(sourceId);
  if (num == null) {
    num = ctx.nextNumber++;
    ctx.numberMap.set(sourceId, num);
  }
  return num;
}

function renderInline(
  node: InlineNode,
  index: number,
  onLinkClick: MarkdownProps['onLinkClick'] | undefined,
  cursor: StreamingCursor,
  citationCtx: CitationContext | null,
  linkComponent: LinkComponentType = 'a',
  inlinePlugins?: MarkdownInlinePlugin[],
  components?: Partial<MarkdownComponents>,
): SyncReactNode {
  switch (node.type) {
    case 'text': {
      if (inlinePlugins && inlinePlugins.length > 0) {
        const segments = applyInlinePlugins(node.content, inlinePlugins);
        // If no plugin matched, fall through to the normal path
        // O(1) guard: applyInlinePlugins returns a single text segment when
        // nothing matched — skip the plugin path entirely in that case.
        if (!(segments.length === 1 && segments[0].type === 'text')) {
          const result: React.ReactNode[] = [];
          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (seg.type === 'text') {
              result.push(
                wrapTextWithFade(seg.content, cursor, `${index}-seg-${i}`),
              );
            } else {
              // Plugin segment — advance cursor by matchLength
              cursor.offset += seg.matchLength;
              result.push(
                <Fragment key={`plugin-${index}-${i}`}>{seg.element}</Fragment>,
              );
            }
          }
          return <Fragment key={index}>{result}</Fragment>;
        }
      }
      return wrapTextWithFade(node.content, cursor, index);
    }
    case 'bold':
      return (
        <strong key={index} {...stylex.props(styles.bold)}>
          {node.children.map((c, i) =>
            renderInline(
              c,
              i,
              onLinkClick,
              cursor,
              citationCtx,
              linkComponent,
              inlinePlugins,
              components,
            ),
          )}
        </strong>
      );
    case 'italic':
      return (
        <em key={index}>
          {node.children.map((c, i) =>
            renderInline(
              c,
              i,
              onLinkClick,
              cursor,
              citationCtx,
              linkComponent,
              inlinePlugins,
              components,
            ),
          )}
        </em>
      );
    case 'strikethrough':
      return (
        <del key={index} {...stylex.props(styles.strikethrough)}>
          {node.children.map((c, i) =>
            renderInline(
              c,
              i,
              onLinkClick,
              cursor,
              citationCtx,
              linkComponent,
              inlinePlugins,
              components,
            ),
          )}
        </del>
      );
    case 'code': {
      // Track code content length for cursor but don't split inside code
      cursor.offset += node.content.length;
      const InlineCodeComp = components?.inlineCode;
      const codeEl = InlineCodeComp ? (
        <InlineCodeComp key={index}>{node.content}</InlineCodeComp>
      ) : (
        <Code key={index}>{node.content}</Code>
      );
      return codeEl;
    }
    case 'link': {
      const safeHref = sanitizeUrl(node.href);
      if (safeHref == null) {
        // Unsafe URL — render as plain text
        return (
          <span key={index}>
            {node.children.map((c, i) =>
              renderInline(
                c,
                i,
                onLinkClick,
                cursor,
                citationCtx,
                linkComponent,
                inlinePlugins,
                components,
              ),
            )}
          </span>
        );
      }
      const LinkComp = components?.link;
      if (LinkComp) {
        return (
          <LinkComp key={index} href={safeHref}>
            {node.children.map((c, i) =>
              renderInline(
                c,
                i,
                onLinkClick,
                cursor,
                citationCtx,
                linkComponent,
                inlinePlugins,
                components,
              ),
            )}
          </LinkComp>
        );
      }
      const isExternal =
        safeHref.startsWith('https://') || safeHref.startsWith('http://');
      const handleClick = onLinkClick
        ? (e: React.MouseEvent<HTMLAnchorElement>) => {
            const result = onLinkClick(safeHref, e);
            if (result === false) {
              e.preventDefault();
            }
          }
        : undefined;
      // Use linkComponent for internal links, native <a> for external links.
      // Framework routers (Next.js, React Router) handle internal navigation;
      // external links with target="_blank" should use a plain anchor.
      const LinkTag = isExternal ? 'a' : linkComponent;
      return (
        <LinkTag
          key={index}
          href={safeHref}
          onClick={handleClick}
          {...(isExternal
            ? {target: '_blank', rel: 'noopener noreferrer'}
            : {})}
          {...stylex.props(styles.link)}>
          {node.children.map((c, i) =>
            renderInline(
              c,
              i,
              onLinkClick,
              cursor,
              citationCtx,
              linkComponent,
              inlinePlugins,
              components,
            ),
          )}
        </LinkTag>
      );
    }
    case 'image': {
      const safeSrc = sanitizeUrl(node.src);
      if (safeSrc == null) {
        return <span key={index}>[{node.alt}]</span>;
      }
      const ImageComp = components?.image;
      if (ImageComp) {
        return <ImageComp key={index} src={safeSrc} alt={node.alt} />;
      }
      return (
        <img
          key={index}
          src={safeSrc}
          alt={node.alt}
          {...stylex.props(styles.image)}
        />
      );
    }
    case 'break':
      cursor.offset += 1;
      return <br key={index} />;
    case 'citation': {
      cursor.offset += 1;
      if (!citationCtx) {
        // No sources provided — render as plain text
        return <span key={index}>[{node.sourceId}]</span>;
      }
      const num = getCitationNumber(citationCtx, node.sourceId);
      const source = citationCtx.sources[node.sourceId] ?? {
        title: node.sourceId,
      };
      const citVariant = citationCtx.style === 'number' ? 'number' : 'label';
      const CitationComp = components?.citation;
      const chip = CitationComp ? (
        <CitationComp
          key={index}
          source={source}
          number={num}
          variant={citVariant}
        />
      ) : (
        <Citation
          key={index}
          source={source}
          number={num}
          variant={citVariant}
        />
      );

      return chip;
    }
  }
}

// ---------------------------------------------------------------------------
// Block spacing helper
// ---------------------------------------------------------------------------

function getElementSpacing(
  node: BlockNode,
  density: 'default' | 'compact',
): StyleXStyles {
  const compact = density === 'compact';
  switch (node.type) {
    case 'heading':
      return node.level <= 3
        ? compact
          ? styles.spacingHeadingMajorCompact
          : styles.spacingHeadingMajorDefault
        : compact
          ? styles.spacingHeadingMinorCompact
          : styles.spacingHeadingMinorDefault;
    case 'paragraph':
      return compact
        ? styles.spacingParagraphCompact
        : styles.spacingParagraphDefault;
    case 'codeblock':
      return compact
        ? styles.spacingCodeblockCompact
        : styles.spacingCodeblockDefault;
    case 'blockquote':
      return compact
        ? styles.spacingBlockquoteCompact
        : styles.spacingBlockquoteDefault;
    case 'list':
      return compact ? styles.spacingListCompact : styles.spacingListDefault;
    case 'table':
      return compact ? styles.spacingTableCompact : styles.spacingTableDefault;
    case 'hr':
      return compact ? styles.spacingHrCompact : styles.spacingHrDefault;
    case 'image':
      return compact ? styles.spacingImageCompact : styles.spacingImageDefault;
  }
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

/**
 * Compute per-column min-widths from table AST content.
 * Buckets: ≤6 chars → 60px, 7–15 → 80px, >15 → 120px.
 */
function computeTableColumnMinWidths(node: {
  headers: {children: InlineNode[]}[];
  rows: {children: InlineNode[]}[][];
}): number[] {
  return node.headers.map((h, colIdx) => {
    let maxLen = countInlineTextLength(h.children);
    for (const row of node.rows) {
      if (row[colIdx]) {
        const len = countInlineTextLength(row[colIdx].children);
        if (len > maxLen) {
          maxLen = len;
        }
      }
    }
    return maxLen <= 6 ? 60 : maxLen <= 15 ? 80 : 120;
  });
}

function renderBlock(
  node: BlockNode,
  index: number,
  blockCount: number,
  density: 'default' | 'compact',
  headingLevelStart: 1 | 2 | 3 | 4 | 5 | 6,
  onLinkClick: MarkdownProps['onLinkClick'] | undefined,
  cursor: StreamingCursor,
  citationCtx: CitationContext | null,
  contentWidthValue: string | null,
  contentAlign: 'start' | 'center',
  linkComponent: LinkComponentType = 'a',
  inlinePlugins?: MarkdownInlinePlugin[],
  components?: Partial<MarkdownComponents>,
): SyncReactNode {
  const blockAlignMargin = BLOCK_ALIGN_MARGIN[contentAlign];
  const blockAlignStyle =
    blockAlignMargin != null
      ? dynamicStyles.blockAlign(blockAlignMargin)
      : null;
  const spacing = getElementSpacing(node, density);
  const isFirst = index === 0;
  const isLast = index === blockCount - 1;

  switch (node.type) {
    case 'heading': {
      const level = Math.min(node.level + headingLevelStart - 1, 6) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
      const headingChildren = node.children.map((c, i) =>
        renderInline(
          c,
          i,
          onLinkClick,
          cursor,
          citationCtx,
          linkComponent,
          inlinePlugins,
          components,
        ),
      );
      const HeadingComp = components?.heading;
      if (HeadingComp) {
        return (
          <HeadingComp key={index} level={level}>
            {headingChildren}
          </HeadingComp>
        );
      }
      const Tag = `h${level}` as const;
      return (
        <Tag
          key={index}
          {...stylex.props(
            styles.headingBase,
            headingStyles[level],
            spacing,
            contentWidthValue != null
              ? dynamicStyles.proseWidth(contentWidthValue)
              : null,
            contentAlign !== 'start'
              ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign])
              : null,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          {headingChildren}
        </Tag>
      );
    }
    case 'paragraph': {
      const paraChildren = node.children.map((c, i) =>
        renderInline(
          c,
          i,
          onLinkClick,
          cursor,
          citationCtx,
          linkComponent,
          inlinePlugins,
          components,
        ),
      );
      const ParagraphComp = components?.paragraph;
      if (ParagraphComp) {
        return <ParagraphComp key={index}>{paraChildren}</ParagraphComp>;
      }
      // Markdown paragraphs render as <div>, not <p>: inline content can
      // include block-level nodes (images, custom inline components), and a
      // <p> would reparent them, desyncing SSR markup from the hydrated DOM.
      // Block spacing comes from token-based StyleX margins, so the rendered
      // appearance is unchanged. role="paragraph" re-exposes the paragraph
      // role in the accessibility tree (a pure ARIA hint — it does not trigger
      // the parser's block-child reparenting) so prose semantics are preserved
      // without the <p> composition hazard. Consumers who want a real <p>
      // element can still pass components={{paragraph: 'p'}}.
      return (
        <div
          key={index}
          role="paragraph"
          {...stylex.props(
            spacing,
            contentWidthValue != null
              ? dynamicStyles.proseWidth(contentWidthValue)
              : null,
            contentAlign !== 'start'
              ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign])
              : null,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          {paraChildren}
        </div>
      );
    }
    case 'codeblock': {
      // Track codeblock content in cursor for accurate character counting
      cursor.offset += node.content.length;
      const CodeBlockComp = components?.code;
      if (CodeBlockComp) {
        return (
          <CodeBlockComp
            key={index}
            code={node.content}
            language={node.language}
          />
        );
      }
      return (
        <div
          key={index}
          {...stylex.props(
            spacing,
            styles.codeBlockWrapper,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <CodeBlock
            code={node.content}
            language={node.language}
            isCollapsible
            xstyle={[
              contentWidthValue != null
                ? dynamicStyles.blockWidth(contentWidthValue)
                : undefined,
              blockAlignStyle,
            ]}
          />
        </div>
      );
    }
    case 'blockquote': {
      const BlockquoteComp = components?.blockquote;
      if (BlockquoteComp) {
        const bqC = node.children.map((c, i) =>
          renderBlock(
            c,
            i,
            node.children.length,
            density,
            headingLevelStart,
            onLinkClick,
            cursor,
            citationCtx,
            contentWidthValue,
            contentAlign,
            linkComponent,
            inlinePlugins,
            components,
          ),
        );
        return <BlockquoteComp key={index}>{bqC}</BlockquoteComp>;
      }
      return (
        <Blockquote
          key={index}
          xstyle={[
            spacing,
            contentWidthValue != null
              ? dynamicStyles.proseWidth(contentWidthValue)
              : undefined,
            contentAlign !== 'start'
              ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign])
              : undefined,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          ]}>
          {node.children.map((c, i) =>
            renderBlock(
              c,
              i,
              node.children.length,
              density,
              headingLevelStart,
              onLinkClick,
              cursor,
              citationCtx,
              contentWidthValue,
              contentAlign,
              linkComponent,
              inlinePlugins,
              components,
            ),
          )}
        </Blockquote>
      );
    }
    case 'list': {
      // Detect task lists: all items have a checked state
      const isTaskList =
        node.items.length > 0 && node.items.every(item => item.checked != null);

      if (isTaskList) {
        // Extract labels from task items — render as rich inline content
        const checkedValues = node.items
          .map((item, i) => ({item, key: `task-${i}`}))
          .filter(({item}) => item.checked)
          .map(({key}) => key);

        return (
          <div
            key={index}
            {...stylex.props(
              spacing,
              isFirst && styles.noMarginBlockStart,
              isLast && styles.noMarginBlockEnd,
            )}>
            <CheckboxList
              label="Task list"
              isLabelHidden
              value={checkedValues}
              xstyle={styles.blockIndent}
              isReadOnly
              density="compact">
              {node.items.map((item, i) => {
                const firstChild = item.children[0];
                const isInline =
                  item.children.length === 1 &&
                  firstChild?.type === 'paragraph';

                const label = isInline ? (
                  <>
                    {firstChild.children.map((c, j) =>
                      renderInline(
                        c,
                        j,
                        onLinkClick,
                        cursor,
                        citationCtx,
                        linkComponent,
                        inlinePlugins,
                        components,
                      ),
                    )}
                  </>
                ) : (
                  <>
                    {item.children.map((c, j) =>
                      renderBlock(
                        c,
                        j,
                        item.children.length,
                        density,
                        headingLevelStart,
                        onLinkClick,
                        cursor,
                        citationCtx,
                        contentWidthValue,
                        contentAlign,
                        linkComponent,
                        inlinePlugins,
                        components,
                      ),
                    )}
                  </>
                );

                return (
                  <CheckboxListItem
                    // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown task items are rendered from positional AST nodes
                    key={i}
                    value={`task-${i}`}
                    label={label}
                  />
                );
              })}
            </CheckboxList>
          </div>
        );
      }

      return (
        <div
          key={index}
          {...stylex.props(
            spacing,
            contentWidthValue != null
              ? dynamicStyles.proseWidth(contentWidthValue)
              : null,
            contentAlign !== 'start'
              ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign])
              : null,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <List
            listStyle={node.ordered ? 'decimal' : 'disc'}
            density="compact"
            start={node.ordered ? node.start : undefined}
            xstyle={styles.blockIndent}>
            {node.items.map((item, i) => {
              const firstChild = item.children[0];
              const isInline =
                item.children.length === 1 && firstChild?.type === 'paragraph';

              // Check if this entire list item is "new" — if so, fade the
              // whole item as a block instead of fading individual text spans.

              const label = isInline ? (
                <>
                  {firstChild.children.map((c, j) =>
                    renderInline(
                      c,
                      j,
                      onLinkClick,
                      cursor,
                      citationCtx,
                      linkComponent,
                      inlinePlugins,
                      components,
                    ),
                  )}
                </>
              ) : (
                <>
                  {item.children.map((c, j) =>
                    renderBlock(
                      c,
                      j,
                      item.children.length,
                      density,
                      headingLevelStart,
                      onLinkClick,
                      cursor,
                      citationCtx,
                      contentWidthValue,
                      contentAlign,
                      linkComponent,
                      inlinePlugins,
                      components,
                    ),
                  )}
                </>
              );

              return (
                <ListItem
                  // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown list items are rendered from positional AST nodes
                  key={i}
                  label={label}
                />
              );
            })}
          </List>
        </div>
      );
    }
    case 'table': {
      const colMinWidths = computeTableColumnMinWidths(node);

      return (
        <div
          key={index}
          // Keyboard-focusable so keyboard users can scroll a horizontally
          // overflowing GFM table.
          tabIndex={0}
          role="region"
          aria-label="Table"
          {...stylex.props(
            styles.tableWrapper,
            spacing,
            contentWidthValue != null
              ? dynamicStyles.blockWidth(contentWidthValue)
              : null,
            BLOCK_ALIGN_MARGIN[contentAlign] != null
              ? dynamicStyles.blockAlign(BLOCK_ALIGN_MARGIN[contentAlign])
              : null,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <Table dividers="rows" textOverflow="wrap">
            <TableHeader>
              <TableRow>
                {node.headers.map((h, i) => (
                  <TableHeaderCell
                    // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown table columns are positional by definition
                    key={i}
                    xstyle={[
                      dynamicStyles.cellMinWidth(`${colMinWidths[i]}px`),
                      node.alignments[i] === 'center' && cellAlignStyles.center,
                      node.alignments[i] === 'right' && cellAlignStyles.right,
                    ]}>
                    {h.children.map((c, j) =>
                      renderInline(
                        c,
                        j,
                        onLinkClick,
                        cursor,
                        citationCtx,
                        linkComponent,
                        inlinePlugins,
                        components,
                      ),
                    )}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {node.rows.map((row, i) => {
                const cells = row.map((cell, j) => (
                  <TableCell
                    // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown table cells are positional by row and column
                    key={j}
                    xstyle={[
                      node.alignments[j] === 'center' && cellAlignStyles.center,
                      node.alignments[j] === 'right' && cellAlignStyles.right,
                    ]}>
                    {cell.children.map((c, k) =>
                      renderInline(
                        c,
                        k,
                        onLinkClick,
                        cursor,
                        citationCtx,
                        linkComponent,
                        inlinePlugins,
                        components,
                      ),
                    )}
                  </TableCell>
                ));
                return (
                  <TableRow
                    // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown table rows are rendered from positional AST nodes
                    key={i}>
                    {cells}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }
    case 'hr': {
      const HrComp = components?.hr;
      if (HrComp) {
        return <HrComp key={index} />;
      }
      return (
        <hr
          key={index}
          {...stylex.props(
            styles.hr,
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}
        />
      );
    }
    case 'image': {
      const safeSrc = sanitizeUrl(node.src);
      if (safeSrc == null) {
        return (
          <div
            key={index}
            {...stylex.props(
              spacing,
              isFirst && styles.noMarginBlockStart,
              isLast && styles.noMarginBlockEnd,
            )}>
            [{node.alt}]
          </div>
        );
      }
      return (
        <div
          key={index}
          {...stylex.props(
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <img src={safeSrc} alt={node.alt} {...stylex.props(styles.image)} />
        </div>
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a markdown string as Astryx components. Supports streaming with
 * smooth fade-in animation via isStreaming.
 *
 * @example
 * ```
 * <Markdown>
 *   {'# Hello\n\nThis is **bold** and _italic_ text.\n\n- Item one\n- Item two'}
 * </Markdown>
 * ```
 */
export function Markdown({
  ref,
  children,
  display = 'block',
  density = 'default',
  headingLevelStart = 1,
  isStreaming = false,
  onLinkClick,
  sources,
  citationStyle = 'label',
  contentWidth = 680,
  contentAlign = 'start',
  components,
  inlinePlugins,
  autolink,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: MarkdownProps): React.ReactElement {
  const LinkComponent = useLinkComponent();
  // Derive the set of source IDs for the parser (stable across renders when sources don't change)
  const sourceIds = useMemo(
    () => (sources ? new Set(Object.keys(sources)) : undefined),
    [sources],
  );

  const parseOptions = useMemo(
    () => ({sourceIds, autolink}),
    [sourceIds, autolink],
  );

  // Smooth bursty streamed chunks into a steady character-by-character reveal.
  // When not streaming, the hook returns children unchanged (no-op).
  const smoothedText = useStreamingText(children, isStreaming);

  const incrementalStateRef = useRef<IncrementalState>(
    createIncrementalState(),
  );
  // Reset incremental cache when the autolink option toggles — cached
  // settled blocks were parsed with the previous setting.
  const prevAutolinkRef = useRef(autolink);
  if (prevAutolinkRef.current !== autolink) {
    incrementalStateRef.current = createIncrementalState();
    prevAutolinkRef.current = autolink;
  }

  const blocks = useMemo(() => {
    if (display === 'inline') {
      return [];
    }
    if (isStreaming) {
      if (smoothedText === '') {
        incrementalStateRef.current = createIncrementalState();
        return [];
      }
      const input = trimStreamingArtifacts(smoothedText);
      return parseMarkdownIncremental(
        input,
        incrementalStateRef.current,
        parseOptions,
      );
    }
    return parseMarkdown(children, parseOptions);
  }, [display, smoothedText, children, isStreaming, parseOptions]);

  const inlineNodes = useMemo(() => {
    if (display !== 'inline') {
      return [];
    }
    const input = isStreaming ? trimStreamingArtifacts(smoothedText) : children;
    return parseInline(input, parseOptions);
  }, [display, smoothedText, children, isStreaming, parseOptions]);

  // Track recent boundaries for stacked fade-in animation.
  // The number of spans needed = ceil(animationDuration / tickInterval).
  // useStreamingText ticks every ~tickMs, and the fade runs for
  // --duration-fast-max. We compute the span count dynamically so the
  // oldest span has just finished animating when it gets evicted.
  const {token} = useTheme();
  const maxSpans = useMemo(() => {
    const duration = parseDuration(token('--duration-fast-max')) ?? 230;
    const tick = parseDuration(token('--duration-fast-min'));
    // Tick interval mirrors useStreamingText's timing: base / 10
    const tickMs = tick != null ? Math.max(4, Math.round(tick / 10)) : 50;
    return Math.min(Math.ceil(duration / tickMs), 12);
  }, [token]);

  const prevBlocksRef = useRef<BlockNode[]>([]);
  const prevInlineNodesRef = useRef<InlineNode[]>([]);
  const boundariesRef = useRef<number[]>([]);
  const smoothedLen = smoothedText.length;
  const boundaries = useMemo(() => {
    void smoothedLen; // dep trigger
    const prevLen =
      display === 'inline'
        ? countInlineTextLength(prevInlineNodesRef.current)
        : countBlockTextLength(prevBlocksRef.current);
    const next = computeBoundaries(boundariesRef.current, prevLen, maxSpans);
    boundariesRef.current = next;
    return next;
  }, [display, smoothedLen, maxSpans]);

  const cursor: StreamingCursor = {
    offset: 0,
    boundaries,
    active: isStreaming,
  };

  // Build citation context — numbers are assigned in encounter order during rendering.
  // This is recreated each render so numbering stays consistent with the AST.
  const citationCtx: CitationContext | null = sources
    ? {sources, numberMap: new Map(), nextNumber: 1, style: citationStyle}
    : null;

  if (display === 'inline') {
    const renderedInline = (
      <span
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          themeProps('markdown', {density}),
          stylex.props(styles.root, styles.inlineRoot, xstyle),
          className,
          style,
        )}>
        {inlineNodes.map((node, i) =>
          renderInline(
            node,
            i,
            onLinkClick,
            cursor,
            citationCtx,
            LinkComponent,
            inlinePlugins,
            components,
          ),
        )}
      </span>
    );

    // Store current inline nodes for next render's boundary calculation.
    prevInlineNodesRef.current = inlineNodes;
    prevBlocksRef.current = [];

    return renderedInline;
  }

  const rendered = (
    <div
      role="document"
      ref={ref as React.Ref<HTMLDivElement>}
      data-testid={testId}
      {...mergeProps(
        themeProps('markdown', {density}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      {blocks.map((block, i) =>
        renderBlock(
          block,
          i,
          blocks.length,
          density,
          headingLevelStart,
          onLinkClick,
          cursor,
          citationCtx,
          contentWidth
            ? typeof contentWidth === 'number'
              ? `${contentWidth}px`
              : contentWidth
            : null,
          contentAlign,
          LinkComponent,
          inlinePlugins,
          components,
        ),
      )}
    </div>
  );

  // Store current blocks for next render's boundary calculation.
  // This ref write is safe under StrictMode: both invocations produce the same
  // blocks (same smoothedText → same useMemo result), so both write the same value.
  prevBlocksRef.current = blocks;
  prevInlineNodesRef.current = [];

  return rendered;
}

Markdown.displayName = 'Markdown';
