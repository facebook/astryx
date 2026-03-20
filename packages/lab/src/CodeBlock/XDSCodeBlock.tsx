/**
 * @file XDSCodeBlock.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API
 * @output Exports XDSCodeBlock component and XDSCodeBlockProps
 * @position Core implementation; read-only syntax-highlighted code display
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/CodeBlock/index.ts (exports if types change)
 * - /packages/lab/src/CodeBlock/tokenizer.ts (shared tokenizer)
 * - /packages/lab/src/CodeBlock/highlightStyles.ts (::highlight rules)
 */

'use client';

import {useEffect, useRef, useState, useCallback} from 'react';
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
  lineHeightVars,
} from '@xds/core/theme/tokens.stylex';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {tokenize} from './tokenizer';
import type {Token} from './tokenizer';
import {ensureHighlightStyles, TOKEN_TYPES} from './highlightStyles';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    position: 'relative',
    margin: 0,
    borderRadius: radiusVars['--radius-2'],
    backgroundColor: colorVars['--color-wash'],
    border: `1px solid ${colorVars['--color-border']}`,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    borderBottom: `1px solid ${colorVars['--color-border']}`,
    backgroundColor: colorVars['--color-surface'],
  },
  headerTitle: {
    fontSize: textSizeVars['--text-sm'],
    fontFamily: typographyVars['--font-code'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    margin: 0,
    lineHeight: lineHeightVars['--leading-snug'],
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
    color: colorVars['--color-text-disabled'],
    borderRight: `1px solid ${colorVars['--color-border']}`,
  },
  gutterLine: {
    fontFamily: typographyVars['--font-code'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
  code: {
    display: 'block',
    flex: 1,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    margin: 0,
    fontFamily: typographyVars['--font-code'],
    color: colorVars['--color-text-primary'],
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
    lineHeight: lineHeightVars['--leading-normal'],
    contentVisibility: 'auto',
    containIntrinsicBlockSize: 'auto 1lh',
  },
  lineHighlighted: {
    backgroundColor: colorVars['--color-accent-muted'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
    paddingInline: spacingVars['--spacing-4'],
    borderLeft: `2px solid ${colorVars['--color-accent']}`,
  },
  sizeSm: {
    fontSize: textSizeVars['--text-sm'],
  },
  sizeMd: {
    fontSize: textSizeVars['--text-base'],
  },
  gutterSm: {
    fontSize: textSizeVars['--text-sm'],
  },
  gutterMd: {
    fontSize: textSizeVars['--text-base'],
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-1'],
    border: 'none',
    borderRadius: radiusVars['--radius-1'],
    backgroundColor: 'transparent',
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    fontFamily: typographyVars['--font-code'],
    fontSize: textSizeVars['--text-sm'],
    lineHeight: '1',
    transition: 'background-color 0.15s ease, color 0.15s ease',
  },
  copyButtonAbsolute: {
    position: 'absolute',
    top: spacingVars['--spacing-2'],
    right: spacingVars['--spacing-2'],
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface XDSCodeBlockProps extends XDSBaseProps<HTMLPreElement> {
  /** Ref forwarded to the root <pre> element */
  ref?: React.Ref<HTMLPreElement>;
  /** The code string to display */
  code: string;
  /** Language for syntax highlighting. @default "plaintext" */
  language?: string;
  /** Filename/label in header bar */
  title?: string;
  /** Show line number gutter. @default false */
  hasLineNumbers?: boolean;
  /** 1-indexed lines to highlight. */
  highlightLines?: number[];
  /** Show copy-to-clipboard button. @default true */
  hasCopyButton?: boolean;
  /** Callback after copy */
  onCopy?: () => void;
  /** Wrap long lines vs horizontal scroll. @default false */
  isWrapped?: boolean;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Text size. @default "md" */
  size?: 'sm' | 'md';
  /** Custom tokenizer override */
  tokenizer?: (
    code: string,
    language: string,
  ) => Array<{type: string; start: number; end: number}>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if CSS Custom Highlight API is available.
 */
function hasHighlightAPI(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof Highlight !== 'undefined'
  );
}

/**
 * Unique instance counter to namespace highlights when multiple
 * code blocks are on the same page.
 */
let instanceCounter = 0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A read-only syntax-highlighted code block.
 *
 * Uses the CSS Custom Highlight API for zero-DOM-overhead syntax coloring.
 * Falls back to plain text display in browsers without support.
 *
 * @example
 * ```tsx
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
  hasLineNumbers = false,
  highlightLines,
  hasCopyButton = true,
  onCopy,
  isWrapped = false,
  maxHeight,
  size = 'md',
  tokenizer: customTokenizer,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [instanceId] = useState(() => ++instanceCounter);
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');
  // Remove trailing empty line from code that ends with newline
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  const highlightSet = highlightLines ? new Set(highlightLines) : null;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, onCopy]);

  // Apply CSS Custom Highlight API ranges
  useEffect(() => {
    if (!hasHighlightAPI()) return;

    ensureHighlightStyles();

    const codeEl = codeRef.current;
    if (!codeEl) return;

    const tok = customTokenizer ?? tokenize;
    const tokens = tok(code, language);
    if (tokens.length === 0) return;

    // Group tokens by type
    const tokensByType = new Map<string, Token[]>();
    for (const token of tokens) {
      const existing = tokensByType.get(token.type);
      if (existing) {
        existing.push(token);
      } else {
        tokensByType.set(token.type, [token]);
      }
    }

    // Build text node mapping using TreeWalker — same approach as CodeEditor.
    // Finds all text nodes and maps code offsets to DOM positions.
    // Code string has \n between lines; DOM has separate text nodes per line
    // with no \n, so we add 1 after each line's text node to stay in sync.
    const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
    const textNodes: Array<{node: Text; start: number}> = [];
    let charOffset = 0;

    let currentNode = walker.nextNode();
    while (currentNode) {
      const text = currentNode as Text;
      const content = text.textContent ?? '';
      // Skip zero-width space placeholders for empty lines
      if (content === '\u200b') {
        // Empty line — still accounts for the \n in the code string
        charOffset += 1; // just the \n
      } else {
        textNodes.push({node: text, start: charOffset});
        charOffset += content.length + 1; // +1 for the \n after this line
      }
      currentNode = walker.nextNode();
    }

    /**
     * Find the text node and local offset for a given code offset.
     */
    function findPosition(offset: number): {node: Text; offset: number} | null {
      for (let i = textNodes.length - 1; i >= 0; i--) {
        const entry = textNodes[i];
        if (offset >= entry.start) {
          const localOffset = offset - entry.start;
          if (localOffset <= (entry.node.textContent?.length ?? 0)) {
            return {node: entry.node, offset: localOffset};
          }
          return null;
        }
      }
      return null;
    }

    // Create highlight ranges for each token type.
    // Multiple CodeBlock instances share the same highlight names —
    // we add our ranges to the existing Highlight (or create a new one).
    // On cleanup, we remove only our ranges.
    const myRanges: Range[] = [];

    for (const tokenType of TOKEN_TYPES) {
      const typedTokens = tokensByType.get(tokenType);
      if (!typedTokens || typedTokens.length === 0) continue;

      const name = `xds-${tokenType}`;
      let highlight = CSS.highlights.get(name);
      if (!highlight) {
        highlight = new Highlight();
        CSS.highlights.set(name, highlight);
      }

      for (const token of typedTokens) {
        const startPos = findPosition(token.start);
        const endPos = findPosition(token.end);
        if (!startPos || !endPos) continue;

        try {
          const range = new Range();
          range.setStart(startPos.node, startPos.offset);
          range.setEnd(endPos.node, endPos.offset);
          highlight.add(range);
          myRanges.push(range);
        } catch {
          // Skip invalid ranges
        }
      }
    }

    return () => {
      // Remove only this instance's ranges from the shared highlights
      for (const range of myRanges) {
        for (const tokenType of TOKEN_TYPES) {
          const highlight = CSS.highlights.get(`xds-${tokenType}`);
          if (highlight) {
            highlight.delete(range);
          }
        }
      }
    };
  }, [code, language, customTokenizer, instanceId]);

  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const gutterSizeStyle = size === 'sm' ? styles.gutterSm : styles.gutterMd;
  const showHeader = title != null;

  const scrollStyle: React.CSSProperties | undefined = maxHeight
    ? {maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight}
    : undefined;

  const copyButtonEl = hasCopyButton ? (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      {...stylex.props(
        styles.copyButton,
        !showHeader && styles.copyButtonAbsolute,
      )}>
      {copied ? '✓' : '⎘'}
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
          <span {...stylex.props(styles.headerTitle)}>{title}</span>
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
          <code
            ref={codeRef}
            {...stylex.props(
              styles.code,
              sizeStyle,
              isWrapped && styles.codeWrapped,
            )}>
            {lines.map((line, i) => (
              <div
                key={i}
                data-line={i + 1}
                {...stylex.props(
                  styles.line,
                  highlightSet?.has(i + 1) && styles.lineHighlighted,
                )}>
                {line || '\u200b'}
              </div>
            ))}
          </code>
        </div>
      </div>
      {!showHeader && copyButtonEl}
    </pre>
  );
}

XDSCodeBlock.displayName = 'XDSCodeBlock';
