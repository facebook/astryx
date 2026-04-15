/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'List',
  description:
    'Vertical list component for rendering collections of items with consistent spacing, dividers, and marker styles. Uses a composition model: XDSList wraps XDSListItem sub-components.',
  showcase: {
    aspectRatio: 3 / 4,
    code: '<XDSList><XDSListItem>Item 1</XDSListItem></XDSList>',
  },
  keywords: ["list","listitem","listbox","menu","collection","items","ul","navlist"],
  features: [
    'Composition model — XDSList wraps XDSListItem sub-components',
    'Density variants: compact, balanced, spacious',
    'Optional dividers between items',
    'Optional header associated via aria-labelledby',
    'List marker styles: none, disc, decimal (renders <ol>), circle',
    'Interactive items via invisible button or anchor pattern',
    'Start and end content slots (icon, avatar, badge, chevron)',
  ],
  accessibility: [
    'Semantic <ul> / <ol> with <li> elements',
    'role="list" added when listStyle=\'none\' (Safari fix for list semantics removed by CSS list-style:none)',
    'aria-labelledby links the header element to the list',
    'aria-selected on selected items',
    'aria-disabled on disabled items',
    'Dividers are aria-hidden="true"',
    'Interactive items are keyboard-focusable via Tab',
  ],
  theming: {
    targets: [
      {className: 'xds-list', visualProps: ['density', 'listStyle']},
      {className: 'xds-list-item'},
    ],
  },
  notes: [
    'Invisible button pattern: when onClick is provided, an invisible <button> wraps the label + description for accessibility. The <li> is the visual container with hover/press styles. startContent and endContent are siblings to the button (not inside it). Container click fires onClick unless the click originated from an interactive child. :focus-within on the container shows the focus outline.',
    'When href is provided instead of onClick, the same invisible pattern uses an <a> element.',
  ],
  components: [
    {
      name: 'XDSList',
      description: 'List container with density, dividers, and header support.',      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'List items (XDSListItem components).',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Spacing density for items.',
          default: "'balanced'",
        },
        {
          name: 'hasDividers',
          type: 'boolean',
          description: 'Show dividers between items.',
          default: 'false',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Header content, associated with the list via aria-labelledby.',
        },
        {
          name: 'listStyle',
          type: "'none' | 'disc' | 'decimal' | 'circle'",
          description:
            "List marker style. 'decimal' renders an <ol> element instead of <ul>.",
          default: "'none'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSListItem',
      description:
        'List item with label, description, start/end content slots, and interactive patterns.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Primary text.',
          required: true,
        },
        {
          name: 'description',
          type: 'ReactNode',
          description:
            'Secondary content below the label. A plain string gets single-line truncation automatically; a ReactNode lets child components control their own wrapping and line-clamp behavior.',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Content rendered before the label area (e.g. icon, avatar).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered after the label area (e.g. badge, chevron).',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: 'Click handler; enables the invisible button pattern.',
        },
        {
          name: 'href',
          type: 'string',
          description: 'Link URL; enables the invisible anchor pattern.',
        },
        {
          name: 'target',
          type: 'string',
          description:
            'Link target attribute, only applicable when href is provided.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disabled state; sets aria-disabled on the item.',
          default: 'false',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: 'Selected state; sets aria-selected on the item.',
          default: 'false',
        },
      ],
    },
  ],
  usage: {
    summary: 'Organizes information or interactive elements.',
    content: `## When to use

- To organize text, media, charts, or actions.
- To create subgroups of parallel information.
- When items need add, edit, delete, or expand operations.

## Best practices

- Do: Place lists within a container such as a card or dialog.`,
    anatomy: [
      {name: 'List title', required: true, description: 'Heading that labels the list.'},
      {name: 'Description', required: false, description: 'Supplementary text below the title.'},
      {name: 'List items', required: true, description: 'Individual entries, which may include icons or images.'},
      {name: 'Item description', required: false, description: 'Additional detail for an individual list item.'},
    ],
  },
};
/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'List',
  description:
    '用于渲染项目集合的垂直列表组件，提供一致的间距、分割线和标记样式。采用组合模式：XDSList 包裹 XDSListItem 子组件。',
  features: [
    '组合模式 — XDSList 包裹 XDSListItem 子组件',
    '密度变体：紧凑、均衡、宽松',
    '可选的项目间分割线',
    '可选的标题，通过 aria-labelledby 关联',
    '列表标记样式：无、实心圆点、数字（渲染 <ol>）、空心圆',
    '通过隐形按钮或锚点模式实现可交互项目',
    '起始和结束内容插槽（图标、头像、徽章、箭头）',
  ],
  accessibility: [
    '语义化 <ul> / <ol> 配合 <li> 元素',
    '当 listStyle=\'none\' 时添加 role="list"（Safari 修复：CSS list-style:none 会移除列表语义）',
    'aria-labelledby 将标题元素与列表关联',
    '选中项目上设置 aria-selected',
    '禁用项目上设置 aria-disabled',
    '分割线设置 aria-hidden="true"',
    '可交互项目通过 Tab 键可获取焦点',
  ],
  theming: {
    targets: [
      {className: 'xds-list', visualProps: ['density', 'listStyle']},
      {className: 'xds-list-item'},
    ],
  },
  notes: [
    '隐形按钮模式：当提供 onClick 时，一个不可见的 <button> 包裹标签和描述以确保无障碍访问。<li> 作为带有悬停/按下样式的视觉容器。startContent 和 endContent 是按钮的兄弟元素（不在按钮内部）。容器点击触发 onClick，除非点击来源于可交互子元素。容器上的 :focus-within 显示焦点轮廓。',
    '当提供 href 而非 onClick 时，相同的隐形模式使用 <a> 元素。',
  ],
  components: [
    {
      name: 'XDSList',
      description: '列表容器，支持密度、分割线和标题。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '列表项（XDSListItem 组件）。',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '项目的间距密度。',
          default: "'balanced'",
        },
        {
          name: 'hasDividers',
          type: 'boolean',
          description: '在项目之间显示分割线。',
          default: 'false',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            '标题内容，通过 aria-labelledby 与列表关联。',
        },
        {
          name: 'listStyle',
          type: "'none' | 'disc' | 'decimal' | 'circle'",
          description:
            "列表标记样式。'decimal' 渲染 <ol> 元素而非 <ul>。",
          default: "'none'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSListItem',
      description:
        '列表项，包含标签、描述、起始/结束内容插槽和交互模式。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '主要文本。',
          required: true,
        },
        {
          name: 'description',
          type: 'ReactNode',
          description:
            '标签下方的次要内容。纯字符串会自动应用单行截断；ReactNode 允许子组件自行控制换行和多行截断行为。',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            '在标签区域之前渲染的内容（如图标、头像）。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '在标签区域之后渲染的内容（如徽章、箭头）。',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: '点击处理函数；启用隐形按钮模式。',
        },
        {
          name: 'href',
          type: 'string',
          description: '链接 URL；启用隐形锚点模式。',
        },
        {
          name: 'target',
          type: 'string',
          description:
            '链接 target 属性，仅在提供 href 时适用。',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用状态；在项目上设置 aria-disabled。',
          default: 'false',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: '选中状态；在项目上设置 aria-selected。',
          default: 'false',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Vertical list for rendering item collections w/ consistent spacing, dividers, marker styles. Composition model: XDSList wraps XDSListItem sub-components.',
  features: [
    'Composition model; XDSList wraps XDSListItem sub-components',
    'Density variants: compact, balanced, spacious',
    'Optional dividers between items',
    'Optional header associated via aria-labelledby',
    'List marker styles: none, disc, decimal (renders <ol>), circle',
    'Interactive items via invisible button or anchor pattern',
    'Start + end content slots (icon, avatar, badge, chevron)',
  ],
  accessibility: [
    'Semantic <ul> / <ol> w/ <li> elements',
    "role=\"list\" added when listStyle='none' (Safari fix for list semantics removed by CSS list-style:none)",
    'aria-labelledby links header element to list',
    'aria-selected on selected items',
    'aria-disabled on disabled items',
    'Dividers are aria-hidden="true"',
    'Interactive items keyboard-focusable via Tab',
  ],
  notes: [
    'Invisible button pattern: onClick wraps label+description in invisible <button> for accessibility. <li> is visual container w/ hover/press styles. startContent + endContent siblings to button (not inside). Container click fires onClick unless from interactive child. :focus-within shows focus outline.',
    'When href provided instead of onClick, same invisible pattern uses <a> element.',
  ],
  components: [
    {
      name: 'XDSList',
      description: 'List container w/ density, dividers, header support.',
      propDescriptions: {
        children: 'List items (XDSListItem components).',
        density: 'Spacing density for items.',
        hasDividers: 'Show dividers between items.',
        header: 'Header content, associated w/ list via aria-labelledby.',
        listStyle:
          "List marker style. 'decimal' renders <ol> instead of <ul>.",
        xstyle:
          'StyleX styles for layout customization (margins, positioning, sizing). Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSListItem',
      description:
        'List item w/ label, description, start/end content slots, interactive patterns.',
      propDescriptions: {
        label: 'Primary text.',
        description: 'Secondary text below label.',
        startContent: 'Content before label area (e.g. icon, avatar).',
        endContent: 'Content after label area (e.g. badge, chevron).',
        onClick: 'Click handler; enables invisible button pattern.',
        href: 'Link URL; enables invisible anchor pattern.',
        target: 'Link target attribute, only when href provided.',
        isDisabled: 'Disabled state; sets aria-disabled.',
        isSelected: 'Selected state; sets aria-selected.',
      },
    },
  ],
};
