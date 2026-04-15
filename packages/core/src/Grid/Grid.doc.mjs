/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Grid',
  description: 'CSS Grid-based layout with responsive auto-fit support.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSGrid columns={3}><div>1</div><div>2</div><div>3</div></XDSGrid>',
  },
  keywords: ["grid","columns","responsive","auto-fit","masonry","tiles","row","col","simplegrid"],
  features: [
    'Fixed-column grids via the `columns` prop',
    'Responsive auto-fit columns via `minChildWidth` — items wrap based on available space',
    'Combine `minChildWidth` and `columns` to cap the maximum number of columns',
    'Gap tokens via `SpacingScale` values for `gap`, `rowGap`, and `columnGap`',
    'Vertical and horizontal item alignment via `align` and `justify`',
    'XDSGridSpan lets individual items span multiple columns or rows',
    'Theming support — override root styles via the `grid` component key',
  ],
  theming: {
    targets: [
      {className: 'xds-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'xds-grid-span'},
    ],
  },
  notes: [
    'Use XDSGrid for any grid layout instead of manual CSS grid (`display: "grid"`, `gridTemplateColumns`). It handles gap tokens and works with any column count.',
  ],
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
  usage: {
    summary: 'CSS Grid-based layout with responsive auto-fit support.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Grid',
  description: '基于 CSS Grid 的布局组件，支持响应式自动适配。',
  features: [
    '通过 `columns` 属性实现固定列网格',
    '通过 `minChildWidth` 实现响应式自动适配列 - 项目根据可用空间自动换行',
    '组合 `minChildWidth` 和 `columns` 来限制最大列数',
    '通过 `SpacingScale` 值为 `gap`、`rowGap` 和 `columnGap` 设置间距令牌',
    '通过 `align` 和 `justify` 实现垂直和水平项对齐',
    'XDSGridSpan 允许单个项跨越多列或多行',
    '主题支持 - 通过 `grid` 组件键覆盖根样式',
  ],
  theming: {
    targets: [
      {className: 'xds-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'xds-grid-span'},
    ],
  },
  notes: [
    '对于任何网格布局，请使用 XDSGrid 代替手动 CSS grid（`display: "grid"`、`gridTemplateColumns`）。它处理间距令牌并支持任意列数。',
  ],
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'CSS Grid-based layout w/ responsive auto-fit support.',
  features: [
    'Fixed-column grids via columns prop',
    'Responsive auto-fit columns via minChildWidth; items wrap based on available space',
    'Combine minChildWidth + columns to cap max columns',
    'Gap tokens via SpacingScale for gap, rowGap, columnGap',
    'Vertical + horizontal item alignment via align + justify',
    'XDSGridSpan lets items span multiple columns/rows',
    'Theming support; override root styles via grid component key',
  ],
  notes: [
    'Use XDSGrid for any grid layout instead of manual CSS grid. Handles gap tokens w/ any column count.',
  ],
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
