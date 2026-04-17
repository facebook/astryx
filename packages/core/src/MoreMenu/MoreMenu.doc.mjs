/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MoreMenu',
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
  theming: {
    targets: [
      {className: 'xds-more-menu'},
    ],
  },
  usage: {
    description:
      'MoreMenu is a compact overflow menu triggered by a three-dot icon button. Use it to present secondary or overflow actions in tight spaces such as table rows, card headers, or toolbars.',
    bestPractices: [
      { guidance: true, description: 'Use for secondary or overflow actions that do not need to be always visible.' },
      { guidance: true, description: 'Provide a meaningful label to describe the menu context for screen reader users.' },
      { guidance: false, description: 'Place primary actions inside a MoreMenu — primary actions should be directly visible.' },
      { guidance: false, description: 'Use MoreMenu when you need a labeled trigger button with a chevron — use DropdownMenu instead.' },
    ],
  },
};
/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'MoreMenu',
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
  theming: {
    targets: [
      {className: 'xds-more-menu'},
    ],
  },
  usage: {
    description:
      'MoreMenu is a compact overflow menu triggered by a three-dot icon button. Use it to present secondary or overflow actions in tight spaces such as table rows, card headers, or toolbars.',
    bestPractices: [
      { guidance: true, description: 'Use for secondary or overflow actions that do not need to be always visible.' },
      { guidance: true, description: 'Provide a meaningful label to describe the menu context for screen reader users.' },
      { guidance: false, description: 'Place primary actions inside a MoreMenu — primary actions should be directly visible.' },
      { guidance: false, description: 'Use MoreMenu when you need a labeled trigger button with a chevron — use DropdownMenu instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Overflow menu w/ three-dot icon trigger. Convenience wrapper composing icon-only XDSButton w/ dropdown menu, eliminating boilerplate for state management, positioning, accessibility.',
  usage: {
    description:
      'MoreMenu is a compact overflow menu triggered by a three-dot icon button. Use it to present secondary or overflow actions in tight spaces such as table rows, card headers, or toolbars.',
    bestPractices: [
      { guidance: true, description: 'Use for secondary or overflow actions that do not need to be always visible.' },
      { guidance: true, description: 'Provide a meaningful label to describe the menu context for screen reader users.' },
      { guidance: false, description: 'Place primary actions inside a MoreMenu — primary actions should be directly visible.' },
      { guidance: false, description: 'Use MoreMenu when you need a labeled trigger button with a chevron — use DropdownMenu instead.' },
    ],
  },
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
