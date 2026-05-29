// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MetadataList',
  displayName: 'Metadata List',
  group: 'MetadataList',
  category: 'Lists',
  keywords: ["metadata","description","definition","keyvalue","properties","details","attributes","summary"],
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
      displayName: 'Metadata List',
      description:
        'Container for metadata items with column layout, orientation, and collapse support.',      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Metadata items (XDSMetadataListItem components).',
          slotElements: [{__element: 'XDSMetadataListItem', props: {label: 'Key'}, children: 'Value'}],
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
      displayName: 'Metadata List Item',
      description: 'A single labeled metadata value within an XDSMetadataList.',
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
      ],
    },
  ],
  usage: {
    description:
      'MetadataList displays key-value pairs for object attributes like quality, condition, and status, in a structured layout. Use it for detail panels, settings summaries, and record information.',
    bestPractices: [
      { guidance: true, description: 'Choose label position based on content — "start" for short values, "top" for long or complex values.' },
      { guidance: true, description: 'Collapse long lists with `maxNumOfItems` to keep the page scannable.' },
      { guidance: false, description: 'Use for extensive form input — use a form layout instead.' },
      { guidance: false, description: "Use for data that doesn't have a clear key-value structure." },
    ],
    anatomy: [
      {name: 'Title', required: false, description: 'Optional title for the metadata list.'},
      {name: 'Label', required: true, description: 'The key label for each metadata entry.'},
      {name: 'Metadata', required: true, description: 'The value displayed in various formats.'},
      {name: 'Disclosure', required: false, description: 'Collapse/expand control for the list.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSMetadataList',
      displayName: 'Metadata List',
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
      displayName: 'Metadata List Item',
      description: 'XDSMetadataList 中的单个带标签元数据值。',
      propDescriptions: {
        children: '此元数据项的内容值。',
        label: '此元数据项的标签文本。',
        icon: '标签文本前渲染的图标。',
      },
    },
  ],
  usage: {
    description:
      'MetadataList displays key-value pairs for object attributes like quality, condition, and status, in a structured layout. Use it for detail panels, settings summaries, and record information.',
    bestPractices: [
      { guidance: true, description: 'Choose label position based on content — "start" for short values, "top" for long or complex values.' },
      { guidance: true, description: 'Collapse long lists with `maxNumOfItems` to keep the page scannable.' },
      { guidance: false, description: 'Use for extensive form input — use a form layout instead.' },
      { guidance: false, description: "Use for data that doesn't have a clear key-value structure." },
    ],
    anatomy: [
      {name: 'Title', required: false, description: 'Optional title for the metadata list.'},
      {name: 'Label', required: true, description: 'The key label for each metadata entry.'},
      {name: 'Metadata', required: true, description: 'The value displayed in various formats.'},
      {name: 'Disclosure', required: false, description: 'Collapse/expand control for the list.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'label/value metadata display; column layout, collapse, orientation variants',
  usage: {
    description:
      'MetadataList displays key-value pairs for object attributes like quality, condition, and status, in a structured layout. Use it for detail panels, settings summaries, and record information.',
    bestPractices: [
      { guidance: true, description: 'Choose label position based on content — "start" for short values, "top" for long or complex values.' },
      { guidance: true, description: 'Collapse long lists with `maxNumOfItems` to keep the page scannable.' },
      { guidance: false, description: 'Use for extensive form input — use a form layout instead.' },
      { guidance: false, description: "Use for data that doesn't have a clear key-value structure." },
    ],
    anatomy: [
      {name: 'Title', required: false, description: 'Optional title for the metadata list.'},
      {name: 'Label', required: true, description: 'The key label for each metadata entry.'},
      {name: 'Metadata', required: true, description: 'The value displayed in various formats.'},
      {name: 'Disclosure', required: false, description: 'Collapse/expand control for the list.'},
    ],
  },
  components: [
    {
      name: 'XDSMetadataList',
      displayName: 'Metadata List',
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
      displayName: 'Metadata List Item',
      description: 'single labeled value in XDSMetadataList',
      propDescriptions: {
        children: 'value content',
        label: 'label text',
        icon: 'icon before label',
      },
    },
  ],
};
