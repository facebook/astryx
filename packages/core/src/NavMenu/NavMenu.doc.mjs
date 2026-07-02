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
      'NavHeadingMenu provides role="menu" with keyboard navigation; ' +
      'NavHeadingMenuItem renders individual selectable items. ' +
      'Pass as the menu prop of SideNavHeading or TopNavHeading.',
  },
  playground: {
    defaults: {
      children: [
        {__element: 'NavHeadingMenuItem', props: {label: 'Dashboard', href: '#'}},
        {__element: 'NavHeadingMenuItem', props: {label: 'Analytics', href: '#'}},
        {__element: 'NavHeadingMenuItem', props: {label: 'Settings', href: '#'}},
      ],
    },
  },
  props: [
    {name: 'children', type: 'ReactNode', required: true, description: 'Menu items.'},
    {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls min-width and item padding.'},
    {name: 'minWidth', type: 'number | string', description: 'Minimum width override.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Accessible menu container + items for nav heading popovers. NavHeadingMenu = role="menu" w/ keyboard nav; NavHeadingMenuItem renders selectable items.',
  usage: {
    description:
      'Accessible menu container + items for nav heading popovers. NavHeadingMenu provides role="menu" w/ keyboard navigation; NavHeadingMenuItem renders individual selectable items. Pass as menu prop of SideNavHeading or TopNavHeading.',
  },
  propDescriptions: {
    size: 'controls min-width + item padding',
    minWidth: 'minimum width override',
  },
};
