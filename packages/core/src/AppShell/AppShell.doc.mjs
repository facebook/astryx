/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AppShell',
  description:
    'Application-level layout shell providing header, side navigation, and main content area — composes XDSLayout internally and replaces the XDSPage + XDSPageLayout pattern.',
  showcase: {
    aspectRatio: 16 / 9,
    code: '<XDSAppShell><div>Content</div></XDSAppShell>',
  },
  keywords: ["appshell","layout","scaffold","sidebar","sidenav","topnav","header","navigation","dashboard","shell","page","frame"],
  features: [
    'Two navigation slots: topNav (horizontal bar) and sideNav (vertical sidebar)',
    'Two height modes: fill (viewport-height, independent scroll containers) and auto (page-scroll with sticky nav)',
    'Controlled and uncontrolled sideNav collapse with responsive auto-collapse via mobileNav breakpoint',
    'Mobile: collapsed sideNav renders as an overlay with backdrop',
    'Composes XDSLayout internally for automatic padding collapse, scroll containment, and slot awareness',
    'Semantic HTML: <main> with role="main", SideNav with role="navigation", skip-to-content link',
    'Escape key closes mobile sideNav overlay',
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Main content area, rendered inside a <main> element.',
    },
    {
      name: 'contentPadding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Padding for the main content area. Set based on the dominant content pattern: 4 (16px) for forms/settings/text, 0 for dashboards/maps/tables. Override individual sections with XDSSection.',
      default: '0',
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
        'Mobile navigation configuration. Accepts false (disable), config object (tune auto behavior), or ReactNode (full custom drawer).',
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
      name: 'variant',
      type: "'wash' | 'surface' | 'section' | 'elevated'",
      description:
        "Navigation background style controlling how nav areas contrast with content. 'wash' uses wash background, 'surface' uses surface background, 'section' adds dividers between nav and content, 'elevated' uses wash nav with elevated surface content and border radius.",
      default: "'elevated'",
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
      {className: 'xds-app-shell', visualProps: ['variant', 'height']},
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
  usage: {
    summary: 'Application-level layout shell providing header, side navigation, and main content area.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'AppShell',
  description:
    '应用级布局外壳，提供顶部导航栏、侧边导航栏和主内容区域——内部组合使用 XDSLayout，替代 XDSPage + XDSPageLayout 模式。',
  features: [
    '两个导航插槽：topNav（水平导航栏）和 sideNav（垂直侧边栏）',
    '两种高度模式：fill（视口高度，独立滚动容器）和 auto（页面滚动，导航栏吸顶）',
    '受控和非受控的 sideNav 折叠，通过 mobileNav breakpoint 支持响应式自动折叠',
    '移动端：折叠的 sideNav 以带遮罩层的浮层形式展示',
    '内部组合使用 XDSLayout，自动处理内边距折叠、滚动容器和插槽感知',
    '语义化 HTML：<main> 带 role="main"，SideNav 带 role="navigation"，跳转到内容链接',
    'Escape 键关闭移动端 sideNav 浮层',
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '主内容区域，渲染在 <main> 元素内部。',
    },
    {
      name: 'contentPadding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '主内容区域的内边距。根据页面主要内容模式设置：4（16px）适用于表单/设置/文本页面，0 适用于仪表盘/地图/表格。可通过 XDSSection 覆盖个别区域。',
      default: '0',
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
        '移动端导航配置。接受 false（禁用）、配置对象（调整自动行为）或 ReactNode（完全自定义抽屉）。',
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
      name: 'variant',
      type: "'wash' | 'surface' | 'section' | 'elevated'",
      description:
        "导航背景样式，控制导航区域与内容之间的对比。'wash' 使用 wash 背景，'surface' 使用 surface 背景，'section' 在导航和内容之间添加分隔线，'elevated' 使用 wash 导航配合凸起的 surface 内容区域和圆角。",
      default: "'elevated'",
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
      {className: 'xds-app-shell', visualProps: ['variant', 'height']},
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

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'app-level layout shell w/ header, side nav, main content; composes XDSLayout internally, replaces XDSPage+XDSPageLayout',
  features: [
    'two nav slots: topNav (horizontal bar) + sideNav (vertical sidebar)',
    'two height modes: fill (viewport 100dvh, independent scroll) + auto (page-scroll w/ sticky nav)',
    'controlled+uncontrolled sideNav collapse w/ responsive auto-collapse via mobileNav breakpoint',
    'mobile: collapsed sideNav renders as overlay w/ backdrop',
    'composes XDSLayout internally for auto padding collapse, scroll containment, slot awareness',
    'semantic HTML: <main> role="main", SideNav role="navigation", skip-to-content link',
    'Escape closes mobile sideNav overlay',
  ],
  notes: [
    'w/ TopNav, omit SideNavHeading from SideNav to avoid double identity',
    'w/o TopNav, include SideNavHeading for app name+logo',
    'composes XDSLayout: topNav+banner map to XDSLayoutHeader, sideNav to XDSLayoutPanel, children to XDSLayoutContent',
    'collapse animations snap open/closed; ViewTransitions planned',
    '"auto" height: TopNav sticky top:0, SideNav sticky top:<header-height>',
    '"fill" height: 100dvh, TopNav pinned, SideNav+content have independent scroll',
  ],
  accessibility: [
    'semantic HTML via XDSLayout slots, each slot maps to landmark element',
    '<main> has role="main" for landmark nav',
    'SideNav has role="navigation" w/ aria-label="Application navigation"',
    'skip-to-content link visually hidden, shown on focus for keyboard users',
    'Escape closes mobile sideNav overlay',
  ],
  propDescriptions: {
    children: 'main content area, rendered inside <main>',
    topNav: 'top nav slot, typically XDSTopNav',
    sideNav: 'side nav slot, typically XDSSideNav',
    mobileNav: 'mobile nav config: false | MobileNavConfig | ReactNode',
    banner: 'slot for system-wide announcements above topNav',
    height:
      'fill=viewport 100dvh w/ independent scroll; auto=content-driven w/ sticky nav',
    isSideNavCollapsed: 'sideNav collapsed (controlled)',
    defaultIsSideNavCollapsed: 'initial collapsed state (uncontrolled)',
    onSideNavCollapsedChange: 'callback on sideNav collapse change',
    variant:
      'nav bg style: wash=wash bg, surface=surface bg, section=dividers, elevated=wash nav w/ elevated surface content+radius',
    contentPadding:
      'main content area padding. 4 (16px) for forms/settings/text, 0 for dashboards/maps/tables. Override per-section via XDSSection.',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
