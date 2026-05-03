/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DropdownMenu',
  group: 'DropdownMenu',
  keywords: ["dropdown","menu","popover","select","actions","contextmenu","overflow","kebab","menubutton"],
  theming: {
    targets: [
      {className: 'xds-dropdown-menu'},
      {className: 'xds-dropdown-menu-item'},
    ],
    vars: [
      {name: '--_dropdown-menu-radius', description: 'Border radius of the menu popup', default: 'var(--radius-element)', private: true},
      {name: '--_dropdown-menu-padding', description: 'Inner padding of the menu popup', default: 'var(--spacing-1)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  components: [
    {
      name: 'XDSDropdownMenu',
      description:
        'Main dropdown menu component with a trigger button and popup item list.',
      props: [
        {
          name: 'button',
          type: 'XDSDropdownMenuButtonProps',
          description:
            'Props for the trigger button (XDSButton props except onClick).',
          default: "{ label: 'Menu' }",
        },
        {
          name: 'items',
          type: 'XDSDropdownMenuOption[]',
          description:
            'Array of menu entries. Each entry is one of: an action item `{label, onClick?, icon?, isDisabled?}`, a divider `{type: "divider"}`, or a section `{type: "section", title?, items: [...action items]}`.',
          required: true,
        },
        {
          name: 'isMenuOpen',
          type: 'boolean',
          description: 'Controlled open state for the menu.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback fired when the open state changes.',
        },
        {
          name: 'menuWidth',
          type: 'number | string',
          description:
            'Custom menu width; defaults to matching the trigger button width.',
        },
        {
          name: 'onClick',
          type: '() => void',
          description: 'Callback fired when the trigger button is clicked.',
        },
        {
          name: 'hasChevron',
          type: 'boolean',
          description: 'Whether to show a chevron icon on the trigger button. Set to false for icon-only triggers.',
          default: 'true',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Whether to auto-focus the first menu item when the menu opens. Set to false for inline showcases or documentation previews.',
          default: 'true',
        },
        {
          name: 'children',
          type: '(item: XDSDropdownMenuItemData) => ReactNode',
          description: 'Custom render function for each item in the list.',
        },
      ],    },
    {
      name: 'XDSDropdownMenuItem',
      description:
        'Helper component for custom item rendering with consistent styling.',
      props: [
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon to display before the label. See `npx xds docs icons` for valid semantic names.',
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
          description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
  ],
  usage: {
    description: 'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      { guidance: true, description: 'Keep menu items concise and action-oriented so users can scan options quickly.' },
      { guidance: true, description: 'Use sections and dividers to group related actions when the menu has many items.' },
      { guidance: false, description: 'Use a DropdownMenu for navigation — use a navigation component instead.' },
      { guidance: false, description: 'Place more than 10–12 items in a single menu without grouping them into sections.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'DropdownMenu',
  theming: {
    targets: [
      {className: 'xds-dropdown-menu'},
      {className: 'xds-dropdown-menu-item'},
    ],
    vars: [
      {name: '--_dropdown-menu-radius', description: 'Border radius of the menu popup', default: 'var(--radius-element)', private: true},
      {name: '--_dropdown-menu-padding', description: 'Inner padding of the menu popup', default: 'var(--spacing-1)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  components: [
    {
      name: 'XDSDropdownMenu',
      description:
        '主下拉菜单组件，包含触发按钮和弹出项列表。',
      props: [
        {
          name: 'button',
          type: 'XDSDropdownMenuButtonProps',
          description:
            '触发按钮的属性（XDSButton 属性，不含 onClick）。',
          default: "{ label: 'Menu' }",
        },
        {
          name: 'items',
          type: 'XDSDropdownMenuOption[]',
          description:
            '菜单项数组。每项为：操作项 `{label, onClick?, icon?, isDisabled?}`、分隔线 `{type: "divider"}`、或分组 `{type: "section", title?, items: [...操作项]}`。',
          required: true,
        },
        {
          name: 'isMenuOpen',
          type: 'boolean',
          description: '菜单的受控打开状态。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '打开状态变化时触发的回调。',
        },
        {
          name: 'menuWidth',
          type: 'number | string',
          description:
            '自定义菜单宽度；默认与触发按钮同宽。',
        },
        {
          name: 'onClick',
          type: '() => void',
          description: '点击触发按钮时触发的回调。',
        },
        {
          name: 'hasChevron',
          type: 'boolean',
          description: '是否在触发按钮上显示展开箭头。仅图标触发器设为 false。',
          default: 'true',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: '菜单打开时是否自动聚焦第一个菜单项。内联展示或文档预览设为 false。',
          default: 'true',
        },
        {
          name: 'children',
          type: '(item: XDSDropdownMenuItemData) => ReactNode',
          description: '列表中每个项的自定义渲染函数。',
        },
      ],
    },
    {
      name: 'XDSDropdownMenuItem',
      description:
        '用于自定义项渲染的辅助组件，提供一致的样式。',
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
          description:
            '在标签和描述之后渲染的附加内容。',
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
    description: 'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      { guidance: true, description: 'Keep menu items concise and action-oriented so users can scan options quickly.' },
      { guidance: true, description: 'Use sections and dividers to group related actions when the menu has many items.' },
      { guidance: false, description: 'Use a DropdownMenu for navigation — use a navigation component instead.' },
      { guidance: false, description: 'Place more than 10–12 items in a single menu without grouping them into sections.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'dropdown menu for actionable items in popup',
  usage: {
    description: 'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      { guidance: true, description: 'Keep menu items concise and action-oriented so users can scan options quickly.' },
      { guidance: true, description: 'Use sections and dividers to group related actions when the menu has many items.' },
      { guidance: false, description: 'Use a DropdownMenu for navigation — use a navigation component instead.' },
      { guidance: false, description: 'Place more than 10–12 items in a single menu without grouping them into sections.' },
    ],
  },
  components: [
    {
      name: 'XDSDropdownMenu',
      description: 'trigger button + popup item list',
      propDescriptions: {
        button: 'trigger button props (XDSButton props except onClick)',
        items: 'array of menu entries: action item {label, onClick?, icon?, isDisabled?}, divider {type: "divider"}, or section {type: "section", title?, items: [...]}',
        isMenuOpen: 'controlled open state',
        onOpenChange: 'callback on open state change',
        menuWidth: 'custom menu width; default matches trigger button',
        onClick: 'trigger button click callback',
        hasChevron: 'show chevron on trigger; false for icon-only triggers',
        hasAutoFocus: 'auto-focus first item on open; false for showcases',
        children: 'custom render fn per item',
      },
    },
    {
      name: 'XDSDropdownMenuItem',
      description: 'helper for custom item rendering w/ consistent styling',
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
