// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ContextMenu',
  displayName: 'Context Menu',
  group: 'ContextMenu',
  category: 'Actions',
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
  components: [
    {
      name: 'XDSContextMenu',
      displayName: 'Context Menu',
      description:
        'A context menu that appears on right-click at the cursor position. Wraps trigger content as children.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'The trigger area — right-click on this content to open the menu.',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSContextMenuOption[]',
          description:
            'Array of menu entries. Each entry is one of: an action item `{label, onClick?, icon?, isDisabled?}`, a divider `{type: "divider"}`, or a section `{type: "section", title?, items: [...action items]}`.',
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
    },
    {
      name: 'XDSContextMenuItem',
      displayName: 'Context Menu Item',
      description:
        'Menu item component for compound mode. Re-exported from XDSDropdownMenuItem for discoverability.',
      props: [
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon to display before the label.',
        },
        {
          name: 'label',
          type: 'ReactNode',
          description: 'Primary label text.',
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
            'Additional content rendered after the label and description.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for layout customization.',
        },
      ],
    },
  ],
  usage: {
    description: 'A right-click context menu that appears at the cursor position. Use to provide contextual actions for specific elements or regions without cluttering the UI with visible buttons.',
    bestPractices: [
      { guidance: true, description: 'Keep menu items concise and action-oriented — users expect quick access to contextual actions.' },
      { guidance: true, description: 'Use sections and dividers to group related actions when the menu has many items.' },
      { guidance: true, description: 'Ensure all context menu actions are also accessible via other UI elements for keyboard-only users.' },
      { guidance: false, description: 'Use a ContextMenu as the only way to access important actions — not all users know to right-click.' },
      { guidance: false, description: 'Place more than 10–12 items in a single menu without grouping them into sections.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'ContextMenu',
  displayName: 'Context Menu',
  theming: {
    targets: [
      {className: 'xds-context-menu'},
    ],
    vars: [
      {name: '--_dropdown-menu-radius', description: '菜单弹出层的圆角', default: 'var(--radius-container)', private: true},
      {name: '--_dropdown-menu-padding', description: '菜单弹出层的内边距', default: 'var(--spacing-1)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  components: [
    {
      name: 'XDSContextMenu',
      displayName: 'Context Menu',
      description:
        '右键点击时在光标位置出现的上下文菜单。将触发内容作为子元素包裹。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '触发区域 — 右键点击此内容以打开菜单。',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSContextMenuOption[]',
          description:
            '菜单项数组。每项为：操作项 `{label, onClick?, icon?, isDisabled?}`、分隔线 `{type: "divider"}`、或分组 `{type: "section", title?, items: [...操作项]}`。',
          required: true,
        },
        {
          name: 'menuContent',
          type: 'ReactNode',
          description: '复合模式的自定义 JSX 菜单内容。',
        },
        {
          name: 'menuWidth',
          type: 'number | string',
          description: '自定义菜单宽度。',
          default: "'160px'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: '菜单项大小 — 控制内边距密度。',
          default: "'md'",
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: '菜单打开时是否自动聚焦第一个菜单项。',
          default: 'true',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '为 true 时，右键显示浏览器原生上下文菜单。',
          default: 'false',
        },
      ],
    },
    {
      name: 'XDSContextMenuItem',
      displayName: 'Context Menu Item',
      description:
        '复合模式的菜单项组件。从 XDSDropdownMenuItem 重新导出以便发现。',
      props: [
        {
          name: 'icon',
          type: 'XDSIconType',
          description: '显示在标签前的图标。',
        },
        {
          name: 'label',
          type: 'ReactNode',
          description: '主标签文本。',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: '显示在标签下方的次要描述文本。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '在标签和描述之后渲染的附加内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: '根容器的 StyleX 样式。',
        },
      ],
    },
  ],
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
  components: [
    {
      name: 'XDSContextMenu',
      displayName: 'Context Menu',
      description: 'right-click trigger + fixed-position popup menu',
      propDescriptions: {
        children: 'trigger area — right-click to open menu',
        items: 'array of menu entries: action item {label, onClick?, icon?, isDisabled?}, divider {type: "divider"}, or section {type: "section", title?, items: [...]}',
        menuContent: 'custom JSX menu content (compound mode)',
        menuWidth: 'custom menu width',
        size: 'menu item size (sm/md/lg)',
        hasAutoFocus: 'auto-focus first item on open; false for showcases',
        isDisabled: 'when true, shows native context menu instead',
      },
    },
    {
      name: 'XDSContextMenuItem',
      displayName: 'Context Menu Item',
      description: 're-exported XDSDropdownMenuItem for compound mode',
      propDescriptions: {
        icon: 'icon before label',
        label: 'primary label text',
        description: 'secondary text below label',
        children: 'additional content after label+description',
        xstyle: 'StyleX styles for root container',
      },
    },
  ],
};
