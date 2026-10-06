// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Group',
  isHiddenFromOverview: true,
  playground: {
    // A standalone group has no required props, so the properties-tab preview
    // would render an empty box. Seed a title so the heading shows.
    defaults: {title: 'Version history'},
  },
  description:
    'A titled group of rows in a compound menu. Renders role="group" named by its heading; the heading is plain text, not a menuitem, so arrow keys and typeahead skip it. The data-driven equivalent is the `{type: "section", title, items}` entry in `items`; the heading shares its typography and theme target.',
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        "Heading shown above the rows and used as the group's accessible name. Omit for an unnamed group.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The rows of the group: DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuSubMenu.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles applied to the group wrapper. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-dropdown-menu-section-heading'}],
  },
};

export const docsDense = {
  name: 'DropdownMenuGroup',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Group',
  description:
    'titled role="group" of rows for compound menus; compound peer of the data API\'s {type: "section"}',
  propDescriptions: {
    title: 'heading above the rows; names the group',
    children: 'the rows of the group',
    xstyle: 'StyleX styles applied to the group wrapper',
  },
};
