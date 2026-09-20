// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatActivityGroup',
  displayName: 'Chat Activity Group',
  group: 'Chat',
  category: 'Chat',
  keywords: [
    'activity',
    'agent',
    'chat',
    'collapse',
    'llm',
    'reasoning',
    'steps',
    'thinking',
    'tool',
    'tool call',
  ],

  usage: {
    description:
      'ChatActivityGroup folds a mixed, ordered sequence of reasoning blocks and tool calls into one scannable collapsed row. Expanding reveals each item with its own disclosure. Use it when an agentic turn interleaves thinking and tools and ChatToolCalls (homogeneous tools) or ChatReasoning (one block) cannot fold the stream.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass items in the order the model produced them so the collapsed surface always shows the latest activity.',
      },
      {
        guidance: true,
        description:
          'Set status on every tool item and isStreaming on in-flight reasoning so the folded row can announce running or failed work.',
      },
      {
        guidance: true,
        description:
          'Put resultDetail on tool items that have output, so expanded rows keep per-item disclosure the same way ChatToolCalls does.',
      },
      {
        guidance: false,
        description:
          "Don't use ChatActivityGroup for a homogeneous tool list — ChatToolCalls already folds that shape.",
      },
      {
        guidance: false,
        description:
          "Don't wrap items in extra Collapsible chrome; the group owns the collapsed summary and the single tab stop.",
      },
    ],
    anatomy: [
      {
        name: 'Collapsed surface',
        required: true,
        description:
          'One disclosure row showing the latest activity, its status, and the item count.',
      },
      {
        name: 'Status icon',
        required: true,
        description:
          'Spinner while the latest item is pending, running, or streaming; success or error icon otherwise. A visually hidden status label keeps running and failed work perceivable when folded.',
      },
      {
        name: 'Expanded list',
        required: false,
        description:
          'Each reasoning item renders as ChatReasoning and each tool item as a single ChatToolCalls row, preserving per-item disclosure. Rows mount on first expand and stay mounted.',
      },
    ],
  },

  props: [
    {
      name: 'items',
      type: 'ChatActivityItem[]',
      description:
        "Ordered mixed activity. Tool items are `{kind: 'tool'}` plus ChatToolCallItem fields. Reasoning items are `{kind: 'reasoning', content, label?, duration?, isStreaming?, key?}`.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Custom summary label for the expanded group header. Auto-generated from count if omitted.',
    },
    {
      name: 'isExpanded',
      type: 'boolean',
      description: 'Controlled expanded state for the group.',
    },
    {
      name: 'defaultIsExpanded',
      type: 'boolean',
      description: 'Default expanded state when uncontrolled.',
      default: 'false',
    },
    {
      name: 'onExpandedChange',
      type: '(isExpanded: boolean) => void',
      description: 'Callback fired when the expanded state changes.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
  ],
};
