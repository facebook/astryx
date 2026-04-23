/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Grid',
  group: 'Grid',
  keywords: ["grid","columns","responsive","auto-fill","auto-fit","masonry","tiles","row","col","simplegrid","responsive grid","card grid"],
  usage: {
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.',
    bestPractices: [
      { guidance: true, description: 'Use responsive columns for layouts that should adapt to screen size — `columns={{minWidth: 280}}`.' },
      { guidance: true, description: 'Cap the column count with `max` to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid — Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `XDSHStack` with wrapping for grids — use Grid instead.' },
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
      description: 'Grid container with fixed or responsive columns.',
      props: [
        {
          name: 'columns',
          type: "number | {minWidth: number, max?: number, repeat?: 'fill' | 'fit'}",
          description:
            'Column configuration. Use a number for fixed columns (e.g. `columns={3}`). Use an object for responsive columns: `minWidth` sets the minimum column width in px, `repeat` controls track behavior (`"fill"` preserves empty tracks for consistent widths, `"fit"` collapses empty tracks so items stretch; defaults to `"fill"`), and `max` caps the maximum number of columns.',
        },
        {
          name: 'minChildWidth',
          type: 'number',
          description:
            'Deprecated — use `columns={{minWidth: 280}}` instead. Minimum item width in px; enables responsive auto-fit.',
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
      ],
    },
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
  group: 'Grid',
  theming: {
    targets: [
      {className: 'xds-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'xds-grid-span'},
    ],
  },
  components: [
    {
      name: 'XDSGrid',
      description: '支持固定列或响应式列的网格容器。',
      props: [
        {
          name: 'columns',
          type: "number | {minWidth: number, max?: number, repeat?: 'fill' | 'fit'}",
          description:
            '列配置。使用数字表示固定列（如 `columns={3}`）。使用对象表示响应式列：`minWidth` 设置最小列宽（px），`repeat` 控制轨道行为（`"fill"` 保留空轨道保持一致宽度，`"fit"` 折叠空轨道使项目拉伸；默认为 `"fill"`），`max` 限制最大列数。',
        },
        {
          name: 'minChildWidth',
          type: 'number',
          description: '已弃用 — 请使用 `columns={{minWidth: 280}}` 代替。',
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
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.',
    bestPractices: [
      { guidance: true, description: 'Use responsive columns for layouts that should adapt to screen size — `columns={{minWidth: 280}}`.' },
      { guidance: true, description: 'Cap the column count with `max` to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid — Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `XDSHStack` with wrapping for grids — use Grid instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'CSS Grid-based layout w/ responsive column support.',
  usage: {
    description: 'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.',
    bestPractices: [
      { guidance: true, description: 'Use responsive columns for layouts that should adapt to screen size — columns={{minWidth: 280}}.' },
      { guidance: true, description: 'Cap the column count with max to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use repeat: \'fill\' (the default) for consistent item widths. Use \'fit\' when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid — Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use XDSHStack with wrapping for grids — use Grid instead.' },
    ],
  },


  components: [
    {
      name: 'XDSGrid',
      description: 'Grid container w/ fixed or responsive columns.',
      propDescriptions: {
        columns: "Column config. Number for fixed cols. Object {minWidth, max?, repeat?} for responsive. repeat: 'fill' (default, consistent widths) or 'fit' (stretch).",
        minChildWidth: 'Deprecated — use columns={{minWidth}} instead.',
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
