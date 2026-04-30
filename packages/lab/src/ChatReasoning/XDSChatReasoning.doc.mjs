/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatReasoning',
  group: 'Chat',

  keywords: ['chat', 'reasoning', 'thinking', 'collapsible', 'ai', 'chain-of-thought', 'shimmer', 'streaming', 'expand'],

  usage: {
    description:
      'ChatReasoning displays model thinking or chain-of-thought content as a compact, collapsible element. It renders a single line with a label, optional duration, and an ellipsized preview that expands on click to reveal the full reasoning.',
    bestPractices: [
      {guidance: true, description: 'Place reasoning directly above the assistant response inside a ChatMessage so the user can see the thought process that led to the answer.'},
      {guidance: true, description: 'Use the isStreaming prop while the model is still generating reasoning tokens. This shows a shimmer animation and hides the duration until thinking is complete.'},
      {guidance: true, description: 'Pass a duration string (e.g. "12s") when the reasoning is finished so the user knows how long the model spent thinking.'},
      {guidance: false, description: "Don't leave reasoning expanded by default in long conversations — collapsed is the right default so the focus stays on the response."},
      {guidance: false, description: "Don't use ChatReasoning for general collapsible content. It is designed specifically for AI thinking displays, not arbitrary expandable sections."},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A thinking indicator icon rendered at the start of the header row.'},
      {name: 'Label', required: false, description: 'The header text, defaults to "Thinking". Shows a shimmer effect during streaming.'},
      {name: 'Duration', required: false, description: 'Time string shown after the label when reasoning is complete.'},
      {name: 'Preview', required: false, description: 'Ellipsized snippet of the reasoning content, visible only when collapsed.'},
      {name: 'Content', required: true, description: 'The full reasoning text or rich content revealed when expanded.'},
    ],
  },

  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Reasoning content. Plain text renders as-is; pass XDSMarkdown for rich formatting.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Header label text.',
      default: "'Thinking'",
    },
    {
      name: 'duration',
      type: 'string',
      description: 'Duration string shown after the label when reasoning is complete (e.g. "12s").',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: 'Shows a shimmer animation on the label and hides the duration and preview while the model is actively thinking.',
      default: 'false',
    },
    {
      name: 'isExpanded',
      type: 'boolean',
      description: 'Controlled expanded state. Use with onExpandedChange for full control.',
    },
    {
      name: 'defaultIsExpanded',
      type: 'boolean',
      description: 'Initial expanded state for uncontrolled usage.',
      default: 'false',
    },
    {
      name: 'onExpandedChange',
      type: '(isExpanded: boolean) => void',
      description: 'Called when the expanded state changes via user interaction.',
    },
  ],
};
