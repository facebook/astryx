/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  description: 'Card container component with elevation and themed styling.',
  features: [
    'Top-level container for elevated content',
    'Provides card-specific appearance: background, shadow, and border-radius',
    'Sets CSS variables for child layout components',
    'Supports optional full-bleed mode to remove internal padding for edge-to-edge content',
    'Composable with XDSLayout, XDSCollapsible, and XDSCollapsibleGroup',
  ],
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Width of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: 'Height of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the card.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum height of the card.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the card.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: 'Internal padding using the spacing scale.',
      default: '4',
    },
  ],
  examples: [
    {
      label: 'Basic card with layout',
      code: `<XDSCard width={400} height={300}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>`,
    },
    {
      label: 'Simple content',
      code: `<XDSCard>
  <p>Card content with default padding</p>
</XDSCard>`,
    },
    {
      label: 'Collapsible card',
      code: `<XDSCard>
  <XDSCollapsible trigger="Details">
    <p>This content can be collapsed</p>
  </XDSCollapsible>
</XDSCard>`,
    },
    {
      label: 'Accordion of cards',
      code: `<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap={2}>
    <XDSCard>
      <XDSCollapsible trigger="General" value="general">
        <GeneralSettings />
      </XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Advanced" value="advanced">
        <AdvancedSettings />
      </XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-card'},
    ],
  },
};
