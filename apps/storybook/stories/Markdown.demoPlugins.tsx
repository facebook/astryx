// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.demoPlugins.tsx
 * @input Bounded mention and callout syntax definitions
 * @output Reusable Storybook-only Markdown demo plugins
 * @position Documentation fixtures for the core Markdown plugin protocol
 */

import {
  createMarkdownPlugin,
  createMarkdownTextTransform,
  type MarkdownExtensionNode,
  type MarkdownSyntaxPluginDefinition,
} from '@astryxdesign/core/Markdown/plugins';

type MentionNode = MarkdownExtensionNode<
  'demo-mentions',
  'mention',
  {readonly label: string},
  'inline'
>;

type TodoNode = MarkdownExtensionNode<
  'demo-todos',
  'todo',
  {readonly label: string},
  'inline'
>;

type CalloutNode = MarkdownExtensionNode<
  'demo-callouts',
  'callout',
  {readonly body: string},
  'block'
>;

const mentionDefinition = {
  name: 'demo-mentions',
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
              plugin: 'demo-mentions',
              name: 'mention',
              display: 'inline',
              data: {label: source.slice(offset + 2, close)},
            },
          };
        },
      },
    ],
  },
  renderers: {
    mention: {
      render: ({node}) => <mark>@{node.data.label}</mark>,
      toText: node => `@${node.data.label}`,
    },
  },
} satisfies MarkdownSyntaxPluginDefinition<'demo-mentions', MentionNode>;

const calloutDefinition = {
  name: 'demo-callouts',
  apiVersion: 1,
  parseKey: 'v1',
  syntax: {
    block: [
      {
        startsWith: [':::note'],
        maxSpan: 500,
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
              plugin: 'demo-callouts',
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
    callout: {
      render: ({node}) => <aside aria-label="Note">{node.data.body}</aside>,
      toText: node => node.data.body,
    },
  },
} satisfies MarkdownSyntaxPluginDefinition<'demo-callouts', CalloutNode>;

const todoPlugin = createMarkdownPlugin<'demo-todos', TodoNode>({
  name: 'demo-todos',
  apiVersion: 1,
  transform: createMarkdownTextTransform<TodoNode>({
    pattern: /\bTODO\b/g,
    requiredSubstrings: ['TODO'],
    replace: () => ({
      type: 'extension',
      plugin: 'demo-todos',
      name: 'todo',
      display: 'inline',
      data: {label: 'TODO'},
    }),
  }),
  renderers: {
    todo: {
      render: ({node}) => <mark>{node.data.label}</mark>,
      toText: node => node.data.label,
    },
  },
});

export const markdownDemoPlugins = [
  createMarkdownPlugin<'demo-mentions', MentionNode>(mentionDefinition),
  createMarkdownPlugin<'demo-callouts', CalloutNode>(calloutDefinition),
  todoPlugin,
] as const;

interface DelayedValue<Value> {
  read(): Value;
}

function createDelayedValue<Value>(
  value: Value,
  delayMs: number,
): DelayedValue<Value> {
  let resolved = false;
  const promise = new Promise<void>(resolve => {
    setTimeout(() => {
      resolved = true;
      resolve();
    }, delayMs);
  });
  return {
    read() {
      if (!resolved) {
        throw promise;
      }
      return value;
    },
  };
}

function DelayedMention({label}: {readonly label: DelayedValue<string>}) {
  return <mark>@{label.read()}</mark>;
}

/** Creates a fresh demo plugin whose renderer suspends without blocking siblings. */
export function createDelayedMarkdownDemoPlugin(delayMs = 3_000) {
  const labels = new Map<string, DelayedValue<string>>();
  return createMarkdownPlugin<'demo-mentions', MentionNode>({
    ...mentionDefinition,
    renderers: {
      mention: {
        render: ({node}) => {
          let label = labels.get(node.data.label);
          if (label == null) {
            label = createDelayedValue(node.data.label, delayMs);
            labels.set(node.data.label, label);
          }
          return <DelayedMention label={label} />;
        },
        toText: node => `@${node.data.label}`,
      },
    },
  });
}
