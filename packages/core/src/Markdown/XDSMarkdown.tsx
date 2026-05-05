'use client';

/**
 * @file XDSMarkdown.tsx
 * @input Markdown string, parser AST types
 * @output Exports XDSMarkdown component and XDSMarkdownProps
 * @position Core implementation; renders markdown as XDS components
 */

import {useMemo, useRef} from 'react';
import type React from 'react';
import {Fragment} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';
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
import {XDSCodeBlock, XDSCode} from '../CodeBlock';
import {XDSCheckboxList} from '../CheckboxList/XDSCheckboxList';
import {XDSCheckboxListItem} from '../CheckboxList/XDSCheckboxListItem';
import {XDSList} from '../List/XDSList';
import {XDSListItem} from '../List/XDSListItem';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSStreamingText} from '../hooks/useXDSStreamingText';
import {XDSCitation} from '../Citation/XDSCitation';
import type {XDSCitationSource} from '../Citation/XDSCitation';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';
import type {BlockNode, InlineNode, IncrementalState} from './parser';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * A plugin that transforms text patterns into custom React elements
 * inside XDSMarkdown. Applied to parsed text nodes only — code blocks,
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
export type XDSMarkdownSource = XDSCitationSource;

export interface XDSMarkdownComponents {
  code?: React.ComponentType<{code: string; language?: string}>;
  inlineCode?: React.ComponentType<{children: string}>;
  citation?: React.ComponentType<{
    source: XDSCitationSource;
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

export interface XDSMarkdownProps {
  ref?: React.Ref<HTMLDivElement>;
  children: string;
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
  ) => void | false;
  /**
   * Citation sources keyed by ID. When provided, `[id]` and `【id】` markers
   * in the markdown that match a key are rendered as citation chips.
   */
  sources?: Record<string, XDSMarkdownSource>;
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
   * <XDSMarkdown contentWidth={640}>{text}</XDSMarkdown>
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
  components?: Partial<XDSMarkdownComponents>;
  /**
   * Plugins that transform text patterns into custom React elements.
   * Applied to text nodes after parsing — code blocks and inline code
   * are unaffected. Patterns are matched in order; first match wins
   * for overlapping ranges.
   */
  inlinePlugins?: MarkdownInlinePlugin[];
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <XDSMarkdown xstyle={styles.wrapper} />
   * ```
   */
  xstyle?: StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
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
  // Blockquote
  blockquote: {
    borderInlineStartWidth: spacingVars['--spacing-0-5'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border-emphasized'],
    paddingInlineStart: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  // Table
  codeBlockWrapper: {
    maxWidth: '100%',
  },
  tableWrapper: {
    overflowX: 'auto',
    maxWidth: '100%',
  },
  blockIndent: {
    marginInline: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  table: {
    borderCollapse: 'collapse',
    width: 'fit-content',
    maxWidth: '100%',
  },
  th: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    textAlign: 'left',
    padding: spacingVars['--spacing-2'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border-emphasized'],
  },
  td: {
    padding: spacingVars['--spacing-2'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  alignLeft: {textAlign: 'left'},
  alignCenter: {textAlign: 'center'},
  alignRight: {textAlign: 'right'},
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
    textDecoration: {
      default: 'none',
      ':hover': {'@media (hover: hover)': 'underline'},
    },
  },
});

// ---------------------------------------------------------------------------
// Streaming fade-in animation
// ---------------------------------------------------------------------------

const streamingStyles = stylex.create({
  fadeIn: {
    // Resting state is fully visible — safe fallback if animation doesn't fire.
    // @starting-style declares the entry state (opacity: 0) so the browser
    // transitions from invisible to visible when the element first mounts.
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast-max'],
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
  /** Character position where "new" content begins */
  boundary: number;
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
        for (const h of node.headers) len += countInlineTextLength(h.children);
        for (const row of node.rows)
          for (const cell of row) len += countInlineTextLength(cell.children);
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
  if (trimmed.length === 0) return null;
  if (DANGEROUS_URL_PATTERN.test(trimmed)) return null;
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
 * Algorithm mirrors `findMatches` in `useXDSLinkify`:
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
        if (result === false) continue;
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
function wrapTextWithFade(
  content: string,
  cursor: StreamingCursor,
  key: string | number,
): React.ReactNode {
  const startOffset = cursor.offset;
  cursor.offset += content.length;

  if (!cursor.active) return content;
  if (startOffset >= cursor.boundary) {
    // Entirely new text
    return (
      <span
        key={`fade-${key}-${startOffset}`}
        {...stylex.props(streamingStyles.fadeIn)}>
        {content}
      </span>
    );
  }
  if (startOffset + content.length <= cursor.boundary) {
    // Entirely old text
    return content;
  }
  // Split: some old, some new
  const splitAt = cursor.boundary - startOffset;
  return (
    <Fragment key={`fade-${key}-split`}>
      {content.slice(0, splitAt)}
      <span {...stylex.props(streamingStyles.fadeIn)}>
        {content.slice(splitAt)}
      </span>
    </Fragment>
  );
}

/**
 * Context for citation rendering, threaded through the inline/block render tree.
 * Tracks which sources have been cited and assigns sequential display numbers.
 */
interface CitationContext {
  sources: Record<string, XDSMarkdownSource>;
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
  onLinkClick: XDSMarkdownProps['onLinkClick'] | undefined,
  cursor: StreamingCursor,
  citationCtx: CitationContext | null,
  linkComponent: XDSLinkComponentType = 'a',
  inlinePlugins?: MarkdownInlinePlugin[],
  components?: Partial<XDSMarkdownComponents>,
): React.ReactNode {
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
              // Plugin segment — advance cursor by matchLength, apply fade if new
              const startOffset = cursor.offset;
              cursor.offset += seg.matchLength;
              if (cursor.active && startOffset >= cursor.boundary) {
                result.push(
                  <span
                    key={`fade-plugin-${index}-${i}-${startOffset}`}
                    {...stylex.props(streamingStyles.fadeIn)}>
                    {seg.element}
                  </span>,
                );
              } else {
                result.push(
                  <Fragment key={`plugin-${index}-${i}`}>
                    {seg.element}
                  </Fragment>,
                );
              }
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
      const startOffset = cursor.offset;
      cursor.offset += node.content.length;
      const InlineCodeComp = components?.inlineCode;
      const codeEl = InlineCodeComp ? (
        <InlineCodeComp key={index}>{node.content}</InlineCodeComp>
      ) : (
        <XDSCode key={index}>{node.content}</XDSCode>
      );
      if (cursor.active && startOffset >= cursor.boundary) {
        return (
          <span
            key={`fade-code-${index}-${startOffset}`}
            {...stylex.props(streamingStyles.fadeIn)}>
            {codeEl}
          </span>
        );
      }
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
      const isExternal = safeHref.startsWith('http');
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
      if (safeSrc == null) return <span key={index}>[{node.alt}]</span>;
      const ImageComp = components?.image;
      if (ImageComp)
        return <ImageComp key={index} src={safeSrc} alt={node.alt} />;
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
      const isNew = cursor.active && cursor.offset >= cursor.boundary;
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
        <XDSCitation
          key={index}
          source={source}
          number={num}
          variant={citVariant}
        />
      );

      return isNew ? (
        <span
          key={`fade-cite-${index}`}
          {...stylex.props(streamingStyles.fadeIn)}>
          {chip}
        </span>
      ) : (
        chip
      );
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

function renderBlock(
  node: BlockNode,
  index: number,
  blockCount: number,
  density: 'default' | 'compact',
  headingLevelStart: 1 | 2 | 3 | 4 | 5 | 6,
  onLinkClick: XDSMarkdownProps['onLinkClick'] | undefined,
  cursor: StreamingCursor,
  citationCtx: CitationContext | null,
  contentWidthValue: string | null,
  contentAlign: 'start' | 'center',
  linkComponent: XDSLinkComponentType = 'a',
  inlinePlugins?: MarkdownInlinePlugin[],
  components?: Partial<XDSMarkdownComponents>,
): React.ReactNode {
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
      if (HeadingComp)
        return (
          <HeadingComp key={index} level={level}>
            {headingChildren}
          </HeadingComp>
        );
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
      if (ParagraphComp)
        return <ParagraphComp key={index}>{paraChildren}</ParagraphComp>;
      return (
        <p
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
          {paraChildren}
        </p>
      );
    }
    case 'codeblock': {
      // Track codeblock content in cursor for accurate character counting
      cursor.offset += node.content.length;
      const CodeBlockComp = components?.code;
      if (CodeBlockComp)
        return (
          <CodeBlockComp
            key={index}
            code={node.content}
            language={node.language}
          />
        );
      return (
        <div
          key={index}
          {...stylex.props(
            spacing,
            styles.codeBlockWrapper,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <XDSCodeBlock
            code={node.content}
            language={node.language}
            isCollapsible
            xstyle={[
              contentWidthValue != null
                ? dynamicStyles.blockWidth(contentWidthValue)
                : undefined,
              BLOCK_ALIGN_MARGIN[contentAlign] != null
                ? dynamicStyles.blockAlign(BLOCK_ALIGN_MARGIN[contentAlign]!)
                : undefined,
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
        <blockquote
          key={index}
          {...stylex.props(
            styles.blockquote,
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
        </blockquote>
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
            <XDSCheckboxList
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

                const itemIsNew =
                  cursor.active && cursor.offset >= cursor.boundary;

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

                const checkboxItem = (
                  <XDSCheckboxListItem
                    key={i}
                    value={`task-${i}`}
                    label={label}
                  />
                );

                if (itemIsNew) {
                  return (
                    <span
                      key={`fade-task-${i}`}
                      {...stylex.props(streamingStyles.fadeIn)}>
                      {checkboxItem}
                    </span>
                  );
                }

                return checkboxItem;
              })}
            </XDSCheckboxList>
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
          <XDSList
            listStyle={node.ordered ? 'decimal' : 'disc'}
            density="compact"
            xstyle={styles.blockIndent}>
            {node.items.map((item, i) => {
              const firstChild = item.children[0];
              const isInline =
                item.children.length === 1 && firstChild?.type === 'paragraph';

              // Check if this entire list item is "new" — if so, fade the
              // whole item as a block instead of fading individual text spans.
              const itemTextLen = countBlockTextLength(item.children);
              const itemIsNew =
                cursor.active && cursor.offset >= cursor.boundary;

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

              if (itemIsNew) {
                return (
                  <span
                    key={`fade-li-${i}-${cursor.offset - itemTextLen}`}
                    {...stylex.props(streamingStyles.fadeIn)}>
                    <XDSListItem label={label} />
                  </span>
                );
              }

              return <XDSListItem key={i} label={label} />;
            })}
          </XDSList>
        </div>
      );
    }
    case 'table': {
      const alignStyle = (a: (typeof node.alignments)[number]) =>
        a === 'center'
          ? styles.alignCenter
          : a === 'right'
            ? styles.alignRight
            : styles.alignLeft;
      return (
        <div
          key={index}
          {...stylex.props(
            styles.tableWrapper,
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <table
            {...stylex.props(
              styles.table,
              styles.blockIndent,
              contentWidthValue != null
                ? dynamicStyles.blockWidth(contentWidthValue)
                : null,
              BLOCK_ALIGN_MARGIN[contentAlign] != null
                ? dynamicStyles.blockAlign(BLOCK_ALIGN_MARGIN[contentAlign]!)
                : null,
            )}>
            <thead>
              <tr>
                {node.headers.map((h, i) => (
                  <th
                    key={i}
                    {...stylex.props(
                      styles.th,
                      alignStyle(node.alignments[i]),
                    )}>
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
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {node.rows.map((row, i) => {
                const rowIsNew =
                  cursor.active && cursor.offset >= cursor.boundary;
                const cells = row.map((cell, j) => (
                  <td
                    key={j}
                    {...stylex.props(
                      styles.td,
                      alignStyle(node.alignments[j]),
                    )}>
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
                  </td>
                ));
                return (
                  <tr
                    key={rowIsNew ? `fade-row-${i}` : i}
                    {...(rowIsNew ? stylex.props(streamingStyles.fadeIn) : {})}>
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case 'hr': {
      const HrComp = components?.hr;
      if (HrComp) return <HrComp key={index} />;
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
          <p
            key={index}
            {...stylex.props(
              spacing,
              isFirst && styles.noMarginBlockStart,
              isLast && styles.noMarginBlockEnd,
            )}>
            [{node.alt}]
          </p>
        );
      }
      return (
        <p
          key={index}
          {...stylex.props(
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <img src={safeSrc} alt={node.alt} {...stylex.props(styles.image)} />
        </p>
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a markdown string as XDS components. Supports streaming with
 * smooth fade-in animation via isStreaming.
 *
 * @example
 * ```
 * <XDSMarkdown>
 *   {'# Hello\n\nThis is **bold** and _italic_ text.\n\n- Item one\n- Item two'}
 * </XDSMarkdown>
 * ```
 */
export function XDSMarkdown({
  ref,
  children,
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
  xstyle,
  className,
  style,
  'data-testid': testId,
}: XDSMarkdownProps): React.ReactElement {
  const LinkComponent = useXDSLinkComponent();
  // Derive the set of source IDs for the parser (stable across renders when sources don't change)
  const sourceIds = useMemo(
    () => (sources ? new Set(Object.keys(sources)) : undefined),
    [sources],
  );

  // Smooth bursty streamed chunks into a steady character-by-character reveal.
  // When not streaming, the hook returns children unchanged (no-op).
  const smoothedText = useXDSStreamingText(children, isStreaming);

  const incrementalState = useRef<IncrementalState>(createIncrementalState());
  // Track how much text content was rendered on the previous pass.
  // Everything beyond this boundary is "new" and gets the fade-in animation.
  const prevTextLenRef = useRef(0);

  const blocks = useMemo(() => {
    if (isStreaming) {
      if (smoothedText === '') {
        incrementalState.current = createIncrementalState();
        prevTextLenRef.current = 0;
        return [];
      }
      const input = trimStreamingArtifacts(smoothedText);
      return parseMarkdownIncremental(
        input,
        incrementalState.current,
        sourceIds,
      );
    }
    return parseMarkdown(children, sourceIds);
  }, [smoothedText, children, isStreaming, sourceIds]);

  // Build the streaming cursor for this render pass.
  // The boundary is where "old" text ends and "new" text begins.
  const cursor: StreamingCursor = {
    offset: 0,
    boundary: prevTextLenRef.current,
    active: isStreaming,
  };

  // Build citation context — numbers are assigned in encounter order during rendering.
  // This is recreated each render so numbering stays consistent with the AST.
  const citationCtx: CitationContext | null = sources
    ? {sources, numberMap: new Map(), nextNumber: 1, style: citationStyle}
    : null;

  const rendered = (
    <div
      role="document"
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('markdown', {density}),
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

  // After rendering, update the boundary for the next pass.
  // cursor.offset now holds the total character count of the rendered tree.
  prevTextLenRef.current = cursor.offset;

  return rendered;
}

XDSMarkdown.displayName = 'XDSMarkdown';
