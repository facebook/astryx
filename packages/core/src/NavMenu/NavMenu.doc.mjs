/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NavHeadingMenu',
  hidden: false,
  keywords: ['nav', 'menu', 'navigation', 'heading', 'menu-item', 'popover'],
  usage: {
    description:
      'Accessible menu container and items for nav heading popovers. ' +
      'XDSNavHeadingMenu provides role="menu" with keyboard navigation; ' +
      'XDSNavHeadingMenuItem renders individual selectable items. ' +
      'Pass as the menu prop of XDSSideNavHeading or XDSTopNavHeading.',
  },
  props: [
    {name: 'children', type: 'ReactNode', required: true, description: 'Menu items.'},
    {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls min-width and item padding.'},
    {name: 'minWidth', type: 'number | string', description: 'Minimum width override.'},
  ],
};
