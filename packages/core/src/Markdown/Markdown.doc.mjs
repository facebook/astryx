// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Markdown',
  displayName: 'Markdown',
  category: 'Content',
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
      name: 'display',
      type: "'block' | 'inline'",
      description:
        "Display type. Markdown defaults to block. Use 'inline' for markdown spans embedded inside text.",
      default: "'block'",
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
        'Enables streaming mode; it uses incremental parsing and a smooth fade-in animation for chunk-by-chunk text delivery.',
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
      name: 'inlinePlugins',
      type: 'MarkdownInlinePlugin[]',
      description:
        'Transforms regex matches in parsed text nodes into custom inline React elements. Use for issue refs, diff refs, mentions, and other shorthand patterns. Inline code and fenced code blocks are unaffected.',
    },
    {
      name: 'autolink',
      type: "'gfm'",
      description:
        "Opt-in autolinking of bare URLs and emails. 'gfm' applies GitHub-Flavored Markdown autolink-literal rules: bare https?://…, www.…, <scheme:url>, <email>, and user@host all become links. Trailing sentence punctuation and unbalanced trailing close-parens are excluded; matches inside code spans, code blocks, existing links, and image alt text are skipped. Default behavior (option unset) is unchanged.",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling; className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for styling; inline styles bypass StyleX optimization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  playground: {
    defaults: {
      children: '## Getting Started\n\nInstall the package:\n\n```bash\nnpm install @xds/core\n```\n\nThen import and use any component:\n\n```tsx\nimport {XDSButton} from \'@xds/core/Button\';\n```\n\n**Bold**, *italic*, and `inline code` all work.',
    },
  },
  theming: {
    targets: [
      {className: 'xds-markdown', visualProps: ['density']},
    ],
  },
  usage: {
    description:
      'Renders a markdown string as XDS-styled components. Use Markdown for user-generated content, AI responses, and documentation; it handles headings, lists, tables, code blocks, and citations with consistent styling.',
    bestPractices: [
      { guidance: true, description: 'Set headingLevelStart to match the page hierarchy, e.g. start at 3 if the markdown sits inside an h2 section.' },
      { guidance: true, description: 'Use contentWidth to keep prose at a readable line length in wide layouts.' },
      { guidance: true, description: 'Use inlinePlugins for custom shorthand patterns like issue refs, diff refs, and mentions instead of preprocessing the markdown string.' },
      { guidance: false, description: 'Use Markdown for hand-authored layouts; use XDSText and XDSHeading directly when you control the content.' },
    ],
  },
  examples: [
    {
      label: 'Inline display',
      code: `
import {XDSText} from '@xds/core/Text';

<XDSText>
  This description includes{' '}
  <XDSMarkdown display="inline">{'\`inline code\` and **bold text**'}</XDSMarkdown>
  .
</XDSText>;
`,
    },
    {
      label: 'GFM autolinks',
      code: `
<XDSMarkdown autolink="gfm">
  {'Visit https://example.com or email contact@example.com. ' +
    'You can also bracket links: <https://docs.example.com>.'}
</XDSMarkdown>;
`,
    },
    {
      label: 'Inline Plugins',
      code: `
import {XDSLink} from '@xds/core/Link';

const issuePlugins = [
  {
    pattern: /\\b([A-Z][A-Z0-9]+-\\d+)\\b/g,
    render: (match, key) => (
      <XDSLink key={key} href={\`/issues/\${match[1]}\`}>
        {match[0]}
      </XDSLink>
    ),
  },
];

<XDSMarkdown inlinePlugins={issuePlugins}>
  {'Fixed PROJ-123. Inline code stays plain: \`PROJ-999\`.'}
</XDSMarkdown>;
`,
    },
  ],
};

