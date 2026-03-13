/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MoreMenu',
  description:
    'Overflow menu with a three-dot icon trigger. A convenience wrapper that composes an icon-only XDSButton with a dropdown menu, eliminating the boilerplate of wiring up state management, positioning, and accessibility attributes.',
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
  examples: [
    {
      label: 'Minimal actions',
      code: `<XDSMoreMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>`,
    },
    {
      label: 'Table row actions with icons',
      code: `<XDSMoreMenu
  label="Row actions"
  size="sm"
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit(row) },
    { type: 'divider' },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(row) },
  ]}
/>`,
    },
    {
      label: 'With sections',
      code: `<XDSMoreMenu
  label="Document actions"
  items={[
    {
      type: 'section',
      title: 'Actions',
      items: [
        { label: 'Edit', onClick: handleEdit },
        { label: 'Duplicate', onClick: handleDuplicate },
      ],
    },
    {
      type: 'section',
      title: 'Danger zone',
      items: [
        { label: 'Delete', onClick: handleDelete },
      ],
    },
  ]}
/>`,
    },
    {
      label: 'Card header with overflow menu',
      code: `<XDSHStack align="center" justify="between">
  <XDSHeading level={3}>Card Title</XDSHeading>
  <XDSMoreMenu
    items={[
      { label: 'Edit', onClick: handleEdit },
      { label: 'Duplicate', onClick: handleDuplicate },
      { type: 'divider' },
      { label: 'Delete', onClick: handleDelete },
    ]}
  />
</XDSHStack>`,
    },
    {
      label: 'Custom item rendering',
      code: `<XDSMoreMenu
  label="User actions"
  items={actions}
>
  {item => (
    <XDSDropdownMenuItem
      icon={item.icon}
      label={item.label}
      description={item.description}
    />
  )}
</XDSMoreMenu>`,
    },
  ],
  features: [
    "Zero-config defaults: three-dot icon, 'More options' label, ghost variant — just pass items",
    'Data-driven items: same items prop as XDSDropdownMenu (items, dividers, sections)',
    'Icon-only trigger: always renders as a square icon button with aria-label',
    'Tooltip: shows label on hover, hidden when menu is open',
    'Custom rendering: optional children render function for custom item content',
  ],
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
  examples: [
    {
      label: '最简操作',
      code: `<XDSMoreMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>`,
    },
    {
      label: '带图标的表格行操作',
      code: `<XDSMoreMenu
  label="Row actions"
  size="sm"
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit(row) },
    { type: 'divider' },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(row) },
  ]}
/>`,
    },
    {
      label: '带分组',
      code: `<XDSMoreMenu
  label="Document actions"
  items={[
    {
      type: 'section',
      title: 'Actions',
      items: [
        { label: 'Edit', onClick: handleEdit },
        { label: 'Duplicate', onClick: handleDuplicate },
      ],
    },
    {
      type: 'section',
      title: 'Danger zone',
      items: [
        { label: 'Delete', onClick: handleDelete },
      ],
    },
  ]}
/>`,
    },
    {
      label: '卡片标题中的溢出菜单',
      code: `<XDSHStack align="center" justify="between">
  <XDSHeading level={3}>Card Title</XDSHeading>
  <XDSMoreMenu
    items={[
      { label: 'Edit', onClick: handleEdit },
      { label: 'Duplicate', onClick: handleDuplicate },
      { type: 'divider' },
      { label: 'Delete', onClick: handleDelete },
    ]}
  />
</XDSHStack>`,
    },
    {
      label: '自定义项目渲染',
      code: `<XDSMoreMenu
  label="User actions"
  items={actions}
>
  {item => (
    <XDSDropdownMenuItem
      icon={item.icon}
      label={item.label}
      description={item.description}
    />
  )}
</XDSMoreMenu>`,
    },
  ],
  features: [
    "零配置默认值：三点图标、'More options' 标签、ghost 变体，只需传入 items",
    '数据驱动的菜单项：与 XDSDropdownMenu 相同的 items 属性（项目、分割线、分组）',
    '仅图标触发器：始终渲染为带 aria-label 的方形图标按钮',
    '工具提示：悬停时显示标签，菜单打开时隐藏',
    '自定义渲染：可选的 children 渲染函数用于自定义项目内容',
  ],
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

/** @type {string} */
export const docsDense = `TODO: apply dense protocol`;
