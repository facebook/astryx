/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MetadataList',
  description:
    'A read-only labeled list for displaying key-value metadata. Semantic equivalent of HTML <dl>/<dt>/<dd> with layout control, column modes, and consistent styling. Uses a composition model: XDSMetadataList wraps XDSMetadataListItem sub-components.',
  keywords: ["metadata","description","definition","keyvalue","properties","details","attributes","summary"],
  features: [
    'Composition model — XDSMetadataList wraps XDSMetadataListItem sub-components',
    'Column modes: single, multi (auto-fill), or fixed number',
    'Label positioning: start (side-by-side) or top (stacked)',
    'Horizontal orientation with flex-wrap',
    'Show more / show less toggle when items exceed maxNumOfItems',
    'Optional title heading above the list',
    'Optional icon before label text',
    'Semantic <dl>/<dt>/<dd> HTML structure',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSMetadataList>
  <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
  <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
</XDSMetadataList>`,
    },
    {
      label: 'Multi-column',
      code: `<XDSMetadataList columns="multi">
  <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
  <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
  <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
  <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
</XDSMetadataList>`,
    },
    {
      label: 'Horizontal',
      code: `<XDSMetadataList orientation="horizontal">
  <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
  <XDSMetadataListItem label="Type">Premium</XDSMetadataListItem>
  <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
</XDSMetadataList>`,
    },
    {
      label: 'With title and show more',
      code: `<XDSMetadataList title={<XDSHeading type="header4">Details</XDSHeading>} maxNumOfItems={3}>
  <XDSMetadataListItem label="Name">Value</XDSMetadataListItem>
  <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
  <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
  <XDSMetadataListItem label="Created">Jan 2026</XDSMetadataListItem>
  <XDSMetadataListItem label="Updated">Mar 2026</XDSMetadataListItem>
</XDSMetadataList>`,
    },
  ],
  accessibility: [
    'Semantic <dl> with <dt>/<dd> pairs',
    'aria-controls links the show more/less button to the list',
    'aria-expanded indicates whether the list is fully expanded',
  ],
  theming: {
    targets: [
      {
        className: 'xds-metadata-list',
        visualProps: ['columns', 'orientation'],
      },
      {className: 'xds-metadata-list-item'},
    ],
  },
  components: [
    {
      name: 'XDSMetadataList',
      description:
        'Container for metadata items with column layout, orientation, and collapse support.',
      examples: [
        {
          label: 'With title',
          code: `<XDSMetadataList title={<strong>Details</strong>} columns="multi">
  <XDSMetadataListItem label="Name">Value</XDSMetadataListItem>
  <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
</XDSMetadataList>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Metadata items (XDSMetadataListItem components).',
          required: true,
        },
        {
          name: 'columns',
          type: "'multi' | 'single' | number",
          description: 'Column layout mode.',
          default: "'single'",
        },
        {
          name: 'label',
          type: "{ position?: 'start' | 'top', width?: number | string }",
          description:
            "Label display configuration. position controls label placement, width sets a custom label column width. Defaults to { position: 'top' } for multi-column layouts.",
          default: "{ position: 'start' } (single-column) / { position: 'top' } (multi-column)",
        },
        {
          name: 'maxNumOfItems',
          type: 'number',
          description:
            'Maximum items to show before collapsing with a show more/less toggle.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          description:
            'Layout orientation. Horizontal mode flows items in a row with flex-wrap.',
          default: "'vertical'",
        },
        {
          name: 'title',
          type: 'ReactNode',
          description: 'Optional title or heading above the list.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSMetadataListItem',
      description: 'A single labeled metadata value within an XDSMetadataList.',
      examples: [
        {
          label: 'With icon',
          code: `<XDSMetadataListItem label="Status" icon={<StatusIcon />}>
  Active
</XDSMetadataListItem>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content value for this metadata item.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description: 'Label text for this metadata item.',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon rendered before the label text.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description: '以标签/值对显示组件元数据，支持列布局、折叠和方向变体。',
  features: [
    '组合模型——XDSMetadataList 包裹 XDSMetadataListItem 子组件',
    '列模式：单列、多列（自动填充）或固定数量',
    '标签位置：start（并排）或 top（堆叠）',
    '水平方向，带 flex-wrap',
    '当项目超出 maxNumOfItems 时显示更多/更少切换',
    '可选标题插槽',
    '标签文本前可选图标',
    '语义化 HTML：带 <dt>/<dd> 对的 <dl>',
  ],
  accessibility: [
    '语义化 <dl>，带 <dt>/<dd> 对',
    'aria-controls 将显示更多/更少按钮链接到列表',
    'aria-expanded 指示列表是否完全展开',
  ],
  components: [
    {
      name: 'XDSMetadataList',
      description: '带列布局、方向和折叠支持的元数据项容器。',
      propDescriptions: {
        children: '元数据项（XDSMetadataListItem 组件）。',
        columns: '列布局模式。',
        label: '标签显示配置。position 控制标签位置，width 设置自定义标签列宽。',
        maxNumOfItems: '折叠前显示的最大项目数。',
        orientation: '布局方向。水平模式使用 flex-wrap 流式排列。',
        title: '列表上方的可选标题。',
        xstyle: '布局自定义的 StyleX 样式，必须是 stylex.create() 值。',
      },
    },
    {
      name: 'XDSMetadataListItem',
      description: 'XDSMetadataList 中的单个带标签元数据值。',
      propDescriptions: {
        children: '此元数据项的内容值。',
        label: '此元数据项的标签文本。',
        icon: '标签文本前渲染的图标。',
      },
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'label/value metadata display; column layout, collapse, orientation variants',
  features: [
    'composition: XDSMetadataList wraps XDSMetadataListItem',
    'columns: single, multi (auto-fill), fixed count',
    'label position: start (side-by-side) or top (stacked)',
    'horizontal orientation w/ flex-wrap',
    'show more/less toggle when items exceed maxNumOfItems',
    'optional title slot',
    'optional icon before label',
    'semantic: <dl> w/ <dt>/<dd> pairs',
  ],
  accessibility: [
    'semantic <dl> w/ <dt>/<dd>',
    'aria-controls links show more/less to list',
    'aria-expanded indicates expand state',
  ],
  components: [
    {
      name: 'XDSMetadataList',
      description: 'metadata container w/ column layout+collapse',
      propDescriptions: {
        children: 'XDSMetadataListItem children',
        columns: 'column mode: single, multi, or fixed count',
        label: 'label config: position (start/top) + width',
        maxNumOfItems: 'max items before collapse',
        orientation: 'vertical or horizontal (flex-wrap)',
        title: 'optional heading above list',
        xstyle: 'StyleX layout styles; stylex.create() only',
      },
    },
    {
      name: 'XDSMetadataListItem',
      description: 'single labeled value in XDSMetadataList',
      propDescriptions: {
        children: 'value content',
        label: 'label text',
        icon: 'icon before label',
      },
    },
  ],
};
