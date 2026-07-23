// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TreeList',
  displayName: 'Tree List',
  group: 'TreeList',
  category: 'Table & List',
  keywords: ['tree', 'hierarchy', 'nested', 'accordion', 'folder', 'expand', 'collapse', 'treeview', 'outline'],
  playground: {
    defaults: {
      items: [
        {id: '1', label: 'Documents', children: [
          {id: '1a', label: 'Report.pdf'},
          {id: '1b', label: 'Notes.md'},
        ]},
        {id: '2', label: 'Images', children: [
          {id: '2a', label: 'Photo.jpg'},
        ]},
        {id: '3', label: 'README.md'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-tree-list', visualProps: ['density']},
      {className: 'astryx-tree-list-item', visualProps: ['density'], states: ['selected', 'disabled']},
    ],
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description:
        'Tree list container. Accepts items data and rendering configuration. Expansion state is managed internally.',      props: [
        {
          name: 'items',
          type: 'TreeListItemData[]',
          description:
            'Recursive tree item data. Each item has id, label, optional children array, and optional isExpanded boolean for initial state.',
          required: true,
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Spacing density for items.',
          default: "'balanced'",
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Header content, associated with the tree via aria-labelledby.',
          slotElements: [{__element: 'Text', props: {type: 'body'}, children: 'Header'}],
        },
        {
          name: 'renderExpandIcon',
          type: '(state: TreeListExpandIconState) => ReactNode',
          description:
            'Custom expand/collapse indicator replacing the default rotating chevron. Called per item with {isExpanded, hasChildren, isDisabled} so collapsed, expanded, and leaf icons can differ (e.g. closed/open folder, file). Custom icons swap per state instead of rotating. Return null to fall back: default chevron for parents, no indicator for leaves. Toggle a11y wiring is preserved regardless of the icon.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
  ],
  usage: {
    description:
      'An expandable tree structure for displaying hierarchical data with branch connector lines. Use it for file explorers, nested category browsers, or any interface that visualizes parent-child relationships.',
    bestPractices: [
      {guidance: true, description: 'Provide meaningful labels and icons for each node to make the hierarchy easy to scan.'},
      {guidance: true, description: 'Pre-expand important branches so users see key content immediately.'},
      {guidance: false, description: 'Nest more than 4–5 levels deep; flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data; use a List instead.'},
    ],
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TreeList',
  displayName: 'Tree List',
  group: 'TreeList',
  theming: {
    targets: [
      {className: 'astryx-tree-list', visualProps: ['density']},
      {className: 'astryx-tree-list-item', visualProps: ['density'], states: ['selected', 'disabled']},
    ],
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description:
        '树列表容器。接受 items 数据和渲染配置。展开状态在内部管理。',
      props: [
        {
          name: 'items',
          type: 'TreeListItemData[]',
          description:
            '递归树项数据。每项有 id、label、可选 children 数组和可选 isExpanded 布尔值用于设置初始状态。',
          required: true,
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '项目的间距密度。',
          default: "'balanced'",
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            '标题内容，通过 aria-labelledby 与树关联。',
        },
        {
          name: 'renderExpandIcon',
          type: '(state: TreeListExpandIconState) => ReactNode',
          description:
            '自定义展开/折叠指示图标，替代默认的旋转箭头。按项调用并传入 {isExpanded, hasChildren, isDisabled}，可为折叠、展开和叶子节点渲染不同图标（如打开/关闭的文件夹、文件）。自定义图标按状态切换而非旋转。返回 null 时回退：父节点使用默认箭头，叶子节点不渲染指示器。切换按钮的无障碍连接不受图标影响。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
        },
      ],
    },
  ],
  usage: {
    description:
      'An expandable tree structure for displaying hierarchical data with branch connector lines. Use it for file explorers, nested category browsers, or any interface that visualizes parent-child relationships.',
    bestPractices: [
      {guidance: true, description: 'Provide meaningful labels and icons for each node to make the hierarchy easy to scan.'},
      {guidance: true, description: 'Pre-expand important branches so users see key content immediately.'},
      {guidance: false, description: 'Nest more than 4–5 levels deep; flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data; use a List instead.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Data-driven tree list for hierarchical data w/ expand/collapse, branch lines, interactive items. Flat items array w/ recursive children, no composition, no cloneElement.',
  usage: {
    description:
      'An expandable tree structure for displaying hierarchical data with branch connector lines. Use it for file explorers, nested category browsers, or any interface that visualizes parent-child relationships.',
    bestPractices: [
      {guidance: true, description: 'Provide meaningful labels and icons for each node to make the hierarchy easy to scan.'},
      {guidance: true, description: 'Pre-expand important branches so users see key content immediately.'},
      {guidance: false, description: 'Nest more than 4–5 levels deep; flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data; use a List instead.'},
    ],
  },
  propDescriptions: {
    items: 'Recursive tree item data w/ id, label, optional children + isExpanded.',
    density: 'Spacing density for items.',
    header: 'Header content, linked to tree via aria-labelledby.',
    renderExpandIcon: 'Custom indicator per item state {isExpanded, hasChildren, isDisabled}; state-swap not rotation; null → default chevron (parents) / no indicator (leaves).',
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description: 'Tree list container. Accepts items data + rendering config. Expansion managed internally.',
      propDescriptions: {
        items: 'Recursive tree item data w/ id, label, optional children + isExpanded.',
        density: 'Spacing density for items.',
        header: 'Header content, linked to tree via aria-labelledby.',
        renderExpandIcon: 'Custom indicator per item state {isExpanded, hasChildren, isDisabled}; state-swap not rotation; null → default chevron (parents) / no indicator (leaves).',
        xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
      },
    },
  ],
};
