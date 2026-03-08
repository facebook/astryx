/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Grid',
  description: 'CSS Grid-based layout with responsive auto-fit support.',
  features: [
    'Fixed-column grids via the `columns` prop',
    'Responsive auto-fit columns via `minChildWidth` — items wrap based on available space',
    'Combine `minChildWidth` and `columns` to cap the maximum number of columns',
    'Gap tokens via `SpacingScale` values for `gap`, `rowGap`, and `columnGap`',
    'Vertical and horizontal item alignment via `align` and `justify`',
    'XDSGridSpan lets individual items span multiple columns or rows',
    'Theming support — override root styles via the `grid` component key',
  ],
  examples: [
    {
      label: 'Fixed 3-column grid',
      code: `<XDSGrid columns={3} gap={4}>
  <Item />
  <Item />
  <Item />
</XDSGrid>`,
    },
    {
      label: 'Responsive auto-fit',
      code: `<XDSGrid minChildWidth={200} gap={4}>
  <Card />
  <Card />
  <Card />
</XDSGrid>`,
    },
    {
      label: 'Auto-fit with max columns cap',
      code: `<XDSGrid minChildWidth={200} columns={4} gap={4}>
  <Card />
</XDSGrid>`,
    },
    {
      label: 'Grid item spanning multiple columns',
      code: `<XDSGrid columns={3} gap={4}>
  <XDSGridSpan columns={2}>Wide item</XDSGridSpan>
  <div>Normal item</div>
</XDSGrid>`,
    },
    {
      label: 'Dense grid (e.g. color swatches, icon grids, compact controls)',
      code: `<XDSGrid columns={6} gap={2}>
  {items.map(item => (
    <XDSButton key={item.id} label={item.label} icon={item.icon} variant="ghost" size="sm" />
  ))}
</XDSGrid>`,
    },
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
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSGrid columns={3} gap={4}>
  <Item />
  <Item />
  <Item />
</XDSGrid>`,
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
      examples: [
        {
          label: 'Spanning two columns',
          code: `<XDSGrid columns={3} gap={4}>
  <XDSGridSpan columns={2}>Wide item</XDSGridSpan>
  <div>Normal item</div>
</XDSGrid>`,
        },
      ],
    },
  ],
};
