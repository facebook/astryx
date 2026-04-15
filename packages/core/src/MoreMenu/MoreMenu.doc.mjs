/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MoreMenu',
  description:
    'Overflow menu with a three-dot icon trigger. A convenience wrapper that composes an icon-only XDSButton with a dropdown menu, eliminating the boilerplate of wiring up state management, positioning, and accessibility attributes.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSMoreMenu items={[{label: "Edit"}]} />',
  },
  keywords: ["moremenu","overflow","kebab","dotmenu","threedot","ellipsis","dropdown","contextmenu","actionmenu"],
  props: [
    {
      name: 'items',
      type: 'XDSDropdownMenuOption[]',
      description:
        'Menu items — data array of actions, dividers, and sections. Same type as XDSDropdownMenu items prop.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the trigger button (aria-label) and tooltip text.',
      default: "'More options'",
    },
    {
      name: 'variant',
      type: 'XDSButtonVariant',
      description: 'Visual style variant of the trigger button.',
      default: "'ghost'",
    },
    {
      name: 'size',
      type: 'XDSButtonSize',
      description: 'Size of the trigger button.',
      default: "'md'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Override the default three-dot icon. Accepts any ReactNode.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the menu trigger is disabled.',
      default: 'false',
    },
    {
      name: 'children',
      type: '(item: XDSDropdownMenuItemData) => ReactNode',
      description:
        'Custom render function for items. Only called for selectable items (not dividers/sections).',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  features: [
    "Zero-config defaults: three-dot icon, 'More options' label, ghost variant — just pass items",
    'Data-driven items: same items prop as XDSDropdownMenu (items, dividers, sections)',
    'Icon-only trigger: always renders as a square icon button with aria-label',
    'Tooltip: shows label on hover, hidden when menu is open',
    'Custom rendering: optional children render function for custom item content',
  ],
  theming: {
    targets: [
      {className: 'xds-more-menu'},
    ],
  },
  accessibility: [
    'Proper ARIA roles: menu and menuitem on dropdown elements.',
    'Trigger button has aria-haspopup="menu" and aria-expanded.',
    'aria-activedescendant tracks the highlighted menu item.',
    'Disabled items have aria-disabled set.',
    'Sections use role="group" with aria-label.',
  ],
  keyboard:
    'Arrow keys navigate items; Home/End jump to first/last; Enter/Space select highlighted item; Escape closes menu',
  notes: [
    'For full control over trigger rendering or menu content, compose XDSButton + useXDSLayer + XDSDropdownMenuItem directly.',
    'Use XDSMoreMenu for icon-only overflow actions in tight spaces (table rows, card headers). Use XDSDropdownMenu for labeled trigger buttons with chevrons.',
  ],
  usage: {
    summary: 'Overflow menu with a three-dot icon trigger for secondary actions.',
    content: `## When to use

- Presenting secondary or overflow actions in a compact space.
- Actions that don't warrant their own visible button.`,
  },
};
/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'MoreMenu',
  description:
    '带有三点图标触发器的溢出菜单。一个便捷的包装组件，将仅图标的 XDSButton 与下拉菜单组合在一起，省去了手动连接状态管理、定位和无障碍属性的模板代码。',
  props: [
    {
      name: 'items',
      type: 'XDSDropdownMenuOption[]',
      description:
        '菜单项，由操作、分割线和分组组成的数据数组。类型与 XDSDropdownMenu 的 items 属性相同。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '触发按钮的无障碍标签（aria-label）和工具提示文本。',
      default: "'More options'",
    },
    {
      name: 'variant',
      type: 'XDSButtonVariant',
      description: '触发按钮的视觉样式变体。',
      default: "'ghost'",
    },
    {
      name: 'size',
      type: 'XDSButtonSize',
      description: '触发按钮的尺寸。',
      default: "'md'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '覆盖默认的三点图标。接受任何 ReactNode。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '菜单触发器是否禁用。',
      default: 'false',
    },
    {
      name: 'children',
      type: '(item: XDSDropdownMenuItemData) => ReactNode',
      description:
        '自定义项目渲染函数。仅对可选择的项目调用（不包括分割线/分组）。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象如 style={{}}。',
    },
  ],
  features: [
    "零配置默认值：三点图标、'More options' 标签、ghost 变体，只需传入 items",
    '数据驱动的菜单项：与 XDSDropdownMenu 相同的 items 属性（项目、分割线、分组）',
    '仅图标触发器：始终渲染为带 aria-label 的方形图标按钮',
    '工具提示：悬停时显示标签，菜单打开时隐藏',
    '自定义渲染：可选的 children 渲染函数用于自定义项目内容',
  ],
  theming: {
    targets: [
      {className: 'xds-more-menu'},
    ],
  },
  accessibility: [
    '正确的 ARIA 角色：下拉元素上设置 menu 和 menuitem。',
    '触发按钮设置了 aria-haspopup="menu" 和 aria-expanded。',
    'aria-activedescendant 跟踪高亮的菜单项。',
    '禁用项目设置了 aria-disabled。',
    '分组使用 role="group" 配合 aria-label。',
  ],
  keyboard:
    '方向键导航项目；Home/End 跳转到第一项/最后一项；Enter/Space 选择高亮项目；Escape 关闭菜单',
  notes: [
    '如需完全控制触发器渲染或菜单内容，请直接组合 XDSButton + useXDSLayer + XDSDropdownMenuItem。',
    '在紧凑空间（表格行、卡片标题）中使用 XDSMoreMenu 作为仅图标的溢出操作。使用 XDSDropdownMenu 作为带标签和箭头的触发按钮。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Overflow menu w/ three-dot icon trigger. Convenience wrapper composing icon-only XDSButton w/ dropdown menu, eliminating boilerplate for state management, positioning, accessibility.',
  features: [
    "Zero-config defaults: three-dot icon, 'More options' label, ghost variant; just pass items",
    'Data-driven items: same items prop as XDSDropdownMenu (items, dividers, sections)',
    'Icon-only trigger: always renders as square icon button w/ aria-label',
    'Tooltip: shows label on hover, hidden when menu open',
    'Custom rendering: optional children render function for custom item content',
  ],
  accessibility: [
    'Proper ARIA roles: menu + menuitem on dropdown elements.',
    'Trigger button has aria-haspopup="menu" + aria-expanded.',
    'aria-activedescendant tracks highlighted menu item.',
    'Disabled items have aria-disabled set.',
    'Sections use role="group" w/ aria-label.',
  ],
  keyboard:
    'Arrow keys navigate items; Home/End jump to first/last; Enter/Space select highlighted item; Escape closes menu',
  notes: [
    'For full control over trigger rendering or menu content, compose XDSButton + useXDSLayer + XDSDropdownMenuItem directly.',
    'Use XDSMoreMenu for icon-only overflow actions in tight spaces (table rows, card headers). Use XDSDropdownMenu for labeled trigger buttons w/ chevrons.',
  ],
  propDescriptions: {
    items: 'Menu items (actions, dividers, sections). Same type as XDSDropdownMenu items.',
    label: 'Accessible label (aria-label) + tooltip text.',
    variant: 'Trigger button visual style variant.',
    size: 'Trigger button size.',
    icon: 'Override default three-dot icon. Accepts any ReactNode.',
    isDisabled: 'Whether menu trigger disabled.',
    children: 'Custom render function for selectable items (not dividers/sections).',
    xstyle:
      'StyleX styles for layout customization (margins, positioning, sizing). Must be stylex.create() value.',
  },
};
