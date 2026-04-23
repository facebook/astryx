/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Markdown',
  keywords: [
    'markdown',
    'rich text',
    'prose',
    'renderer',
    'streaming',
    'markup',
    'formatted text',
    'md',
    'markdown renderer',
  ],
  props: [
    {
      name: 'children',
      type: 'string',
      description: 'The markdown string to render.',
      required: true,
    },
    {
      name: 'density',
      type: "\'default\' | \'compact\'",
      description: 'Controls spacing between block-level elements.',
      default: "\'default\'",
    },
    {
      name: 'headingLevelStart',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'The HTML heading level that markdown # maps to. Shifts all heading levels down to fit the surrounding page hierarchy. Levels exceeding h6 are clamped to h6.',
      default: '1',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description:
        'Enables streaming mode — uses incremental parsing and a smooth fade-in animation for chunk-by-chunk text delivery.',
      default: 'false',
    },
    {
      name: 'onLinkClick',
      type: '(href: string, event: MouseEvent) => void | false',
      description:
        'Handler for link clicks. Return false to prevent the default navigation behavior.',
    },
    {
      name: 'sources',
      type: 'Record<string, XDSMarkdownSource>',
      description:
        'Citation sources keyed by ID. When provided, [id] and 【id】 markers in the markdown that match a key are rendered as citation chips.',
    },
    {
      name: 'citationStyle',
      type: "'label' | 'number'",
      description:
        "How citations are displayed inline. 'label' shows a chip with source title, icon, and border. 'number' shows a compact numbered badge.",
      default: "'label'",
    },
    {
      name: 'contentWidth',
      type: 'number | string',
      description:
        'Max width for prose content (paragraphs, headings, lists, blockquotes). Tables and code blocks are unconstrained and can expand to the full container width. Use for readable line lengths in wide layouts.',
      default: '680',
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        "Alignment of prose content within the container when contentWidth is narrower than the available space.",
      default: "'start'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-markdown', visualProps: ['density']},
    ],
  },
  usage: {
    description:
      'Markdown renders a markdown string as XDS-styled components with support for headings, lists, tables, code blocks, and more. Use it for displaying user-generated or AI-streamed content with consistent design-system styling.',
    bestPractices: [
      { guidance: true, description: 'Set headingLevelStart to fit the surrounding page hierarchy when embedding markdown within a section.' },
      { guidance: true, description: 'Use contentWidth to constrain prose to a readable line length in wide layouts.' },
      { guidance: false, description: 'Use Markdown for hand-authored rich text layouts — use XDSText and heading components directly instead.' },
    ],
  },
};

export const docsZh = {
  name: 'Markdown',
  props: [
    {
      name: 'children',
      type: 'string',
      description: '要渲染的 Markdown 字符串。',
      required: true,
    },
    {
      name: 'density',
      type: "'default' | 'compact'",
      description: '控制块级元素之间的间距。',
      default: "'default'",
    },
    {
      name: 'headingLevelStart',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'Markdown # 映射到的 HTML 标题级别。将所有标题级别向下偏移以适应页面层次结构。超过 h6 的级别将被限制为 h6。',
      default: '1',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description:
        '启用流式模式 — 使用增量解析和淡入动画处理分块文本。',
      default: 'false',
    },
    {
      name: 'onLinkClick',
      type: '(href: string, event: MouseEvent) => void | false',
      description: '链接点击处理器。返回 false 可阻止默认导航行为。',
    },
    {
      name: 'sources',
      type: 'Record<string, XDSMarkdownSource>',
      description:
        '按 ID 索引的引用来源。提供后，Markdown 中匹配的 [id] 和 【id】 标记将渲染为引用标签。',
    },
    {
      name: 'citationStyle',
      type: "'label' | 'number'",
      description:
        "引用的内联显示方式。'label' 显示带标题、图标和边框的标签。'number' 显示紧凑编号徽章。",
      default: "'label'",
    },
    {
      name: 'contentWidth',
      type: 'number | string',
      description:
        '正文内容的最大宽度（段落、标题、列表、引用块）。表格和代码块不受限制，可扩展到完整容器宽度。用于在宽布局中保持可读行长。',
      default: '680',
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        "当 contentWidth 小于可用空间时，正文内容在容器内的对齐方式。",
      default: "'start'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-markdown', visualProps: ['density']},
    ],
  },
  usage: {
    description:
      'Markdown renders a markdown string as XDS-styled components with support for headings, lists, tables, code blocks, and more. Use it for displaying user-generated or AI-streamed content with consistent design-system styling.',
    bestPractices: [
      { guidance: true, description: 'Set headingLevelStart to fit the surrounding page hierarchy when embedding markdown within a section.' },
      { guidance: true, description: 'Use contentWidth to constrain prose to a readable line length in wide layouts.' },
      { guidance: false, description: 'Use Markdown for hand-authored rich text layouts — use XDSText and heading components directly instead.' },
    ],
  },
};

export const docsDense = {
  n: 'Markdown',
  d: 'Renders markdown string as XDS components. Headings, bold, italic, code, lists, tables, links, blockquotes, task lists. Streaming with fade-in animation.',
  kw: ['markdown', 'rich text', 'prose', 'renderer', 'streaming', 'markup', 'md'],
  usage: {
    description:
      'Markdown renders a markdown string as XDS-styled components with support for headings, lists, tables, code blocks, and more. Use it for displaying user-generated or AI-streamed content with consistent design-system styling.',
    bestPractices: [
      { guidance: true, description: 'Set headingLevelStart to fit the surrounding page hierarchy when embedding markdown within a section.' },
      { guidance: true, description: 'Use contentWidth to constrain prose to a readable line length in wide layouts.' },
      { guidance: false, description: 'Use Markdown for hand-authored rich text layouts — use XDSText and heading components directly instead.' },
    ],
  },
  p: {
    children: 'Markdown string. Required.',
    density: "Block spacing. 'default'|'compact'. Default: 'default'.",
    headingLevelStart: 'Maps # to this heading level (1-6). Clamped to h6. Default: 1.',
    isStreaming: 'Incremental parse + fade-in for streamed chunks. Default: false.',
    onLinkClick: '(href, event) => void|false. Return false prevents navigation.',
    sources: 'Record<string, XDSMarkdownSource>. Citation sources by ID. [id]/【id】 markers render as chips.',
    citationStyle: "'label'|'number'. label=chip w/ title+icon, number=compact badge. Default: 'label'.",
    contentWidth: 'number|string. Max width for prose (headings, paragraphs, lists). Tables/code unconstrained. Default: 680.',
    contentAlign: "'start'|'center'. Prose alignment when contentWidth < container. Default: 'start'.",
  },
  ex: [
    '<XDSMarkdown>{\'# Hello\\\\n\\\\nThis is **bold** text.\'}</XDSMarkdown>',
    '<XDSMarkdown isStreaming={isStreaming}>{streamedText}</XDSMarkdown>',
  ],
};
