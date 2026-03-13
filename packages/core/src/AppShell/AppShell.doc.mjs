/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AppShell',
  description:
    'Application-level layout shell providing header, side navigation, and main content area — composes XDSLayout internally and replaces the XDSPage + XDSPageLayout pattern.',
  features: [
    'Two navigation slots: topNav (horizontal bar) and sideNav (vertical sidebar)',
    'Two height modes: fill (viewport-height, independent scroll containers) and auto (page-scroll with sticky nav)',
    'Controlled and uncontrolled sideNav collapse with responsive auto-collapse via sideNavBreakpoint',
    'Mobile: collapsed sideNav renders as an overlay with backdrop',
    'Composes XDSLayout internally for automatic padding collapse, scroll containment, and slot awareness',
    'Semantic HTML: <main> with role="main", SideNav with role="navigation", skip-to-content link',
    'Escape key closes mobile sideNav overlay',
  ],
  examples: [
    {
      label: 'TopNav + SideNav (most common)',
      code: `<XDSAppShell
  topNav={
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="My App" logo={<Logo />} />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Products" href="/products" />
        </>
      }
    />
  }
  sideNav={
    // No header — TopNav has the app identity
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" icon={CogIcon} href="/settings" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>`,
    },
    {
      label: 'SideNav only (no TopNav)',
      code: `<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
      }>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>`,
    },
    {
      label: 'TopNav only (no sideNav)',
      code: `<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      heading={<XDSTopNavHeading heading="Landing Page" />}
    />
  }>
  <LandingContent />
</XDSAppShell>`,
    },
    {
      label: 'Auto height for content-heavy pages',
      code: `<XDSAppShell
  topNav={<XDSTopNav label="Docs" heading={<XDSTopNavHeading heading="Docs" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  height="auto"
>
  <LongDocumentContent />
</XDSAppShell>`,
    },
    {
      label: 'Controlled sideNav collapse',
      code: `<XDSAppShell
  topNav={<XDSTopNav label="App" heading={<XDSTopNavHeading heading="App" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  isSideNavCollapsed={collapsed}
  onSideNavCollapsedChange={setCollapsed}
>
  <Content />
</XDSAppShell>`,
    },
    {
      label: 'Responsive: SideNav + MobileNav',
      code: `const [mobileOpen, setMobileOpen] = useState(false);
const isMobile = useMediaQuery('(max-width: 768px)');

<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      heading={<XDSTopNavHeading heading="My App" />}
      startContent={
        isMobile ? (
          <XDSButton
            label="Menu"
            icon={<XDSIcon icon="menu" color="inherit" />}
            variant="ghost"
            onClick={() => setMobileOpen(true)}
          />
        ) : (
          <XDSTopNavItem label="Home" href="/" isSelected />
        )
      }
    />
  }
  sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
  mobileNav={
    <XDSMobileNav
      isOpen={mobileOpen}
      onOpenChange={open => setMobileOpen(open)}
      title="My App">
      {navSections}
    </XDSMobileNav>
  }>
  <Content />
</XDSAppShell>`,
    },
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Main content area, rendered inside a <main> element.',
    },
    {
      name: 'topNav',
      type: 'ReactNode',
      description: 'Top navigation slot, typically XDSTopNav.',
    },
    {
      name: 'sideNav',
      type: 'ReactNode',
      description: 'Side navigation slot, typically XDSSideNav.',
    },
    {
      name: 'mobileNav',
      type: 'ReactNode',
      description:
        'Mobile navigation slot, typically an XDSMobileNav component. Rendered when the viewport is below the sideNavBreakpoint.',
    },
    {
      name: 'banner',
      type: 'ReactNode',
      description:
        'Banner slot for system-wide announcements, placed above the topNav.',
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "Height behavior: 'fill' makes the shell fill the viewport (100dvh) with independent scroll containers; 'auto' lets the shell grow with content and uses sticky positioning for nav.",
      default: "'fill'",
    },
    {
      name: 'isSideNavCollapsed',
      type: 'boolean',
      description: 'Whether the sideNav is collapsed (controlled mode).',
    },
    {
      name: 'defaultIsSideNavCollapsed',
      type: 'boolean',
      description: 'Initial collapsed state for uncontrolled mode.',
      default: 'false',
    },
    {
      name: 'onSideNavCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description: 'Callback fired when the sideNav collapse state changes.',
    },
    {
      name: 'sideNavBreakpoint',
      type: "'sm' | 'md' | 'lg' | 'none'",
      description:
        'Viewport-width breakpoint below which the sideNav auto-collapses. Use "none" to disable responsive collapse.',
      default: "'md'",
    },
    {
      name: 'sideNavWidth',
      type: 'number',
      description: 'Width of the sideNav panel in pixels.',
      default: '260',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  accessibility: [
    'Semantic HTML via XDSLayout slots — each slot maps to a proper landmark element.',
    '<main> content area has role="main" for landmark navigation.',
    'SideNav has role="navigation" with aria-label="Application navigation".',
    'Skip-to-content link is visually hidden but shown on focus for keyboard users.',
    'Escape key closes the mobile sideNav overlay.',
  ],
  theming: {
    targets: [
      {className: 'xds-app-shell', visualProps: ['background', 'height']},
    ],
  },
  notes: [
    'When a TopNav is present, omit XDSSideNavHeading from the SideNav — the TopNav already provides app identity. Adding both would double the identity.',
    'When there is no TopNav, include XDSSideNavHeading inside the SideNav so the app name and logo are present.',
    'XDSAppShell composes XDSLayout internally: topNav + banner map to XDSLayoutHeader, sideNav maps to XDSLayoutPanel, and children map to XDSLayoutContent.',
    'SideNav collapse animations currently snap open/closed; ViewTransitions support is planned.',
    'In "auto" height mode, TopNav gets position: sticky; top: 0 and SideNav gets position: sticky; top: <header-height>.',
    'In "fill" height mode, the shell fills 100dvh, TopNav is pinned at the top, and both the SideNav and content area have independent scroll containers.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'AppShell',
  description:
    '应用级布局外壳，提供顶部导航栏、侧边导航栏和主内容区域——内部组合使用 XDSLayout，替代 XDSPage + XDSPageLayout 模式。',
  features: [
    '两个导航插槽：topNav（水平导航栏）和 sideNav（垂直侧边栏）',
    '两种高度模式：fill（视口高度，独立滚动容器）和 auto（页面滚动，导航栏吸顶）',
    '受控和非受控的 sideNav 折叠，通过 sideNavBreakpoint 支持响应式自动折叠',
    '移动端：折叠的 sideNav 以带遮罩层的浮层形式展示',
    '内部组合使用 XDSLayout，自动处理内边距折叠、滚动容器和插槽感知',
    '语义化 HTML：<main> 带 role="main"，SideNav 带 role="navigation"，跳转到内容链接',
    'Escape 键关闭移动端 sideNav 浮层',
  ],
  examples: [
    {
      label: 'TopNav + SideNav（最常见）',
      code: `<XDSAppShell
  topNav={
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="My App" logo={<Logo />} />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Products" href="/products" />
        </>
      }
    />
  }
  sideNav={
    // No header — TopNav has the app identity
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" icon={CogIcon} href="/settings" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>`,
    },
    {
      label: '仅 SideNav（无 TopNav）',
      code: `<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
      }>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>`,
    },
    {
      label: '仅 TopNav（无 sideNav）',
      code: `<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      heading={<XDSTopNavHeading heading="Landing Page" />}
    />
  }>
  <LandingContent />
</XDSAppShell>`,
    },
    {
      label: '内容较多的页面使用 auto 高度',
      code: `<XDSAppShell
  topNav={<XDSTopNav label="Docs" heading={<XDSTopNavHeading heading="Docs" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  height="auto"
>
  <LongDocumentContent />
</XDSAppShell>`,
    },
    {
      label: '受控的 sideNav 折叠',
      code: `<XDSAppShell
  topNav={<XDSTopNav label="App" heading={<XDSTopNavHeading heading="App" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  isSideNavCollapsed={collapsed}
  onSideNavCollapsedChange={setCollapsed}
>
  <Content />
</XDSAppShell>`,
    },
    {
      label: '响应式：SideNav + MobileNav',
      code: `const [mobileOpen, setMobileOpen] = useState(false);
const isMobile = useMediaQuery('(max-width: 768px)');

<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      heading={<XDSTopNavHeading heading="My App" />}
      startContent={
        isMobile ? (
          <XDSButton
            label="Menu"
            icon={<XDSIcon icon="menu" color="inherit" />}
            variant="ghost"
            onClick={() => setMobileOpen(true)}
          />
        ) : (
          <XDSTopNavItem label="Home" href="/" isSelected />
        )
      }
    />
  }
  sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
  mobileNav={
    <XDSMobileNav
      isOpen={mobileOpen}
      onOpenChange={open => setMobileOpen(open)}
      title="My App">
      {navSections}
    </XDSMobileNav>
  }>
  <Content />
</XDSAppShell>`,
    },
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '主内容区域，渲染在 <main> 元素内部。',
    },
    {
      name: 'topNav',
      type: 'ReactNode',
      description: '顶部导航插槽，通常为 XDSTopNav。',
    },
    {
      name: 'sideNav',
      type: 'ReactNode',
      description: '侧边导航插槽，通常为 XDSSideNav。',
    },
    {
      name: 'mobileNav',
      type: 'ReactNode',
      description:
        '移动端导航插槽，通常为 XDSMobileNav 组件。当视口宽度低于 sideNavBreakpoint 时渲染。',
    },
    {
      name: 'banner',
      type: 'ReactNode',
      description:
        '横幅插槽，用于全局公告，放置在 topNav 上方。',
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "高度行为：'fill' 使外壳填满视口（100dvh），各区域拥有独立的滚动容器；'auto' 使外壳随内容增长，导航使用 sticky 定位。",
      default: "'fill'",
    },
    {
      name: 'isSideNavCollapsed',
      type: 'boolean',
      description: 'sideNav 是否折叠（受控模式）。',
    },
    {
      name: 'defaultIsSideNavCollapsed',
      type: 'boolean',
      description: '非受控模式下的初始折叠状态。',
      default: 'false',
    },
    {
      name: 'onSideNavCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description: 'sideNav 折叠状态变化时触发的回调。',
    },
    {
      name: 'sideNavBreakpoint',
      type: "'sm' | 'md' | 'lg' | 'none'",
      description:
        '视口宽度断点，低于该断点时 sideNav 自动折叠。使用 "none" 禁用响应式折叠。',
      default: "'md'",
    },
    {
      name: 'sideNavWidth',
      type: 'number',
      description: 'sideNav 面板的宽度（像素）。',
      default: '260',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 形式的内联样式对象。',
    },
  ],
  accessibility: [
    '通过 XDSLayout 插槽实现语义化 HTML——每个插槽对应一个合适的地标元素。',
    '<main> 内容区域具有 role="main"，用于地标导航。',
    'SideNav 具有 role="navigation" 和 aria-label="Application navigation"。',
    '跳转到内容链接在视觉上隐藏，但在键盘聚焦时显示，方便键盘用户使用。',
    'Escape 键关闭移动端 sideNav 浮层。',
  ],
  theming: {
    targets: [
      {className: 'xds-app-shell', visualProps: ['background', 'height']},
    ],
  },
  notes: [
    '当存在 TopNav 时，请勿在 SideNav 中使用 XDSSideNavHeading——TopNav 已提供了应用标识。同时使用两者会导致标识重复。',
    '当没有 TopNav 时，请在 SideNav 中添加 XDSSideNavHeading，以确保应用名称和图标可见。',
    'XDSAppShell 内部组合使用 XDSLayout：topNav + banner 映射到 XDSLayoutHeader，sideNav 映射到 XDSLayoutPanel，children 映射到 XDSLayoutContent。',
    'SideNav 折叠动画目前为瞬间切换；计划支持 ViewTransitions。',
    '在 "auto" 高度模式下，TopNav 使用 position: sticky; top: 0，SideNav 使用 position: sticky; top: <header-height>。',
    '在 "fill" 高度模式下，外壳填满 100dvh，TopNav 固定在顶部，SideNav 和内容区域各有独立的滚动容器。',
  ],
};
