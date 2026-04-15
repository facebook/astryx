/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DropdownMenu',
  description:
    'A dropdown menu component for displaying actionable items in a popup menu.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSDropdownMenu trigger={<button>Menu</button>} items={[{label: "Edit"}]} />',
  },
  keywords: ["dropdown","menu","popover","select","actions","contextmenu","overflow","kebab","menubutton"],
  features: [
    'Button customization: Customize the trigger button via the `button` prop (supports all XDSButton props)',
    'Data-driven items: Pass items via the `items` prop with support for sections and dividers',
    'Controlled/Uncontrolled: Supports both controlled (`isMenuOpen`/`onOpenChange`) and uncontrolled modes',
    'Custom menu width: Override default width (matches button) via `menuWidth` prop',
    'Sections: Group related items with optional headers using `XDSDropdownMenuSection`',
    'Keyboard navigation: Full keyboard support (Arrow keys, Home, End, Enter, Space, Escape)',
    'Accessibility: Proper ARIA roles (menu, menuitem) and attributes',
    'Custom rendering: Optional `children` render function with `XDSDropdownMenuItem` helper',
  ],
  theming: {
    targets: [
      {className: 'xds-dropdown-menu'},
      {className: 'xds-dropdown-menu-item'},
    ],
    vars: [
      {name: '--dropdown-radius', description: 'Border radius of the menu popup', default: 'var(--radius-element)'},
      {name: '--dropdown-padding', description: 'Inner padding of the menu popup', default: 'var(--spacing-1)'},
    ],
  },
  keyboard:
    'Arrow keys navigate items, Home/End jump to first/last, Enter/Space select, Escape closes the menu',
  accessibility: [
    'Uses proper ARIA roles: `menu` on the popup container, `menuitem` on each item',
    'Focus returns to the trigger button when the menu closes',
    'Keyboard navigation automatically skips disabled items',
  ],
  notes: [
    'Uses `useXDSLayer` with `mode: "context"` for CSS anchor positioning',
    'Uses `XDSButton` internally — chevron is passed via `endContent` and auto-hidden when `isIconOnly` is true',
    'Items are tracked via the `items` prop to enable keyboard navigation',
    'Light dismiss is enabled by default (clicking outside closes menu)',
  ],
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
            'Menu items, dividers, or sections to display in the popup.',
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
          description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSDropdownMenuItemData',
      description:
        'Data shape for a single actionable menu item passed via the `items` prop.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Display label for the item.',
          required: true,
        },
        {
          name: 'onClick',
          type: '() => void',
          description: 'Callback fired when the item is selected.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the item is disabled; disabled items are skipped during keyboard navigation.',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon to display before the item label.',
        },
      ],
    },
    {
      name: 'XDSDropdownMenuDivider',
      description:
        'A visual divider that can be placed between items in the `items` array.',
      props: [
        {
          name: 'type',
          type: "'divider'",
          description:
            'Discriminant value that identifies this entry as a divider.',
          required: true,
        },
      ],
    },
    {
      name: 'XDSDropdownMenuSection',
      description:
        'A labeled group of items that can be placed in the `items` array.',
      props: [
        {
          name: 'type',
          type: "'section'",
          description:
            'Discriminant value that identifies this entry as a section.',
          required: true,
        },
        {
          name: 'title',
          type: 'string',
          description:
            'Optional header text displayed above the section items.',
        },
        {
          name: 'items',
          type: 'XDSDropdownMenuItemData[]',
          description: 'The actionable items that belong to this section.',
          required: true,
        },
      ],
    },
  ],
  usage: {
    summary: 'Shows options for actions in a dropdown list.',
    content: `## When to use

- To present different action options as a next step in a process.
- As sub-navigation to guide users to a next destination.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'DropdownMenu',
  description:
    '用于在弹出菜单中显示可操作项的下拉菜单组件。',
  features: [
    '按钮自定义：通过 `button` 属性自定义触发按钮（支持所有 XDSButton 属性）',
    '数据驱动项：通过 `items` 属性传递菜单项，支持分组和分隔线',
    '受控/非受控：同时支持受控（`isMenuOpen`/`onOpenChange`）和非受控模式',
    '自定义菜单宽度：通过 `menuWidth` 属性覆盖默认宽度（默认与按钮同宽）',
    '分组：使用 `XDSDropdownMenuSection` 将相关项分组并显示可选标题',
    '键盘导航：完整的键盘支持（方向键、Home、End、Enter、Space、Escape）',
    '无障碍：正确的 ARIA 角色（menu、menuitem）和属性',
    '自定义渲染：可选的 `children` 渲染函数，配合 `XDSDropdownMenuItem` 辅助组件',
  ],
  theming: {
    targets: [
      {className: 'xds-dropdown-menu'},
      {className: 'xds-dropdown-menu-item'},
    ],
    vars: [
      {name: '--dropdown-radius', description: 'Border radius of the menu popup', default: 'var(--radius-element)'},
      {name: '--dropdown-padding', description: 'Inner padding of the menu popup', default: 'var(--spacing-1)'},
    ],
  },
  keyboard:
    '方向键导航菜单项，Home/End 跳转到首项/末项，Enter/Space 选择，Escape 关闭菜单',
  accessibility: [
    '使用正确的 ARIA 角色：弹出容器上使用 `menu`，每个菜单项使用 `menuitem`',
    '菜单关闭时焦点返回到触发按钮',
    '键盘导航自动跳过禁用的菜单项',
  ],
  notes: [
    '使用 `useXDSLayer` 配合 `mode: "context"` 进行 CSS 锚点定位',
    '内部使用 `XDSButton`——chevron 通过 `endContent` 传递，图标按钮自动隐藏',
    '通过 `items` 属性跟踪菜单项以启用键盘导航',
    '默认启用轻量关闭（点击外部关闭菜单）',
  ],
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
            '在弹出菜单中显示的菜单项、分隔线或分组。',
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
    {
      name: 'XDSDropdownMenuItemData',
      description:
        '通过 `items` 属性传递的单个可操作菜单项的数据结构。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '菜单项的显示标签。',
          required: true,
        },
        {
          name: 'onClick',
          type: '() => void',
          description: '选择该菜单项时触发的回调。',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '菜单项是否禁用；禁用的项在键盘导航时会被跳过。',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: '显示在菜单项标签前的图标。',
        },
      ],
    },
    {
      name: 'XDSDropdownMenuDivider',
      description:
        '可放置在 `items` 数组中菜单项之间的视觉分隔线。',
      props: [
        {
          name: 'type',
          type: "'divider'",
          description:
            '标识此条目为分隔线的判别值。',
          required: true,
        },
      ],
    },
    {
      name: 'XDSDropdownMenuSection',
      description:
        '可放置在 `items` 数组中的带标签分组。',
      props: [
        {
          name: 'type',
          type: "'section'",
          description:
            '标识此条目为分组的判别值。',
          required: true,
        },
        {
          name: 'title',
          type: 'string',
          description:
            '显示在分组项上方的可选标题文本。',
        },
        {
          name: 'items',
          type: 'XDSDropdownMenuItemData[]',
          description: '属于此分组的可操作菜单项。',
          required: true,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'dropdown menu for actionable items in popup',
  features: [
    'customize trigger button via button prop (all XDSButton props)',
    'data-driven items via items prop w/ sections+dividers',
    'controlled (isMenuOpen/onOpenChange) + uncontrolled modes',
    'custom menu width via menuWidth prop (default matches button)',
    'group related items w/ optional headers via XDSDropdownMenuSection',
    'full keyboard: Arrow keys, Home, End, Enter, Space, Escape',
    'proper ARIA roles (menu, menuitem) + attrs',
    'optional children render fn w/ XDSDropdownMenuItem helper',
  ],
  keyboard: 'Arrow keys=navigate items; Home/End=first/last; Enter/Space=select; Escape=close',
  accessibility: [
    'ARIA roles: menu on popup, menuitem on each item',
    'focus returns to trigger button on menu close',
    'keyboard nav skips disabled items',
  ],
  notes: [
    'uses useXDSLayer w/ mode:"context" for CSS anchor positioning',
    'uses XDSButton internally — chevron via endContent, auto-hidden for icon-only',
    'items tracked via items prop for keyboard nav',
    'light dismiss enabled by default (click outside closes)',
  ],
  components: [
    {
      name: 'XDSDropdownMenu',
      description: 'trigger button + popup item list',
      propDescriptions: {
        button: 'trigger button props (XDSButton props except onClick)',
        items: 'menu items, dividers, or sections in popup',
        isMenuOpen: 'controlled open state',
        onOpenChange: 'callback on open state change',
        menuWidth: 'custom menu width; default matches trigger button',
        onClick: 'trigger button click callback',
        hasChevron: 'show chevron on trigger; false for icon-only triggers',
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
    {
      name: 'XDSDropdownMenuItemData',
      description: 'data shape for single actionable menu item via items prop',
      propDescriptions: {
        label: 'display label',
        onClick: 'callback on selection',
        isDisabled: 'disabled; skipped in keyboard nav',
        icon: 'icon before label',
      },
    },
    {
      name: 'XDSDropdownMenuDivider',
      description: 'visual divider between items in items array',
      propDescriptions: {
        type: 'discriminant identifying entry as divider',
      },
    },
    {
      name: 'XDSDropdownMenuSection',
      description: 'labeled group of items in items array',
      propDescriptions: {
        type: 'discriminant identifying entry as section',
        title: 'optional header text above section items',
        items: 'actionable items in this section',
      },
    },
  ],
};
