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
import {xdsClassName, mergeProps} from '../utils';
import {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
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
  maxHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
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

const cursorBlink = stylex.keyframes({
  '0%, 100%': {opacity: 1},
  '50%': {opacity: 0},
});

const styles = stylex.create({
  root: {
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontSize: typeScaleVars['--text-body-size'],
  },
  // Headings
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
  // Block spacing
  blockDefault: {
    marginTop: spacingVars['--spacing-3'],
    marginBottom: spacingVars['--spacing-3'],
  },
  blockCompact: {
    marginTop: spacingVars['--spacing-1'],
    marginBottom: spacingVars['--spacing-1'],
  },
  headingDefault: {
    marginTop: spacingVars['--spacing-5'],
    marginBottom: spacingVars['--spacing-3'],
  },
  headingCompact: {
    marginTop: spacingVars['--spacing-3'],
    marginBottom: spacingVars['--spacing-1'],
  },
  // Blockquote
  blockquote: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: colorVars['--color-border-emphasized'],
    paddingLeft: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    marginLeft: 0,
    marginRight: 0,
  },
  // List
  list: {
    paddingLeft: spacingVars['--spacing-6'],
  },
  taskItem: {
    listStyleType: 'none',
  },
  taskCheckbox: {
    marginRight: spacingVars['--spacing-2'],
  },
  // Table
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
    textDecoration: 'none',
  },
  // Streaming cursor
  cursor: {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    backgroundColor: colorVars['--color-text-primary'],
    marginLeft: spacingVars['--spacing-0-5'],
    verticalAlign: 'text-bottom',
    animationName: cursorBlink,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'step-end',
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
      const isExternal = node.href.startsWith('http');
      const handleClick = onLinkClick
        ? (e: React.MouseEvent<HTMLAnchorElement>) => {
            const result = onLinkClick(node.href, e);
            if (result === false) {
              e.preventDefault();
            }
          }
        : undefined;
      return (
        <a
          key={index}
          href={node.href}
          onClick={handleClick}
          {...(isExternal ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
          {...stylex.props(styles.link)}
        >
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </a>
      );
    }
    case 'image':
      return <img key={index} src={node.src} alt={node.alt} {...stylex.props(styles.image)} />;
  }
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

function renderBlock(
  node: BlockNode,
  index: number,
  density: 'default' | 'compact',
  maxHeadingLevel: 1 | 2 | 3 | 4 | 5 | 6,
  onLinkClick?: XDSMarkdownProps['onLinkClick'],
): React.ReactNode {
  const blockSpacing = density === 'compact' ? styles.blockCompact : styles.blockDefault;
  const headingSpacing = density === 'compact' ? styles.headingCompact : styles.headingDefault;

  switch (node.type) {
    case 'heading': {
      const level = Math.max(node.level, maxHeadingLevel) as 1 | 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as const;
      return (
        <Tag key={index} {...stylex.props(headingStyles[level], headingSpacing)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p key={index} {...stylex.props(blockSpacing)}>
          {node.children.map((c, i) => renderInline(c, i, onLinkClick))}
        </p>
      );
    case 'codeblock':
      return (
        <div key={index} {...stylex.props(blockSpacing)}>
          <XDSCodeBlock code={node.content} language={node.language} />
        </div>
      );
    case 'blockquote':
      return (
        <blockquote key={index} {...stylex.props(styles.blockquote, blockSpacing)}>
          {node.children.map((c, i) => renderBlock(c, i, density, maxHeadingLevel, onLinkClick))}
        </blockquote>
      );
    case 'list': {
      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={index}
          {...(node.ordered && node.start != null ? {start: node.start} : {})}
          {...stylex.props(styles.list, blockSpacing)}
        >
          {node.items.map((item, i) => (
            <li
              key={i}
              {...(item.checked != null ? stylex.props(styles.taskItem) : {})}
            >
              {item.checked != null && (
                <input
                  type="checkbox"
                  checked={item.checked}
                  disabled
                  readOnly
                  {...stylex.props(styles.taskCheckbox)}
                />
              )}
              {item.children.map((c, j) => renderBlock(c, j, density, maxHeadingLevel, onLinkClick))}
            </li>
          ))}
        </Tag>
      );
    }
    case 'table': {
      const alignStyle = (a: typeof node.alignments[number]) =>
        a === 'center' ? styles.alignCenter : a === 'right' ? styles.alignRight : styles.alignLeft;
      return (
        <div key={index} {...stylex.props(blockSpacing)}>
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
      return <hr key={index} {...stylex.props(styles.hr, blockSpacing)} />;
    case 'image':
      return (
        <p key={index} {...stylex.props(blockSpacing)}>
          <img src={node.src} alt={node.alt} {...stylex.props(styles.image)} />
        </p>
      );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function XDSMarkdown({
  ref,
  children,
  density = 'default',
  maxHeadingLevel = 1,
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
      return parseMarkdownIncremental(children, incrementalState.current);
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
      {blocks.map((block, i) => renderBlock(block, i, density, maxHeadingLevel, onLinkClick))}
      {isStreaming && <span {...stylex.props(styles.cursor)} aria-hidden="true" />}
    </div>
  );
}

XDSMarkdown.displayName = 'XDSMarkdown';
