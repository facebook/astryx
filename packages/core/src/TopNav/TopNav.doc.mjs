/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TopNav',
  description:
    'Top navigation bar component for application headers with slot-based layout and companion nav item components.',
  features: [
    'Slot-based layout — heading, startContent, centerContent, and endContent slots for flexible organization',
    'Three-column centering — when centerContent is provided, switches to CSS grid (1fr auto 1fr) for true horizontal centering',
    'Companion components — XDSTopNavHeading, XDSTopNavItem, XDSTopNavMenu, XDSTopNavMegaMenu',
    'Accessible — uses role="navigation" with aria-label, aria-current="page" on selected items',
    'Themeable via className — target .xds-top-nav and sub-component classes',
    'Link customization — XDSTopNavItem accepts an as prop to swap the anchor element (e.g. for React Router)',
  ],
  examples: [
    {
      label: 'Basic nav with heading and items',
      code: `<XDSTopNav
  label="Main navigation"
  heading={
    <XDSTopNavHeading
      heading="My App"
      logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
      href="/"
    />
  }
  startContent={
    <>
      <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
      <XDSTopNavItem label="Products" href="/products" />
      <XDSTopNavItem label="Reports" href="/reports" />
    </>
  }
  endContent={
    <>
      <XDSButton
        label="Notifications"
        variant="ghost"
        icon={<BellIcon style={{width: 16, height: 16}} />}
      />
      <XDSButton
        label="Profile"
        variant="ghost"
        icon={<UserCircleIcon style={{width: 16, height: 16}} />}
      />
    </>
  }
/>`,
    },
    {
      label: 'With centered content (three-column layout)',
      code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  startContent={<XDSTopNavItem label="Home" href="/" isSelected />}
  centerContent={<SearchBar />}
  endContent={<Avatar />}
/>`,
    },
    {
      label: 'With hover menu and mega menu',
      code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  startContent={
    <>
      <XDSTopNavItem label="Home" href="/" isSelected />
      <XDSTopNavMenu
        label="Products"
        items={[
          {title: 'Analytics', description: 'View metrics', href: '/analytics'},
          {title: 'Reports', description: 'Generate reports', href: '/reports'},
        ]}
      />
      <XDSTopNavMegaMenu
        label="Solutions"
        items={[
          {title: 'Enterprise', description: 'For large teams', icon: <BuildingIcon />, href: '/enterprise'},
          {title: 'Startups', description: 'Move fast', icon: <RocketIcon />, href: '/startups'},
        ]}
        featured={{
          title: 'New: AI Features',
          description: 'Explore our latest AI-powered tools.',
          linkText: 'Learn more \u2192',
          linkHref: '/ai',
        }}
      />
    </>
  }
/>`,
    },
    {
      label: 'In XDSLayout header slot',
      code: `<XDSLayout
  header={
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="My App" logo={<Logo />} href="/" />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Settings" href="/settings" />
        </>
      }
      endContent={<Avatar />}
    />
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-top-nav'},
      {className: 'xds-top-nav-item'},
      {className: 'xds-top-nav-heading'},
      {className: 'xds-top-nav-mega-menu'},
    ],
  },
  accessibility: [
    'XDSTopNav renders a <nav> element with role="navigation" and aria-label set from the label prop',
    'XDSTopNavItem sets aria-current="page" when isSelected is true',
    'XDSTopNavItem sets aria-label for icon-only items (when icon is provided and no children or label text is visible)',
    'XDSTopNavItem sets aria-disabled and tabIndex=-1 when isDisabled is true',
    'XDSTopNavMenu sets aria-haspopup="true" on the trigger button',
    'XDSTopNavMegaMenu sets aria-haspopup="true" and aria-expanded on the trigger button',
    'XDSTopNavMegaMenu menu items are unreachable by keyboard (tabIndex=-1) when the panel is closed',
    'Escape key closes the XDSTopNavMegaMenu panel',
  ],
  keyboard:
    'Tab to navigate between items; Escape closes XDSTopNavMegaMenu panels',
  notes: [
    'Default height is 48px (--spacing-12) with 16px horizontal padding',
    'Without centerContent: heading and startContent grow to push endContent right (flex layout)',
    'With centerContent: switches to CSS grid (gridTemplateColumns: 1fr auto 1fr) — the right column is always rendered even when endContent is absent to maintain the three-column structure',
    'Positioning (sticky/fixed) is handled by the layout system (e.g. XDSAppShell), not TopNav itself',
    'Dividers are controlled by the layout system (e.g. XDSLayoutHeader hasDivider), not TopNav',
    'XDSTopNavMegaMenu panels position relative to the nearest positioned ancestor — wrap XDSTopNav in a container with position: relative for correct full-width behavior',
  ],
  components: [
    {
      name: 'XDSTopNav',
      description: 'Main navigation bar container with slot-based layout.',
      props: [
        {
          name: 'heading',
          type: 'ReactNode',
          description:
            'Heading slot content (logo, brand) — positioned at the left edge of the nav bar.',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Start content slot for navigation items or breadcrumbs — positioned after the heading, left-aligned.',
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Center content slot (tabs, search bar, primary navigation) — when provided, switches the layout to a three-column CSS grid for true horizontal centering.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'End content slot for search, icons, or user profile — positioned at the right edge.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the navigation landmark, applied as aria-label on the <nav> element.',
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
          code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  startContent={<XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />}
  endContent={<XDSButton label="Profile" variant="ghost" />}
/>`,
        },
        {
          label: 'With centered content',
          code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  centerContent={<SearchInput placeholder="Search..." />}
  endContent={<Avatar />}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavHeading',
      description:
        'Heading component for the XDSTopNav heading slot — displays a logo and/or heading text, optionally as a clickable link.',
      props: [
        {
          name: 'heading',
          type: 'string',
          description: 'Heading text to display.',
        },
        {
          name: 'logo',
          type: 'ReactNode',
          description:
            'Logo element to display before the heading text. Can be an image, XDSNavIcon, or any ReactNode.',
        },
        {
          name: 'href',
          type: 'string',
          description:
            'URL to navigate to when clicked. When provided, renders as an anchor element.',
        },
      ],
      examples: [
        {
          label: 'Logo with text link',
          code: `<XDSTopNavHeading
  heading="My App"
  logo={<img src="/logo.svg" alt="" width={24} height={24} />}
  href="/"
/>`,
        },
        {
          label: 'With XDSNavIcon',
          code: `<XDSTopNavHeading
  heading="Dashboard"
  logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
  href="/"
/>`,
        },
        {
          label: 'Logo only',
          code: `<XDSTopNavHeading logo={<BrandLogo />} href="/" />`,
        },
      ],
    },
    {
      name: 'XDSTopNavItem',
      description:
        'Navigation link item for use in XDSTopNav startContent — renders as an anchor with hover and selected states.',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the nav item. Used as visible text, or as aria-label for icon-only items.',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: 'Navigation target URL.',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description:
            'Whether this nav item is currently selected. Sets aria-current="page" and applies highlighted styles.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the nav item is disabled. Sets aria-disabled and prevents interaction.',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description:
            'Optional icon to display before the label. If provided without children, the item becomes icon-only.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom content to render instead of the label text. When omitted and an icon is provided, the item becomes icon-only.',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom component to render instead of <a>. Overrides the provider-level default set by XDSLinkProvider. Must accept href, className, style, and children props.',
        },
      ],
      examples: [
        {
          label: 'Basic nav items',
          code: `<>
  <XDSTopNavItem label="Home" href="/" isSelected />
  <XDSTopNavItem label="Products" href="/products" />
  <XDSTopNavItem label="Settings" href="/settings" isDisabled />
</>`,
        },
        {
          label: 'With icon',
          code: `<XDSTopNavItem
  label="Settings"
  href="/settings"
  icon={<GearIcon style={{width: 16, height: 16}} />}
/>`,
        },
        {
          label: 'Icon only',
          code: `<XDSTopNavItem
  label="Notifications"
  href="/notifications"
  icon={<BellIcon style={{width: 16, height: 16}} />}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavMenu',
      description:
        'Navigation item that displays a hover-triggered popover menu with rich items containing an icon, title, and optional description.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Visible label for the trigger button.',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMenuItemData[]',
          description: 'Menu items to display in the hover popover.',
          required: true,
        },
        {
          name: 'delay',
          type: 'number',
          description:
            'Delay in milliseconds before showing the menu on hover.',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            'Delay in milliseconds before hiding the menu after the mouse leaves.',
          default: '200',
        },
      ],
      examples: [
        {
          label: 'Basic hover menu',
          code: `<XDSTopNavMenu
  label="Products"
  items={[
    {title: 'Analytics', description: 'View metrics', href: '/analytics'},
    {title: 'Reports', description: 'Generate reports', href: '/reports'},
  ]}
/>`,
        },
        {
          label: 'With icons and click handlers',
          code: `<XDSTopNavMenu
  label="Tools"
  items={[
    {
      title: 'Analytics',
      description: 'Track and analyze user behavior',
      icon: <ChartBarIcon />,
      href: '/analytics',
    },
    {
      title: 'Export',
      description: 'Download your data',
      icon: <ArrowDownTrayIcon />,
      onClick: () => openExportDialog(),
    },
  ]}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenu',
      description:
        'Navigation item that displays a full-width mega menu panel on hover, with items in a two-column grid and an optional featured content area.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Visible label for the trigger button.',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMegaMenuItemData[]',
          description: 'Menu items to display in the mega menu panel.',
          required: true,
        },
        {
          name: 'featured',
          type: 'XDSTopNavMegaMenuFeatured',
          description:
            'Optional featured content displayed on the right side of the mega menu panel.',
        },
        {
          name: 'delay',
          type: 'number',
          description:
            'Delay in milliseconds before showing the menu on hover.',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            'Delay in milliseconds before hiding the menu after the mouse leaves.',
          default: '250',
        },
        {
          name: 'isSingleColumn',
          type: 'boolean',
          description:
            'Whether to use a single-column layout for menu items instead of two columns.',
          default: 'false',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when the mega menu opens or closes. Useful for coordinating wrapper styles.',
        },
      ],
      examples: [
        {
          label: 'With featured content',
          code: `<div style={{position: 'relative'}}>
  <XDSTopNav
    startContent={
      <XDSTopNavMegaMenu
        label="Solutions"
        items={[
          {title: 'Enterprise', description: 'For large teams', icon: <BuildingIcon />, href: '/enterprise'},
          {title: 'Startups', description: 'Move fast', icon: <RocketIcon />, href: '/startups'},
        ]}
        featured={{
          title: 'New: AI Features',
          description: 'Explore our latest AI-powered tools.',
          linkText: 'Learn more \u2192',
          linkHref: '/ai',
        }}
      />
    }
  />
</div>`,
        },
        {
          label: 'Single column layout',
          code: `<XDSTopNavMegaMenu
  label="Products"
  isSingleColumn
  items={[
    {title: 'Analytics', description: 'Track behavior', icon: <ChartIcon />, href: '/analytics'},
    {title: 'Messaging', description: 'Real-time comms', icon: <ChatIcon />, href: '/messaging'},
    {title: 'Storage', description: 'Manage your data', icon: <DatabaseIcon />, href: '/storage'},
  ]}
/>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TopNav',
  description:
    '应用程序头部的顶部导航栏组件，采用插槽式布局和配套的导航项组件。',
  features: [
    '插槽式布局 — heading、startContent、centerContent 和 endContent 插槽实现灵活组织',
    '三列居中 — 提供 centerContent 时，切换为 CSS grid（1fr auto 1fr）实现真正的水平居中',
    '配套组件 — XDSTopNavHeading、XDSTopNavItem、XDSTopNavMenu、XDSTopNavMegaMenu',
    '无障碍 — 使用 role="navigation" 和 aria-label，选中项设置 aria-current="page"',
    '通过 className 支持主题化 — 可定位 .xds-top-nav 和子组件类',
    '链接自定义 — XDSTopNavItem 接受 as 属性来替换锚点元素（例如用于 React Router）',
  ],
  examples: [
    {
      label: '带标题和导航项的基础导航',
      code: `<XDSTopNav
  label="Main navigation"
  heading={
    <XDSTopNavHeading
      heading="My App"
      logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
      href="/"
    />
  }
  startContent={
    <>
      <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
      <XDSTopNavItem label="Products" href="/products" />
      <XDSTopNavItem label="Reports" href="/reports" />
    </>
  }
  endContent={
    <>
      <XDSButton
        label="Notifications"
        variant="ghost"
        icon={<BellIcon style={{width: 16, height: 16}} />}
      />
      <XDSButton
        label="Profile"
        variant="ghost"
        icon={<UserCircleIcon style={{width: 16, height: 16}} />}
      />
    </>
  }
/>`,
    },
    {
      label: '带居中内容（三列布局）',
      code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  startContent={<XDSTopNavItem label="Home" href="/" isSelected />}
  centerContent={<SearchBar />}
  endContent={<Avatar />}
/>`,
    },
    {
      label: '带悬停菜单和超级菜单',
      code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  startContent={
    <>
      <XDSTopNavItem label="Home" href="/" isSelected />
      <XDSTopNavMenu
        label="Products"
        items={[
          {title: 'Analytics', description: 'View metrics', href: '/analytics'},
          {title: 'Reports', description: 'Generate reports', href: '/reports'},
        ]}
      />
      <XDSTopNavMegaMenu
        label="Solutions"
        items={[
          {title: 'Enterprise', description: 'For large teams', icon: <BuildingIcon />, href: '/enterprise'},
          {title: 'Startups', description: 'Move fast', icon: <RocketIcon />, href: '/startups'},
        ]}
        featured={{
          title: 'New: AI Features',
          description: 'Explore our latest AI-powered tools.',
          linkText: 'Learn more \u2192',
          linkHref: '/ai',
        }}
      />
    </>
  }
/>`,
    },
    {
      label: '在 XDSLayout 头部插槽中',
      code: `<XDSLayout
  header={
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="My App" logo={<Logo />} href="/" />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Settings" href="/settings" />
        </>
      }
      endContent={<Avatar />}
    />
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-top-nav'},
      {className: 'xds-top-nav-item'},
      {className: 'xds-top-nav-heading'},
      {className: 'xds-top-nav-mega-menu'},
    ],
  },
  accessibility: [
    'XDSTopNav 渲染一个 <nav> 元素，包含 role="navigation" 和从 label 属性设置的 aria-label',
    '当 isSelected 为 true 时，XDSTopNavItem 设置 aria-current="page"',
    'XDSTopNavItem 为仅图标项设置 aria-label（当提供图标且没有子元素或可见标签文本时）',
    '当 isDisabled 为 true 时，XDSTopNavItem 设置 aria-disabled 和 tabIndex=-1',
    'XDSTopNavMenu 在触发按钮上设置 aria-haspopup="true"',
    'XDSTopNavMegaMenu 在触发按钮上设置 aria-haspopup="true" 和 aria-expanded',
    '当面板关闭时，XDSTopNavMegaMenu 菜单项对键盘不可达（tabIndex=-1）',
    'Escape 键关闭 XDSTopNavMegaMenu 面板',
  ],
  keyboard:
    'Tab 在项目之间导航；Escape 关闭 XDSTopNavMegaMenu 面板',
  notes: [
    '默认高度为 48px（--spacing-12），水平内边距 16px',
    '使用 --color-navbar 令牌作为背景色（默认为白色）',
    '无 centerContent 时：heading 和 startContent 增长以将 endContent 推向右侧（flex 布局）',
    '有 centerContent 时：切换为 CSS grid（gridTemplateColumns: 1fr auto 1fr）— 即使 endContent 不存在，右列也始终渲染以维持三列结构',
    '定位（sticky/fixed）由布局系统处理（例如 XDSAppShell），而非 TopNav 本身',
    '分隔线由布局系统控制（例如 XDSLayoutHeader hasDivider），而非 TopNav',
    'XDSTopNavMegaMenu 面板相对于最近的定位祖先定位 — 将 XDSTopNav 包裹在具有 position: relative 的容器中以获得正确的全宽行为',
  ],
  components: [
    {
      name: 'XDSTopNav',
      description: '采用插槽式布局的主导航栏容器。',
      props: [
        {
          name: 'heading',
          type: 'ReactNode',
          description:
            '标题插槽内容（标志、品牌）— 位于导航栏的左边缘。',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            '起始内容插槽，用于导航项或面包屑 — 位于标题之后，左对齐。',
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            '居中内容插槽（标签页、搜索栏、主导航）— 提供时，布局切换为三列 CSS grid 以实现真正的水平居中。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '末尾内容插槽，用于搜索、图标或用户头像 — 位于右边缘。',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '导航地标的无障碍标签，作为 aria-label 应用于 <nav> 元素。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是内联样式对象如 style={{}}。',
        },
      ],
      examples: [
        {
          label: '基础用法',
          code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  startContent={<XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />}
  endContent={<XDSButton label="Profile" variant="ghost" />}
/>`,
        },
        {
          label: '带居中内容',
          code: `<XDSTopNav
  label="Main navigation"
  heading={<XDSTopNavHeading heading="My App" href="/" />}
  centerContent={<SearchInput placeholder="Search..." />}
  endContent={<Avatar />}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavHeading',
      description:
        'XDSTopNav 标题插槽的标题组件 — 显示标志和/或标题文本，可选作为可点击链接。',
      props: [
        {
          name: 'heading',
          type: 'string',
          description: '要显示的标题文本。',
        },
        {
          name: 'logo',
          type: 'ReactNode',
          description:
            '在标题文本前显示的标志元素。可以是图片、XDSNavIcon 或任何 ReactNode。',
        },
        {
          name: 'href',
          type: 'string',
          description:
            '点击时导航到的 URL。提供时渲染为锚点元素。',
        },
      ],
      examples: [
        {
          label: '带文本链接的标志',
          code: `<XDSTopNavHeading
  heading="My App"
  logo={<img src="/logo.svg" alt="" width={24} height={24} />}
  href="/"
/>`,
        },
        {
          label: '使用 XDSNavIcon',
          code: `<XDSTopNavHeading
  heading="Dashboard"
  logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
  href="/"
/>`,
        },
        {
          label: '仅标志',
          code: `<XDSTopNavHeading logo={<BrandLogo />} href="/" />`,
        },
      ],
    },
    {
      name: 'XDSTopNavItem',
      description:
        '用于 XDSTopNav startContent 的导航链接项 — 渲染为具有悬停和选中状态的锚点。',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '导航项的无障碍标签。用作可见文本，或作为仅图标项的 aria-label。',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: '导航目标 URL。',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description:
            '此导航项是否为当前选中状态。设置 aria-current="page" 并应用高亮样式。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '导航项是否被禁用。设置 aria-disabled 并阻止交互。',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description:
            '在标签前显示的可选图标。如果在没有子元素的情况下提供，项目变为仅图标模式。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '替代标签文本渲染的自定义内容。省略且提供了图标时，项目变为仅图标模式。',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            '替代 <a> 渲染的自定义组件。覆盖 XDSLinkProvider 设置的提供者级别默认值。必须接受 href、className、style 和 children 属性。',
        },
      ],
      examples: [
        {
          label: '基础导航项',
          code: `<>
  <XDSTopNavItem label="Home" href="/" isSelected />
  <XDSTopNavItem label="Products" href="/products" />
  <XDSTopNavItem label="Settings" href="/settings" isDisabled />
</>`,
        },
        {
          label: '带图标',
          code: `<XDSTopNavItem
  label="Settings"
  href="/settings"
  icon={<GearIcon style={{width: 16, height: 16}} />}
/>`,
        },
        {
          label: '仅图标',
          code: `<XDSTopNavItem
  label="Notifications"
  href="/notifications"
  icon={<BellIcon style={{width: 16, height: 16}} />}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavMenu',
      description:
        '导航项，在悬停时显示弹出菜单，包含带图标、标题和可选描述的丰富菜单项。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '触发按钮的可见标签。',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMenuItemData[]',
          description: '在悬停弹出框中显示的菜单项。',
          required: true,
        },
        {
          name: 'delay',
          type: 'number',
          description:
            '悬停时显示菜单前的延迟（毫秒）。',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            '鼠标离开后隐藏菜单的延迟（毫秒）。',
          default: '200',
        },
      ],
      examples: [
        {
          label: '基础悬停菜单',
          code: `<XDSTopNavMenu
  label="Products"
  items={[
    {title: 'Analytics', description: 'View metrics', href: '/analytics'},
    {title: 'Reports', description: 'Generate reports', href: '/reports'},
  ]}
/>`,
        },
        {
          label: '带图标和点击处理',
          code: `<XDSTopNavMenu
  label="Tools"
  items={[
    {
      title: 'Analytics',
      description: 'Track and analyze user behavior',
      icon: <ChartBarIcon />,
      href: '/analytics',
    },
    {
      title: 'Export',
      description: 'Download your data',
      icon: <ArrowDownTrayIcon />,
      onClick: () => openExportDialog(),
    },
  ]}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenu',
      description:
        '导航项，在悬停时显示全宽超级菜单面板，包含双列网格布局的项目和可选的特色内容区域。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '触发按钮的可见标签。',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMegaMenuItemData[]',
          description: '在超级菜单面板中显示的菜单项。',
          required: true,
        },
        {
          name: 'featured',
          type: 'XDSTopNavMegaMenuFeatured',
          description:
            '在超级菜单面板右侧显示的可选特色内容。',
        },
        {
          name: 'delay',
          type: 'number',
          description:
            '悬停时显示菜单前的延迟（毫秒）。',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            '鼠标离开后隐藏菜单的延迟（毫秒）。',
          default: '250',
        },
        {
          name: 'isSingleColumn',
          type: 'boolean',
          description:
            '是否对菜单项使用单列布局而非双列。',
          default: 'false',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '超级菜单打开或关闭时触发的回调。用于协调包装器样式。',
        },
      ],
      examples: [
        {
          label: '带特色内容',
          code: `<div style={{position: 'relative'}}>
  <XDSTopNav
    startContent={
      <XDSTopNavMegaMenu
        label="Solutions"
        items={[
          {title: 'Enterprise', description: 'For large teams', icon: <BuildingIcon />, href: '/enterprise'},
          {title: 'Startups', description: 'Move fast', icon: <RocketIcon />, href: '/startups'},
        ]}
        featured={{
          title: 'New: AI Features',
          description: 'Explore our latest AI-powered tools.',
          linkText: 'Learn more \u2192',
          linkHref: '/ai',
        }}
      />
    }
  />
</div>`,
        },
        {
          label: '单列布局',
          code: `<XDSTopNavMegaMenu
  label="Products"
  isSingleColumn
  items={[
    {title: 'Analytics', description: 'Track behavior', icon: <ChartIcon />, href: '/analytics'},
    {title: 'Messaging', description: 'Real-time comms', icon: <ChatIcon />, href: '/messaging'},
    {title: 'Storage', description: 'Manage your data', icon: <DatabaseIcon />, href: '/storage'},
  ]}
/>`,
        },
      ],
    },
  ],
};
