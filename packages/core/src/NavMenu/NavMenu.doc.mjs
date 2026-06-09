// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NavHeadingMenu',
  displayName: 'Nav Heading Menu',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
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
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Accessible menu container + items for nav heading popovers. XDSNavHeadingMenu = role="menu" w/ keyboard nav; XDSNavHeadingMenuItem renders selectable items.',
  usage: {
    description:
      'Accessible menu container + items for nav heading popovers. XDSNavHeadingMenu provides role="menu" w/ keyboard navigation; XDSNavHeadingMenuItem renders individual selectable items. Pass as menu prop of XDSSideNavHeading or XDSTopNavHeading.',
  },
  propDescriptions: {
    size: 'controls min-width + item padding',
    minWidth: 'minimum width override',
  },
};
