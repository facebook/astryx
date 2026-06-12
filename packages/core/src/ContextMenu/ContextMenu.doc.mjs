// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ContextMenu',
  displayName: 'Context Menu',
  group: 'ContextMenu',
  category: 'Action',
  isHiddenFromOverview: true,
  keywords: ["contextmenu","right-click","menu","popover","actions","context"],
  theming: {
    targets: [
      {className: 'xds-context-menu'},
    ],
    vars: [
      {name: '--_dropdown-menu-radius', description: 'Border radius of the menu popup', default: 'var(--radius-container)', private: true},
      {name: '--_dropdown-menu-padding', description: 'Inner padding of the menu popup', default: 'var(--spacing-1)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  description: 'A context menu that appears on right-click at the cursor position. Wraps trigger content as children.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The trigger area — right-click on this content to open the menu.',
      required: true,
    },
    {
      name: 'items',
      type: 'XDSContextMenuOption[]',
      description: 'Array of menu entries. Each entry is one of: an action item `{label, onClick?, icon?, isDisabled?}`, a divider `{type: "divider"}`, or a section `{type: "section", title?, items: [...action items]}`.',
      required: true,
    },
    {
      name: 'menuContent',
      type: 'ReactNode',
      description: 'Custom JSX menu content for compound mode. Use instead of items for dynamic or stateful menus.',
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description: 'Custom menu width.',
      default: "'160px'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of menu items — controls padding density.',
      default: "'md'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Whether to auto-focus the first menu item when the menu opens. Set to false for inline showcases.',
      default: 'true',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'When true, right-click shows the native browser context menu instead.',
      default: 'false',
    },
  ],
  components: [
    {name: 'XDSContextMenuItem'},
  ],
  usage: {
    description: 'A right-click context menu that appears at the cursor position. Use to provide contextual actions for specific elements or regions without cluttering the UI with visible buttons.',
    bestPractices: [
      { guidance: true, description: 'Keep menu items concise and action-oriented; users expect quick access to contextual actions.' },
      { guidance: true, description: 'Use sections and dividers to group related actions when the menu has many items.' },
      { guidance: true, description: 'Ensure all context menu actions are also accessible via other UI elements for keyboard-only users.' },
      { guidance: false, description: 'Use a ContextMenu as the only way to access important actions; not all users know to right-click.' },
      { guidance: false, description: 'Place more than 10–12 items in a single menu without grouping them into sections.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: '右键点击时在光标位置出现的上下文菜单。用于为特定元素或区域提供上下文操作，而不使 UI 杂乱。',
    bestPractices: [
      { guidance: true, description: '保持菜单项简洁和面向操作。' },
      { guidance: true, description: '有很多项时使用分组和分隔线。' },
      { guidance: true, description: '确保所有上下文菜单操作也可通过其他 UI 元素访问。' },
      { guidance: false, description: '将上下文菜单作为访问重要操作的唯一方式。' },
      { guidance: false, description: '在单个菜单中放置超过 10-12 个项而不分组。' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'right-click context menu at cursor position',
  usage: {
    description: 'A right-click context menu that appears at the cursor position. Use to provide contextual actions for specific elements or regions.',
    bestPractices: [
      { guidance: true, description: 'Keep items concise and action-oriented.' },
      { guidance: true, description: 'Group related actions with sections and dividers.' },
      { guidance: true, description: 'Ensure actions are also accessible via other UI elements.' },
      { guidance: false, description: 'Use as the only way to access important actions.' },
      { guidance: false, description: 'Place more than 10–12 items without grouping.' },
    ],
  },
};
