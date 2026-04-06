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
} from '../theme/tokens.stylex';
import {XDSCodeBlock, XDSCode} from '../CodeBlock';
import {XDSCheckboxList} from '../CheckboxList/XDSCheckboxList';
import {XDSCheckboxListItem} from '../CheckboxList/XDSCheckboxListItem';
import {xdsClassName, mergeProps} from '../utils';
import {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';
import type {
  BlockNode,
  InlineNode,
  IncrementalState,
} from './parser';

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
  onLinkClick?: (href: string, event: React.MouseEvent<HTMLAnchorElement>) => void | false;
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
  // List
  list: {
    paddingInlineStart: spacingVars['--spacing-6'],
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

function renderInline(
  node: InlineNode,
  index: number,
  onLinkClick?: XDSMarkdownProps['onLinkClick'],
): React.ReactNode {
  switch (node.type) {
    case 'text':
      return node.content;
    case 'bold':
      return (
        <strong key={index} {...stylex.props(styles.bold)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </strong>
      );
    case 'italic':
      return (
        <em key={index}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </em>
      );
    case 'strikethrough':
      return (
        <del key={index} {...stylex.props(styles.strikethrough)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </del>
      );
    case 'code':
      return <XDSCode key={index}>{node.content}</XDSCode>;
    case 'link': {
      const safeHref = sanitizeUrl(node.href);
      if (safeHref == null) {
        // Unsafe URL — render as plain text
        return <span key={index}>{node.children.map((c, i) => renderInline(c, i, onLinkClick))}</span>;
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
          {...(isExternal ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
          {...stylex.props(styles.link)}
        >
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </a>
      );
    }
    case 'image': {
      const safeSrc = sanitizeUrl(node.src);
      if (safeSrc == null) return <span key={index}>[{node.alt}]</span>;
      return <img key={index} src={safeSrc} alt={node.alt} {...stylex.props(styles.image)} />;
    }
    case 'break':
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
        ? (compact ? styles.spacingHeadingMajorCompact : styles.spacingHeadingMajorDefault)
        : (compact ? styles.spacingHeadingMinorCompact : styles.spacingHeadingMinorDefault);
    case 'paragraph':
      return compact ? styles.spacingParagraphCompact : styles.spacingParagraphDefault;
    case 'codeblock':
      return compact ? styles.spacingCodeblockCompact : styles.spacingCodeblockDefault;
    case 'blockquote':
      return compact ? styles.spacingBlockquoteCompact : styles.spacingBlockquoteDefault;
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
  onLinkClick?: XDSMarkdownProps['onLinkClick'],
): React.ReactNode {
  const spacing = getElementSpacing(node, density);
  const isFirst = index === 0;
  const isLast = index === blockCount - 1;

  switch (node.type) {
    case 'heading': {
      const level = Math.min(node.level + headingLevelStart - 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
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
          )}
        >
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
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
          )}
        >
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </p>
      );
    case 'codeblock':
      return (
        <div
          key={index}
          {...stylex.props(
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}
        >
          <XDSCodeBlock code={node.content} language={node.language} />
        </div>
      );
    case 'blockquote':
      return (
        <blockquote
          key={index}
          {...stylex.props(
            styles.blockquote,
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}
        >
          {node.children.map((c, i) => renderBlock(c, i, node.children.length, density, headingLevelStart, onLinkClick))}
        </blockquote>
      );
    case 'list': {
      // Detect task lists: all items have a checked state
      const isTaskList = node.items.length > 0 && node.items.every(item => item.checked != null);

      if (isTaskList) {
        // Extract labels from task items — use first paragraph's inline text
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
            )}
          >
            <XDSCheckboxList
              label="Task list"
              isLabelHidden
              value={checkedValues}
              isDisabled
              density={density === 'compact' ? 'compact' : 'balanced'}
            >
              {node.items.map((item, i) => {
                const firstChild = item.children[0];
                const isInline = item.children.length === 1 && firstChild?.type === 'paragraph';
                // Build label from first paragraph text
                const label = isInline
                  ? firstChild.children.map(c => c.type === 'text' ? c.content : '').join('')
                  : `Item ${i + 1}`;

                return (
                  <XDSCheckboxListItem
                    key={i}
                    value={`task-${i}`}
                    label={label}
                    description={
                      isInline
                        ? undefined
                        : undefined
                    }
                  />
                );
              })}
            </XDSCheckboxList>
          </div>
        );
      }

      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={index}
          {...(node.ordered && node.start != null ? {start: node.start} : {})}
          {...stylex.props(
            styles.list,
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}
        >
          {node.items.map((item, i) => {
            const firstChild = item.children[0];
            const isInline = item.children.length === 1 && firstChild?.type === 'paragraph';

            return (
              <li key={i}>
                {isInline ? (
                  <span>{firstChild.children.map((c, j) => renderInline(c, j, onLinkClick))}</span>
                ) : (
                  item.children.map((c, j) => renderBlock(c, j, item.children.length, density, headingLevelStart, onLinkClick))
                )}
              </li>
            );
          })}
        </Tag>
      );
    }
    case 'table': {
      const alignStyle = (a: typeof node.alignments[number]) =>
        a === 'center' ? styles.alignCenter : a === 'right' ? styles.alignRight : styles.alignLeft;
      return (
        <div
          key={index}
          {...stylex.props(
            styles.tableWrapper,
            spacing,
            isFirst && styles.noMarginBlockStart,
            isLast && styles.noMarginBlockEnd,
          )}
        >
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                {node.headers.map((h, i) => (
                  <th key={i} {...stylex.props(styles.th, alignStyle(node.alignments[i]))}>
                    {h.children.map((c, j) => renderInline(c, j, onLinkClick))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {node.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} {...stylex.props(styles.td, alignStyle(node.alignments[j]))}>
                      {cell.children.map((c, k) => renderInline(c, k, onLinkClick))}
                    </td>
                  ))}
                </tr>
              ))}
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
            )}
          >
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
          )}
        >
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
  const incrementalState = useRef<IncrementalState>(createIncrementalState());

  const blocks = useMemo(() => {
    if (isStreaming) {
      if (children === '') {
        incrementalState.current = createIncrementalState();
        return [];
      }
      const input = trimStreamingArtifacts(children);
      return parseMarkdownIncremental(input, incrementalState.current);
    }
    return parseMarkdown(children);
  }, [children, isStreaming]);

  return (
    <div
      role="document"
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('markdown', {density}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
    >
      {blocks.map((block, i) => renderBlock(block, i, blocks.length, density, headingLevelStart, onLinkClick))}
    </div>
  );
}

XDSMarkdown.displayName = 'XDSMarkdown';
