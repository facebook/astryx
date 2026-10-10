// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Grid container',
    required: true,
    description:
      'Two-dimensional layout container that arranges caller-supplied items in rows and columns.',
  },
  {
    name: 'Spanning item',
    required: false,
    description:
      "Optional GridSpan wrapper that changes one item's column or row participation.",
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Grid',
  displayName: 'Grid',
  group: 'Layout',
  category: 'Layout',
  keywords: ["grid","columns","responsive","auto-fill","auto-fit","masonry","tiles","row","col","simplegrid","responsive grid","card grid"],
  usage: {
    anatomy,
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Numeric and `{minWidth}` columns reflow to the available width: `columns={3}` shows three columns on a desktop and one on a phone. `{count: N, isFixed: true}` keeps exactly N columns.',
    bestPractices: [
      { guidance: true, description: '`columns={N}` means *at most* N columns: the grid keeps N equal columns while each can stay at least 12rem wide and drops to fewer — one full-width column on a phone — when the container is narrower. No breakpoint props are needed.' },
      { guidance: true, description: 'Use `columns={{count: N, isFixed: true}}` only for small tiles that must stay side by side at every width (a 7-day calendar row, a 2×2 swatch picker).' },
      { guidance: true, description: 'Use `columns={{minWidth, max}}` when the item needs a different minimum than 12rem: `columns={{minWidth: 280, max: 4}}`.' },
      { guidance: true, description: 'Cap the column count with `max` to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `HStack` with wrapping for grids; use Grid instead.' },
      { guidance: true, description: 'Track templates use CSS-variable indirection (not raw inline styles), so `xstyle` overrides of `gridTemplateColumns` (including inside `@media` queries) take effect.' },
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'astryx-grid-span'},
    ],
    vars: [
      {name: '--_grid-span', description: "GridSpan's numeric column span (e.g. `span 2`), read by a class-level grid-column so the placement can change inside the parent grid's container query.", default: 'unset (set only by a numeric span)', private: true},
      {name: '--_grid-span-narrow', description: 'Placement a GridSpan takes when its numeric `columns={N}` grid is too narrow to hold the span: `1 / -1` on those grids, invalid on every other grid so their spans stay exact.', default: 'initial (1 / -1 on numeric columns grids)', private: true},
    ],
  },
  playground: {
    defaults: {
      columns: 3,
      gap: 2,
      children: [
        {__element: 'Card', props: {padding: 4}, children: 'Item 1'},
        {__element: 'Card', props: {padding: 4}, children: 'Item 2'},
        {__element: 'Card', props: {padding: 4}, children: 'Item 3'},
      ],
    },
  },
  description: 'Grid container whose columns reflow to the available width.',
  props: [
    {
      name: 'columns',
      type: "number | {count: number, isFixed?: boolean} | {minWidth: number, max?: number, repeat?: 'fill' | 'fit'}",
      description: 'Column configuration. A number is the maximum column count (e.g. `columns={3}`): columns stay at least 12rem wide, so the grid shows fewer columns in narrow containers and a single full-width column on a phone. `{count: N, isFixed: true}` keeps exactly N columns at every width. Use an object for responsive columns: `minWidth` sets the minimum column width in px, `repeat` controls track behavior (`"fill"` preserves empty tracks for consistent widths, `"fit"` collapses empty tracks so items stretch; defaults to `"fill"`), and `max` caps the maximum number of columns.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Container width. Numbers are treated as pixels, strings are used as-is.',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: 'Container height. Numbers are treated as pixels, strings are used as-is.',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum container width. Numbers are treated as pixels, strings are used as-is.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum container height. Numbers are treated as pixels, strings are used as-is.',
    },
    {
      name: 'gap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: 'Spacing between all items.',
    },
    {
      name: 'rowGap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: 'Row spacing; overrides `gap` for the row axis.',
    },
    {
      name: 'columnGap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: 'Column spacing; overrides `gap` for the column axis.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end' | 'stretch'",
      description: 'Vertical alignment of items.',
      default: "'stretch'",
    },
    {
      name: 'justify',
      type: "'start' | 'center' | 'end' | 'stretch'",
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
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'GridSpan'},
  ],
  examples: [
    {
      label: 'Stat tiles: up to four across, fewer when narrow, one per row on a phone',
      code: `
function StatTiles() {
  const stats = [
    {label: 'Active users', value: '12,480'},
    {label: 'Conversion', value: '4.2%'},
    {label: 'Revenue', value: '$84,210'},
    {label: 'Churn', value: '1.8%'},
  ];
  return (
    // At most 4 columns. Each stays at least 12rem wide, so a 1440px page
    // shows 4, a 768px tablet 3, and a 390px phone 1 full-width tile per row.
    <Grid columns={4} gap={4}>
      {stats.map(stat => (
        <Card key={stat.label} padding={4}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              {stat.label}
            </Text>
            <Heading level={3}>{stat.value}</Heading>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}
`,
    },
    {
      label: 'Week row: seven fixed columns at every width',
      code: `
function WeekRow() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    // Small tiles that must stay side by side opt out of "at most N".
    <Grid columns={{count: 7, isFixed: true}} gap={1}>
      {days.map(day => (
        <Center key={day} paddingBlock={2}>
          <Text type="supporting">{day}</Text>
        </Center>
      ))}
    </Grid>
  );
}
`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    anatomy,
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Numeric and `{minWidth}` columns reflow to the available width: `columns={3}` shows three columns on a desktop and one on a phone. `{count: N, isFixed: true}` keeps exactly N columns.',
    bestPractices: [
      { guidance: true, description: '`columns={N}` means *at most* N columns: the grid keeps N equal columns while each can stay at least 12rem wide and drops to fewer — one full-width column on a phone — when the container is narrower. No breakpoint props are needed.' },
      { guidance: true, description: 'Use `columns={{count: N, isFixed: true}}` only for small tiles that must stay side by side at every width (a 7-day calendar row, a 2×2 swatch picker).' },
      { guidance: true, description: 'Use `columns={{minWidth, max}}` when the item needs a different minimum than 12rem: `columns={{minWidth: 280, max: 4}}`.' },
      { guidance: true, description: 'Cap the column count with `max` to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `HStack` with wrapping for grids; use Grid instead.' },
      { guidance: true, description: 'Track templates use CSS-variable indirection (not raw inline styles), so `xstyle` overrides of `gridTemplateColumns` (including inside `@media` queries) take effect.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'CSS Grid-based layout w/ responsive column support.',
  usage: {
    anatomy,
    description: 'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Numeric and `{minWidth}` columns reflow to the available width: `columns={3}` shows three columns on a desktop and one on a phone. `{count: N, isFixed: true}` keeps exactly N columns.',
    bestPractices: [
      { guidance: true, description: 'columns={N} = at most N cols; drops to fewer when a col would be <12rem (1 col on phone). No breakpoints needed.' },
      { guidance: true, description: 'columns={{count: N, isFixed: true}} = exactly N cols at every width; only for small tiles (calendar row).' },
      { guidance: true, description: 'columns={{minWidth, max}} for a custom minimum: columns={{minWidth: 280, max: 4}}.' },
      { guidance: true, description: 'Cap the column count with max to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use repeat: \'fill\' (the default) for consistent item widths. Use \'fit\' when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use HStack with wrapping for grids; use Grid instead.' },
      { guidance: true, description: 'track templates use CSS-var indirection, not inline styles, so xstyle/@media overrides of gridTemplateColumns work.' },
    ],
  },
};
