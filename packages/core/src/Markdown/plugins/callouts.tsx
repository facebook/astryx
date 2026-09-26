// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file callouts.tsx
 * @input Fenced callout blocks with a constrained variant and optional title
 * @output A first-party flow-container plugin with static, non-live rendering
 * @position Optional Markdown syntax and renderer built only on the public plugin protocol
 */

import * as stylex from '@stylexjs/stylex';
import {Text} from '../../Text/Text';
import {
  borderVars,
  colorVars,
  radiusVars,
  spacingVars,
} from '../../theme/tokens.stylex';
import {
  createMarkdownPlugin,
  type MarkdownBlockContainerExtensionNode,
  type MarkdownSyntaxPluginDefinition,
  type MarkdownTokenizerInput,
  type MarkdownTokenizeResult,
} from './protocol';

export type MarkdownCalloutStatus = 'info' | 'success' | 'warning' | 'error';

export type MarkdownCalloutNode = MarkdownBlockContainerExtensionNode<
  'callouts',
  'callout',
  {readonly status: MarkdownCalloutStatus; readonly title: string}
>;

const DEFAULT_TITLES: Readonly<Record<MarkdownCalloutStatus, string>> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const OPENING_LINE =
  /^:::(info|success|warning|error)(?:[ \t]+([^\r\n]+?))?[ \t]*(?:\r\n|\n|\r)$/;
const NESTED_OPENING_LINE =
  /^ {0,3}:::(?:info|success|warning|error)(?:[ \t]+[^\r\n]+)?[ \t]*$/;
const CLOSING_LINE = /^ {0,3}:::[ \t]*$/;
const FENCE_LINE = /^(`{3,}|~{3,})(.*)$/;
const MAX_CALLOUT_SPAN = 100_000;

interface SourceLine {
  readonly start: number;
  readonly contentEnd: number;
  readonly end: number;
  readonly value: string;
}

function readLine(source: string, start: number, end: number): SourceLine {
  let contentEnd = start;
  while (
    contentEnd < end &&
    source[contentEnd] !== '\n' &&
    source[contentEnd] !== '\r'
  ) {
    contentEnd++;
  }
  let lineEnd = contentEnd;
  if (lineEnd < end) {
    lineEnd += source[lineEnd] === '\r' && source[lineEnd + 1] === '\n' ? 2 : 1;
  }
  return {
    start,
    contentEnd,
    end: lineEnd,
    value: source.slice(start, contentEnd),
  };
}

function tokenizeCallout({
  source,
  offset,
  end,
  isFinal,
  context,
  lineStart,
  column,
}: MarkdownTokenizerInput): MarkdownTokenizeResult<MarkdownCalloutNode> {
  if (
    context !== 'block' ||
    column > 3 ||
    !/^ {0,3}$/.test(source.slice(lineStart, offset))
  ) {
    return {status: 'no-match'};
  }
  const opening = readLine(source, offset, end);
  const openingMatch = OPENING_LINE.exec(
    source.slice(opening.start, opening.end),
  );
  if (openingMatch == null) {
    return {status: 'no-match'};
  }
  const status = openingMatch[1] as MarkdownCalloutStatus;
  const title = openingMatch[2]?.trim() || DEFAULT_TITLES[status];
  let depth = 1;
  let cursor = opening.end;
  let fence: {readonly marker: '`' | '~'; readonly length: number} | null =
    null;

  while (cursor < end) {
    const line = readLine(source, cursor, end);
    const fenceMatch = FENCE_LINE.exec(line.value);
    if (fence != null) {
      if (
        fenceMatch != null &&
        fenceMatch[1].startsWith(fence.marker) &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = null;
      }
    } else if (fenceMatch != null) {
      fence = {
        marker: fenceMatch[1][0] as '`' | '~',
        length: fenceMatch[1].length,
      };
    } else if (NESTED_OPENING_LINE.test(line.value)) {
      depth++;
    } else if (CLOSING_LINE.test(line.value)) {
      depth--;
      if (depth === 0) {
        return {
          status: 'match',
          end: line.end,
          node: {
            type: 'extension',
            plugin: 'callouts',
            name: 'callout',
            display: 'block',
            data: {status, title},
          },
          children: {start: opening.end, end: line.start},
        };
      }
    }
    if (line.end === cursor) {
      break;
    }
    cursor = line.end;
  }

  return isFinal ? {status: 'no-match'} : {status: 'defer'};
}

const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    color: colorVars['--color-text-primary'],
  },
  header: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    borderStartStartRadius: radiusVars['--radius-container'],
    borderStartEndRadius: radiusVars['--radius-container'],
  },
  info: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  success: {
    backgroundColor: colorVars['--color-success-muted'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning-muted'],
  },
  error: {
    backgroundColor: colorVars['--color-error-muted'],
  },
  content: {
    minWidth: 0,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-card'],
    borderInlineStartWidth: borderVars['--border-width'],
    borderInlineEndWidth: borderVars['--border-width'],
    borderBlockEndWidth: borderVars['--border-width'],
    borderInlineStartStyle: 'solid',
    borderInlineEndStyle: 'solid',
    borderBlockEndStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
    borderInlineEndColor: colorVars['--color-border'],
    borderBlockEndColor: colorVars['--color-border'],
    borderEndStartRadius: radiusVars['--radius-container'],
    borderEndEndRadius: radiusVars['--radius-container'],
  },
});

const definition = {
  name: 'callouts',
  apiVersion: 1,
  parseKey: 'v1',
  syntax: {
    block: [
      {
        startsWith: [':::info', ':::success', ':::warning', ':::error'],
        maxSpan: MAX_CALLOUT_SPAN,
        tokenize: tokenizeCallout,
      },
    ],
  },
  renderers: {
    callout: {
      content: 'flow',
      render: ({node, children}) => {
        const statusLabel = DEFAULT_TITLES[node.data.status];
        const accessibleTitle =
          node.data.title === statusLabel
            ? statusLabel
            : `${statusLabel}: ${node.data.title}`;
        return (
          <aside
            aria-label={accessibleTitle}
            data-markdown-callout={node.data.status}
            {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.header, styles[node.data.status])}>
              <Text as="div" type="label" weight="semibold">
                {accessibleTitle}
              </Text>
            </div>
            <div {...stylex.props(styles.content)}>{children}</div>
          </aside>
        );
      },
      toText: (node, childrenText) => {
        const statusLabel = DEFAULT_TITLES[node.data.status];
        const title =
          node.data.title === statusLabel
            ? statusLabel
            : `${statusLabel}: ${node.data.title}`;
        return `${title}\n\n${childrenText}`;
      },
    },
  },
} satisfies MarkdownSyntaxPluginDefinition<'callouts', MarkdownCalloutNode>;

/** Parses `:::status` blocks with rich Markdown children as static callouts. */
export const markdownCalloutsPlugin = createMarkdownPlugin(definition);
