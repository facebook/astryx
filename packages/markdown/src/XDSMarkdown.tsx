'use client';

/**
 * @file XDSMarkdown.tsx
 * @input Uses React, markdown-to-jsx, StyleX, XDS design tokens
 * @output Exports XDSMarkdown component and types
 * @position Core implementation; renders markdown strings as styled XDS components
 *
 * SYNC: When modified, update:
 * - /packages/markdown/src/index.ts (exports if types change)
 * - /packages/markdown/src/markdown.stylex.ts (if new elements need styles)
 */

import {type ReactNode, useMemo, Children, isValidElement} from 'react';
import Markdown from 'markdown-to-jsx';
import type {MarkdownToJSX} from 'markdown-to-jsx';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useXDSStreamingText} from '@xds/core/hooks';
import {useXDSLinkify} from '@xds/core/Link';
import type {LinkifyPattern} from '@xds/core/Link';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSCode} from '@xds/core/CodeBlock';
import {
  rootStyles,
  blockStyles,
  headingStyles,
  inlineStyles,
  linkStyles,
  blockquoteStyles,
  listStyles,
  tableStyles,
  hrStyles,
  imgStyles,
  streamingStyles,
} from './markdown.stylex';

// =============================================================================
// Types
// =============================================================================

/** Props passed by markdown-to-jsx to component overrides (arbitrary HTML attributes). */
type MarkdownOverrideProps = Record<string, unknown>;

export interface XDSMarkdownComponents {
  h1?: React.ComponentType<MarkdownOverrideProps>;
  h2?: React.ComponentType<MarkdownOverrideProps>;
  h3?: React.ComponentType<MarkdownOverrideProps>;
  h4?: React.ComponentType<MarkdownOverrideProps>;
  h5?: React.ComponentType<MarkdownOverrideProps>;
  h6?: React.ComponentType<MarkdownOverrideProps>;
  p?: React.ComponentType<MarkdownOverrideProps>;
  a?: React.ComponentType<MarkdownOverrideProps>;
  img?: React.ComponentType<MarkdownOverrideProps>;
  code?: React.ComponentType<{language?: string; children: string; inline?: boolean}>;
  pre?: React.ComponentType<MarkdownOverrideProps>;
  blockquote?: React.ComponentType<MarkdownOverrideProps>;
  ul?: React.ComponentType<MarkdownOverrideProps>;
  ol?: React.ComponentType<MarkdownOverrideProps>;
  li?: React.ComponentType<MarkdownOverrideProps>;
  table?: React.ComponentType<MarkdownOverrideProps>;
  thead?: React.ComponentType<MarkdownOverrideProps>;
  tbody?: React.ComponentType<MarkdownOverrideProps>;
  tr?: React.ComponentType<MarkdownOverrideProps>;
  th?: React.ComponentType<MarkdownOverrideProps>;
  td?: React.ComponentType<MarkdownOverrideProps>;
  hr?: React.ComponentType<MarkdownOverrideProps>;
  strong?: React.ComponentType<MarkdownOverrideProps>;
  em?: React.ComponentType<MarkdownOverrideProps>;
  del?: React.ComponentType<MarkdownOverrideProps>;
  input?: React.ComponentType<MarkdownOverrideProps>;
}

