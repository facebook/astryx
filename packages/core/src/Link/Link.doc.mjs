/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Link',
  description:
    'XDSLink component for styled anchor links with multiple variants and features, plus polymorphic link infrastructure for rendering custom link components (Next.js Link, React Router Link, etc.).',
  showcase: {
    aspectRatio: 1,
    code: '<XDSLink href="#">Link text</XDSLink>',
  },
  keywords: ["link","anchor","href","hyperlink","navigation","url","external","textlink"],
  features: [
    "Color control: Uses XDSText color prop ('active' default, 'secondary', 'inherit', etc.)",
    'External links: Opens in new tab with external link icon',
    'Tooltip support: Display tooltip text on hover',
    'Underline control: Always show underline or only on hover',
    'Inline support: Inherits parent font styles when used within text',
    'Standalone mode: Applies base font sizing for independent links',
    'Disabled state: Visual and interaction disabled',
    'Focus visible: Accessible focus outline',
    'Polymorphic link: Render as a custom component via `as` prop or XDSLinkProvider',
  ],
  theming: {
    targets: [
      {className: 'xds-link', visualProps: ['color']},
    ],
  },
  notes: [
    'By default, links inherit font family, size, line-height, and weight from parent elements',
    'Use isStandalone prop when the link is not inline within other text content',
    'isExternalLink automatically sets target="_blank" and rel="noopener noreferrer" for security',
    'Disabled state uses aria-disabled and pointer-events: none for accessibility',
    'Tooltip wraps the link in XDSTooltip component when provided',
    'XDSLinkComponentType is React.ElementType, allowing both string tags ("a") and custom components',
    'XDSLinkContext is separated from XDSLinkProvider (mirrors ThemeContext/XDSTheme pattern) so consumers can import the context without the full provider',
    'XDSLinkProvider memoizes its context value to prevent unnecessary re-renders',
    'Polymorphic link resolution order: (1) per-component as prop (highest priority), (2) XDSLinkProvider context, (3) native <a> element (default)',
    'All XDS components that render links (XDSLink, XDSTopNavItem, XDSSideNavItem, XDSBreadcrumbItem, XDSTab) support rendering as a custom link component',
  ],
  components: [
    {
      name: 'XDSLink',
      description:
        'Styled anchor link with variants, external link support, and polymorphic rendering.',
      props: [
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: 'Custom component to render instead of <a>',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: 'Link destination URL',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: 'Always show underline',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the link',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description: 'Opens in new tab with external icon',
          default: 'false',
        },
        {
          name: 'target',
          type: 'string',
          description: 'Where to open linked document',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: 'Click event handler',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: 'Tooltip text displayed on hover',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: 'Applies base font sizing',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Link content',
          required: true,
        },
      ],    },
    {
      name: 'XDSLinkProvider',
      description:
        'Provider that sets the default link component for all XDS link components in the subtree.',
      props: [
        {
          name: 'component',
          type: 'XDSLinkComponentType',
          description: 'Component to use for all link elements',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Subtree',
          required: true,
        },
      ],
    },
  ],
  usage: {
    summary: 'Clickable element that leads to a new destination or performs an action.',
    content: `## When to use

- To embed actions inline on a page.
- To provide a path to more information.

## When NOT to use

- Don't use to trigger dropdown menus.
- Don't use icon-only links without a visible label.

## Best practices

- Do: Write descriptive link text and front-load key information.
- Do: Keep link text concise.
- Do: Include context about the destination for "Learn more" links.`,
    anatomy: [
      {name: 'Label', required: true, description: 'The visible text of the link.'},
      {name: 'Right icon', required: false, description: 'Icon placed after the label to indicate an action affordance.'},
      {name: 'Left icon', required: false, description: 'Icon placed before the label to represent meaning.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Link',
  description:
    'XDSLink 组件，用于创建带有多种变体和功能的样式化锚点链接，以及用于渲染自定义链接组件（Next.js Link、React Router Link 等）的多态链接基础设施。',
  features: [
    "颜色控制：使用 XDSText 的 color 属性（默认 'active'、'secondary'、'inherit' 等）",
    '外部链接：在新标签页中打开，带有外部链接图标',
    '工具提示支持：悬停时显示提示文本',
    '下划线控制：始终显示下划线或仅在悬停时显示',
    '内联支持：在文本中使用时继承父级字体样式',
    '独立模式：为独立链接应用基础字体大小',
    '禁用状态：视觉和交互均被禁用',
    '焦点可见：无障碍焦点轮廓',
    '多态链接：通过 `as` 属性或 XDSLinkProvider 渲染为自定义组件',
  ],
  theming: {
    targets: [
      {className: 'xds-link', visualProps: ['color']},
    ],
  },
  notes: [
    '默认情况下，链接从父元素继承字体族、大小、行高和字重',
    '当链接不在其他文本内容中内联使用时，使用 isStandalone 属性',
    'isExternalLink 自动设置 target="_blank" 和 rel="noopener noreferrer" 以确保安全',
    '禁用状态使用 aria-disabled 和 pointer-events: none 以确保无障碍性',
    '提供 tooltip 时，链接会被包裹在 XDSTooltip 组件中',
    'XDSLinkComponentType 是 React.ElementType，允许字符串标签（"a"）和自定义组件',
    'XDSLinkContext 与 XDSLinkProvider 分离（与 ThemeContext/XDSTheme 模式一致），以便消费者可以在不引入完整 Provider 的情况下导入上下文',
    'XDSLinkProvider 对其上下文值进行缓存以防止不必要的重新渲染',
    '多态链接解析顺序：（1）单组件 as 属性（最高优先级），（2）XDSLinkProvider 上下文，（3）原生 <a> 元素（默认）',
    '所有渲染链接的 XDS 组件（XDSLink、XDSTopNavItem、XDSSideNavItem、XDSBreadcrumbItem、XDSTab）都支持渲染为自定义链接组件',
  ],
  components: [
    {
      name: 'XDSLink',
      description:
        '带有变体、外部链接支持和多态渲染的样式化锚点链接。',
      props: [
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: '用于替代 <a> 渲染的自定义组件',
        },
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: '链接目标 URL',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: '始终显示下划线',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用链接',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description: '在新标签页中打开，带外部图标',
          default: 'false',
        },
        {
          name: 'target',
          type: 'string',
          description: '链接文档的打开位置',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: '点击事件处理器',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: '悬停时显示的工具提示文本',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: '应用基础字体大小',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '链接内容',
          required: true,
        },
      ],
    },
    {
      name: 'XDSLinkProvider',
      description:
        '为子树中所有 XDS 链接组件设置默认链接组件的 Provider。',
      props: [
        {
          name: 'component',
          type: 'XDSLinkComponentType',
          description: '用于所有链接元素的组件',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子树',
          required: true,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Styled anchor links w/ multiple variants + polymorphic link infra for custom link components (Next.js Link, React Router Link, etc.).',
  features: [
    "Color control: uses XDSText color prop ('active' default, 'secondary', 'inherit', etc.)",
    'External links: opens new tab w/ external link icon',
    'Tooltip support: displays tooltip text on hover',
    'Underline control: always show underline or only on hover',
    'Inline support: inherits parent font styles when used within text',
    'Standalone mode: applies base font sizing for independent links',
    'Disabled state: visual + interaction disabled',
    'Focus visible: accessible focus outline',
    'Polymorphic link: render as custom component via `as` prop or XDSLinkProvider',
  ],
  notes: [
    'Links inherit font family, size, line-height, weight from parent elements',
    'Use isStandalone when link not inline within other text content',
    'isExternalLink auto-sets target="_blank" + rel="noopener noreferrer" for security',
    'Disabled state uses aria-disabled + pointer-events: none for accessibility',
    'Tooltip wraps link in XDSTooltip when provided',
    'XDSLinkComponentType is React.ElementType; allows string tags ("a") + custom components',
    'XDSLinkContext separated from XDSLinkProvider (mirrors ThemeContext/XDSTheme pattern); consumers import context w/o full provider',
    'XDSLinkProvider memoizes context value to prevent unnecessary re-renders',
    'Resolution order: (1) per-component as prop (highest priority), (2) XDSLinkProvider context, (3) native <a> element (default)',
    'All XDS link components (XDSLink, XDSTopNavItem, XDSSideNavItem, XDSBreadcrumbItem, XDSTab) support custom link rendering',
  ],
  components: [
    {
      name: 'XDSLink',
      description:
        'Styled anchor link w/ variants, external link support, polymorphic rendering.',
      propDescriptions: {
        as: 'Custom component to render instead of <a>',
        label: 'Accessible label',
        href: 'Link destination URL',
        hasUnderline: 'Always show underline',
        isDisabled: 'Disables link',
        isExternalLink: 'Opens new tab w/ external icon',
        target: 'Where to open linked document',
        onClick: 'Click event handler',
        tooltip: 'Tooltip text on hover',
        isStandalone: 'Applies base font sizing',
        children: 'Link content',
      },
    },
    {
      name: 'XDSLinkProvider',
      description:
        'Provider setting default link component for all XDS links in subtree.',
      propDescriptions: {
        component: 'Component for all link elements',
        children: 'Subtree',
      },
    },
  ],
};