export const docsZh = {
  name: 'Markdown',
  displayName: 'Markdown',
  props: [
    {
      name: 'children',
      type: 'string',
      description: '要渲染的 Markdown 字符串。',
      required: true,
    },
    {
      name: 'display',
      type: "'block' | 'inline'",
      description:
        "显示类型。Markdown 默认为 block。使用 'inline' 可在文本内嵌入 Markdown 片段。",
      default: "'block'",
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
        '启用流式模式，使用增量解析和淡入动画处理分块文本。',
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
      name: 'inlinePlugins',
      type: 'MarkdownInlinePlugin[]',
      description:
        '将已解析文本节点中的正则匹配转换为自定义内联 React 元素。适用于 issue 引用、diff 引用、用户提及等简写模式。内联代码和围栏代码块不受影响。',
    },
    {
      name: 'autolink',
      type: "'gfm'",
      description:
        "可选的裸 URL 和电子邮箱自动链接。设为 'gfm' 启用 GitHub Flavored Markdown 自动链接规则：裸 https?://、www.、<scheme:url>、<email> 以及 user@host 都会变成链接。末尾句末标点和不平衡的末尾右括号会被排除；代码块、现有链接和图片替代文本内部的匹配会被跳过。默认为关闭。",
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
      description: '根元素的 CSS 类名。建议使用 xstyle，className 适用于非 StyleX 系统集成。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: '根元素的内联样式。建议使用 xstyle，内联样式会绕过 StyleX 优化。',
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
  usage: {
    description:
      'Renders a markdown string as XDS-styled components. Use Markdown for user-generated content, AI responses, and documentation; it handles headings, lists, tables, code blocks, and citations with consistent styling.',
    bestPractices: [
      { guidance: true, description: 'Set headingLevelStart to match the page hierarchy, e.g. start at 3 if the markdown sits inside an h2 section.' },
      { guidance: true, description: 'Use contentWidth to keep prose at a readable line length in wide layouts.' },
      { guidance: true, description: 'Use inlinePlugins for custom shorthand patterns like issue refs, diff refs, and mentions instead of preprocessing the markdown string.' },
      { guidance: false, description: 'Use Markdown for hand-authored layouts; use XDSText and XDSHeading directly when you control the content.' },
    ],
  },
};

export const docsDense = {
  description:
    'Renders markdown string as XDS-styled components. Use for user-generated content, AI responses, docs. Headings, lists, tables, code, citations w/ consistent styling.',
  usage: {
    description:
      'Renders a markdown string as XDS-styled components. Use Markdown for user-generated content, AI responses, and documentation; it handles headings, lists, tables, code blocks, and citations with consistent styling.',
    bestPractices: [
      { guidance: true, description: 'Set headingLevelStart to match the page hierarchy, e.g. start at 3 if the markdown sits inside an h2 section.' },
      { guidance: true, description: 'Use contentWidth to keep prose at a readable line length in wide layouts.' },
      { guidance: true, description: 'Use inlinePlugins for custom shorthand patterns (issue refs, diff refs, mentions) instead of preprocessing the markdown string.' },
      { guidance: false, description: 'Use Markdown for hand-authored layouts; use XDSText and XDSHeading directly when you control the content.' },
    ],
  },
  propDescriptions: {
    children: 'Markdown string. **(required)**',
    density: "Block spacing. 'default'|'compact'. Default: 'default'.",
    headingLevelStart: 'Maps # to this heading level (1-6). Clamped to h6. Default: 1.',
    isStreaming: 'Incremental parse + fade-in for streamed chunks. Default: false.',
    onLinkClick: '(href, event) => void|false. Return false prevents navigation.',
    sources: 'Record<string, XDSMarkdownSource>. Citation sources by ID. [id]/【id】 markers render as chips.',
    citationStyle: "'label'|'number'. label=chip w/ title+icon, number=compact badge. Default: 'label'.",
    contentWidth: 'number|string. Max width for prose (headings, paragraphs, lists). Tables/code unconstrained.',
    contentAlign: "'start'|'center'. Prose alignment when contentWidth < container. Default: 'start'.",
    inlinePlugins: 'MarkdownInlinePlugin[]. Regex matches in text nodes -> custom inline React elements. Skips inline/fenced code.',
    autolink: "'gfm'. Opt-in GFM autolinking: bare URLs (https?://, www.), <scheme:url>, <email>, user@host. Skips code, code blocks, existing links. Default: off.",
    xstyle: 'stylex.create() for layout (margins, sizing).',
    className: 'CSS class. Prefer xstyle.',
    style: 'Inline styles. Prefer xstyle.',
    'data-testid': 'Test selector.',
  },
};