export interface XDSMarkdownProps {
  ref?: React.Ref<HTMLDivElement>;
  /** Markdown string to render. */
  children: string;
  /** Component overrides for rendered elements. */
  components?: XDSMarkdownComponents;
  /**
   * Spacing density.
   * @default 'default'
   */
  density?: 'default' | 'compact';
  /**
   * Maximum heading level to render. Deeper headings are clamped.
   * @default 6
   */
  maxHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Whether content is actively streaming. When true:
   * - Smooths bursty token delivery into steady character reveal
   * - Shows a blinking cursor at the end
   * - Suppresses trailing margin to prevent layout jumping
   *
   * The component handles streaming text buffering internally —
   * just pass the raw accumulating string as children.
   * @default false
   */
  isStreaming?: boolean;
  /**
   * Custom patterns to auto-detect and linkify in text content.
   * Detected patterns render as XDSLink elements that respect XDSLinkProvider.
   * URLs and emails are always detected by default.
   *
   * @example
   * ```
   * <XDSMarkdown linkifyPatterns={[
   *   { pattern: /\bT(\d+)\b/g, href: m => `https://tasks.example.com/${m[1]}` },
   * ]}>
   *   {text}
   * </XDSMarkdown>
   * ```
   */
  linkifyPatterns?: LinkifyPattern[];
  /** Callback when a link is clicked. Return false to prevent navigation. */
  onLinkClick?: (href: string, event: React.MouseEvent) => void | false;
  xstyle?: StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// =============================================================================
// Heading helpers
// =============================================================================

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_STYLES = {
  default: {
    1: headingStyles.h1, 2: headingStyles.h2,
    3: headingStyles.h3, 4: headingStyles.h4,
    5: headingStyles.h4, 6: headingStyles.h4,
  },
  compact: {
    1: headingStyles.h1Compact, 2: headingStyles.h2Compact,
    3: headingStyles.h3Compact, 4: headingStyles.h4Compact,
    5: headingStyles.h4Compact, 6: headingStyles.h4Compact,
  },
} as const;

function clampHeading(level: HeadingLevel, max: HeadingLevel): HeadingLevel {
  return Math.min(level, max) as HeadingLevel;
}

function createHeadingComponent(
  level: HeadingLevel,
  density: 'default' | 'compact',
  maxHeadingLevel: HeadingLevel,
) {
  const clamped = clampHeading(level, maxHeadingLevel);
  const Tag = ('h' + clamped) as keyof JSX.IntrinsicElements;
  const style = HEADING_STYLES[density][clamped];

  return function HeadingOverride({children, ...props}: Record<string, unknown>) {
    return (
      <Tag {...stylex.props(headingStyles.base, style)} {...props}>
        {children as ReactNode}
      </Tag>
    );
  };
}

// =============================================================================
// Override components
// =============================================================================

function ParagraphOverride({children, density, linkifyPatterns}: {children: ReactNode; density: 'default' | 'compact'; linkifyPatterns?: LinkifyPattern[]}) {
  return <p {...stylex.props(blockStyles[density])}>{linkifyChildren(children, linkifyPatterns)}</p>;
}

function LinkOverride({children, href: rawHref, onLinkClick: rawOnLinkClick, ...props}: Record<string, unknown>) {
  const href = rawHref as string | undefined;
  const onLinkClick = rawOnLinkClick as ((href: string, event: React.MouseEvent) => void | false) | undefined;
  const isExternal = href?.startsWith('http');
  return (
    <a
      href={href}
      {...(isExternal ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
      {...stylex.props(linkStyles.base)}
      onClick={onLinkClick && href ? (e: React.MouseEvent) => {
        if (onLinkClick(href, e) === false) e.preventDefault();
      } : undefined}
      {...props}
    >
      {children as ReactNode}
    </a>
  );
}

function BlockquoteOverride({children, density}: {children: ReactNode; density: 'default' | 'compact'}) {
  return <blockquote {...stylex.props(blockquoteStyles[density])}>{children}</blockquote>;
}

function PreOverride({children}: {children: ReactNode}) {
  // markdown-to-jsx renders fenced blocks as: <pre><code class="lang-xxx">content</code></pre>
  // Extract language and code text from the child code element and render XDSCodeBlock.
  const child = Children.only(children) as React.ReactElement<Record<string, unknown>>;
  if (child && isValidElement(child)) {
    const props = child.props as Record<string, unknown>;
    const className = props?.className ?? '';
    const langMatch = typeof className === 'string' && className.match(/lang-(\S+)/);
    const language = langMatch ? langMatch[1] : 'plaintext';
    const codeText = typeof props?.children === 'string' ? props.children : String(props?.children ?? '');

    return (
      <XDSCodeBlock
        code={codeText}
        language={language}
        title={language !== 'plaintext' ? language : undefined}
      />
    );
  }

  // Fallback: render as-is
  return <pre>{children}</pre>;
}

function CodeOverride({children, className: _className}: {children: string; className?: string}) {
  // Inline code only — fenced blocks are handled by PreOverride
  return <XDSCode>{children}</XDSCode>;
}

function TableWrapperOverride({children, density}: {children: ReactNode; density: 'default' | 'compact'}) {
  // markdown-to-jsx renders <table> itself — we replace it with a wrapped version.
  // Children are thead/tbody, passed through directly.
  return (
    <div {...stylex.props(density === 'compact' ? tableStyles.wrapperCompact : tableStyles.wrapper)}>
      <table {...stylex.props(tableStyles.table)}>
        {children}
      </table>
    </div>
  );
}

function ThOverride({children, ...props}: Record<string, unknown>) {
  return <th {...stylex.props(tableStyles.th)} {...props}>{children as ReactNode}</th>;
}

function TdOverride({children, linkifyPatterns, ...props}: Record<string, unknown>) {
  return <td {...stylex.props(tableStyles.td)} {...props}>{linkifyChildren(children as ReactNode, linkifyPatterns as LinkifyPattern[] | undefined)}</td>;
}

function HrOverride({density}: {density: 'default' | 'compact'}) {
  return <hr {...stylex.props(hrStyles[density])} />;
}

function ImgOverride({src, alt, ...props}: Record<string, unknown>) {
  return <img src={src as string} alt={(alt as string) || ''} {...stylex.props(imgStyles.base)} {...props} />;
}

function UlOverride({children, density}: {children: ReactNode; density: 'default' | 'compact'}) {
  return <ul {...stylex.props(listStyles.ul, blockStyles[density])}>{children}</ul>;
}

function OlOverride({children, density}: {children: ReactNode; density: 'default' | 'compact'}) {
  return <ol {...stylex.props(listStyles.ol, blockStyles[density])}>{children}</ol>;
}

function LiOverride({children, density, linkifyPatterns}: {children: ReactNode; density: 'default' | 'compact'; linkifyPatterns?: LinkifyPattern[]}) {
  return <li {...stylex.props(density === 'compact' ? listStyles.liCompact : listStyles.li)}>{linkifyChildren(children, linkifyPatterns)}</li>;
}

function StrongOverride({children}: {children: ReactNode}) {
  return <strong {...stylex.props(inlineStyles.strong)}>{children}</strong>;
}

function EmOverride({children}: {children: ReactNode}) {
  return <em {...stylex.props(inlineStyles.em)}>{children}</em>;
}

function DelOverride({children}: {children: ReactNode}) {
  return <del {...stylex.props(inlineStyles.del)}>{children}</del>;
}

// =============================================================================
// Linkify component — renders a string with auto-detected links
// =============================================================================

function LinkifiedText({children, patterns}: {children: string; patterns: LinkifyPattern[]}) {
  const nodes = useXDSLinkify(children, {patterns});
  return <>{nodes}</>;
}

/**
 * Walk a ReactNode tree and replace string leaves with LinkifiedText components.
 * Non-string children (elements, numbers, etc.) are passed through unchanged.
 */
function linkifyChildren(
  children: ReactNode,
  patterns: LinkifyPattern[] | undefined,
): ReactNode {
  if (!patterns) return children;

  return Children.map(children, (child) => {
    if (typeof child === 'string' && child.length > 0) {
      return <LinkifiedText patterns={patterns}>{child}</LinkifiedText>;
    }
    return child;
  });
}

// =============================================================================
// Build overrides for markdown-to-jsx
// =============================================================================

function buildOverrides(
  density: 'default' | 'compact',
  maxHeadingLevel: HeadingLevel,
  onLinkClick: XDSMarkdownProps['onLinkClick'] | undefined,
  components: XDSMarkdownComponents | undefined,
  linkifyPatterns: LinkifyPattern[] | undefined,
): MarkdownToJSX.Overrides {
  const lp = linkifyPatterns && linkifyPatterns.length > 0 ? linkifyPatterns : undefined;
  return {
    h1: {component: components?.h1 ?? createHeadingComponent(1, density, maxHeadingLevel)},
    h2: {component: components?.h2 ?? createHeadingComponent(2, density, maxHeadingLevel)},
    h3: {component: components?.h3 ?? createHeadingComponent(3, density, maxHeadingLevel)},
    h4: {component: components?.h4 ?? createHeadingComponent(4, density, maxHeadingLevel)},
    h5: {component: components?.h5 ?? createHeadingComponent(5, density, maxHeadingLevel)},
    h6: {component: components?.h6 ?? createHeadingComponent(6, density, maxHeadingLevel)},
    p: {component: components?.p ?? ParagraphOverride, props: {density, linkifyPatterns: lp}},
    a: {component: components?.a ?? LinkOverride, props: {onLinkClick}},
    blockquote: {component: components?.blockquote ?? BlockquoteOverride, props: {density}},
    pre: {component: components?.pre ?? PreOverride},
    code: {component: components?.code ?? CodeOverride},
    table: {component: components?.table ?? TableWrapperOverride, props: {density}},
    th: {component: components?.th ?? ThOverride},
    td: {component: components?.td ?? TdOverride, props: {linkifyPatterns: lp}},
    hr: {component: components?.hr ?? HrOverride, props: {density}},
    img: {component: components?.img ?? ImgOverride},
    ul: {component: components?.ul ?? UlOverride, props: {density}},
    ol: {component: components?.ol ?? OlOverride, props: {density}},
    li: {component: components?.li ?? LiOverride, props: {density, linkifyPatterns: lp}},
    strong: {component: components?.strong ?? StrongOverride},
    em: {component: components?.em ?? EmOverride},
    del: {component: components?.del ?? DelOverride},
  };
}

// =============================================================================
// XDSMarkdown component
// =============================================================================

/**
 * Styled markdown renderer. Maps markdown elements to XDS-styled HTML
 * with design-system-consistent typography, spacing, and theming.
 *
 * Always renders formatted markdown — during streaming and after completion.
 * No "plain text to formatted" swap. Pair with `useStreamingText` from
 * `@xds/core` for smooth streaming reveal.
 *
 * @example
 * ```
 * <XDSMarkdown>{markdownString}</XDSMarkdown>
 * ```
 *
 * @example
 * ```
 * <XDSMarkdown density="compact">{comment}</XDSMarkdown>
 * ```
 *
 * @example
 * ```
 * // Streaming — just pass isStreaming, component handles the rest
 * <XDSMarkdown isStreaming={isStreaming}>{partialText}</XDSMarkdown>
 * ```
 *
 * @example
 * ```
 * // Auto-linkify task references
 * <XDSMarkdown linkifyPatterns={[
 *   { pattern: /\bT(\d+)\b/g, href: m => `/tasks/${m[1]}` },
 * ]}>
 *   {text}
 * </XDSMarkdown>
 * ```
 */
export function XDSMarkdown({
  children,
  components,
  density = 'default',
  maxHeadingLevel = 6,
  isStreaming = false,
  linkifyPatterns,
  onLinkClick,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSMarkdownProps) {
  // When streaming, smooth the bursty text into a steady reveal
  const displayedText = useXDSStreamingText(children, isStreaming);

  const overrides = useMemo(
    () => buildOverrides(density, maxHeadingLevel, onLinkClick, components, linkifyPatterns),
    [density, maxHeadingLevel, onLinkClick, components, linkifyPatterns],
  );

  const options: MarkdownToJSX.Options = useMemo(
    () => ({overrides, forceBlock: true}),
    [overrides],
  );

  const rootProps = stylex.props(rootStyles.base, xstyle);

  return (
    <div
      ref={ref}
      role="document"
      {...rootProps}
      className={className ? (rootProps.className + ' ' + className).trim() : rootProps.className}
      style={style ? {...rootProps.style, ...style} : rootProps.style}
      data-testid={props['data-testid']}
    >
      <Markdown options={options}>{displayedText}</Markdown>
      {isStreaming && <span {...stylex.props(streamingStyles.cursor)} aria-hidden="true" />}
    </div>
  );
}

XDSMarkdown.displayName = 'XDSMarkdown';
