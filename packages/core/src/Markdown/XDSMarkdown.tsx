'use client';

/**
 * @file XDSMarkdown.tsx
 * @input Markdown string, parser AST types
 * @output Exports XDSMarkdown component and XDSMarkdownProps
 * @position Core implementation; renders markdown as XDS components
 */

import {useMemo, useRef} from 'react';
import type React from 'react';
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
  xstyle?: StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontSize: typeScaleVars['--text-body-size'],
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
    borderInlineStartColor: colorVars['--color-accent'],
    paddingInlineStart: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  // Table
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
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
      ':hover': 'underline',
    },
  },
});

// ---------------------------------------------------------------------------
// Streaming fade-in animation
// ---------------------------------------------------------------------------

const streamingFadeIn = stylex.keyframes({
  from: {opacity: 0},
  to: {opacity: 1},
});

const streamingStyles = stylex.create({
  fadeIn: {
    animationName: streamingFadeIn,
    animationDuration: durationVars['--duration-fast'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards',
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
    <>
      {content.slice(0, splitAt)}
      <span
        key={`fade-${key}-${cursor.boundary}`}
        {...stylex.props(streamingStyles.fadeIn)}>
        {content.slice(splitAt)}
      </span>
    </>
  );
}

function renderInline(
  node: InlineNode,
  index: number,
  onLinkClick: XDSMarkdownProps['onLinkClick'] | undefined,
  cursor: StreamingCursor,
): React.ReactNode {
  switch (node.type) {
    case 'text':
      return wrapTextWithFade(node.content, cursor, index);
    case 'bold':
      return (
        <strong key={index} {...stylex.props(styles.bold)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor))}
        </strong>
      );
    case 'italic':
      return (
        <em key={index}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor))}
        </em>
      );
    case 'strikethrough':
      return (
        <del key={index} {...stylex.props(styles.strikethrough)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor))}
        </del>
      );
    case 'code': {
      // Track code content length for cursor but don't split inside code
      const startOffset = cursor.offset;
      cursor.offset += node.content.length;
      if (cursor.active && startOffset >= cursor.boundary) {
        return (
          <span
            key={`fade-code-${index}-${startOffset}`}
            {...stylex.props(streamingStyles.fadeIn)}>
            <XDSCode>{node.content}</XDSCode>
          </span>
        );
      }
      return <XDSCode key={index}>{node.content}</XDSCode>;
    }
    case 'link': {
      const safeHref = sanitizeUrl(node.href);
      if (safeHref == null) {
        // Unsafe URL — render as plain text
        return (
          <span key={index}>
            {node.children.map((c, i) =>
              renderInline(c, i, onLinkClick, cursor),
            )}
          </span>
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
      return (
        <a
          key={index}
          href={safeHref}
          onClick={handleClick}
          {...(isExternal
            ? {target: '_blank', rel: 'noopener noreferrer'}
            : {})}
          {...stylex.props(styles.link)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor))}
        </a>
      );
    }
    case 'image': {
      const safeSrc = sanitizeUrl(node.src);
      if (safeSrc == null) return <span key={index}>[{node.alt}]</span>;
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
      const Tag = `h${level}` as const;
      return (
        <Tag
          key={index}
          {...stylex.props(
            styles.headingBase,
            headingStyles[level],
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor))}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p
          key={index}
          {...stylex.props(
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor))}
        </p>
      );
    case 'codeblock': {
      // Track codeblock content in cursor for accurate character counting
      cursor.offset += node.content.length;
      return (
        <div
          key={index}
          {...stylex.props(
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <XDSCodeBlock code={node.content} language={node.language} />
        </div>
      );
    }
    case 'blockquote':
      return (
        <blockquote
          key={index}
          {...stylex.props(
            styles.blockquote,
            spacing,
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
            ),
          )}
        </blockquote>
      );
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
                      renderInline(c, j, onLinkClick, cursor),
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
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}>
          <XDSList
            listStyle={node.ordered ? 'decimal' : 'disc'}
            density="compact">
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
                    renderInline(c, j, onLinkClick, cursor),
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
          <table {...stylex.props(styles.table)}>
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
                      renderInline(c, j, onLinkClick, cursor),
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
                      renderInline(c, k, onLinkClick, cursor),
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
    case 'hr':
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

export function XDSMarkdown({
  ref,
  children,
  density = 'default',
  headingLevelStart = 1,
  isStreaming = false,
  onLinkClick,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: XDSMarkdownProps): React.ReactElement {
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
      return parseMarkdownIncremental(input, incrementalState.current);
    }
    return parseMarkdown(children);
  }, [smoothedText, children, isStreaming]);

  // Build the streaming cursor for this render pass.
  // The boundary is where "old" text ends and "new" text begins.
  const cursor: StreamingCursor = {
    offset: 0,
    boundary: prevTextLenRef.current,
    active: isStreaming,
  };

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
