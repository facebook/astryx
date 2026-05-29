// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TreeList',
  displayName: 'Tree List',
  group: 'TreeList',
  category: 'Lists',
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
      {className: 'xds-tree-list', visualProps: ['density']},
      {className: 'xds-tree-list-item', states: ['selected', 'disabled']},
    ],
  },
  components: [
    {
      name: 'XDSTreeList',
      displayName: 'Tree List',
      description:
        'Tree list container. Accepts items data and rendering configuration. Expansion state is managed internally.',      props: [
        {
          name: 'items',
          type: 'XDSTreeListItemData[]',
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
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Header'}],
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
      {guidance: false, description: 'Nest more than 4–5 levels deep — flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data — use a List instead.'},
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
      {className: 'xds-tree-list', visualProps: ['density']},
      {className: 'xds-tree-list-item', states: ['selected', 'disabled']},
    ],
  },
  components: [
    {
      name: 'XDSTreeList',
      displayName: 'Tree List',
      description:
        '树列表容器。接受 items 数据和渲染配置。展开状态在内部管理。',
      props: [
        {
          name: 'items',
          type: 'XDSTreeListItemData[]',
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
      {guidance: false, description: 'Nest more than 4–5 levels deep — flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data — use a List instead.'},
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
      {guidance: false, description: 'Nest more than 4–5 levels deep — flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data — use a List instead.'},
    ],
  },
  propDescriptions: {
    items: 'Recursive tree item data w/ id, label, optional children + isExpanded.',
    density: 'Spacing density for items.',
    header: 'Header content, linked to tree via aria-labelledby.',
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
  components: [
    {
      name: 'XDSTreeList',
      displayName: 'Tree List',
      description: 'Tree list container. Accepts items data + rendering config. Expansion managed internally.',
      propDescriptions: {
        items: 'Recursive tree item data w/ id, label, optional children + isExpanded.',
        density: 'Spacing density for items.',
        header: 'Header content, linked to tree via aria-labelledby.',
        xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
      },
    },
  ],
};
