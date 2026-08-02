// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuSubMenu',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Submenu',
  isHiddenFromOverview: true,
  description:
    'A single menu row that reveals a nested flyout of its own items. The row adopts DropdownMenuItem semantics (label / icon / description / isDisabled); its children become the flyout content. Opens inline-end with viewport auto-flip; Right/Enter/Space opens and focuses the first item, Left/Escape closes and returns focus to the trigger (Right/Left swap in RTL). For data-driven menus, give a menu item a nested `items` array instead of using this component directly.',
  playground: {
    defaults: {label: 'Move to'},
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text for the trigger row.',
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Icon to display before the label. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The flyout menu items: the same components used at the top level (DropdownMenuItem, nested DropdownMenuSubMenu, selectable items).',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'A disabled submenu renders its trigger row but never opens the flyout.',
    },
    {
      name: 'hasSpinner',
      type: 'boolean',
      default: 'false',
      description:
        'Show a spinner in place of the caret, e.g. while a lazy submenu\'s children are loading.',
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description: 'Fixed flyout width. Defaults to sizing to its content (min 160px).',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Called when the flyout opens or closes.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the trigger row. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
};

export const docsDense = {
  name: 'DropdownMenuSubMenu',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Submenu',
  description:
    'menu row that reveals a nested flyout of its own children/items (single component, not Sub/SubTrigger/SubContent)',
  propDescriptions: {
    label: 'primary label text for the trigger row',
    icon: 'icon before label',
    description: 'secondary text below label',
    children: 'flyout menu items (same components as top level)',
    isDisabled: 'renders trigger but never opens',
    hasSpinner: 'spinner instead of caret for async children',
    menuWidth: 'fixed flyout width (default: content, min 160px)',
    onOpenChange: 'called when flyout opens/closes',
    xstyle: 'StyleX styles for the trigger row',
  },
};
