/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'CodeBlock',
  description:
    'Syntax-highlighted code block using the CSS Custom Highlight API for zero-DOM-overhead coloring, with span-based fallback. XDSCode renders inline code within prose.',
  keywords: [
    'code', 'syntax', 'highlight', 'snippet', 'prism', 'shiki',
    'pre', 'monospace', 'codeblock', 'inline',
  ],
  features: [
    "CSS Custom Highlight API: zero-DOM-overhead syntax coloring; spans fallback for unsupported browsers",
    "Line numbers: optional gutter via hasLineNumbers",
    "Line highlighting: 1-indexed lines via highlightLines",
    "Copy button: built-in with onCopy callback",
    "Header: optional title + language label",
    "Sizes: sm and md",
    "Wrapping: isWrapped toggles long-line wrapping vs horizontal scroll",
    "Languages: TypeScript, JavaScript, CSS, HTML, JSON, plaintext (default)",
    "XDSCode: inline code element with monospace styling for use inside prose",
  ],
  components: [
    {
      name: 'XDSCodeBlock',
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
        {name: 'tokenizer', type: '(code: string, language: string) => Array<{type: string; start: number; end: number}>', description: 'Custom tokenizer override for unsupported languages.'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'className', type: 'string', description: 'CSS class name for the root element. Prefer xstyle for styling.'},
        {name: 'style', type: 'CSSProperties', description: 'Inline styles. Prefer xstyle for StyleX-optimized styling.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
      examples: [
        {label: 'Basic usage', code: '<XDSCodeBlock\n  code={`const x = 42;`}\n  language="typescript"\n  hasLineNumbers\n/>'},
        {label: 'With title and line highlighting', code: '<XDSCodeBlock\n  code={snippetCode}\n  language="typescript"\n  title="utils.ts"\n  highlightLines={[3, 4, 5]}\n/>'},
      ],
    },
    {
      name: 'XDSCode',
      description: 'Inline code element. Renders a styled <code> with monospace font and muted background. For fenced blocks, use XDSCodeBlock.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Code content.', required: true},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'className', type: 'string', description: 'CSS class name for the root element. Prefer xstyle for styling.'},
        {name: 'style', type: 'CSSProperties', description: 'Inline styles. Prefer xstyle for StyleX-optimized styling.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
      examples: [
        {label: 'Inline in prose', code: '<XDSText type="body">\n  Pass <XDSCode>xstyle</XDSCode> a <XDSCode>stylex.create()</XDSCode> value.\n</XDSText>'},
      ],
    },
  ],
  examples: [
    {label: 'TypeScript with line numbers', code: '<XDSCodeBlock\n  code={`function greet(name: string) { return name; }`}\n  language="typescript"\n  hasLineNumbers\n  title="greet.ts"\n/>'},
    {label: 'Inline code in text', code: '<XDSText type="body">\n  Use <XDSCode>const</XDSCode> for block-scoped declarations.\n</XDSText>'},
  ],
  theming: {
    targets: [
      {className: 'xds-code'},
      {className: 'xds-codeblock', visualProps: ['size', 'language']},
    ],
  },
  accessibility: [
    'XDSCodeBlock renders as <pre> with nested <code> for correct semantic markup.',
    'Copy button has an accessible label and uses aria-live to announce copy success.',
    'Line numbers are aria-hidden to avoid screen reader noise.',
    'Title and language label are visible text in the header, not tooltips.',
  ],
  notes: [
    'Uses CSS Custom Highlight API (CSS.highlights) when available; falls back to span-based rendering automatically.',
    'Tokenization is async -- initial render shows unstyled code, highlights applied on next paint.',
    'SYNC_TOKENIZE_THRESHOLD: short code strings tokenized synchronously to avoid async flash.',
    'Custom tokenizers support unsupported languages -- pass {type, start, end}[] token array.',
    'Token types map to xds-token-{type} CSS classes for custom syntax theme overrides.',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description: '使用 CSS Custom Highlight API 实现零 DOM 开销语法高亮的代码块，不支持时回退到基于 span 的渲染。XDSCode 用于在正文中渲染内联代码。',
  features: [
    'CSS Custom Highlight API：零 DOM 开销语法高亮；不支持浏览器时回退到 span',
    '行号：通过 hasLineNumbers 显示可选的行号栏',
    '行高亮：通过 highlightLines 指定 1-indexed 的高亮行',
    '复制按钮：内置，支持 onCopy 回调',
    '标题栏：可选的标题和语言标签',
    '尺寸：sm 和 md 两种',
    '换行：isWrapped 切换长行换行与水平滚动',
    '语言：TypeScript、JavaScript、CSS、HTML、JSON、plaintext（默认）',
    'XDSCode：用于正文中内联代码的等宽字体样式元素',
  ],
  accessibility: [
    'XDSCodeBlock 渲染为带嵌套 <code> 的 <pre>，具有正确的语义标记。',
    '复制按钮有无障碍标签，并使用 aria-live 播报复制成功。',
    '行号设置 aria-hidden 以避免屏幕阅读器噪音。',
    '标题和语言标签是标题栏中的可见文本，而非工具提示。',
  ],
  notes: [
    '可用时使用 CSS Custom Highlight API（CSS.highlights），自动回退到基于 span 的渲染。',
    '分词是异步的——初始渲染显示未高亮代码，下一帧应用高亮。',
    'SYNC_TOKENIZE_THRESHOLD：短代码字符串同步分词以避免异步闪烁。',
    '自定义分词器支持内置不支持的语言——传入 {type, start, end}[] token 数组。',
    'Token 类型映射到 xds-token-{type} CSS 类，支持自定义语法主题覆盖。',
  ],
  components: [
    {
      name: 'XDSCodeBlock',
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
        tokenizer: '用于不支持语言的自定义分词器。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
        className: '根元素的 CSS 类名。优先使用 xstyle。',
        style: '内联样式。优先使用 xstyle。',
        'data-testid': '自动化测试框架的测试选择器。',
      },
    },
    {
      name: 'XDSCode',
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
  features: [
    'CSS Custom Highlight API: 0-DOM-overhead syntax coloring; span fallback',
    'line numbers: optional gutter via hasLineNumbers',
    'line highlighting: 1-indexed via highlightLines',
    'copy button: built-in w/ onCopy callback',
    'header: optional title + language label',
    'sizes: sm/md',
    'wrapping: isWrapped toggles wrap vs h-scroll',
    'languages: TS/JS/CSS/HTML/JSON/plaintext',
    'XDSCode: inline code element w/ monospace styling for prose',
  ],
  accessibility: [
    '<pre>+<code> for correct semantic markup',
    'copy button: a11y label + aria-live announces copy success',
    'line numbers: aria-hidden',
    'title/language: visible text in header',
  ],
  notes: [
    'CSS.highlights API when available; auto-fallback to span rendering',
    'tokenization async -- highlights applied on next paint',
    'SYNC_TOKENIZE_THRESHOLD: short code tokenized sync to avoid flash',
    'custom tokenizer: pass {type,start,end}[] for unsupported languages',
    'xds-token-{type} CSS classes for custom syntax theme overrides',
  ],
  components: [
    {
      name: 'XDSCodeBlock',
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
        tokenizer: 'custom tokenizer for unsupported languages',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
        className: 'CSS class for root; prefer xstyle',
        style: 'inline styles; prefer xstyle',
        'data-testid': 'test selector',
      },
    },
    {
      name: 'XDSCode',
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
