/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SideNav',
  description:
    'Sidebar navigation component for application pages. Supports sections, nested items, selected state, icons, and collapsible sidebar.',
  features: [
    'Five-zone layout: header, topContent, children (scrollable), footer, footerIcons',
    'Smart header interaction boundary logic — links and menu trigger coexist without overlap',
    'Nested items via children on XDSSideNavItem',
    'Selected state with optional alternate icon for filled/outline variants',
    'Section grouping with optional title, subtitle, and end content',
    'Collapsible sidebar via collapsible prop — collapses to icon-only toolbar, uncontrolled or controlled',
    'Accessible — nav landmark, aria-current="page", role="group" with aria-labelledby on sections',
    'Keyboard navigable — Tab through items, Enter/Space to activate',
    'Resizable sidebar via resizable prop — drag handle at inline-end edge, pointer-based resize with min/max constraints',
  ],
  accessibility: [
    '<nav aria-label="Side navigation"> wraps the entire component',
    'aria-current="page" is applied to the selected item',
    'Sections use role="group" with aria-labelledby pointing to the section title',
    'isHeaderHidden visually hides the section title while keeping it accessible to screen readers',
  ],
  keyboard: 'Tab through items, Enter/Space to activate links',
  theming: {
    targets: [
      {className: 'xds-side-nav', visualProps: ['mode']},
      {className: 'xds-side-nav-heading'},
      {className: 'xds-side-nav-item'},
      {className: 'xds-side-nav-section'},
    ],
  },
  notes: [
    'When used inside XDSAppShell alongside XDSTopNav, omit XDSSideNavHeading — the TopNav already provides app identity and including the header would duplicate it.',
    'Without a TopNav, include XDSSideNavHeading to provide app identity.',
    'Header interaction model: headingHref only → whole header is one link; headingHref + superheadingHref, no menu → each text is an independent link; menu only, no hrefs → whole header is the popover trigger; menu + hrefs → links are independent <a> elements, chevron/remaining area is the popover trigger.',
    'Depends on useXDSPopover for the header menu popover and XDSIcon for rendering icon components in nav items.',
    'XDSSideNavCollapseButton renders as an icon-only ghost button by default. Place it in footerIcons, header, or outside the sidenav (pass sideNavRef).',
    'useXDSSideNavCollapse hook exposes { isCollapsed, toggle, isCollapsible } for custom collapse controls.',
  ],
  examples: [
    {
      label: 'With XDSAppShell + TopNav (no header)',
      code: `// TopNav provides identity → SideNav has no header
<XDSAppShell
  topNav={<XDSTopNav heading={<XDSTopNavHeading heading="My App" />} />}
  sideNav={
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
    {
      label: 'Collapsible sidebar',
      code: `<XDSAppShell
  sideNav={
    <XDSSideNav
      collapsible
      header={<XDSSideNavHeading heading="My App" headingHref="/" />}
      footerIcons={<XDSSideNavCollapseButton />}>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
        <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
    {
      label: 'Standalone (no TopNav)',
      code: `// No TopNav → SideNav header provides identity
<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
      }
      topContent={<XDSButton label="Create new" variant="primary" />}
      footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          href="/projects"
          endContent={<XDSBadge label={3} />}
        />
      </XDSSideNavSection>

      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" href="/settings/general" />
        <XDSSideNavItem label="Security" href="/settings/security" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
  ],
  components: [
    {
      name: 'XDSSideNav',
      description:
        'Container with five zones: header, topContent, children (scrollable), footer, and footerIcons. Supports collapsible mode.',
      props: [
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header area (typically XDSSideNavHeading). Sticky.',
        },
        {
          name: 'topContent',
          type: 'ReactNode',
          description: 'Content below the header, e.g., a create button.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Navigation sections and items. Scrollable.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Footer area above the icon bar.',
        },
        {
          name: 'footerIcons',
          type: 'ReactNode',
          description: 'Footer icon bar.',
        },
        {
          name: 'collapsible',
          type: "boolean | { defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapsedChange?: (isCollapsed: boolean) => void; hasButton?: boolean; buttonLabel?: string }",
          description:
            'Enables collapse behavior. true for uncontrolled with default toggle button, or an object for controlled mode and advanced config (defaultIsCollapsed, isCollapsed + onCollapsedChange, hasButton, buttonLabel).',
          default: 'false',
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
          code: `<XDSSideNav
  header={<XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />}
  topContent={<XDSButton label="Create new" variant="primary" />}>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
    <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
  </XDSSideNavSection>
</XDSSideNav>`,
        },
      ],
    },
    {
      name: 'XDSSideNavHeading',
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
        },
      ],
      examples: [
        {
          label: 'Title link only',
          code: `<XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />`,
        },
        {
          label: 'With superheading and subheading',
          code: `<XDSSideNavHeading
  icon={<AppIcon />}
  superheading="Acme Corp"
  superheadingHref="/org"
  heading="My App"
  headingHref="/"
  subheading="v2.0"
/>`,
        },
        {
          label: 'With menu',
          code: `<XDSSideNavHeading
  icon={<AppIcon />}
  heading="My App"
  headingHref="/"
  menu={<WorkspaceSwitcher />}
/>`,
        },
      ],
    },
    {
      name: 'XDSSideNavItem',
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
          description: 'Icon displayed in the outline (unselected) variant.',
        },
        {
          name: 'selectedIcon',
          type: 'XDSIconType',
          description:
            'Icon displayed when the item is selected (filled variant).',
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
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Sub-items for nesting.',
        },
        {
          name: 'collapsible',
          type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
          description: 'Enables collapse behavior for items with children. Pass true for uncontrolled (starts expanded), or an object for controlled mode.',
          default: 'false',
        },
      ],
      examples: [
        {
          label: 'Basic link',
          code: `<XDSSideNavItem label="Dashboard" icon={HomeIcon} href="/dashboard" />`,
        },
        {
          label: 'Selected with alternate icon and badge',
          code: `<XDSSideNavItem
  label="Dashboard"
  icon={HomeIcon}
  selectedIcon={HomeIconSolid}
  isSelected
  href="/dashboard"
  endContent={<XDSBadge label={3} />}
/>`,
        },
        {
          label: 'Collapsible nested items',
          code: `<XDSSideNavItem label="Settings" icon={GearIcon} collapsible>
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavItem>`,
        },
      ],
    },
    {
      name: 'XDSSideNavSection',
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
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Right-side content in the section header.',
        },
        {
          name: 'isHeaderHidden',
          type: 'boolean',
          description:
            'Visually hides the section header while keeping it accessible to screen readers.',
          default: 'false',
        },
      ],
      examples: [
        {
          label: 'Basic section',
          code: `<XDSSideNavSection title="Main">
  <XDSSideNavItem label="Dashboard" href="/dashboard" />
  <XDSSideNavItem label="Projects" href="/projects" />
</XDSSideNavSection>`,
        },
        {
          label: 'With end content and hidden header',
          code: `<XDSSideNavSection title="Settings" endContent={<XDSBadge label="New" />}>
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavSection>`,
        },
        {
          label: 'Hidden header (used with TopNav)',
          code: `<XDSSideNavSection title="Main" isHeaderHidden>
  <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
</XDSSideNavSection>`,
        },
      ],
    },
    {
      name: 'XDSSideNavCollapseButton',
      description:
        'Toggle button for sidenav collapse. Place inside XDSSideNav (reads context automatically) or outside (pass sideNavRef). Renders as an icon-only ghost button by default.',
      props: [
        {
          name: 'sideNavRef',
          type: 'RefObject<HTMLElement | null>',
          description:
            'Ref to the XDSSideNav element. Only needed when the button is rendered outside the sidenav.',
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
      examples: [
        {
          label: 'In footer icons (default)',
          code: `<XDSSideNav collapsible footerIcons={<XDSSideNavCollapseButton />}>
  <XDSSideNavSection title="Main" isHeaderHidden>
    <XDSSideNavItem label="Dashboard" icon={HomeIcon} href="/dashboard" />
  </XDSSideNavSection>
</XDSSideNav>`,
        },
        {
          label: 'With custom label',
          code: `<XDSSideNav collapsible footerIcons={<XDSSideNavCollapseButton label="Toggle sidebar" />}>
  <XDSSideNavSection title="Main" isHeaderHidden>
    <XDSSideNavItem label="Dashboard" icon={HomeIcon} href="/dashboard" />
  </XDSSideNavSection>
</XDSSideNav>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'SideNav',
  description:
    '应用页面的侧边栏导航组件。支持分组、嵌套项、选中状态、图标和可折叠侧边栏。',
  features: [
    '五区域布局：header、topContent、children（可滚动）、footer、footerIcons',
    '智能头部交互边界逻辑——链接和菜单触发器共存而不重叠',
    '通过 XDSSideNavItem 的 children 实现嵌套项',
    '选中状态支持可选的替代图标，用于填充/轮廓变体',
    '分组支持可选的标题、副标题和尾部内容',
    '通过 collapsible 属性支持可折叠侧边栏——折叠为仅图标工具栏，支持非受控和受控模式',
    '无障碍 - nav 地标、aria-current="page"、分组使用 role="group" 配合 aria-labelledby',
    '键盘可导航 - Tab 切换项目，Enter/Space 激活',
  ],
  accessibility: [
    '<nav aria-label="Side navigation"> 包裹整个组件',
    'aria-current="page" 应用于选中项',
    '分组使用 role="group"，aria-labelledby 指向分组标题',
    'isHeaderHidden 在视觉上隐藏分组标题，同时保持屏幕阅读器可访问',
  ],
  keyboard: 'Tab 切换项目，Enter/Space 激活链接',
  theming: {
    targets: [
      {className: 'xds-side-nav', visualProps: ['mode']},
      {className: 'xds-side-nav-heading'},
      {className: 'xds-side-nav-item'},
      {className: 'xds-side-nav-section'},
    ],
  },
  notes: [
    '在 XDSAppShell 中与 XDSTopNav 一起使用时，省略 XDSSideNavHeading——TopNav 已提供应用标识，包含头部会导致重复。',
    '没有 TopNav 时，包含 XDSSideNavHeading 以提供应用标识。',
    '头部交互模型：仅 headingHref → 整个头部是一个链接；headingHref + superheadingHref，无菜单 → 每段文本是独立链接；仅菜单，无 href → 整个头部是弹出框触发器；菜单 + href → 链接是独立的 <a> 元素，箭头/剩余区域是弹出框触发器。',
    '依赖 useXDSPopover 实现头部菜单弹出框，依赖 XDSIcon 在导航项中渲染图标组件。',
    'XDSSideNavCollapseButton 默认渲染为仅图标的 ghost 按钮。可放置在 footerIcons、header 中，或侧边栏外部（传入 sideNavRef）。',
    'useXDSSideNavCollapse hook 暴露 { isCollapsed, toggle, isCollapsible }，用于自定义折叠控件。',
  ],
  examples: [
    {
      label: '可折叠侧边栏',
      code: `<XDSAppShell
  sideNav={
    <XDSSideNav
      collapsible
      header={<XDSSideNavHeading heading="My App" headingHref="/" />}
      footerIcons={<XDSSideNavCollapseButton />}>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
        <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
    {
      label: '配合 XDSAppShell + TopNav（无头部）',
      code: `// TopNav provides identity → SideNav has no header
<XDSAppShell
  topNav={<XDSTopNav heading={<XDSTopNavHeading heading="My App" />} />}
  sideNav={
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
    {
      label: '独立使用（无 TopNav）',
      code: `// No TopNav → SideNav header provides identity
<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
      }
      topContent={<XDSButton label="Create new" variant="primary" />}
      footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          href="/projects"
          endContent={<XDSBadge label={3} />}
        />
      </XDSSideNavSection>

      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" href="/settings/general" />
        <XDSSideNavItem label="Security" href="/settings/security" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
  ],
  components: [
    {
      name: 'XDSSideNav',
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
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
      examples: [
        {
          label: '基础用法',
          code: `<XDSSideNav
  header={<XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />}
  topContent={<XDSButton label="Create new" variant="primary" />}>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
    <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
  </XDSSideNavSection>
</XDSSideNav>`,
        },
      ],
    },
    {
      name: 'XDSSideNavHeading',
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
      ],
      examples: [
        {
          label: '仅标题链接',
          code: `<XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />`,
        },
        {
          label: '带上方标题和下方标题',
          code: `<XDSSideNavHeading
  icon={<AppIcon />}
  superheading="Acme Corp"
  superheadingHref="/org"
  heading="My App"
  headingHref="/"
  subheading="v2.0"
/>`,
        },
        {
          label: '带菜单',
          code: `<XDSSideNavHeading
  icon={<AppIcon />}
  heading="My App"
  headingHref="/"
  menu={<WorkspaceSwitcher />}
/>`,
        },
      ],
    },
    {
      name: 'XDSSideNavItem',
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
      examples: [
        {
          label: '基础链接',
          code: `<XDSSideNavItem label="Dashboard" icon={HomeIcon} href="/dashboard" />`,
        },
        {
          label: '选中状态，带替代图标和徽章',
          code: `<XDSSideNavItem
  label="Dashboard"
  icon={HomeIcon}
  selectedIcon={HomeIconSolid}
  isSelected
  href="/dashboard"
  endContent={<XDSBadge label={3} />}
/>`,
        },
        {
          label: '可折叠嵌套项',
          code: `<XDSSideNavItem label="Settings" icon={GearIcon} collapsible>
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavItem>`,
        },
      ],
    },
    {
      name: 'XDSSideNavSection',
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
      examples: [
        {
          label: '基础分组',
          code: `<XDSSideNavSection title="Main">
  <XDSSideNavItem label="Dashboard" href="/dashboard" />
  <XDSSideNavItem label="Projects" href="/projects" />
</XDSSideNavSection>`,
        },
        {
          label: '带尾部内容和隐藏头部',
          code: `<XDSSideNavSection title="Settings" endContent={<XDSBadge label="New" />}>
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavSection>`,
        },
        {
          label: '隐藏头部（配合 TopNav 使用）',
          code: `<XDSSideNavSection title="Main" isHeaderHidden>
  <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
</XDSSideNavSection>`,
        },
      ],
    },
    {
      name: 'XDSSideNavCollapseButton',
      description:
        '侧边栏折叠切换按钮。放置在 XDSSideNav 内部（自动读取上下文）或外部（传入 sideNavRef）。默认渲染为仅图标的 ghost 按钮。',
      props: [
        {
          name: 'sideNavRef',
          type: 'RefObject<HTMLElement | null>',
          description:
            'XDSSideNav 元素的引用。仅在按钮渲染在侧边栏外部时需要。',
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
      examples: [
        {
          label: '在底部图标栏中（默认）',
          code: `<XDSSideNav collapsible footerIcons={<XDSSideNavCollapseButton />}>
  <XDSSideNavSection title="Main" isHeaderHidden>
    <XDSSideNavItem label="Dashboard" icon={HomeIcon} href="/dashboard" />
  </XDSSideNavSection>
</XDSSideNav>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Sidebar nav for app pages. Sections, nested items, selected state, icons, collapsible sidebar.',
  features: [
    'Five-zone layout: header, topContent, children (scrollable), footer, footerIcons',
    'Smart header interaction boundary logic; links + menu trigger coexist w/o overlap',
    'Nested items via children on XDSSideNavItem',
    'Selected state w/ optional alternate icon for filled/outline variants',
    'Section grouping w/ optional title, subtitle, end content',
    'Collapsible sidebar via collapsible prop; collapses to icon-only toolbar, uncontrolled or controlled',
    'Accessible; nav landmark, aria-current="page", role="group" w/ aria-labelledby on sections',
    'Keyboard navigable; Tab through items, Enter/Space to activate',
  ],
  accessibility: [
    '<nav aria-label="Side navigation"> wraps entire component',
    'aria-current="page" applied to selected item',
    'Sections use role="group" w/ aria-labelledby pointing to section title',
    'isHeaderHidden visually hides section title while keeping accessible to screen readers',
  ],
  keyboard: 'Tab through items, Enter/Space to activate links',
  notes: [
    'W/ XDSAppShell alongside XDSTopNav, omit XDSSideNavHeading; TopNav already provides app identity.',
    'W/o TopNav, include XDSSideNavHeading to provide app identity.',
    'Header interaction model: headingHref only = whole header is one link; headingHref+superheadingHref no menu = each text independent link; menu only no hrefs = whole header is popover trigger; menu+hrefs = links are independent <a> elements, chevron/remaining is popover trigger.',
    'Depends on useXDSPopover for header menu popover + XDSIcon for rendering icon components in nav items.',
    'XDSSideNavCollapseButton renders as icon-only ghost button by default. Place in footerIcons, header, or outside sidenav (pass sideNavRef).',
    'useXDSSideNavCollapse hook exposes { isCollapsed, toggle, isCollapsible } for custom collapse controls.',
  ],
  components: [
    {
      name: 'XDSSideNav',
      description:
        'Container w/ five zones: header, topContent, children (scrollable), footer, footerIcons. Supports collapsible mode.',
      propDescriptions: {
        header: 'Header area (typically XDSSideNavHeading). Sticky.',
        topContent: 'Content below header, e.g. create button.',
        children: 'Navigation sections + items. Scrollable.',
        footer: 'Footer area above icon bar.',
        footerIcons: 'Footer icon bar.',
        collapsible: 'Enables collapse behavior. true for uncontrolled w/ default toggle, or object for controlled mode (defaultIsCollapsed, isCollapsed+onCollapsedChange, hasButton, buttonLabel).',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSSideNavHeading',
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
      },
    },
    {
      name: 'XDSSideNavItem',
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
      description:
        'Section grouping w/ optional title, subtitle, end content.',
      propDescriptions: {
        title: 'Section title.',
        subtitle: 'Section subtitle.',
        children: 'Section items.',
        endContent: 'Right-side content in section header.',
        isHeaderHidden: 'Visually hides section header while keeping accessible to screen readers.',
      },
    },
    {
      name: 'XDSSideNavCollapseButton',
      description:
        'Toggle button for sidenav collapse. Place inside XDSSideNav (reads context) or outside (pass sideNavRef). Icon-only ghost button by default.',
      propDescriptions: {
        sideNavRef: 'Ref to XDSSideNav element. Only needed when button rendered outside sidenav.',
        label: 'Custom label. Text button w/ chevron when provided, icon-only when omitted.',
        children: 'Custom content. Overrides default chevron icon + label.',
      },
    },
  ],
};
