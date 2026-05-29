// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'List',
  displayName: 'List',
  group: 'List',
  category: 'Lists',
  keywords: ["list","listitem","listbox","menu","collection","items","ul","navlist"],
  theming: {
    targets: [
      {className: 'xds-list', visualProps: ['density', 'listStyle']},
      {className: 'xds-list-item'},
    ],
  },
  components: [
    {
      name: 'XDSList',
      displayName: 'List',
      description: 'List container with density, dividers, and header support.',      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'List items (XDSListItem components).',
          slotElements: [{__element: 'XDSListItem', props: {label: 'List item'}}],
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
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Header'}],
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
      displayName: 'List Item',
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered after the label area (e.g. badge, chevron).',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
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
            'Link target attribute, only applicable when href is provided. target="_blank" automatically adds noopener noreferrer.',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            'Link relationship tokens. noopener noreferrer are merged automatically for target="_blank".',
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
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      { guidance: true, description: 'Provide a header to label the list and give context to screen readers.' },
      { guidance: true, description: 'Use start and end content slots to add icons, avatars, or badges to each item.' },
      { guidance: false, description: 'Place interactive elements inside an interactive list item — it creates nested click targets and confusing focus behavior.' },
      { guidance: false, description: 'Use a list for a single item or for laying out unrelated content — lists imply a meaningful collection.' },
      { guidance: false, description: 'Mix clickable and non-clickable items in the same list without clear visual distinction.' },
    ],
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
  displayName: 'List',
  group: 'List',
  theming: {
    targets: [
      {className: 'xds-list', visualProps: ['density', 'listStyle']},
      {className: 'xds-list-item'},
    ],
  },
  components: [
    {
      name: 'XDSList',
      displayName: 'List',
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
      displayName: 'List Item',
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
            '链接 target 属性，仅在提供 href 时适用。target="_blank" 会自动添加 noopener noreferrer。',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
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
  usage: {
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      { guidance: true, description: 'Provide a header to label the list and give context to screen readers.' },
      { guidance: true, description: 'Use start and end content slots to add icons, avatars, or badges to each item.' },
      { guidance: false, description: 'Place interactive elements inside an interactive list item — it creates nested click targets and confusing focus behavior.' },
      { guidance: false, description: 'Use a list for a single item or for laying out unrelated content — lists imply a meaningful collection.' },
      { guidance: false, description: 'Mix clickable and non-clickable items in the same list without clear visual distinction.' },
    ],
    anatomy: [
      {name: 'List title', required: true, description: 'Heading that labels the list.'},
      {name: 'Description', required: false, description: 'Supplementary text below the title.'},
      {name: 'List items', required: true, description: 'Individual entries, which may include icons or images.'},
      {name: 'Item description', required: false, description: 'Additional detail for an individual list item.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Vertical list for rendering item collections w/ consistent spacing, dividers, marker styles. Composition model: XDSList wraps XDSListItem sub-components.',
  usage: {
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      { guidance: true, description: 'Provide a header to label the list and give context to screen readers.' },
      { guidance: true, description: 'Use start and end content slots to add icons, avatars, or badges to each item.' },
      { guidance: false, description: 'Place interactive elements inside an interactive list item — it creates nested click targets and confusing focus behavior.' },
      { guidance: false, description: 'Use a list for a single item or for laying out unrelated content — lists imply a meaningful collection.' },
      { guidance: false, description: 'Mix clickable and non-clickable items in the same list without clear visual distinction.' },
    ],
    anatomy: [
      {name: 'List title', required: true, description: 'Heading that labels the list.'},
      {name: 'Description', required: false, description: 'Supplementary text below the title.'},
      {name: 'List items', required: true, description: 'Individual entries, which may include icons or images.'},
      {name: 'Item description', required: false, description: 'Additional detail for an individual list item.'},
    ],
  },
  components: [
    {
      name: 'XDSList',
      displayName: 'List',
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
      displayName: 'List Item',
      description:
        'List item w/ label, description, start/end content slots, interactive patterns.',
      propDescriptions: {
        label: 'Primary text.',
        description: 'Secondary text below label.',
        startContent: 'Content before label area (e.g. icon, avatar).',
        endContent: 'Content after label area (e.g. badge, chevron).',
        onClick: 'Click handler; enables invisible button pattern.',
        href: 'Link URL; enables invisible anchor pattern.',
        target:
          'Link target attribute, only when href provided. target="_blank" auto-adds noopener noreferrer.',
        rel: 'Link relationship tokens. noopener noreferrer are merged for target="_blank".',
        isDisabled: 'Disabled state; sets aria-disabled.',
        isSelected: 'Selected state; sets aria-selected.',
      },
    },
  ],
};
