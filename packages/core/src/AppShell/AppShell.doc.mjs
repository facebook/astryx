/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AppShell',
  keywords: ["appshell","layout","scaffold","sidebar","sidenav","topnav","header","navigation","dashboard","shell","page","frame"],
  usage: {
    description:
      'The outermost layout for an application. Provides slots for top navigation, side navigation, banners, and main content. Use it as the root wrapper for every page — it handles responsive collapse, skip-to-content, and mobile navigation automatically.',
    bestPractices: [
      {guidance: true, description: 'Choose the right height — use "fill" for dashboards with internal scrolling and "auto" for pages that grow with content.'},
      {guidance: true, description: 'Set `contentPadding` based on content type — 4 for forms and settings, 0 for tables and dashboards.'},
      {guidance: false, description: "Nest one AppShell inside another — it's the outermost layout frame."},
      {guidance: false, description: 'Use for sub-page layouts — use Layout for content areas within AppShell.'},
    ],
  },
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
  theming: {
    targets: [
      {className: 'xds-app-shell', visualProps: ['variant']},
      {className: 'xds-app-shell-header', visualProps: ['variant']},
      {className: 'xds-app-shell-sidenav', visualProps: ['variant']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'AppShell',
  usage: {
    description:
      'The outermost layout for an application. Provides slots for top navigation, side navigation, banners, and main content. Use it as the root wrapper for every page — it handles responsive collapse, skip-to-content, and mobile navigation automatically.',
    bestPractices: [
      {guidance: true, description: 'Choose the right height — use "fill" for dashboards with internal scrolling and "auto" for pages that grow with content.'},
      {guidance: true, description: 'Set `contentPadding` based on content type — 4 for forms and settings, 0 for tables and dashboards.'},
      {guidance: false, description: "Nest one AppShell inside another — it's the outermost layout frame."},
      {guidance: false, description: 'Use for sub-page layouts — use Layout for content areas within AppShell.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: '主内容区域，渲染在 <main> 元素内部。'},
    {
      name: 'contentPadding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '主内容区域的内边距。根据页面主要内容模式设置：4（16px）适用于表单/设置/文本页面，0 适用于仪表盘/地图/表格。可通过 XDSSection 覆盖个别区域。',
      default: '0',
    },
    {name: 'topNav', type: 'ReactNode', description: '顶部导航插槽，通常为 XDSTopNav。'},
    {name: 'sideNav', type: 'ReactNode', description: '侧边导航插槽，通常为 XDSSideNav。'},
    {name: 'mobileNav', type: 'ReactNode', description: '移动端导航配置。接受 false（禁用）、配置对象（调整自动行为）或 ReactNode（完全自定义抽屉）。'},
    {name: 'banner', type: 'ReactNode', description: '横幅插槽，用于全局公告，放置在 topNav 上方。'},
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "高度行为：'fill' 使外壳填满视口（100dvh），各区域拥有独立的滚动容器；'auto' 使外壳随内容增长，导航使用 sticky 定位。",
      default: "'fill'",
    },
    {name: 'isSideNavCollapsed', type: 'boolean', description: 'sideNav 是否折叠（受控模式）。'},
    {name: 'defaultIsSideNavCollapsed', type: 'boolean', description: '非受控模式下的初始折叠状态。', default: 'false'},
    {name: 'onSideNavCollapsedChange', type: '(isCollapsed: boolean) => void', description: 'sideNav 折叠状态变化时触发的回调。'},
    {
      name: 'sideNavBreakpoint',
      type: "'sm' | 'md' | 'lg' | 'none'",
      description: '视口宽度断点，低于该断点时 sideNav 自动折叠。使用 "none" 禁用响应式折叠。',
      default: "'md'",
    },
    {name: 'sideNavWidth', type: 'number', description: 'sideNav 面板的宽度（像素）。', default: '260'},
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
  theming: {
    targets: [
      {
        className: 'xds-app-shell',
        visualProps: [
          'variant',
        ],
      },
      {className: 'xds-app-shell-header', visualProps: ['variant']},
      {className: 'xds-app-shell-sidenav', visualProps: ['variant']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'app-level layout shell w/ header, side nav, main content; composes XDSLayout internally, replaces XDSPage+XDSPageLayout',
  usage: {
    description:
      'The outermost layout for an application. Provides slots for top navigation, side navigation, banners, and main content. Use it as the root wrapper for every page — it handles responsive collapse, skip-to-content, and mobile navigation automatically.',
    bestPractices: [
      {guidance: true, description: 'Choose the right height — use "fill" for dashboards with internal scrolling and "auto" for pages that grow with content.'},
      {guidance: true, description: 'Set `contentPadding` based on content type — 4 for forms and settings, 0 for tables and dashboards.'},
      {guidance: false, description: "Nest one AppShell inside another — it's the outermost layout frame."},
      {guidance: false, description: 'Use for sub-page layouts — use Layout for content areas within AppShell.'},
    ],
  },
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
