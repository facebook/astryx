// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SideNav',
  displayName: 'Side Nav',
  group: 'SideNav',
  category: 'Navigation',
  keywords: ["sidenav","sidebar","navigation","drawer","menu","nav","aside","sidemenu","navmenu","sider","treeview"],
  playground: {
    defaults: {
      children: [
        {__element: 'XDSSideNavItem', props: {label: 'Dashboard', isSelected: true}},
        {__element: 'XDSSideNavItem', props: {label: 'Projects'}},
        {__element: 'XDSSideNavItem', props: {label: 'Settings'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'xds-side-nav', visualProps: ['mode']},
      {className: 'xds-side-nav-heading'},
      {className: 'xds-side-nav-item'},
      {className: 'xds-side-nav-section'},
    ],
  },
  components: [
    {
      name: 'XDSSideNav',
      displayName: 'Side Nav',
      description:
        'Container with five zones: header, topContent, children (scrollable), footer, and footerIcons. Supports collapsible mode.',
      props: [
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header area (typically XDSSideNavHeading). Sticky.',
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Header'}],
        },
        {
          name: 'topContent',
          type: 'ReactNode',
          description: 'Content below the header, e.g., a create button.',
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Top content'}],
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Navigation sections and items. Scrollable.',
          slotElements: [{__element: 'XDSSideNavItem', props: {label: 'Nav Item'}}],
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Footer area above the icon bar.',
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Footer content'}],
        },
        {
          name: 'footerIcons',
          type: 'ReactNode',
          description: 'Footer icon bar.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'collapsible',
          type: "boolean | { defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapsedChange?: (isCollapsed: boolean) => void; hasButton?: boolean; buttonLabel?: string }",
          description:
            'Enables collapse behavior. true for uncontrolled with default toggle button, or an object for controlled mode and advanced config (defaultIsCollapsed, isCollapsed + onCollapsedChange, hasButton, buttonLabel).',
          default: 'false',
        },
        {
          name: 'handleRef',
          type: 'Ref<XDSSideNavImperativeCollapseHandle>',
          description:
            'Imperative collapse handle for XDSSideNavCollapseButton instances rendered outside this SideNav. Separate from `ref`, which continues to expose the root HTMLElement.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSSideNavHeading',
      displayName: 'Side Nav Heading',
      description:
        'Product/suite/account heading with smart interaction boundary logic for links and a menu popover.',
      props: [
        {
          name: 'heading',
          type: 'string',
          description: 'Product/app name.',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Product/app icon.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'headingHref',
          type: 'string',
          description: 'Link for the heading.',
        },
        {
          name: 'superheading',
          type: 'string',
          description: 'Text above the heading.',
        },
        {
          name: 'superheadingHref',
          type: 'string',
          description: 'Link for the superheading.',
        },
        {
          name: 'subheading',
          type: 'string',
          description: 'Text below the heading.',
        },
        {
          name: 'subheadingHref',
          type: 'string',
          description: 'Link for the subheading.',
        },
        {
          name: 'menu',
          type: 'ReactNode',
          description: 'Menu content rendered inside a popover.',
          slotElements: [{__element: 'XDSButton', props: {label: 'Action', variant: 'ghost', size: 'sm'}}],
        },
        {
          name: 'headerEndContent',
          type: 'ReactNode',
          description: 'Content rendered at the trailing edge of the heading row, between text and chevron. Useful for badges, status indicators, or compact action buttons. Hidden when collapsed.',
          slotElements: [{__element: 'XDSButton', props: {label: 'Action', variant: 'ghost', size: 'sm'}}],
        },
      ],
    },
    {
      name: 'XDSSideNavItem',
      displayName: 'Side Nav Item',
      description:
        'Navigation item with icon, selected state, optional end content, and nesting support via children.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Item label.',
          required: true,
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: 'Custom link component.',
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon displayed in the outline (unselected) variant. See `npx xds docs icons` for valid semantic names.',
        },
        {
          name: 'selectedIcon',
          type: 'XDSIconType',
          description:
            'Icon displayed when the item is selected (filled variant). See `npx xds docs icons` for valid semantic names.',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: 'Marks this item as the current page.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disabled state.',
          default: 'false',
        },
        {
          name: 'href',
          type: 'string',
          description: 'Navigation URL.',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: 'Click handler.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Right-side content such as badges or counts.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Sub-items for nesting.',
          slotElements: [{__element: 'XDSSideNavItem', props: {label: 'Sub Item'}}],
        },
        {
          name: 'collapsible',
          type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
          description: 'Enables collapse behavior for items with children. Pass true for uncontrolled (starts expanded), or an object for controlled mode.',
          default: 'false',
        },
      ],
    },
    {
      name: 'XDSSideNavSection',
      displayName: 'Side Nav Section',
      description:
        'Section grouping with an optional title, subtitle, and end content.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Section title.',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'string',
          description: 'Section subtitle.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Section items.',
          slotElements: [{__element: 'XDSSideNavItem', props: {label: 'Item'}}],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Right-side content in the section header.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
        {
          name: 'isHeaderHidden',
          type: 'boolean',
          description:
            'Visually hides the section header while keeping it accessible to screen readers.',
          default: 'false',
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
      name: 'XDSSideNavCollapseButton',
      displayName: 'Side Nav Collapse Button',
      description:
        'Toggle button for sidenav collapse. Place inside XDSSideNav (reads context automatically) or outside (pass handleRef). Renders as an icon-only ghost button by default.',
      props: [
        {
          name: 'handleRef',
          type: 'RefObject<XDSSideNavImperativeCollapseHandle | null>',
          description:
            'Imperative collapse handle from XDSSideNav. Only needed when the button is rendered outside the sidenav.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Custom button label. When provided, renders as a text button with chevron. When omitted, renders icon-only.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom button content. Overrides the default chevron icon and label.',
        },
      ],
    },
  ],
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity — this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content — use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'SideNav',
  displayName: 'Side Nav',
  theming: {
    targets: [
      {className: 'xds-side-nav', visualProps: ['mode']},
      {className: 'xds-side-nav-heading'},
      {className: 'xds-side-nav-item'},
      {className: 'xds-side-nav-section'},
    ],
  },
  components: [
    {
      name: 'XDSSideNav',
      displayName: 'Side Nav',
      description:
        '包含五个区域的容器：header、topContent、children（可滚动）、footer 和 footerIcons。',
      props: [
        {
          name: 'header',
          type: 'ReactNode',
          description: '头部区域（通常为 XDSSideNavHeading）。固定定位。',
        },
        {
          name: 'topContent',
          type: 'ReactNode',
          description: '头部下方的内容，例如创建按钮。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '导航分组和项目。可滚动。',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: '图标栏上方的底部区域。',
        },
        {
          name: 'footerIcons',
          type: 'ReactNode',
          description: '底部图标栏。',
        },
        {
          name: 'collapsible',
          type: "boolean | { defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapsedChange?: (isCollapsed: boolean) => void; hasButton?: boolean; buttonLabel?: string }",
          description:
            '启用折叠行为。true 表示非受控模式并带默认切换按钮，或传入对象进行受控模式和高级配置（defaultIsCollapsed、isCollapsed + onCollapsedChange、hasButton、buttonLabel）。',
          default: 'false',
        },
        {
          name: 'handleRef',
          type: 'Ref<XDSSideNavImperativeCollapseHandle>',
          description:
            '供渲染在 SideNav 外部的 XDSSideNavCollapseButton 使用的命令式折叠句柄。与 `ref` 分离，`ref` 仍然指向根 HTMLElement。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSSideNavHeading',
      displayName: 'Side Nav Heading',
      description:
        '产品/套件/账户头部，具有智能交互边界逻辑，支持链接和菜单弹出框。',
      props: [
        {
          name: 'heading',
          type: 'string',
          description: '产品/应用名称。',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: '产品/应用图标。',
        },
        {
          name: 'headingHref',
          type: 'string',
          description: '标题的链接。',
        },
        {
          name: 'superheading',
          type: 'string',
          description: '标题上方的文本。',
        },
        {
          name: 'superheadingHref',
          type: 'string',
          description: '上方标题的链接。',
        },
        {
          name: 'subheading',
          type: 'string',
          description: '标题下方的文本。',
        },
        {
          name: 'subheadingHref',
          type: 'string',
          description: '下方标题的链接。',
        },
        {
          name: 'menu',
          type: 'ReactNode',
          description: '在弹出框内渲染的菜单内容。',
        },
        {
          name: 'headerEndContent',
          type: 'ReactNode',
          description: '在标题行尾部渲染的内容，位于文本和箭头之间。适用于徽章、状态指示器或紧凑操作按钮。折叠时隐藏。',
        },
      ],
    },
    {
      name: 'XDSSideNavItem',
      displayName: 'Side Nav Item',
      description:
        '导航项，支持图标、选中状态、可选尾部内容，以及通过 children 实现嵌套。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '项目标签。',
          required: true,
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: '自定义链接组件。',
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: '轮廓（未选中）变体中显示的图标。',
        },
        {
          name: 'selectedIcon',
          type: 'XDSIconType',
          description:
            '选中时显示的图标（填充变体）。',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: '将此项标记为当前页面。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用状态。',
          default: 'false',
        },
        {
          name: 'href',
          type: 'string',
          description: '导航 URL。',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: '点击处理函数。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: '右侧内容，如徽章或计数。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '用于嵌套的子项。',
        },
        {
          name: 'collapsible',
          type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
          description: '启用带子项的折叠行为。传 true 为非受控模式（默认展开），或传对象用于受控模式。',
          default: 'false',
        },
      ],
    },
    {
      name: 'XDSSideNavSection',
      displayName: 'Side Nav Section',
      description:
        '分组，支持可选的标题、副标题和尾部内容。',
      props: [
        {
          name: 'title',
          type: 'string',
          description: '分组标题。',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'string',
          description: '分组副标题。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '分组项目。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: '分组头部的右侧内容。',
        },
        {
          name: 'isHeaderHidden',
          type: 'boolean',
          description:
            '视觉上隐藏分组头部，同时保持屏幕阅读器可访问。',
          default: 'false',
        },
      ],
    },
    {
      name: 'XDSSideNavCollapseButton',
      displayName: 'Side Nav Collapse Button',
      description:
        '侧边栏折叠切换按钮。放置在 XDSSideNav 内部（自动读取上下文）或外部（传入 handleRef）。默认渲染为仅图标的 ghost 按钮。',
      props: [
        {
          name: 'handleRef',
          type: 'RefObject<XDSSideNavImperativeCollapseHandle | null>',
          description:
            '来自 XDSSideNav 的命令式折叠句柄。仅在按钮渲染在侧边栏外部时需要。',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '自定义按钮标签。提供时渲染为带箭头的文本按钮。省略时渲染为仅图标按钮。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '自定义按钮内容。覆盖默认的箭头图标和标签。',
        },
      ],
    },
  ],
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity — this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content — use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity — this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content — use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
  components: [
    {
      name: 'XDSSideNav',
      displayName: 'Side Nav',
      description:
        'Container w/ five zones: header, topContent, children (scrollable), footer, footerIcons. Supports collapsible mode.',
      propDescriptions: {
        header: 'Header area (typically XDSSideNavHeading). Sticky.',
        topContent: 'Content below header, e.g. create button.',
        children: 'Navigation sections + items. Scrollable.',
        footer: 'Footer area above icon bar.',
        footerIcons: 'Footer icon bar.',
        collapsible: 'Enables collapse behavior. true for uncontrolled w/ default toggle, or object for controlled mode (defaultIsCollapsed, isCollapsed+onCollapsedChange, hasButton, buttonLabel).',
        handleRef: 'Imperative collapse handle for XDSSideNavCollapseButton outside this SideNav. `ref` still exposes the root HTMLElement.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSSideNavHeading',
      displayName: 'Side Nav Heading',
      description:
        'Product/suite/account heading w/ smart interaction boundary logic for links + menu popover.',
      propDescriptions: {
        heading: 'Product/app name.',
        icon: 'Product/app icon.',
        headingHref: 'Link for heading.',
        superheading: 'Text above heading.',
        superheadingHref: 'Link for superheading.',
        subheading: 'Text below heading.',
        subheadingHref: 'Link for subheading.',
        menu: 'Menu content rendered inside popover.',
        headerEndContent: 'Content at trailing edge of heading row. For badges, status indicators, action buttons. Hidden when collapsed.',
      },
    },
    {
      name: 'XDSSideNavItem',
      displayName: 'Side Nav Item',
      description:
        'Navigation item w/ icon, selected state, optional end content, nesting via children.',
      propDescriptions: {
        label: 'Item label.',
        as: 'Custom link component.',
        icon: 'Icon displayed in outline (unselected) variant.',
        selectedIcon: 'Icon displayed when item selected (filled variant).',
        isSelected: 'Marks this item as current page.',
        isDisabled: 'Disabled state.',
        href: 'Navigation URL.',
        onClick: 'Click handler.',
        endContent: 'Right-side content such as badges or counts.',
        children: 'Sub-items for nesting.',
        collapsible: 'Enables collapse for items w/ children. true=uncontrolled, object=controlled mode.',
      },
    },
    {
      name: 'XDSSideNavSection',
      displayName: 'Side Nav Section',
      description:
        'Section grouping w/ optional title, subtitle, end content.',
      propDescriptions: {
        title: 'Section title.',
        subtitle: 'Section subtitle.',
        children: 'Section items.',
        endContent: 'Right-side content in section header.',
        isHeaderHidden: 'Visually hides section header while keeping accessible to screen readers.',
        xstyle: 'StyleX styles for layout customization.',
      },
    },
    {
      name: 'XDSSideNavCollapseButton',
      displayName: 'Side Nav Collapse Button',
      description:
        'Toggle button for sidenav collapse. Place inside XDSSideNav (reads context) or outside (pass handleRef). Icon-only ghost button by default.',
      propDescriptions: {
        handleRef: 'Imperative collapse handle from XDSSideNav. Only needed when button rendered outside sidenav.',
        label: 'Custom label. Text button w/ chevron when provided, icon-only when omitted.',
        children: 'Custom content. Overrides default chevron icon + label.',
      },
    },
  ],
};
