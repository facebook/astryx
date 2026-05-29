// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TabList',
  displayName: 'Tab List',
  group: 'Tabs',
  category: 'Navigation',
  keywords: ["tabs","tabbar","tabstrip","navigation","tabpanel","tabgroup","segmented","navtabs","tab"],
  playground: {
    defaults: {
      value: 'tab-1',
    },
  },
  theming: {
    targets: [
      {className: 'xds-tab-list', visualProps: ['size']},
      {className: 'xds-tab', states: ['selected']},
      {className: 'xds-tab-indicator', states: ['selected']},
      {className: 'xds-tab-menu'},
      {className: 'xds-tab-menu-dropdown'},
      {className: 'xds-tab-menu-item'},
    ],
  },
  components: [
    {
      name: 'XDSTabList',
      displayName: 'Tab List',
      description:
        'Nav wrapper that provides XDSTabListContext (value, onChange, size) to XDSTab and XDSTabMenu children.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected tab value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when a tab is selected.',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant applied to all child tabs.',
          default: "'md'",
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description:
            'Whether to show a bottom border divider under the tab list.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSTab and XDSTabMenu items to render inside the nav.',
          slotElements: [{__element: 'XDSTab', props: {label: 'Tab', value: 'tab'}}],
          required: true,
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSTab',
      displayName: 'Tab',
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
          description: 'Visible label text for this tab.',
          required: true,
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'selectedIcon',
          type: 'ReactNode',
          description:
            'Icon element shown when the tab is selected; falls back to icon if not provided.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'checkCircle', size: 'sm'}}],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered after the label, such as a badge count or status dot.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSTabMenu',
      displayName: 'Tab Menu',
      description:
        "Overflow menu trigger that opens a dropdown of additional tab options, showing the selected option's label as the trigger text.",
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label for the trigger button (shown when no option is selected) and the dropdown heading divider.',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSTabMenuOption[]',
          description: 'Array of menu options rendered in the dropdown.',
          required: true,
        },
      ],
    },
  ],
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Use XDSTabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, use a smaller button size (sm) so the actions don\u2019t overpower the tab row.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows — use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu — prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with XDSSegmentedControl or XDSToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls — SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TabList',
  displayName: 'Tab List',
  group: 'Tabs',
  theming: {
    targets: [
      {className: 'xds-tab-list', visualProps: ['size']},
      {className: 'xds-tab', states: ['selected']},
      {className: 'xds-tab-indicator', states: ['selected']},
      {className: 'xds-tab-menu'},
      {className: 'xds-tab-menu-dropdown'},
      {className: 'xds-tab-menu-item'},
    ],
  },
  components: [
    {
      name: 'XDSTabList',
      displayName: 'Tab List',
      description:
        '导航容器，为 XDSTab 和 XDSTabMenu 子组件提供 XDSTabListContext（value、onChange、size）。',
      props: [
        {
          name: 'value',
          type: 'string',
          description: '当前选中的标签值。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: '选中标签时触发的回调函数。',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: '应用于所有子标签的尺寸变体。',
          default: "'md'",
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description:
            '是否在标签列表下方显示底部边框分隔线。',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '在 nav 内渲染的 XDSTab 和 XDSTabMenu 项。',
          required: true,
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSTab',
      displayName: 'Tab',
      description:
        '单个标签项，渲染为按钮或锚点链接，具有选中状态样式和可选图标。',
      props: [
        {
          name: 'value',
          type: 'string',
          description:
            '此标签的唯一值，与 XDSTabListContext.value 进行匹配。',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description: '此标签的可见标签文本。',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description:
            '要导航到的 URL；提供时，标签渲染为锚点元素。',
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
          description:
            '标签选中时显示的图标元素；未提供时回退到 icon。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '在标签文本之后渲染的内容，例如徽章计数或状态点。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSTabMenu',
      displayName: 'Tab Menu',
      description:
        '溢出菜单触发器，打开包含额外标签选项的下拉菜单，将选中选项的标签显示为触发器文本。',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '触发器按钮的标签（无选项选中时显示）以及下拉菜单标题分隔线的文本。',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSTabMenuOption[]',
          description: '在下拉菜单中渲染的菜单选项数组。',
          required: true,
        },
      ],
    },
  ],
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Use XDSTabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, use a smaller button size (sm) so the actions don\u2019t overpower the tab row.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows — use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu — prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with XDSSegmentedControl or XDSToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls — SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Tab navigation w/ overflow menu support; semantic nav landmark w/ button or anchor tab items.',
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Use XDSTabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, use a smaller button size (sm) so the actions don\u2019t overpower the tab row.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows — use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu — prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with XDSSegmentedControl or XDSToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls — SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
  components: [
    {
      name: 'XDSTabList',
      displayName: 'Tab List',
      description: 'Nav wrapper providing XDSTabListContext (value, onChange, size) to children.',
      propDescriptions: {
        value: 'Currently selected tab value.',
        onChange: 'Fired when tab is selected.',
        size: 'Size variant applied to all child tabs.',
        hasDivider: 'Show bottom border divider under tab list.',
        children: 'XDSTab + XDSTabMenu items inside nav.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
      },
    },
    {
      name: 'XDSTab',
      displayName: 'Tab',
      description: 'Individual tab; renders as button or anchor w/ selected-state styling + optional icons.',
      propDescriptions: {
        value: 'Unique value matched against XDSTabListContext.value.',
        label: 'Visible label text.',
        href: 'URL; renders as <a> when provided.',
        as: 'Custom link component overriding XDSLinkProvider; only w/ href.',
        icon: 'Icon shown when not selected.',
        selectedIcon: 'Icon shown when selected; falls back to icon.',
        endContent: 'Content after the label (badge, status dot, etc.).',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
      },
    },
    {
      name: 'XDSTabMenu',
      displayName: 'Tab Menu',
      description: "Overflow menu trigger; dropdown of extra tab options, shows selected option's label as trigger text.",
      propDescriptions: {
        label: 'Trigger text (when no option selected) + dropdown heading.',
        options: 'Menu options array rendered in dropdown.',
      },
    },
  ],
};