/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Grid',
  keywords: ["grid","columns","responsive","auto-fit","masonry","tiles","row","col","simplegrid"],
  usage: {
    description: 'A CSS Grid-based layout component with responsive auto-fit support. Use Grid for any multi-column layout instead of manual CSS grid — it handles gap tokens and responsive column behavior automatically.',
    bestPractices: [
      { guidance: true, description: 'Use minChildWidth for responsive layouts that adapt to container size.' },
      { guidance: true, description: 'Combine minChildWidth and columns to set a maximum column count while still allowing responsive wrapping.' },
      { guidance: false, description: 'Write manual CSS grid styles when Grid already supports your layout — it ensures consistent spacing through design tokens.' },
    ],
  },
  theming: {
    targets: [
      {className: 'xds-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'xds-grid-span'},
    ],
  },
  components: [
    {
      name: 'XDSGrid',
      description: 'Grid container with fixed or responsive auto-fit columns.',
      props: [
        {
          name: 'columns',
          type: 'number',
          description: 'Maximum number of columns.',
        },
        {
          name: 'minChildWidth',
          type: 'number',
          description:
            'Minimum item width in px; enables responsive auto-fit column behaviour.',
        },
        {
          name: 'width',
          type: 'number | string',
          description: 'Container width.',
        },
        {
          name: 'height',
          type: 'number | string',
          description: 'Container height.',
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description: 'Spacing between all items.',
        },
        {
          name: 'rowGap',
          type: 'SpacingStep',
          description: 'Row spacing; overrides `gap` for the row axis.',
        },
        {
          name: 'columnGap',
          type: 'SpacingStep',
          description: 'Column spacing; overrides `gap` for the column axis.',
        },
        {
          name: 'align',
          type: 'GridAlignment',
          description: 'Vertical alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'justify',
          type: 'GridAlignment',
          description: 'Horizontal alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Grid content.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSGridSpan',
      description: 'Grid item that spans multiple columns or rows.',
      props: [
        {
          name: 'columns',
          type: "number | 'full'",
          description: "Columns to span; use `'full'` to span the entire row.",
        },
        {
          name: 'rows',
          type: 'number',
          description: 'Rows to span.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Grid',
  theming: {
    targets: [
      {className: 'xds-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'xds-grid-span'},
    ],
  },
  components: [
    {
      name: 'XDSGrid',
      description: '支持固定列或响应式自动适配列的网格容器。',
      props: [
        {
          name: 'columns',
          type: 'number',
          description: '最大列数。',
        },
        {
          name: 'minChildWidth',
          type: 'number',
          description:
            '项目的最小宽度（px）；启用响应式自动适配列行为。',
        },
        {
          name: 'width',
          type: 'number | string',
          description: '容器宽度。',
        },
        {
          name: 'height',
          type: 'number | string',
          description: '容器高度。',
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description: '所有项目之间的间距。',
        },
        {
          name: 'rowGap',
          type: 'SpacingStep',
          description: '行间距；覆盖行轴方向的 `gap`。',
        },
        {
          name: 'columnGap',
          type: 'SpacingStep',
          description: '列间距；覆盖列轴方向的 `gap`。',
        },
        {
          name: 'align',
          type: 'GridAlignment',
          description: '项目的垂直对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'justify',
          type: 'GridAlignment',
          description: '项目的水平对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '网格内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSGridSpan',
      description: '可跨越多列或多行的网格项。',
      props: [
        {
          name: 'columns',
          type: "number | 'full'",
          description: "要跨越的列数；使用 `'full'` 跨越整行。",
        },
        {
          name: 'rows',
          type: 'number',
          description: '要跨越的行数。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '内容。',
        },
      ],
    },
  ],
  usage: {
    description: 'A CSS Grid-based layout component with responsive auto-fit support. Use Grid for any multi-column layout instead of manual CSS grid — it handles gap tokens and responsive column behavior automatically.',
    bestPractices: [
      { guidance: true, description: 'Use minChildWidth for responsive layouts that adapt to container size.' },
      { guidance: true, description: 'Combine minChildWidth and columns to set a maximum column count while still allowing responsive wrapping.' },
      { guidance: false, description: 'Write manual CSS grid styles when Grid already supports your layout — it ensures consistent spacing through design tokens.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'CSS Grid-based layout w/ responsive auto-fit support.',
  usage: {
    description: 'A CSS Grid-based layout component with responsive auto-fit support. Use Grid for any multi-column layout instead of manual CSS grid — it handles gap tokens and responsive column behavior automatically.',
    bestPractices: [
      { guidance: true, description: 'Use minChildWidth for responsive layouts that adapt to container size.' },
      { guidance: true, description: 'Combine minChildWidth and columns to set a maximum column count while still allowing responsive wrapping.' },
      { guidance: false, description: 'Write manual CSS grid styles when Grid already supports your layout — it ensures consistent spacing through design tokens.' },
    ],
  },
  components: [
    {
      name: 'XDSGrid',
      description: 'Grid container w/ fixed or responsive auto-fit columns.',
      propDescriptions: {
        columns: 'Max number of columns.',
        minChildWidth: 'Min item width in px; enables responsive auto-fit.',
        width: 'Container width.',
        height: 'Container height.',
        gap: 'Spacing between all items.',
        rowGap: 'Row spacing; overrides gap for row axis.',
        columnGap: 'Column spacing; overrides gap for column axis.',
        align: 'Vertical alignment of items.',
        justify: 'Horizontal alignment of items.',
        children: 'Grid content.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSGridSpan',
      description: 'Grid item spanning multiple columns/rows.',
      propDescriptions: {
        columns: "Columns to span; 'full' spans entire row.",
        rows: 'Rows to span.',
        children: 'Content.',
      },
    },
  ],
};
