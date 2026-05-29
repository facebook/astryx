// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'CodeBlock',
  displayName: 'Code Block',
  category: 'Communications',
  keywords: [
    'code', 'syntax', 'highlight', 'snippet', 'prism', 'shiki',
    'pre', 'monospace', 'codeblock', 'inline',
  ],
  components: [
    {
      name: 'XDSCodeBlock',
      displayName: 'Code Block',
      description: 'Fenced code block with syntax highlighting. Use for multi-line code snippets.',
      props: [
        {name: 'code', type: 'string', description: 'The code string to display.', required: true},
        {name: 'language', type: 'string', description: 'Language for syntax highlighting. Use "plaintext" to disable.', default: "'plaintext'"},
        {name: 'title', type: 'string', description: 'Filename or label shown in the header bar.'},
        {name: 'hasLanguageLabel', type: 'boolean', description: 'Show the language name in the header bar. Hidden when language is "plaintext".', default: 'true'},
        {name: 'hasLineNumbers', type: 'boolean', description: 'Show a line number gutter.', default: 'false'},
        {name: 'highlightLines', type: 'number[]', description: '1-indexed line numbers to highlight.'},
        {name: 'hasCopyButton', type: 'boolean', description: 'Show a copy-to-clipboard button.', default: 'true'},
        {name: 'onCopy', type: '() => void', description: 'Callback after the code is copied.'},
        {name: 'isWrapped', type: 'boolean', description: 'Wrap long lines instead of enabling horizontal scroll.', default: 'false'},
        {name: 'maxHeight', type: 'number | string', description: 'Max height before the block scrolls vertically.'},
        {name: 'size', type: "'sm' | 'md'", description: 'Text size variant.', default: "'md'"},
        {name: 'width', type: "string", description: "Width of the code block. Any CSS width value. 'fit-content' (default) shrinks to longest line. '100%' fills parent width.", default: "'fit-content'"},
        {name: 'container', type: "'card' | 'section'", description: "Container presentation style. 'card' (default): border and radius for standalone card look. 'section': no border or radius — for embedding inside cards or panels.", default: "'card'"},
        {name: 'tokenizer', type: '(code: string, language: string) => Array<{type: string; start: number; end: number}>', description: 'Custom tokenizer override for unsupported languages.'},
        {name: 'isCollapsible', type: 'boolean', description: 'Allow collapsing the code body into just the header bar. Starts expanded; the header becomes clickable to toggle. Only shows the toggle when the code exceeds collapsibleThreshold lines.', default: 'false'},
        {name: 'collapsibleThreshold', type: 'number', description: 'Minimum number of lines before the collapse toggle appears. Below this threshold the code block renders normally even when isCollapsible is true.', default: '10'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'className', type: 'string', description: 'CSS class name for the root element. Prefer xstyle for styling.'},
        {name: 'style', type: 'CSSProperties', description: 'Inline styles. Prefer xstyle for StyleX-optimized styling.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
    },
    {
      name: 'XDSCode',
      displayName: 'Code',
      description: 'Inline code element. Renders a styled <code> with monospace font and muted background. For fenced blocks, use XDSCodeBlock.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Code content.', required: true},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'className', type: 'string', description: 'CSS class name for the root element. Prefer xstyle for styling.'},
        {name: 'style', type: 'CSSProperties', description: 'Inline styles. Prefer xstyle for StyleX-optimized styling.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
    },
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
      {guidance: true, description: 'Add a title when the code represents a file — it gives readers context and appears in the header bar alongside the copy button.'},
      {guidance: true, description: 'Use XDSCode for short inline references like function names or CLI flags, and XDSCodeBlock for standalone multi-line snippets.'},
      {guidance: false, description: 'Enable line numbers on short snippets (under 5 lines) where they add clutter without helping navigation.'},
      {guidance: false, description: 'Nest a code block inside a scrollable container — use the maxHeight prop instead, which handles overflow natively.'},
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
      { guidance: true, description: 'Set the language prop to enable syntax highlighting — use "plaintext" when the language is unknown or not supported.' },
      { guidance: true, description: 'Use XDSCode for short inline code references within body text, and XDSCodeBlock for standalone multi-line snippets.' },
      { guidance: false, description: 'Enable line numbers for short snippets where they add visual noise without aiding comprehension.' },
      { guidance: false, description: 'Wrap code blocks in a scrollable container when isWrapped or maxHeight already handles overflow.' },
    ],
  },
  components: [
    {
      name: 'XDSCodeBlock',
      displayName: 'Code Block',
      description: '带语法高亮的围栏代码块。用于多行代码片段。',
      propDescriptions: {
        code: '要显示的代码字符串。',
        language: '语法高亮语言。使用 "plaintext" 禁用高亮。',
        title: '在标题栏中显示的文件名或标签。',
        hasLanguageLabel: '在标题栏中显示语言名称。language 为 "plaintext" 时隐藏。',
        hasLineNumbers: '显示行号栏。',
        highlightLines: '需要高亮的 1-indexed 行号。',
        hasCopyButton: '显示复制到剪贴板按钮。',
        onCopy: '代码复制后的回调函数。',
        isWrapped: '换行显示长行，而非启用水平滚动。',
        maxHeight: '代码块垂直滚动前的最大高度。',
        size: '文字大小变体。',
        width: "代码块宽度。接受任何CSS宽度值。'fit-content'（默认）适应最长行宽度；'100%' 填满父容器宽度。",
        container: "容器展示样式。'card'（默认）=带边框和圆角；'section'=无边框和圆角——适用于嵌入卡片或面板。",
        tokenizer: '用于不支持语言的自定义分词器。',
        isCollapsible: '允许将代码折叠为仅标题栏。当代码超过 collapsibleThreshold 行时显示切换按钮。',
        collapsibleThreshold: '折叠切换出现前的最小行数。低于此阈值时即使 isCollapsible 为 true 也正常渲染。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
        className: '根元素的 CSS 类名。优先使用 xstyle。',
        style: '内联样式。优先使用 xstyle。',
        'data-testid': '自动化测试框架的测试选择器。',
      },
    },
    {
      name: 'XDSCode',
      displayName: 'Code',
      description: '内联代码元素。渲染带等宽字体和低调背景的 <code>。如需围栏代码块，请使用 XDSCodeBlock。',
      propDescriptions: {
        children: '代码内容。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
        className: '根元素的 CSS 类名。优先使用 xstyle。',
        style: '内联样式。优先使用 xstyle。',
        'data-testid': '自动化测试框架的测试选择器。',
      },
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'syntax-highlighted code block via CSS Custom Highlight API (0-DOM overhead); span-based fallback; XDSCode for inline code in prose',
  usage: {
    description: 'CodeBlock renders syntax-highlighted code with line numbers, a copy button, and optional collapsible sections. Use XDSCodeBlock for multi-line snippets like source files, terminal commands, and configuration examples. Use XDSCode for inline references to function names, variables, or CLI flags within body text.',
    bestPractices: [
      {guidance: true, description: 'Set the language prop to match the code content so syntax highlighting is accurate. Use "plaintext" when the language is unknown.'},
      {guidance: true, description: 'Add a title when the code represents a file — it gives readers context and appears in the header bar alongside the copy button.'},
      {guidance: true, description: 'Use XDSCode for short inline references like function names or CLI flags, and XDSCodeBlock for standalone multi-line snippets.'},
      {guidance: false, description: 'Enable line numbers on short snippets (under 5 lines) where they add clutter without helping navigation.'},
      {guidance: false, description: 'Nest a code block inside a scrollable container — use the maxHeight prop instead, which handles overflow natively.'},
    ],
  },
  components: [
    {
      name: 'XDSCodeBlock',
      displayName: 'Code Block',
      description: 'fenced code block w/ syntax highlighting; for multi-line snippets',
      propDescriptions: {
        code: 'code string to display',
        language: 'highlight language; "plaintext" disables',
        title: 'filename/label in header bar',
        hasLanguageLabel: 'show language name in header; hidden for "plaintext"',
        hasLineNumbers: 'show line number gutter',
        highlightLines: '1-indexed lines to highlight',
        hasCopyButton: 'show copy button',
        onCopy: 'callback after copy',
        isWrapped: 'wrap long lines vs h-scroll',
        maxHeight: 'max height before vertical scroll',
        size: 'text size variant',
        width: "any CSS width value; fit-content (default) or 100% to fill parent",
        container: "card=border+radius (default); section=no border/radius (embed in cards)",
        tokenizer: 'custom tokenizer for unsupported languages',
        isCollapsible: 'Collapse code to header bar. Toggle appears when lines > collapsibleThreshold. Default: false.',
        collapsibleThreshold: 'Min lines before collapse toggle shows. Default: 10.',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
        className: 'CSS class for root; prefer xstyle',
        style: 'inline styles; prefer xstyle',
        'data-testid': 'test selector',
      },
    },
    {
      name: 'XDSCode',
      displayName: 'Code',
      description: 'inline code element; styled <code> w/ monospace+muted bg; for prose',
      propDescriptions: {
        children: 'code content',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
        className: 'CSS class for root; prefer xstyle',
        style: 'inline styles; prefer xstyle',
        'data-testid': 'test selector',
      },
    },
  ],
};
