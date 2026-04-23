/** @type {import('../docs-types').ComponentDoc} */
export default {
  name: 'XDSClickableCard',
  description:
    'An interactive card that acts as a single navigation or action target. ' +
    'Nested interactive elements (buttons, links) work independently.',
  container: true,
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Accessibility label for the card.',
    },
    onClick: {
      type: '(event: MouseEvent) => void',
      description:
        'Click handler. Fires when the card surface is clicked, not when nested interactive elements are clicked.',
    },
    href: {
      type: 'string',
      description: 'Navigation URL. Ctrl/Cmd+click opens in a new tab.',
    },
    target: {
      type: 'string',
      default: '_self',
      description: 'Link target for href navigation.',
    },
    isDisabled: {
      type: 'boolean',
      default: false,
      description: 'Disables the card.',
    },
    children: {
      type: 'ReactNode',
      description:
        'Card content. Can include nested buttons/links that work independently.',
    },
    padding: {
      type: 'SpacingStep',
      default: 4,
      description: 'Inner padding using the spacing scale.',
    },
    variant: {
      type: "'default' | 'transparent' | 'muted'",
      default: 'default',
      description: 'Background color variant.',
    },
    width: {type: 'SizeValue', description: 'Card width.'},
    height: {type: 'SizeValue', description: 'Card height.'},
    maxWidth: {type: 'SizeValue', description: 'Maximum card width.'},
  },
  examples: [
    {
      title: 'Navigation card',
      code: `<XDSClickableCard label="Settings" href="/settings">
  <XDSText weight="bold">Settings</XDSText>
  <XDSText color="secondary">Manage your preferences</XDSText>
</XDSClickableCard>`,
    },
    {
      title: 'Action card with nested button',
      code: `<XDSClickableCard label="Product" href="/product/123">
  <XDSText weight="bold">Product Name</XDSText>
  <XDSButton label="Add to cart" onClick={handleAddToCart} />
</XDSClickableCard>`,
    },
  ],
  seeAlso: ['XDSCard', 'XDSSelectableCard'],
};
