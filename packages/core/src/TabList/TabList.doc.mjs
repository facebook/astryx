/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TabList',
  description:
    'Tab navigation components with overflow menu support, rendering as a semantic nav landmark with button or anchor tab items.',
  keywords: ["tabs","tabbar","tabstrip","navigation","tabpanel","tabgroup","segmented","navtabs","tab"],
  features: [
    'Context-based communication: XDSTabListContext passes value/onChange/size from XDSTabList to children',
    'Single-responsibility XDSTab: renders as <button> or <a> (when href is provided) in the nav',
    'Overflow menu: XDSTabMenu accepts an options prop and renders menu items internally from the dropdown',
    "Dynamic trigger label: menu trigger shows the selected option's label when one is active",
    "Menu heading: dropdown includes an XDSDivider with the menu's label as a separator heading",
    'Selection indicator: selected menu items show a checkmark icon (matching XDSSelector pattern)',
    'Keyboard navigation: Tab between items, ArrowUp/Down in menu, Home/End, Escape closes menu (via useListFocus)',
    'Hover state: unselected tabs show a gray underline on hover; no background hover overlay',
    'Accessibility: nav landmark, aria-current="page" on selected tabs, role="menu" + aria-label on dropdown, aria-controls connecting trigger to menu, role="menuitem" for items, role="separator" for heading divider',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
    },
    {
      label: 'With links',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" href="/home" />
  <XDSTab value="settings" label="Settings" href="/settings" />
</XDSTabList>`,
    },
    {
      label: 'With icons',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />
  <XDSTab value="settings" label="Settings" icon={<CogIcon />} />
</XDSTabList>`,
    },
    {
      label: 'With bottom divider',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
    },
    {
      label: 'With overflow menu',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
  <XDSTabMenu
    label="More"
    options={[
      {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
      {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
    ]}
  />
</XDSTabList>`,
    },
  ],
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
  accessibility: [
    'XDSTabList renders as a <nav> landmark with aria-label="Tabs"',
    'XDSTab renders as <button> or <a> — uses navigation pattern, not role="tab"',
    'Selected XDSTab has aria-current="page"',
    'XDSTabMenu trigger has aria-haspopup="menu", aria-expanded, and aria-controls pointing to the menu element',
    'XDSTabMenu dropdown has role="menu" and aria-label matching the label prop',
    'XDSTabMenu heading divider has role="separator"',
    'XDSTabMenu items have role="menuitem" and aria-current="true" when selected',
  ],
  keyboard:
    'Tab moves focus between tab items; within the XDSTabMenu dropdown: ArrowUp/ArrowDown navigate items (wrapping), Home/End jump to first/last item, Escape closes the menu.',
  notes: [
    'XDSTab renders as <button> by default and as <a> when href is provided',
    'XDSTabMenu renders menu items internally from the options prop — no child composition',
    'Trigger label derives from options.find(o => o.value === ctx.value)?.label ?? label',
    'Menu trigger underline scopes to the label text span only, not the chevron icon',
    'Icons on menu items render via XDSIcon with size="sm" and color="secondary"',
    'Selected menu items show a CheckIcon checkmark (matching XDSSelector pattern)',
    'hasDivider on XDSTabList controls the bottom border (default: off)',
    'Size uses sizeVars tokens for tab heights (sm/md/lg)',
  ],
  components: [
    {
      name: 'XDSTabList',
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
          required: true,
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
          label: 'Basic',
          code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
        },
        {
          label: 'With divider',
          code: `<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider size="sm">
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
        },
      ],
    },
    {
      name: 'XDSTab',
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
        },
        {
          name: 'selectedIcon',
          type: 'ReactNode',
          description:
            'Icon element shown when the tab is selected; falls back to icon if not provided.',
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
          label: 'Button tab',
          code: '<XDSTab value="home" label="Home" />',
        },
        {
          label: 'Link tab with icons',
          code: '<XDSTab value="home" label="Home" href="/home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />',
        },
      ],
    },
    {
      name: 'XDSTabMenu',
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
      examples: [
        {
          label: 'With icons',
          code: `<XDSTabMenu
  label="More"
  options={[
    {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
    {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
  ]}
/>`,
        },
        {
          label: 'Text only',
          code: `<XDSTabMenu
  label="More"
  options={[
    {value: 'analytics', label: 'Analytics'},
    {value: 'reports', label: 'Reports'},
  ]}
/>`,
        },
      ],
    },
  ],
  usage: {
    summary: 'Organizes content into tabbed sections for quick access to categorized information.',
    content: `## When to use

- To organize large amounts of content into categories accessible above the fold.

## Best practices

- Two styles are available: underlined tabs and header tabs.
- Tab items overflow into a "more" menu when horizontal space is limited.`,
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
  description:
    '支持溢出菜单的标签页导航组件，渲染为语义化的 nav 地标元素，包含按钮或锚点标签项。',
  features: [
    '基于上下文通信：XDSTabListContext 将 value/onChange/size 从 XDSTabList 传递给子组件',
    '单一职责的 XDSTab：在 nav 中渲染为 <button> 或 <a>（当提供 href 时）',
    '溢出菜单：XDSTabMenu 接受 options 属性，并从下拉菜单内部渲染菜单项',
    '动态触发器标签：当某个选项处于选中状态时，菜单触发器显示该选项的标签',
    '菜单标题：下拉菜单包含一个以菜单标签作为分隔标题的 XDSDivider',
    '选中指示器：选中的菜单项显示勾选图标（与 XDSSelector 模式一致）',
    '键盘导航：Tab 键在项目间移动焦点，ArrowUp/ArrowDown 在菜单中导航，Home/End 跳转，Escape 关闭菜单（通过 useListFocus 实现）',
    '悬停状态：未选中的标签在悬停时显示灰色下划线；无背景悬停遮罩',
    '无障碍：nav 地标元素，选中标签上的 aria-current="page"，下拉菜单的 role="menu" + aria-label，aria-controls 连接触发器与菜单，菜单项的 role="menuitem"，标题分隔线的 role="separator"',
  ],
  examples: [
    {
      label: '基础用法',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
    },
    {
      label: '带链接',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" href="/home" />
  <XDSTab value="settings" label="Settings" href="/settings" />
</XDSTabList>`,
    },
    {
      label: '带图标',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />
  <XDSTab value="settings" label="Settings" icon={<CogIcon />} />
</XDSTabList>`,
    },
    {
      label: '带底部分隔线',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
    },
    {
      label: '带溢出菜单',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
  <XDSTabMenu
    label="More"
    options={[
      {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
      {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
    ]}
  />
</XDSTabList>`,
    },
  ],
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
  accessibility: [
    'XDSTabList 渲染为带有 aria-label="Tabs" 的 <nav> 地标元素',
    'XDSTab 渲染为 <button> 或 <a> — 使用导航模式，而非 role="tab"',
    '选中的 XDSTab 具有 aria-current="page"',
    'XDSTabMenu 触发器具有 aria-haspopup="menu"、aria-expanded 和指向菜单元素的 aria-controls',
    'XDSTabMenu 下拉菜单具有 role="menu" 和与 label 属性匹配的 aria-label',
    'XDSTabMenu 标题分隔线具有 role="separator"',
    'XDSTabMenu 菜单项具有 role="menuitem"，选中时具有 aria-current="true"',
  ],
  keyboard:
    'Tab 键在标签项之间移动焦点；在 XDSTabMenu 下拉菜单中：ArrowUp/ArrowDown 导航菜单项（循环），Home/End 跳转到第一项/最后一项，Escape 关闭菜单。',
  notes: [
    'XDSTab 默认渲染为 <button>，当提供 href 时渲染为 <a>',
    'XDSTabMenu 通过 options 属性在内部渲染菜单项 — 不使用子组件组合',
    '触发器标签来源于 options.find(o => o.value === ctx.value)?.label ?? label',
    '菜单触发器下划线仅作用于标签文本范围，不包含箭头图标',
    '菜单项上的图标通过 XDSIcon 渲染，尺寸为 "sm"，颜色为 "secondary"',
    '选中的菜单项显示 CheckIcon 勾选标记（与 XDSSelector 模式一致）',
    'XDSTabList 上的 hasDivider 控制底部边框（默认关闭）',
    'Size 使用 sizeVars 令牌控制标签高度（sm/md/lg）',
  ],
  components: [
    {
      name: 'XDSTabList',
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
      examples: [
        {
          label: '基础用法',
          code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
        },
        {
          label: '带分隔线',
          code: `<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider size="sm">
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
        },
      ],
    },
    {
      name: 'XDSTab',
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
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
      examples: [
        {
          label: '按钮标签',
          code: '<XDSTab value="home" label="Home" />',
        },
        {
          label: '带图标的链接标签',
          code: '<XDSTab value="home" label="Home" href="/home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />',
        },
      ],
    },
    {
      name: 'XDSTabMenu',
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
      examples: [
        {
          label: '带图标',
          code: `<XDSTabMenu
  label="More"
  options={[
    {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
    {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
  ]}
/>`,
        },
        {
          label: '纯文本',
          code: `<XDSTabMenu
  label="More"
  options={[
    {value: 'analytics', label: 'Analytics'},
    {value: 'reports', label: 'Reports'},
  ]}
/>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Tab navigation w/ overflow menu support; semantic nav landmark w/ button or anchor tab items.',
  features: [
    'Context-based: XDSTabListContext passes value/onChange/size from XDSTabList to children',
    'Single-responsibility XDSTab: renders <button> or <a> (when href provided) in nav',
    'Overflow menu: XDSTabMenu accepts options prop, renders menu items from dropdown',
    "Dynamic trigger label: shows selected option's label when active",
    "Menu heading: dropdown includes XDSDivider w/ menu's label as separator heading",
    'Selection indicator: selected items show checkmark icon (matching XDSSelector pattern)',
    'Keyboard nav: Tab between items, ArrowUp/Down in menu, Home/End, Escape closes (via useListFocus)',
    'Hover state: unselected tabs show gray underline on hover; no bg hover overlay',
    'Accessible: nav landmark, aria-current="page" on selected, role="menu" + aria-label on dropdown, aria-controls, role="menuitem", role="separator"',
  ],
  notes: [
    'XDSTab renders <button> by default, <a> when href provided.',
    'XDSTabMenu renders items internally from options prop; no child composition.',
    'Trigger label: options.find(o => o.value === ctx.value)?.label ?? label.',
    'Menu trigger underline scopes to label text span only, not chevron.',
    'Icons on menu items via XDSIcon size="sm" color="secondary".',
    'Selected menu items show CheckIcon (matching XDSSelector pattern).',
    'hasDivider controls bottom border (default: off).',
    'Size uses sizeVars tokens for tab heights (sm/md/lg).',
  ],
  accessibility: [
    'XDSTabList renders <nav> w/ aria-label="Tabs".',
    'XDSTab renders <button> or <a>; uses nav pattern, not role="tab".',
    'Selected XDSTab has aria-current="page".',
    'XDSTabMenu trigger has aria-haspopup="menu", aria-expanded, aria-controls.',
    'XDSTabMenu dropdown has role="menu" + aria-label matching label prop.',
    'XDSTabMenu heading divider has role="separator".',
    'XDSTabMenu items have role="menuitem" + aria-current="true" when selected.',
  ],
  keyboard: 'Tab=move focus between items; ArrowUp/ArrowDown=navigate menu (wrapping); Home/End=first/last; Escape=close menu.',
  components: [
    {
      name: 'XDSTabList',
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
      description: 'Individual tab; renders as button or anchor w/ selected-state styling + optional icons.',
      propDescriptions: {
        value: 'Unique value matched against XDSTabListContext.value.',
        label: 'Visible label text.',
        href: 'URL; renders as <a> when provided.',
        as: 'Custom link component overriding XDSLinkProvider; only w/ href.',
        icon: 'Icon shown when not selected.',
        selectedIcon: 'Icon shown when selected; falls back to icon.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
      },
    },
    {
      name: 'XDSTabMenu',
      description: "Overflow menu trigger; dropdown of extra tab options, shows selected option's label as trigger text.",
      propDescriptions: {
        label: 'Trigger text (when no option selected) + dropdown heading.',
        options: 'Menu options array rendered in dropdown.',
      },
    },
  ],
};