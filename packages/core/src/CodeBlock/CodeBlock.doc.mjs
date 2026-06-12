// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'CodeBlock',
  displayName: 'Code Block',
  category: 'Content',
  keywords: [
    'code', 'syntax', 'highlight', 'snippet', 'prism', 'shiki',
    'pre', 'monospace', 'codeblock', 'inline',
  ],
  description: 'Fenced code block with syntax highlighting. Use for multi-line code snippets.',
  props: [
    {
      name: 'code',
      type: 'string',
      description: 'The code string to display.',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Language for syntax highlighting. Use "plaintext" to disable.',
      default: "'plaintext'",
    },
    {
      name: 'title',
      type: 'string',
      description: 'Filename or label shown in the header bar.',
    },
    {
      name: 'hasLanguageLabel',
      type: 'boolean',
      description: 'Show the language name in the header bar. Hidden when language is "plaintext".',
      default: 'true',
    },
    {
      name: 'hasLineNumbers',
      type: 'boolean',
      description: 'Show a line number gutter.',
      default: 'false',
    },
    {
      name: 'highlightLines',
      type: 'number[]',
      description: '1-indexed line numbers to highlight.',
    },
    {
      name: 'hasCopyButton',
      type: 'boolean',
      description: 'Show a copy-to-clipboard button.',
      default: 'true',
    },
    {
      name: 'onCopy',
      type: '() => void',
      description: 'Callback after the code is copied.',
    },
    {
      name: 'isWrapped',
      type: 'boolean',
      description: 'Wrap long lines instead of enabling horizontal scroll.',
      default: 'false',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: 'Max height before the block scrolls vertically.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Text size variant.',
      default: "'md'",
    },
    {
      name: 'width',
      type: 'string',
      description: "Width of the code block. Any CSS width value. 'fit-content' (default) shrinks to longest line. '100%' fills parent width.",
      default: "'fit-content'",
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description: "Container presentation style. 'card' (default): border and radius with the muted syntax background for a standalone card look. 'section': no border or radius and a transparent background so the block blends into the card or panel it's embedded in.",
      default: "'card'",
    },
    {
      name: 'tokenizer',
      type: '(code: string, language: string) => Array<{type: string; start: number; end: number}>',
      description: 'Custom tokenizer override for unsupported languages.',
    },
    {
      name: 'isCollapsible',
      type: 'boolean',
      description: 'Allow collapsing the code body into just the header bar. Starts expanded; the header becomes clickable to toggle. Only shows the toggle when the code exceeds collapsibleThreshold lines.',
      default: 'false',
    },
    {
      name: 'collapsibleThreshold',
      type: 'number',
      description: 'Minimum number of lines before the collapse toggle appears. Below this threshold the code block renders normally even when isCollapsible is true.',
      default: '10',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name for the root element. Prefer xstyle for styling.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline styles. Prefer xstyle for StyleX-optimized styling.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  components: [
    {name: 'XDSCode'},
  ],
  playground: {
    defaults: {
      code: "import {XDSButton} from '@xds/core/Button';\n\nexport function App() {\n  return <XDSButton label=\"Hello\" variant=\"primary\" />;\n}",
      language: 'tsx',
      hasCopyButton: true,
    },
  },
  theming: {
    targets: [
      {className: 'xds-code'},
      {className: 'xds-codeblock', visualProps: ['size', 'language']},
    ],
  },
  usage: {
    description: 'CodeBlock renders syntax-highlighted code with line numbers, a copy button, and optional collapsible sections. Use XDSCodeBlock for multi-line snippets like source files, terminal commands, and configuration examples. Use XDSCode for inline references to function names, variables, or CLI flags within body text.',
    bestPractices: [
      {guidance: true, description: 'Set the language prop to match the code content so syntax highlighting is accurate. Use "plaintext" when the language is unknown.'},
      {guidance: true, description: 'Add a title when the code represents a file. It gives readers context and appears in the header bar alongside the copy button.'},
      {guidance: true, description: 'Use XDSCode for short inline references like function names or CLI flags, and XDSCodeBlock for standalone multi-line snippets.'},
      {guidance: false, description: 'Enable line numbers on short snippets (under 5 lines) where they add clutter without helping navigation.'},
      {guidance: false, description: 'Nest a code block inside a scrollable container. Use the maxHeight prop instead, which handles overflow natively.'},
    ],
    anatomy: [
      {name: 'Header Bar', required: false, description: 'Shows the title, language label, and copy button. Appears when any of these props are set.'},
      {name: 'Line Numbers', required: false, description: 'Numbered gutter along the left edge. Enable with hasLineNumbers.'},
      {name: 'Code Body', required: true, description: 'The syntax-highlighted code content.'},
      {name: 'Highlighted Lines', required: false, description: 'Background accent on specific lines to draw attention.'},
      {name: 'Copy Button', required: false, description: 'Copies the code string to the clipboard. Shown by default.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'CodeBlock displays syntax-highlighted code snippets with optional line numbers, copy button, and collapsible sections. Use XDSCodeBlock for fenced multi-line code and XDSCode for inline code within prose.',
    bestPractices: [
      { guidance: true, description: 'Set the language prop to enable syntax highlighting. Use "plaintext" when the language is unknown or not supported.' },
      { guidance: true, description: 'Use XDSCode for short inline code references within body text, and XDSCodeBlock for standalone multi-line snippets.' },
      { guidance: false, description: 'Enable line numbers for short snippets where they add visual noise without aiding comprehension.' },
      { guidance: false, description: 'Wrap code blocks in a scrollable container when isWrapped or maxHeight already handles overflow.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'syntax-highlighted code block via CSS Custom Highlight API (0-DOM overhead); span-based fallback; XDSCode for inline code in prose',
  usage: {
    description: 'CodeBlock renders syntax-highlighted code with line numbers, a copy button, and optional collapsible sections. Use XDSCodeBlock for multi-line snippets like source files, terminal commands, and configuration examples. Use XDSCode for inline references to function names, variables, or CLI flags within body text.',
    bestPractices: [
      {guidance: true, description: 'Set the language prop to match the code content so syntax highlighting is accurate. Use "plaintext" when the language is unknown.'},
      {guidance: true, description: 'Add a title when the code represents a file. It gives readers context and appears in the header bar alongside the copy button.'},
      {guidance: true, description: 'Use XDSCode for short inline references like function names or CLI flags, and XDSCodeBlock for standalone multi-line snippets.'},
      {guidance: false, description: 'Enable line numbers on short snippets (under 5 lines) where they add clutter without helping navigation.'},
      {guidance: false, description: 'Nest a code block inside a scrollable container. Use the maxHeight prop instead, which handles overflow natively.'},
    ],
  },
};
