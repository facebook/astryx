// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatReasoning',
  displayName: 'Chat Reasoning',
  group: 'Chat',
  category: 'Chat',
  keywords: ['reasoning', 'thinking', 'thought', 'chain-of-thought', 'chat', 'llm', 'ai'],

  usage: {
    description:
      'Compact collapsible container for displaying model reasoning or chain-of-thought details. Shows a single-line summary when collapsed and expands to reveal full reasoning text.',
  },

  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Reasoning content string or custom ReactNode.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Header label displayed in the trigger line.',
      default: "'Thinking'",
    },
    {
      name: 'duration',
      type: 'string',
      description: 'Duration string shown next to the label (e.g. "12s").',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: 'Whether reasoning content is actively streaming. Displays animated shimmer effect.',
      default: 'false',
    },
    {
      name: 'isExpanded',
      type: 'boolean',
      description: 'Controlled expanded state.',
    },
    {
      name: 'defaultIsExpanded',
      type: 'boolean',
      description: 'Default expanded state for uncontrolled usage.',
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
