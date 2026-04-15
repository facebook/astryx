/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TreeList',
  description:
    'Data-driven tree list component for rendering hierarchical data with expand/collapse, branch lines, and interactive items. Uses a flat items array with recursive children — no composition, no cloneElement.',
  showcase: {
    aspectRatio: 3 / 4,
    code: '<XDSTreeList items={[{label: "Root"}]} />',
  },
  keywords: ['tree', 'hierarchy', 'nested', 'accordion', 'folder', 'expand', 'collapse', 'treeview', 'outline'],
  features: [
    'Data-driven API — items array with recursive children',
    'Internal expansion state — seed via isExpanded on each item',
    'Branch connector lines with center/top alignment',
    'Density variants: compact, balanced, spacious',
    'Interactive items via invisible button or anchor pattern',
    'Start and end content slots (icon, avatar, badge)',
    'Optional header associated via aria-labelledby',
    'No context for positional data — computed at render time',
  ],  accessibility: [
    'Semantic <ul role="tree"> with <li role="treeitem"> elements',
    '<ul role="group"> for nested children',
    'aria-expanded on items with children',
    'aria-labelledby links the header element to the tree',
    'aria-selected on selected items',
    'aria-disabled on disabled items',
    'Chevron toggle button with aria-label="Toggle children"',
    'Interactive items are keyboard-focusable via Tab',
  ],
  theming: {
    targets: [
      {className: 'xds-tree-list', visualProps: ['density']},
      {className: 'xds-tree-list-item', states: ['selected', 'disabled']},
    ],
  },
  notes: [
    'Data-driven pattern: Unlike XDSList which uses children composition, XDSTreeList accepts an items array. This avoids cloneElement and enables the component to compute positional data (nestedLevel, isLast, ancestorsIsLast) at render time.',
    'Expansion control: Expansion state is managed internally. Seed initial state by setting isExpanded: true on individual items in the data.',
    'Performance: React reconciliation via key={id} means expanding a node only causes DOM updates in that subtree. Siblings with stable keys and same props are skipped by React.',
  ],
  components: [
    {
      name: 'XDSTreeList',
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
    summary: 'Displays hierarchical information with expandable and collapsible nodes.',
    content: `## When to use

- For file system navigators.
- For visualizing hierarchical data.
- When expand/collapse interactions are needed.`,
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
  description:
    '数据驱动的树列表组件，用于渲染层级数据，支持展开/折叠、分支线条和交互式项目。使用扁平 items 数组配合递归 children，无需组合模式，无需 cloneElement。',
  features: [
    '数据驱动 API — items 数组配合递归 children',
    '内部展开状态 — 通过每项的 isExpanded 设置初始值',
    '分支连接线，支持居中/顶部对齐',
    '密度变体：compact、balanced、spacious',
    '交互式项目，通过不可见按钮或锚点模式',
    '起始和结束内容插槽（图标、头像、徽章）',
    '可选标题，通过 aria-labelledby 关联',
    '无需位置数据上下文 — 渲染时计算',
  ],
  accessibility: [
    '语义化 <ul role="tree"> 配合 <li role="treeitem"> 元素',
    '嵌套子项使用 <ul role="group">',
    '有子项的元素设置 aria-expanded',
    'aria-labelledby 将标题元素与树关联',
    '选中项设置 aria-selected',
    '禁用项设置 aria-disabled',
    '折叠切换按钮带有 aria-label="Toggle children"',
    '交互式项目可通过 Tab 键获得焦点',
  ],
  theming: {
    targets: [
      {className: 'xds-tree-list', visualProps: ['density']},
      {className: 'xds-tree-list-item', states: ['selected', 'disabled']},
    ],
  },
  notes: [
    '数据驱动模式：与使用 children 组合的 XDSList 不同，XDSTreeList 接受 items 数组。这避免了 cloneElement，使组件能在渲染时计算位置数据（nestedLevel、isLast、ancestorsIsLast）。',
    '展开控制：展开状态在内部管理。通过在数据中设置 isExpanded: true 来设定初始状态。',
    '性能：通过 key={id} 进行 React 协调意味着展开节点只会导致该子树的 DOM 更新。具有稳定 key 和相同 props 的兄弟节点会被 React 跳过。',
  ],
  components: [
    {
      name: 'XDSTreeList',
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Data-driven tree list for hierarchical data w/ expand/collapse, branch lines, interactive items. Flat items array w/ recursive children, no composition, no cloneElement.',
  features: [
    'Data-driven API; items array w/ recursive children',
    'Internal expansion state; seed via isExpanded per item',
    'Branch connector lines w/ center/top alignment',
    'Density variants: compact, balanced, spacious',
    'Interactive items via invisible button or anchor pattern',
    'Start + end content slots (icon, avatar, badge)',
    'Optional header via aria-labelledby',
    'No context for positional data; computed at render time',
  ],
  accessibility: [
    'Semantic <ul role="tree"> w/ <li role="treeitem">',
    '<ul role="group"> for nested children',
    'aria-expanded on items w/ children',
    'aria-labelledby links header to tree',
    'aria-selected on selected items',
    'aria-disabled on disabled items',
    'Chevron toggle btn w/ aria-label="Toggle children"',
    'Interactive items keyboard-focusable via Tab',
  ],
  notes: [
    'Data-driven: accepts items array (not children composition), avoids cloneElement, computes positional data at render time.',
    'Expansion managed internally. Seed initial state via isExpanded: true on items.',
    'Perf: key={id} reconciliation means expanding node only updates that subtree.',
  ],
  propDescriptions: {
    items: 'Recursive tree item data w/ id, label, optional children + isExpanded.',
    density: 'Spacing density for items.',
    header: 'Header content, linked to tree via aria-labelledby.',
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
  components: [
    {
      name: 'XDSTreeList',
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
