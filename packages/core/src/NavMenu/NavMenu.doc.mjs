/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NavMenuItem',
  hidden: false,
  keywords: ['nav', 'menu', 'navigation', 'menu-item'],
  usage: {
    description: 'Menu item used within navigation components like SideNav and TopNav.',
  },
  props: [
    {name: 'icon', type: 'XDSIconType', description: 'Icon displayed before the label.'},
    {name: 'label', type: 'ReactNode', required: true, description: 'Primary label text.'},
    {name: 'description', type: 'ReactNode', description: 'Secondary description below the label.'},
    {name: 'href', type: 'string', description: 'URL to navigate to. Renders as an anchor.'},
    {name: 'onClick', type: '() => void', description: 'Callback when the item is selected.'},
    {name: 'isDisabled', type: 'boolean', default: 'false', description: 'Whether the item is disabled.'},
  ],
};
