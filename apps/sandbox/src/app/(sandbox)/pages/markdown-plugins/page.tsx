// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Markdown, createMarkdownPlugin} from '@astryxdesign/core/Markdown';
import type {
  MarkdownExtensionNode,
  MarkdownSyntaxPluginDefinition,
} from '@astryxdesign/core/Markdown';
import {Heading, Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';
import * as stylex from '@stylexjs/stylex';

type MentionNode = MarkdownExtensionNode<
  'sandbox-mentions',
  'mention',
  {readonly label: string},
  'inline'
>;

type CalloutNode = MarkdownExtensionNode<
  'sandbox-callouts',
  'callout',
  {readonly body: string},
  'block'
>;

const styles = stylex.create({
  page: {
    boxSizing: 'border-box',
    maxWidth: 960,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    width: '100%',
  },
  panel: {
    backgroundColor: 'var(--color-background-card)',
    borderColor: 'var(--color-border-emphasized)',
    borderRadius: 'var(--radius-container)',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 'var(--spacing-6)',
  },
  mention: {
    backgroundColor: 'var(--color-background-blue)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
    paddingInline: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
  },
  issue: {
    backgroundColor: 'var(--color-background-yellow)',
    borderRadius: 'var(--radius-inner)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-code)',
    paddingInline: 'var(--spacing-1)',
  },
  callout: {
    backgroundColor: 'var(--color-background-purple)',
    borderInlineStartColor: 'var(--color-border-purple)',
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: 4,
    borderRadius: 'var(--radius-element)',
    color: 'var(--color-text-primary)',
    padding: 'var(--spacing-4)',
  },
  terminal: {
    backgroundColor: 'var(--color-background-inverted)',
    borderRadius: 'var(--radius-element)',
    color: 'light-dark(#FFFFFF, #0A1317)',
    margin: 0,
    overflowX: 'auto',
    padding: 'var(--spacing-4)',
  },
  terminalCaption: {
    color: 'inherit',
    fontSize: 12,
    marginBlockEnd: 'var(--spacing-2)',
    textTransform: 'uppercase',
  },
});

const mentionDefinition = {
  name: 'sandbox-mentions',
  apiVersion: 1,
  parseKey: 'v1',
  syntax: {
    inline: [
      {
        startsWith: ['@{'],
        maxSpan: 80,
        tokenize({source, offset, end, isFinal}) {
          const close = source.indexOf('}', offset + 2);
          if (close < 0 || close >= end) {
            return isFinal ? {status: 'no-match'} : {status: 'defer'};
          }
          return {
            status: 'match',
            end: close + 1,
            node: {
              type: 'extension',
              plugin: 'sandbox-mentions',
              name: 'mention',
              display: 'inline',
              data: {label: source.slice(offset + 2, close)},
            },
          };
        },
      },
    ],
    toText: node => node.data.label,
  },
  renderers: {
    mention: ({node}) => (
      <span {...stylex.props(styles.mention)}>@{node.data.label}</span>
    ),
  },
} satisfies MarkdownSyntaxPluginDefinition<'sandbox-mentions', MentionNode>;

const mentionPlugin = createMarkdownPlugin<'sandbox-mentions', MentionNode>(
  mentionDefinition,
);

const calloutDefinition = {
  name: 'sandbox-callouts',
  apiVersion: 1,
  parseKey: 'v1',
  syntax: {
    block: [
      {
        startsWith: [':::note'],
        maxSpan: 400,
        tokenize({source, offset, end, isFinal}) {
          const close = source.indexOf('\n:::', offset + 7);
          if (close < 0 || close + 4 > end) {
            return isFinal ? {status: 'no-match'} : {status: 'defer'};
          }
          return {
            status: 'match',
            end: close + 4,
            node: {
              type: 'extension',
              plugin: 'sandbox-callouts',
              name: 'callout',
              display: 'block',
              data: {body: source.slice(offset + 7, close).trim()},
            },
          };
        },
      },
    ],
  },
  renderers: {
    callout: ({node}) => (
      <aside aria-label="Note" {...stylex.props(styles.callout)}>
        {node.data.body}
      </aside>
    ),
  },
} satisfies MarkdownSyntaxPluginDefinition<'sandbox-callouts', CalloutNode>;

const calloutPlugin = createMarkdownPlugin<'sandbox-callouts', CalloutNode>(
  calloutDefinition,
);

const issuePlugin = createMarkdownPlugin({
  name: 'sandbox-issues',
  apiVersion: 1,
  text: [
    {
      pattern: /AST-\d+/g,
      render: match => <mark {...stylex.props(styles.issue)}>{match[0]}</mark>,
    },
  ],
});

const terminalPlugin = createMarkdownPlugin({
  name: 'sandbox-terminal',
  apiVersion: 1,
  fences: [
    {
      languages: ['terminal', 'console'],
      mode: 'passive',
      render: ({source, language, meta}) => ({
        status: 'enhance',
        content: (
          <figure>
            <figcaption {...stylex.props(styles.terminalCaption)}>
              {language}
              {meta == null ? '' : ` · ${meta}`}
            </figcaption>
            <pre {...stylex.props(styles.terminal)}>{source}</pre>
          </figure>
        ),
      }),
    },
  ],
});

const source = `# Plugin-enabled release notes

Hello @{Ada}. AST-36 now supports one ordered plugin list while ordinary **Markdown stays Markdown**.

:::note
Syntax plugins own typed data; Core still owns headings, links, lists, and tables.
:::

## Semantic fences

\`\`\`terminal successful run
pnpm test --filter Markdown
✓ 426 tests passed
\`\`\`

## Protected contexts

Modern text plugins skip links and code: [AST-99](/specs) and \`AST-100\` stay untouched.`;

const decoratedSentence =
  'Hello @{Ada}. AST-36 now supports one ordered plugin list while ordinary **Markdown stays Markdown**.';
const decoratedStart = source.indexOf(decoratedSentence);

const reviewPlugin = createMarkdownPlugin({
  name: 'sandbox-review',
  apiVersion: 1,
  decorations: [
    {
      id: 'review-highlight',
      range: {
        start: decoratedStart,
        end: decoratedStart + decoratedSentence.length,
      },
      appearance: 'highlight',
      tone: 'info',
      label: 'Reviewed plugin paragraph',
    },
  ],
});

const plugins = [
  mentionPlugin,
  calloutPlugin,
  issuePlugin,
  terminalPlugin,
  reviewPlugin,
] as const;

export default function MarkdownPluginsPage() {
  return (
    <main {...stylex.props(styles.page)}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1}>Markdown plugins</Heading>
          <Text type="body" color="secondary">
            One document exercising inline and block syntax, prose replacement,
            semantic fences, and source-range decoration.
          </Text>
        </VStack>
        <section
          aria-label="Plugin Markdown preview"
          {...stylex.props(styles.panel)}>
          <Markdown plugins={plugins}>{source}</Markdown>
        </section>
      </VStack>
    </main>
  );
}
