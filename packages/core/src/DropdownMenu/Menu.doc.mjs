// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Menu',
  subComponentOf: 'DropdownMenu',
  displayName: 'Menu',
  isHiddenFromOverview: true,
  description:
    'A standalone role="menu" body: roving focus, typeahead, Enter/Space activation, Tab-closes, and the item context provider. No trigger and no layer of its own. DropdownMenu is trigger + layer + Menu. Compose Menu + DropdownMenuSubMenu inside ComplexSelector (popupRole="none") when a selector needs a nested flyout — the submenu opens as its own top-layer element, so it is not clipped by the selector\'s scrolling content box.',
  playground: {
    defaults: {label: 'Models'},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      required: true,
      description: 'Accessible name announced as e.g. "Models menu".',
    },
    {
      name: 'onClose',
      type: '() => void',
      required: true,
      description:
        'Called on Tab (APG menu-button: Tab closes) and provided to items as closeMenu so a leaf selection dismisses the stack.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Menu rows: DropdownMenuItem, DropdownMenuSubMenu, dividers, selectable items.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      default: 'true',
      description:
        'Whether the ancestor layer is open. Focus-on-open runs when this becomes true, not on mount — a menu rendered inside a closed popover is otherwise left unfocusable. Pass ComplexSelector render-state isOpen.',
    },
    {
      name: 'focusOnOpen',
      type: "'item' | 'container' | 'none'",
      default: "'item'",
      description:
        'Where to put focus when isOpen becomes true. item: first enabled item (keyboard). container: the menu itself so no item reads as pre-selected (pointer). none: do not move focus (DropdownMenu owns this itself).',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Item size, forwarded through DropdownMenuContext.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the menu container. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
};

export const docsDense = {
  name: 'Menu',
  isHiddenFromOverview: true,
  displayName: 'Menu',
  description:
    'standalone role=menu body (roving focus, typeahead, Tab-closes) with no trigger and no layer; compose with DropdownMenuSubMenu inside ComplexSelector',
  propDescriptions: {
    label: 'accessible name for the menu',
    onClose: 'Tab closes; items call this to dismiss the stack',
    children: 'DropdownMenuItem, DropdownMenuSubMenu, dividers',
    isOpen:
      'pass ComplexSelector state.isOpen so focus runs after the popup shows',
    focusOnOpen: 'item (keyboard), container (pointer), or none',
    size: 'item size through context',
    xstyle: 'StyleX styles for the menu container',
  },
};
