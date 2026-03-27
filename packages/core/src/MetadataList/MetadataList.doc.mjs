/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MetadataList',
  description:
    'A read-only labeled list for displaying key-value metadata. Semantic equivalent of HTML <dl>/<dt>/<dd> with layout control, column modes, and consistent styling. Uses a composition model: XDSMetadataList wraps XDSMetadataListItem sub-components.',
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
