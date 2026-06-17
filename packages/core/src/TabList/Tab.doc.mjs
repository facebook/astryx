// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tab',
  subComponentOf: 'TabList',
  displayName: 'Tab',
  isHiddenFromOverview: true,
  description:
    'Individual tab item that renders as a button or an anchor link, with selected-state styling and optional icons.',
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        'Unique value for this tab, matched against XDSTabListContext.value.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for this tab. Used as visible text by default, or as aria-label when isLabelHidden is true.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Whether the label is visually hidden. When true, only the icon and endContent are displayed, and label is used as aria-label for accessibility.',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'URL to navigate to; when provided, the tab renders as an anchor element.',
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description:
        'Custom component to render instead of <a> for link tabs. Overrides the XDSLinkProvider default. Only applies when href is provided.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon element shown when the tab is not selected.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'selectedIcon',
      type: 'ReactNode',
      description:
        'Icon element shown when the tab is selected; falls back to icon if not provided.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'checkCircle',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered after the label, such as a badge count or status dot.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'XDSBadge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
};

export const docsZh = {
  name: 'Tab',
  isHiddenFromOverview: true,
  displayName: 'Tab',
  description: '单个标签项，渲染为按钮或锚点链接，具有选中状态样式和可选图标。',
  props: [
    {
      name: 'value',
      type: 'string',
      description: '此标签的唯一值，与 XDSTabListContext.value 进行匹配。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '此标签的无障碍标签。默认作为可见文本使用；当 isLabelHidden 为 true 时用作 aria-label。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '是否在视觉上隐藏标签。为 true 时，仅显示图标和 endContent，并将 label 用作无障碍 aria-label。',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: '要导航到的 URL；提供时，标签渲染为锚点元素。',
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description:
        '用于替代 <a> 渲染链接标签的自定义组件。覆盖 XDSLinkProvider 的默认值。仅在提供 href 时生效。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '标签未选中时显示的图标元素。',
    },
    {
      name: 'selectedIcon',
      type: 'ReactNode',
      description: '标签选中时显示的图标元素；未提供时回退到 icon。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签文本之后渲染的内容，例如徽章计数或状态点。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
};

export const docsDense = {
  name: 'Tab',
  isHiddenFromOverview: true,
  displayName: 'Tab',
  description:
    'Individual tab; renders as button or anchor w/ selected-state styling + optional icons.',
  propDescriptions: {
    value: 'Unique value matched against XDSTabListContext.value.',
    label:
      'Accessible label; visible by default, aria-label when isLabelHidden.',
    isLabelHidden:
      'Visually hide label for icon-only tabs; label becomes aria-label.',
    href: 'URL; renders as <a> when provided.',
    as: 'Custom link component overriding XDSLinkProvider; only w/ href.',
    icon: 'Icon shown when not selected.',
    selectedIcon: 'Icon shown when selected; falls back to icon.',
    endContent: 'Content after the label (badge, status dot, etc.).',
    xstyle:
      'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
  },
};
