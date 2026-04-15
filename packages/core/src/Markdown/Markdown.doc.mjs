/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Markdown',
  description:
    'Renders a markdown string as XDS components. Supports headings, paragraphs, bold, italic, code, lists, tables, links, images, blockquotes, horizontal rules, and task lists. Handles streaming text with a smooth fade-in animation.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSMarkdown content="# Hello" />',
  },
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
  features: [
    'Zero dependencies — built-in markdown parser, no external library',
    'Streaming mode — smooth fade-in animation for chunk-by-chunk text delivery',
    'XDS integration — uses XDSList, XDSCodeBlock, XDSCode, and XDSCheckboxList for semantic output',
    'Heading level shift — headingLevelStart maps # to any h1-h6 level for page hierarchy',
    'Link interception — onLinkClick handler can intercept or prevent link navigation',
    "Density — default and compact spacing modes",
    "Task lists — GitHub Flavored Markdown checkboxes rendered via XDSCheckboxList in isReadOnly mode",
    'Tables — rendered as accessible HTML tables with XDS typography',
    'Citation chips — sources prop renders [id] and 【id】 markers as linked chips with label or number style',
    'Content width — contentWidth constrains prose to a readable width while tables and code blocks expand to the full container',
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
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        "Alignment of prose content within the container when contentWidth is narrower than the available space.",
      default: "'start'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling — className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for styling — inline styles bypass StyleX optimization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-markdown', visualProps: ['density']},
    ],
  },
  accessibility: [
    'Root element uses role="document" to establish a document landmark for screen readers.',
    'Lists are rendered as semantic <ul>/<ol> elements.',
    'Tables include proper <thead>/<tbody> with alignment attributes.',
    'Task list checkboxes are rendered via XDSCheckboxList with isReadOnly.',
    'Code blocks use XDSCodeBlock with appropriate ARIA attributes.',
  ],
  usage: {
    summary: 'Renders a markdown string as XDS-styled components.',
  },
};

export const docsZh = {
  name: 'Markdown',
  description:
    '将 Markdown 字符串渲染为 XDS 组件。支持标题、段落、粗体、斜体、代码、列表、表格、链接、图片、引用块、水平线和任务列表。支持流式文本的逐字符淡入动画。',
  features: [
    '零依赖 — 内置 Markdown 解析器，无需外部库',
    '流式模式 — 逐块文本渲染时平滑淡入动画',
    'XDS 集成 — 使用 XDSList、XDSCodeBlock、XDSCode 和 XDSCheckboxList 输出语义内容',
    '标题级别偏移 — headingLevelStart 将 # 映射到任意 h1-h6 级别',
    '链接拦截 — onLinkClick 可拦截或阻止链接导航',
    '密度 — 默认和紧凑间距模式',
    '任务列表 — GitHub 风格 Markdown 复选框通过 XDSCheckboxList 以只读模式渲染',
    '表格 — 渲染为带 XDS 排版的语义 HTML 表格',
    '引用标签 — sources 属性将 [id] 和 【id】 标记渲染为带链接的标签或编号徽章',
    '内容宽度 — contentWidth 将正文限制在可读宽度内，表格和代码块扩展到完整容器宽度',
  ],
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
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        "当 contentWidth 小于可用空间时，正文内容在容器内的对齐方式。",
      default: "'start'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '根元素的 CSS 类名。建议使用 xstyle — className 适用于非 StyleX 系统集成。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: '根元素的内联样式。建议使用 xstyle — 内联样式会绕过 StyleX 优化。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '用于自动化测试框架的测试选择器。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-markdown', visualProps: ['density']},
    ],
  },
  accessibility: [
    '根元素使用 role="document" 为屏幕阅读器建立文档地标。',
    '列表渲染为语义化 <ul>/<ol> 元素。',
    '表格包含带对齐属性的 <thead>/<tbody>。',
    '任务列表复选框通过 XDSCheckboxList 以 isReadOnly 模式渲染。',
    '代码块使用 XDSCodeBlock 并附带适当的 ARIA 属性。',
  ],
};

export const docsDense = {
  n: 'Markdown',
  d: 'Renders markdown string as XDS components. Headings, bold, italic, code, lists, tables, links, blockquotes, task lists. Streaming with fade-in animation.',
  kw: ['markdown', 'rich text', 'prose', 'renderer', 'streaming', 'markup', 'md'],
  f: [
    'Zero-dep parser. Streaming fade-in. XDSList/XDSCodeBlock/XDSCheckboxList integration.',
    'headingLevelStart: maps # to any h1-h6. Clamped at h6.',
    'onLinkClick: intercept/prevent link nav. Return false to cancel.',
    'density: default/compact block spacing.',
    'Task lists via XDSCheckboxList isReadOnly. Tables as semantic HTML.',
    'Citation chips: sources prop + [id]/【id】 markers. label or number style.',
    'contentWidth constrains prose; tables/code expand to full width.',
  ],
  p: {
    children: 'Markdown string. Required.',
    density: "Block spacing. 'default'|'compact'. Default: 'default'.",
    headingLevelStart: 'Maps # to this heading level (1-6). Clamped to h6. Default: 1.',
    isStreaming: 'Incremental parse + fade-in for streamed chunks. Default: false.',
    onLinkClick: '(href, event) => void|false. Return false prevents navigation.',
    sources: 'Record<string, XDSMarkdownSource>. Citation sources by ID. [id]/【id】 markers render as chips.',
    citationStyle: "'label'|'number'. label=chip w/ title+icon, number=compact badge. Default: 'label'.",
    contentWidth: 'number|string. Max width for prose (headings, paragraphs, lists). Tables/code unconstrained.',
    contentAlign: "'start'|'center'. Prose alignment when contentWidth < container. Default: 'start'.",
    xstyle: 'stylex.create() for layout (margins, sizing).',
    className: 'CSS class. Prefer xstyle.',
    style: 'Inline styles. Prefer xstyle.',
    'data-testid': 'Test selector.',
  },
  ex: [
    '<XDSMarkdown>{\'# Hello\\\\n\\\\nThis is **bold** text.\'}</XDSMarkdown>',
    '<XDSMarkdown isStreaming={isStreaming}>{streamedText}</XDSMarkdown>',
  ],
};
