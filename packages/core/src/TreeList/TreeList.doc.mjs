/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TreeList',
  description:
    'Data-driven tree list component for rendering hierarchical data with expand/collapse, branch lines, and interactive items. Uses a flat items array with recursive children — no composition, no cloneElement.',
  features: [
    'Data-driven API — items array with recursive children',
    'Internal expansion state — seed via isExpanded on each item',
    'Branch connector lines with center/top alignment',
    'Density variants: compact, balanced, spacious',
    'Interactive items via invisible button or anchor pattern',
    'Start and end content slots (icon, avatar, badge)',
    'Optional header associated via aria-labelledby',
    'No context for positional data — computed at render time',
  ],
  examples: [
    {
      label: 'Basic tree',
      code: `<XDSTreeList
  items={[
    { id: 'src', label: 'src', isExpanded: true, children: [
      { id: 'app', label: 'App.tsx' },
      { id: 'index', label: 'index.tsx' },
    ]},
    { id: 'pkg', label: 'package.json' },
  ]}
/>`,
    },
    {
      label: 'With icons and header',
      code: `<XDSTreeList
  header={<strong>Project Files</strong>}
  density="compact"
  items={[
    { id: 'src', label: 'src', isExpanded: true, startContent: <FolderIcon />, children: [
      { id: 'app', label: 'App.tsx', startContent: <FileIcon /> },
    ]},
  ]}
/>`,
    },
    {
      label: 'Interactive items',
      code: `<XDSTreeList
  items={[
    { id: 'settings', label: 'Settings', onClick: () => navigate('/settings') },
    { id: 'docs', label: 'Docs', href: '/docs', target: '_blank' },
  ]}
/>`,
    },
  ],
  accessibility: [
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
      {className: 'xds-tree-list', visualProps: ['density', 'branchAlignment']},
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
        'Tree list container. Accepts items data and rendering configuration. Expansion state is managed internally.',
      examples: [
        {
          label: 'Basic tree',
          code: `<XDSTreeList
  items={[
    { id: 'src', label: 'src', isExpanded: true, children: [
      { id: 'app', label: 'App.tsx' },
    ]},
    { id: 'pkg', label: 'package.json' },
  ]}
/>`,
        },
      ],
      props: [
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
          name: 'branchAlignment',
          type: "'center' | 'top'",
          description: 'Where branch lines connect to items.',
          default: "'center'",
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
};
